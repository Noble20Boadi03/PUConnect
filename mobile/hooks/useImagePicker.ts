import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerOptions {
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileName?: string;
}

export function useImagePicker(options?: ImagePickerOptions) {
  const {
    allowsMultipleSelection = false,
    selectionLimit = 1,
    allowsEditing = false,
    aspect,
    quality = 0.85,
  } = options || {};

  const requestPermission = useCallback(
    async (type: 'camera' | 'library'): Promise<boolean> => {
      if (Platform.OS === 'web') {
        Alert.alert('Not available', 'Image picker is not supported on web in this build.');
        return false;
      }

      const permission =
        type === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          type === 'camera'
            ? 'Allow camera access to take photos.'
            : 'Allow photo library access to choose photos.'
        );
        return false;
      }
      return true;
    },
    []
  );

  const pickFromCamera = useCallback(async (): Promise<PickedImage | null> => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return null;

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing,
      aspect,
      quality,
    };

    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled || !result.assets.length) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    };
  }, [requestPermission, allowsEditing, aspect, quality]);

  const pickFromGallery = useCallback(async (): Promise<PickedImage[]> => {
    const hasPermission = await requestPermission('library');
    if (!hasPermission) return [];

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: !allowsMultipleSelection && allowsEditing,
      allowsMultipleSelection,
      quality,
      selectionLimit: allowsMultipleSelection ? selectionLimit : undefined,
    };

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled || !result.assets.length) return [];

    return result.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    }));
  }, [requestPermission, allowsMultipleSelection, allowsEditing, quality, selectionLimit]);

  return {
    pickFromCamera,
    pickFromGallery,
  };
}

export default useImagePicker;
