import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export interface ReviewPromptDialogProps {
  visible: boolean;
  providerName: string;
  serviceTitle: string;
  onReviewNow: () => void;
  onLater: () => void;
}

export const ReviewPromptDialog: React.FC<ReviewPromptDialogProps> = ({
  visible,
  providerName,
  serviceTitle,
  onReviewNow,
  onLater,
}) => {
  const Colors = useThemeColor();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const handleLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLater();
  };

  const handleReview = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onReviewNow();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleLater}
    >
      <Pressable style={styles.overlay} onPress={handleLater}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlayInner}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeIn.duration(220)}
              style={[styles.card, { backgroundColor: cardBg }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F59E0B18' }]}>
                <Ionicons name="star" size={28} color="#F59E0B" />
              </View>

              <Text style={[styles.title, { color: Colors.text }]}>Service complete</Text>
              <Text style={[styles.message, { color: Colors.icon }]}>
                How was your experience with {providerName} for “{serviceTitle}”? Your review is
                optional and helps other students on campus.
              </Text>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
                onPress={handleReview}
                activeOpacity={0.9}
              >
                <Ionicons name="create-outline" size={20} color={isDark ? '#09090B' : '#FFFFFF'} />
                <Text style={[styles.primaryLabel, { color: isDark ? '#09090B' : '#FFFFFF' }]}>
                  Leave a Review
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: subtleBg }]}
                onPress={handleLater}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryLabel, { color: Colors.text }]}>Maybe Later</Text>
              </TouchableOpacity>

              <Text style={[styles.hint, { color: Colors.icon }]}>
                You can also review later from {providerName}&apos;s profile.
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  overlayInner: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.sm,
  },
  primaryLabel: {
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  hint: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: Spacing.md,
  },
});

export default ReviewPromptDialog;
