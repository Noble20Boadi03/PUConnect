import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControlProps,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor, usePostDetailChrome } from '../../hooks';
import { Spacing, Typography, CARD_SHADOW } from '../../constants';
import { formatPostPrice } from '../../lib';
import { getExploreCategoryFromPostTags, getExploreServicesForPost } from '../../lib/mapPostToExplore';
import { Button } from '../Button';
import { GuardedPressable } from '../GuardedPressable';
import { PostImageGallery } from './PostImageGallery';
import type { PostDetail } from '../../types';

const FOOTER_BODY = 60;
const OWNER_FOOTER_BODY = 132;

export interface PostDetailViewProps {
  post: PostDetail;
  onBack: () => void;
  onSendMessage?: () => void;
  onViewProvider?: (username: string) => void;
  /** When true, shows "You" as the author name and disables navigation to the profile. */
  isOwnPost?: boolean;
  /** When true, hides the author/provider block (e.g. opened from chat or owner profile). */
  hideAuthorProfile?: boolean;
  /** Creator view — hides author block and shows edit / hide / delete actions. */
  ownerView?: boolean;
  onEdit?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
  isHiding?: boolean;
  isDeleting?: boolean;
  /** Replaces the footer CTA with a back-to-chat action. */
  returnToChat?: boolean;
  onReturnToChat?: () => void;
  /** Service detail opened from chat request flow — primary CTA requests the service. */
  requestService?: boolean;
  onRequestService?: () => void;
  /** Disables the primary CTA button (e.g. user not eligible to respond) */
  actionDisabled?: boolean;
  /** Reason why action is disabled (shown below button if provided) */
  disabledReason?: string | null;
  hasExistingConversation?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onSendMessage,
  onViewProvider,
  isOwnPost = false,
  hideAuthorProfile = false,
  ownerView = false,
  onEdit,
  onHide,
  onDelete,
  isHiding = false,
  isDeleting = false,
  returnToChat = false,
  onReturnToChat,
  requestService = false,
  onRequestService,
  actionDisabled = false,
  disabledReason,
  hasExistingConversation = false,
  refreshControl,
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
  
  const exploreCategory = useMemo(() => getExploreCategoryFromPostTags(post.categoryTags), [post.categoryTags]);
  const exploreServices = useMemo(() => getExploreServicesForPost(post.categoryTags), [post.categoryTags]);

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

  const handleEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEdit?.();
  }, [onEdit]);

  const handleHide = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onHide?.();
  }, [onHide]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete?.();
  }, [onDelete]);

  const footerTitle = returnToChat
    ? 'Return to Chat'
    : requestService
      ? 'Request This Service'
      : hasExistingConversation
        ? 'Continue Chat'
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

  const footerBottom = insets.bottom;
  const footerHeight = ownerView ? OWNER_FOOTER_BODY : FOOTER_BODY;

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
          paddingBottom: footerHeight + footerBottom + Spacing.lg,
        }}
        refreshControl={refreshControl}
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

          {isService && exploreCategory ? (
            <View style={[styles.categorySection, { backgroundColor: subtleBg }]}>
              <View style={styles.categoryHeader}>
                <Ionicons 
                  name={exploreCategory.iconName} 
                  size={20} 
                  color={exploreCategory.accentColor} 
                />
                <Text style={[styles.categoryTitle, { color: Colors.text }]}>
                  {exploreCategory.title}
                </Text>
              </View>
            </View>
          ) : !isService && exploreServices.length > 0 ? (
            <View style={styles.servicesRow}>
              {exploreServices.map((service) => (
                <View key={service.id} style={[styles.servicePill, { backgroundColor: tagBg }]}>
                  <Text style={[styles.serviceText, { color: Colors.text }]}>
                    {service.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

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
              <GuardedPressable
                style={[
                  styles.personCard,
                  { backgroundColor: subtleBg },
                  !isDark && CARD_SHADOW,
                ]}
                onPress={isService && !isOwnPost ? handleViewProvider : undefined}
                activeOpacity={isService && !isOwnPost ? 0.85 : 1}
                disabled={!isService || isOwnPost}
                accessibilityRole={isService && !isOwnPost ? 'button' : undefined}
                accessibilityLabel={
                  isService && !isOwnPost ? `View ${post.author.fullName}'s profile` : undefined
                }
              >
                <View style={[styles.personAvatar, { backgroundColor: Colors.primary + '18' }]}>
                  {post.author.avatarUrl ? (
                    <Image
                      source={{ uri: post.author.avatarUrl }}
                      style={styles.personAvatarImage}
                      contentFit="cover"
                      transition={0}
                    />
                  ) : (
                    <Text style={[styles.personAvatarInitials, { color: Colors.primary }]}>
                {(() => {
                  const name = post.author.fullName || post.author.username || '';
                  const cleanedName = name.trim();
                  if (!cleanedName) return '??';
                  
                  const parts = cleanedName.split(/\s+/).filter(Boolean);
                  
                  if (parts.length === 1) {
                    return cleanedName.slice(0, 2).toUpperCase();
                  }
                  
                  return parts
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase();
                })()}
              </Text>
                  )}
                </View>
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: Colors.text }]}>
                    {isOwnPost ? 'You' : post.author.fullName}
                  </Text>
                  <Text style={[styles.personHandle, { color: Colors.icon }]}>
                    {post.author.username}
                  </Text>
                </View>
                {isService && !isOwnPost ? (
                  <Ionicons name="chevron-forward" size={20} color={Colors.icon} />
                ) : null}
              </GuardedPressable>

              {isService && post.author.skills && post.author.skills.length > 0 ? (
                <>
                  <Text style={[styles.skillsHeading, { color: Colors.icon }]}>
                    {post.author.skills.length === 1 ? 'Service' : 'Services'}
                  </Text>
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
        <GuardedPressable
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
        </GuardedPressable>
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
        {ownerView ? (
          <View style={styles.ownerActions}>
            <Button
              title="Edit Post"
              size="lg"
              onPress={handleEdit}
              leftIcon={<Ionicons name="create-outline" size={20} color="#FFFFFF" />}
            />
            <View style={styles.ownerSecondaryRow}>
              <GuardedPressable
                style={[styles.ownerSecondaryButton, { borderColor: Colors.primary }]}
                onPress={handleHide}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Hide post"
                isLoading={isHiding}
              >
                {!isHiding && (
                  <>
                    <Ionicons name="eye-off-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.ownerSecondaryLabel, { color: Colors.primary }]}>Hide</Text>
                  </>
                )}
              </GuardedPressable>
              <GuardedPressable
                style={[styles.ownerSecondaryButton, styles.ownerDeleteButton]}
                onPress={handleDelete}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Delete post"
                isLoading={isDeleting}
              >
                {!isDeleting && (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={[styles.ownerSecondaryLabel, styles.ownerDeleteLabel]}>Delete</Text>
                  </>
                )}
              </GuardedPressable>
            </View>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <Button
              title={footerTitle}
              size="lg"
              onPress={footerPress}
              leftIcon={<Ionicons name={footerIcon} size={20} color="#FFFFFF" />}
              disabled={actionDisabled}
            />
            {disabledReason ? (
              <Text style={[styles.disabledReason, { color: Colors.icon }]}>
                {disabledReason}
              </Text>
            ) : null}
          </View>
        )}
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
  categorySection: {
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  servicePill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  serviceText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  personAvatarImage: {
    width: '100%',
    height: '100%',
  },
  personAvatarInitials: {
    fontSize: 20,
    fontWeight: '800',
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
  ownerActions: {
    gap: Spacing.sm,
  },
  ownerSecondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ownerSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  ownerDeleteButton: {
    borderColor: '#EF4444',
  },
  ownerSecondaryLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold as any,
  },
  ownerDeleteLabel: {
    color: '#EF4444',
  },
  actionContainer: {
    gap: Spacing.sm,
  },
  disabledReason: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PostDetailView;
