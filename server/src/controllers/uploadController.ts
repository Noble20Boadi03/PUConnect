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
    // Use a general "uploads" folder instead of just "avatars"
    const filePath = `uploads/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars') // You might want to create a new "uploads" bucket in Supabase instead of using "avatars"
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
