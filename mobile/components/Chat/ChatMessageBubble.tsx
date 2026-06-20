import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Pressable, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Spacing, Typography } from '../../constants';
import type { ChatMessage } from '../../types';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  sentBg: string;
  sentText: string;
  receivedBg: string;
  receivedText: string;
  mutedColor: string;
  primaryColor: string;
  systemBg: string;
  systemAccent?: string;
  onRetry?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onLongPress?: (message: ChatMessage) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  sentBg,
  sentText,
  receivedBg,
  receivedText,
  mutedColor,
  primaryColor,
  systemBg,
  systemAccent,
  onRetry,
  onDelete,
  onLongPress,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  // Check if message is an image URL
  const isImageMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    return lowerText.startsWith('https://') && 
      (lowerText.endsWith('.jpg') || 
       lowerText.endsWith('.jpeg') || 
       lowerText.endsWith('.png') || 
       lowerText.endsWith('.gif') || 
       lowerText.endsWith('.webp'));
  };

  // Check if message is a document
  const isDocumentMessage = (content: string) => 
    content.startsWith('doc::');

  const parseDocMessage = (content: string) => {
    const [, fileName, url] = content.split('::');
    return { fileName, url };
  };

  const isImage = isImageMessage(message.text);
  const isDocument = isDocumentMessage(message.text);
  const { fileName: docFileName, url: docUrl } = isDocument ? parseDocMessage(message.text) : { fileName: '', url: '' };

  const handlePress = () => {
    if (message.status === 'failed') {
      Alert.alert(
        'Message Failed',
        'This message could not be sent.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(message) },
          { text: 'Retry', onPress: () => onRetry?.(message) },
        ]
      );
    } else if (isImage) {
      
      setPreviewVisible(true);
    } else if (isDocument) {
      
      Linking.openURL(docUrl);
    }
  };

  const handleLongPressHandler = () => {
    if (onLongPress) {
      
      onLongPress(message);
    }
  };

  if (message.kind === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={[styles.systemDividerLine, { backgroundColor: mutedColor }]} />
        <Text style={[styles.systemMessageText, { color: mutedColor }]}>{message.text}</Text>
        <View style={[styles.systemDividerLine, { backgroundColor: mutedColor }]} />
      </View>
    );
  }

  const isSent = message.kind === 'sent';

  return (
    <>
      <View style={[styles.row, isSent ? styles.rowSent : styles.rowReceived]}>
        <Pressable
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          style={({ pressed }) => [
            styles.bubble,
            isSent
              ? [styles.bubbleSent, { backgroundColor: message.status === 'failed' ? '#FCA5A5' : sentBg }]
              : [styles.bubbleReceived, { backgroundColor: receivedBg }],
            pressed && { opacity: 0.85 }
          ]}
          onPress={handlePress}
          onLongPress={handleLongPressHandler}
        >
          <View style={styles.messageContent}>
            {isDocument ? (
              <View style={[styles.documentBubble, { backgroundColor: isSent ? sentBg : receivedBg }]}>
                <Ionicons name="document-text-outline" size={28} color={isSent ? sentText : primaryColor} />
                <View style={styles.documentInfo}>
                  <Text 
                    style={[styles.documentFileName, { color: isSent ? sentText : receivedText }]}
                    numberOfLines={2}
                  >
                    {docFileName}
                  </Text>
                  <Text style={[styles.documentOpenText, { color: (isSent ? sentText : mutedColor) }]}>
                    Tap to open
                  </Text>
                </View>
                {message.status === 'pending' && (
                  <ActivityIndicator 
                    size="small" 
                    color={isSent ? sentText : mutedColor} 
                  />
                )}
                {message.status === 'failed' && (
                  <Ionicons name="warning" size={16} color="#B91C1C" />
                )}
              </View>
            ) : isImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: message.text }}
                  style={styles.messageImage}
                  contentFit="cover"
                  transition={200}
                />
                {message.status === 'pending' && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator 
                      size="small" 
                      color="#FFFFFF" 
                    />
                  </View>
                )}
                {message.status === 'failed' && (
                  <View style={styles.imageErrorOverlay}>
                    <Ionicons name="warning" size={24} color="#FFFFFF" />
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.text, { color: isSent ? (message.status === 'failed' ? '#7F1D1D' : sentText) : receivedText }]}>
                {message.text}
              </Text>
            )}
            {!isImage && !isDocument && message.status === 'pending' && (
              <ActivityIndicator 
                size="small" 
                color={isSent ? sentText : mutedColor} 
                style={styles.loadingIndicator}
              />
            )}
            {!isImage && !isDocument && message.status === 'failed' && (
              <Ionicons name="warning" size={16} color="#B91C1C" style={styles.errorIcon} />
            )}
          </View>
        </Pressable>
        <Text style={[styles.time, { color: mutedColor }]}>{message.time}</Text>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewVisible(false)}
      >
        <Pressable style={styles.previewOverlay} onPress={() => setPreviewVisible(false)}>
          <View style={styles.previewContent}>
            <Image
              source={{ uri: message.text }}
              style={styles.previewImage}
              contentFit="contain"
              transition={200}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.md,
    maxWidth: '82%',
  },
  rowSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 18,
  },
  bubbleSent: {
    borderBottomRightRadius: 6,
  },
  bubbleReceived: {
    borderBottomLeftRadius: 6,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  documentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    maxWidth: 260,
  },
  documentInfo: {
    flex: 1,
    gap: 2,
  },
  documentFileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  documentOpenText: {
    fontSize: 11,
    opacity: 0.6,
  },
  imageContainer: {
    position: 'relative',
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239,68,68,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
  },
  loadingIndicator: {
    opacity: 0.8,
  },
  errorIcon: {
    marginLeft: Spacing.xs,
  },
  time: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  systemDividerLine: {
    width: '100%',
    height: 1,
    opacity: 0.5,
  },
  systemMessageText: {
    fontSize: 11,
    textAlign: 'center',
    flexWrap: 'wrap',
    fontStyle: 'italic',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default ChatMessageBubble;
