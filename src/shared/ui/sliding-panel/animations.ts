import { withTiming } from 'react-native-reanimated';

export const createSlidingPanelEnterAnimation = (panelHeight: number) => {
  return () => {
    'worklet';

    return {
      animations: {
        transform: [{ translateY: withTiming(0, { duration: 260 }) }],
      },
      initialValues: {
        transform: [{ translateY: panelHeight }],
      },
    };
  };
};

export const createSlidingPanelExitAnimation = (panelHeight: number) => {
  return () => {
    'worklet';

    return {
      animations: {
        transform: [
          { translateY: withTiming(panelHeight, { duration: 240 }) },
        ],
      },
      initialValues: {
        transform: [{ translateY: 0 }],
      },
    };
  };
};
