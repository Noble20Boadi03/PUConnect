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
import { reportService } from '../services/reportService';
import { Alert } from './Alert';

export interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ visible, onClose }) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await reportService.createFeedback({ message: message.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatusMessage({ type: 'success', text: 'Thank you for your feedback!' });

      setTimeout(() => {
        onClose();
        setMessage('');
        setStatusMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStatusMessage({ type: 'error', text: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [message, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setMessage('');
    setStatusMessage(null);
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
            <Text style={[styles.title, { color: Colors.text }]}>Send Feedback</Text>
            <Text style={[styles.subtitle, { color: Colors.icon }]}>
              We appreciate your feedback to help improve the app!
            </Text>

            <EditInfoField
              label="Your feedback"
              screenBg={cardBg}
              borderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what you think..."
              multiline
              numberOfLines={6}
            />

            {statusMessage ? (
              <Alert
                type={statusMessage.type}
                message={statusMessage.text}
                dismissible
                onDismiss={() => setStatusMessage(null)}
              />
            ) : null}

            <Button
              title="Submit feedback"
              variant="primary"
              size="md"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={!message.trim() || isSubmitting}
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

export default FeedbackSheet;
