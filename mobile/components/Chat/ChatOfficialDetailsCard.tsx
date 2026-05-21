import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import {
  clientPartyName,
  engagementStatusLabel,
  officialEngagementKindLabel,
  providerPartyName,
} from '../../lib/officialEngagement';
import type {
  ChatPostContext,
  OfficialCompletionPhase,
  OfficialEngagementStatus,
} from '../../types';

const REQUEST_ACCENT = '#F59E0B';

export interface ChatOfficialDetailsCardProps {
  context: ChatPostContext;
  contactName: string;
  engagementStatus: OfficialEngagementStatus;
  completionPhase: OfficialCompletionPhase;
  startedAt?: string;
  completionRequestedAt?: string;
  textColor: string;
  mutedColor: string;
  subtleBg: string;
  primaryColor: string;
}

type StepState = 'done' | 'current' | 'upcoming';

type ProgressStep = {
  key: string;
  label: string;
  state: StepState;
};

function buildProgressSteps(
  status: OfficialEngagementStatus,
  completionPhase: OfficialCompletionPhase
): ProgressStep[] {
  const submitted: StepState = status === 'none' ? 'upcoming' : 'done';
  const inProgress: StepState =
    status === 'active' && completionPhase === 'none'
      ? 'current'
      : status !== 'none'
        ? 'done'
        : 'upcoming';
  const requested: StepState =
    completionPhase === 'pending_review'
      ? 'current'
      : completionPhase === 'completed' || status === 'completed'
        ? 'done'
        : 'upcoming';
  const confirmed: StepState =
    status === 'completed' || completionPhase === 'completed' ? 'done' : 'upcoming';

  return [
    { key: 'submitted', label: 'Submitted', state: submitted },
    { key: 'in_progress', label: 'In progress', state: inProgress },
    { key: 'requested', label: 'Completion requested', state: requested },
    { key: 'confirmed', label: 'Both parties agreed', state: confirmed },
  ];
}

function stepIcon(state: StepState): keyof typeof Ionicons.glyphMap {
  if (state === 'done') return 'checkmark-circle';
  if (state === 'current') return 'ellipse';
  return 'ellipse-outline';
}

export const ChatOfficialDetailsCard: React.FC<ChatOfficialDetailsCardProps> = ({
  context,
  contactName,
  engagementStatus,
  completionPhase,
  startedAt,
  completionRequestedAt,
  textColor,
  mutedColor,
  subtleBg,
  primaryColor,
}) => {
  const isRequest = context.tag === 'Request';
  const accent = isRequest ? REQUEST_ACCENT : primaryColor;
  const statusLabel = engagementStatusLabel(engagementStatus, completionPhase);
  const steps = useMemo(
    () => buildProgressSteps(engagementStatus, completionPhase),
    [engagementStatus, completionPhase]
  );

  const statusTone =
    engagementStatus === 'completed' || completionPhase === 'completed'
      ? accent
      : completionPhase === 'pending_review'
        ? REQUEST_ACCENT
        : engagementStatus === 'active'
          ? accent
          : mutedColor;

  return (
    <View style={[styles.card, { backgroundColor: subtleBg }]}>
      <View style={[styles.kindBadge, { backgroundColor: accent + '18' }]}>
        <Ionicons name="shield-checkmark" size={16} color={accent} />
        <Text style={[styles.kindBadgeText, { color: accent }]}>
          {officialEngagementKindLabel(context.tag)}
        </Text>
      </View>

      <View style={styles.tagRow}>
        <View style={[styles.tagPill, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.tagPillText, { color: accent }]}>{context.tag}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusTone + '22' }]}>
          <Text style={[styles.statusPillText, { color: statusTone }]}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {context.title}
      </Text>

      {context.priceLabel ? (
        <Text style={[styles.price, { color: accent }]}>
          {isRequest ? `Budget · ${context.priceLabel}` : context.priceLabel}
        </Text>
      ) : null}

      <View style={[styles.divider, { backgroundColor: textColor + '12' }]} />

      <View style={styles.metaGrid}>
        <MetaRow
          label="Provider"
          value={providerPartyName(context, contactName)}
          textColor={textColor}
          mutedColor={mutedColor}
        />
        <MetaRow
          label="Client"
          value={clientPartyName(context, contactName)}
          textColor={textColor}
          mutedColor={mutedColor}
        />
        {startedAt ? (
          <MetaRow label="Started" value={startedAt} textColor={textColor} mutedColor={mutedColor} />
        ) : null}
        {completionRequestedAt ? (
          <MetaRow
            label="Completion requested"
            value={completionRequestedAt}
            textColor={textColor}
            mutedColor={mutedColor}
          />
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: textColor + '12' }]} />

      <Text style={[styles.progressHeading, { color: mutedColor }]}>PROGRESS</Text>
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepIconCol}>
              <Ionicons
                name={stepIcon(step.state)}
                size={18}
                color={
                  step.state === 'done'
                    ? accent
                    : step.state === 'current'
                      ? accent
                      : mutedColor
                }
              />
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        step.state === 'done' ? accent + '55' : textColor + '14',
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: step.state === 'upcoming' ? mutedColor : textColor,
                  fontWeight: step.state === 'current' ? '800' : '600',
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {completionPhase === 'pending_review' ? (
        <View style={[styles.callout, { backgroundColor: accent + '14' }]}>
          <Ionicons name="information-circle-outline" size={18} color={accent} />
          <Text style={[styles.calloutText, { color: textColor }]}>
            The provider has requested completion. The client must review the service delivered
            before the undertaking can be closed.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

function MetaRow({
  label,
  value,
  textColor,
  mutedColor,
}: {
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: mutedColor }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: textColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  kindBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  price: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  metaGrid: {
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  metaValue: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  progressHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  steps: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    minHeight: 36,
  },
  stepIconCol: {
    width: 22,
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 14,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 1,
  },
  stepLabel: {
    flex: 1,
    fontSize: Typography.size.sm,
    paddingTop: 1,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: 12,
    marginTop: Spacing.xs,
  },
  calloutText: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontWeight: '500',
    lineHeight: 17,
  },
});

export default ChatOfficialDetailsCard;
