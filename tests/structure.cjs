const fs = require('fs'), path = require('path'), assert = require('assert'), acorn = require('acorn');
const root = path.dirname(__dirname), dir = path.join(root, 'android/assets/js'), html = fs.readFileSync(path.join(root, 'android/assets/index.html'), 'utf8');
assert.equal([...html.matchAll(/<script type="module" src="js\/app.js"><\/script>/g)].length, 1);
assert(!/<script>|<style>/.test(html));
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')), graph = new Map(), moduleExports = new Map();
let count = 0;
for (const file of files) {
  const ast = acorn.parse(fs.readFileSync(path.join(dir, file), 'utf8'), {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }), dependencies = [];
  const names = new Set();
  for (const n of ast.body) {
    if (n.type === 'ImportDeclaration')
      dependencies.push(path.basename(n.source.value));
    if (n.type === 'ExportNamedDeclaration')
      for (const s of n.specifiers)
        names.add(s.exported.name);
    if (n.type === 'FunctionDeclaration')
      count++;
  }
  graph.set(file, dependencies);
  moduleExports.set(file, names);
}
const visiting = new Set(), visited = new Set();
function visit(file) {
  assert(graph.has(file), 'missing module ' + file);
  assert(!visiting.has(file), 'module cycle ' + file);
  if (visited.has(file))
    return;
  visiting.add(file);
  for (const d of graph.get(file))
    visit(d);
  visiting.delete(file);
  visited.add(file);
}
visit('app.js');
assert.equal(visited.size, files.length);
assert(!moduleExports.get('store.js').has('storageBroken'));
assert(!moduleExports.get('catalog.js').has('detailId'));
assert(!moduleExports.get('draw.js').has('chosen'));
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
assert.equal(version.code, 10401);
assert.equal(version.name, '1.4');
const router = fs.readFileSync(path.join(root, 'android/src/cn/localmenu/app/LocalWebClient.java'), 'utf8');
for (const file of files)
  assert(router.includes(file.slice(0, -3)));
assert(router.includes('/photos/placeholder.svg'));
assert(!fs.existsSync(path.join(root, 'offline-signing')));
console.log(`ESM structure passed: ${ files.length } reachable modules, no cycles, private state unexported.`);
