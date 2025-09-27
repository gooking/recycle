<template>
	<view class="asset-page">
		<!-- 顶部余额卡片 -->
		<view class="balance-card">
			<view class="balance-content">
				<text class="balance-label">当前积分余额</text>
				<text class="balance-amount">{{ score }}</text>
			</view>
		</view>

		<!-- 提现公告 -->
		<view v-if="noticeLastOne" class="promo-banner">
			<uni-icons type="info" size="32rpx" color="#666"></uni-icons>
			<text class="promo-text">{{ noticeLastOne.title }}</text>
		</view>

		<!-- 收入统计区域 -->
		<view class="income-stats">
			<view class="stat-item">
				<text class="stat-label">成长值</text>
				<text class="stat-amount">{{ growth }}</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-label">累计获得</text>
				<text class="stat-amount">{{ totalScore }}</text>
			</view>
		</view>

		<!-- 积分获取途径 -->
		<view class="points-section">
			<view class="section-header">
				<text class="section-title" style="margin-left: -32rpx;">获取更多积分</text>
			</view>
			<view class="points-ways">
				<view v-for="(item,index) in scoreRules" :key="item.id" class="points-item" @click="share">
					<view :class="getIconClass(item.code)" class="item-icon">
						<image :src="getIconSrc(item.code)" mode="aspectFit"></image>
					</view>
					<view class="item-content">
						<text class="item-title">{{ item.codeStr }}</text>
						<text class="item-desc">{{ getDesc(item.code) }}</text>
					</view>
					<view class="item-points">
						<text class="points-value">+{{ item.score }}</text>
						<text class="points-unit">积分</text>
					</view>
					<!-- #ifdef MP-WEIXIN -->
					<button class="btn" open-type="share"></button>
					<!-- #endif -->
				</view>
				<view class="points-item" @click="navigateTo('/pages/score/sign')">
					<view class="item-icon signin-icon">
						<image src="/static/images/mine/signin.svg" mode="aspectFit"></image>
					</view>
					<view class="item-content">
						<text class="item-title">每日签到</text>
						<text class="item-desc">连续签到可获得更多积分</text>
					</view>
				</view>
				<view class="points-item" @click="navigateTo('/pages/score/exchange')">
					<view class="item-icon invite-icon">
						<uni-icons type="gift" size="32rpx" color="#fff"></uni-icons>
					</view>
					<view class="item-content">
						<text class="item-title">兑换积分</text>
						<text class="item-desc">使用积分券领取积分</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 记录列表容器 -->
		<view class="records-container">
			<view class="section-header">
				<text class="section-title">积分明细</text>
			</view>
			<!-- 收款记录 -->
			<view class="records-section">
				<page-box-empty v-if="!list || list.length == 0" title="暂无记录"></page-box-empty>
				<view v-else class="record-item" v-for="(record, index) in list" :key="index" @click="detail(record)">
					<view class="record-info">
						<text class="record-type">{{ record.typeStr }}</text>
						<text class="record-detail">{{ record.remark }}</text>
						<text class="record-time">{{ record.dateAdd }}</text>
					</view>
					<text class="record-amount income">{{ record.score }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noticeLastOne: undefined,
				list: undefined,
				page: 1,
				score: 0,
				totalRefundAmount: 0,
				growth: 0,
				totalScore: 0,
				scoreRules: undefined,
			}
		},
		onLoad() {
			this.scoreLogs()
			this.userAmount()
			this._noticeLastOne()
			this._scoreRules()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page = 1
			this.scoreLogs()
			this.userAmount()
			this._noticeLastOne()
		},
		onShareAppMessage: function() {    
		    return {
		      title: this.sysconfigMap.mallName,
		      path: '/pages/index/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		  },
		methods: {
			navigateTo(url) {
				uni.navigateTo({
					url
				})
			},
			async _noticeLastOne() {
				// https://www.yuque.com/apifm/nu0f75/zanb9r
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.noticeLastOne('score')
				uni.hideLoading()
				if(res.code == 0) {
					this.noticeLastOne = res.data
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
					this.score = res.data.score
					this.totalRefundAmount = res.data.totalRefundAmount
					this.growth = res.data.growth
					this.totalScore = res.data.totalScore
				}
			},
			async scoreLogs() {
				// https://www.yuque.com/apifm/nu0f75/ezi14x
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.scoreLogs({
					token: this.token,
					page: this.page,
				})
				uni.hideLoading()
				if (res.code == 0) {
					if (this.page == 1) {
						this.list = res.data.result
					} else {
						this.list = this.list.concat(res.data.result)
					}
				} else {
					if (this.page == 1) {
						this.list = null
					}
				}
			},
			detail(item) {
				if(item.type == 20 && item.orderId) {
					uni.navigateTo({
						url: '/pages/order/detail?id=' + item.orderId
					})
				}
			},
			async _scoreRules() {
				// https://www.yuque.com/apifm/nu0f75/zi13yk
				const res = await this.$wxapi.scoreRules()
				if(res.code == 0) {
					// #ifdef MP-WEIXIN
					this.scoreRules = res.data.filter(ele => ele.code == 'shareWxGroup' || ele.code == 'invite')
					// #endif
					// #ifndef MP-WEIXIN
					this.scoreRules = res.data.filter(ele => ele.code == 'invite')
					// #endif
				}
			},
			getIconSrc(code) {
				const iconMap = {
					'shareWxGroup': '/static/images/mine/share.svg',
					'invite': '/static/images/mine/invite.svg'
				}
				return iconMap[code] || '/static/images/mine/share.svg'
			},
			getIconClass(code) {
				const classMap = {
					'shareWxGroup': 'share-icon',
					'invite': 'invite-icon'
				}
				return classMap[code] || 'share-icon'
			},
			getDesc(code) {
				const descMap = {
					'shareWxGroup': '分享到微信群即可获得',
					'invite': '成功邀请新用户注册'
				}
				return descMap[code] || '完成任务获得积分'
			},
			// H5点击分享按钮
			share() {
				// #ifdef MP-WEIXIN
				return
				// #endif
				if(!this.uid) {
					uni.showToast({
						title: '登录后分享',
						icon: 'none'
					})
					return
				}
				const inviterUrl = location.protocol + '//' + location.host + '/#/?inviter_id=' + this.uid
				uni.setClipboardData({
					data: '推荐您一个好用的开源免费的回收小程序应用\n\r' + inviterUrl,
					success: () => {
						uni.showToast({
							title: '已复制到剪切板'
						})
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.asset-page {
		min-height: 100vh;
		background-color: #F2F7F9;
		padding-bottom: 16rpx;
	}

	/* 顶部余额卡片 */
	.balance-card {
		margin: 24rpx 28rpx 0;
		height: 230rpx;
		background: linear-gradient(137deg, #30BCB7 0%, #49CCAD 100%);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 40rpx;
	}

	.balance-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.balance-label {
		font-size: 24rpx;
		color: #FFFFFF;
		margin-bottom: 8rpx;
	}

	.balance-amount {
		margin-top: 32rpx;
		font-weight: 520;
		font-size: 48rpx;
		color: #FFFFFF;
		line-height: 1.3;
	}

	/* 免息提现提示 */
	.promo-banner {
		display: flex;
		align-items: center;
		padding: 16rpx 32rpx;
	}

	.promo-text {
		margin-left: 8rpx;
		font-size: 22rpx;
		color: #666;
	}

	/* 收入统计区域 */
	.income-stats {
		margin: 0 28rpx;
		display: flex;
		align-items: center;
		padding: 32rpx 0;
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-label {
		font-family: PingFang SC;
		font-size: 24rpx;
		color: #9A9A9A;
		margin-bottom: 8rpx;
	}

	.stat-amount {
		font-family: MiSans;
		font-weight: 520;
		font-size: 40rpx;
		color: #333333;
		line-height: 1.35;
	}

	.stat-divider {
		width: 2rpx;
		height: 48rpx;
		background-color: #EAEAEA;
		margin: 0 20rpx;
	}

	/* 积分获取途径模块 */
	.points-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		margin: 32rpx 28rpx;
		padding: 0 32rpx;
		
		.section-header {
			height: 88rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 2rpx solid #F6F6F6;
			
			.header-icon {
				width: 48rpx;
				height: 48rpx;
				margin-right: -16rpx;
				image {
					width: 100%;
					height: 100%;
				}
			}
		}
		
		.points-ways {
			padding: 24rpx 0;
			
			.points-item {
				display: flex;
				align-items: center;
				padding: 24rpx 0;
				position: relative;
				
				&:not(:last-child) {
					border-bottom: 2rpx solid #F6F6F6;
				}
				
				button {
					position: absolute;
					height: 100%;
					width: 100%;
					left: 0;
					top: 0;
					opacity: 0;
					z-index: 99;
				}
				
				.item-icon {
					width: 56rpx;
					height: 56rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 24rpx;
					position: relative;
					
					image {
						width: 28rpx;
						height: 28rpx;
					}
					
					&.share-icon {
						background: linear-gradient(135deg, #FF895C 0%, #FFAF7A 100%);
					}
					
					&.invite-icon {
						background: linear-gradient(135deg, #48C5A8 0%, #6DDBC1 100%);
					}
					
					&.signin-icon {
						background: linear-gradient(135deg, #5B9BD5 0%, #7FB8E8 100%);
					}
				}
				
				.item-content {
					flex: 1;
					
					.item-title {
						display: block;
						font-family: PingFang SC;
						font-weight: 500;
						font-size: 28rpx;
						line-height: 40rpx;
						color: #333333;
						margin-bottom: 4rpx;
					}
					
					.item-desc {
						display: block;
						font-family: PingFang SC;
						font-weight: 400;
						font-size: 24rpx;
						line-height: 34rpx;
						color: #9A9A9A;
					}
				}
				
				.item-points {
					display: flex;
					align-items: baseline;
					
					.points-value {
						font-family: MiSans;
						font-weight: 600;
						font-size: 32rpx;
						line-height: 44rpx;
						color: #30B394;
						margin-right: 4rpx;
					}
					
					.points-unit {
						font-family: PingFang SC;
						font-weight: 400;
						font-size: 22rpx;
						line-height: 30rpx;
						color: #30B394;
					}
				}
			}
		}
	}

	/* 记录列表容器 */
	.records-container {
		margin: 0 28rpx 40rpx;
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.records-section {
		&:first-child {
			border-bottom: 2rpx solid #F6F6F6;
		}
	}

	.section-header {
		padding: 32rpx 32rpx 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-weight: 600;
		font-size: 30rpx;
		line-height: 42rpx;
		color: #333333;
	}

	.section-badge {
		width: 56rpx;
		height: 8rpx;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.income-badge {
			background-color: #FFFFFF;
		}

		&.withdraw-badge {
			background-color: #9A9A9A;
		}
	}

	.badge-text {
		font-family: PingFang SC;
		font-size: 0;
		color: transparent;
	}

	.record-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 32rpx;

		&:not(:last-child) {
			position: relative;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 60rpx;
				right: 60rpx;
				height: 2rpx;
				background-color: #F6F6F6;
			}
		}
	}

	.record-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.record-type {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 8rpx;
	}

	.record-detail {
		font-family: PingFang SC;
		font-size: 24rpx;
		color: #9A9A9A;
		margin-bottom: 8rpx;
	}

	.record-time {
		font-family: PingFang SC;
		font-size: 24rpx;
		color: #9A9A9A;
	}

	.record-amount {
		font-family: MiSans;
		font-weight: 520;
		font-size: 32rpx;
		line-height: 1.375;

		&.income {
			color: #30B394;
		}

		&.withdraw {
			color: #333333;
		}
	}
</style>