import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { useAppAlert } from '@/context/alert-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { SUBCATEGORY_FILTERS } from '@/constants/filters';
import { ListingType } from '@/types';
import { useResponsive } from '@/hooks/use-responsive';

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
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'starting_at'>('fixed');
  const [urgency, setUrgency] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const groupedTags = useMemo(() => {
    const cat = CAMPUS_CATEGORIES.find(c => c.title === categoryTitle);
    if (!cat) return [];
    
    const groups: { subcategory: string, tags: string[] }[] = [];
    cat.groups.forEach(group => {
      group.items.forEach(item => {
        const subTitle = item.title;
        const options = new Set<string>();
        if (SUBCATEGORY_FILTERS[subTitle]) {
          SUBCATEGORY_FILTERS[subTitle].forEach(filter => {
            if (Array.isArray(filter.filter_options)) {
              filter.filter_options.forEach((opt: string) => options.add(opt));
            }
          });
        }
        if (options.size > 0) {
          groups.push({ subcategory: subTitle, tags: Array.from(options) });
        }
      });
    });
    return groups;
  }, [categoryTitle]);

  useEffect(() => {
    if (listingType === 'service_request' && priceType === 'starting_at') {
      setPriceType('fixed');
    } else if (listingType === 'service_offer' && priceType === 'fixed') {
      setPriceType('starting_at');
    }
  }, [listingType, priceType]);

  const load = useCallback(async () => {
    if (!editId || !token) return;
    try {
      const listing = await api.getListing(editId);
      setTitle(listing.title);
      setDescription(listing.description ?? '');
      setPrice(String(listing.price ?? listing.budget ?? ''));
      setPriceType(listing.priceType ?? (listing.type === 'service_request' ? 'fixed' : 'starting_at'));
      setUrgency(listing.urgency ?? '');
      setMediaUrls(listing.media_urls ?? (listing.media_url ? [listing.media_url] : []));
      const offerNeedsProvider = listing.type === 'service_offer' && user?.canOfferServices !== true;
      if (offerNeedsProvider) {
        showAlert({
          title: 'Provider status required',
          subtitle: 'This post is a service offer. Complete your provider profile to keep editing it as an offer.',
          severity: 'warning'
        });
      }
      setListingType(offerNeedsProvider ? 'service_request' : listing.type);
      setCategoryTitle(listing.category);
      if (listing.tags) {
        setSelectedTags(listing.tags);
      }
    } catch {
      showAlert({
        title: 'Error',
        subtitle: 'Could not load post.',
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

  // Removed subcategory sync effect

  const onSubmit = async () => {
    if (listingType === 'service_offer' && !canOffer) {
      showAlert({
        title: 'Provider upgrade required',
        subtitle: 'Complete your professional profile (skills and campus details) to post a service offer, or post a request for help instead.',
        severity: 'info',
        primaryButtonTitle: 'Post a request',
        onPrimaryPress: () => setListingType('service_request'),
        secondaryButtonTitle: 'Upgrade profile',
        onSecondaryPress: () => router.push('/profile/edit-profile')
      });
      return;
    }

    const p = priceType === 'negotiable' ? 0 : parseFloat(price.replace(/,/g, ''));
    if (!title.trim() || !description.trim() || (priceType !== 'negotiable' && (Number.isNaN(p) || p < 0))) {
      showAlert({ title: 'Validation', subtitle: 'Please enter title, description, and a valid price.', severity: 'warning' });
      return;
    }
    const cat = CAMPUS_CATEGORIES.find((c) => c.title === categoryTitle) ?? CAMPUS_CATEGORIES[0];
    const sub = cat.title;

    const titleTags = title.split(/\s+/).slice(0, 5).map((s) => s.toLowerCase());
    const allTags = Array.from(new Set([...titleTags, ...selectedTags.map(t => t.toLowerCase())]));

    setSubmitting(true);
    try {
      if (editId) {
        if (!token) throw new Error('Not authenticated');
        await api.updateListing(
          editId as string,
          {
            title: title.trim(),
            description: description.trim(),
            category: cat.title,
            subcategory: sub,
            type: listingType,
            ...(listingType === 'service_request' ? { budget: p, price: undefined } : { price: p, budget: undefined }),
            priceType,
            urgency: listingType === 'service_request' ? urgency : undefined,
            media_urls: listingType === 'service_offer' ? mediaUrls : [], // Unified: always send array, only for offers
            tags: allTags,
          },
          token
        );
        showAlert({
          title: 'Saved',
          subtitle: 'Your post was updated.',
          severity: 'success',
          onPrimaryPress: () => router.replace('/profile/my-listings')
        });
      } else {
        if (!token) throw new Error('Not authenticated');
        await api.createListing(
          {
            title: title.trim(),
            description: description.trim(),
            category: cat.title,
            subcategory: sub,
            type: listingType,
            ...(listingType === 'service_request' ? { budget: p } : { price: p }),
            priceType,
            urgency: listingType === 'service_request' ? urgency : undefined,
            media_urls: listingType === 'service_offer' ? mediaUrls : [], // Unified: always send array, only for offers
            level: 'intermediate',
            tags: allTags,
          },
          token
        );
        showAlert({
          title: 'Published',
          subtitle: 'Your post is live.',
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
        <ScreenHeader title={editId ? 'Edit post' : 'New post'} />

        <ScrollView
          contentContainerStyle={[styles.scroll, horizontalPadding, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Post type
          </ThemedText>
          <View style={styles.row}>
            {(['service_offer', 'service_request'] as const)
              .filter(t => t === 'service_request' || canOffer)
              .map((t) => {
              return (
                <Pressable
                  key={t}
                  onPress={() => setListingType(t)}
                  style={[
                    styles.chip,
                    {
                    borderColor: listingType === t ? theme.primary : theme.outlineVariant,
                    backgroundColor: listingType === t ? theme.primaryContainer : theme.surfaceVariant,
                  },
                ]}
              >
                <ThemedText variant="labelLarge" colorName={listingType === t ? 'primary' : 'textSecondary'}>
                  {t === 'service_offer' ? 'Offer a Service' : 'Post a Request'}
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

          {groupedTags.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                Tags (Select all that apply)
              </ThemedText>
              
              {groupedTags.map((group, groupIndex) => (
                <View key={groupIndex} style={{ marginTop: Spacing.sm }}>
                  <ThemedText variant="labelMedium" colorName="textSecondary" style={{ marginBottom: Spacing.xs }}>
                    {group.subcategory}
                  </ThemedText>
                  <View style={styles.row}>
                    {group.tags.map((tag) => {
                      const isSelected = selectedTags.some(t => t.toLowerCase() === tag.toLowerCase());
                      return (
                        <Pressable
                          key={tag}
                          onPress={() => {
                            setSelectedTags(prev => 
                              isSelected 
                                ? prev.filter(t => t.toLowerCase() !== tag.toLowerCase())
                                : [...prev, tag]
                            );
                          }}
                          style={[
                            styles.chipSm,
                            {
                              borderColor: isSelected ? theme.primary : theme.outlineVariant,
                              backgroundColor: isSelected ? theme.primaryContainer : theme.surface,
                            },
                          ]}
                        >
                          <ThemedText variant="labelSmall" colorName={isSelected ? 'primary' : 'textSecondary'}>
                            {tag}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

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

          {/* Price Type */}
          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Pricing Type
          </ThemedText>
          <View style={styles.row}>
            {(listingType === 'service_request' ? ['fixed', 'negotiable'] : ['starting_at', 'negotiable']).map((pt) => (
              <Pressable
                key={pt}
                onPress={() => setPriceType(pt as any)}
                style={[
                  styles.chipSm,
                  {
                    borderColor: priceType === pt ? theme.primary : theme.outlineVariant,
                    backgroundColor: priceType === pt ? theme.primaryContainer : theme.surface,
                  },
                ]}
              >
                <ThemedText variant="labelSmall">
                  {pt === 'starting_at' ? 'Starting at' : pt === 'fixed' ? 'Fixed Price' : 'Negotiable'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {priceType !== 'negotiable' && (
            <>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                {listingType === 'service_request' ? 'Budget (USD)' : 'Base Price (USD)'}
              </ThemedText>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
              />
            </>
          )}

          {listingType === 'service_request' && (
            <>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                Urgency (Optional)
              </ThemedText>
              <TextInput
                value={urgency}
                onChangeText={setUrgency}
                placeholder="e.g. Next week, End of semester..."
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant }]}
              />
            </>
          )}

          {listingType === 'service_offer' && (
            <>
              <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
                Thumbnails / Portfolio Images
              </ThemedText>
              <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.sm }}>
                Upload multiple images to showcase your work.
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                {mediaUrls.map((url, i) => (
                  <Pressable key={i} onPress={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}>
                    <View style={{ width: 100, height: 100, borderRadius: BorderRadius.md, backgroundColor: theme.surfaceVariant, overflow: 'hidden' }}>
                      <View style={{ width: '100%', height: '100%', backgroundColor: theme.primary, opacity: 0.2 }} />
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                         <ThemedText variant="labelSmall" colorName="primary">Remove</ThemedText>
                      </View>
                    </View>
                  </Pressable>
                ))}
                {mediaUrls.length < 5 && (
                  <Pressable
                    style={{ width: 100, height: 100, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: theme.outlineVariant, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                      const mocks = [
                        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
                        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
                        'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800'
                      ];
                      setMediaUrls([...mediaUrls, mocks[mediaUrls.length % mocks.length]]);
                    }}
                  >
                    <ThemedText variant="labelSmall" colorName="textSecondary">+ Add Image</ThemedText>
                  </Pressable>
                )}
              </ScrollView>
            </>
          )}

          <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
            Description
          </ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you offer or what you are requesting..."
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant },
            ]}
          />

          <PrimaryButton
            title={editId ? 'Save changes' : 'Publish post'}
            onPress={onSubmit}
            isLoading={submitting}
            disabled={submitting}
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
});
