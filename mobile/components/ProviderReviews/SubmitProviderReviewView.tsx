import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useProviderReviewsStore } from '../../store/providerReviewsStore';
import type { CompletedDeal } from '../../types/review';

export interface SubmitProviderReviewViewProps {
  revieweeUsername: string;
  displayName: string;
  deal: CompletedDeal;
  onBack: () => void;
  onSubmitted: () => void;
}

export const SubmitProviderReviewView: React.FC<SubmitProviderReviewViewProps> = ({
  revieweeUsername,
  displayName,
  deal,
  onBack,
  onSubmitted,
}) => {
  const Colors = useThemeColor();
  const isDark = useColorScheme() === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const accentColor = '#F59E0B';

  const submitReview = useProviderReviewsStore((s) => s.submitReview);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSelectRating = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (rating < 1 || !comment.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submitReview({
      revieweeUsername,
      authorDisplayName: 'You',
      authorInitials: 'YO',
      rating,
      comment: comment.trim(),
      serviceTitle: deal.postTitle,
      createdAt: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    onSubmitted();
  }, [rating, comment, submitReview, revieweeUsername, deal.postTitle, onSubmitted]);

  const canSubmit = rating >= 1 && comment.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Leave a Review</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.introCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.introTitle, { color: Colors.text }]}>
              How was {displayName}&apos;s service?
            </Text>
            <Text style={[styles.introBody, { color: Colors.icon }]}>
              Only students who completed an official undertaking with this provider can leave a
              review.
            </Text>
            <Text style={[styles.serviceLabel, { color: accentColor }]}>{deal.postTitle}</Text>
          </View>

          <View style={[styles.ratingCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: Colors.icon }]}>Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleSelectRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={accentColor}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.commentCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: Colors.icon }]}>Your review</Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: Colors.text,
                  backgroundColor: subtleBg,
                  borderColor: Colors.border + '80',
                },
              ]}
              placeholder="Share what went well and what others should know…"
              placeholderTextColor={Colors.icon}
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: screenBg }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: canSubmit ? Colors.primary : Colors.primary + '44',
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.submitLabel,
                { color: canSubmit ? (isDark ? '#09090B' : '#FFFFFF') : Colors.icon },
              ]}
            >
              Submit Review
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  introCard: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  introTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
  },
  introBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  serviceLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  ratingCard: {
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    letterSpacing: 0.4,
    alignSelf: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  commentCard: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  commentInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitLabel: {
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
});

export default SubmitProviderReviewView;
