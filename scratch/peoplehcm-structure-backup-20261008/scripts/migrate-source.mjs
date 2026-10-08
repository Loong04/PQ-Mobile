import { cpSync, readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] || (existsSync(resolve(root,'source-snapshot')) ? resolve(root,'source-snapshot') : 'C:/Users/loong/PQ-Mobile'));
const target = resolve(root, 'public/workspace');
if (source === root || source === target) throw new Error('Migration source must be the original mobile project.');
mkdirSync(target, { recursive:true });
const hashes = [];
for (const entry of readdirSync(source, { withFileTypes:true })) {
  if ((entry.isDirectory() && ['css','js','modules','assets'].includes(entry.name)) || (entry.isFile() && /\.(?:html|jpg|png|svg|jpeg|webp)$/i.test(entry.name))) {
    cpSync(resolve(source,entry.name),resolve(target,entry.name), { recursive:true });
  }
}
function walk(folder) {
  for (const entry of readdirSync(folder,{ withFileTypes:true })) {
    const file = resolve(folder,entry.name);
    if (entry.isDirectory()) walk(file);
    else {
      const path = relative(target,file).replaceAll('\\','/');
      if (!existsSync(resolve(source,path))) continue;
      const original = readFileSync(file);
      const record = {path, sha256:createHash('sha256').update(original).digest('hex')};
      hashes.push(record);
      if (!path.endsWith('.html')) continue;
      let html = original.toString('utf8');
      record.inlineScriptsSha256 = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match=>! /\bsrc\s*=/.test(match[1])).map(match=>createHash('sha256').update(match[2]).digest('hex'));
      record.fieldMarkupSha256 = [...html.matchAll(/<input\b[^>]*>|<select\b[^>]*>[\s\S]*?<\/select>|<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi)].map(match=>createHash('sha256').update(match[0]).digest('hex'));
      html = html.replace(/<html\b([^>]*)>/i,(_match,attributes)=>'<html'+attributes.replace(/\sdata-theme=["'][^"']*["']/i,'')+' data-theme="light" data-peoplehcm-web="" data-web-native="">');
      // Keep all original business markup and scripts. Only presentation dependencies are replaced.
      html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"']+\/css\/all\.min\.css/g,'/vendor/fontawesome/css/all.min.css');
      html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2?[^"']*/g,'/vendor/fonts.css');
      html = html.replace(/(<meta\s+name=["']viewport["']\s+content=["'])[^"']*(["'][^>]*>)/i,'$1width=device-width, initial-scale=1.0$2');
      html = html.replace(/<\/head>/i,'<link rel="stylesheet" href="/web-adapter/desktop.css" data-web-presentation>\n</head>');
      const bridge = '<script src="/web-adapter/translations.js" defer data-web-presentation></script><script src="/web-adapter/bridge.js" defer data-web-presentation></script><script type="module" src="/web-entry.js" data-web-presentation></script>';
      html = html.includes('</body>') ? html.replace(/<\/body>/i,bridge+'\n</body>') : html+bridge;
      writeFileSync(file,html);
      record.webSha256 = createHash('sha256').update(html).digest('hex');
    }
  }
}
walk(target);
// Original module menu stubs pointed to absent pages. Route to complete existing flows.
const aliases = {
  'homedark-v2.html':'index.html',
  'modules/leave/options/apply.html':'leave.html?view=apply&webAction=leave-apply',
  'modules/leave/options/balance.html':'leave.html?webAction=leave-balance',
  'modules/leave/options/history.html':'leave.html?webAction=leave-history',
  'modules/leave/options/team.html':'leave.html?webAction=leave-team',
  'modules/me/options/personal.html':'me.html?scroll=bento-personal',
  'modules/me/options/qualification.html':'me.html?scroll=bento-education',
  'modules/me/options/payroll.html':'me.html?scroll=bento-finance',
  'modules/me/options/contacts.html':'me.html?scroll=bento-contact',
  'modules/me/options/family.html':'me.html?scroll=bento-personal',
  'modules/me/options/change-request.html':'change-request.html',
};
for(const [path,destination] of Object.entries(aliases)){
  const output=resolve(target,path);mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>PeopleHCM</title><script>location.replace('/workspace/${destination}')</script></head><body><a href="/workspace/${destination}">Open page</a></body></html>`);
}
const vendor = resolve(root,'public/vendor');
mkdirSync(vendor,{recursive:true});
const icons = resolve(root,'node_modules/@fortawesome/fontawesome-free');
if (existsSync(icons)) {
  cpSync(resolve(icons,'css'),resolve(vendor,'fontawesome/css'),{recursive:true});
  cpSync(resolve(icons,'webfonts'),resolve(vendor,'fontawesome/webfonts'),{recursive:true});
}
const font = resolve(root,'node_modules/@fontsource/plus-jakarta-sans/files');
if (existsSync(font)) cpSync(font,resolve(vendor,'fonts'),{recursive:true});
writeFileSync(resolve(vendor,'fonts.css'),[400,500,600,700,800].map(weight=>`@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:${weight};font-display:swap;src:url('/vendor/fonts/plus-jakarta-sans-latin-${weight}-normal.woff2') format('woff2');}`).join('\n'));
mkdirSync(resolve(root,'docs'),{recursive:true});
writeFileSync(resolve(root,'docs/source-manifest.json'),JSON.stringify({source,generatedAt:new Date().toISOString(),files:hashes},null,2));
console.log(`Preserved ${hashes.length} assets including ${hashes.filter(row=>row.path.endsWith('.html')).length} business pages.`);
