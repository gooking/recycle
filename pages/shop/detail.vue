<template>
	<view v-if="productDetail" class="detail-page">
		<!-- 商品轮播图 -->
		<view class="product-gallery">
			<swiper 
				class="gallery-swiper" 
				indicator-dots
				autoplay
				circular
				indicator-color="rgba(255,255,255,0.3)"
				indicator-active-color="#fff"
			>
				<swiper-item v-for="(image, index) in productImages" :key="index">
					<image 
						:src="image" 
						class="gallery-image" 
						mode="aspectFill"
						@click="previewImages(index)"
					/>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 商品基础信息 -->
		<view class="product-info">
			<view class="product-header">
				<text class="product-title">{{ productDetail.basicInfo.name }}</text>
				<view class="product-subtitle" v-if="productDetail.characteristic">
					<text class="subtitle-text">{{ productDetail.characteristic }}</text>
				</view>
			</view>
			
			<view class="product-price-section">
				<view class="price-main">
					<text class="score-price">{{ productDetail.basicInfo.minScore }}积分</text>
					<text v-if="productDetail.basicInfo.originalPrice" class="market-price">¥{{ productDetail.basicInfo.originalPrice }}</text>
				</view>
			</view>
			
			<view class="product-stats">
				<view class="stat-item">
					<text class="stat-label">库存</text>
					<text class="stat-value">{{ productDetail.basicInfo.stores }} 件</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-label">销量</text>
					<text class="stat-value">{{ productDetail.basicInfo.numberSells }} 件</text>
				</view>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="product-detail-section">
			<view class="section-header">
				<text class="section-title">商品详情</text>
			</view>
			<view class="detail-content">
				<mp-html :content="productDetail.content || '暂无详情'" />
			</view>
		</view>
		
		<!-- 底部购买导航 -->
		<view class="goods-nav-container">
			<uni-goods-nav 
				:fill="true" 
				:options="navOptions" 
				:buttonGroup="buttonGroup" 
				@click="onNavClick" 
				@buttonClick="onButtonClick" 
			/>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				productId: '', // 商品ID
				productDetail: undefined, // 商品详情
				productImages: [], // 商品图片列表
				
				// 底部导航配置
				navOptions: [
					{
						icon: 'headphones',
						text: '客服'
					}, 
					{
						icon: 'shop',
						text: '商城'
					}, 
					{
						icon: 'cart',
						text: '购物车',
						info: 0
					}
				],
				buttonGroup: [
					{
						text: '加入购物车',
						backgroundColor: '#30BCB7',
						color: '#fff'
					},
					{
						text: '立即购买',
						backgroundColor: '#FF6B6B',
						color: '#fff'
					}
				]
			}
		},
		
		onLoad(options) {
			this.productId = options.id
			if (this.productId) {
				this.loadProductDetail()
				this.updateCartBadge()
			}
		},
		
		methods: {
			/**
			 * 加载商品详情
			 * https://www.yuque.com/apifm/nu0f75/vuml8a
			 */
			async loadProductDetail() {
				if (!this.productId) return
				
				uni.showLoading({
					title: '加载中...'
				})
				const res = await this.$wxapi.goodsDetailV2({
					id: this.productId,
					token: this.token
				})
				uni.hideLoading()
				if (res.code == 0) {
					this.productDetail = res.data
					this.productImages = res.data.pics2
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
				}
			},
			
			/**
			 * 图片预览
			 */
			previewImages(current) {
				uni.previewImage({
					urls: this.productImages,
					current: current
				})
			},
			
			/**
			 * 导航按钮点击
			 */
			onNavClick(e) {
				const { index, content } = e
				switch(index) {
					case 0: // 客服
						this.contactService()
						break
					case 1: // 店铺
						this.goToShop()
						break
					case 2: // 购物车
						this.goToCart()
						break
				}
			},
			
			/**
			 * 购买按钮点击
			 */
			onButtonClick(e) {
				const { index } = e
				switch(index) {
					case 0: // 加入购物车
						this.addToCart()
						break
					case 1: // 立即购买
						this.buyNow()
						break
				}
			},
			
			/**
			 * 联系客服
			 */
			contactService() {
				uni.makePhoneCall({
					phoneNumber: this.sysconfigMap.kf_tel
				})
			},
			
			/**
			 * 前往店铺
			 */
			goToShop() {
				uni.switchTab({
					url: '/pages/shop/index'
				})
			},
			
			/**
			 * 前往购物车
			 */
			goToCart() {
				uni.showToast({
					title: '购物车功能开发中',
					icon: 'none'
				})
			},
			
			/**
			 * 添加到购物车 - 复用goods-list.vue的方法
			 * https://www.yuque.com/apifm/nu0f75/et6m6m
			 */
			async addToCart() {
				if (this.productDetail.basicInfo.stores <= 0) {
					uni.showToast({
						title: '商品已售罄',
						icon: 'none'
					})
					return
				}
				
				uni.showLoading({
					title: '添加中...'
				})
				const res = await this.$wxapi.shippingCarInfoAddItemV2({
					token: this.token,
					goodsId: this.productId,
					number: 1
				})
				uni.hideLoading()
				if (res.code === 0) {
					uni.showToast({
						title: '添加成功',
						icon: 'success'
					})
					// 更新购物车角标
					this.updateCartBadge()
				} else {
					uni.showToast({
						title: res.msg || '添加失败',
						icon: 'none'
					})
				}
			},
			
			/**
			 * 立即购买 - 预留给用户自己实现
			 */
			buyNow() {
				// 这里预留给用户自己补充立即购买的逻辑
				uni.showToast({
					title: '立即购买功能待实现',
					icon: 'none'
				})
			},
			async updateCartBadge() {
				await getApp()._shippingCarInfo()
				if (this.shippingCarInfo) {
					let cartNumber = 0
					for (let i = 0; i < this.shippingCarInfo.items.length; i++) {
						const item = this.shippingCarInfo.items[i]
						if(item.goodsId == this.productId) {
							cartNumber += item.number
						}
					}
					this.navOptions[2].info = cartNumber
				} else {
					this.navOptions[2].info = ''
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.detail-page {
		min-height: 100vh;
		background: #F8F9FA;
		padding-bottom: 150rpx; // 给底部导航留出空间
	}
	
	/* 商品轮播图 */
	.product-gallery {
		background: #fff;
		
		.gallery-swiper {
			height: 750rpx;
			width: 100%;
			
			.gallery-image {
				width: 100%;
				height: 100%;
			}
		}
	}
	
	/* 商品基础信息 */
	.product-info {
		background: #fff;
		padding: 32rpx;
		margin-bottom: 20rpx;
		
		.product-header {
			margin-bottom: 24rpx;
			
			.product-title {
				font-size: 36rpx;
				color: #333;
				font-weight: 600;
				line-height: 50rpx;
				display: block;
				margin-bottom: 12rpx;
			}
			
			.product-subtitle {
				.subtitle-text {
					font-size: 28rpx;
					color: #666;
					line-height: 40rpx;
				}
			}
		}
		
		.product-price-section {
			margin-bottom: 32rpx;
			
			.price-main {
				display: flex;
				align-items: baseline;
				gap: 16rpx;
				
				.score-price {
					font-size: 48rpx;
					color: #30BCB7;
					font-weight: 700;
				}
				
				.market-price {
					font-size: 28rpx;
					color: #999;
					text-decoration: line-through;
				}
			}
		}
		
		.product-stats {
			display: flex;
			align-items: center;
			
			.stat-item {
				display: flex;
				align-items: center;
				gap: 8rpx;
				
				.stat-label {
					font-size: 28rpx;
					color: #666;
				}
				
				.stat-value {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}
			}
			
			.stat-divider {
				width: 2rpx;
				height: 24rpx;
				background: #E0E0E0;
				margin: 0 32rpx;
			}
		}
	}
	
	/* 商品详情 */
	.product-detail-section {
		background: #fff;
		
		.section-header {
			padding: 32rpx 32rpx 0;
			border-bottom: 2rpx solid #F0F0F0;
			
			.section-title {
				font-size: 32rpx;
				color: #333;
				font-weight: 600;
				line-height: 80rpx;
			}
		}
		
		.detail-content {
			padding: 32rpx;
			min-height: 400rpx;
		}
	}
	
	/* 底部安全区域 */
	.bottom-safe-area {
		height: calc(120rpx + env(safe-area-inset-bottom));
	}
	
	/* 底部购买导航 */
	.goods-nav-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: #fff;
		border-top: 2rpx solid #F0F0F0;
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>