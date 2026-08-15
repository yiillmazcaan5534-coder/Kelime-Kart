import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const html = await readFile(join(dist, 'index.html'), 'utf8')
const cssMatch = html.match(/<link[^>]+href="\/(assets\/[^"?]+\.css)"[^>]*>/)
const jsMatch = html.match(/<script[^>]+src="\/(assets\/[^"?]+\.js)"[^>]*><\/script>/)

if (!cssMatch || !jsMatch) throw new Error('Web dosyaları bulunamadı.')

const cssPath = `/${cssMatch[1]}`
const jsPath = `/${jsMatch[1]}`
const files = {
  '/': [html, 'text/html; charset=UTF-8'],
  '/index.html': [html, 'text/html; charset=UTF-8'],
  [cssPath]: [await readFile(join(dist, cssMatch[1]), 'utf8'), 'text/css; charset=UTF-8'],
  [jsPath]: [await readFile(join(dist, jsMatch[1]), 'utf8'), 'text/javascript; charset=UTF-8'],
  '/favicon.svg': [await readFile(join(dist, 'favicon.svg'), 'utf8'), 'image/svg+xml'],
}

const worker = `const files = ${JSON.stringify(files)};\n\nexport default {\n  fetch(request) {\n    const asset = files[new URL(request.url).pathname] || files['/'];\n    return new Response(asset[0], { headers: { 'content-type': asset[1] } });\n  },\n};\n`

await writeFile(join(dist, 'server', 'index.js'), worker)
