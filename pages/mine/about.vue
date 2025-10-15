<template>
	<view class="index">
		<view v-if="cmsPage" class="content">
			<mp-html :content="cmsPage.info.content" />
		</view>
		<view v-if="key == 'jiankanfuwu'" class="kefu-btn submit-bar">
			<button type="primary" @click="kefu"><uni-icons type="phone" size="32rpx" color="#fff"></uni-icons>{{ sysconfigMap.kf_tel }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				key: undefined,
				cmsPage: undefined,
			}
		},
		onLoad(e) {
			this.key = e.key
			this._cmsPage()
		},
		onShow() {

		},
		onShareAppMessage() {
		    return {
		      title: this.sysconfigMap.mallName + ' - 闲置废品换钱',
		      path: '/pages/index/index?inviter_id=' + (this.uid || ''),
			  imageUrl: this.sysconfigMap.share_pic,
		    }
		},
		methods: {
			async _cmsPage() {
				// https://www.yuque.com/apifm/nu0f75/utgp8i
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.cmsPage(this.key)
				uni.hideLoading()
				if (res.code == 0) {
					this.cmsPage = res.data
					uni.setNavigationBarTitle({
						title: res.data.info.title,
					})
				}
			},
			kefu() {
				getApp().contactService()
			},
		}
	}
</script>

<style scoped lang="scss">
	.content {
		padding: 32rpx;
		line-height: 64rpx;

		img {
			max-width: 100%;
		}

		image {
			max-width: 100%;
		}
	}
	.kefu-btn {
		button {
			width: 100vw;
		}
	}
</style>