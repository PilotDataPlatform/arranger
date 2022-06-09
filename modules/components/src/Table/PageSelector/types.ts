import { ThemeCommon } from '@/ThemeContext/types';

export interface PageSelectorThemeProps extends ThemeCommon.FontProperties {}

export interface PageSelectorProps extends ThemeCommon.CustomCSS {
  theme?: Partial<PageSelectorThemeProps>;
}
