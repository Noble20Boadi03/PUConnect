import express from 'express';
import { upload, uploadImage, deleteImage } from '../controllers/uploadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('image'), uploadImage);
router.delete('/', protect, deleteImage);

export default router;
