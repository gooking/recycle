<template>
	<view v-if="loadingEnd" class="sign-page">
		<!-- 顶部签到卡片 -->
		<view class="sign-header">
			<view class="sign-bg"></view>
			<view class="sign-content">
				<view class="sign-title">每日签到</view>
				<view class="sign-subtitle">连续签到，获得更多积分奖励</view>
				
				<!-- 7天签到周期 -->
				<view class="sign-week">
					<view 
						v-for="(day, index) in weekDays" 
						:key="index"
						class="day-item"
						:class="{ 
							'signed': day.signed
						}"
					>
						<view class="day-number">第{{index + 1}}天</view>
						<view class="day-reward">+{{day.score}}积分</view>
						<view class="day-status">
							<uni-icons v-if="day.signed" type="gift-filled" size="48rpx" color="#4CAF50"></uni-icons>
							<uni-icons v-else type="gift-filled" size="48rpx" color="#d7d7d7"></uni-icons>
						</view>
					</view>
				</view>
				
				<!-- 签到按钮 -->
				<view class="sign-button-wrapper">
					<button 
						class="sign-button" 
						:class="{ 'signed': todaySigned, 'can-sign': !todaySigned }"
						@click="handleSign"
					>
						<view v-if="todaySigned" class="signed-text">
							<text class="sign-emoji">✨</text>
							<text>今日已签到</text>
						</view>
						<view v-else class="sign-text">
							<text class="sign-emoji">✨</text>
							<text>点击签到</text>
						</view>
					</button>
				</view>
				
				<!-- 连续签到天数 -->
				<view class="continuous-info">
					<text>已连续签到 </text>
					<text class="continuous-days">{{continuousDays}}</text>
					<text> 天</text>
				</view>
			</view>
		</view>
		
		<!-- 签到说明 -->
		<view class="sign-rules">
			<view class="rules-title">签到规则</view>
			<view class="rules-content">
				<view class="rule-item">• 每日签到可获得积分奖励</view>
				<view class="rule-item">• 连续签到7天为一个周期</view>
				<view class="rule-item">• 连续签到天数越多，奖励积分越多</view>
				<view class="rule-item">• 中断签到后重新开始计算连续天数</view>
			</view>
		</view>
		
		<!-- 签到记录 -->
		<view class="sign-records">
			<view class="records-title">签到记录</view>
			<view class="records-list">
				<view 
					v-for="(record, index) in signRecords" 
					:key="index"
					class="record-item"
				>
					<view class="record-date">{{record.dateStr}}</view>
					<view class="record-status">连续签到</view>
					<view class="record-score">{{record.continuous}}</view>
					<view class="record-status">天</view>
				</view>
				
				<view v-if="!signRecords.length" class="empty-records">
					<image src="/static/images/empty.png" class="empty-icon" mode="widthFix"></image>
					<text class="empty-text">暂无签到记录</text>
				</view>
			</view>
		</view>
		
		<!-- 签到成功弹窗 -->
		<view v-if="showSuccess" class="success-modal" @click="hideSuccess">
			<view class="success-content" @click.stop>
				<view class="success-icon">🎉</view>
				<view class="success-title">签到成功！</view>
				<view class="success-reward">已连续签到 {{signReward}} 天</view>
				<button class="success-btn" @click="hideSuccess">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	export default {
		data() {
			return {
				loadingEnd: false,
				// 签到状态
				todaySigned: false,
				continuousDays: 0,
				// 7天签到数据
				weekDays: [],
				// 签到记录
				signRecords: [],
				page: 1,
				// 签到成功弹窗
				showSuccess: false,
				signReward: 0
			}
		},
		
		onLoad() {
			this.initData()
		},
		
		onShow() {
		},
		
		onReachBottom() {
			this.page++
			this.getSignRecords()
		},
		
		onPullDownRefresh() {
			this.page = 1
			this.initData()
			uni.stopPullDownRefresh()
		},
		
		methods: {
			// 初始化数据
			async initData() {
				uni.showLoading({ title: '' })
				await this.getSignRecords()
				await this.checkSignStatus()
				await this.getSignConfig()
				this.updateWeekDaysStatus()
				uni.hideLoading()
				this.loadingEnd = true
			},
			
			// 获取签到配置（7天积分）
			async getSignConfig() {
				// https://www.yuque.com/apifm/nu0f75/pg4seb
				const res = await this.$wxapi.scoreSignRules()
				if (res.code == 0) {
					this.weekDays = res.data.map((item, index) => ({
						day: item.continuous,
						score: item.score,
						signed: false
					}))
				}
			},
			
			// 检查今日签到状态
			async checkSignStatus() {
				// https://www.yuque.com/apifm/nu0f75/hbezwt
				const res = await this.$wxapi.scoreTodaySignedInfo(this.token)
				if (res.code === 0) {
					this.todaySigned = true
					this.continuousDays = res.data.continuous
				}
			},
			
			// 更新7天签到状态
			updateWeekDaysStatus() {
				this.weekDays.forEach(day => {
					// 根据连续签到天数标记已签到状态
					if (this.continuousDays >= day.day) {
						day.signed = true
					}
				})
			},
			
			// 执行签到
			async handleSign() {
				if(this.todaySigned) {
					return
				}
				// https://www.yuque.com/apifm/nu0f75/dqdgem
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.scoreSign(this.token)
				uni.hideLoading()
				if (res.code === 0) {
					this.signReward = res.data.continuous
					this.todaySigned = true
					this.continuousDays = res.data.continuous
					this.updateWeekDaysStatus()
					this.showSuccess = true
					// 播放签到成功音效
					this.playSignSound()
					this.page = 1
					this.getSignRecords()
				} else {
					uni.showToast({
						title: res.msg || '签到失败',
						icon: 'none'
					})
				}
			},
			
			// 获取签到记录
			async getSignRecords() {
				https://www.yuque.com/apifm/nu0f75/scftkq
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.scoreSignLogs({
					token: this.token,
					page: this.page
				})
				uni.hideLoading()
				if (res.code == 0) {
					const records = res.data.result.map(item => ({
						dateStr: dayjs(item.dateAdd).format('YYYY-MM-DD'),
						score: item.score,
						date: new Date(item.dateAdd),
						continuous: item.continuous,
					}))
					if (this.page == 1) {
						this.signRecords = records
						// 设置已连续签到多少天
						if(records[0].dateStr == dayjs().subtract(1, 'day').format('YYYY-MM-DD')) {
							this.continuousDays = records[0].continuous
						}
						this.updateWeekDaysStatus()
					} else {
						this.signRecords.push(...records)
					}
				}
			},
			
			// 隐藏成功弹窗
			hideSuccess() {
				this.showSuccess = false
			},
			
			// 播放签到音效
			playSignSound() {
				// 在真实项目中可以添加音效文件
				try {
					uni.vibrate({
						duration: 100
					})
				} catch (error) {
					console.log('振动失败:', error)
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.sign-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding-bottom: 20rpx;
		/* #ifdef MP-WEIXIN */
		padding-top: 64rpx;
		/* #endif */
	}
	
	.sign-header {
		position: relative;
		padding: 40rpx 30rpx 60rpx;
		overflow: hidden;
		
		.sign-bg {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			opacity: 0.9;
		}
		
		.sign-content {
			position: relative;
			z-index: 2;
		}
		
		.sign-title {
			color: #fff;
			font-size: 48rpx;
			font-weight: bold;
			text-align: center;
			margin-bottom: 10rpx;
		}
		
		.sign-subtitle {
			color: rgba(255, 255, 255, 0.8);
			font-size: 28rpx;
			text-align: center;
			margin-bottom: 60rpx;
		}
	}
	
	.sign-week {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 32rpx;
		
		.day-item {
			width: 138rpx;
			height: 138rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 20rpx 10rpx;
			margin: 0 5rpx;
			margin-bottom: 16rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 20rpx;
			backdrop-filter: blur(10rpx);
			transition: all 0.3s ease;
			
			&.signed {
				background: rgba(255, 255, 255, 0.2);
				transform: scale(1.05);
			}
			
			&.today {
				background: rgba(255, 215, 0, 0.3);
				border: 2rpx solid rgba(255, 215, 0, 0.8);
			}
			
			&.can-sign {
				animation: pulse 2s infinite;
			}
			
			.day-number {
				color: #fff;
				font-size: 24rpx;
				margin-bottom: 10rpx;
			}
			
			.day-reward {
				color: #FFD700;
				font-size: 22rpx;
				font-weight: bold;
				margin-bottom: 15rpx;
			}
			
			.day-status {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
	
	@keyframes pulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}
	
	.sign-button-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 30rpx;
		
		.sign-button {
			width: 300rpx;
			height: 100rpx;
			border-radius: 50rpx;
			border: none;
			font-size: 32rpx;
			font-weight: bold;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
			
			&.can-sign {
				background: linear-gradient(45deg, #FF6B6B, #FF8E53);
				color: #fff;
				box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
				
				&:active {
					transform: scale(0.95);
				}
			}
			
			&.signed {
				background: rgba(255, 255, 255, 0.2);
				color: #fff;
				opacity: 0.7;
			}
			
			.signed-text, .sign-text {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 10rpx;
			}
			
			.sign-emoji {
				font-size: 36rpx;
			}
		}
	}
	
	.continuous-info {
		text-align: center;
		color: rgba(255, 255, 255, 0.9);
		font-size: 28rpx;
		
		.continuous-days {
			color: #FFD700;
			font-size: 36rpx;
			font-weight: bold;
		}
	}
	
	.sign-rules {
		margin: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		
		.rules-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.rules-content {
			.rule-item {
				color: #666;
				font-size: 28rpx;
				line-height: 1.6;
				margin-bottom: 10rpx;
			}
		}
	}
	
	.sign-records {
		margin: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		
		.records-title {
			padding: 30rpx;
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			border-bottom: 1rpx solid #f0f0f0;
		}
		
		.records-list {
			.record-item {
				display: flex;
				align-items: center;
				padding: 25rpx 30rpx;
				border-bottom: 1rpx solid #f0f0f0;
				
				&:last-child {
					border-bottom: none;
				}
				
				.record-date {
					flex: 1;
					color: #333;
					font-size: 28rpx;
				}
				
				.record-score {
					color: #FF6B6B;
					font-size: 28rpx;
					font-weight: bold;
				}
				
				.record-status {
					color: #4CAF50;
					font-size: 24rpx;
				}
			}
			
			.empty-records {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 80rpx 30rpx;
				
				.empty-icon {
					width: 120rpx;
					height: 120rpx;
					opacity: 0.5;
					margin-bottom: 20rpx;
				}
				
				.empty-text {
					color: #999;
					font-size: 28rpx;
				}
			}
			
			.no-more {
				text-align: center;
				padding: 30rpx;
				color: #999;
				font-size: 26rpx;
			}
		}
	}
	
	.success-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		
		.success-content {
			background: #fff;
			border-radius: 20rpx;
			padding: 60rpx 40rpx;
			text-align: center;
			min-width: 500rpx;
			
			.success-icon {
				font-size: 80rpx;
				margin-bottom: 20rpx;
			}
			
			.success-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 15rpx;
			}
			
			.success-reward {
				font-size: 32rpx;
				color: #FF6B6B;
				font-weight: bold;
				margin-bottom: 40rpx;
			}
			
			.success-btn {
				width: 200rpx;
				height: 80rpx;
				background: linear-gradient(45deg, #667eea, #764ba2);
				color: #fff;
				border: none;
				border-radius: 40rpx;
				font-size: 28rpx;
			}
		}
	}
</style>