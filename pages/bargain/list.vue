<template>
	<view class="bargain-list-page">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-container">
				<view class="search-box">
					<uni-icons type="search" size="32rpx" color="#999"></uni-icons>
					<input 
						v-model="searchKeyword" 
						class="search-input" 
						placeholder="搜索砍价商品"
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
		
		<!-- 筛选栏 -->
		<view class="filter-section">
			<view class="filter-tabs">
				<view 
					v-for="(tab, index) in filterTabs" 
					:key="index"
					:class="['filter-tab', { active: currentTab === index }]"
					@click="handleTabChange(index)"
				>
					<text class="tab-text">{{ tab.name }}</text>
					<uni-icons v-if="tab.hasSort" type="arrowdown" size="20rpx" :color="currentTab === index ? '#FF6B6B' : '#999'"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<view class="product-section">
			<page-box-empty v-if="!productList || productList.length == 0" title="暂无砍价商品" subTitle="砍价商品正在上架中~"></page-box-empty>
			
			<view class="product-list">
				<view 
					v-for="(product, index) in productList" 
					:key="product.id" 
					class="product-item"
					@click="handleProductClick(product)"
				>
					<view class="product-image-container">
						<image :src="product.pic" class="product-image" mode="aspectFill"></image>
						<view class="product-tag">
							<text class="tag-text">砍价</text>
						</view>
						<view class="remaining-count">
							<text class="remaining-text">剩{{ product.stores }}件</text>
						</view>
						<!-- 砍价进度圆环 -->
						<view class="progress-circle">
							<view class="circle-bg">
								<view class="circle-fill" :style="{ transform: `rotate(${product.progressPercent * 3.6}deg)` }"></view>
							</view>
							<text class="progress-text">{{ product.progressPercent }}%</text>
						</view>
					</view>
					
					<view class="product-info">
						<text class="product-title">{{ product.name }}</text>
						<view class="product-subtitle" v-if="product.subName">
							<text class="subtitle-text">{{ product.subName }}</text>
						</view>
						
						<!-- 价格信息 -->
						<view class="price-section">
							<view class="current-price">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ product.minPrice }}</text>
								<text class="price-desc">起</text>
							</view>
							<view class="original-price">
								<text class="original-text">原价¥{{ product.originalPrice }}</text>
							</view>
						</view>
						
						<!-- 砍价信息 -->
						<view class="bargain-info">
							<view class="info-item">
								<text class="info-label">底价</text>
								<text class="info-value">¥{{ product.bottomPrice }}</text>
							</view>
							<view class="info-item">
								<text class="info-label">已砍</text>
								<text class="info-value">{{ product.successCount }}人</text>
							</view>
							<view class="info-item">
								<text class="info-label">最高砍</text>
								<text class="info-value">{{ product.maxCutAmount }}元</text>
							</view>
						</view>
						
						<!-- 助力用户头像 -->
						<view class="helper-section">
							<view class="helper-avatars">
								<image 
									v-for="(helper, hIndex) in product.helpers.slice(0, 4)" 
									:key="hIndex"
									:src="helper.avatar" 
									class="helper-avatar"
									mode="aspectFill"
								></image>
								<view v-if="product.helpers.length > 4" class="more-helpers">
									<text class="more-text">+{{ product.helpers.length - 4 }}</text>
								</view>
							</view>
							<text class="help-desc">{{ product.helpCount }}人助力砍价</text>
						</view>
						
						<!-- 砍价按钮 -->
						<view class="action-section">
							<button class="bargain-btn" @click.stop="handleBargain(product)">
								<uni-icons type="redo" size="32rpx" color="#fff"></uni-icons>
								<text class="btn-text">立即砍价</text>
							</button>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view v-if="hasMore" class="load-more">
				<uni-load-more :status="loadStatus"></uni-load-more>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 搜索相关
				searchKeyword: '',
				
				// 筛选相关
				currentTab: 0,
				filterTabs: [
					{ name: '综合', hasSort: false },
					{ name: '价格', hasSort: true },
					{ name: '砍价人数', hasSort: true },
					{ name: '剩余时间', hasSort: true }
				],
				
				// 商品列表
				productList: [],
				
				// 分页相关
				page: 1,
				hasMore: true,
				loadStatus: 'more', // more, loading, noMore
				
				// 排序相关
				sortField: '',
				sortOrder: 'desc' // asc, desc
			}
		},
		
		onLoad(options) {
			// 接收分类ID等参数
			if (options.categoryId) {
				this.categoryId = options.categoryId
			}
			if (options.categoryName) {
				uni.setNavigationBarTitle({
					title: options.categoryName + '砍价'
				})
			}
			this.loadProductList()
		},
		
		onShow() {
		},
		
		// 上拉加载更多
		onReachBottom() {
			if (this.hasMore && this.loadStatus !== 'loading') {
				this.page++
				this.loadProductList()
			}
		},
		
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1
			this.hasMore = true
			this.loadProductList()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		
		methods: {
			/**
			 * 加载砍价商品列表
			 * https://www.yuque.com/apifm/nu0f75/wg5t98
			 */
			async loadProductList() {
				if (this.loadStatus === 'loading') return
				
				this.loadStatus = 'loading'
				
				const params = {
					page: this.page,
					token: this.token,
					type: 'bargain', // 砍价商品
					k: this.searchKeyword || '',
					categoryId: this.categoryId || '',
					sortField: this.sortField,
					sortOrder: this.sortOrder
				}
				
				if (this.page === 1) {
					uni.showLoading({
						title: '加载中...'
					})
				}
				
				const res = await this.$wxapi.goodsv2(params)
				
				if (this.page === 1) {
					uni.hideLoading()
				}
				
				if (res.code == 0) {
					// 模拟砍价相关数据
					const products = res.data.result.map(item => ({
						...item,
						bottomPrice: (item.minPrice * 0.6).toFixed(2), // 底价为最低价的60%
						successCount: Math.floor(Math.random() * 100) + 10, // 随机成功人数
						progressPercent: Math.floor(Math.random() * 80) + 10, // 随机进度
						helpCount: Math.floor(Math.random() * 50) + 5, // 助力人数
						maxCutAmount: Math.floor(Math.random() * 50) + 10, // 最大砍价金额
						helpers: this.generateHelpers() // 生成助力用户
					}))
					
					if (this.page == 1) {
						this.productList = products
					} else {
						this.productList = this.productList.concat(products)
					}
					
					// 判断是否还有更多数据
					this.hasMore = products.length >= 10
					this.loadStatus = this.hasMore ? 'more' : 'noMore'
				} else {
					if (this.page == 1) {
						this.productList = []
					}
					this.loadStatus = 'noMore'
				}
			},
			
			/**
			 * 生成助力用户数据
			 */
			generateHelpers() {
				const helpers = []
				const count = Math.floor(Math.random() * 10) + 3
				for (let i = 0; i < count; i++) {
					helpers.push({
						avatar: `https://via.placeholder.com/80x80/30BCB7/FFFFFF?text=U${i+1}`,
						nickname: `用户${i+1}`,
						amount: (Math.random() * 10 + 1).toFixed(2)
					})
				}
				return helpers
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
				this.hasMore = true
				this.loadProductList()
			},
			
			/**
			 * 清空搜索
			 */
			clearSearch() {
				this.searchKeyword = ''
				this.page = 1
				this.hasMore = true
				this.loadProductList()
			},
			
			/**
			 * 筛选标签切换
			 */
			handleTabChange(index) {
				if (this.currentTab === index) {
					// 如果是排序标签，切换排序方向
					if (this.filterTabs[index].hasSort) {
						this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
					}
				} else {
					this.currentTab = index
					// 设置排序字段
					switch (index) {
						case 0: // 综合
							this.sortField = ''
							break
						case 1: // 价格
							this.sortField = 'price'
							break
						case 2: // 砍价人数
							this.sortField = 'bargain_count'
							break
						case 3: // 剩余时间
							this.sortField = 'remaining_time'
							break
					}
					this.sortOrder = 'desc'
				}
				
				this.page = 1
				this.hasMore = true
				this.loadProductList()
			},
			
			/**
			 * 商品点击处理
			 */
			handleProductClick(product) {
				uni.navigateTo({
					url: `/pages/bargain/detail?id=${product.id}`
				})
			},
			
			/**
			 * 砍价按钮点击
			 */
			handleBargain(product) {
				uni.navigateTo({
					url: `/pages/bargain/detail?id=${product.id}&action=bargain`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bargain-list-page {
		min-height: 100vh;
		background: #F8F9FA;
	}
	
	/* 搜索区域 */
	.search-section {
		background: #FFFFFF;
		padding: 32rpx;
		border-bottom: 2rpx solid #F0F0F0;
		
		.search-container {
			display: flex;
			align-items: center;
			gap: 20rpx;
			
			.search-box {
				flex: 1;
				height: 72rpx;
				background: #F8F9FA;
				border-radius: 36rpx;
				display: flex;
				align-items: center;
				padding: 0 24rpx;
				
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
					background: #E0E0E0;
					
					&:active {
						background: #CCCCCC;
					}
				}
			}
			
			.search-btn {
				height: 72rpx;
				padding: 0 32rpx;
				background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
				border-radius: 36rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
				
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
	
	/* 筛选区域 */
	.filter-section {
		background: #FFFFFF;
		padding: 0 32rpx;
		border-bottom: 2rpx solid #F0F0F0;
		
		.filter-tabs {
			display: flex;
			align-items: center;
			
			.filter-tab {
				flex: 1;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				position: relative;
				
				&:active {
					background: #F8F9FA;
				}
				
				&.active {
					.tab-text {
						color: #FF6B6B;
						font-weight: 600;
					}
				}
				
				&.active::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: linear-gradient(135deg, #FF6B6B, #FF8E53);
					border-radius: 2rpx;
				}
				
				.tab-text {
					font-size: 28rpx;
					color: #333;
					transition: all 0.2s ease;
				}
			}
		}
	}
	
	/* 商品列表区域 */
	.product-section {
		padding: 32rpx;
		
		.product-list {
			.product-item {
				background: #FFFFFF;
				border-radius: 24rpx;
				margin-bottom: 32rpx;
				overflow: hidden;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				
				&:active {
					transform: translateY(-4rpx);
					box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
				}
				
				.product-image-container {
					position: relative;
					width: 100%;
					height: 400rpx;
					
					.product-image {
						width: 100%;
						height: 100%;
					}
					
					.product-tag {
						position: absolute;
						top: 20rpx;
						left: 20rpx;
						background: linear-gradient(135deg, #FF6B6B, #FF8E53);
						border-radius: 20rpx;
						padding: 8rpx 16rpx;
						
						.tag-text {
							font-size: 22rpx;
							color: #FFFFFF;
							font-weight: 600;
						}
					}
					
					.remaining-count {
						position: absolute;
						top: 20rpx;
						right: 20rpx;
						background: rgba(0, 0, 0, 0.6);
						border-radius: 16rpx;
						padding: 6rpx 12rpx;
						
						.remaining-text {
							font-size: 20rpx;
							color: #FFFFFF;
						}
					}
					
					.progress-circle {
						position: absolute;
						bottom: 20rpx;
						right: 20rpx;
						width: 80rpx;
						height: 80rpx;
						
						.circle-bg {
							width: 100%;
							height: 100%;
							border-radius: 50%;
							background: conic-gradient(#FF6B6B 0deg, #FF8E53 180deg, #E0E0E0 180deg);
							position: relative;
							
							&::before {
								content: '';
								position: absolute;
								top: 8rpx;
								left: 8rpx;
								width: 64rpx;
								height: 64rpx;
								border-radius: 50%;
								background: #FFFFFF;
							}
						}
						
						.progress-text {
							position: absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							font-size: 18rpx;
							color: #FF6B6B;
							font-weight: 600;
						}
					}
				}
				
				.product-info {
					padding: 32rpx;
					
					.product-title {
						font-size: 32rpx;
						color: #333;
						font-weight: 600;
						line-height: 44rpx;
						margin-bottom: 8rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						overflow: hidden;
					}
					
					.product-subtitle {
						margin-bottom: 24rpx;
						
						.subtitle-text {
							font-size: 24rpx;
							color: #999;
							line-height: 36rpx;
						}
					}
					
					.price-section {
						display: flex;
						align-items: baseline;
						justify-content: space-between;
						margin-bottom: 24rpx;
						
						.current-price {
							display: flex;
							align-items: baseline;
							
							.price-symbol {
								font-size: 28rpx;
								color: #FF6B6B;
								font-weight: 600;
							}
							
							.price-value {
								font-size: 56rpx;
								color: #FF6B6B;
								font-weight: 700;
								margin: 0 4rpx;
							}
							
							.price-desc {
								font-size: 24rpx;
								color: #FF6B6B;
							}
						}
						
						.original-price {
							.original-text {
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
							}
						}
					}
					
					.bargain-info {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 24rpx;
						padding: 20rpx;
						background: #F8F9FA;
						border-radius: 16rpx;
						
						.info-item {
							text-align: center;
							
							.info-label {
								font-size: 22rpx;
								color: #999;
								display: block;
								margin-bottom: 8rpx;
							}
							
							.info-value {
								font-size: 28rpx;
								color: #333;
								font-weight: 600;
							}
						}
					}
					
					.helper-section {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 24rpx;
						
						.helper-avatars {
							display: flex;
							align-items: center;
							
							.helper-avatar {
								width: 48rpx;
								height: 48rpx;
								border-radius: 50%;
								border: 4rpx solid #FFFFFF;
								margin-left: -12rpx;
								
								&:first-child {
									margin-left: 0;
								}
							}
							
							.more-helpers {
								width: 48rpx;
								height: 48rpx;
								border-radius: 50%;
								background: #F0F0F0;
								border: 4rpx solid #FFFFFF;
								margin-left: -12rpx;
								display: flex;
								align-items: center;
								justify-content: center;
								
								.more-text {
									font-size: 18rpx;
									color: #666;
								}
							}
						}
						
						.help-desc {
							font-size: 24rpx;
							color: #666;
						}
					}
					
					.action-section {
						.bargain-btn {
							width: 100%;
							height: 88rpx;
							background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
							border-radius: 44rpx;
							border: none;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 12rpx;
							box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
							transition: all 0.2s ease;
							
							&:active {
								transform: scale(0.95);
							}
							
							.btn-text {
								font-size: 28rpx;
								color: #FFFFFF;
								font-weight: 600;
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
</style>
