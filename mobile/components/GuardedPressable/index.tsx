import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { useNavigationLock } from '../../hooks/useNavigationLock';

export type GuardedPressableProps = TouchableOpacityProps;

/**
 * Touchable that ignores presses while a guarded navigation is in flight.
 * Use on list rows, cards, and header actions that trigger navigation.
 */
export const GuardedPressable: React.FC<GuardedPressableProps> = ({
  onPress,
  disabled,
  ...props
}) => {
  const locked = useNavigationLock();

  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      disabled={disabled || locked || !onPress}
    />
  );
};

export default GuardedPressable;
