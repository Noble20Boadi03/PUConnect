import { ViewStyle } from 'react-native';

/** Elevated shadow for primary cards (use sparingly in scroll lists). */
export const CARD_SHADOW: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 4,
};

/** Flat border instead of shadow — much cheaper while scrolling. */
export const CARD_BORDER: ViewStyle = {
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.06)',
};
