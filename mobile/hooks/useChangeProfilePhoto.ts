import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import type { ChangePhotoAction } from '../components/Profile/ProfileChangePhotoSheet';
import { authService, uploadService } from '../services';
import { useAuthStore } from '../store';
import { useImagePicker } from './useImagePicker';

export function useChangeProfilePhoto(initialUri?: string) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialUri);
  const [isLoading, setIsLoading] = useState(false);

  const { pickFromCamera, pickFromGallery } = useImagePicker({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
    allowsMultipleSelection: false,
  });

  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setAvatarUri(initialUri);
  }, [initialUri]);

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const openPreview = useCallback((uri: string) => {
    setPreviewUri(uri);
    setPreviewVisible(true);
  }, []);
  const closePreview = useCallback(() => {
    setPreviewVisible(false);
    setPreviewUri(undefined);
  }, []);

  const pickImage = useCallback(async (action: Exclude<ChangePhotoAction, 'cancel'>) => {
    if (action === 'camera') {
      const image = await pickFromCamera();
      if (!image) return;
      openPreview(image.uri);
    } else if (action === 'library') {
      const images = await pickFromGallery();
      if (images.length === 0) return;
      const image = images[0];
      openPreview(image.uri);
    }
  }, [pickFromCamera, pickFromGallery, openPreview]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!previewUri) return;
    
    try {
      setIsLoading(true);
      
      // Delete the old avatar from storage before uploading new one
      if (initialUri && initialUri.startsWith('http')) {
        await uploadService.deleteImage(initialUri);
      }
      
      const publicUrl = await uploadService.uploadImage(previewUri);
      const updatedUser = await authService.updateProfile({
        avatarUrl: publicUrl,
      });
      setUser(updatedUser);
      setAvatarUri(publicUrl);
      closePreview();
      closeSheet();
    } catch (error) {
      console.error('Error updating profile photo:', error);
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [previewUri, setUser, closePreview, closeSheet, initialUri]);

  const handleRemovePhoto = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (initialUri && initialUri.startsWith('http')) {
        // Delete the old avatar from storage first
        await uploadService.deleteImage(initialUri);
      }
      
      const updatedUser = await authService.updateProfile({
        avatarUrl: '', // Use empty string or null based on what your server expects
      });
      setUser(updatedUser);
      setAvatarUri(undefined);
      closeSheet();
    } catch (error) {
      console.error('Error removing profile photo:', error);
      Alert.alert('Error', 'Failed to remove profile photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, closeSheet, initialUri]);

  const handleSheetSelect = useCallback(
    async (action: ChangePhotoAction) => {
      if (action === 'cancel') {
        closeSheet();
        return;
      }
      if (action === 'remove') {
        await handleRemovePhoto();
        return;
      }
      if (Platform.OS === 'web') {
        Alert.alert('Not available', 'Photo capture is not supported on web in this build.');
        return;
      }
      await pickImage(action);
    },
    [pickImage, closeSheet, handleRemovePhoto]
  );

  return {
    avatarUri,
    sheetVisible,
    previewVisible,
    previewUri,
    openSheet,
    closeSheet,
    closePreview,
    handleSheetSelect,
    handleConfirmPhoto,
    isLoading,
  };
}

export default useChangeProfilePhoto;
