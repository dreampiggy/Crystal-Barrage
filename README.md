![](https://camo.githubusercontent.com/34163501b801bccea435077de76bf787fa01994b/687474703a2f2f7777342e73696e61696d672e636e2f6c617267652f36323538306464396a773165737630643774706d686a3230336b30336b7132742e6a7067)
#Crystal Barrage
#流星弹幕


## What
## 功能

1. 微信上发送你自己的弹幕，支持Emoji表情
2. 浏览器上享受弹幕炸弹
3. Unity桌面端或者Android客户端，绚丽的UI和展示效果
4. 高性能的服务端，支持每秒上百条弹幕负载


## Folder
## 目录

1. `/Broswer`	浏览器端项目及代码
2. `/Server`	服务端项目及代码
3. `/Unity`		Unity客户端项目
4. `/Extension`	Chrome浏览器插件


## Start
## 开始

1. 下载整个Git仓库
2. 部署服务器：进入`/Server`，导入SQL，修改`/Server/config.js`中的数据库用户名及密码，根据自己的微信公众号配置ip及token，使用`npm install`构建项目，`npm start`启动项目
3. 部署浏览器：进入`/Broswer`，使用`Gulp`构建项目
4. 部署客户端：进入`/Unity`，打开Unity项目，下载依赖库，编译或者Debug运行
5. 简单实用：加载Chrome扩展，点击icon运行

**然后开始微信发发发！！！**
