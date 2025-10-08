# 旧物、废品回收uniapp多端小程序、H5、app项目

动动手指，帮忙点下 Star ，让更多人了解我们~

有兴趣一起参与开发的、想贡献代码的，欢迎提交PR！

欢迎大家加入微信交流群，一起参与项目的开发和维护、探讨使用过程中遇到的问题！

本项目可以打包成H5、小程序（维信、支付宝、小红书、抖音等等）、app端（Android、IOS）

如果希望增加什么功能，可以提交 ISSUES ，我们会尽快处理。

## 扫码体验

微信小程序暂时没有测试账号，体验效果会比H5要好很多，大家可以自行本地运行后看效果~

| H5 |
| :------: |
| <img src="https://dcdn.it120.cc/2025/09/26/ada4ecd6-84aa-42ed-8b11-6b8919563b33.png" width="200px"> |

## 交流群

| 微信群 | 微信好友 |
| :------: | :------: |
| <img src="https://s3.apifm.com/pub/2025/09/16/2d881595-6786-495e-9053-208a7d81674b.png" width="200px"> | <img src="https://dcdn.it120.cc/2021/09/13/61a80363-9085-4a10-9447-e276a3d40ab3.jpeg" width="200px"> |

## 快速运行

1. 下载代码后，把最内层文件夹（里面有app.vue 的那一层，不要嵌套好几层）直接拖到 XbuilderX 中
2. manifest.json 里面，微信小程序appid改成你自己的（如果没有，可以申请个测试号: https://mp.weixin.qq.com/wxamp/sandbox?doc=1）
3. 到下面“api工厂”链接注册一个测试账号，登陆后，左侧工厂设置，数据克隆，填写商户号 `150` 将当前测试数据克隆一份，克隆完毕后 F5 刷新下网页
4. 左侧菜单，平台设置，微信小程序，把你的 appid 和 secret 配置上去
5. 代码里 `config.js` 文件打开，subDomain 和 merchantId 改成你自己的专属域名和商户ID，可在后台 “工厂设置” -- “商户信息” 查看
6. XbuilderX 中，点击运行，在微信小程序中运行，就可以查看效果了，然后你可以继续开发。

## 技术栈

- [uni-app](https://uniapp.dcloud.net.cn/)
- [vue3](https://cn.vuejs.org/)
- [scss](https://sass-lang.com/)
- [uni-ui](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)
- [api工厂前端中台](https://www.it120.cc/)

## 效果预览

| H5登录页 |
| :------: |
| <img src="https://dcdn.it120.cc/2025/09/21/2f1ac1b8-90d6-4cf6-89b9-fe0c2b4fb9e6.png" width="300px"> |

| 上门回收 | 上门回收 | 选择城市 |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/16/8ea2136f-4fcf-46c5-9d9f-a32a8c28da22.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/16/1fad8815-df5f-4dc3-872f-ea09a0c1d3b1.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/19/a2d411b9-d2ca-4652-823c-f66ebb5c1015.png" width="300px"> |

| 收货地址A | 收货地址B | 地图选择 |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/16/a173fcb3-7f74-4f90-885d-fb53a554656d.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/16/93e14ecb-7cb5-441e-8b01-5912bc7ae993.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/27/356db48e-2d6e-4c55-bbc8-3c820c685cb9.png" width="300px"> |

| 到店回收 | 选择门店 | 门店导航 |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/19/f515538f-c8f8-45d4-bec2-204f6b1fe3cd.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/17/982155a7-85a1-4595-8fa3-f82c0eecd27a.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/17/1d54f202-1e46-4f0d-ab9c-72746becc845.png" width="300px"> |

| 我的订单 | 订单详情A | 订单详情B |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/19/d0a11830-9e15-4bed-b4e5-4f9eb2687cfd.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/19/0bb40764-0bdf-4043-aa7f-4ee79dc1ef70.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/19/1a6fed59-0e2f-44af-978b-a71a72132651.png" width="300px"> |

| 我的 | 修改资料 | 意见反馈 |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/28/3c417e28-3752-448c-adcf-091d798bae97.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/19/e9f1319d-54c2-424a-b079-31e629dc620b.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/19/6a7f466e-b3b6-4632-8d35-1ddda3391fe5.png" width="300px"> |

| 关于我们 | 账户余额 | 申请提现 |
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/19/0890773d-e8b6-4da4-86f8-1b098db2bbf7.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/20/f2dc70c9-86bc-4e7a-a958-15003a565c72.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/21/891f089f-a506-4eb1-b120-6ed7ce14a93c.png" width="300px"> |

| 积分中心 | 签到功能 | 积分券兑换 | 
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/27/9c1d4bb6-3b01-4d24-8355-c3530b3acd4b.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/26/5702dc03-9862-4b83-bbc5-c797f6acc37a.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/27/1978c423-907a-46d7-9212-3b4531e49fb1.png" width="300px"> |

| 积分商城 | 商品列表 | 商品详情 | 
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/10/08/7a433d4a-98fc-412f-ac89-343e197dc849.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/28/67c28c11-add3-4f85-a5fe-f0f967ba870c.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/28/575fc1ce-7a0c-45c6-9478-c0090253efb2.png" width="300px"> |

| 购物车 | 确认订单 |
| :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/28/818e781a-67d2-446e-97b3-75bac4702e61.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/28/bd6d6c5a-4adf-4248-93a2-ba93303bf672.png" width="300px"> |

| 商城订单列表 | 商城订单详情 |
| :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/09/28/f4da5bfe-5dcf-4c99-87c7-7e306c6d3381.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/09/28/8474b0c9-b49e-4005-ae8b-5a08995ceb9e.png" width="300px"> |

| 砍价频道 | 砍价功能 | 商品详情 | 
| :------: | :------: | :------: |
| <img src="https://dcdn.it120.cc/2025/10/08/ba544c33-4737-456c-8416-8a66200312be.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/10/08/0bf3c036-a7f2-43ae-b4c5-06adca27998c.png" width="300px"> | <img src="https://dcdn.it120.cc/2025/10/08/30d8bc8c-a116-4119-a6a6-03e84edb6b03.png" width="300px"> |

## 其他优秀开源模板推荐
- [天使童装](https://github.com/EastWorld/wechat-app-mall)   /  [码云镜像](https://gitee.com/javazj/wechat-app-mall)  /  [GitCode镜像](https://gitcode.com/gooking2/wechat-app-mall)
- [天使童装（uni-app版本）](https://github.com/gooking/uni-app-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app-mall)  /  [GitCode镜像](https://gitcode.com/gooking2/uni-app-mall)
- [简约精品商城（uni-app版本）](https://github.com/gooking/uni-app--mini-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app--mini-mall)  /   [GitCode镜像](https://gitcode.com/gooking2/uni-app--mini-mall)
- [舔果果小铺（升级版）](https://github.com/gooking/TianguoguoXiaopu)
- [面馆风格小程序](https://gitee.com/javazj/noodle_shop_procedures)
- [AI名片](https://github.com/gooking/visitingCard)  /   [码云镜像](https://gitee.com/javazj/visitingCard)  /   [GitCode镜像](https://gitcode.com/gooking2/visitingCard)
- [仿海底捞订座排队 (uni-app)](https://github.com/gooking/dingzuopaidui)  /   [码云镜像](https://gitee.com/javazj/dingzuopaidui)  /   [GitCode镜像](https://gitcode.com/gooking2/dingzuopaidui)
- [H5版本商城/餐饮](https://github.com/gooking/vueMinishop)  /  [码云镜像](https://gitee.com/javazj/vueMinishop) /  [GitCode镜像](https://gitcode.com/gooking2/vueMinishop)
- [餐饮点餐](https://github.com/woniudiancang/bee)  / [码云镜像](https://gitee.com/woniudiancang/bee) / [GitCode镜像](https://gitcode.com/gooking2/bee)
- [企业微展](https://github.com/gooking/qiyeweizan)  / [码云镜像](https://gitee.com/javazj/qiyeweizan) / [GitCode镜像](https://gitcode.com/gooking2/qiyeweizan)
- [无人棋牌室](https://github.com/gooking/wurenqipai)  / [码云镜像](https://gitee.com/javazj/wurenqipai) / [GitCode镜像](https://gitcode.com/gooking2/wurenqipai)
- [酒店客房服务小程序](https://github.com/gooking/hotelRoomService)  / [码云镜像](https://gitee.com/javazj/hotelRoomService) / [GitCode镜像](https://gitcode.com/gooking2/hotelRoomService)
- [面包店风格小程序](https://github.com/gooking/bread)  / [码云镜像](https://gitee.com/javazj/bread) / [GitCode镜像](https://gitcode.com/gooking2/bread)
- [朋友圈发圈素材小程序](https://github.com/gooking/moments)  / [码云镜像](https://gitee.com/javazj/moments) / [GitCode镜像](https://gitcode.com/gooking2/moments)
- [小红书企业微展](https://github.com/gooking/xhs-qiyeweizan)  / [码云镜像](https://gitee.com/javazj/xhs-qiyeweizan) / [GitCode镜像](https://gitcode.com/gooking2/xhs-qiyeweizan)
- [旧物回收、废品回收uniapp](https://github.com/gooking/recycle)  / [码云镜像](https://gitee.com/javazj/recycle) / [GitCode镜像](https://gitcode.com/gooking2/recycle)