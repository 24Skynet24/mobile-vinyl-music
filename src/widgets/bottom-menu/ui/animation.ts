import { withTiming } from 'react-native-reanimated';

export const createEnterBottomMenu = (menuHeight: number) => {
  return () => {
    'worklet';

    return {
      animations: {
        transform: [{ translateY: withTiming(0, { duration: 260 }) }],
      },
      initialValues: {
        transform: [{ translateY: menuHeight }],
      },
    };
  };
};

export const createExitBottomMenu = (menuHeight: number) => {
  return () => {
    'worklet';

    return {
      animations: {
        transform: [
          { translateY: withTiming(menuHeight, { duration: 240 }) },
        ],
      },
      initialValues: {
        transform: [{ translateY: 0 }],
      },
    };
  };
};
