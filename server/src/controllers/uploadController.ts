import { Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: 'No file uploaded',
      });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const filePath = `uploads/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return res.status(200).json({
      status: 200,
      message: 'Image uploaded successfully',
      data: { url: publicUrl },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error uploading image',
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        status: 400,
        message: 'Image URL is required',
      });
    }

    const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    if (!pathMatch) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid image URL',
      });
    }

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 200,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error deleting image',
    });
  }
};
