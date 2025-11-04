<template>
	<view class="course-my">
		<view class="header">
			<view class="header-title">我的课程</view>
			<view class="header-subtitle">Course Registration Records</view>
		</view>

		<!-- 空状态 -->
		<view v-if="!list || list.length == 0" class="empty-state">
			<image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
			<text class="empty-text">暂无报名记录</text>
		</view>

		<!-- 课程列表 -->
		<view v-else-if="list && list.length > 0" class="course-list">
			<view class="course-item" v-for="(item, index) in list" :key="item.id">
				<!-- 状态标签 -->
				<view class="status-badge" :class="'status-' + item.status">
					{{ item.statusStr }}
				</view>

				<!-- 课程信息 -->
				<view class="course-content">
					<view class="course-header" @click="goCourse(item)">
						<image class="course-image" :src="item.pic" mode="aspectFill"></image>
						<view class="course-info">
							<view class="course-name">{{ item.courseName }}</view>
							<view class="course-meta">
								<text class="meta-item">订单号：{{ item.orderNumber }}</text>
								<text class="meta-item">核销号：{{ item.hxNumber }}</text>
							</view>
						</view>
					</view>

					<view class="divider"></view>

					<!-- 报名信息 -->
					<view class="enrollment-info">
						<view class="info-row">
							<view class="info-item">
								<text class="info-label">报名人</text>
								<text class="info-value">{{ item.name }}</text>
							</view>
							<view class="info-item">
								<text class="info-label">联系电话</text>
								<text class="info-value">{{ item.mobile }}</text>
							</view>
						</view>
						<view class="info-row">
							<view class="info-item">
								<text class="info-label">报名人数</text>
								<text class="info-value">{{ item.number }}人</text>
							</view>
							<view class="info-item">
								<text class="info-label">报名时间</text>
								<text class="info-value">{{ item.dateAdd }}</text>
							</view>
						</view>
					</view>

					<!-- 价格信息 -->
					<view class="price-section">
						<view class="price-label">支付金额</view>
						<view class="price-amount">{{ item.payAmount > 0 ? ('¥' + item.payAmount.toFixed(2)) : '免费' }}</view>
					</view>

					<!-- 操作按钮 -->
					<view class="action-buttons">
						<!-- 待支付状态按钮 -->
						<template v-if="item.status === 0">
							<view class="btn btn-cancel" @click="handleCancelOrder(index, item)">
								<text class="btn-text">取消订单</text>
							</view>
							<view class="btn btn-pay" @click="handlePay(index, item)">
								<text class="btn-text">立即支付</text>
							</view>
						</template>
						
						<!-- 其他状态按钮 -->
						<template v-else>
							<view class="btn btn-delete" @click="handleDeleteOrder(index, item)">
								<text class="btn-text">删除订单</text>
							</view>
						</template>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-else class="loading-state">
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				page: 1,
				list: undefined,
			}
		},
		
		onLoad() {
			this.courseBuyLogMyV2()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page = 1
			this.courseBuyLogMyV2()
		},
		onReachBottom() {
			this.page++
			this.courseBuyLogMyV2()
		},
		methods: {
			async courseBuyLogMyV2() {
				// https://www.yuque.com/apifm/nu0f75/bxrgvxfaw4vmusxw
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.courseBuyLogMyV2({
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
			goCourse(item) {
				uni.navigateTo({
					url: 'detail?id=' + item.courseId
				})
			},
			/**
			 * 在线支付
			 */
			async handlePay(index, item) {
				let payAmount = item.payAmount
				if(payAmount > 0) {
					// https://www.yuque.com/apifm/nu0f75/wrqkcb
					const resAmount = await this.$wxapi.userAmountV2(this.token)
					if(resAmount.code == 0) {
						payAmount -= resAmount.data.balance
						if(payAmount <= 0) {
							payAmount = 0
						}
					}
				}
				if (!payAmount) {
					// 使用余额支付 https://www.yuque.com/apifm/nu0f75/oxf9lrgmd4xizw7w
					const resPay = await this.$wxapi.courseInfoBuyLogPayV2(this.token, item.id)
					if (resPay.code == 0) {
						uni.showModal({
							content: '报名成功',
							showCancel: false
						})
						item.status = 1
						item.statusStr = '已支付'
						this.list.splice(index, 1, item)
					} else {
						uni.showModal({
							content: resPay.msg,
							showCancel: false
						})
					}
				} else {
					// 发起微信支付
					this.onlinePay(item.id, payAmount, item)
				}
			},
			async onlinePay(buyLogId, payAmount, index, item) {
				// #ifdef H5
				this.onlinePayH5(buyLogId, payAmount, index, item)
				// #endif
				// #ifdef MP-WEIXIN
				this.onlinePayMpWX(buyLogId, payAmount, index, item)
				// #endif
			},
			/**
			 * 在线支付[H5]
			 */
			async onlinePayH5(buyLogId, payAmount, index, item) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 15,
					id: buyLogId
				}
				// 发起H5支付 https://www.yuque.com/apifm/nu0f75/pv7gll
				const res = await this.$wxapi.wxpayH5({
					token: this.token,
					money: payAmount,
					payName: '支付课程报名费:' + buyLogId,
					nextAction: JSON.stringify(nextAction),
				})
				uni.hideLoading()
				if (res.code == 0) {
					location.href = res.data.mweb_url
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			/**
			 * 在线支付[微信小程序]
			 */
			async onlinePayMpWX(buyLogId, payAmount, index, item) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 15,
					id: buyLogId
				}
				// 微信小程序支付https://www.yuque.com/apifm/nu0f75/kffu74
				const res = await this.$wxapi.wxpay({
					token: this.token,
					money: payAmount,
					payName: '支付课程报名费:' + buyLogId,
					nextAction: JSON.stringify(nextAction),
				})
				uni.hideLoading()
				if (res.code == 0) {
					uni.requestPayment({
						timeStamp: res.data.timeStamp,
						nonceStr: res.data.nonceStr,
						package: res.data.package,
						signType: res.data.signType,
						paySign: res.data.paySign,
						fail: (err) => {
							console.error(err);
						},
						success: () => {
							uni.showModal({
								content: '支付成功',
								showCancel: false
							})
							item.status = 1
							item.statusStr = '已支付'
							this.list.splice(index, 1, item)
						}
					})
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			// 取消订单
			async handleCancelOrder(index, item) {
				// https://www.yuque.com/apifm/nu0f75/yx6uk1naxtcfd044
				uni.showModal({
					content: '确定要取消吗？',
					success: async (res1) => {
						if (res1.confirm) {
							uni.showLoading({
								title: '取消中...'
							})
							const res = await this.$wxapi.courseInfoBuyLogCloseV2(this.token, item.id)
							uni.hideLoading()
							if (res.code != 0) {
								uni.showToast({
									title: res.msg,
									icon: 'none'
								})
							} else {
								item.status = -1
								item.statusStr = '订单关闭'
								this.list.splice(index, 1, item)
								uni.showToast({
									title: '取消成功',
									icon: 'success'
								})
							}
						}
					}
				})
			},
			// 删除订单
			async handleDeleteOrder(index, item) {
				// https://www.yuque.com/apifm/nu0f75/ay4iuua0wze9evzk
				uni.showModal({
					content: '确定要删除吗？',
					success: async (res1) => {
						if (res1.confirm) {
							uni.showLoading({
								title: '删除中...'
							})
							const res = await this.$wxapi.courseInfoBuyLogDeleteV2(this.token, item.id)
							uni.hideLoading()
							if (res.code != 0) {
								uni.showToast({
									title: res.msg,
									icon: 'none'
								})
							} else {
								this.list.splice(index, 1)
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.course-my {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding-bottom: 40rpx;
}

.header {
	padding: 60rpx 40rpx 40rpx;
	text-align: center;
	
	.header-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 10rpx;
		letter-spacing: 2rpx;
	}
	
	.header-subtitle {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 1rpx;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
	
	.empty-icon {
		width: 300rpx;
		height: 300rpx;
		margin-bottom: 40rpx;
		opacity: 0.6;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.7);
	}
}

.loading-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
	
	.loading-text {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.7);
	}
}

.course-list {
	padding: 0 30rpx;
}

.course-item {
	position: relative;
	margin-bottom: 30rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.3s ease;
	
	&:active {
		transform: scale(0.98);
	}
}

.status-badge {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
	color: #ffffff;
	z-index: 10;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	
	&.status--1 {
		background: linear-gradient(135deg, #404040, #909090);
	}
	
	&.status-0 {
		background: linear-gradient(135deg, #FF6B6B, #FF5252);
	}
	
	&.status-1 {
		background: linear-gradient(135deg, #4CAF50, #45a049);
	}
	
	&.status-2 {
		background: linear-gradient(135deg, #FFC107, #FFB300);
	}
}

.course-content {
	padding: 30rpx;
}

.course-header {
	display: flex;
	gap: 24rpx;
	margin-bottom: 24rpx;
}

.course-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 16rpx;
	flex-shrink: 0;
	background: #f5f5f5;
}

.course-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 0;
}

.course-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.course-meta {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.meta-item {
	font-size: 22rpx;
	color: #999999;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.divider {
	height: 1rpx;
	background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
	margin: 24rpx 0;
}

.enrollment-info {
	margin-bottom: 24rpx;
}

.info-row {
	display: flex;
	gap: 20rpx;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.info-item {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
}

.info-label {
	font-size: 24rpx;
	color: #666666;
	white-space: nowrap;
}

.info-value {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.price-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	background: linear-gradient(135deg, #f8f9fa, #e9ecef);
	border-radius: 12rpx;
	margin-bottom: 24rpx;
}

.price-label {
	font-size: 26rpx;
	color: #666666;
}

.price-amount {
	font-size: 36rpx;
	font-weight: bold;
	color: #FF5252;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	justify-content: flex-end;
}

.btn {
	padding: 16rpx 32rpx;
	border-radius: 40rpx;
	font-size: 26rpx;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	
	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
}

.btn-cancel {
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	
	.btn-text {
		color: #666666;
	}
}

.btn-pay {
	background: linear-gradient(135deg, #667eea, #764ba2);
	
	.btn-text {
		color: #ffffff;
		font-weight: 500;
	}
}

.btn-delete {
	background: linear-gradient(135deg, #FF6B6B, #FF5252);
	
	.btn-text {
		color: #ffffff;
		font-weight: 500;
	}
}
</style>