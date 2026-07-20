import type { ComponentProps } from 'react';
import { Text } from 'react-native';

type TextBebasProps = ComponentProps<typeof Text>;

export function TextBebas({ className, ...props }: TextBebasProps) {
  const textClassName = ['font-bebas', className].filter(Boolean).join(' ');

  return <Text className={textClassName} {...props} />;
}
