import { useCallback, useRef, useState } from 'react';
import type { ConfirmDialogIcon, ConfirmDialogVariant } from '../components/ConfirmDialog/types';

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: ConfirmDialogIcon;
};

/**
 * Promise-based confirmation flow using the shared ConfirmDialog component.
 */
export function useConfirmDialog() {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const showConfirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
      setVisible(true);
    });
  }, []);

  const finish = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => finish(true), [finish]);
  const handleCancel = useCallback(() => finish(false), [finish]);

  return {
    showConfirm,
    confirmVisible: visible,
    confirmOptions: options,
    handleConfirm,
    handleCancel,
  };
}

export default useConfirmDialog;
