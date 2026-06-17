import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from './apiClient';

export const uploadService = {
  async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error('File not found');
    }

    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
    const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';

    formData.append('image', {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },

  async uploadFile(
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const formData = new FormData();
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error('File not found');
    }

    formData.append('image', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },

  async deleteImage(imageUrl: string): Promise<void> {
    await apiClient.delete('/upload', {
      data: { imageUrl },
    });
  },
};

export async function uploadFile(
  uri: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  return uploadService.uploadFile(uri, fileName, mimeType);
}

export default uploadService;
