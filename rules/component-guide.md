# 组件开发指南

本文档约束公共组件（components）开发的专项规范，聚焦可复用 UI 组件的特殊要求。

## 📁 目录结构

本项目有三种组件，位置不同：

### 1. 通用 UI 组件

```
src/components/ui/<name>.tsx
```

- 使用 `kebab-case` 文件名，如 `button.tsx`、`input.tsx`
- 来自 shadcn/ui 或项目自己维护的基础组件
- 可被 `src/` 和 `tools/` 共同使用

### 2. 工具层组件

```
tools/components/<name>.tsx
```

- 仅供原型预览工具使用，如 `DocDrawer.tsx`、`AnnotationLayer.tsx`、`AnnotationModal.tsx`
- 与业务原型无关，不放入 `src/`

### 3. 业务/复合组件（不推荐随意新建）

```
src/components/<Name>/
├── index.tsx          # 必需：入口组件
├── spec.md            # 必需：规格文档
├── style.css          # 可选：样式文件
└── components/        # 可选：内部子组件
    └── SubComponent.tsx
```

- `<name>` 使用 `PascalCase`，如 `AdminSidebar`、`DataTable`
- 与原型目录区分：组件目录使用大驼峰命名
- 优先在原型目录内部使用 `components/` 子目录，而不是直接新建 `src/components/<Name>/`

## 原型展示模块与交互逻辑

原型内部的展示 UI 和交互逻辑必须分开：

```text
src/prototypes/<name>/
├── <Name>View.tsx         # 展示模块：JSX、语义结构、className
└── use<Name>Logic.ts      # 逻辑模块：状态、校验、数据转换、事件
```

- 展示模块通过 props 接收数据、状态和回调，不直接读取业务数据或管理业务状态。
- 逻辑模块可以调用 hooks 和数据适配器，但不返回 JSX、不写 CSS、不依赖具体 DOM 结构。
- `index.tsx` 只负责调用逻辑模块并组装 View；不要把整页 UI、复杂状态和全部事件处理集中在入口文件。
- 只有当一个展示模块在两个及以上原型中复用时，才考虑提升到公共组件目录。

## 📝 规格文档（spec.md）

### 生成时机

组件设计确认后立即产出。

### 必需内容

```markdown
# [组件名称]

## 功能定义
- 组件职责与使用场景
- 支持的功能特性

## Props 接口
| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| ...  | ...  | ...  | ...    | ...  |

## 使用示例
```tsx
<ComponentName prop1="value" />
```

## 视觉规范
- 尺寸与间距
- 状态样式（默认/悬停/聚焦/禁用）
- 主题适配
```

## 🧩 入口组件（index.tsx）

### 文件头注释

```typescript
/**
 * @name [中文显示名]
 *
 * [可选：简短描述]
 */
```

### Props 设计原则

- 优先使用可选属性，提供合理的默认值
- 支持 `className` 透传，便于外部扩展样式
- 事件回调使用标准命名：`onClick`、`onChange`、`onSubmit` 等
- 复杂配置使用对象类型，避免过多独立属性

### forwardedRef 支持

需要获取 DOM 引用的组件，应使用 `React.forwardRef`：

```tsx
import { forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn('base-class', className)} {...props} />
  }
)
Input.displayName = 'Input'
```

## 🎨 样式规范

### Tailwind 使用

- 优先使用 Tailwind 工具类
- 原型公共样式统一维护在 `src/prototypes/style.css`
- 单个原型的独有样式放在 `src/prototypes/<name>/style.css`
- 复杂样式抽取到对应的样式文件，不写入逻辑模块
- 支持主题变量：`var(--background)`、`var(--foreground)`

### 原型公共样式

`src/prototypes/style.css` 只维护多个原型共同使用的内容层样式、变量和动画，不维护原型浏览工具样式，也不承载某个页面的业务布局。

- 公共选择器使用 `prototype-` 前缀或其他明确命名空间。
- 不要把 `.card`、`.modal`、`.sidebar` 等通用名字直接定义为全局样式。
- 样式只使用一次时留在原型目录内；重复使用后再提升到公共样式。

### 状态样式

必须处理以下状态：

| 状态 | 说明 |
|------|------|
| 默认 | 正常显示 |
| 悬停（hover） | 鼠标悬停 |
| 聚焦（focus） | 键盘聚焦 |
| 禁用（disabled） | 不可用状态 |
| 加载（loading） | 异步操作中 |

## ♻️ 复用原则

按以下优先级选择组件来源：

1. **通用 UI 组件**：`src/components/ui/`（shadcn/ui 基础组件）
2. **主题组件**：`src/themes/<theme>/components/`（主题特定组件）
3. **工具组件**：`tools/components/`（仅用于预览工具内部）
4. **原型内部组件**：`src/prototypes/<name>/components/`（原型专属组件）
5. **新建业务组件**：最后才考虑 `src/components/<Name>/`

避免重复造轮子；新建组件前先确认以上位置是否已有可用实现。

## ✅ 验收清单

- [ ] `index.tsx` 与 `spec.md` 完整存在
- [ ] 顶部包含 `@name` 注释
- [ ] Props 接口完整，有使用示例
- [ ] 支持 `className` 透传
- [ ] 处理了必要的状态样式
- [ ] `check-app-ready.mjs` 验收通过
