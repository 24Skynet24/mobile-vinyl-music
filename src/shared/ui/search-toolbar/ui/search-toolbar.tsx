import { useState } from 'react';
import { TextInput, View } from 'react-native';

import type { SearchToolbarProps, SortType } from '../model/types';
import { SearchIcon, SortIcon } from './icons';
import { PressEffect } from './press-effect';
import { SortMenu } from './sort-menu';

export function SearchToolbar({ onSortChange, placeholder }: SearchToolbarProps) {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortType>('date-added');

  const handleSortChange = (sortType: SortType) => {
    setSelectedSort(sortType);
    setIsSortMenuOpen(false);
    onSortChange?.(sortType);
  };

  return (
    <View className="relative z-50">
      <View className="flex flex-row items-center gap-2 rounded-[8px] bg-black-main p-2">
        <SearchIcon />

        <View className="relative flex-1">
          <TextInput
            className="w-full border-b-white-main font-futura text-[16px] text-white-main placeholder:text-white-main"
            placeholder={placeholder}
            placeholderTextColor="#999999"
          />
        </View>

        <PressEffect
          accessibilityLabel="Choose sorting"
          accessibilityRole="button"
          accessibilityState={{ expanded: isSortMenuOpen }}
          className="ml-auto"
          hitSlop={8}
          onPress={() => setIsSortMenuOpen((isOpen) => !isOpen)}
        >
          <SortIcon />
        </PressEffect>
      </View>

      {isSortMenuOpen && (
        <SortMenu
          onSelect={handleSortChange}
          selectedSort={selectedSort}
        />
      )}
    </View>
  );
}
