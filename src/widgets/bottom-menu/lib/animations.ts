import { withTiming } from 'react-native-reanimated';

export const createBottomMenuEnterAnimation = (menuHeight: number) => {
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

export const createBottomMenuExitAnimation = (menuHeight: number) => {
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
