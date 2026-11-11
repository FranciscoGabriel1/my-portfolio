// Exporta o exemplo da Ada Lovelace (pt) em JSON, a partir do código de dados da API.
const { RESUME_EXAMPLES } = require(`${process.env.CURRICULORAIZ_DIR}/curriculoraiz-api/src/examples/index`)
const ex: any = RESUME_EXAMPLES.find((e: any) => e.id?.includes('lovelace')) ?? RESUME_EXAMPLES[0]
console.log(JSON.stringify(ex, (k, v) => (typeof v === 'function' ? '[fn]' : v), 2).slice(0, 1500))
const content = typeof ex.content === 'function' ? ex.content('pt') : ex.content?.pt ?? ex.localized?.pt ?? ex
require('fs').writeFileSync(process.argv[2], JSON.stringify({ meta: { id: ex.id, template: ex.template }, content }, null, 2))
