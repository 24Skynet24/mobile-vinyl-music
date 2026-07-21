import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { TextBebas } from '@/shared/ui/text';

import { SORT_OPTIONS } from '../model/sort-options';
import type { SortType } from '../model/types';
import { PressEffect } from './press-effect';

type SortMenuProps = {
  selectedSort: SortType;
  onSelect: (sortType: SortType) => void;
};

export function SortMenu({ selectedSort, onSelect }: SortMenuProps) {
  return (
    <Animated.View
      accessibilityRole="menu"
      className="absolute right-0 top-14 min-w-48 overflow-hidden rounded-[8px] bg-black-main py-1"
      entering={FadeInUp.duration(180)}
      exiting={FadeOutUp.duration(130)}
    >
      {SORT_OPTIONS.map((option) => {
        const isSelected = option.value === selectedSort;

        return (
          <PressEffect
            accessibilityRole="menuitem"
            accessibilityState={{ selected: isSelected }}
            className={`px-4 py-3 ${isSelected ? 'bg-orange-main' : ''}`}
            key={option.value}
            onPress={() => onSelect(option.value)}
          >
            <TextBebas className="text-[16px] text-white-main">
              {option.label}
            </TextBebas>
          </PressEffect>
        );
      })}
    </Animated.View>
  );
}
