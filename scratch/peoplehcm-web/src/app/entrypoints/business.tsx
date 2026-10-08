import ReactDOM from 'react-dom/client';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '../../shared/styles/tokens.css';
import '../styles/application.css';
import pageData from '../generated/pages.json';
import { type PageRecord } from '../../shared/types/navigation.ts';
import {
  currentBusinessPath,
  moduleHomeFor,
  moduleLandingUrl,
} from '../navigation/page-navigation.ts';
import { BusinessDocumentShell } from '../business/BusinessDocumentShell.tsx';

function mountBusiness() {
  if (document.getElementById('web-business-shell')) return;
  const path = currentBusinessPath();
  const basePath = path.split(/[?#]/)[0];
  const moduleId = moduleHomeFor(path);
  // The original profile theme aliases redirect directly to me.html and drop
  // other queries. Keep the dossier addressable; module navigation still opens
  // the native profile menu through App/EnterpriseShell.
  if (moduleId && moduleId !== 'profile') {
    window.location.replace(moduleLandingUrl(moduleId, path));
    return;
  }
  const page = (pageData as PageRecord[]).find((item) => item.path === basePath);
  if (!page) return;
  let source = document.querySelector<HTMLElement>('.phone-container');
  if (!source) {
    source = document.createElement('div');
    source.className = 'phone-container native-source-container';
    for (const node of Array.from(document.body.children)) {
      if (!['SCRIPT', 'LINK', 'STYLE'].includes(node.tagName)) source.append(node);
    }
    document.body.append(source);
  }
  const host = document.createElement('div');
  host.id = 'web-business-shell';
  document.body.prepend(host);
  ReactDOM.createRoot(host).render(
    <BusinessDocumentShell source={source} page={page} path={path} />,
  );
}
// Bind the original page listeners first, then move the original DOM root.
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => setTimeout(mountBusiness, 0), { once: true });
else setTimeout(mountBusiness, 0);
