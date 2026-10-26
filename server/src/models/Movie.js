import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    posterUrl: { type: String, required: true, trim: true },
    backdropUrl: { type: String, trim: true, default: '' },
    genres: { type: [String], default: [], validate: (v) => v.length <= 6 },
    duration: { type: Number, required: true, min: 1, max: 600 }, // minutes
    rating: { type: Number, min: 0, max: 10, default: 0 },
    language: { type: String, required: true, trim: true },
    releaseDate: { type: Date },
    featured: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false }, // marks seeded demo data
  },
  { timestamps: true }
);

movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ featured: 1 });

export default mongoose.model('Movie', movieSchema);
