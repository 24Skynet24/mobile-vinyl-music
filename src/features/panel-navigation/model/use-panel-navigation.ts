import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import type { PanelType } from './types';

export function usePanelNavigation() {
  const [panelStack, setPanelStack] = useState<PanelType[]>([]);
  const activePanel = panelStack.at(-1) ?? null;

  const openPanel = useCallback((panel: PanelType) => {
    setPanelStack((currentStack) => [...currentStack, panel]);
  }, []);

  const closeCurrentPanel = useCallback(() => {
    setPanelStack((currentStack) => currentStack.slice(0, -1));
  }, []);

  const closeAllPanels = useCallback(() => {
    setPanelStack([]);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (panelStack.length === 0) {
          return false;
        }

        closeCurrentPanel();
        return true;
      },
    );

    return () => subscription.remove();
  }, [closeCurrentPanel, panelStack.length]);

  return {
    activePanel,
    closeAllPanels,
    closeCurrentPanel,
    openPanel,
  };
}
