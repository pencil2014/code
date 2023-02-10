<template>
  <div class="cust-info">
    <span class="small-tit item">工作号： {{orderInfo.orderNo}}</span>
    <!-- <span class="small-tit">工作号：{{orderInfo.orderNo}}</span> -->
    <span class="ml20 item entrustUnit">
      <entrustUnitComp />
    </span>
    <span class="ml20 item custIntrustNo">
        客户委托号： 
        <el-tooltip :content="orderInfo.custIntrustNo" placement="top-start">
          <span>{{ orderInfo.custIntrustNo }}</span>
        </el-tooltip>
      </span>
    <span class="ml20 item-so" v-if="['st01','st02','st15','st16','st17', 'st09'].includes(orderInfo.serviceType)">
      SO号：
      <el-tooltip :content="soStr" placement="top-start">
        <span>{{soStr}}</span>
      </el-tooltip>
      <!-- <span class="item-label" v-else>SO号:{{soStr}}</span> -->
    </span>
    <!-- <el-button type="default" size="mini" @click="handleGoBack" class="btn-goBack" :disabled="returnDisabled">关闭</el-button> -->
    <slot></slot>
    <workBtn />
  </div>
</template>
<script>
// import { getDictLabel, getTextSize } from '@/utils/tools'
import { getBookSoList } from '@/api/order/book/list'
import { bookSoList } from '@/api/order/list'
import workBtn from './workBtn.vue'
export default {
  data() {
    return {
      // getTextSize: getTextSize,
      soStr: ''
    }
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
    },
    returnDisabled: {
      type: Boolean,
      default: false
    }
  },
  activated() {
    
  },
  created() {
    
  },
  mounted() {
    
  },
  computed: {
  },
  components: {
    workBtn
  },
  watch: {
    orderInfo: {
      handler(newVal, oldVal) {
        if (['st01', 'st15', 'st09'].includes(newVal.serviceType)) {
          this.getBookSo()
        }
        if (['st02', 'st16', 'st17', 'st10'].includes(newVal.serviceType)) {
          this.getSoList()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 委托订舱获取so
		getBookSo() {
			getBookSoList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let soInfo = res.data.soList
				let soStr = ''
				soInfo.map((item, index) => {
					soStr += index ? `,${item.so}` : `${item.so}`
				})
				this.soStr = soStr
				console.log('soStr', this.soStr)
			})
    },
    // 客户自订获取so
		getSoList() {
			bookSoList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				let soList = res.data
				let soStr = ''
				soList.map((item, index) => {
					soStr += index ? `,${item.so}` : `${item.so}`
        })
        this.soStr = soStr
			})
		},
    handleGoBack() {
      window.close()
      // let path = this.$route.query.source || 'orderList'
      // this.$router.push({
      //   name: path.slice(0,1).toUpperCase() + path.slice(1, path.length)
      //   // path: '/order/order/' + path
      // })
    }
  }
}
</script>
<style lang="scss" scoped>
.cust-info {
  display: flex;
  height: 36px;
  line-height: 20px;
  padding: 8px 15px;
  background-color: #fff;
  -webkit-box-shadow: 0px 4px 10px 0px #e9e9e9;
  box-shadow: 0px 4px 10px 0px #e9e9e9;
  position: relative;
  padding-right: 100px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: initial;
  .item{
    display: inline-block;
    height: 20px;
    line-height: 20px;
    &.entrustUnit{
      max-width: 400px;
    }
    &.custIntrustNo{
      max-width: 200px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      overflow: hidden;
    }
  }
  .item-so{
    display: inline-block;
    height: 20px;
    line-height: 20px;
    width: 400px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    // vertical-align: middle;
    // margin-top: -2px;
  }
  @media screen and (min-width: 1580px) {
    .item-so{
      width: auto;
      max-width: 800px;
    }
  }
  .small-tit {
    .icon {
      vertical-align: sub;
      margin-right: 5px;
      width: 16px;
    }
  }
  .btn-goBack {
    position: absolute;
    right: 15px;
  }
}
</style>