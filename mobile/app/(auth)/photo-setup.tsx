import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { useThemeColor, useImagePicker, useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button } from '../../components';
import { ProfileChangePhotoSheet } from '../../components/Profile';
import { useAuthStore } from '../../store';
import { uploadService, authService } from '../../services';

export default function PhotoSetupScreen() {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const router = useAppRouter();

  const { pickFromCamera, pickFromGallery } = useImagePicker({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const hasSelectedPhoto = !!selectedImage;

  const openSheet = () => setSheetVisible(true);
  const closeSheet = () => setSheetVisible(false);

  async function handlePickFromGallery() {
    const images = await pickFromGallery();
    if (images.length === 0) return;
    setSelectedImage(images[0].uri);
    closeSheet();
  }

  async function handlePickFromCamera() {
    const image = await pickFromCamera();
    if (!image) return;
    setSelectedImage(image.uri);
    closeSheet();
  }

  const handleSheetSelect = async (action: 'camera' | 'library' | 'remove' | 'cancel') => {
    if (action === 'cancel') {
      closeSheet();
      return;
    }
    if (action === 'remove') {
      setSelectedImage(null);
      closeSheet();
      return;
    }
    if (action === 'camera') {
      await handlePickFromCamera();
    } else if (action === 'library') {
      await handlePickFromGallery();
    }
  };

  async function handleSavePhoto() {
    if (!selectedImage) return;
    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(selectedImage);
      const updatedUser = await authService.updateProfile({ avatarUrl: url });
      setUser(updatedUser);
      await completeOnboarding();
      router.replace('/(tabs)/market' as any);
    } catch {
      Alert.alert('Error', 'Failed to upload photo. Try again.');
    } finally {
      setIsUploading(false);
    }
  }

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/market' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.primary }]}>Add a Profile Picture</Text>
          <Text style={[styles.subtitle, { color: Colors.text }]}>
            Personalize your account by adding a photo. This helps others on campus recognize you!
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: Colors.primary + '18' }]}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={0}
                />
              ) : (
                <Text style={[styles.avatarInitials, { color: Colors.primary }]}>{initials}</Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            {!isUploading && (
              <Button
                title="Skip for now"
                variant="ghost"
                size="sm"
                onPress={handleSkip}
                style={styles.actionButton}
              />
            )}

            <Button
              title={hasSelectedPhoto ? 'Save Photo' : 'Upload Image'}
              variant={hasSelectedPhoto ? 'primary' : 'outline'}
              size="md"
              onPress={() => {
                
                if (hasSelectedPhoto) {
                  handleSavePhoto();
                } else {
                  openSheet();
                }
              }}
              style={styles.actionButton}
              disabled={isUploading}
              isLoading={isUploading}
            />
          </View>
        </View>
      </View>

      <ProfileChangePhotoSheet
        visible={sheetVisible}
        onClose={closeSheet}
        onSelect={handleSheetSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 140,
    height: 140,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
