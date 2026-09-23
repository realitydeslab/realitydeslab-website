# Reality Design Lab website

## 本地开发与检查

网站使用 Next.js、React、Tailwind CSS 和 Contentlayer；详细项目内容来自单独的 Obsidian 仓库。安装 Node.js 22 或更新版本，使用 npm 和 `package-lock.json`。

```sh
ln -s ../Reality_Design_Lab vault
npm ci
npm run dev
```

已有 `vault` 时不要重复创建。路径由 `.env` 中的 `VAULT_ROOT` 指定；`PUBLISH_ROOT` 指定生成媒体目录。当前跟踪的 `.env` 只有公开构建配置；令牌等私密值应保存在未跟踪的 `.env.local` 中。

```sh
npm run lint
npm run typecheck
npm test
npm run audit:content
npm run build
npm start
```

`npm run content` 会重新准备 Obsidian 内容。编辑 vault 后需要运行它；网站不直接监听 vault。`published: true` 是发布开关，旧的 `draft` 字段不参与判断。首页鼠标悬停静音预览，点击封面进入详情；触屏直接点击封面。

## 部署

先确认 Vercel 关联的项目，再执行 `sh deploy.sh` 生成预览。验证实际预览地址后，用 `sh promote.sh <verified-preview-url>` 将该预览提升为生产版本。不要猜测“最近一次”的部署地址。

Vault 仓库的 `.github/workflows/deploy.yml` 是自动上线入口：推送 vault 的 `main` 或手动运行 workflow，会构建暂不接管域名的生产部署，检查路由与媒体后才提升到 `reality.design`。GitHub Actions 需要 `VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`、`VERCEL_TOKEN` 和 `VERCEL_AUTOMATION_BYPASS_SECRET` 四项 repository secret；最后一项只用于访问受 Vercel Authentication 保护的预部署，不能放进仓库或聊天记录。

## 内容与维护

- Obsidian 保存项目全文、出版物、展览和照片原件；Notion 同时保存完整可读的项目图文、展览选项、论文信息及实验室链接。
- 项目的 `_archive` 保存原图和来源清单，`_resources` 保存用于网页的图片。公开 Markdown 引用压缩版本。
- `scripts/archive-media.mjs` 下载并验证清单中的照片，生成 SHA-256 校验值和 WebP。
- `docs/maintenance/project-inventory.json` 由内容审计生成；缺少论文章节不等于项目存在错误，需要按实际成果判断。
- `skills/reality-design-lab-maintenance/SKILL.md` 是本项目的维护 skill。
- `.cache`、`.contentlayer`、`.next`、`public/media` 和 `output` 是生成文件或本地验证产物，不应作为内容源。

## 部分目录功能说明

```
:root
 - cache
   - *.json  #编译后临时生成vault相关数据
 - data/
   - headerNavLinks.ts 导航配置
   - siteMetadata.js SEO相关的一些配置（原项目自带，暂时没用到）
- defs
   - *.ts #页面结构定义，文件名就是页面类型
- plugins # 自定义的一些编译预处理插件
   - rehypeHiddenElement.ts #移除md的<hide/>标签中的内容
   - remarkHandleWikilink.ts #自定义针对md中wikilink的处理逻辑（重写路由、资源文件的处理）
   - remarkImageToNextImage.ts #md中的<img>转换为 Next/Image
- scripts
   - prebuild.mjs #编译前的预处理（抓去vault文件目录生成json格式的map）
```

## 自定义组件说明

### Contacts & Contact

联系信息，Contact必须传 title 参数

```markdown
<Contacts>
   <Contact title="contact info">[dev@reality.design](mailto::test@website)</Contact>
   <Contact title="twitter/X">[realitydeslab](https://website)</Contact>
   <Contact title="linkedIn">[Reality Design Lab](https://website) </Contact>
</Contacts>
```

### Members

成员列表，根据md语法，每个用户之间必须空一行

```markdown
<Members>
Boxiong Zhao

Chu Zhang

..
</Members>
```

### Hide or hide

自己在obsidian中查看，不希望在website中展示的内容放在这个标签中

```markdown
<hide>Hidden contents</hide>

<Hide>Hidden contents</Hide>
```

### ImageControl

控制md中图片展示形式

```markdown
<ImageControl style={{height:"30rem"}} align="right">
![[image.png]]
</ImageControl>
```

## 配置与生成文件

`.env` 中的 `VAULT_ROOT` 指向 Obsidian 仓库，`PUBLISH_ROOT` 默认为 `media`，`CACHE_ROOT` 默认为 `.cache`。不要把整个 vault 复制到 `public`。

`npm run content` 完成发布内容编译后，会验证所有被引用的媒体，并把不再引用的媒体、旧文档产物和旧 `public/static/vault` 移到 `output/asset-quarantine/`。原始 Obsidian 文件不受影响。只读检查可运行 `node scripts/prune-published-assets.mjs`。构建报告位于 `output/audit/published-assets.json`。

缺失媒体会使构建失败；未发布或无法解析的 wikilink 会显示为文本。存在同名文档时，用完整 vault 路径，例如 `[[Projects/Composable Life/Composable Life|Composable Life]]`。

不要让 dev watcher 和发布内容构建同时写入 `.contentlayer`；发布检查前先停掉该仓库的开发服务器，构建完成后用 `npm start` 检查生产版本。

## 常见问题

### Project在Obsidian中如何配置？

```markdown
---
title: 标题(必填)
slug: 必填，确保唯一性
codename: 侧边栏中的项目名称显示这个（必填）
type: Project (必填，首字母大写)
published: true
yearStart: 2018
yearEnd: 2019
cover: "[[image.png]]" (默认展示的封面，必填)
coverVideo: "[[video.mp4]]" (hover后展示的视频,选填，不填只展示cover)，
preview: （数组，一组图片展示在详情页最后，选填）
  - "[[image.png]]"
  - "[[image.png]]"
---

<!--详细的配置参考defs/project.ts-->
```

### 如何控制文章的发布状态？

`published: true`即可，draft字段目前不参与判断

### markdown中连续插入多个图片，部分不显示？

每个图片中间需要空一行

```markdown
<!--错误做法-->

![[_resources/Use HoloKit for Educational Purpose/013dfe64b68a2e220622b3092b339532_MD5.png]]
![[_resources/Use HoloKit for Educational Purpose/d615999034e27295769807104b398f3c_MD5.png]]
![[_resources/Use HoloKit for Educational Purpose/c2a679e424de379972003f7896eeabcc_MD5.png]]
![[_resources/Use HoloKit for Educational Purpose/6b8d5078a9c5f6cd96647cc4cfe95686_MD5.png]]
![[_resources/Use HoloKit for Educational Purpose/05db707ddae141666cecd5e2c52540fc_MD5.png]]
```

```markdown
<!--正确做法-->

![[_resources/Use HoloKit for Educational Purpose/013dfe64b68a2e220622b3092b339532_MD5.png]]

![[_resources/Use HoloKit for Educational Purpose/d615999034e27295769807104b398f3c_MD5.png]]

![[_resources/Use HoloKit for Educational Purpose/c2a679e424de379972003f7896eeabcc_MD5.png]]

![[_resources/Use HoloKit for Educational Purpose/6b8d5078a9c5f6cd96647cc4cfe95686_MD5.png]]

![[_resources/Use HoloKit for Educational Purpose/05db707ddae141666cecd5e2c52540fc_MD5.png]]
```
