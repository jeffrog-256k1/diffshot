# Diffshot

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md)

**两个 URL，三种屏幕尺寸，一份可分享的报告。**

[打开示例报告](https://jeffrog-256k1.github.io/diffshot/?lang=zh-CN)

[![Diffshot](assets/preview.png)](https://jeffrog-256k1.github.io/diffshot/?lang=zh-CN)

Diffshot 比较网页的两个版本，标出视觉差异，并生成可离线打开的 HTML 文件。无需配置视觉回归服务，就能说明 UI 的变化。公开演示仅展示虚构页面的结果，不会代为访问用户提交的 URL。

## 本地运行

需要 Node.js 22.12 或更新版本及 npm。无需账号、服务器或付费 API。尚未发布 npm 包，请在克隆的仓库中执行命令。

```sh
git clone https://github.com/jeffrog-256k1/diffshot.git
cd diffshot
npm ci
npx playwright install chromium
```

## 比较页面

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --out reports/review-01 --lang zh-CN
```

将下面的回环 URL 换成你运行的页面或可信的公开网站。用浏览器打开 `reports/review-01/index.html`。图片、样式和控件都已嵌入，只需分享这个文件。还会保存独立 PNG 和不含图片的元数据 `report.json`。现有输出目录不会被覆盖，每次运行请选择新的 `--out` 路径。

## 功能

- 桌面 1440×900、平板 834×1112、手机 390×844。使用全新的 Chromium 上下文，设备缩放 1、UTC、en-US 和浅色主题。
- 按视口宽度截取整页，高度最多 8000px。会提示横向溢出，视口宽度之外的内容不在截图中。
- 并排对比、可拖动滑块、橙色像素差异和 PNG 下载。新增或移除的空白区域也计入差异。
- 输入错误、HTTP/导航失败和遮罩目标缺失均区别于成功比较，部分失败会保留在报告中。
- 报告和 README 支持英语、韩语、简体中文、日语和西班牙语。`--lang` 也会切换 CLI 状态及错误语言；技术参数名和详细帮助仍为英语。

## 选项

| 选项        | 含义                                          |
| ----------- | --------------------------------------------- |
| `--out`     | 新的输出目录；已存在则停止。                  |
| `--path`    | 重复指定，最多 5 个路径。                     |
| `--mask`    | 最多 10 个 CSS 选择器，必须在每个页面中匹配。 |
| `--ready`   | 等待可见元素及字体加载完成。                  |
| `--timeout` | 每个截图操作 1000–60000ms，默认 15000。       |
| `--delay`   | 就绪后等待 0–5000ms，默认 200。               |
| `--lang`    | en、ko、zh-CN、ja、es，默认 en。              |

每个 `--path` 会替换两个基础来源上的路径；不提供时使用原始 URL。查询参数可用于截图，但在报告元数据中会隐藏；片段标识会移除。路径和截图内容不会匿名化。

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --path / --path /about --mask .clock --ready main --out reports/review-02 --lang zh-CN
```

## 解读结果

退出码 0 表示截图成功且报告已写入，画面变化也返回 0；1 表示至少一次截图失败；2 表示参数、环境或写入失败。这是审查工具，不是自动判定通过的 CI 门禁。百分比代表像素差异，不代表错误严重程度。忽略抗锯齿差异，pixelmatch 颜色阈值为 0.1。

## 限制与隐私

截图时停用动画和光标并请求减少动态效果，但时间、动态内容、视频、异步数据及系统字体仍可能不同。用 `--mask` 遮住动态区域，用 `--ready` 指定就绪条件；这不保证页面完全可复现。不支持导入登录会话、爬取网站、AI 解释或自动 PR 评论。页面 JavaScript 会执行，因此仅访问可信页面。报告可能包含私密内容，分享前请检查。文件保留在本地，不会自动上传。

## 开发与验证

```sh
npm test
npm run build
npm run test:browser
npm run dev
```

用 `npm run demo:capture` 和 `npm run build` 重新生成虚构示例。设置 `DIFFSHOT_BROWSER_CHANNEL=chrome` 可使用已安装的 Chrome。Linux 可运行 `npx playwright install --with-deps chromium`。测试涵盖相同页面、CSS 与高度变化、遮罩、HTTP 失败、CLI 退出码、防覆盖、HTML 注入、离线下载、多语言和移动端溢出。

[CONTRIBUTING](CONTRIBUTING.md) · [SECURITY](SECURITY.md) · [CHANGELOG](CHANGELOG.md)

## 许可证

MIT。可以使用导出的报告，但截图内容仍受原权利人的权利约束。

[LICENSE](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

[jeffrog-256k1](https://github.com/jeffrog-256k1) · [leejungjae.app](https://leejungjae.app)
