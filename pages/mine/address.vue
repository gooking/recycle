<template>
  <view class="mine-page">
    <view class="user-info">
      <view class="avatar">
        <uni-icons type="user" size="80"></uni-icons>
      </view>
      <view class="user-details">
        <text class="username">{{ username }}</text>
        <text class="user-id">ID: {{ userId }}</text>
      </view>
    </view>
    <view class="mine-menu">
      <uni-list>
        <uni-list-item title="个人信息" showArrow></uni-list-item>
        <uni-list-item title="我的地址" showArrow></uni-list-item>
        <uni-list-item title="帮助中心" showArrow></uni-list-item>
        <uni-list-item title="设置" showArrow></uni-list-item>
      </uni-list>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        username: '未登录',
        userId: '0000'
      }
    },
    onLoad() {
      this.getUserInfo()
    },
    methods: {
      // 获取用户信息
      async getUserInfo() {
        // API工厂文档地址: https://www.yuque.com/apifm/nu0f75/cdqz1n
        const res = await this.$wxapi.userDetail()
        if (res.code === 0 && res.data) {
          this.username = res.data.nickName || '用户'
          this.userId = res.data.id || '0000'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mine-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    .user-info {
      display: flex;
      align-items: center;
      padding: 40rpx;
      background-color: #fff;
      margin-bottom: 20rpx;
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 30rpx;
      }
      .user-details {
        .username {
          font-size: 36rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 10rpx;
          display: block;
        }
        .user-id {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
    .mine-menu {
      background-color: #fff;
    }
  }
</style>