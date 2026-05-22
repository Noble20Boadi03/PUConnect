import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { getServiceOptionsByIds } from '../../lib/editInfoForm';
import { EditInfoServicesSheet } from '../EditInfo/EditInfoServicesSheet';

export interface NewPostHelpCategoryPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  screenBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  subtleBg: string;
  error?: string | null;
}

/** Campus service categories for request posts (non-providers). */
export const NewPostHelpCategoryPicker: React.FC<NewPostHelpCategoryPickerProps> = ({
  selectedIds,
  onChange,
  screenBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  subtleBg,
  error,
}) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const selected = getServiceOptionsByIds(selectedIds);

  const handleToggle = (serviceId: string) => {
    if (selectedIds.includes(serviceId)) {
      onChange(selectedIds.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedIds, serviceId]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: mutedColor }]}>Help category</Text>
      <Text style={[styles.hint, { color: error ? '#EF4444' : mutedColor }]}>
        {error ?? 'What kind of campus help are you looking for? Matches Explore categories.'}
      </Text>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: screenBg, borderColor: error ? '#EF4444' : borderColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSheetVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.triggerText, { color: selected.length > 0 ? textColor : mutedColor + '99' }]}
          numberOfLines={1}
        >
          {selected.length > 0
            ? `${selected.length} categor${selected.length === 1 ? 'y' : 'ies'} selected`
            : 'Select help category'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={mutedColor} />
      </TouchableOpacity>

      {selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map((service) => (
            <View
              key={service.id}
              style={[styles.chip, { backgroundColor: primaryColor + '14', borderColor: primaryColor + '40' }]}
            >
              <Text style={[styles.chipText, { color: primaryColor }]} numberOfLines={1}>
                {service.title}
              </Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChange(selectedIds.filter((id) => id !== service.id));
                }}
              >
                <Ionicons name="close-circle" size={16} color={primaryColor} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      <EditInfoServicesSheet
        visible={sheetVisible}
        selectedIds={selectedIds}
        onToggleService={handleToggle}
        onClose={() => setSheetVisible(false)}
        title="Help category"
        subtitle="Choose the campus service area that best matches your request."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: Typography.size.xs, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  hint: { fontSize: Typography.size.xs, fontWeight: '500', marginBottom: Spacing.sm, marginLeft: 2, lineHeight: 16 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  triggerText: { flex: 1, fontSize: Typography.size.sm, fontWeight: '500', marginRight: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: Spacing.sm + 2,
    paddingRight: Spacing.xs + 2,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipText: { fontSize: Typography.size.xs, fontWeight: '600', flexShrink: 1 },
});

export default NewPostHelpCategoryPicker;
