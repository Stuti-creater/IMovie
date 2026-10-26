import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { parseSeats, generateBookingRef } from '../utils/validators.js';
import { showStart } from '../utils/helpers.js';

/**
 * Reserve seats atomically.
 *
 * Step 1 is ONE single-document update whose filter requires that none of the requested
 * seats are already in `bookedSeats`. MongoDB applies single-document updates atomically,
 * so if two requests race for the same seat exactly one matches the filter; the other gets
 * null and a 409. No transaction (and therefore no replica set) is required.
 *
 * Step 2 creates the Booking. If that fails, the seats are released again (compensation),
 * so a failed booking does not leave seats reserved.
 * Residual risk: a hard process crash between step 1 and 2 could strand seats; a periodic
 * reconciliation job (compare Show.bookedSeats with confirmed Bookings) would fix that.
 */
export async function createBooking({ userId, showId, seatsInput }) {
  let seats;
  try {
    seats = parseSeats(seatsInput);
  } catch (msg) {
    throw new AppError(400, msg);
  }

  const existing = await Show.findById(showId).select('date time price');
  if (!existing) throw new AppError(404, 'Show not found.');
  if (showStart(existing) < new Date()) throw new AppError(400, 'This show has already started.');

  const show = await Show.findOneAndUpdate(
    { _id: showId, bookedSeats: { $nin: seats } },
    { $push: { bookedSeats: { $each: seats } } },
    { new: true }
  );
  if (!show) {
    throw new AppError(409, 'Sorry, one or more of those seats were just taken. Please pick different seats.');
  }

  try {
    let booking;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        booking = await Booking.create({
          user: userId,
          show: show._id,
          seats,
          totalAmount: show.price * seats.length, // price always comes from the database
          bookingRef: generateBookingRef(),
        });
        break;
      } catch (err) {
        const refCollision = err.code === 11000 && err.keyPattern?.bookingRef;
        if (!refCollision || attempt === 4) throw err;
      }
    }
    return booking;
  } catch (err) {
    await Show.updateOne({ _id: show._id }, { $pull: { bookedSeats: { $in: seats } } }).catch((e) =>
      console.error('[booking] rollback failed', e.message)
    );
    throw err;
  }
}
