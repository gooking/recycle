<template>
	<view class="course-index">
		<!-- 头部装饰区域 -->
		<view class="header-decoration">
			<view class="decoration-circle circle1"></view>
			<view class="decoration-circle circle2"></view>
			<view class="decoration-circle circle3"></view>
		</view>
		
		<!-- 主要内容区域 -->
		<view class="content-section">
			<!-- Banner轮播图 -->
			<view class="banner-section">
				<swiper 
					class="banner-swiper" 
					:indicator-dots="true" 
					:autoplay="true" 
					:interval="3000" 
					:duration="500"
					circular
					indicator-color="rgba(255,255,255,0.5)"
					indicator-active-color="#30BCB7"
				>
					<swiper-item v-for="(banner, index) in bannerList" :key="index" @click="handleBannerClick(banner)">
						<view class="banner-item">
							<image :src="banner.picUrl" class="banner-image" mode="aspectFill"></image>
						</view>
					</swiper-item>
				</swiper>
			</view>
			
			<!-- 课程列表 -->
			<view class="course-section">
				<view class="section-title">
					<view class="title-left">
						<text class="title-text">精品课程</text>
						<view class="title-decoration"></view>
					</view>
					<view class="my-records-btn" @click="goToMyRecords">
						<uni-icons type="list" size="32rpx" color="#FFFFFF"></uni-icons>
						<text class="records-text">我的报名记录</text>
					</view>
				</view>
				
				<page-box-empty v-if="!list || list.length == 0" title="暂无课程" subTitle="精彩课程即将上线~"></page-box-empty>
				
				<view class="course-list">
					<view 
						v-for="(course, index) in list" 
						:key="course.id || index" 
						class="course-item"
					>
						<view class="course-image-container">
							<image :src="course.pic" class="course-image" mode="widthFix"></image>
							<view class="course-tag">
								<text class="tag-text">{{ course.type == 0 ? '线上' : '线下课' }}</text>
							</view>
						</view>
						
						<view class="course-info">
							<text class="course-title">{{ course.name }}</text>
							<text class="course-desc">{{course.dayStart }} - {{course.dayEnd }}</text>
							
							<view class="course-meta">
								<view class="meta-item">
									<uni-icons type="person" size="24rpx" color="#999"></uni-icons>
									<text class="meta-text">{{ course.numberBuy || 0 }}人购买</text>
								</view>
								<view class="meta-item">
									<uni-icons type="calendar" size="24rpx" color="#999"></uni-icons>
									<text class="meta-text">{{ course.minutes }}分钟</text>
								</view>
							</view>
							
							<view class="course-footer">
								<view class="price-container">
									<text v-if="course.price" class="price-symbol">¥</text>
									<text class="price-value">{{ course.price || '免费' }}</text>
									<text v-if="course.originalPrice" class="original-price">¥{{ course.originalPrice }}</text>
								</view>
								<button 
									class="enroll-btn" 
									@click.stop="handleEnroll(course)"
								>
									<uni-icons type="checkmarkempty" size="28rpx" color="#fff"></uni-icons>
									<text class="btn-text">立即报名</text>
								</button>
							</view>
						</view>
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
				list: undefined, // 课程列表
				bannerList: [], // 轮播图数据
			}
		},
		
		onLoad() {
			this.loadBannerList()
			this.courseInfoListV2()
		},
		onShareAppMessage() {
		    return {
		      title: '课程中心',
		      path: '/sub_packages/course/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		onShareTimeline() {
		    return {
		      title: '课程中心',
		      query: 'inviter_id=' + (this.uid || ''),
		      imageUrl: this.sysconfigMap.share_pic
		    }
		},
		methods: {
			/**
			 * 跳转到我的报名记录
			 */
			goToMyRecords() {
				uni.navigateTo({
					url: 'my'
				})
			},
			
			/**
			 * 加载Banner列表
			 * https://www.yuque.com/apifm/nu0f75/ms21ki
			 */
			async loadBannerList() {
				const res = await this.$wxapi.banners({
					type: 'course' // 课程banner
				})
				if (res.code == 0) {
					this.bannerList = res.data
				}
			},
			
			async courseInfoListV2() {
				uni.showLoading({
					title: ''
				})
				// https://www.yuque.com/apifm/nu0f75/avtp284w814mw8mp
				const res = await this.$wxapi.courseInfoListV2()
				uni.hideLoading()
				if (res.code == 0) {
					this.list = res.data.result
				}
			},
			
			/**
			 * Banner点击处理
			 */
			handleBannerClick(banner) {
				// todo
			},
			
			/**
			 * 课程报名处理
			 */
			handleEnroll(course) {
				uni.navigateTo({
					url: 'detail?id=' + course.id
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.course-index {
		min-height: 100vh;
		background: linear-gradient(180deg, #F2F7F9 0%, #FFFFFF 40%);
		position: relative;
		overflow: hidden;
		padding-bottom: 48rpx;
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
	.content-section {
		padding: 32rpx 32rpx 0;
		padding-top: calc(32rpx + env(safe-area-inset-top));
		position: relative;
		z-index: 1;
	}
	
	/* Banner轮播图 */
	.banner-section {
		margin-bottom: 48rpx;
		
		.banner-swiper {
			height: 320rpx;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
			
			.banner-item {
				width: 100%;
				height: 100%;
				
				.banner-image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
	
	/* 课程列表区域 */
	.course-section {
		margin-bottom: 48rpx;
		
		.course-list {
			display: flex;
			flex-direction: column;
			gap: 32rpx;
			
			.course-item {
				background: #FFFFFF;
				border-radius: 24rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				
				&:active {
					transform: translateY(-4rpx);
					box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
				}
				
				.course-image-container {
					position: relative;
					width: 100%;
					height: 360rpx;
					
					.course-image {
						width: 100%;
						height: 0;
					}
					
					.course-tag {
						position: absolute;
						top: 24rpx;
						left: 24rpx;
						background: linear-gradient(135deg, #30BCB7, #49CCAD);
						border-radius: 12rpx;
						padding: 8rpx 20rpx;
						box-shadow: 0 4rpx 12rpx rgba(48, 188, 183, 0.3);
						
						.tag-text {
							font-size: 24rpx;
							color: #FFFFFF;
							font-weight: 500;
						}
					}
				}
				
				.course-info {
					padding: 32rpx;
					
					.course-title {
						font-size: 36rpx;
						color: #333;
						font-weight: 600;
						line-height: 52rpx;
						margin-bottom: 16rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						overflow: hidden;
					}
					
					.course-desc {
						font-size: 28rpx;
						color: #666;
						line-height: 40rpx;
						margin-bottom: 24rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						overflow: hidden;
					}
					
					.course-meta {
						display: flex;
						align-items: center;
						gap: 32rpx;
						margin-bottom: 32rpx;
						
						.meta-item {
							display: flex;
							align-items: baseline;
							
							.meta-text {
								font-size: 24rpx;
								color: #999;
								padding-left: 8rpx;
							}
						}
					}
					
					.course-footer {
						display: flex;
						align-items: center;
						justify-content: flex-end;
						
						.price-container {
							flex: 1;
							display: flex;
							align-items: baseline;
							gap: 8rpx;
							
							.price-symbol {
								font-size: 28rpx;
								color: #FF6B6B;
								font-weight: 600;
							}
							
							.price-value {
								font-size: 44rpx;
								color: #FF6B6B;
								font-weight: 700;
								line-height: 1;
							}
							
							.original-price {
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
								margin-left: 8rpx;
							}
						}
						
						.enroll-btn {
							min-width: 200rpx;
							height: 72rpx;
							background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
							border-radius: 36rpx;
							border: none;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 8rpx;
							padding: 0 32rpx;
							box-shadow: 0 4rpx 16rpx rgba(48, 188, 183, 0.3);
							transition: all 0.2s ease;
							
							&:active {
								transform: scale(0.95);
								box-shadow: 0 6rpx 20rpx rgba(48, 188, 183, 0.4);
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
				font-size: 40rpx;
				color: #333;
				font-weight: 700;
				margin-right: 16rpx;
			}
			
			.title-decoration {
				width: 6rpx;
				height: 36rpx;
				background: linear-gradient(135deg, #30BCB7, #49CCAD);
				border-radius: 3rpx;
			}
		}
		
		.my-records-btn {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 12rpx 24rpx;
			background: linear-gradient(135deg, #30BCB7 0%, #49CCAD 100%);
			border-radius: 32rpx;
			transition: all 0.3s ease;
			box-shadow: 0 4rpx 12rpx rgba(48, 188, 183, 0.25);
			
			&:active {
				background: linear-gradient(135deg, #2AA9A4 0%, #3EBB9D 100%);
				transform: scale(0.95);
				box-shadow: 0 2rpx 8rpx rgba(48, 188, 183, 0.3);
			}
			
			.records-text {
				font-size: 26rpx;
				color: #FFFFFF;
				font-weight: 500;
			}
		}
	}
</style>