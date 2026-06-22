import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../constants';

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface AdminFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  colors: { text: string; muted: string; primary: string; card: string; bg: string; border: string };
  onApply: () => void;
  onReset: () => void;
}

export function AdminFilterSheet({
  visible,
  onClose,
  groups,
  colors,
  onApply,
  onReset,
}: AdminFilterSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            {groups.map((group) => (
              <View key={group.id} style={styles.group}>
                <Text style={[styles.groupLabel, { color: colors.muted }]}>{group.label}</Text>
                <View style={styles.chips}>
                  {group.options.map((opt) => {
                    const active = group.value === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => group.onChange(opt.key)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? colors.primary : colors.bg,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onReset} style={[styles.btn, { borderColor: colors.border }]}>
              <Text style={{ color: colors.muted, fontWeight: '600' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onApply} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700' },
  body: { paddingHorizontal: Spacing.md },
  group: { marginBottom: Spacing.lg },
  groupLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
