# 资源指南

`src/resources/` 用于存放需要长期保留的参考资料、数据样例和附件，方便后续生成、修改和复盘原型时读取。供工作台浏览的项目文档及其模板默认放在 `src/docs/` 和 `src/docs/templates/`，遵守 `rules/documentation-guide.md`；参考资料与附件默认放在这里，按用途而非文件格式区分。

常见内容包括：

- 参考文档：外部需求资料、参考页面说明、调研原始材料、会议附件等 Markdown、HTML 或其他格式文件
- 图表：Draw.io 可编辑图表，如 `.drawio`、`.drawio.svg`
- 数据样例：JSON、CSV、TSV、YAML、TXT、表格导出文件
- 设计或业务附件：图片、PDF、Office 文档、压缩包等

## 目录边界

- `src/resources/` 存放参考资料、图表、数据样例和业务附件；供工作台浏览的项目文档放在 `src/docs/`。
- 可复用项目文档模板放在 `src/docs/templates/`，新建模板不默认放入 `src/resources/templates/`。
- 本规则不迁移已有文件；更新已有资料时优先维护原路径，迁移另行确认。
- 原型页面专属素材放在对应原型目录内，例如 `src/prototypes/<name>/assets/`。
- 画布截图、原型占位位图、画布生成图等放在对应原型的 `canvas-assets/`，不要搬到资源目录。
- 主题素材放在对应主题目录内，例如 `src/themes/<theme-key>/assets/`。

图片、截图、参考图等素材只在需要长期保留为项目资料时放入 `src/resources/`。

## 资源链接

资源通常保留两种链接：

- 只读链接：用于预览、嵌入、下载或外部读取。
- 编辑链接：Make 管理端地址，用于打开资源详情页，带顶部工具栏和系统编辑能力。

编辑链接统一使用 Make 管理端 deep link：

```text
/?projectId=<projectId>&doc=<resource-path>
```

其中 `resource-path` 是相对 `src/resources/` 的路径，例如 `references/product-brief.md` 或 `flows/order-status.drawio`。

除 Markdown 外，所有资源的只读链接统一使用文档资源文件地址：

```text
/api/docs/<encoded-resource-path>?projectId=<projectId>
```

Markdown 文档 `.md` 的只读预览使用文档预览页：

```text
/spec-template.html?url=<encoded-doc-api-url>
```

其中 `doc-api-url` 通常是 `/api/docs/<encoded-resource-path>?projectId=<projectId>`。
