<template>
	<view class="page">
		<view class="form-box">
			<uni-forms ref="uForm" :modelValue="form" :rules="rules" label-width="150rpx">
				<uni-forms-item label="姓名" name="name" required>
					<uni-easyinput type="text" v-model="form.name" placeholder="如何称呼您" />
				</uni-forms-item>
				<uni-forms-item label="联系电话" name="mobile" required>
					<uni-easyinput type="number" v-model="form.mobile" placeholder="方便我们与您联系" />
				</uni-forms-item>
				<uni-forms-item label="反馈内容" name="content" required>
					<uni-easyinput type="textarea" v-model="form.content" placeholder="请留下您的宝贵建议或意见～" />
				</uni-forms-item>
				<uni-forms-item label="上传图片" required>
					<uni-file-picker
						mode="grid"
						:auto-upload="false"
						@select="afterPicRead"
						@delete="afterPicDel"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>
		<view class="submit-btn">
			<button type="default" @click="submit">提交反馈</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				fileList: [],
				rules: {
					name:  {
						rules: [
							{
								required: true,
								errorMessage: '不能为空',
							}
						]
					},
					mobile:  {
						rules: [
							{
								required: true,
								errorMessage: '不能为空',
							}
						]
					},
					content:  {
						rules: [
							{
								required: true,
								errorMessage: '不能为空',
							}
						]
					},
				},
				form: {
					name: null,
					mobile: null,
					wx: null,
					content: null,
				},
			}
		},
		onLoad(e) {},
		onShow() {

		},
		methods: {
			afterPicRead(event) {
				this.fileList = this.fileList.concat(event.tempFiles)
			},
			afterPicDel(event) {
				const index = this.fileList.findIndex(ele => ele.path == event.tempFile.path)
				this.fileList.splice(index, 1)
			},
			submit() {
				this.$refs.uForm.validate().then(res => {
					this._submit()
				})
			},
			async _submit() {
				uni.showLoading({
					title: ''
				})
				const extJsonStr = {}
				extJsonStr['姓名'] = this.form.name
				extJsonStr['联系电话'] = this.form.mobile
				// 批量上传附件
				if (this.fileList) {
					for (let index = 0; index < this.fileList.length; index++) {
						const pic = this.fileList[index];
						const res = await this.$wxapi.uploadFileV2(this.token, pic.url)
						if (res.code == 0) {
							extJsonStr['file' + index] = res.data.url
						}
					}
				}
				const res = await this.$wxapi.addComment({
					token: this.token,
					type: 1,
					extJsonStr: JSON.stringify(extJsonStr),
					content: this.form.content
				})
				uni.hideLoading()
				if (res.code == 0) {
					uni.showModal({
						showCancel: false,
						content: '提交成功',
						confirmText: '知道了',
						success: () => {
							uni.navigateBack()
						}
					})
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
		}
	}
</script>
<style scoped lang="scss">
	.form-box {
		padding: 32rpx;
	}
	.submit-btn {
		padding: 32rpx;
		button {
			background-color: #48C5A8;
			color: #fff;
		}
	}
</style>
