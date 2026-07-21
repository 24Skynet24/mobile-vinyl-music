import { SlidingPanel } from '@/shared/ui/sliding-panel';
import {
  bottomMenuItems,
  type BottomMenuAction,
} from '../model/menu-items';
import { BottomMenuButton } from './button';

type BottomMenuProps = {
  onActionPress: (action: BottomMenuAction) => void;
  onClose: () => void;
};

const MENU_CONTENT_HEIGHT = 128;

export function BottomMenu({ onActionPress, onClose }: BottomMenuProps) {
  return (
    <SlidingPanel
      contentClassName="flex-row items-start justify-center gap-4 pt-8"
      contentHeight={MENU_CONTENT_HEIGHT}
      onClose={onClose}
    >
      {bottomMenuItems.map((item) => (
        <BottomMenuButton
          key={item.id}
          accessibilityLabel={item.accessibilityLabel}
          iconName={item.iconName}
          onPress={() => onActionPress(item.id)}
        />
      ))}
    </SlidingPanel>
  );
}
