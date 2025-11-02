#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const IGNORES = new Set(['node_modules', '.git', 'dist', 'build', 'ml/artifacts', 'vite_page.html', 'served_index_css.txt'])
const ROOT = process.cwd()
const OUT = path.join(ROOT, 'FILE_DESCRIPTIONS.json')

function shouldInclude(file) {
  const rel = path.relative(ROOT, file)
  if (!rel) return false
  if (rel.split(path.sep).some(p => IGNORES.has(p))) return false
  const stat = fs.statSync(file)
  if (stat.isDirectory()) return true
  // include common source/config types
  const exts = ['.js','.ts','.tsx','.jsx','.css','.html','.md','.json','.py']
  return exts.includes(path.extname(file).toLowerCase())
}

async function scanDir(dir, out) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const rel = path.relative(ROOT, full)
    if (IGNORES.has(e.name)) continue
    if (e.isDirectory()) {
      await scanDir(full, out)
    } else if (shouldInclude(full)) {
      try {
        const txt = await fs.promises.readFile(full, 'utf8')
        const lines = txt.split(/\r?\n/).slice(0, 8)
        let preview = ''
        for (let line of lines) {
          line = line.trim()
          if (!line) continue
          // strip comment prefixes
          line = line.replace(/^\/\/\s?/, '')
          line = line.replace(/^\/\*+\s?/, '')
          line = line.replace(/^#\s?/, '')
          line = line.replace(/^<!--\s?/, '')
          preview = line
          break
        }
        out[rel.split(path.sep).join('/')] = preview || `(${path.extname(full) || 'file'})`
      } catch (err) {
        // skip
      }
    }
  }
}

async function generate() {
  const out = {}
  await scanDir(ROOT, out)
  // keep deterministic order
  const sorted = {}
  for (const k of Object.keys(out).sort()) sorted[k] = out[k]
  await fs.promises.writeFile(OUT, JSON.stringify(sorted, null, 2), 'utf8')
  console.log(`Wrote ${OUT} (${Object.keys(sorted).length} entries)`)
}

function watch() {
  console.log('Watching for changes...')
  let timer = null
  const debounced = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { generate().catch(console.error) }, 250)
  }
  // watch root dir (non-recursive on some platforms), so also watch subdirs
  const walkAndWatch = (dir) => {
    try {
      fs.watch(dir, { persistent: true }, (evt, fname) => debounced())
    } catch (e) {}
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      try {
        if (fs.statSync(full).isDirectory() && !IGNORES.has(name)) walkAndWatch(full)
      } catch (e) {}
    }
  }
  walkAndWatch(ROOT)
}

async function main() {
  const args = process.argv.slice(2)
  await generate()
  if (args.includes('--watch') || args.includes('-w')) watch()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
