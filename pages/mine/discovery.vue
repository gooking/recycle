<template>
	<view class="lab-container">
		<!-- 顶部装饰背景 -->
		<view class="header-bg">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>
		
		<!-- 标题区域 -->
		<view class="header">
			<text class="title">🧪 功能实验室</text>
			<text class="subtitle">探索更多精彩功能</text>
		</view>
		
		<!-- 九宫格区域 -->
		<view class="grid-container">
			<view 
				class="grid-item" 
				:class="item.id === 1 ? 'active-item' : 'disabled-item'"
				v-for="item in gridList" 
				:key="item.id"
				@click="handleItemClick(item)"
			>
				<view class="item-content">
					<view class="icon-wrapper">
						<text class="icon">{{ item.icon }}</text>
						<view class="shine" v-if="item.id === 1"></view>
					</view>
					<text class="item-title">{{ item.title }}</text>
					<text class="item-desc" v-if="item.id === 1">{{ item.desc }}</text>
					<view class="coming-soon-badge" v-else>
						<text class="badge-text">Coming Soon</text>
					</view>
				</view>
				
				<!-- 激活状态的光效 -->
				<view class="glow-effect" v-if="item.id === 1"></view>
			</view>
		</view>
		
		<!-- 底部提示 -->
		<view class="footer-tip">
			<text class="tip-text">✨ 更多功能正在开发中，敬请期待</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				gridList: [
					{
						id: 1,
						title: '课程中心',
						desc: '立即体验',
						icon: '📚',
						path: '/sub_packages/course/index',
						enabled: true
					},
					{
						id: 2,
						title: '敬请期待',
						icon: '🎯',
						enabled: false
					},
					{
						id: 3,
						title: '敬请期待',
						icon: '🎨',
						enabled: false
					},
					{
						id: 4,
						title: '敬请期待',
						icon: '🎮',
						enabled: false
					},
					{
						id: 5,
						title: '敬请期待',
						icon: '🎪',
						enabled: false
					},
					{
						id: 6,
						title: '敬请期待',
						icon: '🎭',
						enabled: false
					},
					{
						id: 7,
						title: '敬请期待',
						icon: '🎬',
						enabled: false
					},
					{
						id: 8,
						title: '敬请期待',
						icon: '🎵',
						enabled: false
					},
					{
						id: 9,
						title: '敬请期待',
						icon: '🎸',
						enabled: false
					}
				]
			}
		},
		onLoad(e) {
		},
		onShow() {
		},
		methods: {
			handleItemClick(item) {
				if (item.enabled && item.path) {
					uni.navigateTo({
						url: item.path
					});
				} else {
					uni.showToast({
						title: '功能开发中，敬请期待',
						icon: 'none',
						duration: 2000
					});
				}
			}
		}
	}
</script>

<style scoped lang="scss">
.lab-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	padding: 40rpx 30rpx;
	position: relative;
	overflow: hidden;
}

/* 顶部装饰背景 */
.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 400rpx;
	overflow: hidden;
	
	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		animation: float 6s ease-in-out infinite;
		
		&.circle-1 {
			width: 200rpx;
			height: 200rpx;
			top: -50rpx;
			left: -50rpx;
			animation-delay: 0s;
		}
		
		&.circle-2 {
			width: 150rpx;
			height: 150rpx;
			top: 100rpx;
			right: 50rpx;
			animation-delay: 2s;
		}
		
		&.circle-3 {
			width: 100rpx;
			height: 100rpx;
			top: 250rpx;
			left: 50%;
			animation-delay: 4s;
		}
	}
}

@keyframes float {
	0%, 100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-20px);
	}
}

/* 标题区域 */
.header {
	text-align: center;
	margin-bottom: 60rpx;
	position: relative;
	z-index: 10;
	
	.title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 20rpx;
		text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		letter-spacing: 4rpx;
	}
	
	.subtitle {
		display: block;
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 2rpx;
	}
}

/* 九宫格容器 */
.grid-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24rpx;
	padding: 20rpx 0;
	position: relative;
	z-index: 10;
}

/* 九宫格项 */
.grid-item {
	aspect-ratio: 1;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	
	&.active-item {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.4);
		
		.item-title {
			color: #ffffff;
			font-weight: bold;
		}
		
		.item-desc {
			color: rgba(255, 255, 255, 0.9);
		}
		
		&:active {
			transform: scale(0.95);
		}
	}
	
	&.disabled-item {
		.item-title {
			color: #999999;
		}
		
		.icon {
			opacity: 0.5;
		}
	}
}

/* 项目内容 */
.item-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20rpx;
	position: relative;
	z-index: 2;
}

/* 图标容器 */
.icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
	position: relative;
	
	.icon {
		font-size: 56rpx;
		line-height: 1;
	}
	
	.shine {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3), transparent 70%);
		animation: shine 3s ease-in-out infinite;
	}
}

@keyframes shine {
	0% {
		transform: translateX(-100%) translateY(-100%);
	}
	50%, 100% {
		transform: translateX(100%) translateY(100%);
	}
}

/* 标题 */
.item-title {
	font-size: 26rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 8rpx;
	text-align: center;
}

/* 描述 */
.item-desc {
	font-size: 22rpx;
	color: #666666;
	text-align: center;
}

/* 敬请期待徽章 */
.coming-soon-badge {
	margin-top: 8rpx;
	
	.badge-text {
		font-size: 20rpx;
		color: #999999;
		background: rgba(0, 0, 0, 0.05);
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}
}

/* 光效 */
.glow-effect {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 100%;
	height: 100%;
	transform: translate(-50%, -50%);
	background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
	animation: pulse 2s ease-in-out infinite;
	pointer-events: none;
}

@keyframes pulse {
	0%, 100% {
		opacity: 0.5;
		transform: translate(-50%, -50%) scale(0.9);
	}
	50% {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1.1);
	}
}

/* 底部提示 */
.footer-tip {
	margin-top: 60rpx;
	text-align: center;
	position: relative;
	z-index: 10;
	
	.tip-text {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
		letter-spacing: 1rpx;
	}
}
</style>