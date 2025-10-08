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
			
			<view v-if="!kanjiaSet" class="product-price-section">
				<view class="price-main">
					<text v-if="productDetail.basicInfo.minPrice" class="score-price">￥{{ productDetail.basicInfo.minPrice }}</text>
					<text v-if="productDetail.basicInfo.minPrice && productDetail.basicInfo.minScore" class="add-plus">+</text>
					<text v-if="productDetail.basicInfo.minScore" class="score-price">{{ productDetail.basicInfo.minScore }}积分</text>
					<text v-if="productDetail.basicInfo.originalPrice" class="market-price">¥{{ productDetail.basicInfo.originalPrice }}</text>
				</view>
			</view>
			
			<view class="product-stats">
				<view class="stat-item">
					<text class="stat-label">库存</text>
					<text class="stat-value">{{ kanjiaSet ? kanjiaSet.number : productDetail.basicInfo.stores }} 件</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-label">销量</text>
					<text class="stat-value">{{ kanjiaSet ? kanjiaSet.numberBuy : productDetail.basicInfo.numberSells }} 件</text>
				</view>
			</view>
		</view>
		
		<template v-if="kanjiaSet">
			<view class="product-detail-section">
				<view class="section-header">
					<text class="section-title">砍价信息</text>
				</view>
				<view style="padding: 32rpx;padding-bottom: 0;">
					<view class="price-section">
						<view class="current-price">
							<text class="price-symbol">¥</text>
							<text class="price-value">{{ currentPrice }}</text>
							<text class="price-symbol">当前价</text>
						</view>
						<view class="price-info">
							<text class="original-price">原价¥{{ kanjiaSet.originalPrice }}</text>
							<text class="bottom-price">底价¥{{ kanjiaSet.minPrice }}</text>
						</view>
					</view>
				</view>
				<uni-list :border="false">
					<uni-list-item title="助力金额" note="好友帮忙砍一刀可优惠金额">
						<template v-slot:footer>
							<view class="price-section small">
								<view class="current-price">
									<text v-if="kanjiaSet.helpPriceMin != kanjiaSet.helpPriceMax" class="price-value">{{ kanjiaSet.helpPriceMin }}</text>
									<text v-if="kanjiaSet.helpPriceMin != kanjiaSet.helpPriceMax" class="price-symbol">~</text>
									<text class="price-value">{{ kanjiaSet.helpPriceMax }}</text>
								</view>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
				<view class="countdown">
					<uni-countdown :font-size="24" :second="countdownSeconds" color="#FFFFFF" splitorColor="#ce5656" background-color="#FF6B6B" />
				</view>
			</view>
			<view style="height: 20rpx;"></view>
		</template>
		
		<!-- 砍价进度区域 -->
		<template v-if="kanjiaDetail">
			<view class="progress-section">
				<view class="section-header">
					<text class="section-title">砍价进度</text>
					<view class="progress-stats">
						<text class="progress-text">{{ kanjiaDetail.kanjiaInfo.helpNumber }} 人助力</text>
					</view>
				</view>
				<view v-if="kanjiaJoiner != uid" class="kanjia-joiner-user">
					<image class="avatarUrl" :src="kanjiaDetail.joiner.avatarUrl" mode="aspectFill"></image>
					<view class="nick">{{ kanjiaDetail.joiner.nick || ('好友' + kanjiaJoiner) }}</view>
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
						<text class="start-label">¥{{ kanjiaSet.originalPrice }}</text>
						<text class="end-label">¥{{ kanjiaDetail.kanjiaInfo.minPrice }}</text>
					</view>
				</view>
			</view>
			<!-- 助力用户列表 -->
			<view v-if="kanjiaDetail.helps && kanjiaDetail.helps.length > 0" class="helper-section">
				<view class="section-header">
					<text class="section-title">助力好友 ({{ kanjiaDetail.helps.length }})</text>
					<view class="invite-tip" @click="invite">
						<text class="tip-text">邀请更多好友助力砍价</text>
					</view>
				</view>
				
				<view class="helper-list">
					<view 
						v-for="(helper, index) in kanjiaDetail.helps" 
						:key="index"
						class="helper-item"
					>
						<image :src="helper.avatarUrl || '/static/images/avatarUrl.png'" class="helper-avatar" mode="aspectFill"></image>
						<view class="helper-info">
							<text class="helper-name">{{ helper.nick }}</text>
							<text class="helper-time">{{ helper.dateAdd }}</text>
						</view>
						<view class="helper-amount">
							<text class="amount-text">-¥{{ helper.cutPrice }}</text>
						</view>
						<view class="helper-effect">
							<view class="effect-circle"></view>
						</view>
					</view>
				</view>
			</view>
		</template>
		
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
		<view v-if="footButtonOK" class="goods-nav-container">
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
	import dayjs from 'dayjs'
	export default {
		data() {
			return {
				productId: '', // 商品ID
				productDetail: undefined, // 商品详情
				productImages: [], // 商品图片列表
				cartCount: 0, // 购物车商品数量
				
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
						key: 'addCart',
						text: '加入购物车',
						backgroundColor: '#30BCB7',
						color: '#fff'
					},
					{
						key: 'buyImmediately',
						text: '立即购买',
						backgroundColor: '#FF6B6B',
						color: '#fff'
					}
				],
				kanjiaSet: undefined,
				currentPrice: undefined,
				countdownSeconds: 0,
				kanjiaJoiner: undefined, // 发起砍价的用户编号
				kanjiaDetail: undefined, // 砍价进程数据
				footButtonOK: false,
				progressPercent: 0, // 进度百分比
			}
		},
		
		onLoad(options) {
			this.productId = options.id
			this.kanjiaJoiner = options.kanjiaJoiner || this.uid
			if (this.productId) {
				this.loadProductDetail()
				this.updateCartBadge()
			}
		},
		
		onShow() {
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
					this.currentPrice = res.data.basicInfo.minPrice
					if (res.data.basicInfo.kanjia) {
						this._kanjiaSet()
					} else {
						this.footButtonOK = true
					}
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
				const { index, content } = e
				switch(content.key) {
					case 'addCart': // 加入购物车
						this.addToCart()
						break
					case 'buyImmediately': // 立即购买
						this.buyNow()
						break
					case 'buyKanjia': // 砍价用当前价格购买
						this.buyNowKanjia()
						break
					case 'kanjiaJoin': // 发起砍价
						this.kanjiaJoin()
						break
					case 'invite': // 邀请助力
						this.invite()
						break
					case 'kanjiaHelp': // 帮忙砍一刀
						this.kanjiaHelp()
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
				uni.navigateTo({
					url: '/pages/shop/cart'
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
					// 更新购物车角标和数量
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
				uni.setStorageSync('bugGoodsInfo', {
					goodsId: this.productId,
					number: 1,
					pic: this.productDetail.basicInfo.pic,
					name: this.productDetail.basicInfo.name,
					score: this.productDetail.basicInfo.minScore,
				})
				uni.navigateTo({
					url: '/pages/shop/checkout?mod=buy'
				})
			},
			// 砍价用当前价格购买
			buyNowKanjia() {
				uni.setStorageSync('bugGoodsInfo', {
					goodsId: this.productId,
					number: 1,
					pic: this.productDetail.basicInfo.pic,
					name: this.productDetail.basicInfo.name,
					score: this.productDetail.basicInfo.minScore,
				})
				uni.navigateTo({
					url: '/pages/shop/checkout?mod=buy&kjid=' + this.kanjiaSet.id
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
			async _kanjiaSet() {
				// https://www.yuque.com/apifm/nu0f75/xs42ih
				const res = await this.$wxapi.kanjiaSet(this.productId)
				if(res.code == 0) {
					this.kanjiaSet = res.data[0]
					this.countdownSeconds = dayjs(this.kanjiaSet.dateEnd).diff(dayjs(), 'second')
					this._kanjiaDetail()
				} else {
					this.footButtonOK = true
				}
			},
			async _kanjiaDetail() {
				// 读取砍价进程 https://www.yuque.com/apifm/nu0f75/taxkl5
				const res = await this.$wxapi.kanjiaDetail(this.kanjiaSet.id, this.kanjiaJoiner)
				if(res.code == 0) {
					this.kanjiaDetail = res.data
					this.currentPrice = res.data.kanjiaInfo.curPrice
					
					this.progressPercent = Math.floor(((this.kanjiaSet.originalPrice - res.data.kanjiaInfo.curPrice) / (this.kanjiaSet.originalPrice - res.data.kanjiaInfo.minPrice)) * 100)
					// 底部按钮修改
					if (this.kanjiaJoiner == this.uid) {
						this.buttonGroup = [
							{
								key: 'invite',
								text: '邀请助力',
								backgroundColor: '#30BCB7',
								color: '#fff'
							},
							{
								key: 'buyKanjia',
								text: '当前价购买',
								backgroundColor: '#FF6B6B',
								color: '#fff'
							}
						]
					} else {
						this.buttonGroup = [
							{
								key: 'kanjiaHelp',
								text: '帮他助力',
								backgroundColor: '#30BCB7',
								color: '#fff'
							},
							{
								key: 'kanjiaJoin',
								text: '我也要砍价',
								backgroundColor: '#FF6B6B',
								color: '#fff'
							}
						]
					}
				} else {
					// 底部显示发起砍价的按钮
					this.buttonGroup = [
						{
							key: 'kanjiaJoin',
							text: '我要砍价',
							backgroundColor: '#FF6B6B',
							color: '#fff'
						}
					]
				}
				this.footButtonOK = true
			},
			async kanjiaJoin() {
				// 发起砍价 https://www.yuque.com/apifm/nu0f75/okrgov
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.kanjiaJoin(this.token, this.kanjiaSet.id)
				uni.hideLoading()
				if (res.code == 0) {
					uni.showModal({
						content: '发起砍价成功，赶快邀请好友帮你砍一刀吧~',
						showCancel: false,
					})
					this.kanjiaJoiner = this.uid
					this._kanjiaDetail()
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
			invite() {
				// 邀请助力
				// #ifdef H5
				if(!this.uid) {
					uni.showToast({
						title: '登录后分享',
						icon: 'none'
					})
					return
				}
				const inviterUrl = location.protocol + '//' + location.host + '/#/pages/shop/detail?id='+ this.productId +'&inviter_id=' + this.uid +'&kanjiaJoiner=' + this.kanjiaJoiner
				uni.setClipboardData({
					data: '帮我助力一下吧~ \n\r' + inviterUrl,
					success: () => {
						uni.showToast({
							title: '已复制到剪切板'
						})
					}
				})
				// #endif
			},
			async kanjiaHelp() {
				// 帮助好友砍一刀 https://www.yuque.com/apifm/nu0f75/xfw31k
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.kanjiaHelp(this.token, this.kanjiaSet.id, this.kanjiaJoiner)
				uni.hideLoading()
				if (res.code == 0) {
					uni.showModal({
						content: '助力成功，非常感谢您的帮助~',
						showCancel: false,
					})
					this._kanjiaDetail()
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
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
	.add-plus {
		padding-right: 12rpx;
		color: #999;
		font-size: 24rpx;
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
		
		&.small {
			.current-price {
				.price-symbol {
					font-size: 26rpx;
					padding-left: 8rpx;
				}
				.price-value {
					font-size: 32rpx;
				}
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
	.countdown {
		display: flex;
		justify-content: center;
		padding: 32rpx;
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
	.kanjia-joiner-user {
		display: flex;
		align-items: center;
		padding-bottom: 32rpx;
		.avatarUrl {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}
		.nick {
			margin-left: 16rpx;
			font-size: 26rpx;
		}
	}
</style>