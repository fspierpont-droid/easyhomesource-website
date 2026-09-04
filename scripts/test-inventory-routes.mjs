import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const root = 'app/api/portal/home-inventory/[id]';
const cases = [
  ['route.ts', ['GET', 'PATCH', 'DELETE']],
  ['documents/route.ts', ['GET', 'POST']],
  ['documents/[documentId]/route.ts', ['DELETE']],
  ['documents/[documentId]/view/route.ts', ['GET']],
  ['documents/[documentId]/download/route.ts', ['GET']],
];
let count = 0;
for (const [file, methods] of cases) {
  const source = await readFile(`${root}/${file}`, 'utf8');
  const code = stripTypeScriptTypes(source.replace(/^import .*;\n/gm, '').replace(/export async function/g, 'async function'));
  for (const method of methods) {
    let calledPath;
    const context = vm.createContext({
      URL, Headers, NextResponse: Response,
      permanentApiRequest: async (_request, path) => {
        calledPath = path;
        return Response.json(file === 'documents/route.ts' && method === 'GET' ? [] : {});
      },
    });
    vm.runInContext(code, context);
    const request = new Request('https://example.test/?category=Other', {
      method, headers: { 'x-filename': 'test.pdf' },
      ...(method === 'PATCH' || method === 'POST' ? { body: '{}' } : {}),
    });
    await context[method](request, { params: Promise.resolve({ id: 'EHS-INV-TEST', documentId: 'DOC-TEST' }) });
    assert.ok(calledPath.startsWith('/api/home-inventory/EHS-INV-TEST'), `${method} ${file}: ${calledPath}`);
    assert.ok(!calledPath.includes('undefined'));
    if (file.includes('[documentId]')) assert.ok(calledPath.includes('/documents/DOC-TEST'));
    count++;
  }
}
console.log(`Passed ${count} inventory route checks with asynchronous params.`);
