import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform, Modal, Pressable, useColorScheme, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import type { NewPostType } from '../../types/newPost';
import { MediaPickerView } from '../MediaPicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PickImageAction = 'library' | 'camera' | 'cancel';

const PICK_OPTIONS: {
  key: Exclude<PickImageAction, 'cancel'>;
  label: string;
  subtitle: string;
  icon: 'images-outline' | 'camera-outline';
}[] = [
  {
    key: 'library',
    label: 'Choose from library',
    subtitle: 'Pick an existing photo',
    icon: 'images-outline',
  },
  {
    key: 'camera',
    label: 'Take a photo',
    subtitle: 'Use your camera now',
    icon: 'camera-outline',
  },
];

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
  const [sheetVisible, setSheetVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const listRef = useRef<FlatList<string>>(null);
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const scrollToIndex = useCallback((index: number) => {
    setPreviewIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setPreviewIndex(index);
    },
    []
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const handleMediaSelect = useCallback((assets: any[]) => {
    const newUris = [...imageUris, ...assets.map((a: any) => a.uri)].slice(0, 6);
    onChange(newUris);
  }, [imageUris, onChange]);

  const renderSlide = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.previewImageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.previewImage}
          contentFit="contain"
          transition={0}
        />
      </View>
    ),
    []
  );

  const pickImage = async (action: Exclude<PickImageAction, 'cancel'>) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not available', 'Image upload is not supported on web in this build.');
      return;
    }

    const permission =
      action === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        action === 'camera'
          ? 'Allow camera access to take a photo.'
          : 'Allow photo library access to choose photos for your post.'
      );
      return;
    }

    let pickerOptions: ImagePicker.ImagePickerOptions;
    if (action === 'camera') {
      // Camera: single image with editing
      pickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        allowsMultipleSelection: false,
        quality: 0.85,
      };
    } else {
      // Library: multiple images without editing
      pickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.85,
        selectionLimit: 6 - imageUris.length, // Limit based on current count
      };
    }

    const result =
      action === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const next = [...imageUris, ...result.assets.map((a) => a.uri)].slice(0, 6);
      onChange(next);
    }
  };

  const removeImage = (uri: string) => {
    
    onChange(imageUris.filter((u) => u !== uri));
  };

  const handleSheetSelect = async (action: PickImageAction) => {
    setSheetVisible(false);
    if (action === 'cancel') return;
    if (action === 'library') {
      setMediaPickerVisible(true);
    } else {
      await pickImage(action);
    }
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
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="image-outline" size={24} color={primaryColor} />
          <Text style={[styles.addLabel, { color: primaryColor }]}>Add Image</Text>
        </TouchableOpacity>
        {imageUris.map((uri, index) => (
          <View key={uri} style={styles.thumbWrap}>
            <TouchableOpacity onPress={() => { setPreviewIndex(index); setPreviewVisible(true); }}>
              <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Image picker sheet */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: subtleBg }]} />
            <Text style={[styles.sheetTitle, { color: Colors.text }]}>Add image</Text>

            {PICK_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.optionRow, { backgroundColor: subtleBg }]}
                onPress={() => handleSheetSelect(item.key)}
                activeOpacity={0.85}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '18' }]}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: Colors.text }]}>{item.label}</Text>
                  <Text style={[styles.optionSubtitle, { color: Colors.icon }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.icon} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cancelRow, { backgroundColor: subtleBg }]}
              onPress={() => handleSheetSelect('cancel')}
              activeOpacity={0.85}
            >
              <Text style={[styles.cancelLabel, { color: Colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Image preview modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.previewClose}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.previewCount}>
                {previewIndex + 1} / {imageUris.length}
              </Text>
              <View style={styles.previewSpacer} />
            </View>

            <FlatList
              ref={listRef}
              data={imageUris}
              renderItem={renderSlide}
              keyExtractor={(item, index) => `preview-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={imageUris.length > 1}
              onMomentumScrollEnd={onMomentumScrollEnd}
              getItemLayout={getItemLayout}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              initialScrollIndex={previewIndex}
              style={styles.previewList}
            />

            <View style={styles.previewControls}>
              {previewIndex > 0 && (
                <TouchableOpacity onPress={() => scrollToIndex(previewIndex - 1)} style={styles.previewControlButton}>
                  <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={styles.previewSpacer} />
              {previewIndex < imageUris.length - 1 && (
                <TouchableOpacity onPress={() => scrollToIndex(previewIndex + 1)} style={styles.previewControlButton}>
                  <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <MediaPickerView
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onSelect={handleMediaSelect}
      />
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  cancelRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  // Preview modal styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  previewClose: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCount: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  previewSpacer: {
    width: 44,
  },
  previewList: {
    flex: 1,
  },
  previewImageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewControls: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  previewControlButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
  },
});

export default NewPostImageUploader;
