import type { ComponentProps } from 'react';
import { Text } from 'react-native';

type TextFuturaProps = ComponentProps<typeof Text>;

export function TextFutura({ className, ...props }: TextFuturaProps) {
  const textClassName = ['font-futura', className].filter(Boolean).join(' ');

  return <Text className={textClassName} {...props} />;
}
