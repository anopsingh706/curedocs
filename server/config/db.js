import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await seedCategories();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Seed the 5 default categories on first run
async function seedCategories() {
  const { default: Category } = await import('../models/Category.js');
  const count = await Category.countDocuments();
  if (count > 0) return;

  const defaults = [
    { name: 'Clinical & Consultation', slug: 'clinical-consultation', color: 'green',  icon: 'stethoscope',  isDefault: true },
    { name: 'Lab & Diagnostic Reports', slug: 'lab-diagnostics',      color: 'blue',   icon: 'flask-conical', isDefault: true },
    { name: 'Hospital & Surgical Records', slug: 'hospital-surgical', color: 'amber',  icon: 'building-2',   isDefault: true },
    { name: 'Medications & Preventive Care', slug: 'medications-preventive', color: 'purple', icon: 'pill', isDefault: true },
    { name: 'Administrative & Legal', slug: 'administrative-legal',   color: 'red',    icon: 'file-text',    isDefault: true },
  ];

  await Category.insertMany(defaults);
  console.log('🌱 Default categories seeded');
}
