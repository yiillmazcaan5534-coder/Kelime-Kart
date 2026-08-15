import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
let html = await readFile(join(dist, 'index.html'), 'utf8')

const cssMatch = html.match(/<link[^>]+href="\/(assets\/[^"?]+\.css)"[^>]*>/)
const jsMatch = html.match(/<script[^>]+src="\/(assets\/[^"?]+\.js)"[^>]*><\/script>/)

if (!cssMatch || !jsMatch) throw new Error('Web dosyaları bulunamadı.')

const css = await readFile(join(dist, cssMatch[1]), 'utf8')
const js = await readFile(join(dist, jsMatch[1]), 'utf8')

html = html.replace(cssMatch[0], `<style>${css}</style>`)
html = html.replace(jsMatch[0], `<script type="module">${js.replace(/<\/script>/g, '<\\/script>')}</script>`)

const worker = `const page = ${JSON.stringify(html)};\n\nexport default {\n  fetch() {\n    return new Response(page, { headers: { 'content-type': 'text/html; charset=UTF-8' } });\n  },\n};\n`

await writeFile(join(dist, 'server', 'index.js'), worker)
