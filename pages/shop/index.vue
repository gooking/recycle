<template>
	<view class="shop-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
			<view class="decoration-circle circle3"></view>
		</view>
		
		<!-- 搜索条 -->
		<view class="search-section">
			<view class="search-container">
				<view class="search-box">
					<uni-icons type="search" size="32rpx" color="#999"></uni-icons>
					<input 
						v-model="searchKeyword" 
						class="search-input" 
						placeholder="搜索积分商城商品"
						placeholder-class="search-placeholder"
						@input="onSearchInput"
						@confirm="handleSearch"
					/>
					<view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
						<uni-icons type="clear" size="28rpx" color="#ccc"></uni-icons>
					</view>
				</view>
				<view class="search-btn" @click="handleSearch">
					<text class="search-text">搜索</text>
				</view>
			</view>
		</view>
		
		<!-- 主要内容区域 -->
		<view class="content-section">
			<!-- Banner轮播图 -->
			<view class="banner-section">
				<swiper 
					class="banner-swiper" 
					:indicator-dots="true" 
					:autoplay="true" 
					:interval="3000" 
					:duration="500"
					circular
					indicator-color="rgba(255,255,255,0.5)"
					indicator-active-color="#30BCB7"
				>
					<swiper-item v-for="(banner, index) in bannerList" :key="index" @click="handleBannerClick(banner)">
						<view class="banner-item">
							<image :src="banner.picUrl" class="banner-image" mode="aspectFill"></image>
						</view>
					</swiper-item>
				</swiper>
			</view>
			
			<!-- 商品分类金刚区 -->
			<view class="category-section">
				<view class="section-title">
					<view class="title-left">
						<text class="title-text">商品分类</text>
						<view class="title-decoration"></view>
					</view>
				</view>
				<view class="category-grid">
					<view 
						v-for="(category, index) in categoryList" 
						:key="category.id" 
						class="category-item"
						@click="handleCategoryClick(category)"
					>
						<view class="category-icon">
							<image :src="category.icon" class="icon-image" mode="aspectFit"></image>
						</view>
						<text class="category-name">{{ category.name }}</text>
					</view>
				</view>
			</view>
			
			<!-- 商品列表 -->
			<view class="product-section">
				<view class="section-title">
					<view class="title-left">
						<text class="title-text">积分好物</text>
						<view class="title-decoration"></view>
					</view>
					<view class="title-right" @click="handleViewMore">
						<text class="more-text">查看更多</text>
						<uni-icons type="right" size="24rpx" color="#999"></uni-icons>
					</view>
				</view>
				<page-box-empty v-if="!productList || productList.length == 0" title="暂无商品" subTitle="积分商品正在上架中~"></page-box-empty>
				<view class="product-grid">
					<view 
						v-for="(product, index) in productList" 
						:key="product.id" 
						class="product-item"
						@click="handleProductClick(product)"
					>
						<view class="product-image-container">
							<image :src="product.pic" class="product-image" mode="aspectFill"></image>
							<view v-if="product.subName" class="product-tag">
								<text class="tag-text">{{ product.subName }}</text>
							</view>
						</view>
						<view class="product-info">
							<text class="product-title">{{ product.name }}</text>
							<view class="product-price">
								<view class="price-left">
									<text v-if="product.minPrice" class="score-price">￥{{ product.minPrice }}</text>
									<text v-if="product.minPrice && product.minScore" class="add-plus">+</text>
									<text v-if="product.minScore" class="score-price">{{ product.minScore }}积分</text>
									<text v-if="product.originalPrice && (!product.minPrice || !product.minScore)" class="market-price">¥{{ product.originalPrice }}</text>
								</view>
							</view>
							<view class="product-actions">
								<button 
									class="cart-btn" 
									@click.stop="handleAddToCart(product)"
									:disabled="product.stores <= 0"
								>
									<uni-icons type="cart" size="28rpx" color="#fff"></uni-icons>
									<text class="cart-text">{{ product.stores > 0 ? '加入购物车' : '已售罄' }}</text>
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 漂浮购物车按钮 -->
		<floating-cart></floating-cart>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scoreShop: undefined,
				// 搜索相关
				searchKeyword: '', // 搜索关键词
				
				// 轮播图数据
				bannerList: [],
				
				// 分类数据
				categoryList: [],
				
				// 商品数据
				productList: [],
				
				// 分页相关
				page: 1,
			}
		},
		
		onLoad(options) {
			this.loadBannerList()
			this.loadCategoryList()
		},
		
		onShow() {
		},
		
		// 上拉加载更多
		onReachBottom() {
			this.page++
			this.loadProductList()
		},
		
		methods: {
			
			/**
			 * 加载Banner列表
			 * https://www.yuque.com/apifm/nu0f75/ms21ki
			 */
			async loadBannerList() {
				const res = await this.$wxapi.banners({
					type: 'shop' // 商城banner
				})
				if (res.code == 0) {
					this.bannerList = res.data
				}
			},
			
			/**
			 * 加载商品分类列表
			 * https://www.yuque.com/apifm/nu0f75/racmle
			 */
			async loadCategoryList() {
				const res = await this.$wxapi.goodsCategoryV2()
				if (res.code === 0) {
					this.scoreShop = res.data.find(ele => ele.key == 'scoreShop')
					this.loadProductList()
					if(this.scoreShop) {
						this.categoryList = res.data.filter(ele => ele.pid == this.scoreShop.id)
					}
				}
			},
			
			/**
			 * 加载商品列表
			 * https://www.yuque.com/apifm/nu0f75/wg5t98
			 */
			async loadProductList() {
				if(!this.scoreShop) {
					return
				}
				const params = {
					page: this.page,
					token: this.token,
					k: this.searchKeyword || '',
					categoryId: this.scoreShop.id,
				}
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.goodsv2(params)
				uni.hideLoading()
				if (res.code == 0) {
					if (this.page == 1) {
						this.productList = res.data.result
					} else {
						this.productList = this.productList.concat(res.data.result)
					}
				} else {
					if (this.page == 1) {
						this.productList = null
					}
				}
			},
			
			/**
			 * 搜索输入处理
			 */
			onSearchInput(e) {
				this.searchKeyword = e.detail.value
			},
			
			/**
			 * 执行搜索
			 */
			handleSearch() {
				this.page = 1
				this.loadProductList()
			},
			
			/**
			 * 清空搜索
			 */
			clearSearch() {
				this.searchKeyword = ''
				this.loadProductList()
			},
			
			/**
			 * Banner点击处理
			 */
			handleBannerClick(banner) {
				// todo
			},
			
			/**
			 * 分类点击处理
			 */
			handleCategoryClick(category) {
				uni.navigateTo({
					url: '/pages/shop/goods-list?categoryId='+ category.id +'&categoryName=' + category.name
				})
			},
			
			/**
			 * 商品点击处理
			 */
			handleProductClick(product) {
				uni.navigateTo({
					url: `/pages/shop/detail?id=${product.id}`
				})
			},
			
			/**
			 * 添加到购物车
			 * https://www.yuque.com/apifm/nu0f75/et6m6m
			 */
			async handleAddToCart(product) {
				if (product.stores <= 0) {
					uni.showToast({
						title: '已售罄',
						icon: 'none'
					})
					return
				}
				uni.showLoading({
					title: '添加中...'
				})
				const res = await this.$wxapi.shippingCarInfoAddItemV2({
					token: this.token,
					goodsId: product.id,
					number: 1
				})
				uni.hideLoading()
				if (res.code === 0) {
					uni.showToast({
						title: '添加成功',
						icon: 'success'
					})
					getApp()._shippingCarInfo()
				} else {
					uni.showToast({
						title: res.msg || '添加失败',
						icon: 'none'
					})
				}
			},
			
			/**
			 * 查看更多商品
			 */
			handleViewMore() {
				uni.navigateTo({
					url: '/pages/shop/goods-list'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.shop-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
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
				top: 120rpx;
				left: -80rpx;
			}
			
			&.circle3 {
				width: 120rpx;
				height: 120rpx;
				background: linear-gradient(135deg, #5B9BD5, #7FB8E8);
				top: 280rpx;
				right: 100rpx;
			}
		}
	}
	
	/* 搜索区域 */
	.search-section {
		padding: 32rpx 32rpx 0;
		padding-top: calc(32rpx + env(safe-area-inset-top));
		position: relative;
		z-index: 10;
		
		.search-container {
			display: flex;
			align-items: center;
			gap: 20rpx;
			
			.search-box {
				flex: 1;
				height: 72rpx;
				background: #FFFFFF;
				border-radius: 36rpx;
				display: flex;
				align-items: center;
				padding: 0 24rpx;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
				
				.search-input {
					flex: 1;
					font-size: 28rpx;
					color: #333;
					margin-left: 16rpx;
					
					&.search-placeholder {
						color: #999;
					}
				}
				
				.clear-btn {
					width: 40rpx;
					height: 40rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					background: #F5F5F5;
					
					&:active {
						background: #E0E0E0;
					}
				}
			}
			
			.search-btn {
				height: 72rpx;
				padding: 0 32rpx;
				background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
				border-radius: 36rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(48, 188, 183, 0.3);
				
				&:active {
					transform: scale(0.95);
				}
				
				.search-text {
					font-size: 28rpx;
					color: #FFFFFF;
					font-weight: 500;
				}
			}
		}
	}
	
	/* 主要内容区域 */
	.content-section {
		padding: 32rpx 32rpx 0;
		position: relative;
		z-index: 1;
	}
	
	/* Banner轮播图 */
	.banner-section {
		margin-bottom: 48rpx;
		
		.banner-swiper {
			height: 300rpx;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
			
			.banner-item {
				width: 100%;
				height: 100%;
				
				.banner-image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
	
	/* 商品分类区域 */
	.category-section {
		margin-bottom: 48rpx;
		
		.category-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 32rpx;
			
			.category-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				&:active {
					transform: scale(0.95);
				}
				
				.category-icon {
					width: 110rpx;
					height: 110rpx;
					background: #FFFFFF;
					border-radius: 24rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 16rpx;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
					
					.icon-image {
						width: 100rpx;
						height: 100rpx;
					}
				}
				
				.category-name {
					font-size: 24rpx;
					color: #333;
					text-align: center;
					line-height: 36rpx;
				}
			}
		}
	}
	
	/* 商品列表区域 */
	.product-section {
		margin-bottom: 48rpx;
		
		.product-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;
			
			.product-item {
				background: #FFFFFF;
				border-radius: 20rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				
				&:active {
					transform: translateY(-4rpx);
					box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
				}
				
				.product-image-container {
					position: relative;
					width: 100%;
					height: 240rpx;
					
					.product-image {
						width: 100%;
						height: 100%;
					}
					
					.product-tag {
						position: absolute;
						bottom: 12rpx;
						left: 12rpx;
						background: linear-gradient(135deg, #FF6B6B, #FF8E53);
						border-radius: 12rpx;
						padding: 6rpx 12rpx;
						
						.tag-text {
							font-size: 20rpx;
							color: #FFFFFF;
							font-weight: 500;
						}
					}
				}
				
				.product-info {
					padding: 24rpx;
					
					.product-title {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
						line-height: 40rpx;
						margin-bottom: 16rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						overflow: hidden;
					}
					
					.product-price {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 20rpx;
						
						.price-left {
							flex: 1;
							
							.score-price {
								font-size: 32rpx;
								color: #30BCB7;
								font-weight: 600;
								margin-right: 12rpx;
							}
							.add-plus {
								padding-right: 12rpx;
								color: #999;
								font-size: 24rpx;
							}
							
							.market-price {
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
							}
						}
					}
					
					.product-actions {
						.cart-btn {
							width: 100%;
							height: 64rpx;
							background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
							border-radius: 32rpx;
							border: none;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 8rpx;
							transition: all 0.2s ease;
							
							&:not([disabled]):active {
								transform: scale(0.95);
							}
							
							&[disabled] {
								background: #CCCCCC;
								opacity: 0.6;
							}
							
							.cart-text {
								font-size: 24rpx;
								color: #FFFFFF;
								font-weight: 500;
							}
						}
					}
				}
			}
		}
		
		.load-more {
			padding: 32rpx 0;
			display: flex;
			justify-content: center;
		}
	}
	
	/* 通用区域标题 */
	.section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 32rpx;
		
		.title-left {
			display: flex;
			align-items: center;
			
			.title-text {
				font-size: 36rpx;
				color: #333;
				font-weight: 600;
				margin-right: 16rpx;
			}
			
			.title-decoration {
				width: 6rpx;
				height: 32rpx;
				background: linear-gradient(135deg, #30BCB7, #49CCAD);
				border-radius: 3rpx;
			}
		}
		
		.title-right {
			display: flex;
			align-items: center;
			gap: 8rpx;
			
			&:active {
				opacity: 0.7;
			}
			
			.more-text {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
</style>