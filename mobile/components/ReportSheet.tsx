import React, { useCallback, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../hooks';
import { Spacing, Typography } from '../constants';
import { EditInfoField } from './EditInfo/EditInfoField';
import { Button } from './Button';
import { reportService, type ReportTargetType, type ReportReason } from '../services/reportService';
import { Alert } from './Alert';

export interface ReportSheetProps {
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'scam', label: 'Scam' },
  { value: 'other', label: 'Other' },
];

export const ReportSheet: React.FC<ReportSheetProps> = ({
  visible,
  targetType,
  targetId,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await reportService.createReport({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage({ type: 'success', text: 'Report submitted successfully.' });

      setTimeout(() => {
        onClose();
        setSelectedReason(null);
        setDescription('');
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error submitting report:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedReason, description, targetType, targetId, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedReason(null);
    setDescription('');
    setMessage(null);
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: Colors.text }]}>Report {targetType}</Text>
            <Text style={[styles.subtitle, { color: Colors.icon }]}>
              Select a reason for your report:
            </Text>

            <View style={styles.reasonsContainer}>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonButton,
                    {
                      backgroundColor: subtleBg,
                      borderWidth: 2,
                      borderColor: selectedReason === reason.value ? Colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.reasonLabel,
                      {
                        color: selectedReason === reason.value ? Colors.primary : Colors.text,
                      },
                    ]}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <EditInfoField
              label="Additional details (optional)"
              screenBg={cardBg}
              borderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide any additional information..."
              multiline
              numberOfLines={4}
            />

            {message ? (
              <Alert
                type={message.type}
                message={message.text}
                dismissible
                onDismiss={() => setMessage(null)}
              />
            ) : null}

            <Button
              title="Submit report"
              variant="primary"
              size="md"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={!selectedReason || isSubmitting}
              style={styles.submitButton}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={handleClose}
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
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  content: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  reasonsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  reasonButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  reasonLabel: {
    fontSize: Typography.size.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.lg,
    borderRadius: 12,
  },
  cancelRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ReportSheet;
