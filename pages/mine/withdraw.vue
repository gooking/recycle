<template>
	<view class="withdraw-page">
		<!-- 可提现金额卡片 -->
		<view class="balance-card">
			<view class="balance-content">
				<text class="balance-label">可提现金额(元)</text>
				<text class="balance-amount">{{ availableBalance }}</text>
			</view>
			<view class="balance-tip">
				<uni-icons type="info" size="24rpx" color="#FFFFFF"></uni-icons>
				<text class="tip-text">提现将在1-3个工作日内到账</text>
			</view>
		</view>

		<!-- 提现表单 -->
		<view class="withdraw-form">
			<view class="form-item">
				<text class="form-label">提现金额</text>
				<view class="input-container">
					<text class="currency-symbol">¥</text>
					<input 
						class="form-input" 
						type="digit" 
						v-model="withdrawAmount" 
						placeholder="请输入提现金额"
						@input="onAmountInput"
					/>
				</view>
			</view>
			
			<view class="amount-tips">
				<view class="tip-item" @click="setMaxAmount">
					<text class="tip-label">全部提现</text>
					<text class="tip-amount">¥{{ availableBalance }}</text>
				</view>
			</view>
		</view>

		<!-- 提现按钮 -->
		<view class="submit-button" :class="{ disabled: !canSubmit }" @click="handleSubmit">
			确认提现
		</view>

		<!-- 提现记录 -->
		<view class="records-container">
			<view class="records-header">
				<text class="records-title">提现记录</text>
			</view>
			
			<view class="records-content">
				<template v-if="!withdrawRecords || withdrawRecords.length == 0">
					<page-box-empty title="暂无提现记录"></page-box-empty>
					<view style="height: 48rpx;"></view>
				</template>
				<view v-else class="record-item" v-for="(record, index) in withdrawRecords" :key="record.id">
					<view class="record-info">
						<text class="record-type">提现申请</text>
						<text class="record-detail">{{ record.rejectionReason || record.number }}</text>
						<text class="record-time">{{ record.dateAdd }}</text>
					</view>
					<view class="record-right">
						<text class="record-amount">-¥{{ formatAmount(record.money) }}</text>
						<text class="record-status" :class="getStatusClass(record.status)">{{ record.statusStr }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				availableBalance: 0, // 可提现金额
				withdrawAmount: '', // 提现金额
				withdrawRecords: [], // 提现记录
				page: 1,
			}
		},
		
		
		onLoad() {
			if (this.checkLogin()) {
				this.getUserAmount()
				this.getWithdrawRecords()
			}
		},
		
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page = 1
			this.getUserAmount()
			this.getWithdrawRecords()
		},
		
		computed: {
			canSubmit() {
				const amount = parseFloat(this.withdrawAmount)
				return amount > 0 && amount <= this.availableBalance
			},
			// 获取用户token
			token() {
				return this.$store.state.token
			}
		},

		methods: {
			// 获取用户余额信息
			async getUserAmount() {
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.userAmount(this.token)
				uni.hideLoading()
				if(res.code == 0) {
					this.availableBalance = res.data.balance
				}
			},
			
			// 获取提现记录
			async getWithdrawRecords() {
				uni.showLoading({
					title: ''
				})
				// https://www.yuque.com/apifm/nu0f75/aw6qt6
				const res = await this.$wxapi.withDrawLogs({
					token: this.token,
					page: this.page,
				})
				uni.hideLoading()
				if (res.code == 0) {
					if (this.page == 1) {
						this.withdrawRecords = res.data
					} else {
						this.withdrawRecords = this.withdrawRecords.concat(res.data)
					}
				} else {
					if (this.page == 1) {
						this.withdrawRecords = null
					}
				}
			},
			
			// 处理金额输入
			onAmountInput(e) {
				let value = e.detail.value
				// 只保留数字和小数点
				value = value.replace(/[^\d.]/g, '')
				// 确保只有一个小数点
				const parts = value.split('.')
				if (parts.length > 2) {
					value = parts[0] + '.' + parts.slice(1).join('')
				}
				// 限制小数位数为2位
				if (parts[1] && parts[1].length > 2) {
					value = parts[0] + '.' + parts[1].substring(0, 2)
				}
				this.withdrawAmount = value
			},
			
			// 设置最大提现金额
			setMaxAmount() {
				this.withdrawAmount = this.availableBalance.toString()
			},
			
			// 提交提现申请
			async handleSubmit() {
				if (!this.checkLogin()) {
					return
				}
				
				if (!this.canSubmit) {
					return
				}
				
				const amount = parseFloat(this.withdrawAmount)
				
				// 验证提现金额
				if (amount <= 0) {
					return uni.showToast({
						title: '请输入有效的提现金额',
						icon: 'none'
					})
				}
				
				if (amount > this.availableBalance) {
					return uni.showToast({
						title: '提现金额不能超过可提现余额',
						icon: 'none'
					})
				}
				
				// 确认提现
				uni.showModal({
					content: `确定要提现 ¥${amount} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							await this.submitWithdraw(amount)
						}
					}
				})
			},
			
			// 提交提现请求
			async submitWithdraw(amount) {
				uni.showLoading({
					title: ''
				})
				// https://www.yuque.com/apifm/nu0f75/qb6lg7
				const res = await this.$wxapi.withDrawApplyV2({
					token: this.token,
					money: amount,
				})
				uni.hideLoading()
				if (res.code == 0) {
					uni.showModal({
						content: '您的提现申请已提交，将在1-3个工作日内处理',
						showCancel: false,
						success: () => {
							this.withdrawAmount = ''
							this.getUserAmount()
							this.getWithdrawRecords()
						}
					})
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
			
			// 获取状态样式类
			getStatusClass(status) {
				switch(status) {
					case 0: return 'pending'
					case 1: return 'success'
					case 2: return 'failed'
					default: return 'pending'
				}
			},

			// 格式化金额显示
			formatAmount(amount) {
				return Math.abs(parseFloat(amount || 0)).toFixed(2)
			},

			// 检查用户是否登录
			checkLogin() {
				if (!this.token) {
					uni.showModal({
						title: '请先登录',
						content: '需要登录后才能进行提现操作',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/login/login'
								})
							}
						}
					})
					return false
				}
				return true
			}
		}
	}
</script>

<style lang="scss" scoped>
	.withdraw-page {
		min-height: 100vh;
		background-color: #F2F7F9;
		padding-top: 32rpx;
		padding-bottom: 32rpx;
	}

	/* 余额卡片 */
	.balance-card {
		margin: 24rpx 28rpx 0;
		height: 200rpx;
		background: linear-gradient(139deg, rgba(72, 197, 168, 1) 0%, rgba(120, 217, 190, 1) 100%);
		border-radius: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 40rpx;
		position: relative;
	}

	.balance-content {
		display: flex;
		flex-direction: column;
		margin-bottom: 16rpx;
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

	.balance-tip {
		display: flex;
		align-items: center;
	}

	.tip-text {
		margin-left: 8rpx;
		font-family: PingFang SC;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	/* 提现表单 */
	.withdraw-form {
		margin: 32rpx 28rpx 0;
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 0;
	}

	.form-item {
		display: flex;
		align-items: center;
		min-height: 112rpx;
		padding: 0 32rpx;
		border-bottom: 1px solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.form-label {
		width: 160rpx;
		font-family: PingFang SC;
		font-size: 32rpx;
		color: #333333;
	}

	.input-container {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.currency-symbol {
		font-family: MiSans;
		font-size: 32rpx;
		color: #333333;
		margin-right: 8rpx;
	}

	.form-input {
		flex: 1;
		font-family: MiSans;
		font-size: 32rpx;
		color: #333333;
		height: 100%;
		padding: 0;
	}

	.amount-tips {
		padding: 24rpx 32rpx;
	}

	.tip-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 24rpx;
		background-color: #F8F9FA;
		border-radius: 12rpx;
	}

	.tip-label {
		font-family: PingFang SC;
		font-size: 28rpx;
		color: #666666;
	}

	.tip-amount {
		font-family: MiSans;
		font-size: 28rpx;
		color: #48C5A8;
		font-weight: 500;
	}

	/* 提现按钮 */
	.submit-button {
		margin: 60rpx 28rpx 0;
		height: 96rpx;
		background-color: #48C5A8;
		border-radius: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: PingFang SC;
		font-size: 32rpx;
		color: #FFFFFF;
		font-weight: 600;

		&.disabled {
			background-color: #CCCCCC;
			color: #999999;
		}
	}

	/* 提现记录 */
	.records-container {
		margin: 40rpx 28rpx 40rpx;
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.records-header {
		padding: 32rpx 32rpx 16rpx;
		border-bottom: 2rpx solid #F6F6F6;
	}

	.records-title {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
		color: #333333;
	}

	.records-content {
		min-height: 200rpx;
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

	.record-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.record-amount {
		font-family: MiSans;
		font-weight: 520;
		font-size: 32rpx;
		color: #333333;
		line-height: 1.375;
		margin-bottom: 8rpx;
	}

	.record-status {
		font-family: PingFang SC;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		
		&.pending {
			background-color: #FFF3E0;
			color: #FF8F00;
		}
		
		&.success {
			background-color: #E8F5E8;
			color: #48C5A8;
		}
		
		&.failed {
			background-color: #FFEBEE;
			color: #F44336;
		}
	}
</style>