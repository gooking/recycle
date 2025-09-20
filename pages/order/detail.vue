<template>
	<view v-if="orderDetail" class="order-detail">
		
		<!-- 订单状态 -->
		<view class="order-status">
			<text class="status-text">{{ getStatusText(orderDetail.orderInfo.status) }}</text>
		</view>
		
		<!-- 预计上门时间卡片 -->
		<view v-if="orderDetail.orderInfo.type2 == '预约上门'" class="time-card">
			<view class="time-info">
				<text class="time-label">预计上门({{ orderDetail.orderInfo.day }})</text>
				<text class="time-value">{{ orderDetail.orderInfo.time }}</text>
			</view>
			<text class="time-tip">因订单较多，上门时间可能会波动，敬请谅解</text>
			<view v-if="orderDetail.orderInfo.status == 0" class="action-buttons">
				<view class="cancel-btn" @click="cancelOrder">
					<uni-icons type="close" size="64rpx"></uni-icons>
					<text class="cancel-text">取消订单</text>
				</view>
			</view>
		</view>
		<view v-if="orderDetail.orderInfo.type2 == '到店回收'" class="time-card">
			<view class="time-info">
				<text class="time-label">到店回收</text>
				<!-- <text class="time-value">12121</text> -->
			</view>
			<text class="time-tip">请自行将废品送往门店，送达后提醒工作人员核销订单</text>
			<view class="action-buttons">
				<view class="contact-btn" @click="contactMerchant">
					<uni-icons type="shop" size="64rpx"></uni-icons>
					<text class="contact-text">联系商家</text>
				</view>
				<view class="contact-btn" @click="openLocation">
					<uni-icons type="paperplane" size="64rpx"></uni-icons>
					<text class="contact-text">导航到店</text>
				</view>
				<view v-if="orderDetail.orderInfo.status !== 0" class="cancel-btn" @click="cancelOrder">
					<uni-icons type="close" size="64rpx"></uni-icons>
					<text class="cancel-text">取消订单</text>
				</view>
			</view>
		</view>
		
		<!-- 预约详情卡片 -->
		<view class="appointment-card">
			<view class="card-title">{{ orderDetail.orderInfo.type2 == '预约上门' ? '上门地址' : '门店地址' }}</view>
			<view v-if="orderDetail.orderInfo.type2 == '预约上门'" class="contact-info">
				<view class="contact-name">{{ orderDetail.logistics.linkMan }} {{ orderDetail.logistics.mobileMask }}</view>
				<view class="contact-address">{{ orderDetail.logistics.address }}</view>
			</view>
			<view v-if="orderDetail.orderInfo.type2 == '到店回收'" class="contact-info">
				<view class="contact-name">{{ orderDetail.shopInfoZt.name }}</view>
				<view class="contact-address">{{ orderDetail.shopInfoZt.address }}</view>
			</view>
		</view>
		
		<!-- 废品信息卡片 -->
		<view class="waste-card">
			<view class="title">预约详情</view>
			<view class="waste-info">
				<view class="waste-item">
					<text class="waste-label">废品类型：</text>
					<text class="waste-value">
						<template v-for="(g, index) in orderDetail.goods">{{ index > 0 ? '、' : '' }}{{ g.goodsName }}</template>
					</text>
				</view>
				<view class="waste-item">
					<text class="waste-label">预计重量：</text>
					<text class="waste-value">{{ orderDetail.extJson['预计总量'] }}</text>
				</view>
			</view>
			
			<view class="waste-images">
				<view class="title">废品图片</view>
				<view class="images-grid">
					<view class="image-item" v-for="(image, index) in wasteImages" :key="image">
						<image :src="image" class="waste-image" mode="aspectFill" @click="previewImage(image)"></image>
					</view>
				</view>
			</view>
			
			<view class="waste-description">
				<view class="title">废品描述</view>
				<text class="desc-content">{{ orderDetail.extJson['废品描述'] }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderId: undefined,
				orderDetail: undefined,
				wasteImages: [], // 废品图片
			}
		},
		onLoad(options) {
			if (options.id) {
				this.orderId = options.id
				this.getOrderDetail()
			}
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.getOrderDetail()
		},
		methods: {
			getStatusText(status) {
				const statusMap = {
					'0': '派单中',
					'1': '进行中',
					'2': '进行中',
					'3': '已完成',
					'4': '已完成',
					'-1': '已取消'
				}
				return statusMap[status] || '未知状态'
			},
			/**
			 * 获取订单详情
			 * 文档地址：https://www.yuque.com/apifm/nu0f75/oamel8
			 */
			async getOrderDetail() {
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderDetail(this.token, this.orderId)
				uni.hideLoading()
				if(res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
					return
				}
				const wasteImages = []
				Object.keys(res.data.extJson).forEach(key => {
					if(key.indexOf('image_') == 0) {
						wasteImages.push(res.data.extJson[key])
					}
				})
				this.wasteImages = wasteImages
				this.orderDetail = res.data
			},
			
			/**
			 * 返回上一页
			 */
			goBack() {
				uni.navigateBack()
			},
			
			/**
			 * 联系商家
			 */
			contactMerchant() {
				uni.makePhoneCall({
					phoneNumber: this.orderDetail.shopInfoZt.linkPhone
				})
			},
			
			/**
			 * 取消订单
			 */
			cancelOrder() {
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
							  orderId: this.orderId
							})
							uni.hideLoading()
							if (res.code != 0) {
								uni.showToast({
									title: res.msg,
									icon: 'none'
								})
							} else {
								this.getOrderDetail()
							}
						}
					}
				})
			},
			previewImage(image) {
				uni.previewImage({
					current: image,
					showmenu: true,
					urls: this.wasteImages,
					loop: true
				})
			},
			openLocation() {
				const shopInfo = this.orderDetail.shopInfoZt
				var name = shopInfo.name
				var address = shopInfo.address
				var latitude = shopInfo.latitude
				var longitude = shopInfo.longitude
				uni.openLocation({
					name: name,
					address: address,
					latitude: latitude,
					longitude: longitude,
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.order-detail {
	min-height: 100vh;
	background: #F2F7F9;
	padding-bottom: 64rpx;
	// 订单状态
	.order-status {
		padding: 32rpx 0 0 32rpx;
		
		.status-text {
			font-size: 44rpx;
			font-weight: 600;
			color: #333333;
		}
	}
	
	// 预计上门时间卡片
	.time-card {
		margin: 32rpx 28rpx 0 28rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 32rpx;
		
		.time-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12rpx;
			
			.time-label {
				font-size: 32rpx;
				font-weight: 600;
				color: #333333;
			}
			
			.time-value {
				font-size: 32rpx;
				font-weight: 600;
				color: #4478FE;
			}
		}
		
		.time-tip {
			font-size: 24rpx;
			color: #9A9A9A;
			margin-bottom: 32rpx;
		}
		
		.action-buttons {
			display: flex;
			justify-content: space-around;
			margin-top: 48rpx;
			.contact-btn,
			.cancel-btn {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8rpx;
				
				.contact-icon,
				.cancel-icon {
					font-size: 48rpx;
					color: #333333;
				}
				
				.contact-text,
				.cancel-text {
					font-size: 24rpx;
					color: #333333;
				}
			}
		}
	}
	
	// 预约详情卡片
	.appointment-card {
		margin: 32rpx 28rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 32rpx;
		
		.card-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 24rpx;
		}
		
		.contact-info {
			.contact-name {
				font-size: 32rpx;
				font-weight: 500;
				color: #333333;
				margin-bottom: 8rpx;
			}
			
			.contact-address {
				font-size: 24rpx;
				color: #9A9A9A;
				line-height: 32rpx;
			}
		}
	}
	
	// 废品信息卡片
	.waste-card {
		margin: 0 28rpx 32rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 32rpx;
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 24rpx;
		}
		.waste-info {
			margin-bottom: 32rpx;
			
			.waste-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;
				
				.waste-label {
					font-size: 28rpx;
					color: #9A9A9A;
				}
				
				.waste-value {
					font-size: 28rpx;
					color: #333333;
				}
			}
		}
		
		.waste-images {
			margin-bottom: 32rpx;
			
			.images-grid {
				display: flex;
				flex-wrap: wrap;
				
				.image-item {
					width: 204rpx;
					height: 204rpx;
					box-sizing: border-box;
					border-radius: 12rpx;
					overflow: hidden;
					padding: 24rpx;
					.waste-image {
						width: 100%;
						height: 100%;
					}
				}
			}
		}
		
		.waste-description {
			.desc-content {
				font-size: 28rpx;
				color: #9A9A9A;
				line-height: 1.4;
			}
		}
	}
}
</style>