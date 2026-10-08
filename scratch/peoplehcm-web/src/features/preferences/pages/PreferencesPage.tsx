import { Check, Globe2, Moon, Sun, RotateCcw, Palette } from 'lucide-react';
import { type Preferences as PreferenceState } from '../../../shared/types/preferences.ts';
import { defaultPreferences } from '../../../shared/theme/preferences.ts';
import type { Translator } from '../../../shared/i18n/catalogue.ts';

interface Props {
  preferences: PreferenceState;
  update: (value: PreferenceState) => void;
  t: Translator;
}
export function PreferencesPage({ preferences, update, t }: Props) {
  const presets = [
    { key: 'navy' as const, color: '#435875' },
    { key: 'teal' as const, color: '#52716e' },
    { key: 'forest' as const, color: '#47664b' },
    { key: 'copper' as const, color: '#985e37' },
  ];
  return (
    <div className="preferences-page page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">{t('settings')}</div>
          <h1>{t('settingsTitle')}</h1>
          <p>{t('settingsHint')}</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="settings-panel neu">
          <div className="settings-heading">
            <Palette size={22} />
            <h2>{t('appearance')}</h2>
          </div>
          <div className="mode-grid">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                className={'mode-preview ' + mode + (preferences.mode === mode ? ' selected' : '')}
                onClick={() => update({ ...preferences, mode })}
              >
                <span className="mock-sidebar" />
                <span className="mock-header" />
                <span className="mock-card" />
                <span className="mock-card second" />
                <span className="mode-label">
                  {mode === 'light' ? <Sun size={16} /> : <Moon size={16} />} {t(mode)}{' '}
                  {preferences.mode === mode && <Check size={15} />}
                </span>
              </button>
            ))}
          </div>
          <h3>{t('primary')}</h3>
          <p>{t('themeHint')}</p>
          <div className="colour-presets">
            {presets.map((preset) => (
              <button
                key={preset.key}
                className={preferences.primary === preset.color ? 'selected' : ''}
                onClick={() => update({ ...preferences, primary: preset.color })}
              >
                <span style={{ background: preset.color }}>
                  {preferences.primary === preset.color && <Check size={15} />}
                </span>
                {t(preset.key)}
              </button>
            ))}
          </div>
          <label className="colour-input">
            <span>{t('custom')}</span>
            <input
              type="color"
              value={preferences.primary}
              onChange={(event) => update({ ...preferences, primary: event.target.value })}
            />
            <code>{preferences.primary.toUpperCase()}</code>
          </label>
        </section>
        <section className="settings-panel neu">
          <div className="settings-heading">
            <Globe2 size={22} />
            <h2>{t('language')}</h2>
          </div>
          <p>{t('languageHint')}</p>
          <div className="language-options">
            {(['en', 'zh'] as const).map((locale) => (
              <button
                key={locale}
                className={preferences.locale === locale ? 'selected' : ''}
                onClick={() => update({ ...preferences, locale })}
              >
                <span className="language-glyph">{locale === 'en' ? 'Aa' : '文'}</span>
                <span>
                  <strong>{t(locale === 'en' ? 'english' : 'chinese')}</strong>
                  <small>{locale === 'en' ? 'English' : 'Chinese · Simplified'}</small>
                </span>
                {preferences.locale === locale && <Check size={18} />}
              </button>
            ))}
          </div>
          <div className="settings-note">
            <Check size={17} />
            {t('preferencesSaved')}
          </div>
          <button className="button raised" onClick={() => update(defaultPreferences)}>
            <RotateCcw size={15} />
            {t('reset')}
          </button>
        </section>
      </div>
    </div>
  );
}
