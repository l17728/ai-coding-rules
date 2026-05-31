---
name: architecture-db
description: Use when designing architecture or a database schema. Covers config-driven schema with zero DDL migration, structured-source-of-truth vs derived data, SQLite→Postgres path, mechanism/strategy split, and dependency injection.
---

# 架构与数据库（🟡 多为本组织偏好）

- **配置驱动 + 零 DDL 迁移**：实体 schema 是 `config/schemas/*.json`；增删字段是配置变更，不是迁移。业务数据存 `nodes`/`edges` 的 `properties` JSON 列；运行时改 schema 经 API 写回配置文件。
- **结构化优先**：写入走结构化模型（单一数据源）；知识图谱/索引是推导数据，可随时重建，不接受直接写入。
- **DB 演进**：SQLite 起步（零运维、`:memory:` 利测试）→ 增长后迁 Postgres（JSONB 续存业务数据）。时间戳一律 UTC。
- **mechanism/strategy 分离**：通用 CRUD 机制 + 配置化策略，少写专用端点。
- **CLI 同步**🟡：每个 API 配 CLI 命令（agent 驱动入口，完备性定义的一部分）。
- **依赖注入**：便于测试替身；测试用 `createApp()`/`makeTestApp()`，**不要 import `server.ts`**（它会 listen 致端口冲突）。
- **文档即架构记录**：设计决策折叠进 PRD/CLAUDE.md，不另存独立 spec。周期末查一致性：路由vs文档、模型vsDDL、README命令vs实际 scripts。
