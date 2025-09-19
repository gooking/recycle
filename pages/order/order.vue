<template>
	<view class="order-page">
		<!-- 状态筛选标签 -->
		<uni-segmented-control
			:current="tabIndex" :values="tabs"
			@clickItem="tabClick" styleType="text"
			activeColor="#45C6A9"
		></uni-segmented-control>

		<!-- 订单列表 -->
		<view class="order-list">
			<page-box-empty v-if="!list || list.length == 0" title="暂无订单记录"></page-box-empty>
			<view v-else>
				<view v-for="(order, orderIndex) in list" :key="order.id" class="order-card" @click="navigateTo('/pages/order/detail?id=' + order.id)">
					<!-- 订单头部信息 -->
					<view class="order-header">
						<text class="order-time">下单时间：{{ order.dateAdd }}</text>
						<view class="order-status" :class="getStatusClass(order.status)">
							<text class="status-text">{{ getStatusText(order.status) }}</text>
						</view>
					</view>

					<!-- 订单内容 -->
					<view class="order-content">
						<!-- 商家信息 -->
						<view v-if="order.type2 == '到店回收'" class="address-info shop">
							<view class="l">
								<view class="name">{{ order.shopNameZt }}</view>
								<view class="tel">13500000000</view>
							</view>
							<image class="icon" src="/static/images/tel.png" mode="widthFix" @click.stop="callMerchant(order)"></image>
							<image class="icon" src="/static/images/pos.png" mode="widthFix" @click.stop="callMerchant(order)"></image>
						</view>
						
						<view class="type">
							<!-- 回收类型标签 -->
							<view class="recycle-type-tag" :class="order.type2 == '到店回收' ? 'zq' : ''">{{ order.type2 }}</view>
							<!-- 预约时间 -->
							<view v-if="order.type2 == '预约上门'" class="appointment-time">
								<text class="time-text">{{ order.day + ' ' + order.time }}</text>
							</view>
						</view>
						

						<!-- 订单详情 -->
						<view class="img-info">
							<view class="img">
								<image :src="order.extJson['image_1']" mode="aspectFill"></image>
								<view class="num">共{{ order.picNumber }}张</view>
							</view>
							<view class="order-details">
								<view class="detail-item">
									<text class="detail-label">废品类型：</text>
									<text class="detail-value">
										<template v-for="(g, index) in order.goods">{{ index > 0 ? '、' : '' }}{{ g.goodsName }}</template>
									</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">预计重量：</text>
									<text class="detail-value">{{ order.extJson['预计总量'] }}</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">废品描述：</text>
									<text class="detail-value">{{ order.extJson['废品描述'] }}</text>
								</view>
							</view>
						</view>
						

						<!-- 地址信息 -->
						<view class="address-info">
							<text v-if="order.logistics" class="address-text">{{ order.logistics.address }}</text>
							<view v-if="order.status == 0" class="contact-buttons">
								<view class="contact-btn" @click.stop="cancelOrder(orderIndex, order)">
									<text class="btn-text">取消订单</text>
								</view>
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
				tabs: ['全部', '进行中', '已完成', '已取消'], // todo 派单中
				list: [],
				currentTab: 0, // 当前选中的标签页
			}
		},
		onLoad() {
			this.getOrderList()
		},
		onReachBottom() {
			this.page++
			this.getOrderList()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.page=1
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
					title: ''
				})
				const postData = {
					token: this.token,
					page: this.page,
					showExtJson: true,
					showShopInfo: true,
				}
				if (this.tabIndex == 1) {
					postData.status = 0
				} else if (this.tabIndex == 2) {
					postData.statusBatch = '3,4'
				} else if (this.tabIndex == 3) {
					postData.status = -1
				}
				const res = await this.$wxapi.orderList(postData)
				uni.hideLoading()
				if (res.code == 0) {
					res.data.orderList.forEach(order => {
						order.goods = res.data.goodsMap[order.id]
						order.extJson = res.data.extJsonMap[order.id]
						if(order.extJson) {
							let picNumber = 0
							Object.keys(order.extJson).forEach(key => {
								if(key.indexOf('image_') == 0) {
									const num = key.split('_')[1]
									if(picNumber < num) {
										picNumber = num
									}
								}
							})
							order.picNumber = picNumber
						}
						order.logistics = res.data.logisticsMap[order.id]
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
				console.log(status);
				const statusMap = {
					// '1': 'status-dispatching', // 派单中
					'1': 'status-processing', // 派单中
					'0': 'status-processing', // 进行中
					'2': 'status-processing', // 进行中
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
					// '1': '派单中',
					'0': '进行中',
					'1': '进行中',
					'2': '进行中',
					'3': '已完成',
					'4': '已完成',
					'-1': '已取消'
				}
				return statusMap[status] || '未知状态'
			},

			/**
			 * 联系商家
			 */
			callMerchant(order) {
				uni.showModal({
					title: '联系商家',
					content: '是否拨打商家电话？',
					success: (res) => {
						if (res.confirm) {
							// 这里可以调用拨打电话的API
							uni.showToast({
								title: '正在拨打电话...',
								icon: 'none'
							})
						}
					}
				})
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
								title: ''
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
		}
	}
</script>

<style lang="scss" scoped>
	.order-page {
		min-height: 100vh;
		background-color: #F2F7F9;
		padding-bottom: 1rpx; // 为底部导航栏留出空间

		// 订单列表
		.order-list {
			margin-top: 32rpx;
			padding: 0 28rpx;

			.order-card {
				background-color: #FFFFFF;
				border-radius: 24rpx;
				margin-bottom: 32rpx;
				overflow: hidden;

				// 订单头部
				.order-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 28rpx 24rpx 0;

					.order-time {
						font-size: 24rpx;
						color: #9A9A9A;
						font-family: 'PingFang SC', sans-serif;
					}

					.order-status {
						display: flex;
						align-items: center;
						gap: 8rpx;

						&::before {
							content: '';
							width: 12rpx;
							height: 12rpx;
							border-radius: 50%;
						}

						&.status-dispatching {
							&::before {
								background-color: #608DFF;
							}
						}

						&.status-processing {
							&::before {
								background-color: #FF7C2E;
							}
						}

						&.status-completed {
							&::before {
								background-color: #4CAF50;
							}
						}

						&.status-cancelled {
							&::before {
								background-color: #9A9A9A;
							}
						}

						.status-text {
							font-size: 28rpx;
							font-weight: 500;
							color: #333333;
							font-family: 'PingFang SC', sans-serif;
						}
					}
				}

				// 订单内容
				.order-content {
					padding: 24rpx;
					.type {
						display: flex;
						margin-bottom: 16rpx;
						align-items: center;
					}
					// 回收类型标签
					.recycle-type-tag {
						background: linear-gradient(90deg, #3FCFA0 0%, #45C6A9 100%);
						border-radius: 8rpx;
						padding: 8rpx 12rpx;
						font-size: 22rpx;
						color: #FFFFFF;
						&.zq {
							background: #608DFF;
						}
					}

					// 预约时间
					.appointment-time {
						margin-left: 16rpx;
						.time-text {
							font-size: 28rpx;
							font-weight: 500;
							color: #333333;
						}
					}
					.img-info {
						display: flex;
						align-items: center;
						overflow: hidden;
						margin-bottom: 24rpx;
						.img {
							position: relative;
							image {
								border-radius: 16rpx;
								width: 126rpx;
								height: 126rpx;
							}
							.num {
								position: absolute;
								bottom: 0;
								left: 0;
								width: 100%;
								background: rgba(0, 0, 0, 0.5);
								color: #FFFFFF;
								font-size: 22rpx;
								text-align: center;
							}
						}
					}
					// 订单详情
					.order-details {
						flex: 1;
						margin-left: 24rpx;
						.detail-item {
							display: flex;
							margin-bottom: 12rpx;

							.detail-label {
								font-size: 24rpx;
								color: #9A9A9A;
								min-width: 120rpx;
							}

							.detail-value {
								font-size: 24rpx;
								color: #9A9A9A;
								flex: 1;
							}
						}
					}

					// 地址信息
					.address-info {
						border-top: 1rpx solid #F6F6F6;
						padding-top: 24rpx;
						&.shop {
							border-bottom: 1rpx solid #F6F6F6;
							padding-bottom: 24rpx;
							margin-bottom: 32rpx;
							display: flex;
							align-items: center;
							.l {
								flex: 1;
								.name {
									color: #333333;
									font-weight: bold;
									font-size: 28rpx;
								}
								.tel {
									margin-top: 16rpx;
									color: #9A9A9A;
									font-size: 24rpx;
								}
							}
							.icon {
								width: 66rpx;
								height: 66rpx;
								margin-left: 32rpx;
							}
						}
						.address-text {
							font-size: 28rpx;
							font-weight: 500;
							color: #333333;
							font-family: 'PingFang SC', sans-serif;
							margin-bottom: 24rpx;
							display: block;
						}

						.contact-buttons {
							display: flex;
							gap: 16rpx;

							.contact-btn {
								flex: 1;
								height: 60rpx;
								border: 1.6rpx solid #CBCBCB;
								border-radius: 34rpx;
								display: flex;
								align-items: center;
								justify-content: center;

								.btn-text {
									font-size: 26rpx;
									color: #333333;
									font-family: 'PingFang SC', sans-serif;
								}
							}
						}
					}
				}
			}

			// 空状态
			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 200rpx 0;

				.empty-icon {
					width: 200rpx;
					height: 200rpx;
					margin-bottom: 32rpx;
				}

				.empty-text {
					font-size: 28rpx;
					color: #9A9A9A;
					font-family: 'PingFang SC', sans-serif;
				}
			}
		}
	}
</style>