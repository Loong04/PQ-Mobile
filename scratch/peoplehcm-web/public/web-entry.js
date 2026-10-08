// Development entry for preserved HTML documents served from public/workspace.
// The production build replaces this file with the stable bundled entry.
import RefreshRuntime from '/@react-refresh';
import '/@vite/client';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
await import('/src/app/entrypoints/business.tsx');
