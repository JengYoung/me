import type { ComponentType } from 'react';
import type { DiaryEntry } from '../../../entities/diary';

export interface CurrentDiaryEntry {
  entry: DiaryEntry;
  Content: ComponentType;
}
