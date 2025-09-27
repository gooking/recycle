<template>
	<view class="exchange-page">
		<!-- 自定义导航栏 -->
		<!-- #ifdef H5 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<uni-icons type="back" size="40rpx" color="#333"></uni-icons>
				</view>
				<view class="navbar-title">
					<text class="title-text">积分券兑换</text>
				</view>
				<view class="navbar-right"></view>
			</view>
		</view>
		<!-- #endif -->
		
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
			<view class="decoration-circle circle3"></view>
		</view>
		
		<!-- 主要内容区域 -->
		<view class="exchange-content">
			<!-- 标题区域 -->
			<view class="title-section">
				<view class="icon-wrapper">
					<uni-icons type="gift-filled" size="48rpx" color="#30BCB7"></uni-icons>
				</view>
				<text class="main-title">积分券兑换</text>
				<text class="sub-title">输入积分券号码，立即获得积分奖励</text>
			</view>
			
			<!-- 兑换表单 -->
			<view class="exchange-form">
				<view class="form-item">
					<text class="form-label">积分券号码</text>
					<view class="input-wrapper">
						<input 
							v-model="couponCode" 
							class="coupon-input" 
							placeholder="请输入积分券号码"
							placeholder-class="input-placeholder"
							:maxlength="50"
							@input="onInputChange"
						/>
						<view v-if="couponCode" class="clear-btn" @click="clearInput">
							<uni-icons type="clear" size="32rpx" color="#ccc"></uni-icons>
						</view>
					</view>
				</view>
				
				<!-- 兑换按钮 -->
				<button 
					class="exchange-btn" 
					:class="{ 'btn-disabled': !canExchange }"
					:disabled="!canExchange || isExchanging"
					@click="handleExchange"
				>
					<view v-if="isExchanging" class="btn-loading">
						<text class="loading-text">兑换中...</text>
					</view>
					<text v-else class="btn-text">立即兑换</text>
				</button>
			</view>
			
			<!-- 使用说明 -->
			<view class="tips-section">
				<view class="tips-header">
					<uni-icons type="info" size="32rpx" color="#30BCB7"></uni-icons>
					<text class="tips-title">使用说明</text>
				</view>
				<view class="tips-list">
					<view class="tips-item">
						<text class="tips-dot">•</text>
						<text class="tips-text">积分券仅限本平台使用，不可转让</text>
					</view>
					<view class="tips-item">
						<text class="tips-dot">•</text>
						<text class="tips-text">每个积分券仅可使用一次</text>
					</view>
					<view class="tips-item">
						<text class="tips-dot">•</text>
						<text class="tips-text">兑换成功后积分将立即到账</text>
					</view>
					<view class="tips-item">
						<text class="tips-dot">•</text>
						<text class="tips-text">如有疑问请联系客服</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				couponCode: '', // 积分券号码
				isExchanging: false, // 是否正在兑换中
			}
		},
		
		computed: {
			/**
			 * 是否可以兑换
			 * @returns {boolean}
			 */
			canExchange() {
				return this.couponCode.trim().length > 0 && !this.isExchanging
			}
		},
		
		onLoad() {
			// 页面加载时的初始化
		},
		
		methods: {
			/**
			 * 输入框内容变化处理
			 * @param {Event} e - 输入事件
			 */
			onInputChange(e) {
				this.couponCode = e.detail.value.trim()
			},
			
			/**
			 * 清空输入框
			 */
			clearInput() {
				this.couponCode = ''
			},
			
			/**
			 * 返回上一页
			 */
			goBack() {
				uni.navigateBack()
			},
			
			/**
			 * 处理积分券兑换
			 * API文档: https://www.yuque.com/apifm/nu0f75/pdg67o
			 */
			async handleExchange() {
				if (!this.canExchange) return
				
				// 验证输入
				if (!this.couponCode || this.couponCode.trim().length === 0) {
					uni.showToast({
						title: '请输入积分券号码',
						icon: 'none'
					})
					return
				}
				
				// 检查用户登录状态
				if (!this.token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/login/login'
						})
					}, 1500)
					return
				}
				
				this.isExchanging = true
				
				// 显示加载提示
				uni.showLoading({
					title: '兑换中...'
				})
				// https://www.yuque.com/apifm/nu0f75/pdg67o
				const res = await this.$wxapi.scoreExchange(this.token, this.couponCode.trim())
				uni.hideLoading()
				this.isExchanging = false
				
				if (res.code === 0) {
					// 兑换成功
					const score = res.data?.score || 0
					uni.showModal({
						title: '兑换成功',
						content: `恭喜您获得 ${score} 积分！`,
						showCancel: false,
						confirmText: '确定',
						success: () => {
							// 清空输入框
							this.couponCode = ''
							// 跳转到积分页面
							uni.navigateBack()
						}
					})
				} else {
					// 兑换失败
					const errorMsg = res.msg || '兑换失败，请检查积分券号码是否正确'
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 3000
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.exchange-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
		
		.navbar-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 88rpx;
			padding: 0 32rpx;
			padding-top: env(safe-area-inset-top);
			
			.navbar-left {
				width: 80rpx;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background: rgba(0, 0, 0, 0.05);
				transition: all 0.2s ease;
				
				&:active {
					background: rgba(0, 0, 0, 0.1);
					transform: scale(0.95);
				}
			}
			
			.navbar-title {
				flex: 1;
				display: flex;
				justify-content: center;
				
				.title-text {
					font-weight: 600;
					font-size: 36rpx;
					color: #333333;
				}
			}
			
			.navbar-right {
				width: 80rpx;
			}
		}
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
	
	/* 主要内容区域 */
	.exchange-content {
		padding: 160rpx 40rpx 40rpx;
		padding-top: calc(160rpx + env(safe-area-inset-top));
		position: relative;
		z-index: 1;
	}
	
	/* 标题区域 */
	.title-section {
		text-align: center;
		margin-bottom: 80rpx;
		
		.icon-wrapper {
			width: 96rpx;
			height: 96rpx;
			background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto 32rpx;
			box-shadow: 0 8rpx 24rpx rgba(48, 188, 183, 0.3);
		}
		
		.main-title {
			display: block;
			font-weight: 600;
			font-size: 48rpx;
			color: #333333;
			margin-bottom: 16rpx;
			letter-spacing: 1rpx;
		}
		
		.sub-title {
			display: block;
			font-size: 28rpx;
			color: #666666;
			line-height: 40rpx;
		}
	}
	
	/* 兑换表单 */
	.exchange-form {
		background: #FFFFFF;
		border-radius: 32rpx;
		padding: 48rpx 40rpx;
		margin-bottom: 48rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		
		.form-item {
			margin-bottom: 48rpx;
			
			.form-label {
				display: block;
				font-weight: 500;
				font-size: 28rpx;
				color: #333333;
				margin-bottom: 24rpx;
			}
			
			.input-wrapper {
				position: relative;
				background: #F8F9FA;
				border-radius: 16rpx;
				border: 2rpx solid #E9ECEF;
				transition: all 0.3s ease;
				
				&:focus-within {
					border-color: #30BCB7;
					background: #FFFFFF;
					box-shadow: 0 0 0 6rpx rgba(48, 188, 183, 0.1);
				}
				
				.coupon-input {
					width: 100%;
					height: 88rpx;
					padding: 0 24rpx;
					font-size: 32rpx;
					color: #333333;
					background: transparent;
					border: none;
					outline: none;
					
					&.input-placeholder {
						color: #999999;
						font-size: 28rpx;
					}
				}
				
				.clear-btn {
					position: absolute;
					right: 24rpx;
					top: 50%;
					transform: translateY(-50%);
					width: 48rpx;
					height: 48rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					background: #F5F5F5;
					cursor: pointer;
					transition: all 0.2s ease;
					
					&:active {
						background: #E0E0E0;
					}
				}
			}
		}
	}
	
	/* 兑换按钮 */
	.exchange-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
		border-radius: 24rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(48, 188, 183, 0.4);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		
		&:not(.btn-disabled):active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba(48, 188, 183, 0.3);
		}
		
		&.btn-disabled {
			background: #CCCCCC;
			box-shadow: none;
			cursor: not-allowed;
		}
		
		.btn-text {
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
			letter-spacing: 2rpx;
		}
		
		.btn-loading {
			display: flex;
			align-items: center;
			
			.loading-text {
				font-weight: 500;
				font-size: 28rpx;
				color: #FFFFFF;
				margin-left: 12rpx;
			}
		}
	}
	
	/* 使用说明 */
	.tips-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		
		.tips-header {
			display: flex;
			align-items: center;
			margin-bottom: 32rpx;
			
			.tips-title {
				font-weight: 600;
				font-size: 28rpx;
				color: #333333;
				margin-left: 16rpx;
			}
		}
		
		.tips-list {
			.tips-item {
				display: flex;
				align-items: flex-start;
				margin-bottom: 16rpx;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				.tips-dot {
					font-weight: 600;
					font-size: 24rpx;
					color: #30BCB7;
					margin-right: 12rpx;
					line-height: 36rpx;
				}
				
				.tips-text {
					flex: 1;
					font-size: 24rpx;
					color: #666666;
					line-height: 36rpx;
				}
			}
		}
	}
</style>