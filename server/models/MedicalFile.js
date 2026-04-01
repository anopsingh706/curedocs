import mongoose from 'mongoose';

const medicalFileSchema = new mongoose.Schema(
  {
    title:        { type: String, required: [true, 'Title is required'], trim: true },
    description:  { type: String, default: '' },
    fileUrl:      { type: String, required: true },
    publicId:     { type: String, required: true },   // Cloudinary public_id
    fileType:     { type: String, enum: ['image', 'pdf', 'dicom', 'docx', 'spreadsheet'], required: true },
    fileSize:     { type: Number, default: 0 },       // bytes
    mimeType:     { type: String, default: '' },
    category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    tags:         [{ type: String, lowercase: true, trim: true }],
    doctorName:   { type: String, default: '' },
    documentDate: { type: Date },
    visibility:   { type: String, enum: ['private', 'shared'], default: 'private' },
    isPublished:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast queries
medicalFileSchema.index({ owner: 1, category: 1 });
medicalFileSchema.index({ owner: 1, isPublished: 1 });
medicalFileSchema.index({ tags: 1 });
medicalFileSchema.index({ createdAt: -1 });

export default mongoose.model('MedicalFile', medicalFileSchema);
