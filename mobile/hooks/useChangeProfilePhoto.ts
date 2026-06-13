import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ChangePhotoAction } from '../components/Profile/ProfileChangePhotoSheet';
import { authService, uploadService } from '../services';
import { useAuthStore } from '../store';

export function useChangeProfilePhoto(initialUri?: string) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialUri);
  const [isLoading, setIsLoading] = useState(false);

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
    const permission =
      action === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        action === 'camera'
          ? 'Allow camera access to take a profile photo.'
          : 'Allow photo library access to choose a profile photo.'
      );
      return;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    };

    const result =
      action === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets[0]?.uri) {
      const newPreviewUri = result.assets[0].uri;
      openPreview(newPreviewUri);
    }
  }, [openPreview]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!previewUri) return;
    
    // Upload to Supabase first, then update user profile
    try {
      setIsLoading(true);
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
  }, [previewUri, setUser, closePreview, closeSheet]);

  const handleSheetSelect = useCallback(
    async (action: ChangePhotoAction) => {
      if (action === 'cancel') {
        closeSheet();
        return;
      }
      if (Platform.OS === 'web') {
        Alert.alert('Not available', 'Photo capture is not supported on web in this build.');
        return;
      }
      await pickImage(action);
    },
    [pickImage, closeSheet]
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
