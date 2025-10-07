<template>
	<view class="my-bargain-page">
		<!-- 筛选标签 -->
		<view class="filter-section">
			<view class="filter-tabs">
				<view 
					v-for="(tab, index) in filterTabs" 
					:key="index"
					:class="['filter-tab', { active: currentTab === index }]"
					@click="handleTabChange(index)"
				>
					<text class="tab-text">{{ tab.name }}</text>
					<text v-if="tab.count > 0" class="tab-count">{{ tab.count }}</text>
				</view>
			</view>
		</view>
		
		<!-- 砍价列表 -->
		<view class="bargain-section">
			<page-box-empty v-if="!bargainList || bargainList.length == 0" title="暂无砍价记录" subTitle="快去挑选心仪的商品开始砍价吧"></page-box-empty>
			
			<view class="bargain-list">
				<view 
					v-for="(item, index) in bargainList" 
					:key="item.id" 
					class="bargain-item"
					@click="handleItemClick(item)"
				>
					<image :src="item.pic" class="item-image" mode="aspectFill"></image>
					
					<view class="item-content">
						<view class="item-header">
							<text class="item-title">{{ item.name }}</text>
							<view :class="['item-status', item.status]">
								<text class="status-text">{{ getStatusText(item.status) }}</text>
							</view>
						</view>
						
						<view class="item-price">
							<text class="current-price">¥{{ item.currentPrice }}</text>
							<text class="original-price">原价¥{{ item.originalPrice }}</text>
						</view>
						
						<view class="item-progress">
							<view class="progress-info">
								<text class="progress-desc">已砍¥{{ item.cutAmount }}，还差¥{{ item.remainAmount }}</text>
								<text class="progress-percent">{{ item.progressPercent }}%</text>
							</view>
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: item.progressPercent + '%' }"></view>
							</view>
						</view>
						
						<view class="item-footer">
							<view class="helper-info">
								<view class="helper-avatars">
									<image 
										v-for="(helper, hIndex) in item.helpers.slice(0, 3)" 
										:key="hIndex"
										:src="helper.avatar" 
										class="helper-avatar"
										mode="aspectFill"
									></image>
									<view v-if="item.helpers.length > 3" class="more-helpers">
										<text class="more-text">+{{ item.helpers.length - 3 }}</text>
									</view>
								</view>
								<text class="helper-count">{{ item.helpCount }}人助力</text>
							</view>
							
							<view class="item-actions">
								<button 
									v-if="item.status === 'ongoing'" 
									class="invite-btn" 
									@click.stop="handleInvite(item)"
								>
									<text class="btn-text">邀请助力</text>
								</button>
								
								<button 
									v-else-if="item.status === 'success'" 
									class="buy-btn" 
									@click.stop="handleBuy(item)"
								>
									<text class="btn-text">立即购买</text>
								</button>
								
								<button 
									v-else 
									class="restart-btn" 
									@click.stop="handleRestart(item)"
								>
									<text class="btn-text">重新砍价</text>
								</button>
							</view>
						</view>
						
						<view class="item-time">
							<text class="time-text">{{ formatTime(item.updateTime) }}</text>
							<text v-if="item.status === 'ongoing' && item.remainingTime > 0" class="remaining-time">
								剩余{{ formatRemainingTime(item.remainingTime) }}
							</text>
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
				// 筛选相关
				currentTab: 0,
				filterTabs: [
					{ name: '全部', status: '', count: 0 },
					{ name: '砍价中', status: 'ongoing', count: 0 },
					{ name: '砍价成功', status: 'success', count: 0 },
					{ name: '已过期', status: 'expired', count: 0 }
				],
				
				// 砍价列表
				bargainList: [],
				
				// 分页相关
				page: 1,
				hasMore: true,
				loadStatus: 'more', // more, loading, noMore
			}
		},
		
		onLoad() {
			this.loadBargainList()
			this.loadTabCounts()
		},
		
		onShow() {
			// 刷新列表
			this.page = 1
			this.loadBargainList()
		},
		
		// 上拉加载更多
		onReachBottom() {
			if (this.hasMore && this.loadStatus !== 'loading') {
				this.page++
				this.loadBargainList()
			}
		},
		
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1
			this.hasMore = true
			this.loadBargainList()
			this.loadTabCounts()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		
		methods: {
			/**
			 * 加载我的砍价列表
			 * https://www.yuque.com/apifm/nu0f75/xxxx (需要根据实际API调整)
			 */
			async loadBargainList() {
				if (this.loadStatus === 'loading') return
				
				this.loadStatus = 'loading'
				
				const params = {
					page: this.page,
					token: this.token,
					status: this.filterTabs[this.currentTab].status
				}
				
				if (this.page === 1) {
					uni.showLoading({
						title: '加载中...'
					})
				}
				
				// 模拟API调用
				setTimeout(() => {
					if (this.page === 1) {
						uni.hideLoading()
					}
					
					// 模拟数据
					const mockData = this.generateMockData()
					
					if (this.page == 1) {
						this.bargainList = mockData
					} else {
						this.bargainList = this.bargainList.concat(mockData)
					}
					
					// 判断是否还有更多数据
					this.hasMore = mockData.length >= 10
					this.loadStatus = this.hasMore ? 'more' : 'noMore'
				}, 1000)
			},
			
			/**
			 * 加载标签统计数据
			 */
			async loadTabCounts() {
				// 模拟统计数据
				this.filterTabs[0].count = 15 // 全部
				this.filterTabs[1].count = 8  // 砍价中
				this.filterTabs[2].count = 5  // 砍价成功
				this.filterTabs[3].count = 2  // 已过期
			},
			
			/**
			 * 生成模拟数据
			 */
			generateMockData() {
				const statuses = ['ongoing', 'success', 'expired']
				const currentStatus = this.filterTabs[this.currentTab].status
				const data = []
				
				for (let i = 0; i < 5; i++) {
					const status = currentStatus || statuses[Math.floor(Math.random() * statuses.length)]
					const originalPrice = Math.floor(Math.random() * 200) + 100
					const cutAmount = Math.floor(Math.random() * 50) + 10
					const currentPrice = originalPrice - cutAmount
					const bottomPrice = Math.floor(originalPrice * 0.6)
					const remainAmount = Math.max(0, currentPrice - bottomPrice)
					const progressPercent = Math.floor((cutAmount / (originalPrice - bottomPrice)) * 100)
					
					data.push({
						id: Date.now() + i,
						bargainId: 'bargain_' + (Date.now() + i),
						pic: `https://via.placeholder.com/200x200/30BCB7/FFFFFF?text=商品${i+1}`,
						name: `精选好物砍价商品${i+1}`,
						originalPrice: originalPrice,
						currentPrice: currentPrice,
						bottomPrice: bottomPrice,
						cutAmount: cutAmount,
						remainAmount: remainAmount,
						progressPercent: Math.min(100, progressPercent),
						status: status,
						helpCount: Math.floor(Math.random() * 20) + 5,
						helpers: this.generateHelpers(),
						updateTime: new Date().getTime() - Math.floor(Math.random() * 86400000),
						remainingTime: status === 'ongoing' ? Math.floor(Math.random() * 86400000) : 0
					})
				}
				
				return data
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
			 * 格式化剩余时间
			 */
			formatRemainingTime(milliseconds) {
				const hours = Math.floor(milliseconds / (1000 * 60 * 60))
				const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
				
				if (hours > 0) {
					return `${hours}小时${minutes}分钟`
				} else {
					return `${minutes}分钟`
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
			 * 筛选标签切换
			 */
			handleTabChange(index) {
				if (this.currentTab === index) return
				
				this.currentTab = index
				this.page = 1
				this.hasMore = true
				this.loadBargainList()
			},
			
			/**
			 * 砍价项点击
			 */
			handleItemClick(item) {
				uni.navigateTo({
					url: `/pages/bargain/detail?id=${item.id}&bargainId=${item.bargainId}`
				})
			},
			
			/**
			 * 邀请助力
			 */
			handleInvite(item) {
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
			},
			
			/**
			 * 立即购买
			 */
			handleBuy(item) {
				uni.setStorageSync('bugGoodsInfo', {
					goodsId: item.id,
					number: 1,
					pic: item.pic,
					name: item.name,
					price: item.bottomPrice,
					bargainId: item.bargainId
				})
				
				uni.navigateTo({
					url: '/pages/shop/checkout?mod=buy'
				})
			},
			
			/**
			 * 重新砍价
			 */
			handleRestart(item) {
				uni.navigateTo({
					url: `/pages/bargain/detail?id=${item.id}&action=bargain`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.my-bargain-page {
		min-height: 100vh;
		background: #F8F9FA;
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
					
					.tab-count {
						background: #FF6B6B;
						color: #FFFFFF;
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
				
				.tab-count {
					min-width: 32rpx;
					height: 32rpx;
					background: #E0E0E0;
					color: #666;
					font-size: 20rpx;
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 8rpx;
					transition: all 0.2s ease;
				}
			}
		}
	}
	
	/* 砍价列表区域 */
	.bargain-section {
		padding: 32rpx;
		
		.bargain-list {
			.bargain-item {
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
				
				.item-image {
					width: 100%;
					height: 300rpx;
				}
				
				.item-content {
					padding: 32rpx;
					
					.item-header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 16rpx;
						
						.item-title {
							flex: 1;
							font-size: 32rpx;
							color: #333;
							font-weight: 600;
							line-height: 44rpx;
							margin-right: 16rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							line-clamp: 2;
							overflow: hidden;
						}
						
						.item-status {
							padding: 8rpx 16rpx;
							border-radius: 16rpx;
							font-size: 22rpx;
							font-weight: 500;
							
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
					}
					
					.item-price {
						display: flex;
						align-items: baseline;
						gap: 16rpx;
						margin-bottom: 24rpx;
						
						.current-price {
							font-size: 48rpx;
							color: #FF6B6B;
							font-weight: 700;
						}
						
						.original-price {
							font-size: 24rpx;
							color: #999;
							text-decoration: line-through;
						}
					}
					
					.item-progress {
						margin-bottom: 24rpx;
						
						.progress-info {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-bottom: 12rpx;
							
							.progress-desc {
								font-size: 24rpx;
								color: #666;
							}
							
							.progress-percent {
								font-size: 24rpx;
								color: #FF6B6B;
								font-weight: 600;
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
					
					.item-footer {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 16rpx;
						
						.helper-info {
							display: flex;
							align-items: center;
							gap: 16rpx;
							
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
							
							.helper-count {
								font-size: 24rpx;
								color: #666;
							}
						}
						
						.item-actions {
							.invite-btn,
							.buy-btn,
							.restart-btn {
								height: 60rpx;
								padding: 0 24rpx;
								border-radius: 30rpx;
								border: none;
								font-size: 24rpx;
								font-weight: 500;
								transition: all 0.2s ease;
								
								&:active {
									transform: scale(0.95);
								}
								
								.btn-text {
									color: inherit;
								}
							}
							
							.invite-btn {
								background: linear-gradient(135deg, #FF6B6B, #FF8E53);
								color: #FFFFFF;
							}
							
							.buy-btn {
								background: linear-gradient(135deg, #4CAF50, #66BB6A);
								color: #FFFFFF;
							}
							
							.restart-btn {
								background: #F8F9FA;
								color: #666;
								border: 2rpx solid #E0E0E0;
							}
						}
					}
					
					.item-time {
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.time-text {
							font-size: 22rpx;
							color: #999;
						}
						
						.remaining-time {
							font-size: 22rpx;
							color: #FF6B6B;
							font-weight: 500;
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
