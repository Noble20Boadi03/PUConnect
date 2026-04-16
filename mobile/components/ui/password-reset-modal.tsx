import React, { useState, useEffect } from 'react';
import { ActionModal } from './action-modal';
import { AnimatedInput } from './animated-input';

interface PasswordResetModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function PasswordResetModal({ isVisible, onClose, initialEmail = '' }: PasswordResetModalProps) {
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState(initialEmail);

  // Sync with initialEmail when modal opens
  useEffect(() => {
    if (isVisible) {
      setResetEmail(initialEmail);
    }
  }, [isVisible, initialEmail]);

  const handleResetPassword = () => {
    if (!resetEmail.trim()) return;
    // In a real app, this would call an API
    setIsResetSent(true);
  };

  const handleClose = () => {
    onClose();
    // Delay resetting internal state to allow exit animation to complete
    setTimeout(() => {
      setIsResetSent(false);
      setResetEmail('');
    }, 400);
  };

  if (isResetSent) {
    return (
      <ActionModal
        visible={isVisible}
        onRequestClose={handleClose}
        iconName="check-circle-outline"
        title="Link Sent"
        subtitle={`If ${resetEmail || 'that email'} matches an account, we've sent a reset link to it.`}
        primaryButtonTitle="OK"
        onPrimaryPress={handleClose}
      />
    );
  }

  return (
    <ActionModal
      visible={isVisible}
      onRequestClose={handleClose}
      iconName="email-fast-outline"
      title="Reset Password"
      subtitle="Enter your university email address. We'll send you a secure link to create a new password."
      primaryButtonTitle="Send Reset Link"
      onPrimaryPress={handleResetPassword}
      secondaryButtonTitle="Cancel"
      onSecondaryPress={handleClose}
    >
      <AnimatedInput
        placeholder="Email"
        value={resetEmail}
        onChangeText={setResetEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoFocus
      />
    </ActionModal>
  );
}
