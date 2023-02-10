<template>
  <div class="progress">
    <!-- 港口信息 -->
    <div class="port-info">
      <div class="port-detail" v-if="barge.porPortCode || ship.polPortCode || ship.podPortCode">
        <div class="item" v-if="barge.porPortCode">
           <div class="key">驳船收货地：</div>
           <div class="value">{{ barge.porPortName }}({{ barge.porPortCode}})</div>
        </div>
        <div class="item" v-if="ship.polPortCode">
           <div class="key">大船起运港：</div>
           <div class="value">{{ ship.polPortName }}({{ ship.polPortCode}})</div>
        </div>
         <div class="item" v-if="ship.podPortCode">
           <div class="key">目的地：</div>
           <div class="value">{{ ship.podPortName }}({{ ship.podPortCode}})</div>
        </div>
      </div>
    </div>
    <!-- 服务项信息 -->
    <div class="server-info">
      <div class="line">
        <div class="item" :class="{'item-todo': !item.done}" v-for="(item, index) in showTimeOptions" :key="index">
          <div class="top">{{ item.label }}</div>
          <div class="bottom">{{ item.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
   props: {
     orderInfo: {
       type: Object,
       default: () => {
         return {}
       }
     },
     checkpointList: {
      type: Array,
      default: () => {
        return []
      }
     },
   },
  
   computed: {
     barge() {
       return (this.orderInfo && this.orderInfo.barge) || {}
     },
     ship() {
       return (this.orderInfo && this.orderInfo.ship) || {}
     },
     hasTransitPort() {
       // 判断是否包含中转港
       return this.ship.transitPortCode || this.ship.transitPortCode1 || this.ship.transitPortCode2
     },
     selfOrder() {
        // 客户自订
       return ['st02', 'st16', 'st17', 'st04', 'st19', 'st12', 'st10'].includes(this.orderInfo.serviceType)
     },
     serviceList() {
       return this.orderInfo.serviceList || []
     },
     serviceInfoList() {
       return this.orderInfo.serviceInfoList || []
     },
     showTimeOptions() {
       return this.timeOptions.filter(item => {
          return !item.serviceCode.length || item.serviceCode.some(item => this.serviceList.includes(item))
       })
     }
   },
   data() {
    return {
      timeOptions: [
         {
          label: '提交订单',
          serviceCode: [],
          isPriorityShow: [],
          pointCode: 'ORDER_SUBMIT',
        },
         {
          label: '审核通过',
          serviceCode: [],
          isPriorityShow: [],
          pointCode: 'ORDER_AUDIT_PASS',
        },
        {
          label: '订舱',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: ['book', 'proxy_book'],
          pointCode: ['BOOKED', 'BOOKING'],
        },
        {
          label: '放舱',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: [],
          pointCode: 'BOOK_RELEASE',
        },
        {
          label: '派车',
          serviceCode: ['truck', 'pol_ltl'],
          isPriorityShow: ['truck', 'pol_ltl'],
          pointCode: 'TRUCK_INTRUST',
        },
        {
          label: '还重',
          serviceCode: ['truck', 'pol_ltl'],
          isPriorityShow: ['pol_ltl'],
          pointCode: 'TRUCK_RETURN_FULL',
        },
        {
          label: 'VGM',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: [],
          pointCode: 'VGM_REPORT',
        },
        // {
        //   label: '舱单',
        //   serviceCode: ['ocean_manifest'],
        //   isPriorityShow: ['ocean_manifest'],
        //   pointCode: 'MANIFEST_REPORT',
        // },
        {
          label: '报关',
          serviceCode: ['pol_declaration'],
          isPriorityShow: ['pol_declaration'],
          pointCode: 'PRE_CUSTOMS',
        },
        {
          label: '补料',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: ['TD'],
          pointCode: 'SI',
        },
        {
          label: '开船',
          serviceCode: [],
          isPriorityShow: [],
          pointCode: 'ATD',
        },
        {
          label: 'OBD提单',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: [],
          pointCode: 'BL_OBD',
        },
        {
          label: '取单',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: [],
          pointCode: 'BL_TAKE',
        },
        {
          label: '放单',
          serviceCode: ['book', 'proxy_book'],
          isPriorityShow: [],
          pointCode: 'BL_PUT',
        },
        {
          label: '到港',
          serviceCode: [],
          isPriorityShow: [],
          pointCode: 'ATA',
        },
        {
          label: '换单',
          serviceCode: ['pod_change_doc'],
          isPriorityShow: ['pod_change_doc'],
          pointCode: 'EXCHANGE_DOC',
        },
        {
          label: '清关',
          serviceCode: ['pod_comm_clearance'],
          isPriorityShow: ['pod_comm_clearance'],
          pointCode: 'PRE_CUSTOMS_CLEARANCE',
        },
        {
          label: '提货',
          serviceCode: ['pod_ltl_delivery', 'pod_fcl_delivery'],
          isPriorityShow: ['pod_ltl_delivery', 'pod_fcl_delivery'],
          pointCode: 'PICKUP_TIME',
        },
        {
          label: '派送',
          serviceCode: ['pod_ltl_delivery', 'pod_fcl_delivery'],
          isPriorityShow: ['pod_ltl_delivery', 'pod_fcl_delivery'],
          pointCode: 'PRE_DELIVERY',
        },
        {
          label: '签收完成',
          serviceCode: ['pod_ltl_delivery', 'pod_fcl_delivery'],
          isPriorityShow: [],
          pointCode: 'SIGNED',
        },
        {
          label: '还空',
          serviceCode: ['pod_fcl_delivery'],
          isPriorityShow: ['pod_fcl_delivery'],
          pointCode: 'RETURN_EMPTY',
        },
      ]
    }
   },
   created() {
     this.init()
   },
   watch: {
    'checkpointList': {
      handler(val) {
         this.init()
      },
      deep: true
    }
  },
   methods: {
     init() {
       let ossObj = {}
       let noOssObj = {}
       this.timeOptions = this.timeOptions.map(item1 => {
         if (Array.isArray(item1.pointCode)) {
            let len = item1.pointCode.length
            for (let i = 0; i < len; i++) {
              ossObj = this.checkpointList.find(item2 => {
              return (item2.pointCode === item1.pointCode[i] && item2.source === 'oss')
              }) || {}
              noOssObj = this.checkpointList.find(item2 => {
                return (item2.pointCode === item1.pointCode[i] && item2.source !== 'oss')
              }) || {}
              if (Object.values(ossObj).length || Object.values(noOssObj).length) {
                break
              }
            }
            return Object.assign(item1, {
              source: ossObj.source || noOssObj.source || '',
              value: ossObj.bizTime || noOssObj.bizTime || '',
              done: !!(ossObj.pointCode || noOssObj.pointCode),
            })
         } else {
            ossObj = this.checkpointList.find(item2 => {
            return (item2.pointCode === item1.pointCode && item2.source === 'oss')
            }) || {}
            noOssObj = this.checkpointList.find(item2 => {
              return (item2.pointCode === item1.pointCode && item2.source !== 'oss')
            }) || {}
            return Object.assign(item1, {
              source: ossObj.source || noOssObj.source || '',
              value: ossObj.bizTime || noOssObj.bizTime || '',
              done: !!(ossObj.pointCode || noOssObj.pointCode),
            })
         }
       })
     },
   }
}
</script>

<style lang="scss" scoped>
.progress {
  margin-top: 8px;
  background-color: #ffffff;
  padding: 10px 16px;
  .port-info {
    .port-detail {
      display: flex;
      justify-content: space-between;
      .item {
         display: flex;
         font-size: 12px;
         color: #000;
      }
    }
  }
  .server-info {
    .line {
        display: flex;
        justify-content: space-around;
        .item {
          position: relative;
          color: #3E80F5;
          margin-top: 5px;
          width: 100%;
          text-align: center;
          background-color: #dfeafd;
          height: 100px;
          .top {
            height: 20px;
            margin-top: 24px;
          }
          .bottom {
            height: 30px;
            margin-top: 15px;
          }
          &:after{
            content: '';
            display: block;
            position: absolute;
            width: 10px;
            height: 10px;
            background:#3E80F5;
            border-radius: 5px;
            left: 48%;
            top: 45px;
          }
          &::before{
            content: '';
            display: block;
            position: absolute;
            width: 100%;
            height: 2px;
            background:#3E80F5;
            left: 0px;
            top: 49px;
            bottom: -19px;
          }
        }
        .item-todo {
          color: #4A4A4A;
          background: #ffffff;
          &:after{
            background-color: #D9D9D9;
          }
          &::before{
            background-color: #D9D9D9;
          }
        }
    }
  }
}
</style>