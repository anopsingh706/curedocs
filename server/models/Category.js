import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    color:     { type: String, default: 'gray' },       // Tailwind color token
    icon:      { type: String, default: 'file' },        // Lucide icon name
    isDefault: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
