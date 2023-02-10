<template>
  <div class="opPlan">
    <div class="header" id="header">
      <div class="left">货物跟踪详情（工作号：{{$route.query.orderNo}}）</div>
      <div class="right">
        <el-button type="default" size="mini" @click="goBack">返回</el-button>
      </div>
    </div>
    <!-- <allInfo id="allInfo" v-if="requestSuccess" :order-info="orderInfo" /> -->
    <progressStep id="progressStep" v-if="requestSuccess" :order-info="orderInfo" :checkpointList="checkpointList"  />
    <!-- <todo v-if="requestSuccess" id="todo" :order-info="orderInfo" :polDeclarationArr="polDeclarationArr" @goToScrollHeight="goToScrollHeight" /> -->
    <!-- <sla id="sla" /> -->
    <startEndTime v-if="false" id="startEndTime"  :checkpointList="checkpointList" />
    <div class="timeline-table">
      <timeLine v-if="requestSuccess" :order-info="orderInfo" :checkpointList="checkpointList" @refreshCheckpointList="refreshCheckpointList" />
      <tableData v-if="requestSuccess" :order-info="orderInfo" :service-info="serviceInfo" :checkpointList="checkpointList" :polDeclarationArr="polDeclarationArr" @getScrollHeight="getScrollHeight" />
    </div>
    <work v-if="requestSuccess" :order-info="orderInfo" />
    <!-- <div class="trace">
      <img :src="require('@/views/opPlan/images/dingyue.png')" alt="">
      <div class="btn" @click="traceClick">订阅货物追踪</div>
    </div> -->
  </div>
</template>

<script>
import progressStep from './components/progressStep.vue'
// import todo from './components/todo.vue'
// import sla from './components/sla.vue'
import allInfo from './components/allInfo.vue'
import startEndTime from './components/startEndTime.vue'
import work from './components/work.vue'
import timeLine from './components/timeLine.vue'
import tableData from './components/tableData.vue'
import { getCheckpointList, getServiceList, traceSubscribe } from '@/api/order/opPlan.js'
import { orderInfo, getSubTypeList } from '@/api/order/list.js'
import { closePage } from '@/utils'
export default {
   data() {
      return {
        orderNo: this.$route.query.orderNo,
        orderInfo: {},
        serviceInfo: {},
        checkpointList: [],
        srollHeightList: [],
        requestSuccess: false,
        polDeclarationArr: []
      }
   },
   components: {
      progressStep,
      // todo,
      // sla,
      allInfo,
      startEndTime,
      timeLine,
      tableData,
      work,
   },
   created() {
      this.init()
   },
   methods: {
      init() {
        let request1 = orderInfo({orderNo: this.orderNo})
        let request2 = getCheckpointList({orderNo: this.orderNo})
        // let request3= getServiceList({orderNo: this.orderNo})
        this.requestSuccess = false
        Promise.all([request1, request2])
        .then(([res1,res2]) => {
           this.requestSuccess = true
           this.orderInfo = res1.data || {}
           if (this.orderInfo.serviceList && this.orderInfo.serviceList.includes('pol_declaration')) {
             // 判断报关、报检的勾选情况
            //  this.getSubTypeListData('pol_declaration')
           }
           this.checkpointList = res2.data || []
          //  this.serviceInfo = res3.data || {}
        })
        .catch(() => {
          this.requestSuccess = true
        })
      },
      refreshCheckpointList() {
         getCheckpointList({orderNo: this.orderNo})
         .then(res => {
          this.checkpointList = res.data || []
         })
      },
      getSubTypeListData(serviceCode) {
         getSubTypeList({orderNo: this.$route.query.orderNo, serviceCodes: [serviceCode]})
         .then(res => {
           if (res.data && res.data.length) {
              res.data.forEach(item => {
                if (item.chooseStatus === 'y') {
                  this.polDeclarationArr.push(item.typeCode)
                }
             })
           }
           console.log('报关报检勾选项：', this.polDeclarationArr)
         })
      },
      getCheckpointListData() {
        getCheckpointList({orderNo: this.orderNo})
        .then(res => {
          this.checkpointList = res.data || []
        })
      },
      getScrollHeight(arr) {
        this.srollHeightList = arr
      },
      getTopHeight() {
        let ids = ['header', 'progressStep', 'todo', 'sla', 'allInfo', 'startEndTime']
        let h = ''
        let heightVal = 0
        for (let i = 0; i < ids.length; i++) {
          h = document.getElementById(ids[i])
          if (h) {
            heightVal = heightVal + h.offsetHeight + 8
          }
        } 
        return heightVal
      },
      goToScrollHeight(id) {
        let list = this.srollHeightList.filter(item => {
          return item.id === id
        })
        if (list && list.length) {
          let topHeight = this.getTopHeight()
          let scrollHeightVal = list[0].scrollHeightVal
          console.log('滚动总高度为：', topHeight + scrollHeightVal)
          document.documentElement.scrollTop = topHeight + scrollHeightVal
        } else {
          return
        }
      },
      goBack() {
      //  let query = this.$route.query
      //  let routeUrl = this.$router.resolve({
      //    name: query.originRouteName,
      //    query,
      //    params: {
      //     orderNo: query.orderNo
      //    }
      //  })
      //  window.open(routeUrl.href, '_blank')

       closePage()
      },
      traceClick() {
         traceSubscribe({ orderNo: this.$route.query.orderNo })
         .then(res => {
          this.$message.success('订阅成功')
         })
      }
   }
}
</script>

<style lang="scss" scoped>
.opPlan {
  padding: 10px;
  background-color: #f5f7f9;
  .header {
    background-color: #ffffff;
    padding: 3px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .left {
      color: #222222;
      font-weight: bold;
    }
  }
  .timeline-table {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  .trace {
    position: fixed;
    top: 50%;
    left: 10px;
    width: 104px;
    height: 77px;
    background: #FFFFFF;
    box-shadow: 0px 4px 12px 0px rgba(148,172,201,0.5);
    border-radius: 7px;
    border: 1px solid #3E80F5;
    padding: 10px;
    text-align: center;
    .btn {
      color: #3E80F5;
      cursor: pointer;
      margin-top: 5px;
    }
  }
}
</style>