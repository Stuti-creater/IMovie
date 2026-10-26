import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatre: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
    time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, // HH:mm
    price: { type: Number, required: true, min: 0, max: 100000 },
    bookedSeats: { type: [String], default: [] },
    isSample: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One screening per movie/theatre/date/time.
showSchema.index({ movie: 1, theatre: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Show', showSchema);
