<template>
  <view class="page">
    <!-- 使用自定义头部组件 -->
    <custom-header></custom-header>

    <!-- 地址输入框 -->
    <view class="address-input-container">
      <view class="address-input">
        <view class="recycle-icon">
          <text class="recycle-text">收</text>
        </view>
        <text class="input-placeholder">请填写回收地址/电话</text>
        <view class="address-arrow">
          <text>></text>
        </view>
      </view>
    </view>

    <!-- 服务特色 -->
    <view class="service-features">
      <view class="feature-item">
        <view class="feature-icon">
          <view class="checkmark"></view>
        </view>
        <text class="feature-text">公正保障</text>
      </view>
      <view class="feature-item">
        <view class="feature-icon">
          <view class="checkmark"></view>
        </view>
        <text class="feature-text">支持开发票</text>
      </view>
      <view class="feature-item">
        <view class="feature-icon">
          <view class="checkmark"></view>
        </view>
        <text class="feature-text">24小时下单</text>
      </view>
    </view>

    <!-- 下单方式切换 -->
    <view class="order-type-switch">
      <view class="switch-item" :class="{ active: orderType === 'pickup' }" @click="orderType = 'pickup'">
        <text class="switch-text">预约上门</text>
      </view>
      <view class="switch-item" :class="{ active: orderType === 'store' }" @click="orderType = 'store'">
        <text class="switch-text">到店回收</text>
      </view>
      <view class="switch-indicator" :class="{ 'to-store': orderType === 'store' }"></view>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 废品类型 -->
      <view class="form-section">
        <text class="section-title">*废品类型（多选）</text>
        <view class="divider"></view>
        <view class="recycle-types">
          <view v-for="(item, index) in recycleTypes" :key="index" 
                class="type-item" :class="{ selected: selectedTypes.includes(item.value) }"
                @click="toggleType(item.value)">
            <text class="type-name" :class="{ selected: selectedTypes.includes(item.value) }">{{ item.name }}</text>
            <text class="type-price" :class="{ selected: selectedTypes.includes(item.value) }">{{ item.price }}</text>
          </view>
        </view>
      </view>

      <!-- 期望上门时间 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">*期望上门时间</text>
          <text class="section-placeholder">上门回收时间</text>
          <view class="arrow-right"></view>
        </view>
        <view class="divider"></view>
      </view>

      <!-- 预计总量 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">*预计总量</text>
          <text class="section-placeholder">请选择重量</text>
          <view class="arrow-right"></view>
        </view>
        <view class="divider"></view>
      </view>

        <!-- 上传废品图 -->
        <view class="form-section">
          <text class="section-title">*上传废品图（1/3）</text>
          <view class="image-upload-area">
            <view class="uploaded-image">
              <!-- 这里使用一个占位符，实际项目中替换为真实图片 -->
              <view class="sample-image"></view>
            </view>
            <view class="upload-placeholder" @click="chooseImage">
              <view class="upload-icon">+</view>
            </view>
          </view>
        </view>

      <!-- 废品描述 -->
      <view class="form-section">
        <text class="section-title">*废品描述</text>
        <view class="divider"></view>
        <textarea class="description-input" placeholder="请描写废品详情" v-model="description"></textarea>
      </view>
    </view>


  </view>
</template>

<script>
  // SDK 文档地址: https://www.yuque.com/apifm/nu0f75/cdqz1n
  import config from '@/config.js'
  import customHeader from '@/components/custom-header/custom-header.vue'

  export default {
    name: 'index',
    // 组件
    components: {
      customHeader
    },
    // 数据
    data() {
      return {
        // 订单类型：预约上门 pickup / 到店回收 store
        orderType: 'pickup',
        // 已选废品类型
        selectedTypes: ['electronics'],
        // 描述
        description: '',
        // 废品类型定义（静态映射，展示用）
        recycleTypes: [
          { value: 'paper', name: '纸类', price: '1.5元/公斤' },
          { value: 'metal', name: '金属类', price: '1.5元/公斤' },
          { value: 'electronics', name: '电子产品', price: '2.2元/公斤' },
          { value: 'glass', name: '玻璃类', price: '2.2元/公斤' },
          { value: 'plastic', name: '塑料类', price: '0.4元/公斤' }
        ]
      }
    },
    // 生命周期钩子
    async mounted() {
      await this.loadInitialData()
    },
    // 方法
    methods: {
      /**
       * 切换废品类型选中状态
       * 说明：点击栅格卡片时在 selectedTypes 中增删对应值
       */
      toggleType(type) {
        const idx = this.selectedTypes.indexOf(type)
        if (idx > -1) {
          this.selectedTypes.splice(idx, 1)
        } else {
          this.selectedTypes.push(type)
        }
      },

      /**
       * 打开上门时间选择占位
       * 交互：设计稿为右侧箭头，当前弹出占位提示
       */
      showTimePicker() {
        uni.showModal({
          title: '选择上门时间',
          content: '暂未实现完整的时间选择器功能',
          showCancel: false
        })
      },

      /**
       * 打开重量选择占位
       * 交互：设计稿为右侧箭头，当前弹出占位提示
       */
      showWeightPicker() {
        uni.showModal({
          title: '选择重量',
          content: '暂未实现完整的重量选择器功能',
          showCancel: false
        })
      },

      /**
       * 选择图片
       * 说明：用于上传废品图区域
       */
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            console.log('选择图片成功:', res)
          }
        })
      },

      /**
       * 加载首页所需基础数据（占位）
       * 使用“api工厂”SDK await 请求示例
       * SDK 文档地址: https://www.yuque.com/apifm/nu0f75/cdqz1n
       */
      async loadInitialData() {
        // 示例：获取公告列表（占位）
        const noticeRes = await this.$wxapi.noticeList({ pageSize: 1 })
        console.log('noticeList', noticeRes)

        // 示例：获取轮播图（占位）
        const bannersRes = await this.$wxapi.banners({ type: 'index' })
        console.log('banners', bannersRes)
      }
    }
  }
</script>

<style lang="scss" scoped>
.page {
  width: 750rpx;
  min-height: 1624rpx;
  background: #F2F7F9;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
}



// 地址输入框
.address-input-container {
  margin: 0 40rpx 40rpx;
  
  .address-input {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 40rpx;
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
          font-family: 'PingFang SC';
          font-weight: 400;
          font-size: 24rpx;
          color: #FFFFFF;
        }
    }
    
    .input-placeholder {
      flex: 1;
      font-family: 'PingFang SC';
      font-weight: 600;
      font-size: 32rpx;
      color: #9A9A9A;
    }
    
    .address-arrow {
          color: #CBCBCB;
          font-size: 24rpx;
        }
  }
}

// 服务特色
.service-features {
  display: flex;
  justify-content: space-around;
  margin: 0 40rpx 40rpx;
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    
    .feature-icon {
      width: 32rpx;
      height: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .checkmark {
        width: 28rpx;
        height: 28rpx;
        border-radius: 50%;
        background: #9A9A9A;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          width: 8rpx;
          height: 4rpx;
          border-left: 3rpx solid #FFFFFF;
          border-bottom: 3rpx solid #FFFFFF;
          transform: rotate(-45deg);
          top: 50%;
          left: 50%;
          margin-top: -4rpx;
          margin-left: -4rpx;
        }
      }
    }
    
    .feature-text {
      font-family: 'PingFang SC';
      font-weight: 400;
      font-size: 22rpx;
      color: #9A9A9A;
    }
  }
}

// 下单方式切换
.order-type-switch {
  position: relative;
  margin: 0 170rpx 40rpx;
  height: 100rpx;
  background: #F2F7F9;
  border-radius: 0;
  display: flex;
  
  .switch-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    
    .switch-text {
          font-family: 'PingFang SC';
          font-weight: 500;
          font-size: 32rpx;
          color: #333333;
      
      &.active {
        color: #656565;
      }
    }
    
    &.active .switch-text {
      color: #656565;
    }
  }
  
  .switch-indicator {
    position: absolute;
    bottom: 8rpx;
    left: 0;
    width: 144rpx;
    height: 12rpx;
    background: linear-gradient(90deg, #48C5A8 0%, rgba(72, 197, 168, 0) 100%);
    border-radius: 6rpx;
    transition: left 0.3s ease;
    
    &.to-store {
      left: 190rpx;
    }
  }
}

// 表单容器
.form-container {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 0 28rpx;
  padding: 60rpx;
  
  .form-section {
    margin-bottom: 60rpx;
    
    .section-title {
        font-family: 'PingFang SC';
        font-weight: 500;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 32rpx;
        display: block;
      }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32rpx;
      
      .section-placeholder {
          font-family: 'PingFang SC';
          font-weight: 400;
          font-size: 28rpx;
          color: #9A9A9A;
        }
      
      .arrow-right {
        width: 16rpx;
        height: 24rpx;
        background: #9A9A9A;
        clip-path: polygon(0 20%, 100% 50%, 0 80%);
      }
    }
    
    .divider {
      width: 100%;
      height: 1rpx;
      background: #F6F6F6;
      margin-bottom: 32rpx;
    }
    
    // 回收类型
    .recycle-types {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
      
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
    
    // 图片上传
    .image-upload-area {
      display: flex;
      gap: 20rpx;
      
      .uploaded-image {
        width: 196rpx;
        height: 188rpx;
        border-radius: 12rpx;
        overflow: hidden;
        position: relative;
        
        .sample-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 32rpx 32rpx;
          background-position: 0 0, 0 16rpx, 16rpx -16rpx, -16rpx 0rpx;
          position: relative;
          
          &::after {
            content: '图片';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #999;
            font-size: 24rpx;
          }
        }
        
        .waste-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .upload-placeholder {
        width: 196rpx;
        height: 188rpx;
        border: 2rpx dashed #DADADA;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .upload-icon {
          font-size: 48rpx;
          color: #CBCBCB;
          font-weight: 300;
        }
      }
    }
    
    // 描述输入框
    .description-input {
      width: 100%;
      height: 220rpx;
      background: #F2F7F9;
      border-radius: 12rpx;
      padding: 24rpx;
      font-family: 'PingFang SC';
        font-weight: 400;
        font-size: 28rpx;
        color: #9A9A9A;
      border: none;
      outline: none;
      resize: none;
      box-sizing: border-box;
      
      &::placeholder {
        color: #9A9A9A;
      }
    }
  }
}


</style>
