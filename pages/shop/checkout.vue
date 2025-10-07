<template>
	<view class="checkout-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
		</view>
		
		<!-- 页面内容 -->
		<view class="checkout-content">
			<!-- 收货地址 -->
			<view class="address-section">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-text">📍</text>
					</view>
					<text class="section-title">收货地址</text>
				</view>
				
				<!-- 无地址状态 -->
				<view v-if="!address" class="no-address" @click="selectAddress">
					<view class="no-address-content">
						<text class="no-address-icon">📍</text>
						<text class="no-address-text">请添加收货地址</text>
						<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
					</view>
				</view>
				
				<!-- 已有地址 -->
				<view v-else class="address-card" @click="selectAddress">
					<view class="address-info">
						<view class="recipient-info">
							<text class="recipient-name">{{ address.linkMan }}</text>
							<text class="recipient-phone">{{ address.mobile }}</text>
						</view>
						<text class="address-detail">{{ address.address }}</text>
					</view>
					<view class="address-arrow">
						<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
					</view>
				</view>
			</view>
			
			<!-- 商品信息 -->
			<view class="goods-section">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-text">🛍️</text>
					</view>
					<text class="section-title">商品信息</text>
				</view>
				
				<view class="goods-list">
					<view v-for="(item, index) in goodsList" :key="item.id" class="goods-item">
						<view class="goods-image">
							<image :src="item.pic" class="product-image" mode="aspectFill"></image>
						</view>
						<view class="goods-info">
							<text class="goods-name">{{ item.name }}</text>
							<view class="goods-price-info">
								<text class="score-price">{{ item.score }}积分</text>
								<text v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</text>
							</view>
							<view class="goods-quantity">
								<text class="quantity-label">数量：</text>
								<text class="quantity-value">x{{ item.number }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 订单备注 -->
			<view class="remark-section">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-text">📝</text>
					</view>
					<text class="section-title">订单备注</text>
				</view>
				
				<view class="remark-content">
					<textarea 
						v-model="orderRemark"
						class="remark-textarea"
						placeholder="请输入订单备注信息（选填）"
						maxlength="200"
						:show-count="true"
						auto-height
					></textarea>
				</view>
			</view>
			
			<!-- 价格确认信息 -->
			<view class="price-section">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-text">💰</text>
					</view>
					<text class="section-title">价格明细</text>
				</view>
				
				<view class="price-content">
					<view class="price-item">
						<text class="price-label">所需积分：</text>
						<text class="price-value required-score">{{ totalScore }}积分</text>
					</view>
					<view class="price-item">
						<text class="price-label">可用积分：</text>
						<text class="price-value available-score">{{ userAvailableScore }}积分</text>
					</view>
					<view class="price-divider"></view>
					<view class="price-item final-price">
						<text class="price-label">应付积分：</text>
						<text class="price-value total-pay">{{ totalScore }}积分</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部导航栏 -->
		<view class="bottom-navigation">
			<view class="nav-content">
				<view class="nav-left">
					<view class="goods-summary">
						<text class="goods-count">共{{ totalGoods }}件商品</text>
						<text class="total-score">应付{{ totalScore }}积分</text>
					</view>
				</view>
				<view class="nav-right">
					<button 
						class="submit-btn" 
						:class="{ disabled: !canSubmit }"
						:disabled="!canSubmit"
						@click="submitOrder(false)"
					>
						提交订单
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 订单来源模式 cart buy
				mode: '',
				// 当前收货地址
				address: undefined, // 上门回收地址
				// 商品列表
				goodsList: [],
				// 订单备注
				orderRemark: '',
				// 用户可用积分
				userAvailableScore: 0,
				// 总积分
				totalScore: 0,
				// 总商品数
				totalGoods: 0
			}
		},
		
		computed: {
			// 是否可以提交订单
			canSubmit() {
				return this.address && this.goodsList.length > 0 && this.userAvailableScore >= this.totalScore
			}
		},
		
		onLoad(options) {
			this.mode = options.mod || ''
			this.loadOrderData()
			this.loadUserScore()
		},
		onShow() {
			const selectAddress = uni.getStorageSync('selectAddress')
			if(selectAddress) {
				this.address = selectAddress
				this.submitOrder(true)
			}
		},
		methods: {
			/**
			 * 加载商品数据
			 */
			async loadOrderData() {
				if (this.mode == 'cart') {
					await getApp()._shippingCarInfo()
					this.goodsList = this.shippingCarInfo.items.filter(item => item.selected)
					this.totalGoods = this.shippingCarInfo.number
				} else {
					const bugGoodsInfo = uni.getStorageSync('bugGoodsInfo')
					this.goodsList = [bugGoodsInfo]
				}
				this.submitOrder(true)
			},
			
			/**
			 * 加载用户积分
			 * https://www.yuque.com/apifm/nu0f75/wrqkcb
			 */
			async loadUserScore() {
				const res = await this.$wxapi.userAmountV2(this.token)
				if(res.code == 0) {
					this.userAvailableScore = res.data.score
				}
			},
			
			/**
			 * 添加收货地址
			 */
			selectAddress() {
				uni.navigateTo({
					url: '/pages/mine/address?from=index'
				})
			},
			
			/**
			 * 提交订单
			 * https://www.yuque.com/apifm/nu0f75/qx4w98
			 */
			async submitOrder(calculate) {
				if(!this.goodsList || this.goodsList.length == 0) {
					return
				}
				if (!this.canSubmit && !calculate) {
					if (!this.address) {
						uni.showToast({
							title: '请先添加收货地址',
							icon: 'none'
						})
						return
					}
					if (this.userAvailableScore < this.totalScore) {
						uni.showToast({
							title: '积分不足',
							icon: 'none'
						})
						return
					}
					return
				}
				// 构建订单数据
				const goodsJsonStr = []
				this.goodsList.forEach(ele => {
					goodsJsonStr.push({
						goodsId: ele.goodsId,
						number: ele.number,
					})
				})
				const orderData = {
					token: this.token,
					calculate: calculate == true,
					goodsJsonStr: JSON.stringify(goodsJsonStr),
					remark: this.orderRemark || '',
				}
				if(this.address) {
					orderData.provinceId = this.address.provinceId
					orderData.provinceId = this.address.provinceId
					orderData.cityId = this.address.cityId
					orderData.address = this.address.address
					orderData.menpai = this.address.menpai
					orderData.linkMan = this.address.linkMan
					orderData.mobile = this.address.mobile
					orderData.lat = this.address.latitude
					orderData.lng = this.address.longitude
				}
				uni.showLoading({ title: '提交中...' })
				const res = await this.$wxapi.orderCreate(orderData)
				if (res.code != 0) {
				    uni.showToast({
				    	title: res.msg,
						icon: 'none'
				    })
					return
				}
				uni.hideLoading()
				if (calculate) {
					// 预下单
					this.totalScore = res.data.score
				} else {
					// 正式下单, 删除购物车数据 https://www.yuque.com/apifm/nu0f75/pndgyc
					if(this.mode == 'cart') {
						const keys = []
						this.goodsList.forEach(ele => {
							keys.push(ele.key)
						})
						await this.$wxapi.shippingCarInfoRemoveItem(this.token, keys.join())
					}
					uni.showModal({
						content: '订单提交成功',
						showCancel: false,
						success: async () => {
							/**
							 * 用积分支付订单
							 * https://www.yuque.com/apifm/nu0f75/lwt2vi
							 */
							const resPay = await this.$wxapi.orderPayV2({
								token: this.token,
								orderId: res.data.id
							})
							if (resPay.code == 0) {
								uni.redirectTo({
								    url: `/pages/shop/order-detail?id=${res.data.id}`
								})
							} else {
								uni.showModal({
									content: resPay.msg,
									showCancel: false,
									success: () => {
										uni.redirectTo({
										    url: `/pages/shop/order-detail?id=${res.data.id}`
										})
									}
								})
							}
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.checkout-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
		padding-bottom: 160rpx; // 为底部导航栏留出空间
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
	
	/* 页面内容 */
	.checkout-content {
		position: relative;
		z-index: 1;
		padding: 32rpx 32rpx 0;
	}
	
	/* 通用区块样式 */
	.address-section,
	.goods-section,
	.remark-section,
	.price-section {
		background: #FFFFFF;
		border-radius: 20rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	
	/* 区块头部 */
	.section-header {
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #F5F5F5;
		
		.header-icon {
			width: 48rpx;
			height: 48rpx;
			background: linear-gradient(135deg, #30BCB7, #49CCAD);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 16rpx;
			
			.icon-text {
				font-size: 20rpx;
			}
		}
		
		.section-title {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
		}
	}
	
	/* 收货地址区域 */
	.no-address {
		padding: 32rpx;
		
		.no-address-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx;
			background: #F8F9FA;
			border-radius: 16rpx;
			border: 2rpx dashed #CCCCCC;
			
			.no-address-icon {
				font-size: 32rpx;
			}
			
			.no-address-text {
				flex: 1;
				font-size: 28rpx;
				color: #666;
				margin-left: 16rpx;
			}
			
			.no-address-arrow {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		&:active .no-address-content {
			background: #F0F0F0;
		}
	}
	
	.address-card {
		padding: 32rpx;
		position: relative;
		display: flex;
		align-items: center;
		
		&:active {
			background: #F8F9FA;
		}
		
		.address-info {
			flex: 1;
			margin-right: 24rpx;
			
			.recipient-info {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;
				
				.recipient-name {
					font-size: 30rpx;
					color: #333;
					font-weight: 600;
					margin-right: 24rpx;
				}
				
				.recipient-phone {
					font-size: 26rpx;
					color: #666;
				}
			}
			
			.address-detail {
				font-size: 28rpx;
				color: #666;
				line-height: 40rpx;
			}
		}
		
		.address-arrow {
			flex-shrink: 0;
			width: 32rpx;
			height: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.arrow-text {
				font-size: 24rpx;
				color: #CCCCCC;
				font-weight: bold;
			}
		}
	}
	
	/* 商品信息区域 */
	.goods-list {
		padding: 0 32rpx 32rpx;
		
		.goods-item {
			display: flex;
			align-items: flex-start;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #F5F5F5;
			
			&:last-child {
				border-bottom: none;
			}
			
			.goods-image {
				flex-shrink: 0;
				width: 120rpx;
				height: 120rpx;
				border-radius: 16rpx;
				overflow: hidden;
				margin-right: 24rpx;
				
				.product-image {
					width: 100%;
					height: 100%;
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
						font-size: 26rpx;
						color: #666;
					}
					
					.quantity-value {
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
					}
				}
			}
		}
	}
	
	/* 订单备注区域 */
	.remark-content {
		padding: 0 32rpx 32rpx;
		
		.remark-textarea {
			box-sizing: border-box;
			margin-top: 16rpx;
			width: 100%;
			min-height: 120rpx;
			padding: 24rpx;
			background: #F8F9FA;
			border-radius: 16rpx;
			border: 1rpx solid #E8E8E8;
			font-size: 28rpx;
			color: #333;
			line-height: 40rpx;
			
			&:focus {
				border-color: #30BCB7;
				background: #FFFFFF;
			}
		}
	}
	
	/* 价格确认区域 */
	.price-content {
		padding: 0 32rpx 32rpx;
		
		.price-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16rpx 0;
			
			.price-label {
				font-size: 28rpx;
				color: #666;
			}
			
			.price-value {
				font-size: 28rpx;
				font-weight: 500;
				
				&.required-score {
					color: #30BCB7;
				}
				
				&.available-score {
					color: #333;
				}
				
				&.total-pay {
					color: #FF6B6B;
					font-size: 32rpx;
					font-weight: 600;
				}
			}
			
			&.final-price {
				border-top: 1rpx solid #F5F5F5;
				padding-top: 24rpx;
				margin-top: 16rpx;
			}
		}
		
		.price-divider {
			height: 1rpx;
			background: #F5F5F5;
			margin: 16rpx 0;
		}
	}
	
	/* 底部导航栏 */
	.bottom-navigation {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFFFFF;
		border-top: 1rpx solid #F0F0F0;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
		z-index: 999;
		
		.nav-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 32rpx;
			padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
			
			.nav-left {
				.goods-summary {
					display: flex;
					flex-direction: column;
					gap: 8rpx;
					
					.goods-count {
						font-size: 24rpx;
						color: #999;
					}
					
					.total-score {
						font-size: 32rpx;
						color: #30BCB7;
						font-weight: 600;
					}
				}
			}
			
			.nav-right {
				.submit-btn {
					width: 240rpx;
					height: 80rpx;
					background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
					border-radius: 40rpx;
					border: none;
					font-size: 28rpx;
					color: #FFFFFF;
					font-weight: 500;
					transition: all 0.2s ease;
					
					&:not(.disabled):active {
						transform: scale(0.95);
					}
					
					&.disabled {
						background: #CCCCCC;
						opacity: 0.6;
					}
				}
			}
		}
	}
</style>