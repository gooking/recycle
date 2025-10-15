<template>
	<view class="bargain-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
			<view class="decoration-circle circle3"></view>
		</view>
		
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<!-- #ifdef MP-WEIXIN -->
			<view style="height: 64rpx;"></view>
			<!-- #endif -->
			<view class="navbar-content">
				<text class="navbar-title">砍价专区</text>
				<view class="navbar-subtitle">
					<text class="subtitle-text">邀请好友，一起砍价</text>
				</view>
			</view>
		</view>
		
		<!-- Banner轮播图 -->
		<view class="banner-section">
			<swiper 
				class="banner-swiper" 
				indicator-dots
				autoplay
				circular
				indicator-color="rgba(255,255,255,0.5)"
				indicator-active-color="#FF6B6B"
			>
				<swiper-item v-for="(banner, index) in bannerList" :key="index" @click="handleBannerClick(banner)">
					<view class="banner-item">
						<image :src="banner.picUrl" class="banner-image" mode="aspectFill"></image>
						<view class="banner-overlay">
							<text class="banner-title">{{ banner.title }}</text>
							<text class="banner-desc">{{ banner.desc }}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 砍价统计区域 -->
		<view class="stats-section">
			<view class="stats-container">
				<view class="stat-item">
					<text class="stat-number">{{ formatNumber(sysconfigMap.bargain_data.totalBargains) }}</text>
					<text class="stat-label">累计砍价</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-number">{{ formatNumber(sysconfigMap.bargain_data.successCount) }}</text>
					<text class="stat-label">砍价成功</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-number">{{ formatNumber(sysconfigMap.bargain_data.totalSaved) }}</text>
					<text class="stat-label">累计省钱</text>
				</view>
			</view>
		</view>
		
		<!-- 砍价商品列表 -->
		<view class="product-section">
			<view class="section-title">
				<view class="title-left">
					<text class="title-text">砍价好物</text>
					<view class="title-decoration"></view>
				</view>
				<!-- <view class="title-right" @click="handleViewMore">
					<text class="more-text">查看更多</text>
					<uni-icons type="right" size="24rpx" color="#999"></uni-icons>
				</view> -->
			</view>
			
			<page-box-empty v-if="!productList || productList.length == 0" title="暂无砍价商品" subTitle="砍价商品正在上架中~" style="padding-bottom: 64rpx;"></page-box-empty>
			
			<view class="product-list">
				<view 
					v-for="(product, index) in productList" 
					:key="product.id" 
					class="product-item"
					@click="handleProductClick(product)"
				>
					<view class="product-image-container">
						<image :src="product.pic" class="product-image" mode="widthFix"></image>
						<view class="product-tag">
							<text class="tag-text">砍价</text>
						</view>
						<view class="remaining-count">
							<text class="remaining-text">剩余{{ product.kanjiaSet.number }}</text>
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
								<text class="price-desc">原价</text>
							</view>
							<view class="original-price">
								<text class="original-text">市场价¥{{ product.kanjiaSet.originalPrice }}</text>
							</view>
						</view>
						
						<!-- 砍价进度 -->
						<view class="bargain-progress">
							<view class="progress-info">
								<text class="progress-text">底价¥{{ product.kanjiaPrice }}</text>
								<text class="success-text">{{ product.kanjiaSet.numberBuy }}人砍价成功</text>
							</view>
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: product.progressPercent + '%' }"></view>
							</view>
						</view>
						
						<!-- 助力信息 -->
						<view class="help-section">
							<!-- <view class="helper-avatars">
								<image 
									v-for="(helper, hIndex) in product.helpers.slice(0, 3)" 
									:key="hIndex"
									:src="helper.avatar" 
									class="helper-avatar"
									mode="aspectFill"
								></image>
								<view v-if="product.helpers.length > 3" class="more-helpers">
									<text class="more-text">+{{ product.helpers.length - 3 }}</text>
								</view>
							</view> -->
							<text class="help-count">截止时间: {{ product.kanjiaSet.dateEnd }}</text>
						</view>
						
						<!-- 砍价按钮 -->
						<view class="action-section">
							<button class="bargain-btn" @click.stop="handleBargain(product)">
								<text class="btn-text">立即砍价</text>
								<text class="btn-desc">最高砍{{ product.kanjiaSet.helpPriceMax }}元</text>
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 我的砍价 -->
		<!-- <view class="my-bargain-section">
			<view class="section-title">
				<view class="title-left">
					<text class="title-text">我的砍价</text>
					<view class="title-decoration"></view>
				</view>
				<view class="title-right" @click="handleMyBargains">
					<text class="more-text">查看全部</text>
					<uni-icons type="right" size="24rpx" color="#999"></uni-icons>
				</view>
			</view>
			
			<view v-if="myBargainList && myBargainList.length > 0" class="my-bargain-list">
				<view 
					v-for="(item, index) in myBargainList" 
					:key="item.id" 
					class="my-bargain-item"
					@click="handleMyBargainClick(item)"
				>
					<image :src="item.pic" class="item-image" mode="aspectFill"></image>
					<view class="item-info">
						<text class="item-title">{{ item.name }}</text>
						<view class="item-progress">
							<text class="progress-desc">已砍¥{{ item.cutAmount }}，还差¥{{ item.remainAmount }}</text>
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: item.progressPercent + '%' }"></view>
							</view>
						</view>
						<view class="item-status">
							<text :class="['status-text', item.status]">{{ getStatusText(item.status) }}</text>
							<text class="time-text">{{ formatTime(item.updateTime) }}</text>
						</view>
					</view>
					<view class="item-action">
						<button class="invite-btn" @click.stop="handleInvite(item)">
							<text class="invite-text">邀请助力</text>
						</button>
					</view>
				</view>
			</view>
			
			<view v-else class="empty-my-bargain">
				<image src="/static/images/empty.png" class="empty-image" mode="aspectFit"></image>
				<text class="empty-text">还没有砍价记录哦</text>
				<text class="empty-desc">快去挑选心仪的商品开始砍价吧</text>
			</view>
		</view> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// Banner数据
				bannerList: [],
				
				// 砍价商品列表
				productList: [],
				
				// 我的砍价列表
				myBargainList: [],
				
				// 分页相关
				page: 1,
			}
		},
		
		onLoad() {
			this.loadBannerList()
			this.loadProductList()
			this.loadMyBargainList()
			this.loadStats()
		},
		
		onShow() {
			// 刷新我的砍价列表
			this.loadMyBargainList()
		},
		
		// 上拉加载更多
		onReachBottom() {
			this.page++
			this.loadProductList()
		},
		
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1
			this.loadProductList()
			this.loadMyBargainList()
			this.loadStats()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		onShareAppMessage() {
		    return {
		      title: '砍价专区 - 积分商城 - ' + this.sysconfigMap.mallName,
		      path: '/pages/bargain/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		onShareTimeline() {
		    return {
		      title: '砍价专区 - 积分商城 - ' + this.sysconfigMap.mallName,
		      query: 'inviter_id=' + (this.uid || ''),
		      imageUrl: this.sysconfigMap.share_pic
		    }
		},
		methods: {
			/**
			 * 加载Banner列表
			 * https://www.yuque.com/apifm/nu0f75/ms21ki
			 */
			async loadBannerList() {
				const res = await this.$wxapi.banners({
					type: 'bargain'
				})
				if (res.code == 0) {
					this.bannerList = res.data
				}
			},
			
			/**
			 * 加载砍价商品列表
			 * https://www.yuque.com/apifm/nu0f75/wg5t98
			 */
			async loadProductList() {
				const params = {
					page: this.page,
					token: this.token,
					kanjia: 1, // 砍价商品
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
					const goodsId = []
					res.data.result.forEach(ele => {
						goodsId.push(ele.id)
					})
					// 读取商品的砍价设置 https://www.yuque.com/apifm/nu0f75/xs42ih
					const res2 = await this.$wxapi.kanjiaSet(goodsId.join())
					if(res2.code == 0) {
						res.data.result.forEach(ele => {
							ele.kanjiaSet = res2.data.find(a => a.goodsId == ele.id)
						})
					}
					if (this.page == 1) {
						this.productList = res.data.result
					} else {
						this.productList = this.productList.concat(res.data.result)
					}
				} else {
					if (this.page == 1) {
						this.productList = []
					}
				}
			},
			
			/**
			 * 加载我的砍价列表
			 * https://www.yuque.com/apifm/nu0f75/xxxx (需要根据实际API调整)
			 */
			async loadMyBargainList() {
				// 模拟我的砍价数据
				this.myBargainList = [
					{
						id: 1,
						pic: 'https://via.placeholder.com/200x200/30BCB7/FFFFFF?text=商品1',
						name: '精选好物砍价商品',
						cutAmount: 25.8,
						remainAmount: 12.2,
						progressPercent: 68,
						status: 'ongoing', // ongoing, success, expired
						updateTime: new Date().getTime() - 3600000
					}
				]
			},
			
			/**
			 * 加载统计数据
			 */
			async loadStats() {
				// 这里可以调用实际的统计API
				// const res = await this.$wxapi.bargainStats()
			},
			
			/**
			 * 生成助力用户数据
			 */
			generateHelpers() {
				const helpers = []
				const count = Math.floor(Math.random() * 8) + 2
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
			 * 格式化数字显示
			 */
			formatNumber(num) {
				if (num >= 10000) {
					return (num / 10000).toFixed(1) + 'w'
				}
				return num.toString()
			},
			
			/**
			 * 格式化时间显示
			 */
			formatTime(timestamp) {
				const now = new Date().getTime()
				const diff = now - timestamp
				const hours = Math.floor(diff / (1000 * 60 * 60))
				if (hours < 1) {
					return '刚刚'
				} else if (hours < 24) {
					return hours + '小时前'
				} else {
					return Math.floor(hours / 24) + '天前'
				}
			},
			
			/**
			 * 获取状态文本
			 */
			getStatusText(status) {
				const statusMap = {
					ongoing: '砍价中',
					success: '砍价成功',
					expired: '已过期'
				}
				return statusMap[status] || '未知'
			},
			
			/**
			 * Banner点击处理
			 */
			handleBannerClick(banner) {
				// 处理banner点击事件
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
			 * 砍价按钮点击
			 */
			handleBargain(product) {
				uni.navigateTo({
					url: `/pages/shop/detail?id=${product.id}`
				})
			},
			
			/**
			 * 查看更多商品
			 */
			handleViewMore() {
				uni.navigateTo({
					url: '/pages/bargain/list'
				})
			},
			
			/**
			 * 我的砍价点击
			 */
			handleMyBargainClick(item) {
				uni.navigateTo({
					url: `/pages/bargain/detail?id=${item.id}&bargainId=${item.bargainId}`
				})
			},
			
			/**
			 * 查看我的全部砍价
			 */
			handleMyBargains() {
				uni.navigateTo({
					url: '/pages/bargain/my-list'
				})
			},
			
			/**
			 * 邀请助力
			 */
			handleInvite(item) {
				// 分享邀请逻辑
				uni.share({
					provider: "weixin",
					scene: "WXSceneSession",
					type: 0,
					href: `pages/bargain/detail?id=${item.id}&bargainId=${item.bargainId}&invite=1`,
					title: `帮我砍一刀，${item.name}`,
					summary: `还差${item.remainAmount}元就能砍价成功啦！`,
					imageUrl: item.pic,
					success: function (res) {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bargain-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #FF6B6B 0%, #F8F9FA 30%);
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
			opacity: 0.15;
			
			&.circle1 {
				width: 200rpx;
				height: 200rpx;
				background: linear-gradient(135deg, #FFB6C1, #FFA07A);
				top: -100rpx;
				right: -100rpx;
			}
			
			&.circle2 {
				width: 160rpx;
				height: 160rpx;
				background: linear-gradient(135deg, #FF8A80, #FFAB91);
				top: 120rpx;
				left: -80rpx;
			}
			
			&.circle3 {
				width: 120rpx;
				height: 120rpx;
				background: linear-gradient(135deg, #FFCC80, #FFD54F);
				top: 280rpx;
				right: 100rpx;
			}
		}
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		padding: calc(32rpx + env(safe-area-inset-top)) 32rpx 32rpx;
		position: relative;
		z-index: 10;
		
		.navbar-content {
			text-align: center;
			
			.navbar-title {
				font-size: 44rpx;
				color: #FFFFFF;
				font-weight: 700;
				display: block;
				margin-bottom: 8rpx;
			}
			
			.navbar-subtitle {
				.subtitle-text {
					font-size: 26rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}
		}
	}
	
	/* Banner轮播图 */
	.banner-section {
		padding: 0 32rpx 32rpx;
		position: relative;
		z-index: 1;
		
		.banner-swiper {
			height: 300rpx;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
			
			.banner-item {
				position: relative;
				width: 100%;
				height: 100%;
				
				.banner-image {
					width: 100%;
					height: 100%;
				}
				
				.banner-overlay {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
					padding: 40rpx 32rpx 32rpx;
					
					.banner-title {
						font-size: 36rpx;
						color: #FFFFFF;
						font-weight: 600;
						display: block;
						margin-bottom: 8rpx;
					}
					
					.banner-desc {
						font-size: 24rpx;
						color: rgba(255, 255, 255, 0.9);
					}
				}
			}
		}
	}
	
	/* 统计区域 */
	.stats-section {
		padding: 0 32rpx 32rpx;
		position: relative;
		z-index: 1;
		
		.stats-container {
			background: #FFFFFF;
			border-radius: 24rpx;
			padding: 40rpx 32rpx;
			display: flex;
			align-items: center;
			justify-content: space-around;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
			
			.stat-item {
				text-align: center;
				
				.stat-number {
					font-size: 48rpx;
					color: #FF6B6B;
					font-weight: 700;
					display: block;
					margin-bottom: 8rpx;
				}
				
				.stat-label {
					font-size: 24rpx;
					color: #666;
				}
			}
			
			.stat-divider {
				width: 2rpx;
				height: 60rpx;
				background: #F0F0F0;
			}
		}
	}
	
	/* 商品列表区域 */
	.product-section {
		padding: 32rpx 32rpx 0;
		background: #FFFFFF;
		border-radius: 32rpx 32rpx 0 0;
		position: relative;
		z-index: 1;
		
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
					
					.product-image {
						width: 100%;
						height: 0;
					}
					
					.product-tag {
						position: absolute;
						top: 20rpx;
						left: 20rpx;
						background: linear-gradient(135deg, #FF6B6B, #FF8E53);
						border-radius: 20rpx;
						padding: 12rpx 24rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
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
						padding: 12rpx 24rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						.remaining-text {
							font-size: 20rpx;
							color: #FFFFFF;
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
					
					.bargain-progress {
						margin-bottom: 24rpx;
						
						.progress-info {
							display: flex;
							justify-content: space-between;
							margin-bottom: 12rpx;
							
							.progress-text {
								font-size: 24rpx;
								color: #666;
							}
							
							.success-text {
								font-size: 24rpx;
								color: #FF6B6B;
								font-weight: 500;
							}
						}
						
						.progress-bar {
							height: 8rpx;
							background: #F0F0F0;
							border-radius: 4rpx;
							overflow: hidden;
							
							.progress-fill {
								height: 100%;
								background: linear-gradient(90deg, #FF6B6B, #FF8E53);
								border-radius: 4rpx;
								transition: width 0.3s ease;
							}
						}
					}
					
					.help-section {
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
						
						.help-count {
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
							flex-direction: column;
							align-items: center;
							justify-content: center;
							box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
							transition: all 0.2s ease;
							
							&:active {
								transform: scale(0.95);
							}
							
							.btn-text {
								font-size: 28rpx;
								color: #FFFFFF;
								font-weight: 600;
								line-height: 36rpx;
							}
							
							.btn-desc {
								font-size: 20rpx;
								color: rgba(255, 255, 255, 0.9);
								line-height: 28rpx;
							}
						}
					}
				}
			}
		}
	}
	
	/* 我的砍价区域 */
	.my-bargain-section {
		padding: 32rpx;
		background: #FFFFFF;
		
		.my-bargain-list {
			.my-bargain-item {
				display: flex;
				align-items: center;
				background: #F8F9FA;
				border-radius: 20rpx;
				padding: 24rpx;
				margin-bottom: 20rpx;
				
				&:active {
					background: #F0F0F0;
				}
				
				.item-image {
					width: 120rpx;
					height: 120rpx;
					border-radius: 16rpx;
					margin-right: 24rpx;
				}
				
				.item-info {
					flex: 1;
					
					.item-title {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
						line-height: 40rpx;
						margin-bottom: 12rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1;
						line-clamp: 1;
						overflow: hidden;
					}
					
					.item-progress {
						margin-bottom: 12rpx;
						
						.progress-desc {
							font-size: 24rpx;
							color: #666;
							margin-bottom: 8rpx;
							display: block;
						}
						
						.progress-bar {
							height: 6rpx;
							background: #E0E0E0;
							border-radius: 3rpx;
							overflow: hidden;
							
							.progress-fill {
								height: 100%;
								background: linear-gradient(90deg, #FF6B6B, #FF8E53);
								border-radius: 3rpx;
								transition: width 0.3s ease;
							}
						}
					}
					
					.item-status {
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.status-text {
							font-size: 22rpx;
							padding: 4rpx 12rpx;
							border-radius: 12rpx;
							
							&.ongoing {
								background: #FFF3E0;
								color: #FF8F00;
							}
							
							&.success {
								background: #E8F5E8;
								color: #4CAF50;
							}
							
							&.expired {
								background: #FFEBEE;
								color: #F44336;
							}
						}
						
						.time-text {
							font-size: 20rpx;
							color: #999;
						}
					}
				}
				
				.item-action {
					.invite-btn {
						width: 120rpx;
						height: 60rpx;
						background: linear-gradient(135deg, #FF6B6B, #FF8E53);
						border-radius: 30rpx;
						border: none;
						display: flex;
						align-items: center;
						justify-content: center;
						
						&:active {
							transform: scale(0.95);
						}
						
						.invite-text {
							font-size: 24rpx;
							color: #FFFFFF;
							font-weight: 500;
						}
					}
				}
			}
		}
		
		.empty-my-bargain {
			text-align: center;
			padding: 80rpx 32rpx;
			
			.empty-image {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 32rpx;
			}
			
			.empty-text {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 12rpx;
				display: block;
			}
			
			.empty-desc {
				font-size: 24rpx;
				color: #999;
			}
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
				background: linear-gradient(135deg, #FF6B6B, #FF8E53);
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