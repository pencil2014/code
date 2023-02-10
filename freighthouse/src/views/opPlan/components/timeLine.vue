<template>
  <div class="timeLine">
     <div class="border-bold">
        <div class="startEnd">
            <div class="item" v-for="(item, index) in showList" :key="index">
              <div class="key">{{item.label}}：</div>
              <div class="value">{{item.value}}</div>
            </div>
        </div>
        <div class="time-tip">
      <div class="btn">
        <el-button :loading="traceLoading" @click="traceClick" type="default" size="mini">刷新结果</el-button>
      </div>
      <div class="text">
        <div class="text-class text-todo">未完成</div>
        <div class="text-class text-doing">部分完成</div>
        <div class="text-class text-done">全部完成</div>
      </div>
        </div>
        <template v-if="hasTimeValue">
          <div v-for="(item, index) in options" :key="index" class="time" :class="{'time-todo': !item.done, 'time-doing': item.trackFinishStatus === 'no'}">
              <el-popover
                v-if="item.containerInfoStatusDtos.length"
                placement="right"
                popper-class="op-plan-popover-class"
                trigger="hover">
                <div class="popover-class">
                  <div class="header">
                    <div class="left">
                      <div class="btn-form">
                        <div class="key">SO号或箱号</div>
                        <div class="value"><el-input clearable v-model="item.searchValue" size="mini" placeholder="请输入SO号或箱号"></el-input></div>
                      </div>
                    </div>
                  </div>
                  <div class="content">
                    <template v-if="showContainerInfoStatusDtos(item).length">
                        <div v-for="(o, i) in showContainerInfoStatusDtos(item)" :key="i" class="item item-done">
                          <div class="item-row">
                            <div class="row-key so">SO号：</div>
                            <el-tooltip class="row-value" v-if="o.soNo && o.soNo.length > 19" effect="dark" :content="o.soNo" placement="top">
                              <div class=""> {{ o.soNo }}</div>
                            </el-tooltip>
                            <div v-else class="row-value">{{ o.soNo }}</div>
                          </div>
                          <div class="item-row ">
                            <div class="row-key contrNo">箱号：</div>
                            <el-tooltip class="row-value" v-if="o.contrNo && o.contrNo.length > 19" effect="dark" :content="o.contrNo" placement="top">
                              <div class=""> {{ o.contrNo }}</div>
                            </el-tooltip>
                            <div v-else class="row-value">{{ o.contrNo }}</div>
                          </div>
                          <div class="item-row">
                            <div class="row-key">完成时间：</div>
                            <div class="row-value-large">{{ o.statusTime }}</div>
                          </div>
                        </div>
                    </template>
                    <template v-else>
                      <div class="empty-class">没有符合条件的数据</div>
                    </template>
                  </div>
                </div>
                <div  slot="reference">
                  <div class="time-content">
                      <div class="time-label">{{ item.label }}</div>
                      <div>
                        <div v-for="(o,i) in item.value" :key="i" class="time-value">
                          <div>{{ o.bizTime || '已放行'}}</div>
                          <!-- <div class="time-source">（{{ o.source.toLowerCase() | getDictLabelFilter('opPlanCheckpointSource')}}）</div> -->
                          <div class="time-source">（{{ o.source.toLowerCase() === 'oss' ? '系统录入' : '第三方获取' }}）</div>
                        </div>
                      </div>
                  </div>
                </div>
              </el-popover>
              <div class="time-content" v-if="!item.containerInfoStatusDtos.length">
                <div class="time-label">{{ item.label }}</div>
                  <div>
                    <div v-for="(o,i) in item.value" :key="i" class="time-value">
                      <div>{{ o.bizTime || '已放行'}}</div>
                      <!-- <div class="time-source">（{{ o.source.toLowerCase() | getDictLabelFilter('opPlanCheckpointSource')}}）</div> -->
                      <div class="time-source">（{{ o.source.toLowerCase() === 'oss' ? '系统录入' : '第三方获取' }}）</div>
                    </div>
                  </div>
              </div>
          </div>
        </template>
        <template v-if="!hasTimeValue">
          <div v-for="(item, index) in options" :key="index" class="time-null-class" :class="{'time-todo': !item.done, 'time-doing': item.trackFinishStatus === 'no'}">
            <div class="time-content">
                <div class="time-label">{{ item.label }}</div>
            </div>
          </div>
        </template>
     </div>
  </div>
</template>

<script>
import { getPortListCodes, traceSubscribe } from '@/api/order/opPlan.js'
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
    }
  },
  computed: {
    selfOrder() {
      // 客户自订
      return ['st02', 'st16', 'st17', 'st04', 'st19', 'st12', 'st10'].includes(this.orderInfo.serviceType)
    },
    serviceList() {
      return this.orderInfo.serviceList || []
    },
    ship() {
      return this.orderInfo.ship || {}
    },
    showList() {
      return this.timeOptions.filter(item => {
        return !item.haveShow || item.value
      })
    },
    hasTimeValue() {
      return this.options.some(item => {
        return item.value && item.value.length
      })
    },
  },
   data() {
     return {
       traceLoading: false,
       hasValueShow: ['BERTHING', 'UNBERTHING'],
       polPortCityCode: '',
       timeOptions: [
         {
           label: '截港时间',
           pointCode: 'TERMINAL_CUT_OFF',
           haveShow: true, // 接口返回了才展示，否则整个都不展示
         },
         {
           label: '预计靠泊时间',
           pointCode: 'PRE_BERTHING',
           haveShow: true,
         },
         {
           label: '预计离泊时间',
           pointCode: 'PRE_UNBERTHING',
           haveShow: true,
         },
         {
           label: '截补料',
           pointCode: 'SI_CUT_OFF',
           format: 'YYYY-MM-DD HH',
         },
         {
           label: '截VGM',
           pointCode: 'VGM_CUT_OFF',
           format: 'YYYY-MM-DD HH',
         },
         {
           label: '截舱单',
           pointCode: 'MANIFEST_CUT_OFF',
           haveShow: true,
         },
         {
           label: '预计开船时间',
           pointCode: 'ETD',
           format: 'YYYY-MM-DD',
         },
         {
           label: '预计到港时间',
           pointCode: 'ETA',
           format: 'YYYY-MM-DD',
         }
      ],
       options: [
         {
           label: '实际靠泊',
           pointCode: 'BERTHING',
           value: [],
           serviceCode: ['book', 'proxy_book'],
           searchValue: '',
         },
         {
           label: '开港时间',
           pointCode: 'TERMINAL_OPEN',
           value: [],
           serviceCode: ['book', 'proxy_book'],
           searchValue: '',
         },
         {
           label: '提空时间',
           pointCode: 'SO_PICK_EMPTY',
           value: [],
           serviceCode: ['truck'],
           searchValue: '',
         },
         {
           label: '还重',
           pointCode: 'TRUCK_RETURN_FULL',
           value: [],
           serviceCode: ['truck'],
           searchValue: '',
         },
        //  {
        //    label: 'VGM',
        //    pointCode: 'VGM_REPORT',
        //    value: [],
        //    serviceCode: ['book', 'proxy_book'],
        //  },
        //  {
        //    label: '舱单',
        //    pointCode: 'MANIFEST_REPORT',
        //    value: [],
        //    serviceCode: ['ocean_manifest'],
        //  },
         {
           label: '海关放行',
           pointCode: 'CUSTOMS_RELEASE',
           value: [],
           serviceCode: ['pol_declaration'],
           searchValue: '',
         },
         {
           label: '码头放行',
           pointCode: 'TERMINAL_RELEASE',
           value: [],
           serviceCode: ['pol_declaration'],
           searchValue: '',
         },
         {
           label: '装船',
           pointCode: 'LOADING',
           value: [],
           serviceCode: [],
           searchValue: '',
         },
         {
           label: '实际离泊',
           pointCode: 'UNBERTHING',
           value: [],
           serviceCode: [],
           searchValue: '',
         },
         {
           label: '实际开船',
           pointCode: 'ATD',
           value: [],
           serviceCode: [],
           searchValue: '',
         }, 
         {
           label: '中转换船',
           pointCode: 'TRANSHIP',
           value: [],
           serviceCode: [],
           searchValue: '',
         },
         {
           label: '中转开航',
           pointCode: 'TRANSIT_TD',
           value: [],
           serviceCode: [],
           searchValue: '',
         },
         {
           label: '实际到港',
           pointCode: 'ATA',
           value: [],
           serviceCode: [],
           searchValue: '',
         },
         {
           label: '卸船',
           pointCode: 'UNLOADING',
           value: [],
           serviceCode: [],
           searchValue: '',
         }, 
         {
           label: '提货',
           pointCode: 'PICKUP_TIME',
           value: [],
           serviceCode: ['pod_ltl_delivery', 'pod_fcl_delivery'],
           searchValue: '',
         },
         {
           label: '还空',
           pointCode: 'RETURN_EMPTY',
           value: [],
           serviceCode: ['pod_fcl_delivery'],
           searchValue: '',
         },
       ],
       timerTr: null,
     }
   },
   watch: {
    'checkpointList': {
      handler(val) {
         this.init()
         this.initDate()
      },
      deep: true
    }
   },
   created() {
     this.init()
     this.initDate()
     console.log('来源字典：', this.$store.state.dict.dictMap.opPlanCheckpointSource)
   },
   beforeDestroy() {
    clearInterval(this.timerTr)
    this.timerTr = null
   },
   methods: {
     init() {
       let ossArr = []
       let noOssArr = []
       this.options = this.options.map(item1 => {
         ossArr = this.checkpointList.filter(item2 => {
          return item2.pointCode === item1.pointCode && item2.source === 'oss'
         }) || []
         noOssArr = this.checkpointList.filter(item2 => {
          return item2.pointCode === item1.pointCode && item2.source !== 'oss'
         }) || []
         return Object.assign(item1, {
          trackFinishStatus: (noOssArr[0] && noOssArr[0].trackFinishStatus) || (ossArr[0] && ossArr[0].trackFinishStatus) || '',
          containerInfoStatusDtos: (noOssArr[0] && noOssArr[0].containerInfoStatusDtos) || [],
          done: !!((ossArr[0] && ossArr[0].pointCode) || (noOssArr[0] && noOssArr[0].pointCode)),
          value: [
            ...ossArr,
            ...noOssArr
          ]
         })
       })
       if ((this.serviceList.includes('book') || this.serviceList.includes('proxy_book')) && this.orderInfo.ship.polPortCode) {
         getPortListCodes({portCodes: [this.orderInfo.ship.polPortCode]})
         .then(res => {
          if (res.data && res.data.length)
            this.polPortCityCode = res.data[0].cityCode
            this.getOptions()
         })
       } else {
        this.getOptions()
       }
     },
     initDate() {
        let obj = {}
        this.timeOptions = this.timeOptions.map(item1 => {
          obj = this.checkpointList.find(item2 => {
          return (item2.pointCode === item1.pointCode && item2.source === 'oss')
          }) || {}
          return Object.assign(item1, {
            value: this.mapDate(item1.format, obj)
          })
        })
     },
      mapDate(format, obj) {
       if (obj.bizTime) {
         if (format === 'YYYY-MM-DD') {
            return obj.bizTime.slice(0, 10)
         } else if (format === 'YYYY-MM-DD HH') {
            return obj.bizTime.slice(0, 13)
         } else if (format === 'YYYY-MM-DD HH:mm') {
            return obj.bizTime.slice(0, 16)
         } else {
            return obj.bizTime
         }
       } else {
         return ''
       }
    },
     getOptions() {
      this.options = this.options.filter(item => {
        //  (!item.serviceCode.length || item.serviceCode.some(item => this.serviceList.includes(item))) && // 对应的服务项才展示
       return (!this.hasValueShow.includes(item.pointCode) || item.value.some(item1 => item1.bizTime)) && // 有些字段有值才展示
        (item.pointCode !== 'TERMINAL_OPEN' || !['GUANGZHOU', 'SHENZHEN'].includes(this.polPortCityCode)) // 起运港城市是广州或者深圳不展示 开港时间
      })
     },
     showContainerInfoStatusDtos(item) {
      return item.containerInfoStatusDtos.filter(o => {
        return (!item.searchValue || o.soNo.includes(item.searchValue) || o.contrNo.includes(item.searchValue))
      })
     },
     debounceLxz(fn, time = 5000) {
      clearInterval(this.timerTr)
      this.timerTr = setInterval(() => {
        if (!fn || !(fn instanceof Function)) {
          this.$message({
            message: '参数错误！',
            type: 'error',
            showClose: true
          })
        } else {
          fn()
        }
      }, time)
    },
     traceClick() {
        this.refreshData()
        this.debounceLxz(() => {
          this.$emit('refreshCheckpointList')
        })
     },
     refreshData() {
      this.traceLoading = true
      traceSubscribe({ orderNo: this.$route.query.orderNo })
      .then(res => {
      this.$message.success('刷新成功')
      })
      .finally(() => {
        this.traceLoading = false
      })
     }
   }
}
</script>

<style lang="scss" scoped>
.timeLine {
  width: 500px;
  background-color: #fff;
  padding: 8px 8px;
  .border-bold {
    background-color: #f3f6fb;
    border: 1px solid #3E80F5;
  }
  .time-tip {
    color: #7a7a7a;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    .btn {
      width: 100px;
      text-align: center;
    }
    .text {
      width:calc(100% - 120px);
      display: flex;
      justify-content: space-around;
      .text-todo {
        position: relative;
        &::after {
          position: absolute;
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 5px;
          left: -15px;
          top: 1px;
          background:#D9D9D9;
        }
      }
      .text-doing {
        position: relative;
        &::after {
          position: absolute;
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 5px;
          left: -15px;
          top: 1px;
          background:#DFA725;
        }
      }
      .text-done {
        position: relative;
        &::after {
          position: absolute;
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 5px;
          left: -15px;
          top: 1px;
          background:#3E80F5;
        }
      }
    }
  }
  .startEnd {
    margin: 0 0 5px 0;
    padding: 5px 10px 5px 10px;
    background-color: #3E80F5 ;
    color: #fff;
    display: flex;
    flex-wrap: wrap;
    .item {
      display: flex;
      width: 48%;
      margin-top: 5px;
      .key {
        width: 90px;
        text-align: right;
      }
      .value {
        width: calc(100% - 90px);
      }
    }
  }
  .time+.time {
    margin-top: 10px;
  }
  .time {
    min-height: 30px;
    width: 440px;
    font-size: 12px;
    color: #3E80F5;
    display: flex;
    position: relative;
    .empty-class {
      width: 50%;
    }
    .time-content {
      display: flex;
    }
    .time-value {
      display: flex;
      margin-left: 60px;
    }
    .time-value+.time-value {
      margin-top: 5px;
    }
    .time-label {
      font-weight: bold;
      width: 130px;
      text-align: right;
      height: 20px;
      font-size: 12px;
    }
    .time-source {
      margin-right: 10x;
    }
    &::after{
      content: '';
      display: block;
      position: absolute;
      width: 10px;
      height: 10px;
      background:#3E80F5;
      border-radius: 5px;
      left: 155px;
      top: 2px;
    }
    &::before{
      content: '';
      display: block;
      position: absolute;
      width:2px;
      background:#3E80F5;
      left: 159px;
      top: 9px;
      bottom: -19px;
    }
    &:hover {
      .time-value {
         font-size: 13px;
      }
      .time-label {
         font-size: 13px;
      }
      &::after{
        width: 13px;
        height: 13px;
        border-radius: 6.5px;
        left: 153px;
      }
    }
    &:last-child{
      &::before{
        display: none;
      }
    }
  }
  .time-null-class+.time-null-class {
    margin-top: 10px;
  }
  .time-null-class {
    min-height: 30px;
    width: 440px;
    font-size: 12px;
    position: relative;
    .time-label {
      width: 230px;
      text-align: right;
    }
    &::after{
      content: '';
      display: block;
      position: absolute;
      width: 10px;
      height: 10px;
      background:#3E80F5;
      border-radius: 5px;
      left: 255px;
      top: 2px;
    }
    &::before{
      content: '';
      display: block;
      position: absolute;
      width:2px;
      background:#3E80F5;
      left: 259px;
      top: 9px;
      bottom: -19px;
    }
    &:hover {
      .time-value {
         font-size: 13px;
      }
      .time-label {
         font-size: 13px;
      }
      &::after{
        width: 13px;
        height: 13px;
        border-radius: 6.5px;
        left: 253px;
      }
    }
    &:last-child{
      &::before{
        display: none;
      }
    }
  }
  .time-todo {
     color: #4A4A4A;
     &:after{ 
       background-color: #D9D9D9;
     }
     &::before{
       background-color: #D9D9D9;
     }
  }
  .time-doing {
     color: #DFA725;
     &:after{ 
       background-color: #DFA725;
     }
     &::before{
       background-color: #DFA725;
     }
  }
}
</style>