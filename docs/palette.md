# 配色与设计参数

## 核心色

| Token | Light | Dark | 用途 |
| --- | --- | --- | --- |
| `--bg` | `#f6f9ff` | `#070d1a` | 页面底色 |
| `--bg-2` | `#eef3ff` | `#0c1528` | 次级背景 |
| `--surface` | `rgba(255,255,255,.62)` | `rgba(14,24,45,.66)` | 玻璃卡片 |
| `--surface-solid` | `#ffffff` | `#0f1a30` | 不透明表面 |
| `--ink` | `#17223d` | `#eaf2ff` | 主文字 |
| `--ink-2` | `#4b5b7d` | `#b6c6e4` | 次级文字 |
| `--ink-3` | `#8593b1` | `#7e90b0` | 辅助文字 |
| `--line` | `rgba(70,110,190,.13)` | `rgba(140,180,255,.14)` | 细描边 |
| `--pink` | `#ff9ec7` | 同左 | 樱粉强调 |
| `--purple` | `#8fa8ff` | 同左 | 雾紫强调 |
| `--cyan` | `#6ec8ff` | 同左 | 天蓝强调 |
| `--gold` | `#ffd08a` | 同左 | 提示色 |
| `--green` | `#7fe0c0` | 同左 | 成功色 |

## 渐变

```css
--grad: linear-gradient(120deg, #6ec8ff 0%, #8fa8ff 48%, #ff9ec7 100%);
--grad-soft: linear-gradient(135deg, rgba(110,200,255,.15), rgba(143,168,255,.12) 50%, rgba(255,158,199,.15));
```

- 主渐变只用于标题、主按钮、进度条、重点描边
- 大面积背景使用 `--grad-soft` 或纯色，避免视觉疲劳
- 一个屏幕内主渐变出现不超过 3 处

## 字体

```css
--font: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
        "Noto Sans CJK SC", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Noto Serif SC", "Songti SC", "STSong", "SimSun", ui-serif, Georgia, serif;
--font-mono: "JetBrains Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace;
```

- 正文 15.5px / 行高 1.7
- 文章正文 16px / 行高 1.9
- 大标题使用衬线字体，正文使用无衬线
- 不打包字体文件，全部回退到系统字体

## 圆角与阴影

| Token | 值 | 用途 |
| --- | --- | --- |
| `--radius` | `20px` | 卡片、主容器 |
| `--radius-sm` | `14px` | 小卡片、输入框 |
| 按钮 | `999px` | 胶囊按钮 |
| `--shadow` | `0 26px 64px -34px rgba(62,108,190,.42)` | 悬浮层 |
| `--shadow-sm` | `0 12px 32px -20px rgba(62,108,190,.32)` | 卡片 |

## 玻璃层

```css
background: rgba(255, 255, 255, 0.62);
border: 1px solid rgba(70, 110, 190, 0.13);
backdrop-filter: blur(18px) saturate(130%);
-webkit-backdrop-filter: blur(18px) saturate(130%);
```

调整建议：

- 背景复杂时降低透明度到 `.5`，提高模糊到 `24px`
- 文字密集的卡片使用 `.72` 以上的不透明度
- 不要给玻璃层叠加过重的阴影，否则会显脏

## 动效参数

| 动效 | 时长 | 缓动 |
| --- | --- | --- |
| 页面淡入 | 550ms | `cubic-bezier(.2,.7,.3,1)` |
| 卡片进入 | 640ms | `cubic-bezier(.2,.7,.3,1)` |
| 悬停 | 250–350ms | `ease` |
| 卡片倾斜 | 跟随指针 | 最大 ±5° |
| 渐变流动 | 12s | `ease` 无限循环 |

所有非必要动效在 `prefers-reduced-motion: reduce` 下关闭。
