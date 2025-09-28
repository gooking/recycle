<template>
	<view v-if="orderDetail" class="order-detail-page">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
		</view>
		
		<!-- 订单状态区域 -->
		<view class="status-section">
			<view class="status-info">
				<view class="status-icon" :class="getStatusClass(orderDetail.orderInfo.status)">
					<text class="status-emoji">{{ getStatusEmoji(orderDetail.orderInfo.status) }}</text>
				</view>
				<view class="status-content">
					<text class="status-title">{{ getStatusText(orderDetail.orderInfo.status) }}</text>
					<text class="status-desc">{{ getStatusDesc(orderDetail.orderInfo.status) }}</text>
				</view>
			</view>
		</view>

		<view v-if="orderDetail.orderLogisticsShippers && orderDetail.orderLogisticsShippers.length > 0" class="address-section">
			<view class="section-header">
				<view class="header-icon">
					<text class="icon-text">🚚</text>
				</view>
				<text class="section-title">物流信息</text>
			</view>
			<view class="address-content">
				<uni-list>
					<uni-list-item
						v-for="(item,index) in orderDetail.orderLogisticsShippers" :key="item.id"
						:title="item.shipperName"
						:right-text="item.trackingNumber"
						showArrow
						clickable
						@click="showLogisticsDetail(item)"
					></uni-list-item>
				</uni-list>
			</view>
		</view>

		<!-- 订单日志 -->
		<view v-if="orderLogs.length > 0" class="logs-section">
			<view class="section-header">
				<view class="header-icon">
					<text class="icon-text">📝</text>
				</view>
				<text class="section-title">订单日志</text>
			</view>
			<view class="logs-content">
				<uni-steps 
					:options="orderLogs" 
					direction="column" 
					:active="orderLogs.length - 1"
					active-color="#30BCB7"
				></uni-steps>
			</view>
		</view>

		<!-- 商品信息 -->
		<view class="goods-section">
			<view class="section-header">
				<view class="header-icon">
					<text class="icon-text">🛍️</text>
				</view>
				<text class="section-title">商品信息</text>
			</view>
			<view class="goods-list">
				<view v-for="(item, index) in orderDetail.goods" :key="index" class="goods-item">
					<view class="goods-image">
						<image :src="item.pic" class="product-image" mode="aspectFill"></image>
					</view>
					<view class="goods-info">
						<text class="goods-name">{{ item.goodsName }}</text>
						<view class="goods-price-info">
							<text class="score-price">{{ item.score }}积分</text>
							<text v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</text>
						</view>
						<view class="goods-quantity">
							<text class="quantity-label">数量：</text>
							<text class="quantity-value">x{{ item.number }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 收货地址 -->
		<view v-if="orderDetail.logistics" class="address-section">
			<view class="section-header">
				<view class="header-icon">
					<text class="icon-text">📍</text>
				</view>
				<text class="section-title">收货地址</text>
			</view>
			<view class="address-content">
				<view class="recipient-info">
					<text class="recipient-name">{{ orderDetail.logistics.linkMan }}</text>
					<text class="recipient-phone">{{ orderDetail.logistics.mobile }}</text>
				</view>
				<text class="address-detail">{{ orderDetail.logistics.address }}</text>
			</view>
		</view>

		<!-- 订单信息 -->
		<view class="order-info-section">
			<view class="section-header">
				<view class="header-icon">
					<text class="icon-text">📋</text>
				</view>
				<text class="section-title">订单信息</text>
			</view>
			<view class="order-info-content">
				<view class="info-item">
					<text class="info-label">订单号：</text>
					<text class="info-value">{{ orderDetail.orderInfo.orderNumber }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">下单时间：</text>
					<text class="info-value">{{ orderDetail.orderInfo.dateAdd }}</text>
				</view>
				<view v-if="orderDetail.orderInfo.datePay" class="info-item">
					<text class="info-label">支付时间：</text>
					<text class="info-value">{{ orderDetail.orderInfo.datePay }}</text>
				</view>
				<view v-if="orderDetail.orderInfo.dateDelivery" class="info-item">
					<text class="info-label">发货时间：</text>
					<text class="info-value">{{ orderDetail.orderInfo.dateDelivery }}</text>
				</view>
				<!-- <view v-if="orderDetail.orderInfo.dateClose" class="info-item">
					<text class="info-label">完成时间：</text>
					<text class="info-value">{{ orderDetail.orderInfo.dateClose }}</text>
				</view> -->
				<view class="info-item total-item">
					<text class="info-label">总计：</text>
					<text class="info-value total-value">{{ orderDetail.orderInfo.score }}积分</text>
				</view>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view v-if="showBottomActions" class="bottom-actions">
			<!-- 已发货状态：确认收货按钮 -->
			<button 
				v-if="orderDetail.orderInfo.status == 2" 
				class="action-btn confirm-btn"
				@click="confirmReceive"
			>
				确认收货
			</button>
			
			<!-- 待评价状态：评价按钮 -->
			<button 
				v-if="orderDetail.orderInfo.status == 3" 
				class="action-btn evaluate-btn"
				@click="evaluateOrder"
			>
				评价订单
			</button>
		</view>

		<!-- 物流详情弹出层 -->
		<uni-popup ref="logisticsPopup" type="bottom" background-color="#fff" border-radius="20rpx 20rpx 0 0">
			<view class="logistics-popup">
				<view class="popup-header">
					<text class="popup-title">包裹详情</text>
					<view class="close-btn" @click="closeLogisticsPopup">
						<text class="close-icon">✕</text>
					</view>
				</view>
				
				<view v-if="selectedLogistics" class="popup-content">
					<!-- 包裹基本信息 -->
					<view class="package-info">
						<view class="info-row">
							<text class="label">物流公司：</text>
							<text class="value">{{ selectedLogistics.shipperName }}</text>
						</view>
						<view class="info-row">
							<text class="label">运单号：</text>
							<text class="value">{{ selectedLogistics.trackingNumber }}</text>
						</view>
					</view>

					<!-- 包裹商品信息 -->
					<view v-if="packageGoods.length > 0" class="package-goods-section">
						<view class="section-title">
							<text class="title-text">📦 包裹商品</text>
						</view>
						<view class="goods-list">
							<view v-for="(item, index) in packageGoods" :key="index" class="goods-item">
								<view class="goods-image">
									<image :src="item.pic" class="product-image" mode="aspectFill"></image>
								</view>
								<view class="goods-info">
									<text class="goods-name">{{ item.goodsName }}</text>
									<view class="goods-quantity">
										<text class="quantity-label">数量：</text>
										<text class="quantity-value">x{{ item.number }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 物流轨迹 -->
					<view v-if="packageTraces.length > 0" class="package-traces-section">
						<view class="section-title">
							<text class="title-text">🚚 物流轨迹</text>
						</view>
						<view class="traces-content">
							<uni-steps 
								:options="packageTraces" 
								direction="column" 
								:active="packageTraces.length - 1"
								active-color="#30BCB7"
							></uni-steps>
						</view>
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
				orderId: undefined,
				orderDetail: undefined,
				logisticsSteps: [], // 物流轨迹
				orderLogs: [], // 订单日志
				selectedLogistics: null, // 选中的物流包裹信息
				packageGoods: [], // 当前包裹的商品信息
				packageTraces: [], // 当前包裹的物流轨迹
			}
		},
		
		computed: {
			// 是否显示底部操作按钮
			showBottomActions() {
				if (!this.orderDetail) return false
				const status = this.orderDetail.orderInfo.status
				return status == 2 // 已发货或待评价  || status == 3
			}
		},
		
		onLoad(options) {
			if (options.id) {
				this.orderId = options.id
				this.getOrderDetail()
			}
		},
		
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.getOrderDetail()
		},
		
		methods: {
			/**
			 * 获取订单详情
			 * 文档地址：https://www.yuque.com/apifm/nu0f75/oamel8
			 */
			async getOrderDetail() {
				uni.showLoading({
					title: '加载中...'
				})
				const res = await this.$wxapi.orderDetail(this.token, this.orderId)
				uni.hideLoading()
				
				if(res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
					return
				}
				
				this.orderDetail = res.data
				
				// 处理物流轨迹数据
				// this.formatLogisticsData()
				
				// 处理订单日志数据
				this.formatOrderLogs()
			},
			
			/**
			 * 格式化物流轨迹数据
			 */
			// formatLogisticsData() {
			// 	// 这里需要根据实际返回的物流数据格式进行处理
			// 	// 假设返回数据中有logistics字段包含物流信息
			// 	if (this.orderDetail.logistics && this.orderDetail.logistics.traces) {
			// 		this.logisticsSteps = this.orderDetail.logistics.traces.map(trace => ({
			// 			title: trace.title || '物流更新',
			// 			desc: trace.time + ' ' + trace.desc
			// 		}))
			// 	}
			// },
			
			/**
			 * 格式化订单日志数据
			 */
			formatOrderLogs() {
				// 处理订单日志数据
				if (this.orderDetail.logs && this.orderDetail.logs.length > 0) {
					this.orderLogs = this.orderDetail.logs.map(log => ({
						title: log.typeStr,
						desc: log.dateAdd + ' ' + (log.remark || '')
					}))
				}
			},
			
			/**
			 * 获取状态样式类
			 */
			getStatusClass(status) {
				const statusMap = {
					'0': 'status-pending',    // 待支付
					'1': 'status-shipping',   // 待发货
					'2': 'status-shipping',   // 待收货
					'3': 'status-completed',   // 待评价 status-evaluate
					'4': 'status-completed',  // 已完成
					'-1': 'status-cancelled'  // 已取消
				}
				return statusMap[status] || 'status-default'
			},
			
			/**
			 * 获取状态图标
			 */
			getStatusEmoji(status) {
				const emojiMap = {
					'0': '⏰',  // 待支付
					'1': '🚚',  // 待发货
					'2': '🚚',  // 待收货
					'3': '✅',  // 待评价 ⭐
					'4': '✅',  // 已完成
					'-1': '❌' // 已取消
				}
				return emojiMap[status] || '📦'
			},
			
			/**
			 * 获取状态文本
			 */
			getStatusText(status) {
				const statusMap = {
					'0': '待支付',
					'1': '待发货',
					'2': '待收货',
					'3': '已完成', // 待评价
					'4': '已完成',
					'-1': '已取消'
				}
				return statusMap[status] || '未知状态'
			},
			
			/**
			 * 获取状态描述
			 */
			getStatusDesc(status) {
				const descMap = {
					'0': '情况支付订单，超时将自动取消',
					'1': '商家正在准备您的商品',
					// '1': '商品正在配送途中',
					'2': '商品正在配送途中，请耐心等待',
					'3': '感谢您的购买', // 订单已完成，请对商品进行评价
					'4': '感谢您的购买',
					'-1': '订单已取消'
				}
				return descMap[status] || ''
			},
			
			/**
			 * 确认收货
			 * https://www.yuque.com/apifm/nu0f75/vy8eai
			 */
			confirmReceive() {
				uni.showModal({
					content: '确认已收到商品吗？',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '处理中...'
							})
							
							// 调用确认收货接口
							const result = await this.$wxapi.orderDelivery(this.token, this.orderId)
							
							uni.hideLoading()
							
							if (result.code == 0) {
								uni.showToast({
									title: '确认收货成功',
									icon: 'success'
								})
								// 刷新订单详情
								this.getOrderDetail()
							} else {
								uni.showToast({
									title: result.msg || '操作失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			
			/**
			 * 评价订单
			 */
			evaluateOrder() {
				uni.showToast({
					title: '评价功能开发中',
					icon: 'none'
				})
			},

			/**
			 * 显示物流详情弹出层
			 */
			showLogisticsDetail(logisticsItem) {
				this.selectedLogistics = logisticsItem
				// 查找该包裹对应的商品信息
				this.packageGoods = []
				if (this.orderDetail.orderLogisticsShipperLogs && this.orderDetail.orderLogisticsShipperLogs.length > 0) {
					this.packageGoods = this.orderDetail.orderLogisticsShipperLogs.filter(log => 
						log.logisticsShipperId === logisticsItem.id
					)
				}
				
				// 处理物流轨迹数据
				this.packageTraces = []
				if (logisticsItem.traces && logisticsItem.traces.length > 0) {
					this.packageTraces = JSON.parse(logisticsItem.traces).map(trace => ({
						title: trace.AcceptStation,
						desc: trace.AcceptTime
					}))
				}
				
				// 打开弹出层
				this.$refs.logisticsPopup.open()
			},

			/**
			 * 关闭物流详情弹出层
			 */
			closeLogisticsPopup() {
				this.$refs.logisticsPopup.close()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.order-detail-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
		padding-bottom: 120rpx; // 为底部按钮留出空间
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
				top: 200rpx;
				left: -80rpx;
			}
		}
	}
	
	/* 订单状态区域 */
	.status-section {
		position: relative;
		z-index: 1;
		margin: 32rpx 32rpx 24rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 48rpx 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		
		.status-info {
			display: flex;
			align-items: center;
			
			.status-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 24rpx;
				position: relative;
				
				&::before {
					content: '';
					position: absolute;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					animation: statusPulse 2s infinite ease-in-out;
				}
				
				&.status-pending {
					background: rgba(255, 193, 7, 0.1);
					&::before {
						background: rgba(255, 193, 7, 0.3);
					}
				}
				
				&.status-shipping {
					background: rgba(48, 188, 183, 0.1);
					&::before {
						background: rgba(48, 188, 183, 0.3);
					}
				}
				
				&.status-evaluate {
					background: rgba(255, 152, 0, 0.1);
					&::before {
						background: rgba(255, 152, 0, 0.3);
					}
				}
				
				&.status-completed {
					background: rgba(76, 175, 80, 0.1);
					&::before {
						background: rgba(76, 175, 80, 0.3);
					}
				}
				
				&.status-cancelled {
					background: rgba(154, 154, 154, 0.1);
					&::before {
						background: rgba(154, 154, 154, 0.3);
					}
				}
				
				.status-emoji {
					font-size: 40rpx;
					z-index: 1;
				}
			}
			
			.status-content {
				flex: 1;
				
				.status-title {
					display: block;
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
				}
				
				.status-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 40rpx;
				}
			}
		}
	}
	
	/* 通用区块样式 */
	.logistics-section,
	.logs-section,
	.goods-section,
	.address-section,
	.order-info-section {
		position: relative;
		z-index: 1;
		background: #FFFFFF;
		border-radius: 20rpx;
		margin: 0 32rpx 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	
	/* 区块头部 */
	.section-header {
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #F5F5F5;
		
		.header-icon {
			width: 48rpx;
			height: 48rpx;
			background: linear-gradient(135deg, #30BCB7, #49CCAD);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 16rpx;
			
			.icon-text {
				font-size: 20rpx;
			}
		}
		
		.section-title {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
		}
	}
	
	/* 物流轨迹和日志内容 */
	.logistics-content,
	.logs-content {
		padding: 32rpx;
	}
	
	/* 商品列表 */
	.goods-list {
		padding: 0 32rpx 32rpx;
		
		.goods-item {
			display: flex;
			align-items: flex-start;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #F5F5F5;
			
			&:last-child {
				border-bottom: none;
			}
			
			.goods-image {
				flex-shrink: 0;
				width: 120rpx;
				height: 120rpx;
				border-radius: 16rpx;
				overflow: hidden;
				margin-right: 24rpx;
				
				.product-image {
					width: 100%;
					height: 100%;
				}
			}
			
			.goods-info {
				flex: 1;
				
				.goods-name {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					line-height: 40rpx;
					margin-bottom: 12rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					overflow: hidden;
				}
				
				.goods-price-info {
					display: flex;
					align-items: center;
					gap: 12rpx;
					margin-bottom: 12rpx;
					
					.score-price {
						font-size: 30rpx;
						color: #30BCB7;
						font-weight: 600;
					}
					
					.original-price {
						font-size: 24rpx;
						color: #999;
						text-decoration: line-through;
					}
				}
				
				.goods-quantity {
					display: flex;
					align-items: center;
					
					.quantity-label {
						font-size: 26rpx;
						color: #666;
					}
					
					.quantity-value {
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
					}
				}
			}
		}
	}
	
	/* 收货地址内容 */
	.address-content {
		padding: 0 32rpx 32rpx;
		
		.recipient-info {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;
			
			.recipient-name {
				font-size: 30rpx;
				color: #333;
				font-weight: 600;
				margin-right: 24rpx;
			}
			
			.recipient-phone {
				font-size: 26rpx;
				color: #666;
			}
		}
		
		.address-detail {
			font-size: 28rpx;
			color: #666;
			line-height: 40rpx;
		}
	}
	
	/* 订单信息内容 */
	.order-info-content {
		padding: 0 32rpx 32rpx;
		
		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16rpx 0;
			border-bottom: 1rpx solid #F8F9FA;
			
			&:last-child {
				border-bottom: none;
			}
			
			&.total-item {
				border-top: 2rpx solid #F5F5F5;
				margin-top: 16rpx;
				padding-top: 24rpx;
			}
			
			.info-label {
				font-size: 28rpx;
				color: #666;
			}
			
			.info-value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				
				&.total-value {
					color: #30BCB7;
					font-size: 32rpx;
					font-weight: 600;
				}
			}
		}
	}
	
	/* 底部操作按钮 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFFFFF;
		border-top: 1rpx solid #F0F0F0;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
		padding: 24rpx 32rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		z-index: 999;
		
		.action-btn {
			width: 100%;
			height: 88rpx;
			border-radius: 44rpx;
			border: none;
			font-size: 32rpx;
			font-weight: 600;
			transition: all 0.2s ease;
			
			&.confirm-btn {
				background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
				color: #FFFFFF;
				
				&:active {
					transform: scale(0.98);
				}
			}
			
			&.evaluate-btn {
				background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
				color: #FFFFFF;
				
				&:active {
					transform: scale(0.98);
				}
			}
		}
	}
	
	/* 动画效果 */
	@keyframes statusPulse {
		0%, 100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.1);
		}
	}

	/* 物流详情弹出层样式 */
	.logistics-popup {
		max-height: 80vh;
		background: #FFFFFF;
		border-radius: 20rpx 20rpx 0 0;
		padding-bottom: 200rpx;
		
		.popup-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx 32rpx 24rpx;
			border-bottom: 1rpx solid #F5F5F5;
			position: sticky;
			top: 0;
			background: #FFFFFF;
			z-index: 10;
			
			.popup-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.close-btn {
				width: 48rpx;
				height: 48rpx;
				border-radius: 50%;
				background: #F5F5F5;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s ease;
				
				&:active {
					background: #E8E8E8;
					transform: scale(0.95);
				}
				
				.close-icon {
					font-size: 24rpx;
					color: #666;
				}
			}
		}
		
		.popup-content {
			padding: 0 0 32rpx 0;
			max-height: calc(80vh - 100rpx);
			overflow-y: scroll;
			
			.package-info {
				padding: 32rpx 32rpx 24rpx;
				border-bottom: 1rpx solid #F5F5F5;
				
				.info-row {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.label {
						font-size: 28rpx;
						color: #666;
						min-width: 160rpx;
					}
					
					.value {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
						flex: 1;
					}
				}
			}
			
			.package-goods-section,
			.package-traces-section {
				padding: 32rpx 32rpx 0;
				
				.section-title {
					margin-bottom: 24rpx;
					
					.title-text {
						font-size: 30rpx;
						font-weight: 600;
						color: #333;
					}
				}
				
				.goods-list {
					.goods-item {
						display: flex;
						align-items: flex-start;
						padding: 20rpx 0;
						border-bottom: 1rpx solid #F8F9FA;
						
						&:last-child {
							border-bottom: none;
						}
						
						.goods-image {
							flex-shrink: 0;
							width: 100rpx;
							height: 100rpx;
							border-radius: 12rpx;
							overflow: hidden;
							margin-right: 20rpx;
							
							.product-image {
								width: 100%;
								height: 100%;
							}
						}
						
						.goods-info {
							flex: 1;
							
							.goods-name {
								font-size: 26rpx;
								color: #333;
								font-weight: 500;
								line-height: 36rpx;
								margin-bottom: 8rpx;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;
								line-clamp: 2;
								overflow: hidden;
							}
							
							.goods-quantity {
								display: flex;
								align-items: center;
								
								.quantity-label {
									font-size: 24rpx;
									color: #666;
								}
								
								.quantity-value {
									font-size: 24rpx;
									color: #30BCB7;
									font-weight: 600;
								}
							}
						}
					}
				}
				
				.traces-content {
					background: #FAFBFC;
					border-radius: 16rpx;
					padding: 24rpx;
				}
			}
		}
	}
</style>