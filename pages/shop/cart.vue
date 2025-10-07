<template>
	<view class="cart-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
		</view>
		
		<!-- 购物车内容 -->
		<view class="cart-content">
			<!-- 空购物车状态 -->
			<view v-if="!shippingCarInfo" class="empty-cart">
				<image src="/static/images/empty-cart.png" class="empty-image" mode="aspectFit"></image>
				<text class="empty-title">购物车还是空的</text>
				<text class="empty-subtitle">快去挑选心仪的商品吧~</text>
				<button class="go-shopping-btn" @click="goShopping">去逛逛</button>
			</view>
			
			<!-- 购物车商品列表 -->
			<view v-else class="cart-list">
				<!-- 全选区域 -->
				<view class="select-all-section">
					<view class="select-all-content">
						<checkbox-group @change="selectAllChange">
							<label class="select-all-label">
								<checkbox :checked="isAllSelected" color="#30BCB7" />
								<text class="select-all-text">全选</text>
							</label>
						</checkbox-group>
					</view>
					<view class="cart-count">
						<text class="count-text">共{{ shippingCarInfo.number }}件商品</text>
					</view>
				</view>
				
				<!-- 商品列表 -->
				<view class="goods-list">
					<uni-swipe-action v-for="(item, index) in shippingCarInfo.items" :key="item.id" :show="item.show">
						<uni-swipe-action-item 
							:right-options="rightOptions" 
							@click="handleSwipeAction($event, item, index)"
						>
							<view class="cart-item">
								<view class="item-select">
									<checkbox-group @change="selectItem($event, item, index)">
										<label>
											<checkbox :checked="item.selected" color="#30BCB7" />
										</label>
									</checkbox-group>
								</view>
								
								<view class="item-image">
									<image :src="item.pic" class="product-image" mode="aspectFill"></image>
								</view>
								
								<view class="item-info">
									<view class="item-details">
										<text class="item-name">{{ item.name }}</text>
										<view class="item-price">
											<text v-if="item.price" class="score-price">￥{{ item.price }}</text>
											<text v-if="item.price && item.score" class="add-plus">+</text>
											<text v-if="item.score" class="score-price">{{ item.score }}积分</text>
											<text v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</text>
										</view>
									</view>
									
									<view class="item-actions">
										<uni-number-box 
											:value="item.number" 
											:min="0" 
											:max="item.stores"
											@change="changeNumber($event, item, index)"
										></uni-number-box>
									</view>
								</view>
							</view>
						</uni-swipe-action-item>
					</uni-swipe-action>
				</view>
			</view>
		</view>
		
		<!-- 底部结算栏 -->
		<view v-if="shippingCarInfo" class="checkout-bar">
			<view class="checkout-content">
				<view class="checkout-left">
					<view class="total-info">
						<text class="total-label">合计：</text>
						<text v-if="shippingCarInfo.price" class="total-score">￥{{ shippingCarInfo.price }}</text>
						<text v-if="shippingCarInfo.price && shippingCarInfo.score" class="add-plus">+</text>
						<text v-if="shippingCarInfo.score" class="total-score">{{ shippingCarInfo.score }}积分</text>
					</view>
					<text class="selected-count">已选{{ shippingCarInfo.number }}件</text>
				</view>
				<view class="checkout-right">
					<button 
						class="checkout-btn" 
						:class="{ disabled: shippingCarInfo.number == 0 }"
						:disabled="shippingCarInfo.number == 0"
						@click="handleCheckout"
					>
						去结算
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
				// 右滑删除选项
				rightOptions: [
					{
						text: '删除',
						style: {
							backgroundColor: '#FF4757'
						}
					}
				]
			}
		},
		
		computed: {
			// 是否全选
			isAllSelected() {
				if (!this.shippingCarInfo) return false
				return this.shippingCarInfo.items.every(item => item.selected)
			},
			// 已选择的商品数量
			selectedCount() {
				if (!this.cartList) return 0
				return this.cartList.filter(item => item.selected).length
			},
		},
		
		onLoad() {
			getApp()._shippingCarInfo()
		},
		
		methods: {
			/**
			 * 返回上一页
			 */
			goBack() {
				uni.navigateBack()
			},
			
			/**
			 * 去购物
			 */
			goShopping() {
				uni.switchTab({
					url: '/pages/shop/index'
				})
			},
			
			/**
			 * 加载购物车列表
			 */
			async loadCartList() {
				try {
					uni.showLoading({ title: '加载中...' })
					// 这里调用实际的API获取购物车数据
					// const res = await this.$wxapi.shippingCarInfo({
					//     token: this.token
					// })
					// if (res.code === 0) {
					//     this.cartList = res.data.map(item => ({
					//         ...item,
					//         selected: false,
					//         show: false
					//     }))
					// }
					uni.hideLoading()
				} catch (error) {
					uni.hideLoading()
					console.error('加载购物车失败：', error)
				}
			},
			/**
			 * 全选change事件
			 */
			async selectAllChange(e) {
				const keys = []
				this.shippingCarInfo.items.forEach(ele => {
					keys.push(ele.key)
				})
				await this.$wxapi.shippingCartSelected(this.token, keys.join(), e.detail.value.length == 1)
				getApp()._shippingCarInfo()
			},
			
			/**
			 * 选择单个商品
			 */
			async selectItem(e, item, index) {
				await this.$wxapi.shippingCartSelected(this.token, item.key, e.detail.value.length == 1)
				getApp()._shippingCarInfo()
			},
			
			/**
			 * 修改商品数量
			 * https://www.yuque.com/apifm/nu0f75/kbi5b0
			 */
			async changeNumber(value, item, index) {
				if (value == 0) {
					/**
					 * 删除购物车记录
					 * https://www.yuque.com/apifm/nu0f75/pndgyc
					 */
					await this.$wxapi.shippingCarInfoRemoveItem(this.token, item.key)
					getApp()._shippingCarInfo()
				} else {
					await this.$wxapi.shippingCarInfoModifyNumber(this.token, item.key, value)
					getApp()._shippingCarInfo()
				}
			},
			
			/**
			 * 处理滑动操作
			 */
			handleSwipeAction(e, item, index) {
				if (e.index === 0) {
					// 删除商品
					this.deleteCartItem(item, index)
				}
			},
			
			/**
			 * 删除购物车记录
			 * https://www.yuque.com/apifm/nu0f75/pndgyc
			 */
			async deleteCartItem(item, index) {
				await this.$wxapi.shippingCarInfoRemoveItem(this.token, item.key)
				getApp()._shippingCarInfo()
			},
			
			/**
			 * 去结算
			 */
			handleCheckout() {
				uni.navigateTo({
					url: '/pages/shop/checkout?mod=cart'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cart-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
		padding-bottom: 160rpx; // 为底部结算栏留出空间
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
	
	/* 导航栏 */
	.nav-bar {
		padding-top: calc(32rpx + env(safe-area-inset-top));
		padding-bottom: 32rpx;
		position: relative;
		z-index: 10;
		
		.nav-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 32rpx;
			
			.nav-left {
				width: 64rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.9);
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
				
				&:active {
					transform: scale(0.95);
				}
			}
			
			.nav-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
			}
			
			.nav-right {
				width: 64rpx;
			}
		}
	}
	
	/* 购物车内容 */
	.cart-content {
		position: relative;
		z-index: 1;
		padding: 0 32rpx;
	}
	
	/* 空购物车状态 */
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 64rpx;
		
		.empty-image {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 48rpx;
			opacity: 0.6;
		}
		
		.empty-title {
			font-size: 32rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 16rpx;
		}
		
		.empty-subtitle {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 64rpx;
		}
		
		.go-shopping-btn {
			width: 240rpx;
			height: 80rpx;
			background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
			border-radius: 40rpx;
			border: none;
			font-size: 28rpx;
			color: #FFFFFF;
			font-weight: 500;
			
			&:active {
				transform: scale(0.95);
			}
		}
	}
	
	/* 全选区域 */
	.select-all-section {
		margin-top: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		
		.select-all-content {
			.select-all-label {
				display: flex;
				align-items: center;
				
				.select-all-text {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					margin-left: 16rpx;
				}
			}
		}
		
		.cart-count {
			.count-text {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
	
	/* 商品列表 */
	.goods-list {
		.cart-item {
			display: flex;
			align-items: center;
			background: #FFFFFF;
			border-radius: 20rpx;
			padding: 32rpx;
			margin-bottom: 24rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
			
			.item-select {
				margin-right: 24rpx;
			}
			
			.item-image {
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
			
			.item-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				
				.item-details {
					margin-bottom: 24rpx;
					
					.item-name {
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
					
					.item-price {
						display: flex;
						align-items: center;
						gap: 12rpx;
						
						.score-price {
							font-size: 32rpx;
							color: #30BCB7;
							font-weight: 600;
						}
						
						.original-price {
							font-size: 24rpx;
							color: #999;
							text-decoration: line-through;
						}
					}
				}
				
				.item-actions {
					display: flex;
					justify-content: flex-end;
				}
			}
		}
	}
	
	/* 底部结算栏 */
	.checkout-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFFFFF;
		border-top: 1rpx solid #F0F0F0;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
		z-index: 999;
		
		.checkout-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 32rpx;
			padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
			
			.checkout-left {
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.total-info {
					display: flex;
					align-items: baseline;
					
					.total-label {
						font-size: 28rpx;
						color: #333;
					}
					
					.total-score {
						font-size: 36rpx;
						color: #30BCB7;
						font-weight: 600;
						margin-left: 8rpx;
					}
				}
				
				.selected-count {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.checkout-right {
				.checkout-btn {
					width: 200rpx;
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
	.add-plus {
		padding: 0 8rpx;
		padding-left: 18rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>