import {
  Archive,
  Basketball,
  BookOpenText,
  Broom,
  Cards,
  Calculator,
  MicrophoneStage,
  MoonStars,
} from '@phosphor-icons/react';
import type { IconName } from './types';

const iconMap = {
  chinese: BookOpenText,
  calculator: Calculator,
  language: Cards,
  performance: MicrophoneStage,
  broom: Broom,
  run: Basketball,
  moon: MoonStars,
  tidy: Archive,
};

export function TaskIcon({ name }: { name: IconName }) {
  const Icon = iconMap[name as keyof typeof iconMap] ?? BookOpenText;
  return <Icon weight="fill" aria-hidden="true" />;
}
