<template>
	<view class="custom-header">
		<!-- 头部内容区域 -->
		<view class="header-content" :style="{ 
      paddingTop: headerContentTop + 'px'
    }">
			<!-- 城市选择器 -->
			<view class="city-selector" @click="selectCity">
				<text class="city-name">{{ city }}</text>
				<uni-icons type="down" size="32rpx" color="#fff"></uni-icons>
			</view>

			<!-- Logo区域 -->
			<view class="logo-container">{{ logoText }}</view>
		</view>
		<!-- 微信小程序胶囊按钮占位区域 -->
		<view class="capsule-placeholder" :style="{width: menuButtonWidth + 'px'}"></view>
	</view>
</template>

<script>
	export default {
		name: 'customHeader',
		// 组件属性
		props: {
			city: {
				type: String,
				default: '重庆市'
			},
			logoText: {
				type: String,
				default: '艾玛回收'
			}
		},
		// 数据
		data() {
			return {
				// 头部内容区域定位
				headerContentTop: 0,
				menuButtonWidth: 0, // 胶囊按钮的宽度，需要考虑右侧的间距
			}
		},
		// 生命周期钩子
		mounted() {
			// 获取系统信息和胶囊信息
			this.initSystemInfo()
		},
		// 监听显示
		onShow() {
			// 页面显示时重新获取系统信息，确保适配不同设备
			this.initSystemInfo()
		},
		// 方法
		methods: {
			/**
			 * 初始化系统信息
			 * 说明：获取系统信息和胶囊信息，用于自定义头部布局适配
			 */
			initSystemInfo() {
				// 获取胶囊信息（仅在小程序环境下）
				// #ifdef MP
				const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
				this.headerContentTop = menuButtonInfo.top
				this.menuButtonWidth = menuButtonInfo.right - menuButtonInfo.left
				// #endif
			},
			/**
			 * 城市选择
			 * 说明：点击城市名称时的交互
			 */
			selectCity() {
				this.$emit('selectCity')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.custom-header {
		background: #3ED09F;
		width: 100vw;
		display: flex;
		padding-bottom: 32rpx;
	}

	// 头部内容区域
	.header-content {
		flex: 1;
		padding-left: 24rpx;
		display: flex;

		// 城市选择器
		.city-selector {
			display: flex;
			align-items: center;
			.city-name {
				font-weight: 600;
				font-size: 28rpx;
				line-height: 40rpx;
				color: #FFFFFF;
				padding-right: 8rpx;
			}
		}

		// Logo容器
		.logo-container {
			flex: 1;
			text-align: center;
			font-weight: 400;
			font-size: 40rpx;
			color: #FFFFFF;
		}
	}
</style>