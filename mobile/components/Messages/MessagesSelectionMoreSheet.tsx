import React from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, useColorScheme, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { getSafeAreaBottom } from '../../lib/safeAreaInsets';

export interface MessagesSelectionMoreSheetProps {
  isVisible: boolean;
  onDismiss: () => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onViewProfile?: () => void;
}

export const MessagesSelectionMoreSheet: React.FC<MessagesSelectionMoreSheetProps> = ({
  isVisible,
  onDismiss,
  onToggleSelectAll,
  allSelected,
  onViewProfile,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';

  const sheetBg = isDark ? '#18181B' : '#FFFFFF';
  const handleColor = isDark ? '#3F3F46' : '#E4E4E7';

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: sheetBg,
                  paddingBottom: Math.max(getSafeAreaBottom(insets.bottom), Spacing.md),
                },
              ]}
            >
              <View style={styles.handleWrap}>
                <View style={[styles.handle, { backgroundColor: handleColor }]} />
              </View>

              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => {
                  onToggleSelectAll();
                  onDismiss();
                }}
              >
                <Ionicons name={allSelected ? "close-circle-outline" : "checkmark-done"} size={22} color={Colors.text} />
                <Text style={[styles.rowText, { color: Colors.text }]}>{allSelected ? 'Deselect all' : 'Select all'}</Text>
              </TouchableOpacity>

              {onViewProfile ? (
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => {
                    onViewProfile();
                    onDismiss();
                  }}
                >
                  <Ionicons name="person-outline" size={22} color={Colors.text} />
                  <Text style={[styles.rowText, { color: Colors.text }]}>View profile</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
    borderRadius: 12,
  },
  rowText: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
});
