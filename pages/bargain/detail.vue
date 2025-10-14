<template>
	<view v-if="productDetail" class="bargain-detail-page">
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
			
			<!-- 砍价标签 -->
			<view class="bargain-tag">
				<text class="tag-text">砍价专区</text>
			</view>
			
			<!-- 剩余时间 -->
			<view class="time-countdown">
				<uni-countdown 
					:show-day="false"
					:hour="remainingHours"
					:minute="remainingMinutes" 
					:second="remainingSeconds"
					color="#FFFFFF"
					background-color="rgba(0,0,0,0.6)"
					border-radius="8rpx"
					font-size="24rpx"
				></uni-countdown>
			</view>
		</view>
		
		<!-- 商品基础信息 -->
		<view class="product-info">
			<view class="product-header">
				<text class="product-title">{{ productDetail.basicInfo.name }}</text>
				<view class="product-subtitle" v-if="productDetail.characteristic">
					<text class="subtitle-text">{{ productDetail.characteristic }}</text>
				</view>
			</view>
			
			<view class="price-section">
				<view class="current-price">
					<text class="price-symbol">¥</text>
					<text class="price-value">{{ currentPrice }}</text>
				</view>
				<view class="price-info">
					<text class="original-price">原价¥{{ productDetail.basicInfo.originalPrice }}</text>
					<text class="bottom-price">底价¥{{ bottomPrice }}</text>
				</view>
			</view>
			
			<view class="product-stats">
				<view class="stat-item">
					<text class="stat-label">库存</text>
					<text class="stat-value">{{ productDetail.basicInfo.stores }} 件</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-label">已砍价</text>
					<text class="stat-value">{{ successCount }} 人</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-label">砍价范围</text>
					<text class="stat-value">{{ minCutAmount }}-{{ maxCutAmount }}元</text>
				</view>
			</view>
		</view>
		
		<!-- 砍价进度区域 -->
		<view class="progress-section">
			<view class="section-header">
				<text class="section-title">砍价进度</text>
				<view class="progress-stats">
					<text class="progress-text">已砍¥{{ cutAmount }} / 还差¥{{ remainAmount }}</text>
				</view>
			</view>
			
			<!-- 酷炫进度条 -->
			<view class="progress-container">
				<view class="progress-track">
					<view class="progress-fill" :style="{ width: progressPercent + '%' }">
						<view class="progress-glow"></view>
					</view>
					<view class="progress-thumb" :style="{ left: progressPercent + '%' }">
						<view class="thumb-inner"></view>
						<view class="thumb-pulse"></view>
					</view>
				</view>
				<view class="progress-labels">
					<text class="start-label">¥{{ productDetail.basicInfo.originalPrice }}</text>
					<text class="end-label">¥{{ bottomPrice }}</text>
				</view>
			</view>
			
			<!-- 砍价成功提示 -->
			<view v-if="bargainStatus === 'success'" class="success-tip">
				<uni-icons type="checkmarkempty" size="40rpx" color="#4CAF50"></uni-icons>
				<text class="success-text">恭喜！砍价成功，快去下单吧</text>
			</view>
		</view>
		
		<!-- 助力用户列表 -->
		<view class="helper-section">
			<view class="section-header">
				<text class="section-title">助力好友 ({{ helperList.length }})</text>
				<view class="invite-tip">
					<text class="tip-text">邀请更多好友助力砍价</text>
				</view>
			</view>
			
			<view v-if="helperList.length > 0" class="helper-list">
				<view 
					v-for="(helper, index) in helperList" 
					:key="index"
					class="helper-item"
				>
					<image :src="helper.avatar" class="helper-avatar" mode="aspectFill"></image>
					<view class="helper-info">
						<text class="helper-name">{{ helper.nickname }}</text>
						<text class="helper-time">{{ formatTime(helper.helpTime) }}</text>
					</view>
					<view class="helper-amount">
						<text class="amount-text">-¥{{ helper.amount }}</text>
					</view>
					<view class="helper-effect">
						<view class="effect-circle"></view>
					</view>
				</view>
			</view>
			
			<view v-else class="empty-helper">
				<image src="/static/images/empty.png" class="empty-image" mode="aspectFit"></image>
				<text class="empty-text">还没有好友助力</text>
				<text class="empty-desc">快邀请好友来帮你砍价吧</text>
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
		
		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<view class="action-left">
				<button class="contact-btn" @click="contactService">
					<uni-icons type="headphones" size="40rpx" color="#666"></uni-icons>
					<text class="btn-text">客服</text>
				</button>
				<button class="share-btn" @click="handleShare">
					<uni-icons type="redo" size="40rpx" color="#666"></uni-icons>
					<text class="btn-text">分享</text>
				</button>
			</view>
			
			<view class="action-right">
				<button 
					v-if="bargainStatus === 'none'" 
					class="bargain-btn primary" 
					@click="startBargain"
				>
					<text class="btn-text">我要砍价</text>
				</button>
				
				<button 
					v-else-if="bargainStatus === 'ongoing'" 
					class="invite-btn primary" 
					@click="inviteFriends"
				>
					<uni-icons type="person-add" size="32rpx" color="#fff"></uni-icons>
					<text class="btn-text">邀请好友助力</text>
				</button>
				
				<button 
					v-else-if="bargainStatus === 'success'" 
					class="buy-btn success" 
					@click="buyNow"
				>
					<text class="btn-text">立即购买</text>
				</button>
				
				<button 
					v-else 
					class="expired-btn disabled" 
					disabled
				>
					<text class="btn-text">砍价已结束</text>
				</button>
			</view>
		</view>
		
		<!-- 砍价成功弹窗 -->
		<uni-popup ref="successPopup" type="center" :mask-click="false">
			<view class="success-popup">
				<view class="popup-content">
					<view class="success-icon">
						<uni-icons type="checkmarkempty" size="80rpx" color="#4CAF50"></uni-icons>
					</view>
					<text class="success-title">砍价成功！</text>
					<text class="success-desc">恭喜您成功砍到底价，快去下单吧</text>
					<view class="popup-actions">
						<button class="cancel-btn" @click="closeSuccessPopup">稍后购买</button>
						<button class="confirm-btn" @click="buyNow">立即购买</button>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 邀请好友弹窗 -->
		<uni-popup ref="invitePopup" type="bottom">
			<view class="invite-popup">
				<view class="popup-header">
					<text class="popup-title">邀请好友助力</text>
					<view class="close-btn" @click="closeInvitePopup">
						<uni-icons type="clear" size="32rpx" color="#999"></uni-icons>
					</view>
				</view>
				<view class="invite-methods">
					<view class="method-item" @click="shareToWechat">
						<view class="method-icon wechat">
							<uni-icons type="weixin" size="48rpx" color="#07C160"></uni-icons>
						</view>
						<text class="method-name">微信好友</text>
					</view>
					<view class="method-item" @click="shareToMoments">
						<view class="method-icon moments">
							<uni-icons type="pyq" size="48rpx" color="#07C160"></uni-icons>
						</view>
						<text class="method-name">朋友圈</text>
					</view>
					<view class="method-item" @click="copyLink">
						<view class="method-icon copy">
							<uni-icons type="paperclip" size="48rpx" color="#FF6B6B"></uni-icons>
						</view>
						<text class="method-name">复制链接</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				productId: '', // 商品ID
				bargainId: '', // 砍价记录ID
				productDetail: undefined, // 商品详情
				productImages: [], // 商品图片列表
				
				// 砍价相关数据
				bargainStatus: 'none', // none, ongoing, success, expired
				currentPrice: 0, // 当前价格
				bottomPrice: 0, // 底价
				cutAmount: 0, // 已砍金额
				remainAmount: 0, // 剩余金额
				progressPercent: 0, // 进度百分比
				successCount: 0, // 砍价成功人数
				minCutAmount: 1, // 最小砍价金额
				maxCutAmount: 50, // 最大砍价金额
				
				// 助力用户列表
				helperList: [],
				
				// 倒计时相关
				remainingHours: 24,
				remainingMinutes: 0,
				remainingSeconds: 0,
				countdownTimer: null,
			}
		},
		
		onLoad(options) {
			this.productId = options.id
			this.bargainId = options.bargainId || ''
			
			if (this.productId) {
				this.loadProductDetail()
				this.loadBargainInfo()
				this.startCountdown()
			}
			
			// 检查是否是邀请进入
			if (options.invite) {
				this.handleInviteHelp()
			}
		},
		
		onShow() {
			// 刷新砍价信息
			if (this.bargainId) {
				this.loadBargainInfo()
			}
		},
		
		onUnload() {
			// 清除定时器
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
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
					
					// 初始化砍价相关数据
					this.currentPrice = res.data.basicInfo.minPrice
					this.bottomPrice = (res.data.basicInfo.minPrice * 0.6).toFixed(2)
					this.remainAmount = (this.currentPrice - this.bottomPrice).toFixed(2)
					this.successCount = Math.floor(Math.random() * 100) + 10
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
			 * 加载砍价信息
			 * https://www.yuque.com/apifm/nu0f75/xxxx (需要根据实际API调整)
			 */
			async loadBargainInfo() {
				if (!this.bargainId) return
				
				// 模拟砍价数据
				this.bargainStatus = 'ongoing'
				this.cutAmount = 25.8
				this.remainAmount = (this.currentPrice - this.bottomPrice - this.cutAmount).toFixed(2)
				this.progressPercent = Math.floor((this.cutAmount / (this.currentPrice - this.bottomPrice)) * 100)
				
				// 模拟助力用户数据
				this.helperList = [
					{
						avatar: 'https://via.placeholder.com/80x80/30BCB7/FFFFFF?text=U1',
						nickname: '热心用户1',
						amount: '8.5',
						helpTime: new Date().getTime() - 3600000
					},
					{
						avatar: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=U2',
						nickname: '热心用户2',
						amount: '12.3',
						helpTime: new Date().getTime() - 7200000
					},
					{
						avatar: 'https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=U3',
						nickname: '热心用户3',
						amount: '5.0',
						helpTime: new Date().getTime() - 10800000
					}
				]
			},
			
			/**
			 * 开始倒计时
			 */
			startCountdown() {
				// 设置24小时倒计时
				let totalSeconds = 24 * 60 * 60
				
				this.countdownTimer = setInterval(() => {
					if (totalSeconds <= 0) {
						clearInterval(this.countdownTimer)
						this.bargainStatus = 'expired'
						return
					}
					
					this.remainingHours = Math.floor(totalSeconds / 3600)
					this.remainingMinutes = Math.floor((totalSeconds % 3600) / 60)
					this.remainingSeconds = totalSeconds % 60
					
					totalSeconds--
				}, 1000)
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
			 * 图片预览
			 */
			previewImages(current) {
				uni.previewImage({
					urls: this.productImages,
					current: current
				})
			},
			
			/**
			 * 开始砍价
			 * https://www.yuque.com/apifm/nu0f75/xxxx (需要根据实际API调整)
			 */
			async startBargain() {
				uni.showLoading({
					title: '砍价中...'
				})
				
				// 模拟砍价API调用
				setTimeout(() => {
					uni.hideLoading()
					
					// 模拟砍价结果
					const cutAmount = (Math.random() * (this.maxCutAmount - this.minCutAmount) + this.minCutAmount).toFixed(2)
					this.cutAmount = parseFloat(cutAmount)
					this.currentPrice = (this.productDetail.basicInfo.minPrice - this.cutAmount).toFixed(2)
					this.remainAmount = (this.currentPrice - this.bottomPrice).toFixed(2)
					this.progressPercent = Math.floor((this.cutAmount / (this.productDetail.basicInfo.minPrice - this.bottomPrice)) * 100)
					this.bargainStatus = 'ongoing'
					this.bargainId = 'bargain_' + Date.now()
					
					// 添加自己到助力列表
					this.helperList.unshift({
						avatar: this.userInfo?.avatarUrl || 'https://via.placeholder.com/80x80/666/FFFFFF?text=我',
						nickname: this.userInfo?.nickName || '我',
						amount: cutAmount,
						helpTime: new Date().getTime()
					})
					
					uni.showToast({
						title: `砍掉¥${cutAmount}`,
						icon: 'success'
					})
					
					// 检查是否砍价成功
					if (this.remainAmount <= 0) {
						this.bargainStatus = 'success'
						setTimeout(() => {
							this.$refs.successPopup.open()
						}, 1500)
					}
				}, 2000)
			},
			
			/**
			 * 邀请好友助力
			 */
			inviteFriends() {
				this.$refs.invitePopup.open()
			},
			
			/**
			 * 处理邀请助力
			 */
			async handleInviteHelp() {
				if (!this.bargainId) return
				
				uni.showModal({
					title: '助力砍价',
					content: '帮好友砍一刀，让TA更快拿到心仪商品',
					confirmText: '帮TA砍价',
					success: (res) => {
						if (res.confirm) {
							this.helpFriend()
						}
					}
				})
			},
			
			/**
			 * 帮助好友砍价
			 * https://www.yuque.com/apifm/nu0f75/xxxx (需要根据实际API调整)
			 */
			async helpFriend() {
				uni.showLoading({
					title: '助力中...'
				})
				
				// 模拟助力API调用
				setTimeout(() => {
					uni.hideLoading()
					
					const helpAmount = (Math.random() * 10 + 1).toFixed(2)
					
					// 添加助力记录
					this.helperList.unshift({
						avatar: this.userInfo?.avatarUrl || 'https://via.placeholder.com/80x80/666/FFFFFF?text=我',
						nickname: this.userInfo?.nickName || '我',
						amount: helpAmount,
						helpTime: new Date().getTime()
					})
					
					// 更新砍价进度
					this.cutAmount += parseFloat(helpAmount)
					this.currentPrice = (this.productDetail.basicInfo.minPrice - this.cutAmount).toFixed(2)
					this.remainAmount = (this.currentPrice - this.bottomPrice).toFixed(2)
					this.progressPercent = Math.floor((this.cutAmount / (this.productDetail.basicInfo.minPrice - this.bottomPrice)) * 100)
					
					uni.showToast({
						title: `助力成功，砍掉¥${helpAmount}`,
						icon: 'success'
					})
					
					// 检查是否砍价成功
					if (this.remainAmount <= 0) {
						this.bargainStatus = 'success'
						setTimeout(() => {
							this.$refs.successPopup.open()
						}, 1500)
					}
				}, 2000)
			},
			
			/**
			 * 立即购买
			 */
			buyNow() {
				if (this.bargainStatus === 'success') {
					// 砍价成功，使用砍价价格
					uni.setStorageSync('bugGoodsInfo', {
						goodsId: this.productId,
						number: 1,
						pic: this.productDetail.basicInfo.pic,
						name: this.productDetail.basicInfo.name,
						price: this.bottomPrice,
						bargainId: this.bargainId
					})
				} else {
					// 普通购买
					uni.setStorageSync('bugGoodsInfo', {
						goodsId: this.productId,
						number: 1,
						pic: this.productDetail.basicInfo.pic,
						name: this.productDetail.basicInfo.name,
						price: this.currentPrice
					})
				}
				
				uni.navigateTo({
					url: '/pages/shop/checkout?mod=buy'
				})
			},
			
			/**
			 * 联系客服
			 */
			contactService() {
				getApp().contactService()
			},
			
			/**
			 * 分享处理
			 */
			handleShare() {
				this.$refs.invitePopup.open()
			},
			
			/**
			 * 分享到微信好友
			 */
			shareToWechat() {
				uni.share({
					provider: "weixin",
					scene: "WXSceneSession",
					type: 0,
					href: `pages/bargain/detail?id=${this.productId}&bargainId=${this.bargainId}&invite=1`,
					title: `帮我砍一刀，${this.productDetail.basicInfo.name}`,
					summary: `还差${this.remainAmount}元就能砍价成功啦！`,
					imageUrl: this.productDetail.basicInfo.pic,
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
						this.closeInvitePopup()
					}
				})
			},
			
			/**
			 * 分享到朋友圈
			 */
			shareToMoments() {
				uni.share({
					provider: "weixin",
					scene: "WXSceneTimeline",
					type: 0,
					href: `pages/bargain/detail?id=${this.productId}&bargainId=${this.bargainId}&invite=1`,
					title: `帮我砍一刀，${this.productDetail.basicInfo.name}`,
					imageUrl: this.productDetail.basicInfo.pic,
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
						this.closeInvitePopup()
					}
				})
			},
			
			/**
			 * 复制链接
			 */
			copyLink() {
				const link = `${window.location.origin}/pages/bargain/detail?id=${this.productId}&bargainId=${this.bargainId}&invite=1`
				uni.setClipboardData({
					data: link,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'success'
						})
						this.closeInvitePopup()
					}
				})
			},
			
			/**
			 * 关闭成功弹窗
			 */
			closeSuccessPopup() {
				this.$refs.successPopup.close()
			},
			
			/**
			 * 关闭邀请弹窗
			 */
			closeInvitePopup() {
				this.$refs.invitePopup.close()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bargain-detail-page {
		min-height: 100vh;
		background: #F8F9FA;
		padding-bottom: 120rpx; // 给底部操作栏留出空间
	}
	
	/* 商品轮播图 */
	.product-gallery {
		position: relative;
		background: #fff;
		
		.gallery-swiper {
			height: 750rpx;
			width: 100%;
			
			.gallery-image {
				width: 100%;
				height: 100%;
			}
		}
		
		.bargain-tag {
			position: absolute;
			top: 40rpx;
			left: 32rpx;
			background: linear-gradient(135deg, #FF6B6B, #FF8E53);
			border-radius: 24rpx;
			padding: 12rpx 24rpx;
			
			.tag-text {
				font-size: 24rpx;
				color: #FFFFFF;
				font-weight: 600;
			}
		}
		
		.time-countdown {
			position: absolute;
			top: 40rpx;
			right: 32rpx;
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
		
		.price-section {
			margin-bottom: 32rpx;
			
			.current-price {
				display: flex;
				align-items: baseline;
				margin-bottom: 12rpx;
				
				.price-symbol {
					font-size: 36rpx;
					color: #FF6B6B;
					font-weight: 700;
				}
				
				.price-value {
					font-size: 72rpx;
					color: #FF6B6B;
					font-weight: 700;
					margin-left: 8rpx;
				}
			}
			
			.price-info {
				display: flex;
				align-items: center;
				gap: 24rpx;
				
				.original-price {
					font-size: 28rpx;
					color: #999;
					text-decoration: line-through;
				}
				
				.bottom-price {
					font-size: 28rpx;
					color: #4CAF50;
					font-weight: 500;
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
	
	/* 砍价进度区域 */
	.progress-section {
		background: #fff;
		padding: 32rpx;
		margin-bottom: 20rpx;
		
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;
			
			.section-title {
				font-size: 32rpx;
				color: #333;
				font-weight: 600;
			}
			
			.progress-stats {
				.progress-text {
					font-size: 24rpx;
					color: #FF6B6B;
					font-weight: 500;
				}
			}
		}
		
		.progress-container {
			margin-bottom: 24rpx;
			
			.progress-track {
				position: relative;
				height: 16rpx;
				background: #F0F0F0;
				border-radius: 8rpx;
				overflow: hidden;
				margin-bottom: 16rpx;
				
				.progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #FF6B6B 0%, #FF8E53 50%, #FFD700 100%);
					border-radius: 8rpx;
					position: relative;
					transition: width 0.5s ease;
					
					.progress-glow {
						position: absolute;
						top: -4rpx;
						right: -8rpx;
						width: 32rpx;
						height: 24rpx;
						background: radial-gradient(ellipse, rgba(255, 107, 107, 0.6) 0%, transparent 70%);
						border-radius: 50%;
						animation: glow 2s ease-in-out infinite alternate;
					}
				}
				
				.progress-thumb {
					position: absolute;
					top: -8rpx;
					width: 32rpx;
					height: 32rpx;
					transform: translateX(-50%);
					transition: left 0.5s ease;
					
					.thumb-inner {
						width: 100%;
						height: 100%;
						background: linear-gradient(135deg, #FF6B6B, #FF8E53);
						border-radius: 50%;
						border: 4rpx solid #FFFFFF;
						box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
					}
					
					.thumb-pulse {
						position: absolute;
						top: -8rpx;
						left: -8rpx;
						width: 48rpx;
						height: 48rpx;
						border: 2rpx solid #FF6B6B;
						border-radius: 50%;
						opacity: 0;
						animation: pulse 2s ease-in-out infinite;
					}
				}
			}
			
			.progress-labels {
				display: flex;
				justify-content: space-between;
				
				.start-label,
				.end-label {
					font-size: 24rpx;
					color: #666;
				}
			}
		}
		
		.success-tip {
			display: flex;
			align-items: center;
			gap: 12rpx;
			padding: 20rpx;
			background: #E8F5E8;
			border-radius: 16rpx;
			
			.success-text {
				font-size: 28rpx;
				color: #4CAF50;
				font-weight: 500;
			}
		}
	}
	
	/* 助力用户列表 */
	.helper-section {
		background: #fff;
		padding: 32rpx;
		margin-bottom: 20rpx;
		
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;
			
			.section-title {
				font-size: 32rpx;
				color: #333;
				font-weight: 600;
			}
			
			.invite-tip {
				.tip-text {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.helper-list {
			.helper-item {
				display: flex;
				align-items: center;
				padding: 24rpx 0;
				border-bottom: 2rpx solid #F8F9FA;
				position: relative;
				
				&:last-child {
					border-bottom: none;
				}
				
				.helper-avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					margin-right: 24rpx;
				}
				
				.helper-info {
					flex: 1;
					
					.helper-name {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
						display: block;
						margin-bottom: 8rpx;
					}
					
					.helper-time {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.helper-amount {
					.amount-text {
						font-size: 32rpx;
						color: #FF6B6B;
						font-weight: 600;
					}
				}
				
				.helper-effect {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					
					.effect-circle {
						width: 120rpx;
						height: 120rpx;
						border: 2rpx solid #FF6B6B;
						border-radius: 50%;
						opacity: 0;
						animation: ripple 2s ease-in-out infinite;
					}
				}
			}
		}
		
		.empty-helper {
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
	
	/* 底部操作栏 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFFFFF;
		padding: 24rpx 32rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		border-top: 2rpx solid #F0F0F0;
		display: flex;
		align-items: center;
		gap: 24rpx;
		z-index: 1000;
		
		.action-left {
			display: flex;
			gap: 32rpx;
			
			.contact-btn,
			.share-btn {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8rpx;
				background: none;
				border: none;
				padding: 0;
				
				&:active {
					opacity: 0.7;
				}
				
				.btn-text {
					font-size: 20rpx;
					color: #666;
				}
			}
		}
		
		.action-right {
			flex: 1;
			
			.bargain-btn,
			.invite-btn,
			.buy-btn,
			.expired-btn {
				width: 100%;
				height: 88rpx;
				border-radius: 44rpx;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				font-size: 28rpx;
				font-weight: 600;
				transition: all 0.2s ease;
				
				&:not([disabled]):active {
					transform: scale(0.95);
				}
				
				&.primary {
					background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
					color: #FFFFFF;
					box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
				}
				
				&.success {
					background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
					color: #FFFFFF;
					box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
				}
				
				&.disabled {
					background: #CCCCCC;
					color: #999;
				}
			}
		}
	}
	
	/* 弹窗样式 */
	.success-popup {
		width: 600rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		
		.popup-content {
			padding: 80rpx 60rpx 60rpx;
			text-align: center;
			
			.success-icon {
				margin-bottom: 32rpx;
			}
			
			.success-title {
				font-size: 36rpx;
				color: #333;
				font-weight: 600;
				display: block;
				margin-bottom: 16rpx;
			}
			
			.success-desc {
				font-size: 28rpx;
				color: #666;
				line-height: 40rpx;
				margin-bottom: 48rpx;
				display: block;
			}
			
			.popup-actions {
				display: flex;
				gap: 24rpx;
				
				.cancel-btn,
				.confirm-btn {
					flex: 1;
					height: 80rpx;
					border-radius: 40rpx;
					border: none;
					font-size: 28rpx;
					font-weight: 500;
					
					&:active {
						transform: scale(0.95);
					}
				}
				
				.cancel-btn {
					background: #F8F9FA;
					color: #666;
				}
				
				.confirm-btn {
					background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
					color: #FFFFFF;
				}
			}
		}
	}
	
	.invite-popup {
		background: #FFFFFF;
		border-radius: 24rpx 24rpx 0 0;
		
		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 32rpx;
			border-bottom: 2rpx solid #F0F0F0;
			
			.popup-title {
				font-size: 32rpx;
				color: #333;
				font-weight: 600;
			}
			
			.close-btn {
				width: 48rpx;
				height: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background: #F8F9FA;
				
				&:active {
					background: #E0E0E0;
				}
			}
		}
		
		.invite-methods {
			display: flex;
			justify-content: space-around;
			padding: 60rpx 32rpx;
			
			.method-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16rpx;
				
				&:active {
					opacity: 0.7;
				}
				
				.method-icon {
					width: 96rpx;
					height: 96rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					
					&.wechat,
					&.moments {
						background: #E8F5E8;
					}
					
					&.copy {
						background: #FFEBEE;
					}
				}
				
				.method-name {
					font-size: 24rpx;
					color: #333;
				}
			}
		}
	}
	
	/* 动画效果 */
	@keyframes glow {
		0% {
			opacity: 0.6;
		}
		100% {
			opacity: 1;
		}
	}
	
	@keyframes pulse {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.2);
		}
		100% {
			opacity: 0;
			transform: scale(1.4);
		}
	}
	
	@keyframes ripple {
		0% {
			opacity: 0;
			transform: translateY(-50%) scale(0.5);
		}
		50% {
			opacity: 0.6;
			transform: translateY(-50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-50%) scale(1.5);
		}
	}
</style>
