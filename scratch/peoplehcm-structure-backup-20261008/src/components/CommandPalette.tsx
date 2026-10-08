import { useEffect, useRef, useState } from 'react';
import { Search, ArrowUpRight, CornerDownLeft, X } from 'lucide-react';
import type { PageRecord } from '../config/modules';
import type { Translator } from '../i18n/catalogue';
import type { Locale } from '../lib/core';

interface Props {
  pages: PageRecord[];
  t: Translator;
  locale: Locale;
  close: () => void;
  open: (path: string) => void;
}
export function CommandPalette({ pages, t, locale, close, open }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const results = pages
    .filter((page) =>
      `${page.title} ${page.titleZh} ${page.path}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 12);
  useEffect(() => {
    const prior = document.activeElement;
    input.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (prior instanceof HTMLElement && prior.isConnected) prior.focus();
    };
  }, [close]);
  return (
    <div className="command-overlay" onClick={close}>
      <div
        ref={dialog}
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('searchShort')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            const nodes = dialog.current?.querySelectorAll<HTMLElement>(
              'input,button:not(:disabled)',
            );
            if (nodes?.length) {
              const first = nodes[0],
                last = nodes[nodes.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }
          }
          if (event.target !== input.current) return;
          if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault();
            setSelected((index) => Math.min(index + 1, results.length - 1));
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected((index) => Math.max(index - 1, 0));
          }
          if (event.key === 'Enter' && results[selected]) {
            event.preventDefault();
            open(results[selected].path);
            close();
          }
        }}
      >
        <div className="command-input">
          <Search size={21} />
          <input
            ref={input}
            value={query}
            placeholder={t('search')}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
          />
          <button aria-label={t('close')} onClick={close}>
            <X size={18} />
          </button>
        </div>
        <div className="command-results">
          {results.map((page, index) => (
            <button
              key={page.path}
              className={index === selected ? 'selected' : ''}
              onMouseEnter={() => setSelected(index)}
              onClick={() => {
                open(page.path);
                close();
              }}
            >
              <span>
                {locale === 'zh' ? page.titleZh : page.title}
                <small>
                  {page.path.includes('options') ? page.path.split('/')[1] : t('workspace')}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
          {!results.length && <p className="command-empty">{t('noResults')}</p>}
        </div>
        <div className="command-footer">
          <CornerDownLeft size={14} />
          {t('commandHint')}
          <kbd>Esc</kbd>
        </div>
      </div>
    </div>
  );
}
