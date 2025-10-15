<template>
	<view class="page">
		<view class="search-box">
			<!-- #ifdef H5 -->
			<view style="height: 64rpx;"></view>
			<!-- #endif -->
			<!-- 使用自定义头部组件 -->
			<custom-header></custom-header>
			<view class="search-container">
				<view class="address-input-container">
					<view class="address-input" @click="selectAddress">
						<view class="recycle-icon">
							<text class="recycle-text">收</text>
						</view>
						<text class="input-placeholder">{{ address ? address.address : '请填写回收地址/电话' }}</text>
						<uni-icons type="right" size="32rpx" color="#CBCBCB"></uni-icons>
					</view>
				</view>
				<view class="serviceList">
					<view v-for="(item,index) in serviceList" :key="item" class="item">
						<uni-icons type="checkbox" size="32rpx" color="#CBCBCB"></uni-icons>
						<text>{{ item }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="container">
			<div class="tab-container" :class="tabIndex == 1 ? 'c2active' : ''">
				<div class="tab c1" @click="tabIndex = 0">预约上门</div>
				<div class="tab c2" @click="tabIndex = 1">到店回收</div>
			</div>
			<view class="form">
				<uni-forms>
					<uni-forms-item v-if="tabIndex == 0" label="期望上门时间" label-width="auto" required>
						<uni-datetime-picker type="datetime" return-type="string" :start="curTime" v-model="datetime"/>
					</uni-forms-item>
					<template v-else>
						<uni-forms-item label="选择门店" label-width="auto" required></uni-forms-item>
						<uni-list v-if="shopInfo" :border="false">
							<uni-list-item
								:title="shopInfo.name"
								:note="shopInfo.address"
								rightText="更换"
								showArrow
								clickable
								to="/pages/index/shop"
							></uni-list-item>
						</uni-list>
						<uni-list v-else :border="false">
							<uni-list-item
								title="请选择门店"
								rightText="选择"
								showArrow
								clickable
								to="/pages/index/shop"
							></uni-list-item>
						</uni-list>
					</template>
					
					<view class="divider"></view>
					<uni-forms-item label="废品类型（多选）" label-width="auto" required></uni-forms-item>
					<view class="recycle-types">
						<view v-for="(item, index) in recycleTypes" :key="item.id" class="type-item"
							:class="{ selected: selectedTypes.includes(item.id) }" @click="toggleType(item.id)">
							<text class="type-name"
								:class="{ selected: selectedTypes.includes(item.id) }">{{ item.name }}</text>
							<text class="type-price"
								:class="{ selected: selectedTypes.includes(item.id) }">{{ item.minPrice }}元/公斤</text>
						</view>
					</view>
					<uni-forms-item label="预计总量" label-width="auto" required>
						<uni-data-select v-model="weight" :localdata="weightList"></uni-data-select>
					</uni-forms-item>
					<view class="divider"></view>
					<uni-forms-item label="上传废品图片" label-width="auto" required></uni-forms-item>
					<view style="padding-bottom: 32rpx;">
						<uni-file-picker
							mode="grid"
							:auto-upload="false"
							@select="afterPicRead"
							@delete="afterPicDel"
						/>
					</view>
					<uni-forms-item label="废品描述" label-width="auto" required></uni-forms-item>
					<uni-easyinput type="textarea" v-model="description" placeholder="请简单介绍下废品，方便师傅准备合适的工具上门或者为您提前做好准备~" />
				</uni-forms>
				
			</view>
		</view>

		<view class="btn">
			<button type="default" :loading="loading" @click="submit">立即下单</button>
		</view>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	export default {
		// 数据
		data() {
			return {
				address: undefined, // 上门回收地址
				datetime: undefined, // 上门时间
				description: undefined, // 废品描述
				weight: undefined, // 废品总量对象
				serviceList: [],
				weightList: [],
				tabIndex: 0,
				curTime: undefined,
				// 已选废品类型
				selectedTypes: [],
				fileList: [],
				// 废品类型定义（静态映射，展示用）
				recycleTypes: [],
				loading: false,
				shopInfo: undefined, // 门店
			}
		},
		// 生命周期钩子
		onLoad(e) {
			this.curTime = dayjs().valueOf()
			this.initConfigData()
			this.goodsv2()
		},
		onShow() {
			const selectAddress = uni.getStorageSync('selectAddress')
			if(selectAddress) {
				this.address = selectAddress
			}
			const selectShop = uni.getStorageSync('selectShop')
			if(selectShop) {
				this.shopInfo = selectShop
			}
		},
		onShareAppMessage() {
		    return {
		      title: this.sysconfigMap.mallName + ' - 闲置废品换钱',
		      path: '/pages/index/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		onShareTimeline() {
		    return {
		      title: this.sysconfigMap.mallName + ' - 闲置废品换钱',
		      query: 'inviter_id=' + (this.uid || ''),
		      imageUrl: this.sysconfigMap.share_pic
		    }
		},
		// 方法
		methods: {
			initConfigData() {
				if(this.sysconfigMap.weightList) {
					this.weightList = JSON.parse(this.sysconfigMap.weightList)
				}
				if(this.sysconfigMap.serviceList) {
					this.serviceList = this.sysconfigMap.serviceList.split(',')
				}
				uni.$on('sysconfigOK',data => {
					this.weightList = JSON.parse(this.sysconfigMap.weightList)
					this.serviceList = this.sysconfigMap.serviceList.split(',')
				})
			},
			// 获取废品商品列表 https://www.yuque.com/apifm/nu0f75/wg5t98
			async goodsv2() {
				const res = await this.$wxapi.goodsv2({
					token: this.token,
					categoryKey: 'recycle',
				})
				if(res.code == 0) {
					this.recycleTypes = res.data.result
				}
			},
			/**
			 * 切换废品类型选中状态
			 * 说明：点击栅格卡片时在 selectedTypes 中增删对应值
			 */
			toggleType(id) {
				const idx = this.selectedTypes.indexOf(id)
				if (idx > -1) {
					this.selectedTypes.splice(idx, 1)
				} else {
					this.selectedTypes.push(id)
				}
			},
			afterPicRead(event) {
				this.fileList = this.fileList.concat(event.tempFiles)
			},
			afterPicDel(event) {
				const index = this.fileList.findIndex(ele => ele.path == event.tempFile.path)
				this.fileList.splice(index, 1)
			},
			selectAddress() {
				uni.navigateTo({
					url: '/pages/mine/address?from=index'
				})
			},
			async submit() {
				if(this.tabIndex == 0 && !this.address) {
					uni.showToast({
						title: '请选择上门地址',
						icon: 'none'
					})
					return
				}
				if(this.tabIndex == 0 && !this.datetime) {
					uni.showToast({
						title: '请选择上门时间',
						icon: 'none'
					})
					return
				}
				if(this.tabIndex == 1 && !this.shopInfo) {
					uni.showToast({
						title: '请选择回收门店',
						icon: 'none'
					})
					return
				}
				if(!this.selectedTypes || this.selectedTypes.length == 0) {
					uni.showToast({
						title: '请选择废品类型',
						icon: 'none'
					})
					return
				}
				if(!this.weight) {
					uni.showToast({
						title: '请选择预计总量',
						icon: 'none'
					})
					return
				}
				if(!this.fileList || this.fileList.length == 0) {
					uni.showToast({
						title: '请上传废品图片',
						icon: 'none'
					})
					return
				}
				if(!this.description) {
					uni.showToast({
						title: '请填写废品描述',
						icon: 'none'
					})
					return
				}
				uni.showLoading({
					title: ''
				})
				this.loading = true
				const extJsonStr = {
					'预计总量': this.weight,
					'废品描述': this.description
				}
				// 批量上传图片
				if (this.fileList) {
					for (let index = 0; index < this.fileList.length; index++) {
						const pic = this.fileList[index]
						const res = await this.$wxapi.uploadFileV2(this.token, pic.url)
						if (res.code == 0) {
							extJsonStr['image_' + (index + 1)] = res.data.url
						}
					}
				}
				const goodsJsonStr = []
				this.selectedTypes.forEach(goodsId => {
					goodsJsonStr.push({
						goodsId,
						number: 1,
					})
				})
				
				const postData = {
					token: this.token,
					recycle: true,
					goodsJsonStr: JSON.stringify(goodsJsonStr),
					
					extJsonStr: JSON.stringify(extJsonStr),
					extType: this.tabIndex == 0 ? '预约上门' : '到店回收',
				}
				if(this.tabIndex == 0) {
					// 预约上门
					postData.provinceId = this.address.provinceId
					postData.cityId = this.address.cityId
					postData.address = this.address.address
					postData.menpai = this.address.menpai
					postData.linkMan = this.address.linkMan
					postData.mobile = this.address.mobile
					postData.lat = this.address.latitude
					postData.lng = this.address.longitude
					postData.attendanDay = this.datetime.split(' ')[0]
					postData.attendanTime = this.datetime.split(' ')[1]
				}
				if(this.tabIndex == 1) {
					// 到店回收
					postData.peisongType = 'zq'
					postData.shopIdZt = this.shopInfo.id
					postData.shopNameZt = this.shopInfo.name
				}
				// https://www.yuque.com/apifm/nu0f75/qx4w98
				const res = await this.$wxapi.orderCreate(postData)
				uni.hideLoading()
				this.loading = false
				if(res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showModal({
					content: this.tabIndex == 0 ? '订单提交成功，我们尽快安排师傅上门' : '下单成功',
					showCancel: false,
					success: () => {
						uni.navigateTo({
							url: '/pages/order/detail?id=' + res.data.id
						})
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		width: 750rpx;
		background: #F2F7F9;
	}

	.search-box {
		padding: 0 32rpx;
		background: linear-gradient(180deg, #3ED09F, #F2F7F9);
		padding-bottom: 100rpx;

		.search-container {
			margin-top: 88rpx;
			/* #ifdef H5 */
			margin-top: 32rpx;
			/* #endif */
			background: #fff;
			border-radius: 16rpx;
			padding: 32rpx;
			padding-bottom: 0;
		}
	}

	// 地址输入框
	.address-input-container {
		.address-input {
			background: #F2F7F9;
			border-radius: 16rpx;
			padding: 32rpx;
			display: flex;
			align-items: center;
			gap: 24rpx;

			.recycle-icon {
				width: 40rpx;
				height: 40rpx;
				background: #608DFF;
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.recycle-text {
					font-weight: 400;
					font-size: 24rpx;
					color: #FFFFFF;
				}
			}

			.input-placeholder {
				flex: 1;
				font-weight: 600;
				font-size: 32rpx;
				color: #9A9A9A;
			}
		}
	}

	.serviceList {
		display: flex;
		padding: 32rpx;

		.item {
			flex: 1;
			display: flex;
			align-items: center;

			text {
				margin-left: 8rpx;
				font-weight: 400;
				font-size: 22rpx;
				color: #9A9A9A;
			}
		}
	}

	.container {
		margin: 32rpx;
		margin-top: -64rpx;
		margin-bottom: 0;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;

		.tab-container {
			border: solid 1rpx #fff;
			height: 100rpx;
			line-height: 100rpx;
			display: flex;
			background: #F2F7F9;

			.tab {
				flex: 1;
				text-align: center;

				&.c1 {
					background: #fff;
					border-radius: 0 32rpx 0 0;
				}
			}

			&.c2active {
				background: #F2F7F9;

				.c1 {
					background: #F2F7F9;
					border-radius: 0 0 0 0;
				}

				.c2 {
					background: #fff;
					border-radius: 32rpx 0 0 0;
				}
			}
		}
		.form {
			padding: 32rpx;
		}
	}
	// 回收类型
	.recycle-types {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		padding-bottom: 48rpx;
	
		.type-item {
			height: 96rpx;
			border: 2rpx solid #DADADA;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
	
			&.selected {
				background: #48C5A8;
				border-color: #48C5A8;
			}
	
			.type-name {
				font-family: 'PingFang SC';
				font-weight: 400;
				font-size: 28rpx;
				color: #333333;
				margin-bottom: 4rpx;
	
				&.selected {
					color: #FFFFFF;
				}
			}
	
			.type-price {
				font-family: 'PingFang SC';
				font-weight: 400;
				font-size: 22rpx;
				color: #9A9A9A;
	
				&.selected {
					color: #FFFFFF;
				}
			}
		}
	}
	.divider {
		width: 100%;
		height: 1rpx;
		background: #F6F6F6;
		margin-bottom: 32rpx;
	}
	.btn {
		padding: 32rpx;
		button {
			background: #48C5A8;
			color: #fff;
		}
	}
</style>