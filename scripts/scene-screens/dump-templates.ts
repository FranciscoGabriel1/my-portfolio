// Exporta o catálogo de modelos (pt) a partir do código da API, com todas as flags de modelo ligadas.
const { localizedCatalog, TEMPLATES } = require(`${process.env.CURRICULORAIZ_DIR}/curriculoraiz-api/src/templates/registry`)
const flags: any = new Proxy({}, { get: () => true, has: () => true })
const list = (localizedCatalog as any)('pt', flags)
require('fs').writeFileSync(process.argv[2], JSON.stringify(list, null, 2))
console.log((list as any[]).map((t) => t.id + ':' + t.tier).join(', '), '| definidos:', TEMPLATES.length)
