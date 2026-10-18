import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('car dashboard has its official brand and section navigation in a responsive sidebar', async () => {
  const source=await readFile(new URL('../components/cms-dashboard.tsx',import.meta.url),'utf8');
  const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
  assert.ok(/<aside className="cms-sidebar">/.test(source),'Official branding and navigation need a sidebar');
  assert.ok(/src="\/brand\/chida-moore-nav-wordmark\.webp"/.test(source),'Use approved individual wordmark');
  assert.ok(/className="cms-workspace"/.test(source),'Keep editable workspace independent of navigation');
  assert.ok(/\.cms-dashboard-layout\s*\{[^}]*grid-template-columns:\s*220px minmax\(0,1fr\)/.test(css),'Desktop sidebar layout');
  assert.ok(/@media\s*\(max-width:\s*760px\)[\s\S]*\.cms-dashboard-layout\s*\{[^}]*grid-template-columns:\s*1fr/.test(css),'Stack navigation on small screens');
});

test('all vehicle-selection paths guard unsaved gallery and specification edits', async () => {
  const source=await readFile(new URL('../components/cms-dashboard.tsx',import.meta.url),'utf8');
  const selection=source.slice(source.indexOf('const selectVehicle='),source.indexOf('useEffect('));
  assert.ok(/if\(dirty\)/.test(selection),'Guard the common selector, not only one of its callers');
  assert.ok(selection.indexOf('if(dirty)')<selection.indexOf('setSelected('),'Reject switching before replacing selection and editor text');
});
