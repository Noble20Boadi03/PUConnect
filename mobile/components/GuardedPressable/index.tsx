import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  ActivityIndicator,
} from 'react-native';

import { useNavigationLock } from '../../hooks/useNavigationLock';

export type GuardedPressableProps = TouchableOpacityProps & {
  isLoading?: boolean;
};

/**
 * Touchable that ignores presses while a guarded navigation is in flight.
 * Use on list rows, cards, and header actions that trigger navigation.
 */
export const GuardedPressable: React.FC<GuardedPressableProps> = ({
  onPress,
  disabled,
  isLoading = false,
  children,
  ...props
}) => {
  const locked = useNavigationLock();

  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      disabled={disabled || locked || !onPress || isLoading}
    >
      {isLoading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#EF4444" />
        </View>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default GuardedPressable;
