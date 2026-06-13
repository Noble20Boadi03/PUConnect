import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KeyboardLayout } from '../KeyboardLayout';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { EditInfoField } from '../EditInfo/EditInfoField';
import { Spacing, Typography } from '../../constants';
import { useThemeColor, useAppRouter } from '../../hooks';
import { useProfileStore } from '../../store';
import { pruneTagsForServices } from '../../lib/editInfoForm';
import {
  buildPostPriceFromForm,
  getNewPostDescriptionPlaceholder,
  validateNewPostForm,
} from '../../lib/newPostForm';
import { parsePostPrice } from '../../lib/mapDbPost';
import { postService } from '../../services';
import { NewPostTypePicker } from './NewPostTypePicker';
import { NewPostPriceSection } from './NewPostPriceSection';
import { NewPostImageUploader } from './NewPostImageUploader';
import { NewPostHelpCategoryPicker } from './NewPostHelpCategoryPicker';
import { NewPostTagsSection } from './NewPostTagsSection';
import type { NewPostPriceKind, NewPostSearchParams, NewPostType } from '../../types/newPost';

type FocusField = 'title' | 'description' | null;

function resolveInitialPostType(
  param: NewPostSearchParams['type'],
  isProvider: boolean
): NewPostType {
  if (!isProvider) return 'Request';
  if (param === 'service') return 'Service';
  if (param === 'request') return 'Request';
  return 'Request';
}

export interface NewPostViewProps {
  onPublished?: () => void;
}

export const NewPostView: React.FC<NewPostViewProps> = ({ onPublished }) => {
  const params = useLocalSearchParams() as NewPostSearchParams;
  const router = useAppRouter();
  const isEditing = typeof params.editId === 'string' && params.editId.length > 0;
  const isProvider = useProfileStore((s) => s.isProvider);
  const providerServiceIds = useProfileStore((s) => s.providerServiceIds);
  const providerTags = useProfileStore((s) => s.providerTags);

  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const [postType, setPostType] = useState<NewPostType>(() =>
    resolveInitialPostType(params.type, isProvider)
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceKind, setPriceKind] = useState<NewPostPriceKind>('fixed');
  const [fixedAmount, setFixedAmount] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [helpCategoryIds, setHelpCategoryIds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [helpCategoryError, setHelpCategoryError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || typeof params.editId !== 'string') return;

    let cancelled = false;

    const loadPost = async () => {
      try {
        const data = await postService.getPostById(params.editId!);
        if (cancelled) return;

        const price = parsePostPrice(data.price);
        setPostType(data.tag);
        setTitle(data.title);
        setDescription(data.description);
        setImageUris(data.images ?? []);
        setSelectedTags(data.hashtags ?? []);

        if (price.kind === 'fixed') {
          setPriceKind('fixed');
          setFixedAmount(String(price.amount));
        } else if (price.kind === 'range') {
          setPriceKind('range');
          setRangeMin(String(price.min));
          setRangeMax(String(price.max));
        } else {
          setPriceKind('negotiated');
        }
      } catch (error) {
        console.error('Error loading post for edit:', error);
        setPublishMessage('Could not load this post for editing.');
      } finally {
        if (!cancelled) {
          setIsLoadingPost(false);
        }
      }
    };

    void loadPost();
    return () => {
      cancelled = true;
    };
  }, [isEditing, params.editId]);

  useEffect(() => {
    if (!isProvider && postType === 'Service') {
      setPostType('Request');
    }
  }, [isProvider, postType]);

  const handlePostTypeChange = useCallback(
    (next: NewPostType) => {
      setPostType(next);
      setSelectedTags([]);
      if (next === 'Request') {
        setImagesError(null);
      }
      if (next === 'Service') {
        setHelpCategoryIds([]);
        setHelpCategoryError(null);
      }
    },
    []
  );

  const handleHelpCategoriesChange = useCallback((ids: string[]) => {
    setHelpCategoryIds(ids);
    setHelpCategoryError(null);
    setSelectedTags((prev) => pruneTagsForServices(prev, ids));
  }, []);

  const handlePublish = useCallback(async () => {
    const validation = validateNewPostForm({
      title,
      description,
      postType,
      priceKind,
      fixedAmount,
      rangeMin,
      rangeMax,
      imageUris,
      isProvider,
      providerTagCount: providerTags.length,
      helpCategoryIds,
    });

    if (!validation.valid) {
      setPublishMessage(validation.message ?? 'Please fix the form and try again.');
      if (validation.message?.includes('image')) setImagesError(validation.message);
      if (validation.message?.includes('help category')) setHelpCategoryError(validation.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setImagesError(null);
    setHelpCategoryError(null);
    setIsPublishing(true);
    setPublishMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      tag: postType,
      price: buildPostPriceFromForm({ priceKind, fixedAmount, rangeMin, rangeMax }),
      images: imageUris,
      hashtags: selectedTags,
    };

    try {
      if (isEditing && typeof params.editId === 'string') {
        await postService.updatePost(params.editId, payload);
        setPublishMessage('Your post was updated.');
      } else {
        await postService.createPost(payload);
        setPublishMessage('Your post was published.');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPublished?.();
      setTimeout(() => {
        router.replace('/(tabs)/profile' as any);
      }, 900);
    } catch (error) {
      console.error('Error publishing post:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPublishMessage('Could not publish your post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  }, [
    title,
    description,
    postType,
    priceKind,
    fixedAmount,
    rangeMin,
    rangeMax,
    imageUris,
    isProvider,
    providerTags.length,
    helpCategoryIds,
    selectedTags,
    isEditing,
    params.editId,
    onPublished,
    router,
  ]);

  const showHelpCategory = postType === 'Request';
  const showTags = (postType === 'Service' && isProvider) || helpCategoryIds.length > 0;

  if (isLoadingPost) {
    return (
      <View style={styles.loadingState}>
        <Text style={[styles.loadingText, { color: Colors.icon }]}>Loading post…</Text>
      </View>
    );
  }

  return (
    <KeyboardLayout contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <NewPostTypePicker
          value={postType}
          onChange={handlePostTypeChange}
          locked={!isProvider}
          screenBg={screenBg}
          borderColor={Colors.border}
          textColor={Colors.text}
          mutedColor={Colors.icon}
        />

        <EditInfoField
          label="Title"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'title'}
          onFocusChange={(f) => setFocusedField(f ? 'title' : null)}
          value={title}
          onChangeText={setTitle}
          placeholder={postType === 'Service' ? 'e.g. Calculus tutoring sessions' : 'e.g. Need help with portfolio site'}
          returnKeyType="next"
        />

        <NewPostPriceSection
          postType={postType}
          priceKind={priceKind}
          onPriceKindChange={setPriceKind}
          fixedAmount={fixedAmount}
          onFixedAmountChange={setFixedAmount}
          rangeMin={rangeMin}
          onRangeMinChange={setRangeMin}
          rangeMax={rangeMax}
          onRangeMaxChange={setRangeMax}
          screenBg={screenBg}
          borderColor={Colors.border}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
        />

        <NewPostImageUploader
          postType={postType}
          imageUris={imageUris}
          onChange={(uris) => {
            setImageUris(uris);
            setImagesError(null);
          }}
          screenBg={screenBg}
          borderColor={Colors.border}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          error={imagesError}
        />

        <EditInfoField
          label="Description"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'description'}
          onFocusChange={(f) => setFocusedField(f ? 'description' : null)}
          value={description}
          onChangeText={setDescription}
          placeholder={getNewPostDescriptionPlaceholder(postType)}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: Colors.text }]}>Discovery</Text>

        {showHelpCategory ? (
          <NewPostHelpCategoryPicker
            selectedIds={helpCategoryIds}
            onChange={handleHelpCategoriesChange}
            screenBg={screenBg}
            borderColor={Colors.border}
            textColor={Colors.text}
            mutedColor={Colors.icon}
            primaryColor={Colors.primary}
            subtleBg={subtleBg}
            error={helpCategoryError}
          />
        ) : null}

        {showTags ? (
          <NewPostTagsSection
            postType={postType}
            isProvider={isProvider}
            providerServiceIds={providerServiceIds}
            helpCategoryIds={helpCategoryIds}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            textColor={Colors.text}
            mutedColor={Colors.icon}
            primaryColor={Colors.primary}
            subtleBg={subtleBg}
            borderColor={Colors.border}
          />
        ) : null}
      </View>

      {publishMessage ? (
        <Alert
          type={publishMessage.includes('fix') || publishMessage.includes('Add') || publishMessage.includes('Enter') || publishMessage.includes('Choose') || publishMessage.includes('need') ? 'error' : 'success'}
          message={publishMessage}
          dismissible
          onDismiss={() => setPublishMessage(null)}
        />
      ) : null}

      <Button
        title={isEditing ? 'Save changes' : 'Publish post'}
        variant="primary"
        size="md"
        onPress={handlePublish}
        isLoading={isPublishing}
        disabled={isPublishing}
        style={styles.publishButton}
      />
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl + 8,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  publishButton: {
    width: '100%',
    borderRadius: 12,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
});

export default NewPostView;
