import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — buffer streamed directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/dicom',
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  },
});

export const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    // Always use 'image' resource_type for images, 'raw' for everything else
    const isImage      = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    const ext          = path.extname(originalname).replace('.', '') || 'bin';
    const publicId     = `curedocs/${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const uploadOptions = {
      resource_type: resourceType,
      folder:        'curedocs',
      public_id:     publicId,
      overwrite:     true,
      // These two lines make the asset publicly accessible
      type:          'upload',
      access_mode:   'public',
    };

    // For non-image files, set format so Cloudinary preserves extension in URL
    if (!isImage) {
      uploadOptions.format = ext;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream error:', JSON.stringify(error));
          return reject(new Error(error.message || JSON.stringify(error)));
        }
        if (!result) return reject(new Error('Cloudinary returned empty result'));
        console.log('✅ Cloudinary upload success:', result.secure_url);
        resolve(result);
      }
    );

    stream.on('error', (err) => reject(err));
    stream.end(buffer);
  });
};

// Generate a short-lived signed URL for private/raw files — used by proxy route
export const getSignedUrl = (publicId, resourceType = 'raw') => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type:          'upload',
    secure:        true,
    sign_url:      true,
    expires_at:    Math.floor(Date.now() / 1000) + 300, // valid 5 minutes
  });
};

export { cloudinary };