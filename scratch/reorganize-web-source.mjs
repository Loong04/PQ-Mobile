import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const root = 'C:/Users/loong/PQ-Mobile/scratch/peoplehcm-web';
const delivery = 'C:/Users/loong/Documents/PeopleHCM-Web';
const require = createRequire(root + '/package.json');
const ts = require('typescript');
const moves = {
  'src/App.tsx': 'src/app/App.tsx',
  'src/main.tsx': 'src/app/entrypoints/main.tsx',
  'src/business.tsx': 'src/app/entrypoints/business.tsx',
  'src/components/EnterpriseShell.tsx': 'src/app/layout/EnterpriseShell.tsx',
  'src/components/BusinessDocumentShell.tsx': 'src/app/business/BusinessDocumentShell.tsx',
  'src/components/ModuleWorkspace.tsx': 'src/app/modules/ModuleWorkspace.tsx',
  'src/components/Dashboard.tsx': 'src/features/overview/pages/DashboardPage.tsx',
  'src/components/Directory.tsx': 'src/features/application-directory/pages/DirectoryPage.tsx',
  'src/components/CommandPalette.tsx': 'src/features/application-directory/components/CommandPalette.tsx',
  'src/components/Preferences.tsx': 'src/features/preferences/pages/PreferencesPage.tsx',
  'src/config/modules.ts': 'src/shared/config/modules.ts',
  'src/config/moduleNavigation.ts': 'src/app/navigation/module-registry.ts',
  'src/generated/pages.json': 'src/app/generated/pages.json',
  'src/i18n/catalogue.ts': 'src/shared/i18n/catalogue.ts',
  'src/lib/navigation.ts': 'src/app/navigation/page-navigation.ts',
  'src/lib/useWorkspace.ts': 'src/app/providers/useWorkspace.ts',
  'src/styles/tokens.css': 'src/shared/styles/tokens.css',
  'src/styles/app.css': 'src/app/styles/application.css',
};
const rootOwned = Object.entries(moves).filter(([old]) => !['src/config/moduleNavigation.ts','src/styles/tokens.css','src/styles/app.css'].includes(old));
const destinations = {
  Locale: 'src/shared/types/preferences.ts', Preferences: 'src/shared/types/preferences.ts',
  defaultPreferences: 'src/shared/theme/preferences.ts', preferencesKey: 'src/shared/theme/preferences.ts', readPreferences: 'src/shared/theme/preferences.ts',
  normalizePage: 'src/shared/navigation/page-path.ts', comparablePage: 'src/shared/navigation/page-path.ts',
  primaryForeground: 'src/shared/theme/contrast.ts',
  safeStorageGet: 'src/shared/storage/browser-storage.ts', safeStorageSet: 'src/shared/storage/browser-storage.ts',
  readFavourites: 'src/features/application-directory/model/favourites.ts',
  PageRecord: 'src/shared/types/navigation.ts',
  ModuleScope: 'src/shared/types/navigation.ts', ModuleGroup: 'src/shared/types/navigation.ts', ModuleOption: 'src/shared/types/navigation.ts',
};
const slash = (value) => value.replaceAll('\\', '/');
function relativeImport(file, target) {
  let reference = slash(path.relative(path.dirname(path.resolve(root, file)), path.resolve(root, target)));
  return reference.startsWith('.') ? reference : './' + reference;
}
function originalTarget(file, specifier) {
  const candidate = slash(path.relative(root, path.resolve(root, path.dirname(file), specifier)));
  if (moves[candidate]) return candidate;
  for (const extension of ['.ts','.tsx','.json','.css']) if (moves[candidate + extension]) return candidate + extension;
  if (candidate.replace(/\.ts$/, '') === 'src/lib/core') return 'src/lib/core.ts';
  return candidate;
}
const initial = {};
for (const folder of ['src','scripts','tests','docs']) {
  function baseline(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) baseline(file);
      else initial[slash(path.relative(delivery,file))] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    }
  }
  baseline(path.join(delivery,folder));
}
fs.writeFileSync('C:/Users/loong/PQ-Mobile/scratch/peoplehcm-structure-delivery-baseline.json', JSON.stringify(initial,null,2));

const coreText = fs.readFileSync(path.join(root,'src/lib/core.ts'),'utf8');
const navigationText = fs.readFileSync(path.join(root,'src/lib/navigation.ts'),'utf8');
function pickDeclarations(text,names) {
  const parsed = ts.createSourceFile('source.ts',text,ts.ScriptTarget.Latest,true);
  return parsed.statements.filter(node => {
    const name = node.name?.text || (ts.isVariableStatement(node) ? node.declarationList.declarations[0].name.text : undefined);
    return names.includes(name);
  }).map(node=>node.getText(parsed)).join('\n\n')+'\n';
}
function write(relative,content) {
  fs.mkdirSync(path.dirname(path.join(root,relative)), {recursive:true});
  fs.writeFileSync(path.join(root,relative),content);
}
write('src/shared/types/preferences.ts',pickDeclarations(coreText,['Locale','Preferences']));
write('src/shared/theme/preferences.ts',"import type { Preferences } from '../types/preferences.ts';\n\n"+pickDeclarations(coreText,['defaultPreferences','preferencesKey','readPreferences']));
write('src/shared/theme/contrast.ts',pickDeclarations(coreText,['primaryForeground']));
write('src/shared/storage/browser-storage.ts',pickDeclarations(coreText,['safeStorageGet','safeStorageSet']));
write('src/shared/navigation/page-path.ts',pickDeclarations(coreText,['normalizePage'])+'\n'+pickDeclarations(navigationText,['comparablePage']));
write('src/features/application-directory/model/favourites.ts',"import { safeStorageGet } from '../../../shared/storage/browser-storage.ts';\nimport { normalizePage } from '../../../shared/navigation/page-path.ts';\n\n"+pickDeclarations(coreText,['readFavourites']));

for (const [oldFile, newFile] of rootOwned) {
  const original = fs.readFileSync(path.join(root, oldFile), 'utf8');
  if (!/\.tsx?$/.test(oldFile)) {
    fs.mkdirSync(path.dirname(path.join(root,newFile)), {recursive:true});
    fs.renameSync(path.join(root,oldFile),path.join(root,newFile));
    continue;
  }
  const source = ts.createSourceFile(oldFile, original, ts.ScriptTarget.Latest, true);
  const changes = [];
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const specifier = node.moduleSpecifier.text;
    if (!specifier.startsWith('.')) continue;
    const target = originalTarget(oldFile,specifier);
    if (target === 'src/lib/core.ts' || target === 'src/config/modules.ts' || target === 'src/config/moduleNavigation.ts' || target === 'src/lib/navigation.ts') {
      const named = node.importClause?.namedBindings;
      if (!named || !ts.isNamedImports(named)) throw new Error('Unexpected core/metadata import in ' + oldFile);
      const groups = new Map();
      for (const item of named.elements) {
        const imported = (item.propertyName || item.name).text;
        const destination = target === 'src/lib/core.ts' || ['PageRecord','ModuleScope','ModuleGroup','ModuleOption'].includes(imported) || (target === 'src/lib/navigation.ts' && imported === 'comparablePage') ? destinations[imported] : moves[target];
        if (!destination) throw new Error('Missing responsibility for ' + imported);
        const bindings = groups.get(destination) || [];
        const alias = item.propertyName ? imported + ' as ' + item.name.text : imported;
        bindings.push((node.importClause.isTypeOnly || item.isTypeOnly ? 'type ' : '') + alias);
        groups.set(destination,bindings);
      }
      const text = [...groups].map(([destination,bindings]) => `import { ${bindings.join(', ')} } from '${relativeImport(newFile,destination)}';`).join('\n');
      changes.push({start:node.getStart(source),end:node.end,text});
    } else if (moves[target]) {
      changes.push({start:node.moduleSpecifier.getStart(source),end:node.moduleSpecifier.end,text:JSON.stringify(relativeImport(newFile,moves[target]))});
    }
  }
  let result = original;
  for (const change of changes.sort((a,b)=>b.start-a.start)) result = result.slice(0,change.start)+change.text+result.slice(change.end);
  if (oldFile === 'src/config/modules.ts') result = result.replace(/export interface PageRecord \{[\s\S]*?\n\}/, '');
  if (oldFile === 'src/lib/navigation.ts') {
    const parsed = ts.createSourceFile(newFile,result,ts.ScriptTarget.Latest,true);
    const remove = parsed.statements.filter(node=>node.name?.text==='comparablePage' || (ts.isVariableStatement(node)&&node.declarationList.declarations[0].name.text==='moduleHomePaths'));
    for(const node of remove.sort((a,b)=>b.getStart(parsed)-a.getStart(parsed))) result=result.slice(0,node.getStart(parsed))+result.slice(node.end);
    result="import { moduleOverviewPaths } from './module-registry.ts';\nexport const moduleHomePaths = moduleOverviewPaths;\n"+result;
  }
  fs.mkdirSync(path.dirname(path.join(root,newFile)), {recursive:true});
  fs.writeFileSync(path.join(root,newFile),result);
  fs.unlinkSync(path.join(root,oldFile));
}
fs.unlinkSync(path.join(root,'src/lib/core.ts'));
console.log('Moved application files, feature screens and shared metadata with import remapping.');
