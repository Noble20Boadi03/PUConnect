import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type ConfirmDialogVariant = 'default' | 'destructive';

export type ConfirmDialogIcon = ComponentProps<typeof Ionicons>['name'];

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: ConfirmDialogIcon;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
