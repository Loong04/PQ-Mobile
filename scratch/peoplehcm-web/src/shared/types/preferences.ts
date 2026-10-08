export type Locale = 'en' | 'zh';

export interface Preferences {
  primary: string;
  mode: 'light' | 'dark';
  locale: Locale;
}
