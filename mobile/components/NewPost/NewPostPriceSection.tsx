import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { NEW_POST_PRICE_OPTIONS } from '../../lib/newPostForm';
import { useThemeColor } from '../../hooks';
import { EditInfoField } from '../EditInfo/EditInfoField';
import type { NewPostPriceKind, NewPostType } from '../../types/newPost';
import { getPriceSectionTitle } from '../../lib/newPostForm';

export interface NewPostPriceSectionProps {
  postType: NewPostType;
  priceKind: NewPostPriceKind;
  onPriceKindChange: (kind: NewPostPriceKind) => void;
  fixedAmount: string;
  onFixedAmountChange: (v: string) => void;
  rangeMin: string;
  onRangeMinChange: (v: string) => void;
  rangeMax: string;
  onRangeMaxChange: (v: string) => void;
  screenBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
}

export const NewPostPriceSection: React.FC<NewPostPriceSectionProps> = ({
  postType,
  priceKind,
  onPriceKindChange,
  fixedAmount,
  onFixedAmountChange,
  rangeMin,
  onRangeMinChange,
  rangeMax,
  onRangeMaxChange,
  screenBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const [sheetVisible, setSheetVisible] = useState(false);
  const [focused, setFocused] = useState<'fixed' | 'min' | 'max' | null>(null);

  const selectedLabel = NEW_POST_PRICE_OPTIONS.find((o) => o.kind === priceKind)?.label ?? 'Fixed';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{getPriceSectionTitle(postType)}</Text>

      <Text style={[styles.label, { color: mutedColor }]}>Pricing type</Text>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: screenBg, borderColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSheetVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.triggerText, { color: textColor }]}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={18} color={mutedColor} />
      </TouchableOpacity>

      {priceKind === 'fixed' ? (
        <EditInfoField
          label={postType === 'Service' ? 'Price (USD)' : 'Budget (USD)'}
          screenBg={screenBg}
          borderColor={borderColor}
          focusBorderColor={primaryColor}
          textColor={textColor}
          mutedColor={mutedColor}
          focused={focused === 'fixed'}
          onFocusChange={(f) => setFocused(f ? 'fixed' : null)}
          value={fixedAmount}
          onChangeText={onFixedAmountChange}
          placeholder="e.g. 50"
          keyboardType="decimal-pad"
        />
      ) : null}

      {priceKind === 'range' ? (
        <View style={styles.rangeRow}>
          <View style={styles.rangeField}>
            <EditInfoField
              label="Minimum"
              screenBg={screenBg}
              borderColor={borderColor}
              focusBorderColor={primaryColor}
              textColor={textColor}
              mutedColor={mutedColor}
              focused={focused === 'min'}
              onFocusChange={(f) => setFocused(f ? 'min' : null)}
              value={rangeMin}
              onChangeText={onRangeMinChange}
              placeholder="20"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.rangeField}>
            <EditInfoField
              label="Maximum"
              screenBg={screenBg}
              borderColor={borderColor}
              focusBorderColor={primaryColor}
              textColor={textColor}
              mutedColor={mutedColor}
              focused={focused === 'max'}
              onFocusChange={(f) => setFocused(f ? 'max' : null)}
              value={rangeMax}
              onChangeText={onRangeMaxChange}
              placeholder="30"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      ) : null}

      {priceKind === 'negotiated' ? (
        <Text style={[styles.negotiatedHint, { color: mutedColor }]}>
          Peers will see “On Request” on your card — discuss details in chat.
        </Text>
      ) : null}

      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: subtleBg }]} />
            <Text style={[styles.sheetTitle, { color: Colors.text }]}>Pricing type</Text>
            {NEW_POST_PRICE_OPTIONS.map((opt) => {
              const selected = priceKind === opt.kind;
              return (
                <TouchableOpacity
                  key={opt.kind}
                  style={[styles.option, { backgroundColor: selected ? Colors.primary + '12' : subtleBg }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPriceKindChange(opt.kind);
                    setSheetVisible(false);
                  }}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: Colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.optionHint, { color: Colors.icon }]}>{opt.hint}</Text>
                  </View>
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
  sectionTitle: { fontSize: Typography.size.md, fontWeight: '700', marginBottom: Spacing.sm },
  label: { fontSize: Typography.size.xs, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  triggerText: { fontSize: Typography.size.sm, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', gap: Spacing.sm },
  rangeField: { flex: 1 },
  negotiatedHint: { fontSize: Typography.size.xs, fontWeight: '500', lineHeight: 18, marginLeft: 2 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: Spacing.sm, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle: { fontSize: Typography.size.md, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.xs },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: 12 },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: Typography.size.sm, fontWeight: '700' },
  optionHint: { fontSize: Typography.size.xs, fontWeight: '500' },
  cancel: { marginTop: Spacing.sm, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: Typography.size.md, fontWeight: '700' },
});

export default NewPostPriceSection;
