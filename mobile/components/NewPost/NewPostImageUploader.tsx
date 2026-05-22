import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import type { NewPostType } from '../../types/newPost';

export interface NewPostImageUploaderProps {
  postType: NewPostType;
  imageUris: string[];
  onChange: (uris: string[]) => void;
  screenBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  error?: string | null;
}

export const NewPostImageUploader: React.FC<NewPostImageUploaderProps> = ({
  postType,
  imageUris,
  onChange,
  screenBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  error,
}) => {
  const required = postType === 'Service';

  const pickImages = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not available', 'Image upload is not supported on web in this build.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add images to your post.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 6,
    });

    if (!result.canceled && result.assets.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const next = [...imageUris, ...result.assets.map((a) => a.uri)].slice(0, 6);
      onChange(next);
    }
  };

  const removeImage = (uri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(imageUris.filter((u) => u !== uri));
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: mutedColor }]}>
        Images {required ? '(required)' : '(optional)'}
      </Text>
      <Text style={[styles.hint, { color: error ? '#EF4444' : mutedColor }]}>
        {error ??
          (required
            ? 'Service posts need at least one photo. Request posts can stay text-only on the detail page.'
            : 'Add photos if they help explain your request. Cards on the market stay text-only for requests.')}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        <TouchableOpacity
          style={[styles.addTile, { backgroundColor: screenBg, borderColor: error ? '#EF4444' : borderColor }]}
          onPress={pickImages}
          activeOpacity={0.85}
        >
          <Ionicons name="image-outline" size={24} color={primaryColor} />
          <Text style={[styles.addLabel, { color: primaryColor }]}>Add Image</Text>
        </TouchableOpacity>
        {imageUris.map((uri) => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: Typography.size.xs, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  hint: { fontSize: Typography.size.xs, fontWeight: '500', marginBottom: Spacing.sm, marginLeft: 2, lineHeight: 16 },
  strip: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  addTile: {
    width: 108,
    height: 108,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addLabel: { fontSize: Typography.size.xs, fontWeight: '700' },
  thumbWrap: { position: 'relative' },
  thumb: { width: 108, height: 108, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 11,
  },
});

export default NewPostImageUploader;
