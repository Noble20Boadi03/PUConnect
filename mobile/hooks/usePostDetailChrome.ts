import { useCallback, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { StatusBarStyle } from 'expo-status-bar';

import { POST_GALLERY_HEIGHT } from '../components/PostDetail/PostImageGallery';
import {
  applyAndroidSystemChrome,
  applyThemeSystemChrome,
  getPostContentSystemChrome,
  getPostGallerySystemChrome,
  type SystemChromeConfig,
} from '../lib/systemChrome';

export type PostDetailChromePhase = 'gallery' | 'content' | 'footer';

export interface PostDetailChromeState {
  statusBarStyle: StatusBarStyle;
  phase: PostDetailChromePhase;
}

function resolveChrome(
  scrollY: number,
  isDark: boolean
): SystemChromeConfig & { phase: PostDetailChromePhase } {
  const galleryThreshold = POST_GALLERY_HEIGHT * 0.45;
  const footerThreshold = POST_GALLERY_HEIGHT + 120;

  if (scrollY < galleryThreshold) {
    return { ...getPostGallerySystemChrome(), phase: 'gallery' };
  }

  if (scrollY >= footerThreshold) {
    return {
      ...getPostContentSystemChrome(isDark, { footerVisible: true }),
      phase: 'footer',
    };
  }

  return {
    ...getPostContentSystemChrome(isDark, { footerVisible: false }),
    phase: 'content',
  };
}

export function usePostDetailChrome() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [chrome, setChrome] = useState<PostDetailChromeState>(() => {
    const initial = getPostGallerySystemChrome();
    return { statusBarStyle: initial.statusBarStyle, phase: 'gallery' };
  });

  const applyChrome = useCallback((config: SystemChromeConfig, phase: PostDetailChromePhase) => {
    setChrome({ statusBarStyle: config.statusBarStyle, phase });
    void applyAndroidSystemChrome(config);
  }, []);

  const updateFromScroll = useCallback(
    (scrollY: number) => {
      const next = resolveChrome(scrollY, isDark);
      setChrome((prev) => {
        if (prev.statusBarStyle === next.statusBarStyle && prev.phase === next.phase) {
          return prev;
        }
        void applyAndroidSystemChrome(next);
        return { statusBarStyle: next.statusBarStyle, phase: next.phase };
      });
    },
    [isDark]
  );

  useFocusEffect(
    useCallback(() => {
      const initial = getPostGallerySystemChrome();
      applyChrome(initial, 'gallery');

      return () => {
        void applyThemeSystemChrome(isDark);
      };
    }, [isDark, applyChrome])
  );

  return { chrome, updateFromScroll };
}
