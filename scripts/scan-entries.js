#!/usr/bin/env node
/**
 * 扫描项目入口文件并生成 .pm/entries.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.resolve(APP_ROOT, '.pm')
const OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'entries.json')

const ENTRY_DIRS = [
  { dir: 'src/prototypes', prefix: 'prototypes' },
  { dir: 'src/components', prefix: 'components' },
  { dir: 'src/themes', prefix: 'themes' },
]

function scanDirectory(baseDir, prefix) {
  const entries = {}
  const fullDir = path.resolve(APP_ROOT, baseDir)

  if (!fs.existsSync(fullDir)) return entries

  const items = fs.readdirSync(fullDir, { withFileTypes: true })
  for (const item of items) {
    if (!item.isDirectory()) continue

    const entryFile = path.join(fullDir, item.name, 'index.tsx')
    if (fs.existsSync(entryFile)) {
      const key = `${prefix}/${item.name}`
      entries[key] = `${baseDir}/${item.name}/index.tsx`
    }
  }

  return entries
}

function main() {
  const jsEntries = {}

  for (const { dir, prefix } of ENTRY_DIRS) {
    const entries = scanDirectory(dir, prefix)
    Object.assign(jsEntries, entries)
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ js: jsEntries }, null, 2), 'utf8')

  console.log(`Scanned ${Object.keys(jsEntries).length} entries`)
  for (const key of Object.keys(jsEntries).sort()) {
    console.log(`  ${key} -> ${jsEntries[key]}`)
  }
}

main()
