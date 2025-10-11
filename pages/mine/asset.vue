<template>
	<view class="asset-page">
		<!-- 顶部余额卡片 -->
		<view class="balance-card">
			<view class="balance-content">
				<text class="balance-label">账户余额(元)</text>
				<text class="balance-amount">{{ balance }}</text>
			</view>
			<view class="withdraw-btn" @click="handleWithdraw">
				<text class="withdraw-text">立即提现</text>
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
				<text class="stat-label">废品收入(元)</text>
				<text class="stat-amount">{{ totleConsumed }}</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-label">已提现(元)</text>
				<text class="stat-amount">{{ totalWithdraw }}</text>
			</view>
		</view>

		<!-- 记录列表容器 -->
		<view class="records-container">
			<!-- 收款记录 -->
			<view class="records-section">
				<page-box-empty v-if="!list || list.length == 0" title="暂无记录"></page-box-empty>
				<view v-else class="record-item" v-for="(record, index) in list" :key="index" @click="detail(record)">
					<view class="record-info">
						<text class="record-type">{{ record.typeStr }}</text>
						<text class="record-detail">{{ record.remark }}</text>
						<text class="record-time">{{ record.dateAdd }}</text>
					</view>
					<text class="record-amount income">{{ record.amount }}</text>
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
				balance: 0,
				totalRefundAmount: 0,
				totleConsumed: 0,
				totalWithdraw: 0,
			}
		},
		onLoad() {
			this.cashLogsV3()
			this.userAmountV2()
			this._noticeLastOne()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page = 1
			this.cashLogsV3()
			this.userAmountV2()
			this._noticeLastOne()
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
				const res = await this.$wxapi.noticeLastOne('tx')
				uni.hideLoading()
				if(res.code == 0) {
					this.noticeLastOne = res.data
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
					this.totalRefundAmount = res.data.totalRefundAmount
					this.totleConsumed = res.data.totleConsumed
					this.totalWithdraw = res.data.totalWithdraw
				}
			},
			async cashLogsV3() {
				// https://www.yuque.com/apifm/nu0f75/khq7xu
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.cashLogsV3({
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
				if(item.type == 250 && item.orderId2) {
					uni.navigateTo({
						url: '/pages/order/detail?id=' + item.orderId2
					})
				}
			},
			handleWithdraw() {
				uni.navigateTo({
					url: '/pages/mine/withdraw'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.asset-page {
		min-height: 100vh;
		background-color: #F2F7F9;
		padding: 0;
	}

	/* 顶部余额卡片 */
	.balance-card {
		margin: 24rpx 28rpx 0;
		height: 230rpx;
		background: linear-gradient(139deg, rgba(255, 137, 60, 1) 0%, rgba(255, 175, 122, 1) 100%);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40rpx;
		position: relative;
	}

	.balance-content {
		display: flex;
		flex-direction: column;
	}

	.balance-label {
		font-family: PingFang SC;
		font-size: 24rpx;
		color: #FFFFFF;
		margin-bottom: 8rpx;
	}

	.balance-amount {
		font-family: MiSans;
		font-weight: 520;
		font-size: 48rpx;
		color: #FFFFFF;
		line-height: 1.3;
	}

	.withdraw-btn {
		width: 152rpx;
		height: 58rpx;
		background-color: rgba(214, 113, 50, 1.0);
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.withdraw-text {
		font-family: PingFang SC;
		font-size: 26rpx;
		color: #FFFFFF;
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
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
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
			color: rgba(255, 137, 60, 1);
		}

		&.withdraw {
			color: #333333;
		}
	}
	
</style>