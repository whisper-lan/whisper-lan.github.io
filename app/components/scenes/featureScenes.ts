import type { ComponentType } from 'react';
import type { FeatureKey } from '@/lib/features';
import type { SceneProps } from '../site/Chapters';
import { TransferScene } from './TransferScene';
import { InputScene } from './InputScene';
import { AudioScene } from './AudioScene';
import { PhoneScene } from './PhoneScene';
import { FlowScene } from './FlowScene';
import { FilesScene } from './FilesScene';
import { ClipboardScene } from './ClipboardScene';
import { NotifyScene } from './NotifyScene';

// Each feature page's scene: the home page chapter's where there is one. The
// feature menu in the nav plays the same scenes.
export const FEATURE_SCENES: Record<FeatureKey, ComponentType<SceneProps>> = {
  fileTransfer: TransferScene,
  fileBrowser: FilesScene,
  windowFlow: FlowScene,
  keyboardMouse: InputScene,
  audioSharing: AudioScene,
  phoneControl: PhoneScene,
  clipboardSync: ClipboardScene,
  notifications: NotifyScene,
};
