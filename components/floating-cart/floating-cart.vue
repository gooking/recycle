<template>
	<view class="floating-cart" @click="goToCart">
		<view class="cart-icon">
			<uni-icons type="cart" size="48rpx" color="#FFFFFF"></uni-icons>
			<view v-if="this.shippingCarInfo" class="cart-badge">
				<text class="badge-text">{{ this.shippingCarInfo.number > 99 ? '99+' : this.shippingCarInfo.number }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'FloatingCart',
		mounted() {
			// 页面显示时重新获取系统信息，确保适配不同设备
			getApp()._shippingCarInfo()
		},
		methods: {
			/**
			 * 跳转到购物车页面
			 */
			goToCart() {
				uni.navigateTo({
					url: '/pages/shop/cart'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.floating-cart {
		position: fixed;
		right: 32rpx;
		bottom: 120rpx;
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(48, 188, 183, 0.3);
		z-index: 1000;
		transition: all 0.3s ease;
		
		&:active {
			transform: scale(0.9);
		}
		
		.cart-icon {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.cart-badge {
				position: absolute;
				top: -32rpx;
				right: -32rpx;
				min-width: 32rpx;
				height: 32rpx;
				background: #FF6B6B;
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 8rpx;
				border: 4rpx solid #FFFFFF;
				
				.badge-text {
					font-size: 20rpx;
					color: #FFFFFF;
					font-weight: 600;
					line-height: 1;
				}
			}
		}
	}
	
	/* 适配不同屏幕底部安全区域 */
	@supports (bottom: env(safe-area-inset-bottom)) {
		.floating-cart {
			bottom: calc(200rpx + env(safe-area-inset-bottom));
		}
	}
</style>
