# Reality design lab website

## 如何部署

1. 将Obsidian vault软连接到根目录`vault`文件夹下(直接clone到根目录应该可以);

   > 如果不想用`vault`这个文件夹名,可以在`publish.config.ts`里面修改`vault_root`配置

2. 执行部署脚本 deploy.sh

   ```
   sh deploy.sh
   ```

3. 部署完成后根据需求将测试部署promote到生产环境

   ```
   vercel promote [刚刚编译完成的测试环境地址] --yes
   ```

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

## 配置说明

```js
const configs = {
  /** Obsidian's Vault root
   * default: vault
   */
  vault_root: 'vault',

  /** 静态资源输出的目录
   *
   * default:vault
   * 完整路径： public/static/{target_root}
   *
   * 每次编译操作都会copy vault里面的静态资源到这个文件夹中；
   * 建议放在static下的一个单独目录，有重大版本更新的时候直接删掉即可 */
  target_root: 'vault',
}
```

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
