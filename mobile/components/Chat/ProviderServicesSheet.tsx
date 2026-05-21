import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { formatPostPrice } from '../../lib';
import { useThemeColor } from '../../hooks';
import type { ServicePost } from '../../types';

export interface ProviderServicesSheetProps {
  visible: boolean;
  providerName: string;
  services: ServicePost[];
  onSelectService: (postId: string) => void;
  onClose: () => void;
}

export const ProviderServicesSheet: React.FC<ProviderServicesSheetProps> = ({
  visible,
  providerName,
  services,
  onSelectService,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: cardBg,
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              maxHeight: '78%',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />
          <Text style={[styles.sheetTitle, { color: Colors.text }]}>Browse Services</Text>
          <Text style={[styles.sheetSubtitle, { color: Colors.icon }]}>
            Listings offered by {providerName}
          </Text>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {services.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: subtleBg }]}>
                <Ionicons name="briefcase-outline" size={28} color={Colors.icon} />
                <Text style={[styles.emptyText, { color: Colors.icon }]}>
                  No services listed yet.
                </Text>
              </View>
            ) : (
              services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceRow, { backgroundColor: subtleBg }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectService(service.id);
                    onClose();
                  }}
                  activeOpacity={0.88}
                >
                  <Image
                    source={{ uri: service.thumbnail }}
                    style={styles.thumb}
                    contentFit="cover"
                    transition={0}
                  />
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceTitle, { color: Colors.text }]} numberOfLines={2}>
                      {service.title}
                    </Text>
                    <Text style={[styles.servicePrice, { color: Colors.primary }]}>
                      {formatPostPrice(service.price)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.icon} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelRow, { borderColor: subtleBg }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelLabel, { color: Colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm + 4,
    borderRadius: 14,
    marginBottom: Spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
    lineHeight: 20,
  },
  servicePrice: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 14,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  cancelRow: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ProviderServicesSheet;
