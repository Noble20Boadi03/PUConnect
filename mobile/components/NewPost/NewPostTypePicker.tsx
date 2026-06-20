import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import type { NewPostType } from '../../types/newPost';

const OPTIONS: { value: NewPostType; label: string }[] = [
  { value: 'Service', label: 'Service' },
  { value: 'Request', label: 'Request' },
];

export interface NewPostTypePickerProps {
  value: NewPostType;
  onChange: (value: NewPostType) => void;
  locked: boolean;
  screenBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
}

export const NewPostTypePicker: React.FC<NewPostTypePickerProps> = ({
  value,
  onChange,
  locked,
  screenBg,
  borderColor,
  textColor,
  mutedColor,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: mutedColor }]}>Post type</Text>
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: screenBg,
            borderColor,
            opacity: locked ? 0.65 : 1,
          },
        ]}
        onPress={() => {
          if (locked) return;
          
          setSheetVisible(true);
        }}
        activeOpacity={locked ? 1 : 0.85}
        disabled={locked}
      >
        <Text style={[styles.triggerText, { color: textColor }]}>{value}</Text>
        {!locked ? <Ionicons name="chevron-down" size={18} color={mutedColor} /> : null}
      </TouchableOpacity>
      {locked ? (
        <Text style={[styles.hint, { color: mutedColor }]}>
          Become a provider in Edit Info to publish service posts.
        </Text>
      ) : null}

      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: subtleBg }]} />
            <Text style={[styles.sheetTitle, { color: Colors.text }]}>Post type</Text>
            {OPTIONS.map((opt) => {
              const selected = value === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, { backgroundColor: selected ? Colors.primary + '12' : subtleBg }]}
                  onPress={() => {
                    
                    onChange(opt.value);
                    setSheetVisible(false);
                  }}
                >
                  <Text style={[styles.optionLabel, { color: Colors.text }]}>{opt.label}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={Colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[styles.cancel, { backgroundColor: subtleBg }]} onPress={() => setSheetVisible(false)}>
              <Text style={[styles.cancelText, { color: Colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: Typography.size.xs, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  triggerText: { fontSize: Typography.size.sm, fontWeight: '600' },
  hint: { fontSize: Typography.size.xs, fontWeight: '500', marginTop: 4, marginLeft: 2, lineHeight: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: Spacing.sm, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle: { fontSize: Typography.size.md, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.xs },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: 12 },
  optionLabel: { fontSize: Typography.size.sm, fontWeight: '600' },
  cancel: { marginTop: Spacing.sm, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: Typography.size.md, fontWeight: '700' },
});

export default NewPostTypePicker;
