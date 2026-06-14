import React, { memo, useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const POST_GALLERY_HEIGHT = SCREEN_WIDTH * 0.82;
const THUMB_SIZE = 56;
const THUMB_STRIP_HEIGHT = THUMB_SIZE + Spacing.md + Spacing.sm;

export interface PostImageGalleryProps {
  images: string[];
  recyclingKeyPrefix: string;
  screenBg: string;
  /** Clears status bar / notch when positioning the page counter. */
  topInset?: number;
}

const PostImageGalleryComponent: React.FC<PostImageGalleryProps> = ({
  images,
  recyclingKeyPrefix,
  screenBg,
  topInset = 0,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const listRef = useRef<FlatList<string>>(null);
  const previewListRef = useRef<FlatList<string>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const hasMultiple = images.length > 1;
  const thumbBorderActive = isDark ? '#C4F000' : '#65A30D';
  const thumbBorderIdle = isDark ? '#3F3F46' : '#E1E4E8';

  const scrollToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const scrollToPreviewIndex = useCallback((index: number) => {
    setPreviewIndex(index);
    previewListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  const onPreviewMomentumScrollEnd = useCallback(
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

  const openPreview = useCallback(() => {
    setPreviewIndex(activeIndex);
    setPreviewVisible(true);
  }, [activeIndex]);

  const renderSlide = useCallback(
    ({ item, index }: { item: string; index: number}) => (
      <View style={styles.slide}>
        <Image
          source={{ uri: item }}
          style={styles.slideImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${recyclingKeyPrefix}-${index}`}
          transition={0}
        />
      </View>
    ),
    [recyclingKeyPrefix]
  );

  const renderPreviewSlide = useCallback(
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

  return (
    <View style={[styles.wrap, { backgroundColor: screenBg }]}>
      <View style={styles.viewer}>
        <FlatList
          ref={listRef}
          data={images}
          renderItem={renderSlide}
          keyExtractor={(_, index) => `${recyclingKeyPrefix}-slide-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={hasMultiple}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {hasMultiple ? (
          <>
            <View style={[styles.counterPill, { top: topInset + Spacing.md }]}>
              <Text style={styles.counterText}>
                {activeIndex + 1} / {images.length}
              </Text>
            </View>
            <View style={styles.dotsRow}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeIndex ? styles.dotActive : styles.dotIdle,
                  ]}
                />
              ))}
            </View>
          </>
        ) : null}

        <TouchableOpacity
          onPress={openPreview}
          style={styles.expandButton}
          activeOpacity={0.85}
        >
          <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {hasMultiple ? (
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbStrip}
          keyExtractor={(_, index) => `${recyclingKeyPrefix}-thumb-${index}`}
          renderItem={({ item, index }) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                onPress={() => scrollToIndex(index)}
                activeOpacity={0.85}
                style={[
                  styles.thumbOuter,
                  { borderColor: isActive ? thumbBorderActive : thumbBorderIdle },
                ]}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.thumbImage}
                  contentFit="cover"
                  transition={0}
                />
              </TouchableOpacity>
            );
          }}
        />
      ) : null}

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
                {previewIndex + 1} / {images.length}
              </Text>
              <View style={styles.previewSpacer} />
            </View>

            <FlatList
              ref={previewListRef}
              data={images}
              renderItem={renderPreviewSlide}
              keyExtractor={(item, index) => `preview-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={hasMultiple}
              onMomentumScrollEnd={onPreviewMomentumScrollEnd}
              getItemLayout={getItemLayout}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              initialScrollIndex={previewIndex}
              style={styles.previewList}
            />

            <View style={styles.previewControls}>
              {previewIndex > 0 && (
                <TouchableOpacity onPress={() => scrollToPreviewIndex(previewIndex - 1)} style={styles.previewControlButton}>
                  <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={styles.previewSpacer} />
              {previewIndex < images.length - 1 && (
                <TouchableOpacity onPress={() => scrollToPreviewIndex(previewIndex + 1)} style={styles.previewControlButton}>
                  <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: SCREEN_WIDTH,
  },
  viewer: {
    width: SCREEN_WIDTH,
    height: POST_GALLERY_HEIGHT,
    backgroundColor: '#0a0a0a',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: POST_GALLERY_HEIGHT,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  expandButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterPill: {
    position: 'absolute',
    right: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  dotsRow: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  dotIdle: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  thumbStrip: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm + 4,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    minHeight: THUMB_STRIP_HEIGHT,
  },
  thumbOuter: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  // Preview styles
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

export const PostImageGallery = memo(PostImageGalleryComponent);

export default PostImageGallery;
