import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ChangePhotoAction } from '../components/Profile/ProfileChangePhotoSheet';

export function useChangeProfilePhoto(initialUri?: string) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialUri);

  useEffect(() => {
    setAvatarUri(initialUri);
  }, [initialUri]);

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);

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
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleSheetSelect = useCallback(
    async (action: ChangePhotoAction) => {
      if (action === 'cancel') return;
      if (Platform.OS === 'web') {
        Alert.alert('Not available', 'Photo capture is not supported on web in this build.');
        return;
      }
      await pickImage(action);
    },
    [pickImage]
  );

  return {
    avatarUri,
    sheetVisible,
    openSheet,
    closeSheet,
    handleSheetSelect,
  };
}

export default useChangeProfilePhoto;
