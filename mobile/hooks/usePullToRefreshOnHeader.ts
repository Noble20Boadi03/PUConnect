import { useRef, useCallback } from 'react';
import { PanResponder } from 'react-native';

export function usePullToRefreshOnHeader({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 && !isRefreshing) {
          onRefresh();
        }
      },
    })
  ).current;

  return { panHandlers: panResponder.panHandlers };
}
