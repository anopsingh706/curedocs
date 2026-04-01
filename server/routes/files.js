import express from 'express';
import {
  getFiles,
  getFile,
  streamFile,
  uploadFile,
  updateFile,
  togglePublish,
  deleteFile,
  getStats,
} from '../controllers/fileController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/stats',            protect, getStats);
router.get('/',                 protect, getFiles);
router.get('/:id',              protect, getFile);
router.get('/:id/stream',       protect, streamFile);      // ← new proxy route
router.post('/upload',          protect, upload.single('file'), uploadFile);
router.put('/:id',              protect, updateFile);
router.patch('/:id/publish',    protect, adminOnly, togglePublish);
router.delete('/:id',           protect, deleteFile);

export default router;