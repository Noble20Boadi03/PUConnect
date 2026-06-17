import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { isCurrentUserProvider, isCurrentUserRequester } from '../../lib';
import type { MarketPostTag, OfficialCompletionPhase } from '../../types';

const REQUEST_ACCENT = '#F59E0B';

export type ChatMenuAction =
  | 'browseServices'
  | 'officialService'
  | 'officialRequest'
  | 'cancelOfficialRequest'
  | 'withdrawOfficialResponse'
  | 'viewOfficialDetails'
  | 'requestOfficialCompletion'
  | 'reviewOfficialCompletion'
  | 'viewProviderProfile'
  | 'mute'
  | 'report'
  | 'notInterested'
  | 'cancel';

export interface ChatOptionsSheetProps {
  visible: boolean;
  showBrowseServices?: boolean;
  showViewProviderProfile?: boolean;
  /** Active official engagement — show manage actions instead of initiators. */
  officialEngagementActive?: boolean;
  officialEngagementCompleted?: boolean;
  postContext?: {
    postId: string;
    tag: MarketPostTag;
    authorId: string;
  };
  completionPhase?: OfficialCompletionPhase;
  currentUserId: string;
  serviceRequest?: {
    providerId: string;
    requesterId: string;
    status: string;
  } | null;
  isMuted?: boolean;
  onSelect: (action: ChatMenuAction) => void;
  onClose: () => void;
}

type MenuItem = {
  key: Exclude<ChatMenuAction, 'cancel'>;
  label: string;
  destructive?: boolean;
  accentColor?: string;
};

export const ChatOptionsSheet: React.FC<ChatOptionsSheetProps> = ({
  visible,
  showBrowseServices = false,
  showViewProviderProfile = false,
  officialEngagementActive = false,
  officialEngagementCompleted = false,
  postContext,
  completionPhase = 'none',
  currentUserId,
  serviceRequest,
  isMuted = false,
  onSelect,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const isUserProvider = isCurrentUserProvider(currentUserId, serviceRequest);
  const isUserRequester = isCurrentUserRequester(currentUserId, serviceRequest);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];

    if (officialEngagementActive || officialEngagementCompleted) {
      if (!officialEngagementCompleted && serviceRequest) {
        if (isUserRequester && serviceRequest.status === 'active') {
          items.push({
            key: 'cancelOfficialRequest',
            label: 'Cancel Official Request',
            destructive: true,
          });
        }
        if (isUserProvider && serviceRequest.status === 'active') {
          items.push({
            key: 'withdrawOfficialResponse',
            label: 'Withdraw Official Response',
            destructive: true,
          });
        }
        if (completionPhase === 'none' && isUserProvider && serviceRequest.status === 'active') {
          items.push({
            key: 'requestOfficialCompletion',
            label: 'Request Completion',
            accentColor: postContext?.tag === 'Request' ? REQUEST_ACCENT : Colors.primary,
          });
        }
        if (completionPhase === 'pending_review' && isUserRequester) {
          items.push({
            key: 'reviewOfficialCompletion',
            label: 'Review Service & Confirm',
            accentColor: postContext?.tag === 'Request' ? REQUEST_ACCENT : Colors.primary,
          });
        }
      }
      items.push({ key: 'viewOfficialDetails', label: 'View service status' });
    } else {
      if (postContext && postContext.tag === 'Service' && postContext.authorId !== currentUserId) {
        items.push({
          key: 'officialService',
          label: 'Request Service',
          accentColor: Colors.primary,
        });
      }
      if (postContext && postContext.tag === 'Request' && postContext.authorId !== currentUserId) {
        // TODO: Check user is provider via their profile if needed
        items.push({
          key: 'officialRequest',
          label: 'Submit Official Response',
          accentColor: REQUEST_ACCENT,
        });
      }
    }

    // Add Not Interested if there's a post context but no active service request
    if (postContext && !serviceRequest) {
      items.push({
        key: 'notInterested',
        label: 'Not Interested',
      });
    }

    if (showViewProviderProfile) {
      items.push({ key: 'viewProviderProfile', label: 'View Provider Profile' });
    }

    if (showBrowseServices) {
      items.push({ key: 'browseServices', label: 'Browse Services' });
    }
    items.push({ key: 'mute', label: isMuted ? 'Unmute' : 'Mute' });
    items.push({ key: 'report', label: 'Report', destructive: true });
    return items;
  }, [
    showBrowseServices,
    showViewProviderProfile,
    officialEngagementActive,
    officialEngagementCompleted,
    postContext,
    completionPhase,
    currentUserId,
    serviceRequest,
    isMuted,
    Colors.primary,
    isUserProvider,
    isUserRequester,
  ]);

  const handlePress = (action: ChatMenuAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'report') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    if (
      action === 'officialService' ||
      action === 'officialRequest' ||
      action === 'requestOfficialCompletion' ||
      action === 'reviewOfficialCompletion'
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (action === 'cancelOfficialRequest' || action === 'withdrawOfficialResponse') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onSelect(action);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuRow,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: subtleBg,
                },
              ]}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.menuLabel,
                  { color: item.destructive ? Colors.error : Colors.text },
                  item.accentColor && { color: item.accentColor, fontWeight: '800' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={() => handlePress('cancel')}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelLabel, { color: Colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  menuRow: {
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
  cancelRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ChatOptionsSheet;
