<template>
	<view class="order-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
		</view>
		
		<!-- 状态筛选标签 -->
		<view class="tab-section">
			<uni-segmented-control
				:current="tabIndex" :values="tabs"
				@clickItem="tabClick" styleType="text"
				activeColor="#30BCB7"
			></uni-segmented-control>
		</view>

		<!-- 订单列表 -->
		<view class="order-list">
			<page-box-empty v-if="!list || list.length == 0" title="暂无订单记录" subTitle="您还没有积分商城订单~"></page-box-empty>
			<view v-else>
				<view v-for="(order, orderIndex) in list" :key="order.id" class="order-card" @click="navigateTo('/pages/shop/order-detail?id=' + order.id)">
					<!-- 订单头部信息 -->
					<view class="order-header">
						<view class="order-number">
							<text class="order-number-text">订单号：{{ order.orderNumber }}</text>
						</view>
						<view class="order-status" :class="getStatusClass(order.status)">
							<text class="status-text">{{ getStatusText(order.status) }}</text>
						</view>
					</view>

					<!-- 订单时间 -->
					<view class="order-time-section">
						<text class="order-time">下单时间：{{ order.dateAdd }}</text>
					</view>

					<!-- 商品列表 -->
					<view class="goods-section">
						<view v-for="(goods, goodsIndex) in order.goods" :key="goodsIndex" class="goods-item">
							<view class="goods-image">
								<image :src="goods.pic" class="product-image" mode="aspectFill"></image>
							</view>
							<view class="goods-info">
								<text class="goods-name">{{ goods.goodsName }}</text>
								<view class="goods-price-info">
									<text v-if="goods.amount" class="score-price">￥{{ goods.amount }}</text>
									<text v-if="goods.amount && goods.score" class="add-plus">+</text>
									<text v-if="goods.score" class="score-price">{{ goods.score }}积分</text>
									<text v-if="goods.originalPrice" class="original-price">¥{{ goods.originalPrice }}</text>
								</view>
								<view class="goods-quantity">
									<text class="quantity-label">数量：</text>
									<text class="quantity-value">x{{ goods.number }}</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 地址信息 -->
					<view v-if="order.logistics" class="address-section">
						<view class="address-header">
							<view class="address-icon">
								<text class="icon-text">📍</text>
							</view>
							<text class="address-label">收货地址</text>
						</view>
						<view class="address-content">
							<view class="recipient-info">
								<text class="recipient-name">{{ order.logistics.linkMan }}</text>
								<text class="recipient-phone">{{ order.logistics.mobile }}</text>
							</view>
							<text class="address-detail">{{ order.logistics.address }}</text>
						</view>
					</view>

					<!-- 订单底部信息 -->
					<view class="order-footer">
						<view class="order-total">
							<text class="total-label">总计：</text>
							<text v-if="order.amountReal" class="total-score">￥{{ order.amountReal }}</text>
							<text v-if="order.amountReal && order.score" class="add-plus">+</text>
							<text v-if="order.score" class="total-score">{{ order.score }}积分</text>
						</view>
						<view v-if="order.status == 0" class="order-actions">
							<view class="action-btn cancel-btn" @click.stop="cancelOrder(orderIndex, order)">
								<text class="btn-text">取消订单</text>
							</view>
							<view class="action-btn pay-btn" @click.stop="_pay(orderIndex, order)">
								<text class="btn-text">立即支付</text>
							</view>
						</view>
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
				page: 1,
				tabIndex: 0,
				tabs: ['全部', '待发货', '已收货', '已完成', '已取消'],
				list: [],
				currentTab: 0, // 当前选中的标签页
			}
		},
		onLoad(e) {
			if (e.mod == 1) {
				this.tabIndex = 1
			} else if (e.mod == 2) {
				this.tabIndex = 2
			} else if (e.mod == -2) {
				this.tabIndex = 3
			} else if (e.mod == -3) {
				this.tabIndex = 0
			}
			this.getOrderList()
		},
		onReachBottom() {
			this.page++
			this.getOrderList()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page = 1
			this.getOrderList()
		},
		methods: {
			tabClick(e) {
				this.tabIndex = e.currentIndex
				this.page = 1
				this.getOrderList()
			},
			/**
			 * 获取订单列表
			 * https://www.yuque.com/apifm/nu0f75/uwggsm
			 */
			async getOrderList() {
				uni.showLoading({
					title: '加载中...'
				})
				const postData = {
					token: this.token,
					page: this.page,
					showExtJson: true,
					showShopInfo: true,
					type: 0, // 积分商城订单type为0
				}
				if (this.tabIndex == 1) {
					postData.status = 1
				} else if (this.tabIndex == 2) {
					postData.status = 2
				} else if (this.tabIndex == 3) {
					postData.statusBatch = '3,4'
				} else if (this.tabIndex == 4) {
					postData.status = -1
				}
				const res = await this.$wxapi.orderList(postData)
				uni.hideLoading()
				if (res.code == 0) {
					res.data.orderList.forEach(order => {
						order.goods = res.data.goodsMap[order.id]
						order.extJson = res.data.extJsonMap[order.id]
						order.logistics = res.data.logisticsMap[order.id]
						order.shopInfo = res.data.shopMap[order.shopIdZt]
					})
					if (this.page == 1) {
						this.list = res.data.orderList
					} else {
						this.list = this.list.concat(res.data.orderList)
					}
				} else {
					if (this.page == 1) {
						this.list = null
					}
				}
			},

			/**
			 * 获取订单状态样式类
			 */
			getStatusClass(status) {
				const statusMap = {
					'0': 'status-pending', // 待发货
					'1': 'status-shipping', // 待收货
					'2': 'status-shipping', // 待收货
					'3': 'status-completed', // 已完成
					'4': 'status-completed', // 已完成
					'-1': 'status-cancelled' // 已取消
				}
				return statusMap[status] || 'status-default'
			},

			/**
			 * 获取订单状态文本
			 */
			getStatusText(status) {
				const statusMap = {
					'0': '待支付',
					'1': '待发货',
					'2': '待确认',
					'3': '已完成',
					'4': '已完成',
					'-1': '已取消'
				}
				return statusMap[status] || '未知状态'
			},

			/**
			 * 取消订单
			 */
			cancelOrder(orderIndex, order) {
				uni.showModal({
					content: '确定要取消这个订单吗？',
					success: async (res1) => {
						if (res1.confirm) {
							// https://www.yuque.com/apifm/nu0f75/wh4rrs
							uni.showLoading({
								title: '取消中...'
							})
							const res = await this.$wxapi.orderCloseV2({
							  token: this.token, 
							  orderId: order.id
							})
							uni.hideLoading()
							if (res.code != 0) {
								uni.showToast({
									title: res.msg,
									icon: 'none'
								})
							} else {
								order.status = -1
								this.list.splice(orderIndex, 1, order)
								uni.showToast({
									title: '订单已取消',
									icon: 'success'
								})
							}
						}
					}
				})
			},
			navigateTo(url) {
				uni.navigateTo({
					url
				})
			},
			_pay(orderIndex, order) {
				if (order.amountReal > 0) {
					// 需要在线支付 TODO
					this.onlinePay(order)
				} else {
					// 不需要在线支付
					this.orderPayV2(order)
				}
			},
			/**
			 * 在线支付
			 */
			async onlinePay(orderInfo) {
				const payMoney = orderInfo.amountReal
				// #ifdef H5
				this.onlinePayH5(orderInfo, payMoney)
				// #endif
				// #ifdef MP-WEIXIN
				this.onlinePayMpWX(orderInfo, payMoney)
				// #endif
			},
			/**
			 * 在线支付[H5]
			 */
			async onlinePayH5(orderInfo, payMoney) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 0,
					id: orderInfo.id
				}
				// 发起H5支付 https://www.yuque.com/apifm/nu0f75/pv7gll
				const res = await this.$wxapi.wxpayH5({
					token: this.token,
					money: payMoney,
					payName: '支付订单:' + orderInfo.orderNumber,
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
			async onlinePayMpWX(orderInfo, payMoney) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 0,
					id: orderInfo.id
				}
				// 微信小程序支付https://www.yuque.com/apifm/nu0f75/kffu74
				const res = await this.$wxapi.wxpay({
					token: this.token,
					money: payMoney,
					payName: '支付订单:' + orderInfo.orderNumber,
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
							orderInfo.status = 1
							this.list.splice(orderIndex, 1, orderInfo)
						}
					})
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			/**
			 * 用余额支付订单
			 * https://www.yuque.com/apifm/nu0f75/lwt2vi
			 */
			async orderPayV2(orderInfo) {
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderPayV2({
					token: this.token,
					orderId: orderInfo.id
				})
				uni.hideLoading()
				if (res.code == 0) {
					uni.redirectTo({
					    url: `/pages/shop/order-detail?id=${orderInfo.id}`
					})
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.redirectTo({
							    url: `/pages/shop/order-detail?id=${orderInfo.id}`
							})
						}
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.order-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
		padding-bottom: 32rpx;
	}
	
	/* 头部装饰区域 */
	.header-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 400rpx;
		pointer-events: none;
		
		.decoration-circle {
			position: absolute;
			border-radius: 50%;
			opacity: 0.1;
			
			&.circle1 {
				width: 200rpx;
				height: 200rpx;
				background: linear-gradient(135deg, #30BCB7, #49CCAD);
				top: -100rpx;
				right: -100rpx;
			}
			
			&.circle2 {
				width: 160rpx;
				height: 160rpx;
				background: linear-gradient(135deg, #48C5A8, #6DDBC1);
				top: 200rpx;
				left: -80rpx;
			}
		}
	}
	
	/* 标签栏区域 */
	.tab-section {
		position: relative;
		z-index: 1;
		padding: 32rpx 32rpx 0;
	}

	/* 订单列表 */
	.order-list {
		position: relative;
		z-index: 1;
		margin-top: 32rpx;
		padding: 0 32rpx;

		.order-card {
			background: #FFFFFF;
			border-radius: 20rpx;
			margin-bottom: 24rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
			overflow: hidden;
			position: relative;
			
			// 添加细微的边框光晕效果
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				border-radius: 20rpx;
				padding: 1rpx;
				background: linear-gradient(135deg, rgba(48, 188, 183, 0.1), rgba(73, 204, 173, 0.05), transparent);
				mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
				mask-composite: exclude;
				pointer-events: none;
				z-index: 0;
			}
			
			&:active {
				transform: scale(0.98);
				transition: transform 0.15s ease;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
			}

			// 订单头部
			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 24rpx 24rpx 0;
				border-bottom: 1rpx solid #F5F5F5;
				padding-bottom: 16rpx;
				position: relative;
				z-index: 1;

				.order-number {
					flex: 1;
					
					.order-number-text {
						font-size: 26rpx;
						color: #666;
						font-family: 'PingFang SC', sans-serif;
					}
				}

				.order-status {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 8rpx 16rpx;
					border-radius: 20rpx;
					position: relative;
					backdrop-filter: blur(10rpx);
					transition: all 0.3s ease;

					&::before {
						content: '';
						width: 8rpx;
						height: 8rpx;
						border-radius: 50%;
						animation: statusPulse 2s infinite ease-in-out;
					}

					&.status-pending {
						background: rgba(255, 193, 7, 0.1);
						&::before {
							background-color: #FFC107;
						}
						.status-text {
							color: #FFC107;
						}
					}

					&.status-shipping {
						background: rgba(48, 188, 183, 0.1);
						&::before {
							background-color: #30BCB7;
						}
						.status-text {
							color: #30BCB7;
						}
					}

					&.status-completed {
						background: rgba(76, 175, 80, 0.1);
						&::before {
							background-color: #4CAF50;
						}
						.status-text {
							color: #4CAF50;
						}
					}

					&.status-cancelled {
						background: rgba(154, 154, 154, 0.1);
						&::before {
							background-color: #9A9A9A;
						}
						.status-text {
							color: #9A9A9A;
						}
					}

					.status-text {
						font-size: 24rpx;
						font-weight: 500;
						font-family: 'PingFang SC', sans-serif;
					}
				}
			}
			
			// 订单时间
			.order-time-section {
				padding: 16rpx 24rpx 24rpx;
				border-bottom: 1rpx solid #F5F5F5;
				
				.order-time {
					font-size: 24rpx;
					color: #999;
					font-family: 'PingFang SC', sans-serif;
				}
			}

			// 商品区域
			.goods-section {
				padding: 24rpx;
				
				.goods-item {
					display: flex;
					align-items: flex-start;
					padding: 16rpx 0;
					
					&:not(:last-child) {
						border-bottom: 1rpx solid #F8F9FA;
						margin-bottom: 16rpx;
						padding-bottom: 24rpx;
					}
					
					.goods-image {
						flex-shrink: 0;
						width: 120rpx;
						height: 120rpx;
						border-radius: 16rpx;
						overflow: hidden;
						margin-right: 24rpx;
						position: relative;
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
						
						&::after {
							content: '';
							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
							pointer-events: none;
							z-index: 1;
						}
						
						.product-image {
							width: 100%;
							height: 100%;
							transition: transform 0.3s ease;
						}
					}
					
					.goods-info {
						flex: 1;
						
						.goods-name {
							font-size: 28rpx;
							color: #333;
							font-weight: 500;
							line-height: 40rpx;
							margin-bottom: 12rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							line-clamp: 2;
							overflow: hidden;
						}
						
						.goods-price-info {
							display: flex;
							align-items: center;
							gap: 12rpx;
							margin-bottom: 12rpx;
							
							.score-price {
								font-size: 30rpx;
								color: #30BCB7;
								font-weight: 600;
							}
							
							.original-price {
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
							}
						}
						
						.goods-quantity {
							display: flex;
							align-items: center;
							
							.quantity-label {
								font-size: 24rpx;
								color: #666;
							}
							
							.quantity-value {
								font-size: 24rpx;
								color: #333;
								font-weight: 500;
							}
						}
					}
				}
			}
			
			// 地址区域
			.address-section {
				padding: 0 24rpx 24rpx;
				border-top: 1rpx solid #F5F5F5;
				padding-top: 24rpx;
				
				.address-header {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.address-icon {
						width: 32rpx;
						height: 32rpx;
						background: linear-gradient(135deg, #30BCB7, #49CCAD);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 12rpx;
						
						.icon-text {
							font-size: 16rpx;
						}
					}
					
					.address-label {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
					}
				}
				
				.address-content {
					.recipient-info {
						display: flex;
						align-items: center;
						margin-bottom: 8rpx;
						
						.recipient-name {
							font-size: 28rpx;
							color: #333;
							font-weight: 500;
							margin-right: 24rpx;
						}
						
						.recipient-phone {
							font-size: 24rpx;
							color: #666;
						}
					}
					
					.address-detail {
						font-size: 26rpx;
						color: #666;
						line-height: 36rpx;
					}
				}
			}

			// 订单底部
			.order-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 24rpx;
				border-top: 1rpx solid #F5F5F5;
				background: #FAFBFC;

				.order-total {
					.total-label {
						font-size: 26rpx;
						color: #666;
					}
					
					.total-score {
						font-size: 32rpx;
						color: #30BCB7;
						font-weight: 600;
					}
				}

				.order-actions {
					display: flex;
					gap: 16rpx;

					.action-btn {
						padding: 12rpx 24rpx;
						border-radius: 20rpx;
						border: 1rpx solid #DEDEDE;
						
						.btn-text {
							font-size: 24rpx;
							
						}
						
						&.cancel-btn {
							color: #666;
							&:active {
								background: #F5F5F5;
							}
						}
						&.pay-btn {
							background: #FFC107;
							color: #ffffff;
						}
					}
				}
			}
		}
	}
	
	/* 动画效果 */
	@keyframes statusPulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.2);
		}
	}
	.add-plus {
		padding: 0 12rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>