// Repeatable, non-destructive DEMO seeding.
//  - Upserts sample movies/shows (matched by title / show key). Real bookings are never touched.
//  - Existing shows keep their bookedSeats (only set on first insert).
//  - Removes only past, un-booked SAMPLE shows.
//  - Refuses to run when NODE_ENV=production unless ALLOW_SEED=true.
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import Movie from './models/Movie.js';
import Show from './models/Show.js';
import Booking from './models/Booking.js';
import { dateString } from './utils/helpers.js';

if (env.isProd && process.env.ALLOW_SEED !== 'true') {
  console.error('Refusing to seed in production. Set ALLOW_SEED=true if you really mean it.');
  process.exit(1);
}

const img = (p, size = 'w500') => `https://image.tmdb.org/t/p/${size}${p}`;

const MOVIES = [
  { title: 'Inception', p: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', genres: ['Sci-Fi', 'Thriller'], duration: 148, rating: 8.4, language: 'English', releaseDate: '2010-07-16', featured: false,
    description: 'A skilled thief who steals secrets from inside dreams is offered a final job: plant an idea in a target\'s mind instead of taking one.' },
  { title: 'The Dark Knight', p: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: ['Action', 'Crime', 'Drama'], duration: 152, rating: 8.5, language: 'English', releaseDate: '2008-07-18', featured: false,
    description: 'Batman faces the Joker, a anarchic criminal mastermind who pushes Gotham City toward chaos and tests the limits of the hero\'s code.' },
  { title: 'Interstellar', p: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: ['Sci-Fi', 'Drama', 'Adventure'], duration: 169, rating: 8.4, language: 'English', releaseDate: '2014-11-07', featured: false,
    description: 'As Earth fails, a former pilot joins a crew traveling through a wormhole to find humanity a new home, at the cost of time with his children.' },
  { title: 'Dune', p: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', genres: ['Sci-Fi', 'Adventure'], duration: 155, rating: 8.0, language: 'English', releaseDate: '2021-10-22', featured: true,
    description: 'Paul Atreides, heir to a noble house, travels to the desert planet Arrakis, the only source of the universe\'s most valuable substance.' },
  { title: 'Parasite', p: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genres: ['Thriller', 'Drama'], duration: 132, rating: 8.5, language: 'Korean', releaseDate: '2019-05-30', featured: false,
    description: 'A struggling family slowly works its way into the lives of a wealthy household, until an unexpected secret upends everything.' },
  { title: 'Spider-Man: Across the Spider-Verse', p: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', genres: ['Animation', 'Action', 'Adventure'], duration: 140, rating: 8.4, language: 'English', releaseDate: '2023-06-02', featured: false,
    description: 'Miles Morales is catapulted across the multiverse, where he meets a team of Spider-People and must face a threat bigger than any one world.' },
  { title: 'Oppenheimer', p: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', genres: ['Drama', 'History'], duration: 180, rating: 8.1, language: 'English', releaseDate: '2023-07-21', featured: false,
    description: 'The story of J. Robert Oppenheimer and the Manhattan Project, and the moral weight of building the first atomic bomb.' },
];

const THEATRES = [
  { theatre: 'IMovies Demo Cinema - Screen 1', city: 'Indore', price: 280 },
  { theatre: 'IMovies Demo Cinema - Screen 2 (Premium)', city: 'Indore', price: 420 },
  { theatre: 'Sample Multiplex - Audi 3', city: 'Indore', price: 240 },
];
const TIMES = ['10:30', '13:45', '17:15', '20:45'];
const PRE_BOOKED = ['D4', 'D5', 'E6', 'E7', 'F3', 'B8'];

await connectDB();

let movieCount = 0;
const movieDocs = [];
for (const { p, ...m } of MOVIES) {
  const doc = await Movie.findOneAndUpdate(
    { title: m.title },
    { $set: { ...m, posterUrl: img(p), backdropUrl: img(p, 'w780'), releaseDate: new Date(m.releaseDate), isSample: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  movieDocs.push(doc);
  movieCount++;
}

let showCount = 0;
for (let m = 0; m < movieDocs.length; m++) {
  for (let d = 0; d < 5; d++) {
    const date = dateString(d);
    const theatre = THEATRES[(m + d) % THEATRES.length];
    for (let t = 0; t < TIMES.length; t++) {
      if ((m + d + t) % 3 === 0) continue; // vary the schedule a little
      const key = { movie: movieDocs[m]._id, theatre: theatre.theatre, date, time: TIMES[t] };
      await Show.updateOne(
        key,
        {
          $set: { city: theatre.city, price: theatre.price, isSample: true },
          $setOnInsert: { bookedSeats: (m + t) % 2 ? PRE_BOOKED.slice(0, 4) : PRE_BOOKED },
        },
        { upsert: true }
      );
      showCount++;
    }
  }
}

// housekeeping: drop past, never-booked sample shows only
const today = dateString(0);
const stale = await Show.find({ isSample: true, date: { $lt: today } }).select('_id');
let removed = 0;
for (const s of stale) {
  if (!(await Booking.exists({ show: s._id }))) {
    await Show.deleteOne({ _id: s._id });
    removed++;
  }
}

console.log(`Seeded ${movieCount} demo movies and ${showCount} demo shows (removed ${removed} stale). Showtimes are DEMONSTRATION data.`);
await mongoose.disconnect();
