#!/usr/bin/env node

/**
 * 文档交接校验：检查 PRD、SPEC 及其补充模型是否把真实业务逻辑
 * 与原型 mock 明确分开，并保留可追踪的需求、状态和验收编号。
 *
 * 使用：
 *   node scripts/check-doc-handoff.mjs
 *   node scripts/check-doc-handoff.mjs src/prototypes/<name>
 *   node scripts/check-doc-handoff.mjs --stage draft
 *   node scripts/check-doc-handoff.mjs --json
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.resolve(SCRIPT_DIR, '..')
const DEFAULT_ROOTS = [
  path.join(APP_ROOT, 'src', 'prototypes'),
  path.join(APP_ROOT, 'src', 'docs')
]
const SUPPORTING_DOCS = new Map([
  ['data-model', 'data-model'],
  ['business-flow', 'business-flow'],
  ['state-lifecycle', 'state-lifecycle'],
  ['permission-model', 'permission-model']
])

function parseArgs(argv) {
  const options = { stage: 'handoff', json: false, target: null }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg === '--stage') {
      const stage = argv[index + 1]
      if (!stage || !['draft', 'handoff'].includes(stage)) {
        throw new Error('--stage 必须是 draft 或 handoff')
      }
      options.stage = stage
      index += 1
      continue
    }
    if (arg.startsWith('--')) throw new Error(`未知参数：${arg}`)
    if (options.target) throw new Error('只能指定一个文件或目录作为校验目标')
    options.target = arg
  }

  return options
}

function isMarkdown(filePath) {
  return path.extname(filePath).toLowerCase() === '.md'
}

function isTemplatePath(filePath) {
  return path.basename(path.dirname(filePath)).toLowerCase() === 'templates'
}

function isCandidateByName(filePath) {
  const name = path.basename(filePath).toLowerCase()
  return (
    name === 'spec.md' ||
    name === 'prd.md' ||
    name.includes('spec-') ||
    name.includes('-spec') ||
    name.includes('prd-') ||
    name.includes('-prd') ||
    name.includes('lite-prd') ||
    [...SUPPORTING_DOCS.keys()].some((key) => name === `${key}.md` || name.includes(`${key}-`))
  )
}

function walkMarkdown(root, { explicit = false } = {}) {
  if (!fs.existsSync(root)) return []
  const stats = fs.statSync(root)
  if (stats.isFile()) return isMarkdown(root) ? [root] : []

  const files = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const entryPath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'templates') continue
      files.push(...walkMarkdown(entryPath, { explicit }))
      continue
    }
    if (!isMarkdown(entryPath) || isTemplatePath(entryPath)) continue
    if (explicit || isCandidateByName(entryPath)) files.push(entryPath)
  }
  return files
}

function classifyDocument(filePath, content) {
  const name = path.basename(filePath).toLowerCase()
  if (name.includes('spec')) return 'spec'
  if (name.includes('prd')) return 'prd'
  for (const [key, type] of SUPPORTING_DOCS) {
    if (name === `${key}.md` || name.includes(`${key}-`)) return type
  }
  if (content.includes('页面级状态') || content.includes('原型与正式开发边界')) return 'spec'
  if (content.includes('真实数据交互逻辑') || content.includes('用户故事')) return 'prd'
  return null
}

function addError(errors, filePath, message) {
  errors.push({ file: path.relative(APP_ROOT, filePath), message })
}

function requireText(content, errors, filePath, label, patterns) {
  if (!patterns.some((pattern) => pattern.test(content))) {
    addError(errors, filePath, `缺少${label}`)
  }
}

function checkCommon(content, errors, filePath) {
  const invalidIdPatterns = [
    /US\/FR-\d+/,
    /US\/FR[、,]/,
    /PRD\/INT\/AC_ID/,
    /PRD\/AC_ID/
  ]
  if (invalidIdPatterns.some((pattern) => pattern.test(content))) {
    addError(errors, filePath, '发现合并编号写法，请使用单一的 US-*、FR-*、INT-*、PS-* 或 AC-*-* 编号')
  }
  if (/\{\{[^}]+\}\}/.test(content)) {
    addError(errors, filePath, '仍包含模板占位符 {{...}}，研发交付前必须替换')
  }
}

function checkSpec(content, errors, filePath) {
  requireText(content, errors, filePath, 'SPEC 关联信息', [/^## 0\. 关联信息/m])
  requireText(content, errors, filePath, '原型与正式开发边界', [/原型与正式开发边界/])
  requireText(content, errors, filePath, '原型数据来源说明', [/原型数据源|原型 mock|原型模拟边界/i])
  requireText(content, errors, filePath, '正式开发行为说明', [/正式开发|真实数据源/])
  requireText(content, errors, filePath, 'Mock 到真实的映射', [/mock[\s\S]{0,120}映射/i, /映射[\s\S]{0,120}mock/i])
  requireText(content, errors, filePath, '原型未实现项', [/未实现/])
  requireText(content, errors, filePath, '页面级状态章节', [/页面级状态/])
  requireText(content, errors, filePath, '需求与验收映射章节', [/需求与验收映射|需求追踪/])

  for (const stateId of ['PS-01', 'PS-02', 'PS-03', 'PS-04']) {
    if (!content.includes(stateId)) addError(errors, filePath, `页面级状态缺少 ${stateId}`)
  }
  if (!/(?:US|FR)-\d+/.test(content)) addError(errors, filePath, '缺少需求编号 US-* 或 FR-*')
  if (!/AC-\d{2}-\d{2}/.test(content)) addError(errors, filePath, '缺少统一格式的验收编号 AC-01-01')
}

function checkPrd(content, errors, filePath, stage) {
  requireText(content, errors, filePath, '真实数据交互逻辑章节', [/真实数据交互逻辑/])
  requireText(content, errors, filePath, '原型与正式开发边界说明', [/原型边界|原型 mock|原型模拟/i])
  requireText(content, errors, filePath, '需求追踪矩阵', [/需求追踪矩阵|需求追踪/])
  requireText(content, errors, filePath, '用户需求编号', [/(?:US|FR)-\d+/])
  requireText(content, errors, filePath, '验收编号', [/AC-\d{2}-\d{2}/])
  if (stage === 'handoff' && /页面\s*\/\s*SPEC[^\n]*待设计/.test(content)) {
    addError(errors, filePath, '研发交付阶段仍有页面 / SPEC 标记为“待设计”')
  }
}

function checkSupportingDocument(content, errors, filePath, type) {
  const rules = {
    'data-model': [
      ['数据来源与事实边界', /数据来源与事实边界/],
      ['真实业务来源', /真实业务来源/],
      ['原型 mock 来源', /原型 mock 来源/i],
      ['Mock 到真实字段映射', /Mock 到真实字段映射/i],
      ['待确认项', /待确认项/]
    ],
    'business-flow': [
      ['真实业务流程', /真实业务流程/],
      ['原型演示路径与边界', /原型演示路径与边界/],
      ['冲突处理', /冲突处理/]
    ],
    'state-lifecycle': [
      ['真实状态流转', /真实状态流转/],
      ['原型状态映射', /原型状态映射/],
      ['Mock 触发方式', /Mock 触发方式/i]
    ],
    'permission-model': [
      ['真实权限矩阵', /真实权限矩阵/],
      ['原型权限展示边界', /原型权限展示边界/],
      ['后端校验 / 强制层', /后端校验\s*\/\s*强制层/]
    ]
  }
  for (const [label, pattern] of rules[type] || []) {
    requireText(content, errors, filePath, label, [pattern])
  }
}

function validateFile(filePath, stage) {
  const content = fs.readFileSync(filePath, 'utf8')
  const errors = []
  const type = classifyDocument(filePath, content)
  if (!type) {
    addError(errors, filePath, '无法判断文档类型，请使用 spec、prd 或补充模型文件名')
    return errors
  }

  checkCommon(content, errors, filePath)
  if (type === 'spec') checkSpec(content, errors, filePath)
  if (type === 'prd') checkPrd(content, errors, filePath, stage)
  if (SUPPORTING_DOCS.has(type)) checkSupportingDocument(content, errors, filePath, type)
  return errors
}

function printHuman(payload) {
  const statusLabel = payload.status === 'READY' ? '通过' : '失败'
  process.stdout.write(`文档交接校验：${statusLabel}\n`)
  process.stdout.write(`阶段：${payload.stage}\n`)
  process.stdout.write(`文件：${payload.files.length}\n`)
  if (payload.errors.length > 0) {
    process.stdout.write('\n错误：\n')
    for (const error of payload.errors) {
      process.stdout.write(`- ${error.file}：${error.message}\n`)
    }
  }
  if (payload.warnings.length > 0) {
    process.stdout.write('\n提示：\n')
    for (const warning of payload.warnings) process.stdout.write(`- ${warning}\n`)
  }
}

function main() {
  let options
  try {
    options = parseArgs(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 2
    return
  }

  const target = options.target ? path.resolve(APP_ROOT, options.target) : null
  const files = target
    ? walkMarkdown(target, { explicit: true })
    : DEFAULT_ROOTS.flatMap((root) => walkMarkdown(root))

  const uniqueFiles = [...new Set(files)].sort()
  const errors = uniqueFiles.flatMap((filePath) => validateFile(filePath, options.stage))
  const payload = {
    status: errors.length === 0 && uniqueFiles.length > 0 ? 'READY' : 'ERROR',
    stage: options.stage,
    files: uniqueFiles.map((filePath) => path.relative(APP_ROOT, filePath)),
    errors,
    warnings: uniqueFiles.length === 0 ? ['没有找到可校验的 PRD、SPEC 或补充模型文档'] : []
  }

  if (options.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
  else printHuman(payload)
  process.exitCode = payload.status === 'READY' ? 0 : 1
}

main()
