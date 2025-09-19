<template>
	<view class="mine-page">
		<!-- 用户信息区域 -->
		<view v-if="userInfo" class="user-info">
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
			<view class="balance-card balance">
				<view class="card-content">
					<text class="amount">{{ balance }}</text>
					<text class="label">账户余额 (元)</text>
					<view class="view-btn">
						<uni-icons type="right" size="32rpx" color="#FFF"></uni-icons>
					</view>
				</view>
			</view>
			<view class="balance-card recycle">
				<view class="card-content">
					<text class="amount">{{ score }}</text>
					<text class="label">当前积分</text>
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

			<view class="menu-item" @click="goToAbout">
				<view class="menu-icon">
					<image src="/static/images/mine/about.png" mode="aspectFit"></image>
				</view>
				<text class="menu-title">关于我们</text>
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
			this.userAmount()
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
			async userAmount() {
				// https://www.yuque.com/apifm/nu0f75/wrqkcb
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.userAmount(this.token)
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
			goToFeedback() {
				// 跳转到用户反馈页面
				console.log('用户反馈')
			},
			goToAbout() {
				// 跳转到关于我们页面
				console.log('关于我们')
			},
			shareQR() {
				// 分享二维码功能
				console.log('分享二维码')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mine-page {
		background: #F2F7F9;
		min-height: 100vh;

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
</style>