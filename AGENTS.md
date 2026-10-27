# 项目协作总纲

本文件是 Codex 参与本项目时的总入口。它只定义项目边界、规则路由、质量门禁和安全底线；具体做法必须读取对应的 `rules/` 文档。

## 1. 项目对象与目录边界

本项目是原型浏览工具，承载原型、主题、文档的预览、切换、批注和评审。

| 对象 | 判定标准 | 代码位置 |
| --- | --- | --- |
| 原型浏览工具 | 预览外壳、路由、侧边栏、批注、快捷键、Figma 复制 | `tools/` |
| 前端原型 | 面向终端用户的业务页面或流程 | `src/prototypes/<name>/` |
| 后台原型 | 面向运营、管理员或内部员工的业务页面或流程 | `src/prototypes/<name>/` |
| 项目文档与内容 | PRD、SPEC、主题、默认数据和项目资料 | `src/docs/`、`src/themes/`、`src/resources/` |
| 部署运行时 | Worker、Static Assets 和 KV 配置 | `worker/`、`wrangler.jsonc` |

后台原型仍然是业务内容，不得放入 `tools/`。新增功能前按架构指南声明对象类型、目录和业务原型的路由分类。内容层不得反向 import `tools/`；跨层引用遵守架构指南。

## 2. 开始任务时的规则路由

按以下顺序读取上下文：

1. 根目录 `AGENTS.md`、`CONTEXT.md` 和 `README.md`。
2. 按请求语义和修改范围读取对应规则，无需用户明确要求“按规则”；创建类请求必须在规划和实施前读取：

   | 修改内容 | 必读规则 |
   | --- | --- |
   | 目录归属、跨层引用、动态导入 | `rules/architecture-guide.md` |
   | 前端/后台原型的创建、新增或实现 | `rules/prototype-development-guide.md`、`rules/architecture-guide.md` |
   | 原型页面、状态、路由、组件的修改 | `rules/prototype-development-guide.md`；状态和路由另读 `rules/prototype-state-and-route-guide.md`，组件另读 `rules/component-guide.md` |
   | 主题的创建、导入、派生或验收 | `rules/theme-guide.md`、`rules/architecture-guide.md` |
   | 调试、视觉或交互问题 | `rules/debugging-guide.md`、`rules/design-guide.md` |
   | PRD、SPEC 和文档交接 | `rules/requirements-alignment-guide.md`、`rules/documentation-guide.md` |
   | 参考资料、附件和资源归档 | `rules/resource-management-guide.md` |
   | Worker、KV、Cloudflare 或批注 API | `rules/cloudflare-deployment-guide.md` |
   | 检查命令、提交和推送 | `rules/quality-gates-guide.md`、`rules/git-hooks-guide.md` |

3. 涉及多个范围时读取对应规则的并集；涉及业务内容时，再读取目标原型的 PRD、SPEC、主题和补充模型文档。

规则优先级为：用户明确要求 > 本文件 > 对应 `rules/` > PRD/SPEC/README 中的事实约束 > 现有代码。文档冲突或事实不明确时标记“待确认”，不要从 mock 数据自行推断生产逻辑。

## 3. 变更与验收门禁

代码变更至少运行 `npm run lint`、`npm run build`；按 `rules/quality-gates-guide.md` 的范围矩阵完成额外检查和验收，纯文档变更按文档对应项执行。浏览器验收不能被 Git Hook 替代。

Git Hook 的确定性检查、安全边界和紧急绕过要求统一遵守 `rules/git-hooks-guide.md`。

## 4. 安全与事实边界

- 当前批注 API 没有用户身份校验、租户隔离或敏感数据保护。不得在文档或回复中暗示它已经具备这些能力。
- `skills/` 是任务方法和辅助流程，不是项目事实来源；项目规范仍以本文件、`rules/`、PRD/SPEC 为准。

## 5. Git 与交付边界

- 未经用户明确授权，不执行 commit、push、创建分支、合并或发布。
- 提交或推送前确认当前分支、远端、待提交或推送范围和工作区已有改动，避免带入无关改动。
- 完成任务时说明修改结果、验证命令、未解决风险和是否提交/推送。

## 6. 回复要求

使用用户能理解的中文说明结果；如需用户验收，提供页面路径、预览地址或截图位置。每次回复结尾带上 `🐱喵`。
