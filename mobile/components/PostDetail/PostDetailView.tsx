import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor, usePostDetailChrome } from '../../hooks';
import { Spacing, Typography, CARD_SHADOW } from '../../constants';
import { formatPostPrice } from '../../lib';
import { Button } from '../Button';
import { PostImageGallery } from './PostImageGallery';
import type { PostDetail } from '../../types';

const FOOTER_BODY = 60;

export interface PostDetailViewProps {
  post: PostDetail;
  onBack: () => void;
  onSendMessage?: () => void;
  onViewProvider?: (username: string) => void;
  /** When true, hides the author/provider block (e.g. opened from their profile). */
  hideAuthorProfile?: boolean;
  /** Replaces the footer CTA with a back-to-chat action. */
  returnToChat?: boolean;
  onReturnToChat?: () => void;
  /** Service detail opened from chat request flow — primary CTA requests the service. */
  requestService?: boolean;
  onRequestService?: () => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onSendMessage,
  onViewProvider,
  hideAuthorProfile = false,
  returnToChat = false,
  onReturnToChat,
  requestService = false,
  onRequestService,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const tagBg = isDark ? '#27272A' : '#F4F4F5';
  const divider = isDark ? '#30363D' : '#E1E4E8';

  const isService = post.tag === 'Service';
  const accentColor = isService ? Colors.primary : '#F59E0B';
  const badgeBg = isService ? Colors.primary + '22' : '#F59E0B22';
  const badgeColor = isService ? Colors.primary : '#F59E0B';
  const amountLabel = formatPostPrice(post.price);

  const copy = isService
    ? {
        amountTitle: 'Price',
        amountIcon: 'pricetag' as const,
        aboutTitle: 'About This Service',
        personTitle: 'About The Provider',
        cta: 'Send Message',
      }
    : {
        amountTitle: 'Budget',
        amountIcon: 'wallet-outline' as const,
        aboutTitle: 'About This Request',
        personTitle: 'Posted By',
        cta: 'Respond to Request',
      };
  const { chrome, updateFromScroll } = usePostDetailChrome();
  const isOverGallery = chrome.phase === 'gallery';

  const handleSendMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendMessage?.();
  }, [onSendMessage]);

  const handleReturnToChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReturnToChat?.();
  }, [onReturnToChat]);

  const handleRequestService = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRequestService?.();
  }, [onRequestService]);

  const footerTitle = returnToChat
    ? 'Return to Chat'
    : requestService
      ? 'Request This Service'
      : copy.cta;
  const footerIcon = returnToChat
    ? ('arrow-back-circle-outline' as const)
    : requestService
      ? ('checkmark-circle-outline' as const)
      : isService
        ? ('chatbubble-outline' as const)
        : ('hand-right-outline' as const);
  const footerPress = returnToChat
    ? handleReturnToChat
    : requestService
      ? handleRequestService
      : handleSendMessage;

  const handleViewProvider = useCallback(() => {
    if (!isService) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewProvider?.(post.author.username);
  }, [isService, onViewProvider, post.author.username]);

  const footerBottom = Math.max(insets.bottom, Spacing.sm);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateFromScroll(e.nativeEvent.contentOffset.y);
    },
    [updateFromScroll]
  );

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
      <StatusBar style={chrome.statusBarStyle} animated translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: FOOTER_BODY + footerBottom + Spacing.lg,
        }}
      >
        <PostImageGallery
          images={post.images}
          recyclingKeyPrefix={`post-${post.id}`}
          screenBg={screenBg}
          topInset={insets.top}
        />

        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{post.tag}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.icon} />
              <Text style={[styles.date, { color: Colors.icon }]}>{post.postedDate}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: Colors.text }]}>{post.title}</Text>

          <View style={styles.categoryRow}>
            {post.categoryTags.map((tag) => (
              <View key={tag} style={[styles.categoryPill, { backgroundColor: tagBg }]}>
                <Text style={[styles.categoryText, { color: Colors.text }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.amountCard, { backgroundColor: subtleBg }]}>
            <View style={[styles.amountIconWrap, { backgroundColor: accentColor + '22' }]}>
              <Ionicons name={copy.amountIcon} size={18} color={accentColor} />
            </View>
            <View style={styles.amountTextBlock}>
              <Text style={[styles.amountTitle, { color: Colors.icon }]}>{copy.amountTitle}</Text>
              <Text style={[styles.amountValue, { color: accentColor }]}>{amountLabel}</Text>
              {!isService ? (
                <Text style={[styles.amountHint, { color: Colors.icon }]}>
                  What the poster is willing to pay
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          <Text style={[styles.sectionTitle, { color: Colors.text }]}>{copy.aboutTitle}</Text>
          <Text style={[styles.body, { color: Colors.icon }]}>{post.fullDescription}</Text>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Tags</Text>
          <View style={styles.hashtagWrap}>
            {post.hashtags.map((tag) => (
              <View
                key={tag}
                style={[styles.hashtagPill, { backgroundColor: accentColor + '14' }]}
              >
                <Text style={[styles.hashtagText, { color: accentColor }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {!hideAuthorProfile ? (
            <>
              <View style={[styles.divider, { backgroundColor: divider }]} />

              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{copy.personTitle}</Text>
              <TouchableOpacity
                style={[
                  styles.personCard,
                  { backgroundColor: subtleBg },
                  !isDark && CARD_SHADOW,
                ]}
                onPress={isService ? handleViewProvider : undefined}
                activeOpacity={isService ? 0.85 : 1}
                disabled={!isService}
                accessibilityRole={isService ? 'button' : undefined}
                accessibilityLabel={
                  isService ? `View ${post.author.fullName}'s profile` : undefined
                }
              >
                <Image
                  source={{ uri: post.author.avatarUrl }}
                  style={styles.personAvatar}
                  contentFit="cover"
                  transition={0}
                />
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: Colors.text }]}>
                    {post.author.fullName}
                  </Text>
                  <Text style={[styles.personHandle, { color: Colors.icon }]}>
                    {post.author.username}
                  </Text>
                </View>
                {isService ? (
                  <Ionicons name="chevron-forward" size={20} color={Colors.icon} />
                ) : null}
              </TouchableOpacity>

              {isService && post.author.skills && post.author.skills.length > 0 ? (
                <>
                  <Text style={[styles.skillsHeading, { color: Colors.icon }]}>Skills</Text>
                  <View style={styles.skillsWrap}>
                    {post.author.skills.map((skill) => (
                      <View key={skill} style={[styles.skillPill, { backgroundColor: tagBg }]}>
                        <Text style={[styles.skillText, { color: Colors.text }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + Spacing.xs, paddingHorizontal: Spacing.lg },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            styles.iconButton,
            isOverGallery
              ? styles.iconButtonOnGallery
              : { backgroundColor: subtleBg },
          ]}
          onPress={onBack}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={isOverGallery ? '#FFFFFF' : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: cardBg,
            borderTopColor: divider,
            paddingBottom: footerBottom,
          },
        ]}
      >
        <Button
          title={footerTitle}
          size="lg"
          onPress={footerPress}
          leftIcon={<Ionicons name={footerIcon} size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonOnGallery: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  contentCard: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  date: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.lg,
  },
  amountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountTextBlock: {
    flex: 1,
  },
  amountTitle: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
  },
  amountHint: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  hashtagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hashtagPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
  },
  hashtagText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  personHandle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  skillsHeading: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  skillText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm + 4,
    borderTopWidth: 1,
    zIndex: 10,
  },
});

export default PostDetailView;
