<template>
  <div class="check-pointList" :style="{height: `${checkPointHeight}px`}">
    <div class="timeline" v-for="(item, index) in checkPointList" :key="item.jobCode">
      <el-tooltip placement="top" :key="'content' + index" :disabled="!tooltipFlag">
        <div slot="content" class="checkPoint-tip">{{item.content}}</div>
        <div class="content" :class="item.isExp === 'Y' ? 'red' : ''" @mouseenter="visibilityChange($event)">{{item.content}}</div>
      </el-tooltip>
      <div class="time">{{item.bizTime}}</div>
      <div class="time">参与人：{{item.bizEmployeeName}}</div>
    </div>
  </div>
</template>

<script>
import { orderInfo, orderJointInfo } from '@/api/order/list'
export default {
  data() {
    return {
      checkPointList: [],
      tooltipFlag: false
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    checkPointHeight: {
      type: Number,
      default: 0
    }
  },
  activated() {
    this.getCheckPointList()
  },
  created() {
    this.getCheckPointList()
  },
  mounted() {

  },
  computed: {
    
  },
  watch: {
    createItem: {
      handler(newVal) {
        this.checkPointList = newVal.checkPointList
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    
  },
  methods: {
    // 获取关键点数据
    getCheckPointList() {
      let { source, orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.checkPointList = res.data.checkPointList
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.checkPointList = res.data.checkPointList
			})
    },
    // tooltip显示
    visibilityChange(event) {
      const ev = event.target
      const ev_height = ev.offsetHeight // 文本的实际高度
      const content_height = 72 // 文本容器高度
      if (content_height == ev_height) {
        this.tooltipFlag = true
      } else {
        // 否则为不溢出
        this.tooltipFlag = false
      }
    }
  }
};
</script>

<style lang="scss">
.check-pointList{
  position: relative;
  padding: 0 6px 0 18px;
  height: 100%;
  // max-height: calc(100vh - 250px);
  // height: 100%;
  overflow-y: auto;
  // &::before{
  //   content: '';
  //   display: block;
  //   position: absolute;
  //   width:2px;
  //   background:rgba(62,128,245,1);
  //   left: 8px;
  //   top: 9px;
  //   bottom: 9px;
  // }
}
.timeline{
  position: relative;
  line-height: 22px;
  margin-bottom: 10px;
  &:after{
    content: '';
    display: block;
    position: absolute;
    width:6px;
    height:6px;
    background:rgba(62,128,245,1);
    border-radius:3px;
    left: -12px;
    top: 9px;
  }
  &::before{
    content: '';
    display: block;
    position: absolute;
    width:2px;
    background:rgba(62,128,245,1);
    left: -10px;
    top: 9px;
    bottom: -19px;
  }
  &:last-child{
    &::before{
      display: none;
    }
  }
  .content{
    display: block;
    display: -webkit-box;
    word-break: break-all;
    white-space: normal;
    line-height: 18px;
    max-height: 72px;
    overflow: hidden;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    &.red{
      color: #cd4130;
    }
  }
  .time{
    color: #969696;
    line-height: 18px;
  }
}
.checkPoint-tip{
  width: 250px;
}
</style>
