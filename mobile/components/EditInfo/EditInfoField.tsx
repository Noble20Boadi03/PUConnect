import React from 'react';
import { StyleSheet, View, Text, TextInput, TextInputProps } from 'react-native';
import { Spacing, Typography } from '../../constants';

export interface EditInfoFieldProps extends TextInputProps {
  label: string;
  screenBg: string;
  borderColor: string;
  focusBorderColor: string;
  textColor: string;
  mutedColor: string;
  focused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  hint?: string;
  hintIsError?: boolean;
}

export const EditInfoField: React.FC<EditInfoFieldProps> = ({
  label,
  screenBg,
  borderColor,
  focusBorderColor,
  textColor,
  mutedColor,
  focused = false,
  onFocusChange,
  hint,
  hintIsError,
  ...inputProps
}) => (
  <View style={styles.wrapper}>
    <Text style={[styles.label, { color: mutedColor }]}>{label}</Text>
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: screenBg,
          borderColor: focused ? focusBorderColor : borderColor,
        },
        inputProps.multiline && styles.inputContainerMultiline,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          { color: textColor },
          inputProps.multiline && styles.inputMultiline,
        ]}
        placeholderTextColor={mutedColor + '80'}
        onFocus={(e) => {
          onFocusChange?.(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          onFocusChange?.(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
      />
    </View>
    {hint ? (
      <Text style={[styles.hint, { color: hintIsError ? '#EF4444' : mutedColor }]}>{hint}</Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 112,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: Typography.size.sm,
    height: '100%',
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
    lineHeight: 16,
  },
});

export default EditInfoField;
