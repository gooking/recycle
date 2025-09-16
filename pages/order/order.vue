<template>
  <view class="order-page">
    <view class="order-header">
      <text class="title">我的订单</text>
    </view>
    <view class="order-content">
      <uni-list v-if="orders.length > 0">
        <uni-list-item v-for="order in orders" :key="order.id" :title="order.name" :note="order.status" showArrow></uni-list-item>
      </uni-list>
      <view v-else class="empty-order">
        <text>暂无订单记录</text>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        orders: []
      }
    },
    onLoad() {
      this.getOrderList()
    },
    methods: {
      // 获取订单列表
      async getOrderList() {
        // API工厂文档地址: https://www.yuque.com/apifm/nu0f75/cdqz1n
        const res = await this.$wxapi.orderList()
        if (res.code === 0) {
          this.orders = res.data
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .order-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    .order-header {
      padding: 20rpx;
      background-color: #fff;
      .title {
        font-size: 36rpx;
        font-weight: 500;
        color: #333;
      }
    }
    .order-content {
      padding: 20rpx;
      .empty-order {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 100rpx 0;
        color: #999;
        font-size: 28rpx;
      }
    }
  }
</style>