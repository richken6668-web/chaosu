# 架构分层指南

本文档约束「原型浏览工具」「前端原型」「后台原型」三类对象，以及项目 `src/`（内容层）与 `tools/`（工具层）的职责边界、引用规范与动态导入路径。

## 1. 三类对象与归属

先判断正在创建的东西是什么，再决定代码位置：

| 对象 | 判断标准 | 必须放置 | 不应放置 |
|------|----------|----------|----------|
| 原型浏览工具 | 服务于原型加载、切换、预览、批注或评审 | `tools/` | `src/prototypes/` |
| 前端原型 | 面向终端用户的业务页面或流程 | `src/prototypes/<name>/` | `tools/` |
| 后台原型 | 面向运营、管理或内部工作人员的业务页面或流程 | `src/prototypes/<name>/` | `tools/` |

最重要的边界：后台原型是业务内容，不是原型浏览工具。页面是否使用表格、图表、侧栏、权限和数据工作台布局，不改变它属于 `src/prototypes/` 的事实。

实现前使用以下分类声明：

```text
对象类型：原型浏览工具 / 前端原型 / 后台原型
业务内容目录：src/prototypes/<name>/（仅前端原型或后台原型）
工具实现目录：tools/<directory>/（仅原型浏览工具）
路由分类：frontend / admin（仅业务原型）
```

### 1.1 业务原型内部的分工

每个前端原型或后台原型仍保留独立目录，但目录内部默认拆分展示与逻辑：

```text
src/prototypes/<name>/
├── index.tsx              # 入口和页面组装
├── <Name>View.tsx         # 展示 UI
├── use<Name>Logic.ts      # 交互逻辑、状态和事件
├── components/            # 原型内部可复用展示模块
├── pages/                 # 可选：同一原型的多个内部页面
└── assets/                # 原型专属素材

src/prototypes/style.css   # 多个原型共用的内容层样式
```

- `index.tsx` 是薄的组装模块：调用逻辑模块，把结果传给 View；不直接堆积复杂 JSX、状态和事件流程。
- `*View.tsx` 是展示模块：负责结构、语义和 className，通过 props 接收数据和回调；不读取业务数据、不管理业务状态。
- `use*Logic.ts` 或原型目录内的 `hooks/` 是交互逻辑模块：负责状态、校验、数据转换和事件处理；不返回 JSX，不写 CSS。
- 只有确实被两个及以上原型复用的样式才进入 `src/prototypes/style.css`；公共样式必须使用 `prototype-` 前缀或其他明确命名空间。
- 单个原型独有的样式可以放在该原型目录内，但不得为了方便把页面专属样式塞进公共文件。
- 原型浏览工具的样式不属于上述公共样式，继续由 `tools/` 的工具实现维护。

## 2. 分层目标

- **内容层 `src/`**：只放业务/原型相关内容。修改内容层时，不应关心预览工具如何实现。
- **工具层 `tools/`**：只放原型预览工具。修改工具层时，不应替内容层做业务决策。
- 两层通过明确的 alias 和接口隔离，降低单文件复杂度，方便多人协作和后续扩展。

## 3. 目录职责

### 内容层 `src/`

| 目录 | 职责 | 示例 |
|------|------|------|
| `src/prototypes/` | 前端原型和后台原型组件 | `demo-home/index.tsx`、`demo-admin-orders/index.tsx` |
| `src/themes/` | 主题设计系统 | `linear/DESIGN.md`、`linear/index.tsx` |
| `src/docs/` | 项目 Markdown 文档 | `demo.md` |
| `src/workspace/` | 工作区内容页面 | `HomePage.tsx`、`ThemesListPage.tsx` |
| `src/content/` | 项目内容配置 | `annotations/categories.ts`、`annotations/defaults.ts` |
| `src/components/ui/` | 通用 UI 组件 | `button.tsx`、`input.tsx`、`dialog.tsx` |
| `src/common/` | 内容层共享组件 | `DesignMdBatchShowcase.tsx` |
| `src/lib/` | 通用工具函数 | `utils.ts`（`cn` 等） |
| `src/assets/` | 静态资源 | `hero.png` |
| `src/resources/` | 项目资料与运行时数据 | `annotations.json` |

### 工具层 `tools/`

| 目录 | 职责 | 示例 |
|------|------|------|
| `tools/App.tsx` | 原型浏览工具的路由编排与全局状态组合 | 主应用组件 |
| `tools/shell/` | 界面外壳 | `Sidebar.tsx`、`Topbar.tsx` |
| `tools/tools/` | 工具功能实现 | `AnnotationController.tsx`、`ShortcutsDialog.tsx` |
| `tools/components/` | 工具专属组件 | `DocDrawer.tsx`、`AnnotationLayer.tsx` |
| `tools/hooks/` | 工具层 Hooks | `useAnnotations.ts` |
| `tools/config/` | 动态导入与工具配置 | `pages.ts`、`themes.ts`、`docs.ts` |
| `tools/lib/` | 工具函数 | `annotations.ts`、`shortcuts.ts` |

`tools/hooks/` 存放 React Hook；仓库级 Git Hook 位于 `.githooks/`，两者不可混用。

## 4. import 规范

### 绝对 alias

- `@/...` 始终指向 `src/`
- `@tools/...` 始终指向 `tools/`

### 跨层引用规则

| 场景 | 正确写法 | 说明 |
|------|----------|------|
| 工具层引用内容层 | `import { HomePage } from '@/workspace/HomePage'` | 工具层可以依赖内容层 |
| 内容层引用工具层 | 尽量避免 | 内容层应保持独立，不依赖预览工具 |
| 内容层引用通用 UI | `import { Button } from '@/components/ui/button'` | UI 组件属于共享基础层 |
| 工具层引用通用 UI | `import { Button } from '@/components/ui/button'` | 工具层允许使用通用 UI |
| 工具层内部互相引用 | `import { ... } from '../config/pages'` 或 `@tools/config/pages` | 均可，优先保持清晰 |

### 禁止事项

- 禁止在 `src/` 中使用相对路径 `../tools/...` 引用工具层
- 禁止在 `tools/` 中使用 `../src/...` 引用内容层，统一用 `@/...`
- 禁止把批注、快捷键、复制到 Figma 等工具实现放到 `src/`
- 禁止把原型页面、主题、文档放到 `tools/`

## 5. 动态导入路径

`import.meta.glob` 不支持 alias，必须使用相对路径。文件在 `tools/config/` 下，目标内容在 `src/` 下，因此路径统一写成：

```ts
// tools/config/pages.ts
const allModules = import.meta.glob('../../src/prototypes/*/index.tsx', { eager: true })

// tools/config/themes.ts
export const themeModules = import.meta.glob('../../src/themes/*/index.tsx')
export const themeDesignDocs = import.meta.glob('../../src/themes/*/DESIGN.md', { query: '?raw', import: 'default' })

// tools/config/docs.ts
export const docModules = import.meta.glob('../../src/docs/*.md', { query: '?raw', import: 'default' })
```

### key 匹配规则

glob 返回的 key 包含 `../../src/` 前缀，后续正则或字符串匹配必须同步更新：

```ts
// 错误：path.match(/\.\.\/themes\/([^/]+)\//)
// 正确：
path.match(/\.\.\/\.\.\/src\/themes\/([^/]+)\//)
```

## 6. 新增功能决策树

新增功能或文件时，按以下顺序判断归属：

```text
是否是原型浏览工具本身的能力？
  ├─ 是 → 放入 tools/ 对应子目录
  └─ 否 → 是否是用户可见的业务原型页面？
    ├─ 是 → 先判断页面类型
    │   ├─ 面向终端用户 → 前端原型 → 放入 src/prototypes/<name>/
    │   └─ 面向运营/管理人员 → 后台原型 → 放入 src/prototypes/<name>/
    └─ 否 → 是否是主题设计系统？
      ├─ 是 → 放入 src/themes/<theme-key>/
      └─ 否 → 是否是项目文档？
        ├─ 是 → 放入 src/docs/
        └─ 否 → 是否是内容配置（如批注数据、默认分类）？
          ├─ 是 → 放入 src/content/
          └─ 否 → 是否是通用 UI 组件？
            ├─ 是 → 放入 src/components/ui/
            └─ 否 → 重新评估是否必要，或与用户确认
```

## 7. 常见错误

| 错误 | 后果 | 修正 |
|------|------|------|
| `tools/config/*.ts` 中 glob 路径仍为 `../prototypes/` | 页面/主题/文档列表为空 | 改为 `../../src/prototypes/` |
| 正则匹配未同步 `../../src/` 前缀 | 导航或详情页找不到对应资源 | 正则同步更新 |
| 工具组件放到 `src/components/` | 内容层依赖工具层，破坏隔离 | 移到 `tools/components/` |
| 原型页面引用 `tools/lib/annotations` | 内容层反向依赖工具层 | 改为引用 `src/content/annotations/` 或保持独立 |
| UI 组件放在 `tools/components/ui/` | 内容层无法使用通用 UI | 移到 `src/components/ui/` |
| 把后台原型放入 `tools/` | 业务页面与浏览工具耦合，AI 后续无法区分职责 | 移到 `src/prototypes/<name>/`，并在 `tools/config/pages.ts` 的后台映射中注册 |
| 把侧边栏、批注或 Figma 复制写进 `src/prototypes/` | 具体原型反向承载工作台能力 | 移到 `tools/` 对应目录 |

## 8. 重构或迁移时的检查点

- [ ] 文件目录是否符合「内容层 vs 工具层」定义
- [ ] 是否已明确属于原型浏览工具、前端原型或后台原型
- [ ] 后台原型是否仍位于 `src/prototypes/`，没有误放入 `tools/`
- [ ] `import.meta.glob` 路径是否正确指向 `src/`
- [ ] key 匹配正则是否包含 `../../src/` 前缀
- [ ] 跨层 import 是否使用 `@/` 或 `@tools/`
- [ ] 是否有 `src/` 文件直接 import `tools/` 的反向依赖
- [ ] `vite.config.ts` 和 `tsconfig.app.json` 的 alias 是否同步
- [ ] 运行 `npm run lint`、`npx tsc --noEmit`、`npx vite build` 是否全部通过
