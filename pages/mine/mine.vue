<template>
	<view class="mine-page">
		<!-- 用户信息区域 -->
		<view v-if="userInfo" class="user-info" @click="info">
			<view class="user-avatar">
				<image class="avatar" :src="userInfo.base.avatarUrl || '/static/images/avatarUrl.png'" mode="aspectFit"></image>
			</view>
			<view class="user-details">
				<text class="username">{{ userInfo.base.nick || '环保卫士' }}</text>
				<text class="phone">ID：{{ userInfo.base.id }}</text>
			</view>
			<view class="setting-btn">
				<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 余额和回收量卡片 -->
		<view class="balance-cards">
			<view class="balance-card balance" @click="asset">
				<view class="card-content">
					<text class="amount">{{ balance }}</text>
					<text class="label">账户余额 (元)</text>
					<view class="view-btn">
						<uni-icons type="right" size="32rpx" color="#FFF"></uni-icons>
					</view>
				</view>
			</view>
			<view class="balance-card recycle" @click="_score">
				<view class="card-content">
					<text class="amount">{{ score }}</text>
					<text class="label">可用积分</text>
					<view class="view-btn">
						<uni-icons type="right" size="32rpx" color="#FFF"></uni-icons>
					</view>
				</view>
			</view>
			<!-- <view class="balance-card recycle">
				<view class="card-content">
					<text class="amount">54.26</text>
					<text class="label">累计回收 (斤)</text>
					<view class="view-btn">
						<uni-icons type="right" size="32rpx" color="#FFF"></uni-icons>
					</view>
				</view>
			</view> -->
		</view>

		<!-- 积分商城订单入口 -->
		<view class="points-order-section">
			<view class="section-title">商城订单</view>
			<view class="order-grid">
				<view class="order-item" @click="goToPointsOrders(1)">
					<view class="order-icon">
						<!-- https://www.iconfont.cn/collections/detail?spm=a313x.search_index.0.da5a778a4.6c633a81SiPdEk&cid=28 -->
						<image src="/static/images/order/dfh.png" mode="aspectFit"></image>
					</view>
					<text class="order-text">待发货</text>
				</view>
				<view class="order-item" @click="goToPointsOrders(2)">
					<view class="order-icon">
						<image src="/static/images/order/yfh.png" mode="aspectFit"></image>
					</view>
					<text class="order-text">已收货</text>
				</view>
				<view class="order-item" @click="goToPointsOrders(-2)">
					<view class="order-icon">
						<image src="/static/images/order/success.png" mode="aspectFit"></image>
					</view>
					<text class="order-text">已完成</text>
				</view>
				<view class="order-item" @click="goToPointsOrders(-3)">
					<view class="order-icon">
						<image src="/static/images/order/all.png" mode="aspectFit"></image>
					</view>
					<text class="order-text">全部</text>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToAddress">
				<view class="menu-icon">
					<image src="/static/images/mine/address.png" mode="aspectFit"></image>
				</view>
				<text class="menu-title">地址管理</text>
				<view class="menu-arrow">
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
				</view>
			</view>

			<view class="menu-divider"></view>

			<view class="menu-item" @click="goToFeedback">
				<view class="menu-icon">
					<image src="/static/images/mine/mail.png" mode="aspectFit"></image>
				</view>
				<text class="menu-title">用户反馈</text>
				<view class="menu-arrow">
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
				</view>
			</view>

			<view class="menu-divider"></view>
			<view class="menu-item" @click="about">
				<view class="menu-icon">
					<image src="/static/images/mine/about.png" mode="aspectFit"></image>
				</view>
				<text class="menu-title">关于我们</text>
				<view class="menu-arrow">
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
				</view>
			</view>
			
			<view class="menu-divider"></view>
			<view class="menu-item" @click="contactService">
				<view class="menu-icon">
					<image src="/static/images/mine/service.svg" mode="aspectFit"></image>
				</view>
				<text class="menu-title">联系客服</text>
				<view class="menu-arrow">
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
				</view>
			</view>

			<!-- <view class="menu-divider"></view> -->

			<!-- <view class="menu-item" @click="shareQR">
				<view class="menu-icon">
					<image src="/static/images/mine/scan.png" mode="aspectFit"></image>
				</view>
				<text class="menu-title">分享二维码</text>
				<text class="menu-subtitle">分享现金奖励</text>
				<view class="reward-dot"></view>
				<view class="menu-arrow">
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
				</view>
			</view> -->
		</view>
		<!-- #ifdef H5 -->
		<view class="login-out">
			<button type="default" @click="loginOut">退出登陆</button>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
		<view class="bottom-banner" @click="handleMiniProgramBanner">
			<view class="banner-content">
				<view class="banner-icon">
					<text class="icon-emoji">🚀</text>
				</view>
				<text class="banner-text">我也要做小程序</text>
				<view class="banner-arrow">
					<uni-icons type="right" size="28rpx" color="#FFF"></uni-icons>
				</view>
			</view>
		</view>
		<!-- #endif -->
		<view class="versionNum">ver {{ versionNum }}</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: undefined,
				balance: 0,
				score: 0,
				recycleWeight: 0
			}
		},
		onLoad() {
			
		},
		onShow() {
			this.userDetail()
			this.userAmountV2()
		},
		onShareAppMessage() {
		    return {
		      title: this.sysconfigMap.mallName + ' - 闲置废品换钱',
		      path: '/pages/index/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		methods: {
			async userDetail() {
				// https://www.yuque.com/apifm/nu0f75/zgf8pu
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.userDetail(this.token)
				uni.hideLoading()
				if(res.code == 0) {
					this.userInfo = res.data
				}
			},
			async userAmountV2() {
				// https://www.yuque.com/apifm/nu0f75/wrqkcb
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.userAmountV2(this.token)
				uni.hideLoading()
				if(res.code == 0) {
					this.balance = res.data.balance
					this.score = res.data.score
				}
			},
			goToAddress() {
				uni.navigateTo({
					url: '/pages/mine/address'
				})
			},
			info() {
				uni.navigateTo({
					url: '/pages/mine/info'
				})
			},
			asset() {
				uni.navigateTo({
					url: '/pages/mine/asset'
				})
			},
			_score() {
				uni.navigateTo({
					url: '/pages/score/index'
				})
			},
			about() {
				uni.navigateTo({
					url: '/pages/mine/about?key=about'
				})
			},
			contactService() {
				getApp().contactService()
			},
			goToFeedback() {
				uni.navigateTo({
					url: '/pages/mine/feedback'
				})
			},
			goToPointsOrders(status) {
				uni.navigateTo({
					url: `/pages/shop/order-list?mod=${status}`
				})
			},
			shareQR() {
				// 分享二维码功能
				console.log('分享二维码')
			},
			/**
			 * 处理小程序横幅点击事件
			 */
			handleMiniProgramBanner() {
				getApp().handleMiniProgramBanner()
			},
			async loginOut() {
				// https://www.yuque.com/apifm/nu0f75/mg77aq
				uni.showLoading({
					title: ''
				})
				await this.$wxapi.loginout(this.token)
				uni.hideLoading()
				this.vuex('token', null)
				this.vuex('uid', null)
				this.vuex('mobile', null)
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.mine-page {
		background: #F2F7F9;
		min-height: 100vh;
		padding-bottom: 32rpx;
		.user-info {
			position: relative;
			padding: 32rpx 28rpx 64rpx;
			background: linear-gradient(155deg, rgba(242, 247, 249, 1) 0%, rgba(242, 247, 249, 0.6) 100%);
			display: flex;
			align-items: center;

			.user-avatar {
				position: relative;
				width: 144rpx;
				height: 144rpx;
				margin-right: 32rpx;

				.avatar-bg {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 1;
				}

				.avatar {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					z-index: 2;
				}
			}

			.user-details {
				flex: 1;

				.username {
					display: block;
					font-family: PingFang SC;
					font-weight: 600;
					font-size: 40rpx;
					line-height: 56rpx;
					color: #333333;
					margin-bottom: 4rpx;
				}

				.phone {
					display: block;
					font-family: PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					line-height: 34rpx;
					color: #9A9A9A;
				}
			}

			.setting-btn {
				width: 20rpx;
				height: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				image {
					width: 16rpx;
					height: 24rpx;
				}
			}
		}

		.balance-cards {
			padding: 0 28rpx;
			display: flex;
			gap: 38rpx;

			.balance-card {
				flex: 1;
				height: 146rpx;
				border-radius: 24rpx;
				position: relative;
				overflow: hidden;

				.card-content {
					padding: 24rpx 32rpx;
					height: 100%;
					display: flex;
					flex-direction: column;
					position: relative;

					.amount {
						font-family: MiSans;
						font-weight: 520;
						font-size: 32rpx;
						line-height: 44rpx;
						color: #FFFFFF;
						margin-bottom: 8rpx;
					}

					.label {
						font-family: PingFang SC;
						font-weight: 400;
						font-size: 24rpx;
						line-height: 34rpx;
						color: #FFFFFF;
					}

					.view-btn {
						position: absolute;
						top: 32rpx;
						right: 32rpx;
						width: 14rpx;
						height: 22rpx;

						image {
							width: 100%;
							height: 100%;
							filter: brightness(0) invert(1);
						}
					}
				}

				&.balance {
					background: linear-gradient(139deg, rgba(255, 137, 60, 1) 0%, rgba(255, 175, 122, 1) 100%);
				}

				&.recycle {
					background: linear-gradient(139deg, rgba(72, 197, 168, 1) 0%, rgba(109, 219, 193, 1) 100%);
				}
			}
		}

		.points-order-section {
			background: #FFFFFF;
			border-radius: 24rpx;
			margin: 32rpx 28rpx 0;
			padding: 32rpx;

			.section-title {
				font-family: PingFang SC;
				font-weight: 600;
				font-size: 32rpx;
				line-height: 44rpx;
				color: #333333;
				margin-bottom: 32rpx;
			}

			.order-grid {
				display: flex;
				justify-content: space-between;

				.order-item {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: 0 16rpx;

					.order-icon {
						width: 64rpx;
						height: 64rpx;
						margin-bottom: 16rpx;
						background: #F8F9FA;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;

						image {
							width: 40rpx;
							height: 40rpx;
						}
					}

					.order-text {
						font-family: PingFang SC;
						font-weight: 400;
						font-size: 24rpx;
						line-height: 34rpx;
						color: #666666;
						text-align: center;
					}

					&:active {
						opacity: 0.7;
					}
				}
			}
		}

		.menu-section {
			background: #FFFFFF;
			border-radius: 24rpx;
			margin: 32rpx 28rpx 0;
			padding: 0 32rpx;

			.menu-item {
				height: 106rpx;
				display: flex;
				align-items: center;

				.menu-icon {
					width: 44rpx;
					height: 44rpx;
					margin-right: 24rpx;

					image {
						width: 100%;
						height: 100%;
					}
				}

				.menu-title {
					flex: 1;
					font-weight: 500;
					font-size: 28rpx;
					line-height: 40rpx;
					color: #333333;
				}

				.menu-subtitle {
					font-weight: 400;
					font-size: 26rpx;
					line-height: 36rpx;
					color: #9A9A9A;
					margin-right: 16rpx;
				}

				.reward-dot {
					width: 12rpx;
					height: 12rpx;
					background: #FC5F6D;
					border-radius: 50%;
					margin-right: 16rpx;
				}

				.menu-arrow {
					width: 16rpx;
					height: 24rpx;

					image {
						width: 100%;
						height: 100%;
						opacity: 0.6;
					}
				}
			}

			.menu-divider {
				height: 2rpx;
				background: #F6F6F6;
				margin: 0 12rpx;
			}
		}
	}
	.login-out {
		padding: 32rpx;
		button {
			background-color: #48C5A8;
			color: #fff;
		}
	}
	.versionNum {
		font-size: 22rpx;
		text-align: center;
		margin-top: 32rpx;
		color: #999;
	}
	
	.bottom-banner {
		margin: 32rpx 28rpx 48rpx;
		
		.banner-content {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 24rpx;
			padding: 40rpx 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
			transition: all 0.3s ease;
			
			&:active {
				transform: scale(0.98);
				opacity: 0.9;
			}
			
			.banner-icon {
				width: 56rpx;
				height: 56rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 50%;
				margin-right: 24rpx;
				
				.icon-emoji {
					font-size: 32rpx;
					line-height: 1;
				}
			}
			
			.banner-text {
				flex: 1;
				font-family: PingFang SC;
				font-weight: 600;
				font-size: 32rpx;
				line-height: 44rpx;
				color: #FFFFFF;
				letter-spacing: 2rpx;
			}
			
			.banner-arrow {
				width: 28rpx;
				height: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
</style>