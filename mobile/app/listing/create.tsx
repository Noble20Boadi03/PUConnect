import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useAppAlert } from '@/context/alert-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { ListingType } from '@/types';
import { useResponsive } from '@/hooks/use-responsive';
import * as ImagePicker from 'expo-image-picker';

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Business / Economics',
  'Languages',
  'Literature',
  'Other'
];

export default function CreateListingScreen() {
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = typeof params.editId === 'string' ? params.editId : params.editId?.[0];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { token, user } = useAuth();
  const { showAlert } = useAppAlert();
  const canOffer = user?.canOfferServices === true;
  const { horizontalPadding } = useResponsive();

  const [loading, setLoading] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<ListingType>('service_request');
  const [categoryTitle, setCategoryTitle] = useState(CAMPUS_CATEGORIES[0]?.title ?? '');
  const [subcategoryTitle, setSubcategoryTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = useCallback(async () => {
    if (!editId || !token) return;
    try {
      const listing = await api.getListing(editId);
      setTitle(listing.title);
      setDescription(listing.description ?? '');
      setPrice(String(listing.price ?? listing.budget ?? ''));
      const offerNeedsProvider = listing.type === 'service_offer' && user?.canOfferServices !== true;
      if (offerNeedsProvider) {
        showAlert({
          title: 'Provider status required',
          subtitle: 'This listing is a service offer. Complete your provider profile to keep editing it as an offer.',
          severity: 'warning'
        });
      }
      setListingType(offerNeedsProvider ? 'service_request' : listing.type);
      setCategoryTitle(listing.category);
      setSubcategoryTitle(listing.subcategory ?? '');
      if (listing.media_url) setMediaUri(listing.media_url);
      if (listing.tags) {
        const foundSub = SUBJECT_OPTIONS.find(so => listing.tags!.includes(so.toLowerCase()));
        if (foundSub) {
          setSubject(foundSub);
        } else if (listing.subcategory?.toLowerCase().includes('tutoring') || listing.subcategory?.toLowerCase().includes('subject')) {
          const customSubTag = listing.tags.find(t => !title.toLowerCase().includes(t));
          if (customSubTag) {
            setSubject('Other');
            setCustomSubject(customSubTag);
          }
        }
      }
    } catch {
      showAlert({
        title: 'Error',
        subtitle: 'Could not load listing.',
        severity: 'error',
        onPrimaryPress: () => router.back()
      });
    } finally {
      setLoading(false);
    }
  }, [editId, token, router, user?.canOfferServices, showAlert]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canOffer && listingType === 'service_offer') {
      setListingType('service_request');
    }
  }, [canOffer, listingType]);

  useEffect(() => {
    const currentCat = CAMPUS_CATEGORIES.find((c) => c.title === categoryTitle);
    if (currentCat) {
      const allSubtitles = currentCat.groups.flatMap(g => g.items.map(i => i.title));
      if (!allSubtitles.includes(subcategoryTitle)) {
        setSubcategoryTitle('');
      }
    }
  }, [categoryTitle]);

  const pickListingImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const uploadListingImage = async (): Promise<string | null> => {
    if (!mediaUri || !mediaUri.startsWith('file://') || !user?.id) return mediaUri;
    setUploadingImage(true);
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const response = await fetch(mediaUri);
      const fileBlob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('listing-media')
        .upload(fileName, fileBlob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('listing-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async () => {
    if (!token) {
      showAlert({
        title: 'Sign in required',
        subtitle: 'Please sign in to post a listing.',
        severity: 'warning',
        primaryButtonTitle: 'Sign in',
        onPrimaryPress: () => router.push('/login')
      });
      return;
    }
    if (listingType === 'service_offer' && !canOffer) {
      showAlert({
        title: 'Provider upgrade required',
        subtitle: 'Complete your professional profile (skills and campus details) to post a service offer, or post a request for help instead.',
        severity: 'info',
        primaryButtonTitle: 'Post a request',
        onPrimaryPress: () => setListingType('service_request'),
        secondaryButtonTitle: 'Upgrade profile',
        onSecondaryPress: () => router.push('/(tabs)/onboarding')
      });
      return;
    }

    const p = parseFloat(price.replace(/,/g, ''));
    if (!title.trim() || !description.trim() || Number.isNaN(p) || p < 0) {
      showAlert({ title: 'Validation', subtitle: 'Please enter title, description, and a valid price.', severity: 'warning' });
      return;
    }
    const cat = CAMPUS_CATEGORIES.find((c) => c.title === categoryTitle) ?? CAMPUS_CATEGORIES[0];
    const sub = subcategoryTitle || (cat.groups[0]?.items[0]?.title ?? 'General');

    if (!subcategoryTitle) {
      showAlert({ title: 'Validation', subtitle: 'Please select a subcategory.', severity: 'warning' });
      return;
    }

    const baseTags = title.split(/\s+/).slice(0, 5).map((s) => s.toLowerCase());
    const needsSubject = sub.toLowerCase().includes('tutoring') || sub.toLowerCase().includes('subject');
    if (needsSubject) {
      const selectedSubject = subject === 'Other' ? customSubject.trim() : subject;
      if (!selectedSubject) {
        showAlert({ title: 'Validation', subtitle: 'Please specify the subject.', severity: 'warning' });
        return;
      }
      if (!baseTags.includes(selectedSubject.toLowerCase())) {
        baseTags.push(selectedSubject.toLowerCase());
      }
    }

    setSubmitting(true);
    try {
      const uploadedMediaUrl = await uploadListingImage();

      if (editId) {
        await api.updateListing(
          editId as string,
          {
            title: title.trim(),
            description: description.trim(),
            category: cat.title,
            subcategory: sub,
            type: listingType,
            ...(listingType === 'service_request' ? { budget: p, price: undefined } : { price: p, budget: undefined }),
            tags: baseTags,
            media_url: uploadedMediaUrl ?? undefined,
          },
          token
        );
        showAlert({
          title: 'Saved',
          subtitle: 'Your listing was updated.',
          severity: 'success',
          onPrimaryPress: () => router.replace('/profile/my-listings')
        });
      } else {
        await api.createListing(
          {
            title: title.trim(),
            description: description.trim(),
            category: cat.title,
            subcategory: sub,
            type: listingType,
            ...(listingType === 'service_request' ? { budget: p } : { price: p }),
            level: 'intermediate',
            tags: baseTags,
            media_url: uploadedMediaUrl ?? undefined,
          },
          token
        );
        showAlert({
          title: 'Published',
          subtitle: 'Your listing is live.',
          severity: 'success',
          onPrimaryPress: () => router.replace('/profile/my-listings')
        });
      }
    } catch (e: any) {
      showAlert({ title: 'Error', subtitle: e?.message ?? 'Something went wrong.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout padding="none" withSafeArea={false} scrollable={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScreenHeader title={editId ? 'Edit listing' : 'New listing'} />

        <ScrollView
          contentContainerStyle={[styles.scroll, horizontalPadding, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Listing type
          </ThemedText>
          {!canOffer ? (
            <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.sm }}>
              Everyone can post a request for help. To offer a service, complete your provider profile first.
            </ThemedText>
          ) : null}
          <View style={styles.row}>
            {(['service_offer', 'service_request'] as const).map((t) => {
              const disabled = t === 'service_offer' && !canOffer;
              return (
                <Pressable
                  key={t}
                  disabled={disabled}
                  onPress={() => !disabled && setListingType(t)}
                  style={[
                    styles.chip,
                    {
                      opacity: disabled ? 0.45 : 1,
                    borderColor: listingType === t ? theme.primary : theme.outlineVariant,
                    backgroundColor: listingType === t ? theme.primaryContainer : theme.surfaceVariant,
                  },
                ]}
              >
                <ThemedText variant="labelLarge" colorName={listingType === t ? 'primary' : 'textSecondary'}>
                  {t === 'service_offer' ? 'I offer a service' : 'I need help'}
                </ThemedText>
              </Pressable>
              );
            })}
          </View>

          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Category
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CAMPUS_CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategoryTitle(c.title)}
                style={[
                  styles.chipSm,
                  {
                    borderColor: categoryTitle === c.title ? theme.primary : theme.outlineVariant,
                    backgroundColor: categoryTitle === c.title ? theme.primaryContainer : theme.surface,
                  },
                ]}
              >
                <ThemedText variant="labelSmall" numberOfLines={1}>
                  {c.title}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {categoryTitle ? (
            <>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                Subcategory
              </ThemedText>
              <View style={styles.row}>
                {CAMPUS_CATEGORIES.find((c) => c.title === categoryTitle)?.groups.flatMap(g => g.items).map((subItem) => (
                  <Pressable
                    key={subItem.title}
                    onPress={() => setSubcategoryTitle(subItem.title)}
                    style={[
                      styles.chipSm,
                      {
                        borderColor: subcategoryTitle === subItem.title ? theme.primary : theme.outlineVariant,
                        backgroundColor: subcategoryTitle === subItem.title ? theme.primaryContainer : theme.surface,
                      },
                    ]}
                  >
                    <ThemedText variant="labelSmall" numberOfLines={1}>
                      {subItem.title}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {subcategoryTitle.toLowerCase().includes('tutoring') || subcategoryTitle.toLowerCase().includes('subject') ? (
            <>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                Subject
              </ThemedText>
              <View style={styles.row}>
                {SUBJECT_OPTIONS.map((subOpt) => (
                  <Pressable
                    key={subOpt}
                    onPress={() => setSubject(subOpt)}
                    style={[
                      styles.chipSm,
                      {
                        borderColor: subject === subOpt ? theme.primary : theme.outlineVariant,
                        backgroundColor: subject === subOpt ? theme.primaryContainer : theme.surface,
                      },
                    ]}
                  >
                    <ThemedText variant="labelSmall" numberOfLines={1}>
                      {subOpt}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {subject === 'Other' ? (
                <TextInput
                  value={customSubject}
                  onChangeText={setCustomSubject}
                  placeholder="Specify subject..."
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { marginTop: Spacing.sm, color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
                />
              ) : null}
            </>
          ) : null}

          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Title
          </ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Short headline"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
          />

          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            {listingType === 'service_request' ? 'Budget (USD)' : 'Price (USD)'}
          </ThemedText>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
          />

          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Description
          </ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you offer or what you need..."
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant },
            ]}
          />

          {/* ── Listing Image Picker ─────────────────────────────── */}
          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Cover Image (optional)
          </ThemedText>
          <Pressable
            onPress={pickListingImage}
            style={[styles.imagePicker, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
          >
            {mediaUri ? (
              <>
                <Image source={{ uri: mediaUri }} style={styles.imagePreview} resizeMode="cover" />
                <View style={[styles.imageEditBadge, { backgroundColor: theme.primary }]}>
                  <ThemedIcon name="pencil" size={14} lightColor="#fff" darkColor="#fff" />
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <ThemedIcon name="image-plus" size={32} colorName="textMuted" />
                <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: Spacing.xs }}>
                  Tap to add a cover image
                </ThemedText>
              </View>
            )}
          </Pressable>

          <PrimaryButton
            title={editId ? 'Save changes' : 'Publish listing'}
            onPress={onSubmit}
            isLoading={submitting || uploadingImage}
            disabled={submitting || uploadingImage}
            size="large"
            marginTop={Spacing.xl}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scroll: { paddingTop: Spacing.sm },
  label: { marginBottom: Spacing.sm, marginTop: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  catRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  chipSm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    maxWidth: 280,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 120,
    fontSize: 16,
  },
  imagePicker: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 160,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});
