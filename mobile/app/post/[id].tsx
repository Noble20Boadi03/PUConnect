import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { PostDetailView, PostDetailViewSkeleton } from '../../components/PostDetail';
import { Alert, ConfirmDialog } from '../../components';
import {
  buildChatHref,
  buildProviderProfileHref,
  getExploreCategoryFromPostTags,
} from '../../lib';
import { useAppRouter, useConfirmDialog } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useAuthStore, useProfileStore, usePostStore, useMarketStore, useServiceRequestsStore } from '../../store';
import { useChat } from '../../hooks/useChat';
import { getEditInfoServiceOptions } from '../../constants/editInfoServices';
import { postService } from '../../services';
import type { DbServiceRequest } from '../../types/core';

function isTruthyParam(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export default function PostDetailScreen() {
  const { id, fromProvider, fromChat, fromRequestService, fromOwner, forceNonOwner } = useLocalSearchParams<{
    id: string;
    fromProvider?: string;
    fromChat?: string;
    fromRequestService?: string;
    fromOwner?: string;
    forceNonOwner?: string;
  }>();
  const ownerView = isTruthyParam(fromOwner);
  const hideAuthorProfile =
    ownerView ||
    isTruthyParam(fromProvider) ||
    isTruthyParam(fromChat) ||
    isTruthyParam(fromRequestService);
  const returnToChat = isTruthyParam(fromChat) && !isTruthyParam(fromRequestService);
  const requestService = isTruthyParam(fromRequestService);
  const forceNonOwnerView = isTruthyParam(forceNonOwner);
  const router = useAppRouter();
  const user = useAuthStore((s) => s.user);
  const isProvider = useProfileStore((s) => s.isProvider);
  const providerServiceIds = useProfileStore((s) => s.providerServiceIds);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const { conversations, fetchConversations } = useChat();

  const { data: post, isLoading, isRefreshing, fetchPost, clearCache } = usePostStore();
  const { removePost, invalidateCache, trackPostView } = useMarketStore();
  const { fetchStatusForPost } = useServiceRequestsStore();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [activeServiceRequest, setActiveServiceRequest] = useState<DbServiceRequest | null>(null);

  const isOwnPost = useMemo(() => {
    if (!post || !user) return false;
    // `post.author.username` has an '@' prefix from mapping
    return post.author.username === `@${user.username}`;
  }, [post, user]);

  const effectiveOwnerView = forceNonOwnerView ? false : (ownerView || isOwnPost);

  const {
    showConfirm,
    confirmVisible,
    confirmOptions,
    handleConfirm,
    handleCancel,
  } = useConfirmDialog();

  const hasExistingConversation = useMemo(() => {
    if (!post) return false;
    return conversations.some(c => c.user.username === post.author.username);
  }, [post, conversations]);

  const onRefresh = useCallback(() => {
    if (typeof id === 'string') {
      clearCache();
      fetchPost(id, true);
    }
  }, [id, clearCache, fetchPost]);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchPost(id);
    }
    fetchConversations();
  }, [id, fetchPost, fetchConversations]);

  useEffect(() => {
    if (post && !isOwnPost) {
      trackPostView(post.id);
    }
  }, [post, isOwnPost, trackPostView]);

  useEffect(() => {
    async function loadServiceStatus() {
      if (post && !isOwnPost) {
        const status = await fetchStatusForPost(post.id);
        setActiveServiceRequest(status);
      }
    }
    loadServiceStatus();
  }, [post, isOwnPost, fetchStatusForPost]);

  // Check if user is eligible to respond to this request
  const eligibility = useMemo(() => {
    if (!post || post.tag !== 'Request') {
      return { canRespond: true, reason: null as string | null };
    }

    // Check if user is a provider
    if (!isProvider) {
      return {
        canRespond: false,
        reason: 'Become a provider to respond to requests',
      };
    }

    // Check category matching
    const requestCategory = getExploreCategoryFromPostTags(post.categoryTags);
    if (!requestCategory) {
      return { canRespond: false, reason: 'No category found for request' };
    }

    // Get provider's service categories
    const serviceOptions = getEditInfoServiceOptions();
    const providerCategories = new Set(
      providerServiceIds.map((serviceId) => {
        const service = serviceOptions.find((s) => s.id === serviceId);
        return service?.categoryId;
      }).filter(Boolean) as string[]
    );

    // Check if provider has any service in the request's category
    if (!providerCategories.has(requestCategory.id)) {
      return {
        canRespond: false,
        reason: `Your services don't match the "${requestCategory.title}" category`,
      };
    }

    return { canRespond: true, reason: null };
  }, [post, isProvider, providerServiceIds]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else if (effectiveOwnerView) {
      router.replace('/(tabs)/profile' as any);
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router, effectiveOwnerView]);

  const handleSendMessage = useCallback(async () => {
    if (!post) return;

    // Check eligibility for request posts
    if (post.tag === 'Request' && !eligibility.canRespond) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (!isProvider) {
        // Prompt to become a provider
        const confirmed = await showConfirm({
          title: 'Become a Provider',
          message: 'You need to set up your provider profile to respond to service requests on the marketplace.',
          confirmLabel: 'Set Up Profile',
          cancelLabel: 'Not Now',
          icon: 'person-add-outline',
        });

        if (confirmed) {
          router.push('/edit-info' as any);
        }
      } else {
        // Show category mismatch error
        setActionMessage(eligibility.reason);
        setTimeout(() => setActionMessage(null), 3000);
      }
      return;
    }

    // Proceed with sending message
    router.push(buildChatHref(post.author.username, post.id) as any);
  }, [post, router, eligibility, isProvider, showConfirm]);

  const handleReturnToChat = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (!post) return;
    router.replace(buildChatHref(post.author.username, post.id) as any);
  }, [post, router]);

  const handleRequestService = useCallback(() => {
    if (!post) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(buildChatHref(post.author.username, post.id) as any);
  }, [post, router]);

  const handleViewProvider = useCallback(
    (username: string) => {
      router.push(buildProviderProfileHref(username) as any);
    },
    [router]
  );

  const handleResumeService = useCallback((serviceRequestId: string) => {
    router.push(`/service-request/${serviceRequestId}` as any);
  }, [router]);

  const handleEdit = useCallback(() => {
    if (!post) return;
    const type = post.tag === 'Service' ? 'service' : 'request';
    router.push(`/new-post?editId=${post.id}&type=${type}` as any);
  }, [post, router]);

  const handleHide = useCallback(async () => {
    if (!post || isHiding) return;
    const confirmed = await showConfirm({
      title: 'Hide Post',
      message:
        'This post will be hidden from the market feed. You can unhide it later from your profile.',
      confirmLabel: 'Hide Post',
      cancelLabel: 'Cancel',
      icon: 'eye-off-outline',
    });
    if (!confirmed) return;
    setIsHiding(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionMessage('Post hidden from the market. It remains on your profile.');
    setTimeout(() => {
      setIsHiding(false);
      handleBack();
    }, 1200);
  }, [post, showConfirm, handleBack, isHiding]);

  const handleDelete = useCallback(async () => {
    if (!post || typeof id !== 'string' || isDeleting) return;
    const confirmed = await showConfirm({
      title: 'Delete Post',
      message: 'This will permanently remove the post from your profile and the market.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'trash-outline',
    });
    if (!confirmed) return;
    setIsDeleting(true);

    try {
      // Optimistic delete from market store
      removePost(id);
      invalidateCache();
      
      await postService.deletePost(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setActionMessage('Post deleted.');
      setTimeout(() => {
        handleBack();
      }, 900);
    } catch (error) {
      console.error('Error deleting post:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setActionMessage('Could not delete this post. Please try again.');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  }, [post, id, showConfirm, handleBack, isDeleting, removePost, invalidateCache]);

  if (isLoading) {
    return <PostDetailViewSkeleton />;
  }

  if (!post) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Post not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>
            {effectiveOwnerView ? 'Back to Profile' : 'Back to Market'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: screenBg }]}>
      {confirmOptions ? (
        <ConfirmDialog
          visible={confirmVisible}
          title={confirmOptions.title}
          message={confirmOptions.message}
          confirmLabel={confirmOptions.confirmLabel}
          cancelLabel={confirmOptions.cancelLabel}
          variant={confirmOptions.variant}
          icon={confirmOptions.icon}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null}

      {actionMessage ? (
        <View style={styles.actionAlertWrap} pointerEvents="none">
          <Alert type="success" message={actionMessage} />
        </View>
      ) : null}

      <PostDetailView
        post={post}
        onBack={handleBack}
        onSendMessage={handleSendMessage}
        onViewProvider={hideAuthorProfile ? undefined : handleViewProvider}
        isOwnPost={isOwnPost}
        hideAuthorProfile={hideAuthorProfile}
        ownerView={effectiveOwnerView}
        onEdit={handleEdit}
        onHide={handleHide}
        onDelete={handleDelete}
        isHiding={isHiding}
        isDeleting={isDeleting}
        returnToChat={returnToChat}
        onReturnToChat={handleReturnToChat}
        requestService={requestService}
        onRequestService={handleRequestService}
        actionDisabled={post?.tag === 'Request' && !eligibility.canRespond}
        disabledReason={post?.tag === 'Request' ? (eligibility.reason ?? undefined) : undefined}
        hasExistingConversation={hasExistingConversation}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        activeServiceRequest={activeServiceRequest}
        onResumeService={handleResumeService}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  actionAlertWrap: {
    position: 'absolute',
    top: Spacing.xl + 48,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 20,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notFoundTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notFoundBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});
