import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '../../hooks';

import { Spacing } from '../../constants';

const TAB_BAR_BASE_HEIGHT = 56; // Must match (tabs)/_layout.tsx Android base height

export interface MessagesSelectionActionBarProps {
  isVisible: boolean;
  onPin: () => void;
  onMute: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onMore: () => void;
}

export const MessagesSelectionActionBar: React.FC<MessagesSelectionActionBarProps> = ({
  isVisible,
  onPin,
  onMute,
  onDelete,
  onMarkRead,
  onMore,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';

  const tabBarBg = isDark ? '#111113' : '#FFFFFF';
  const tabBarBorder = isDark ? '#1E1E21' : '#F0F0F2';
  const barHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  const [mounted, setMounted] = useState(isVisible);
  const translateY = useRef(new Animated.Value(barHeight)).current;

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: barHeight,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [isVisible, barHeight, translateY]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: barHeight,
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.zones}>
        <View style={styles.zoneA}>
          <ActionButton icon="pin-outline" label="Pin" onPress={onPin} color={Colors.text} />
          <ActionButton icon="notifications-off-outline" label="Mute" onPress={onMute} color={Colors.text} />
          <ActionButton icon="trash-outline" label="Delete" onPress={onDelete} color={Colors.text} />
          <ActionButton icon="checkmark-done-outline" label="Mark read" onPress={onMarkRead} color={Colors.text} />
        </View>
        <View style={styles.zoneB}>
          <ActionButton icon="ellipsis-vertical" label="More" onPress={onMore} color={Colors.text} />
        </View>
      </View>
    </Animated.View>
  );
};

interface ActionButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.label, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  zones: {
    flex: 1,
    flexDirection: 'row',
  },
  zoneA: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  zoneB: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: Spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 60,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
