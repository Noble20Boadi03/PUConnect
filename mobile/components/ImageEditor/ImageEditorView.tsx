import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Canvas,
  Path,
  Paint,
  ColorMatrix,
  Skia,
  Group,
} from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

type ToolType = 'draw' | 'text' | 'crop' | 'sticker' | 'adjust';

type DrawPath = {
  path: string;
  color: string;
  strokeWidth: number;
};

type TextElement = {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  fontSize: number;
};

type StickerElement = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type HistoryEntry = {
  paths: DrawPath[];
  textElements: TextElement[];
  stickerElements: StickerElement[];
  brightness: number;
  contrast: number;
  saturation: number;
};

const DRAW_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF3B30',
  '#FFD60A',
  '#34C759',
  '#007AFF',
  '#AF52DE',
];

const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '🥰',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😚',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
];

export interface ImageEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (uri: string) => void;
  imageUri: string;
}

export const ImageEditorView: React.FC<ImageEditorProps> = ({
  visible,
  onClose,
  onSave,
  imageUri,
}) => {
  const [tool, setTool] = useState<ToolType>('draw');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedColor, setSelectedColor] = useState(DRAW_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [fontSize, setFontSize] = useState(24);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingText, setEditingText] = useState('');

  const viewShotRef = useRef<ViewShot>(null);
  const pathRef = useRef<string>('');
  const canvasRef = useRef<View>(null);
  const isDrawingRef = useRef(false);

  const insets = useSafeAreaInsets();
  const Colors = useThemeColor();

  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslationX = useSharedValue(0);
  const startTranslationY = useSharedValue(0);

  const saveHistory = useCallback(() => {
    const entry: HistoryEntry = {
      paths: [...paths],
      textElements: [...textElements],
      stickerElements: [...stickerElements],
      brightness,
      contrast,
      saturation,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);

    if (newHistory.length > 30) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [
    paths,
    textElements,
    stickerElements,
    brightness,
    contrast,
    saturation,
    history,
    historyIndex,
  ]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const entry = history[newIndex];
      setPaths(entry.paths);
      setTextElements(entry.textElements);
      setStickerElements(entry.stickerElements);
      setBrightness(entry.brightness);
      setContrast(entry.contrast);
      setSaturation(entry.saturation);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const entry = history[newIndex];
      setPaths(entry.paths);
      setTextElements(entry.textElements);
      setStickerElements(entry.stickerElements);
      setBrightness(entry.brightness);
      setContrast(entry.contrast);
      setSaturation(entry.saturation);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history]);

  const onDrawingStart = useCallback((x: number, y: number) => {
    isDrawingRef.current = true;
    pathRef.current = `M ${x} ${y}`;
  }, []);

  const onDrawingActive = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current) return;
    pathRef.current += ` L ${x} ${y}`;
    setPaths((prev) => {
      const lastIdx = prev.length - 1;
      const newPaths = [...prev];
      newPaths[lastIdx] = {
        ...newPaths[lastIdx],
        path: pathRef.current,
      };
      return newPaths;
    });
  }, []);

  const onDrawingEnd = useCallback(() => {
    isDrawingRef.current = false;
    saveHistory();
  }, [saveHistory]);

  const handleCanvasTouchStart = useCallback((e: any) => {
    if (tool !== 'draw') return;
    const { locationX, locationY } = e.nativeEvent;
    const newPath: DrawPath = {
      path: '',
      color: selectedColor,
      strokeWidth,
    };
    setPaths((prev) => [...prev, newPath]);
    onDrawingStart(locationX, locationY);
  }, [tool, selectedColor, strokeWidth, onDrawingStart]);

  const handleCanvasTouchMove = useCallback((e: any) => {
    if (tool !== 'draw') return;
    const { locationX, locationY } = e.nativeEvent;
    onDrawingActive(locationX, locationY);
  }, [tool, onDrawingActive]);

  const handleCanvasTouchEnd = useCallback(() => {
    if (tool !== 'draw') return;
    onDrawingEnd();
  }, [tool, onDrawingEnd]);

  const handleCanvasTap = useCallback(() => {
    if (tool === 'text') {
      setIsEditingText(true);
      setEditingText('');
    }
  }, [tool]);

  const addText = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const newText: TextElement = {
        id: Date.now().toString(),
        text,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        color: selectedColor,
        fontSize,
      };
      setTextElements((prev) => [...prev, newText]);
      setSelectedTextId(newText.id);
      setIsEditingText(false);
      setEditingText('');
      saveHistory();
    },
    [selectedColor, fontSize, saveHistory]
  );

  const addSticker = useCallback(
    (emoji: string) => {
      const newSticker: StickerElement = {
        id: Date.now().toString(),
        emoji,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      };
      setStickerElements((prev) => [...prev, newSticker]);
      setSelectedStickerId(newSticker.id);
      saveHistory();
    },
    [saveHistory]
  );

  const saveImage = useCallback(async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) return;

      const uri = await viewShotRef.current.capture();
      const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(manipResult.uri);
        Alert.alert('Success', 'Image saved to library!');
      }
      onSave(manipResult.uri);
      onClose();
    } catch (e) {
      console.error('Error saving image', e);
      Alert.alert('Error', 'Failed to save image');
    }
  }, [onSave, onClose]);

  const handleBack = useCallback(() => {
    if (
      paths.length > 0 ||
      textElements.length > 0 ||
      stickerElements.length > 0
    ) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  }, [paths, textElements, stickerElements, onClose]);

  const getColorMatrix = useCallback(() => {
    const b = brightness;
    const c = contrast;
    const s = saturation;
    return [
      c, 0, 0, 0, b,
      0, c, 0, 0, b,
      0, 0, c, 0, b,
      0, 0, 0, 1, 0,
    ];
  }, [brightness, contrast]);

  useEffect(() => {
    if (visible) {
      const initialEntry: HistoryEntry = {
        paths: [],
        textElements: [],
        stickerElements: [],
        brightness: 0,
        contrast: 0,
        saturation: 1,
      };
      setHistory([initialEntry]);
      setHistoryIndex(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={undo}
              disabled={historyIndex <= 0}
              style={[
                styles.headerBtn,
                { opacity: historyIndex <= 0 ? 0.4 : 1 },
              ]}
            >
              <Ionicons name="arrow-undo" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={redo}
              disabled={historyIndex >= history.length - 1}
              style={[
                styles.headerBtn,
                { opacity: historyIndex >= history.length - 1 ? 0.4 : 1 },
              ]}
            >
              <Ionicons name="arrow-redo" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={saveImage} style={styles.headerBtn}>
            <Text style={styles.headerTextDone}>Done</Text>
          </TouchableOpacity>
        </View>

        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 0.9 }}
          style={styles.editorArea}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.editorImage}
              contentFit="contain"
            />
            <Canvas
              style={StyleSheet.absoluteFillObject}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchCancel={handleCanvasTouchEnd}
            >
              {paths.map((pathData, idx) => (
                <Path
                  key={idx}
                  path={pathData.path}
                  style="stroke"
                  strokeWidth={pathData.strokeWidth}
                  color={pathData.color}
                  strokeJoin="round"
                  strokeCap="round"
                />
              ))}
            </Canvas>
          </View>
        </ViewShot>

        <View
          style={[
            styles.toolbar,
            { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
          ]}
        >
          <View style={styles.toolTabs}>
            <TouchableOpacity
              style={[styles.toolTab, tool === 'draw' && styles.toolTabActive]}
              onPress={() => setTool('draw')}
            >
              <Ionicons
                name="pencil-outline"
                size={28}
                color={tool === 'draw' ? Colors.primary : Colors.icon}
              />
              <Text
                style={[
                  styles.toolTabText,
                  { color: tool === 'draw' ? Colors.primary : Colors.icon },
                ]}
              >
                Draw
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolTab, tool === 'text' && styles.toolTabActive]}
              onPress={() => setTool('text')}
            >
              <Ionicons
                name="text-outline"
                size={28}
                color={tool === 'text' ? Colors.primary : Colors.icon}
              />
              <Text
                style={[
                  styles.toolTabText,
                  { color: tool === 'text' ? Colors.primary : Colors.icon },
                ]}
              >
                Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolTab, tool === 'crop' && styles.toolTabActive]}
              onPress={() => setTool('crop')}
            >
              <Ionicons
                name="crop-outline"
                size={28}
                color={tool === 'crop' ? Colors.primary : Colors.icon}
              />
              <Text
                style={[
                  styles.toolTabText,
                  { color: tool === 'crop' ? Colors.primary : Colors.icon },
                ]}
              >
                Crop
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolTab,
                tool === 'sticker' && styles.toolTabActive,
              ]}
              onPress={() => setTool('sticker')}
            >
              <Ionicons
                name="happy-outline"
                size={28}
                color={tool === 'sticker' ? Colors.primary : Colors.icon}
              />
              <Text
                style={[
                  styles.toolTabText,
                  { color: tool === 'sticker' ? Colors.primary : Colors.icon },
                ]}
              >
                Sticker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolTab,
                tool === 'adjust' && styles.toolTabActive,
              ]}
              onPress={() => setTool('adjust')}
            >
              <Ionicons
                name="options-outline"
                size={28}
                color={tool === 'adjust' ? Colors.primary : Colors.icon}
              />
              <Text
                style={[
                  styles.toolTabText,
                  { color: tool === 'adjust' ? Colors.primary : Colors.icon },
                ]}
              >
                Adjust
              </Text>
            </TouchableOpacity>
          </View>

          {tool === 'draw' && (
            <View style={styles.drawPanel}>
              <View style={styles.colorRow}>
                {DRAW_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>
          )}

          {tool === 'sticker' && (
            <View style={styles.stickerPanel}>
              <View style={styles.emojiRow}>
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiBtn}
                    onPress={() => addSticker(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextDone: {
    color: '#007AFF',
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  headerActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  editorArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorImage: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  toolTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  toolTab: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
  },
  toolTabActive: {
    backgroundColor: 'rgba(0,122,255,0.15)',
  },
  toolTabText: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: 4,
  },
  drawPanel: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  stickerPanel: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
});

export default ImageEditorView;
