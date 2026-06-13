import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

const PAGE_SIZE = 60;

type MediaAsset = {
  id: string;
  uri: string;
  width: number;
  height: number;
};

export interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  multiSelect?: boolean;
}

export const MediaPickerView: React.FC<MediaPickerProps> = ({
  visible,
  onClose,
  onSelect,
  multiSelect = true,
}) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<any>(null);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const Colors = useThemeColor();

  const requestPermission = useCallback(async () => {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissionGranted(true);
      await loadAssets();
    } else if (!canAskAgain) {
      Alert.alert(
        'Permission Required',
        'Please enable media permissions in Settings to use this feature.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  }, [onClose]);

  const loadAssets = useCallback(async (after: string | undefined = undefined) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        after,
        first: PAGE_SIZE,
      });

      const newAssets: MediaAsset[] = result.assets.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      }));

      setAssets((prev) => (after ? [...prev, ...newAssets] : newAssets));
      setHasNextPage(result.hasNextPage);
      setEndCursor(result.endCursor);
    } catch (e) {
      console.error('Error loading assets', e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const toggleSelect = useCallback((asset: MediaAsset) => {
    setSelectedAssets((prev) => {
      const index = prev.findIndex((a) => a.id === asset.id);
      if (index > -1) {
        return prev.filter((a) => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MediaAsset }) => {
      const isSelected = selectedAssets.some((a) => a.id === item.id);
      const selectedIndex = selectedAssets.findIndex((a) => a.id === item.id);

      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => toggleSelect(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.gridImage}
            contentFit="cover"
          />
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>{selectedIndex + 1}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedAssets, toggleSelect]
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !loading) {
      loadAssets(endCursor);
    }
  }, [hasNextPage, loading, loadAssets, endCursor]);

  const handleSelect = useCallback(() => {
    onSelect(selectedAssets);
    setSelectedAssets([]);
    onClose();
  }, [selectedAssets, onSelect, onClose]);

  useEffect(() => {
    if (visible) {
      requestPermission();
    }
  }, [visible, requestPermission]);

  useEffect(() => {
    setSelectedAssets([]);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.text }]}>Select Photos</Text>
          <View style={styles.headerBtn} />
        </View>

        <FlashList
          ref={listRef}
          data={assets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.grid}
        />

        {selectedAssets.length > 0 && (
          <View
            style={[
              styles.continueButtonContainer,
              { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
            ]}
          >
            <TouchableOpacity style={styles.continueButton} onPress={handleSelect}>
              <Text style={styles.continueButtonText}>
                Continue ({selectedAssets.length})
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  grid: {
    padding: 2,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  gridImage: {
    flex: 1,
    borderRadius: 6,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  continueButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: Spacing.md,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default MediaPickerView;
