# Crystal Barrage Server

# 使用

`部署系统` : Ubuntu 14.10 x86

`Node.js版本` : v0.12.2 or more

`MySQL版本` : Any version

# 配置

1. 数据库配置 : `config.js`
2. 微信配置Token等 `handler.js`


# 启动

```bash
npm install
npm start
```

# 注意问题

1. 数据库采用utf-8编码
2. 绑定80端口
3. 采用Node-forever 守护进程守护整个服务端