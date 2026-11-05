# 架构

UI使用原生ES modules，不依赖框架或打包器。Android通过固定的HTTPS本地源提供打包资源，外部文件路径不会映射到AssetManager。

```mermaid
flowchart TD
  App[app: 启动与渲染] --> Catalog[catalog / catalog-view]
  App --> Features[planner / draw / takeout / photos / settings]
  Catalog --> Store[store: 数据与订阅]
  Features --> Store
  Store --> Validation[validation]
  Store --> Persistence[Native桥 或 localStorage]
  Catalog --> Display[data: 格式与显示工具]
  Display --> Seeds[seed-data]
```

数据只能经store写入。修改时复制当前快照，校验后保存；保存失败保留原快照，成功后通知订阅者。planner的索引按快照引用失效，避免编辑后使用旧营养值。

详情页面的交互和返回栈在catalog内；catalog-view只生成显示内容。照片编辑状态由photos持有，其他模块通过明确导入的状态对象使用，不散落为全局变量。未导出的状态属于模块私有实现。

历史数据中的schema=1、SharedPreferences文件menu/data以及seedVersion/menu130标记保持兼容。函数ensureStarterCatalog使用历史标记，命名不再绑定某个显示版本。

Android的MainActivity负责生命周期、系统边距、相册和数据桥；LocalWebClient只服务允许的JS、CSS、图片；AppUpdater负责HTTPS更新、最多5次安全重定向、哈希及签名校验和安装缓存清理。

构建从version.json生成Java常量和浏览器版本元数据，每次使用独立临时目录。公开包与本地素材包使用相同业务代码；公开包仅带允许分发的素材，缺图由本地SVG代替。正式包与开发包的包名和签名不同，不会互相覆盖。
