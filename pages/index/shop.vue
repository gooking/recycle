<template>
	<view class="address-container">
		<view class="address-list">
			<uni-swipe-action>
				<page-box-empty v-if="!addressList || addressList.length == 0" title="当前城市暂无服务门店"
					subTitle="我们将尽快开通~"></page-box-empty>
				<template v-for="(item, index) in addressList">
					<view class="address-item">
						<view class="address-main">
							<view class="address-header">
								<view class="address-name">{{ item.name }}</view>
								<text class="default-tag">{{ item.distance.toFixed(0) }}km</text>
							</view>
							<uni-list :border="false">
								<uni-list-item showExtraIcon :extraIcon="{color: '#666',size: '32rpx',type: 'calendar'}"
									title="营业时间" :rightText="item.openingHours"></uni-list-item>
								<uni-list-item showExtraIcon :extraIcon="{color: '#666',size: '32rpx',type: 'phone'}"
									title="服务电话" :rightText="item.linkPhone" showArrow clickable
									@click="makeCall(item.linkPhone)"></uni-list-item>
								<uni-list-item showExtraIcon :extraIcon="{color: '#666',size: '32rpx',type: 'location'}"
									title="门店地址" :rightText="item.address" showArrow clickable
									@click="openLocation(item)"></uni-list-item>
							</uni-list>
						</view>
						<button type="primary" class="btn" @click="selectAddress(index)">到店回收</button>
					</view>
				</template>
			</uni-swipe-action>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				addressList: [],
				curSwipeIndex: -1,
				options: [{
					key: 'del',
					text: '删除',
					style: {
						backgroundColor: '#FC5F6D'
					}
				}, ],
				from: undefined,
			}
		},
		onLoad(e) {
			getApp().getLocation().then(pos => {
				this.fetchShopsV2(pos)
			})
		},
		onShareAppMessage() {
		    return {
		      title: this.sysconfigMap.mallName + ' - 闲置废品换钱',
		      path: '/pages/index/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		methods: {
			/**
			 * 获取门店列表
			 * https://www.yuque.com/apifm/nu0f75/vvgeq9
			 */
			async fetchShopsV2(pos) {
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.fetchShopsV2({
					cityId: this.selectedCity?.id,
					curlatitude: pos.lat,
					curlongitude: pos.long,
				})
				uni.hideLoading()
				if (res.code == 0) {
					this.addressList = res.data.result
				}
			},
			makeCall(phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				})
			},
			openLocation(shopInfo) {
				var name = shopInfo.name
				var address = shopInfo.address
				var latitude = shopInfo.latitude
				var longitude = shopInfo.longitude
				uni.openLocation({
					name: name,
					address: address,
					latitude: latitude,
					longitude: longitude,
				})
			},
			/**
			 * 添加新地址
			 * 跳转到地址编辑页面
			 */
			addNewAddress() {
				uni.navigateTo({
					url: '/pages/mine/address-edit?type=add'
				});
			},

			/**
			 * 编辑地址
			 * @param {Object} item - 地址信息
			 */
			editAddress(item) {
				// 跳转到地址编辑页面并传递地址信息
				uni.navigateTo({
					url: '/pages/mine/address-edit?type=edit&id=' + item.id
				});
			},

			/**
			 * 删除地址
			 * @param {Number} index - 地址索引
			 */
			deleteAddress(index) {
				uni.showModal({
					content: '确定要删除该地址吗？',
					success: async (res) => {
						if (res.confirm) {
							const item = this.addressList[index]
							// https://www.yuque.com/apifm/nu0f75/gb0a2k
							const res = await this.$wxapi.deleteAddress(this.token, item.id)
							if (res.code == 0) {
								this.addressList.splice(index, 1);
								uni.showToast({
									title: '删除成功'
								});
							} else {
								uni.showToast({
									title: res.msg,
									icon: 'none'
								});
							}
						}
					}
				});
			},
			// 选择使用地址
			async selectAddress(index) {
				uni.setStorageSync('selectShop', this.addressList[index])
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.address-container {
		background: #F2F7F9;
	}
	.address-list {
		padding: 20rpx;
	}

	.address-item {
		position: relative;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		&.active {
			border: solid 1rpx #48C5A8;
		}
	}

	.address-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.default-tag {
		font-size: 24rpx;
		color: #fff;
		background-color: #48C5A8;
		padding: 4rpx 16rpx;
		border-radius: 16rpx;
	}
	.btn {
		background: #48C5A8;
		color: #fff;
	}
</style>