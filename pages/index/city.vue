<template>
	<view class="city-container">
		<!-- 城市索引列表 -->
		<uni-indexed-list :options="cityList" :showSelect="false" @click="onCityClick"></uni-indexed-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [], // 接口返回的原始数据
				cityList: [], // 城市列表数据
			}
		},
		
		onLoad() {
			// 页面加载时获取城市列表
			this.cityV2()
		},
		
		methods: {
			/**
			 * 获取所有城市数据
			 * 使用api工厂的WXAPI.cityV2()方法
			 */
			async cityV2() {
				// https://www.yuque.com/apifm/nu0f75/rgvkpt
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.cityV2();
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
				}
				this.list = res.data
				this.cityList = this.formatCityData(res.data)
			},
			
			/**
			 * 格式化城市数据
			 * @param {Array} cityData - 原始城市数据
			 * @returns {Array} 格式化后的城市列表数据
			 */
			formatCityData(cityData) {
				// 按首字母分组
				const grouped = {};
				cityData.forEach(city => {
					const firstLetter = city.firstLetter.toUpperCase();
					if (!grouped[firstLetter]) {
						grouped[firstLetter] = [];
					}
					grouped[firstLetter].push(city.name);
				});
				
				// 转换为uni-indexed-list需要的格式
				const result = [];
				Object.keys(grouped).sort().forEach(letter => {
					result.push({
						letter: letter,
						data: grouped[letter]
					});
				});
				
				return result;
			},
			
			/**
			 * 城市选择回调
			 * @param {Object} e - 选择事件对象
			 */
			onCityClick(e) {
				const city = this.list.find(ele => ele.firstLetter.toUpperCase() == e.item.key && ele.name == e.item.name)
				if (city) {
					this.vuex('selectedCity', city)
					this.vuex('needRefresh', true)
					uni.navigateBack()
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
</style>