# CHANGELOG

## v2.0.1

2018-10-09

* fix: 获取context的ip错误
* chore: docker添加logs的volume

## v2.0.0

2018-10-07

* 框架：用Egg重构
* Model层
    - article增加原创、转载字段
    - 新增notification站内通知和stat站内统计模型
    - user简化，去掉不必要字段
    - setting重构，分类型
* 接口
    - 新增voice接口获取一些心灵鸡汤文字
    - 新增ip接口查询ip
* 服务
    - ip查询优先阿里云IP查询，geoip-lite为降级
    - 定时任务换成egg的schedule
    - model proxy重构
    - 业务逻辑拆分，每个model都有其对应的service层
    - admin user和setting初始化流程变更
    - 完善的日志系统
* addon
    - 接入sentry
    - docker支持
    - 增加release tag


## v1.1.0

* 文章归档api（2018.01.04）
* Model代理 (2018.01.28)
* ESlint (2018.02.01

## v1.0.0

* 音乐api (2017.9.26)
* Github oauth 代理 (2017.9.28)
* 文章分类api (2017.10.26)
* Redis缓存部分数据 (2017.10.27 v1.1)
* 评论api (2017.10.28)
* 评论定位 [geoip](https://github.com/bluesmoon/node-geoip) (2017.10.29)
* 垃圾评论过滤 [akismet](https://github.com/chrisfosterelli/akismet-api) (2017.10.29)
* 用户禁言 (2017.10.29)
* 评论发送邮件 [nodemailer](https://github.com/nodemailer/nodemailer) (2017.10.29)
* GC优化 (2017.10.30，linux下需要预先安装g++, **已废弃**)
* 个人动态api (2017.10.30)

