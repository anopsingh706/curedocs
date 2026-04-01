import asyncHandler from 'express-async-handler';
import https from 'https';
import http from 'http';
import MedicalFile from '../models/MedicalFile.js';
import { cloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { detectFileType } from '../utils/fileHelpers.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Build a signed Cloudinary URL that is valid for 10 minutes.
// This works for both public AND private/authenticated assets.
const makeSignedUrl = (publicId, resourceType = 'raw') => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type:          'upload',
    secure:        true,
    sign_url:      true,
    expires_at:    Math.floor(Date.now() / 1000) + 600, // 10 min
  });
};

// Mime map
const MIME = {
  pdf:         'application/pdf',
  docx:        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  spreadsheet: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  dicom:       'application/dicom',
  image:       'image/jpeg',
};

// ── Controllers ───────────────────────────────────────────────────────────────

// @route GET /api/files
export const getFiles = asyncHandler(async (req, res) => {
  const { category, tags, search, page = 1, limit = 20, visibility } = req.query;
  const query = { owner: req.user._id };
  if (category)   query.category   = category;
  if (visibility) query.visibility = visibility;
  if (tags)       query.tags       = { $in: tags.split(',') };
  if (search)     query.title      = { $regex: search, $options: 'i' };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await MedicalFile.countDocuments(query);
  const files = await MedicalFile.find(query)
    .populate('category', 'name slug color icon')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ files, page: Number(page), pages: Math.ceil(total / limit), total });
});

// @route GET /api/files/stats
export const getStats = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const [total, published, sizeResult] = await Promise.all([
    MedicalFile.countDocuments({ owner }),
    MedicalFile.countDocuments({ owner, isPublished: true }),
    MedicalFile.aggregate([
      { $match: { owner } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } },
    ]),
  ]);
  res.json({
    total,
    published,
    drafts:    total - published,
    totalSize: sizeResult[0]?.total || 0,
  });
});

// @route GET /api/files/:id
export const getFile = asyncHandler(async (req, res) => {
  const file = await MedicalFile.findById(req.params.id)
    .populate('category', 'name slug color icon')
    .populate('owner',    'name email');
  if (!file) { res.status(404); throw new Error('File not found'); }
  if (file.owner._id.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Access denied');
  }
  res.json(file);
});

// @route GET /api/files/:id/stream   [JWT protected proxy]
// Generates a short-lived signed Cloudinary URL, fetches the bytes
// server-to-server, then pipes them to the browser.
// This bypasses ALL Cloudinary access restrictions — old files, new files, any type.
export const streamFile = asyncHandler(async (req, res) => {
  const file = await MedicalFile.findById(req.params.id);
  if (!file) { res.status(404); throw new Error('File not found'); }
  if (file.owner.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Access denied');
  }

  const isDownload   = req.query.dl === '1';
  const isImage      = file.fileType === 'image';
  const resourceType = isImage ? 'image' : 'raw';
  const contentType  = isImage
    ? (file.mimeType || 'image/jpeg')
    : (MIME[file.fileType] || 'application/octet-stream');

  // Derive file extension from the stored URL
  const storedExt = file.fileUrl.split('.').pop().split('?')[0] || 'bin';
  const safeName  = file.title.replace(/[^a-z0-9_\-. ]/gi, '_');
  const filename  = `${safeName}.${storedExt}`;

  // Always use a signed URL — works for any Cloudinary delivery type
  const signedUrl = makeSignedUrl(file.publicId, resourceType);
  console.log(`Streaming ${file.publicId} via signed URL`);

  // Set response headers before piping
  res.setHeader('Content-Type', contentType);
  res.setHeader(
    'Content-Disposition',
    isDownload
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`
  );
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Fetch from Cloudinary server-to-server and pipe to browser
  const protocol = signedUrl.startsWith('https') ? https : http;
  const request  = protocol.get(signedUrl, (cloudRes) => {
    console.log(`Cloudinary responded with ${cloudRes.statusCode} for ${file.publicId}`);

    if (cloudRes.statusCode !== 200) {
      // Drain response to free socket
      cloudRes.resume();
      res.status(502).json({
        message: `Storage returned ${cloudRes.statusCode} — try re-uploading the file`,
      });
      return;
    }

    if (cloudRes.headers['content-length']) {
      res.setHeader('Content-Length', cloudRes.headers['content-length']);
    }

    cloudRes.pipe(res);
  });

  request.on('error', (err) => {
    console.error('Proxy request error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ message: 'Could not retrieve file from storage' });
    }
  });

  // If client disconnects mid-stream, abort the upstream request
  req.on('close', () => request.destroy());
});

// @route POST /api/files/upload
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file attached'); }

  const {
    title, description, category, tags,
    doctorName, documentDate, visibility, isPublished,
  } = req.body;

  if (!title || !category) {
    res.status(400); throw new Error('Title and category are required');
  }

  let cloudResult;
  try {
    cloudResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
  } catch (err) {
    res.status(500);
    throw new Error('Cloudinary upload failed: ' + err.message);
  }

  const file = await MedicalFile.create({
    title,
    description:  description || '',
    fileUrl:      cloudResult.secure_url,
    publicId:     cloudResult.public_id,
    fileType:     detectFileType(req.file.mimetype),
    fileSize:     req.file.size || cloudResult.bytes || 0,
    mimeType:     req.file.mimetype,
    category,
    owner:        req.user._id,
    tags:         tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    doctorName:   doctorName   || '',
    documentDate: documentDate ? new Date(documentDate) : undefined,
    visibility:   visibility   || 'private',
    isPublished:  isPublished  === 'true',
  });

  await file.populate('category', 'name slug color icon');
  res.status(201).json(file);
});

// @route PUT /api/files/:id
export const updateFile = asyncHandler(async (req, res) => {
  const file = await MedicalFile.findById(req.params.id);
  if (!file) { res.status(404); throw new Error('File not found'); }
  if (file.owner.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorised');
  }

  const { title, description, category, tags, doctorName, documentDate, visibility } = req.body;
  if (title)                     file.title        = title;
  if (description !== undefined) file.description  = description;
  if (category)                  file.category     = category;
  if (tags)                      file.tags         = tags.split(',').map(t => t.trim()).filter(Boolean);
  if (doctorName !== undefined)  file.doctorName   = doctorName;
  if (documentDate)              file.documentDate = new Date(documentDate);
  if (visibility)                file.visibility   = visibility;

  const updated = await file.save();
  await updated.populate('category', 'name slug color icon');
  res.json(updated);
});

// @route PATCH /api/files/:id/publish
export const togglePublish = asyncHandler(async (req, res) => {
  const file = await MedicalFile.findById(req.params.id);
  if (!file) { res.status(404); throw new Error('File not found'); }
  file.isPublished = !file.isPublished;
  await file.save();
  res.json({
    isPublished: file.isPublished,
    message:     file.isPublished ? 'File published' : 'File unpublished',
  });
});

// @route DELETE /api/files/:id
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await MedicalFile.findById(req.params.id);
  if (!file) { res.status(404); throw new Error('File not found'); }
  if (file.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorised');
  }

  try {
    const resourceType = file.fileType === 'image' ? 'image' : 'raw';
    await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType });
  } catch (e) {
    console.warn('Cloudinary delete warning:', e.message);
  }

  await file.deleteOne();
  res.json({ message: 'File deleted successfully' });
});