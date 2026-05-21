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
} from 'react-native';
import { Image } from 'expo-image';
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
  const [activeIndex, setActiveIndex] = useState(0);

  const hasMultiple = images.length > 1;
  const thumbBorderActive = isDark ? '#C4F000' : '#65A30D';
  const thumbBorderIdle = isDark ? '#3F3F46' : '#E1E4E8';

  const scrollToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  const renderSlide = useCallback(
    ({ item, index }: { item: string; index: number }) => (
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

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
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
});

export const PostImageGallery = memo(PostImageGalleryComponent);

export default PostImageGallery;
