import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

interface KeyboardLayoutProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardVerticalOffset?: number;
}

/**
 * A reusable layout component that handles keyboard avoidance and dismisses
 * the keyboard when tapping outside of input fields.
 */
export const KeyboardLayout: React.FC<KeyboardLayoutProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  ...scrollViewProps
}) => {
  const headerHeight = useHeaderHeight();
  const offset = keyboardVerticalOffset ?? (Platform.OS === 'ios' ? headerHeight : 0);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
});
