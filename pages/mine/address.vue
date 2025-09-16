<template>
	<view class="address-container">
		<!-- 地址列表 -->
		<view class="address-list">
			<!-- 默认地址 -->
			<uni-swipe-action>
				<page-box-empty title="暂无地址" subTitle="请先添加上门地址哦~"></page-box-empty>
				<template v-for="(item, index) in addressList">
					<uni-swipe-action-item :right-options="options" @click="onClick"
						@change="swipeChange($event, index)">
						<view class="address-item" :class="item.isDefault ? 'active' : ''">
							<view class="address-main">
								<view class="address-header">
									<view class="address-name">
										<text class="user-name">{{ item.name }}</text>
										<text class="user-phone">{{ item.phone }}</text>
									</view>
									<text class="default-tag" v-if="item.isDefault">默认</text>
								</view>

								<view class="address-content">
									<text class="address-type">{{ item.type }}</text>
									<text class="address-detail">{{ item.address }}</text>
								</view>
							</view>

							<view class="address-actions">
								<view class="action-icon" @tap="editAddress(item)">
									<text>编辑</text>
									<image src="/static/images/address/edit.png" mode="aspectFit"></image>
								</view>
							</view>
						</view>
					</uni-swipe-action-item>
				</template>
			</uni-swipe-action>
		</view>

		<!-- 添加新地址按钮 -->
		<view class="add-address-btn" @tap="addNewAddress">
			<image src="/static/images/address/add.png" mode="aspectFit"></image>
			<text>添加新地址</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				addressList: [],
				curSwipeIndex: -1,
				options: [
					{
						key: 'del',
						text: '删除',
						style: {
							backgroundColor: '#FC5F6D'
						}
					},
				]
			}
		},
		onLoad() {
			this.getAddressList();
		},
		methods: {
			onClick(e) {
				console.log(e);
				console.log('点击了' + (e.position === 'left' ? '左侧' : '右侧') + e.content.text + '按钮')
				this.deleteAddress(this.curSwipeIndex)
			},
			swipeChange(e, index) {
				console.log('当前状态：' + e + '，下标：' + index)
				this.curSwipeIndex = index
			},
			/**
			 * 获取地址列表
			 * 使用 api工厂 SDK 获取用户地址列表
			 * 文档地址: https://api.it120.cc/doc.html
			 */
			async getAddressList() {
				// https://www.yuque.com/apifm/nu0f75/mmte1o
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.queryAddressV2({
					token: this.token
				})
				uni.hideLoading()
				if(res.code == 0) {
					this.addressList = res.data.result
				}
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
					success: (res) => {
						if (res.confirm) {
							// 实际开发中应调用删除地址的API
							this.addressList.splice(index, 1);
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
				});
			},

			/**
			 * 设置默认地址
			 * @param {Number} index - 地址索引
			 */
			setDefaultAddress(index) {
				// 实际开发中应调用设置默认地址的API
				this.addressList.forEach((item, i) => {
					item.isDefault = i === index;
				});
				uni.showToast({
					title: '设置成功',
					icon: 'success'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.address-container {
		padding-bottom: 120rpx;
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
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

		&.active {
			border: solid 1rpx #48C5A8;
		}
	}

	.address-main {
		flex: 1;
	}

	.address-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.address-name {
		display: flex;
		align-items: center;
	}

	.user-name {
		font-size: 32rpx;
		color: #333;
		margin-right: 24rpx;
	}

	.user-phone {
		font-size: 30rpx;
		color: #666;
	}

	.default-tag {
		position: absolute;
		right: 8rpx;
		top: 8rpx;
		font-size: 24rpx;
		color: #fff;
		background-color: #48C5A8;
		padding: 4rpx 16rpx;
		border-radius: 16rpx;
	}

	.address-content {
		display: flex;
		align-items: flex-start;
	}

	.address-type {
		font-size: 24rpx;
		color: #666;
		margin-right: 16rpx;
		background-color: #f0f0f0;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.address-detail {
		font-size: 28rpx;
		color: #666;
		line-height: 40rpx;
		flex: 1;
	}

	.address-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.action-icon {
		display: flex;
		margin-top: 32rpx;
	}

	.action-icon image {
		width: 40rpx;
		height: 40rpx;
		margin-bottom: 8rpx;
	}

	.action-icon text {
		font-size: 24rpx;
		color: #666;
		margin-right: 4rpx;
		margin-top: 4rpx;
	}

	.add-address-btn {
		position: fixed;
		bottom: 80rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 680rpx;
		height: 96rpx;
		background-color: #48C5A8;
		border-radius: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-size: 32rpx;
	}

	.add-address-btn image {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
	}
</style>