# 接入指南

Aster 是纯前端主题：一个 CSS 文件、两个 JS 文件、三张 SVG。你可以把它接到任意后端（Express、Laravel、Django、静态生成器）上。

## 1. 引入资源

```html
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/theme.css">

<script src="assets/js/theme.js" defer></script>
<script src="assets/js/petals.js" defer></script>
```

所有资源使用相对路径，放在子目录里也能工作。

## 2. 页面骨架

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>页面标题 · 你的站点名</title>
  <meta name="theme-color" content="#8fa8ff">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/theme.css">
</head>
<body class="page-home">
  <div class="scroll-progress"><i data-scroll-progress></i></div>
  <div class="bg-aurora"><i></i><i></i><i></i></div>
  <canvas id="petals"></canvas>
  <a class="skip-link" href="#main">跳到内容</a>

  <header class="site-header" id="siteHeader">…</header>

  <main id="main">…</main>

  <footer class="site-footer">…</footer>

  <button class="to-top" data-to-top aria-label="回到顶部">…</button>
  <script src="assets/js/theme.js" defer></script>
  <script src="assets/js/petals.js" defer></script>
</body>
</html>
```

`body` 的页面类：

| class | 用途 |
| --- | --- |
| `page-home` | 首页 |
| `page-list` | 文章 / 讨论 / 资源列表 |
| `page-detail` | 文章 / 讨论详情 |
| `page-about` | 关于 |
| `page-auth` | 登录 / 申请（隐藏站点页头页脚） |
| `page-admin` | 后台（隐藏站点页头页脚） |

## 3. 替换品牌

主题中的品牌名是 `Aster`。替换位置：

1. 每个页面 `.brand-text` 中的 `<b>` 与 `<small>`；
2. 页脚 `.footer-brand`；
3. `<title>`、`meta description`、登录 / 申请页文案；
4. `assets/img/logo.svg` 与 `favicon.svg`。

Logo 是内联 SVG（`views` 中的 `logo()`），也可以换成 `<img src="assets/img/logo.svg" alt="">`。

## 4. 接表单

示例表单都带有：

```html
<body data-demo="true">
<form action="#" data-demo-form method="post">…</form>
```

接入后端时：

1. 删除 `<body>` 上的 `data-demo="true"`；
2. 删除页面底部的 `<a class="demo-badge">`；
3. 把 `action="#"` 换成真实接口；
4. 按后端需要加入 CSRF token、错误提示、成功 flash。

`theme.js` 会拦截所有表单提交，所以不删除 `data-demo` 的话，表单不会发出请求。

### 登录表单

```html
<form class="auth-form" action="/login" method="post">
  <label class="field"><span>用户名</span><input name="username" required></label>
  <label class="field"><span>密码</span><input type="password" name="password" required></label>
  <button class="btn btn-primary btn-block" type="submit">登录</button>
</form>
```

### 申请表单

`apply.html` 使用 `.apply-form`，包含邮箱、用户名、密码、确认密码、备注。备注字段带有“不公开”的样式类 `.field-optional`，可以按业务保留或删除。

## 5. 模板引擎示例

以 Express + EJS 为例：

```js
app.get('/', (req, res) => {
  res.render('home', {
    siteName: '你的站点',
    posts: db.posts.latest(3),
    stats: db.stats(),
  });
});
```

```html
<!-- views/partials/head.ejs -->
<link rel="stylesheet" href="/assets/css/theme.css">
<script src="/assets/js/theme.js" defer></script>

<!-- views/home.ejs -->
<%- include('partials/head', { title: '首页' }) %>
<header class="site-header">…</header>
<main id="main">
  <div class="post-grid">
    <% posts.forEach(post => { %>
      <%- include('partials/post-card', { post }) %>
    <% }) %>
  </div>
</main>
```

把 `articles.html`、`post.html` 中的静态卡片拆成 partial 即可。

## 6. 动效开关

`theme.js` 会读取：

- `localStorage.aster-theme`
- `cookie: aster_theme=light|dark`

如果你已经有主题偏好存储，修改 `theme.js` 顶部的 `applyTheme()` 即可。

`prefers-reduced-motion: reduce` 下会关闭：

- 樱花 Canvas
- 卡片倾斜
- 进入视口显现
- 页面淡入
- 平滑滚动

## 7. 后台页面

`admin.html` 是纯静态示例，用于展示配色与布局。真实项目里通常需要：

- 登录态与权限控制
- 表格分页、筛选
- 表单 CSRF
- 文件上传

主题只提供视觉层，不包含这些后端逻辑。

## 8. 可访问性检查清单

- 每个 `<img>` 有 `alt`
- 按钮使用 `<button type="button">` 或真实提交按钮
- 表单控件有 `<label>`
- 键盘可以打开 / 关闭移动导航
- 焦点样式未被移除
- 颜色对比度满足 WCAG AA
- 保留“跳到内容”链接

## 9. 常见问题

**Q：为什么卡片进入视口才出现？**  
A：`theme.js` 使用 IntersectionObserver 做进入视口动画；没有 JS 时内容默认可见。

**Q：为什么暗色主题没有生效？**  
A：检查 `<html data-theme="light">` 是否被后端覆盖，以及浏览器是否禁用了 localStorage。

**Q：可以直接用于商业项目吗？**  
A：可以，MIT License，保留版权声明即可。
