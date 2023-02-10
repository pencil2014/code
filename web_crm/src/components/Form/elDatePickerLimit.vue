<template>
  <el-date-picker  
      size="mini" 
      v-model="model"
      :type="type"
      :name="name"
      :readonly="readonly"
      :disabled="disabled"
      :editable="editable"
      :clearable="clearable"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :placeholder="placeholder"
      :format="format || getValueFormat"
      :align="align"
      :popper-class="popperClass"
      :default-value="defaultValue"
      :default-time="defaultTime"
      :value-format="valueFormat || getValueFormat"
      :picker-options="defaultPickerOptions"
      @change="change"
   />
</template>

<script>
import { mapState } from "vuex"
export default {
    props: {
      field: {
        type: String,
        default: ''
      },
      noCanFuture: {
        type: Boolean,
        default: false
      },
      value: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'date'
      },
      name: {
        type: String,
        default: ''
      },
      readonly: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      editable: {
        type: Boolean,
        default: true
      },
      clearable: {
        type: Boolean,
        default: true
      },
      'start-placeholder': {
        type: String,
        default: '开始时间'
      },
      'end-placeholder': {
        type: String,
        default: '结束时间'
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      format: {
        type: String,
        default: ''
      },
      align: {
        type: String,
        default: 'left'
      },
      'popper-class': {
        type: String,
        default: ''
      },
      'default-value': {
        type: String,
        default: ''
      },
      "default-time": {
        type: String,
        default: ''
      },
      'value-format': {
        type: String,
        default: ''
      },
      pickerOptions: {
        type: Object,
      }
    },
    computed: {
      ...mapState({
        limitDate: (state) => state.app.limitDate,
        orderInfo: (state) => state.order.orderInfoDataObj, // 海运订单详情
        airOrderInfo: (state) => state.airTransport.airOrderInfo, // 空运订单详情
        railwayOrderInfo: state => state.railway.orderInfoDataObj, // 铁路订单详情
      }),
      getValueFormat() {
        if (this.type === 'datetime') {
          return 'yyyy-MM-dd HH:mm:ss'
        } else {
          return 'yyyy-MM-dd'
        }
      },
      orderInfoObj() {
        if (this.orderInfo && this.orderInfo.createdTime) {
          return this.orderInfo
        } else if (this.airOrderInfo && this.airOrderInfo.createdTime) {
          return this.airOrderInfo
        } else if (this.railwayOrderInfo && this.railwayOrderInfo.main) {
          return this.railwayOrderInfo.main
        } else {
          return {}
        }
      },
      businessType() {
        // 业务类型
        return this.orderInfoObj.businessType || ''
      },
      bizDate() {
        // 业务日期
        return this.orderInfoObj.bizDate || ''
      },
      createdTime() {
        // 订单创建时间
        return this.orderInfoObj.createdTime || ''
      }
    },
    watch: {
      value(val) {
        this.model = val
      }
    },
    data() {
      let self = this
      return {
        model: '',
        defaultPickerOptions: {
          disabledDate(time) {
            if (self.limitDate) {
              return self.getTimeVal(time)
            } else {
              return false
            }
          }
        }
      }
    },
    mounted() {
      if(this.value){
        this.model = this.value
      }
    },
    created() {
      this.$store.dispatch('app/setDateLimit')
    },
    methods: {
      getTimeVal(currentTime) {
        currentTime = currentTime.getTime()
        let checkDate = ''
        let intervalMonth = ''
        if (this.businessType.includes('air_import') || this.businessType.includes('ship_import')) {
           // 空运进口、海运进口的各个时间：
           // 若订单还未有业务日期，则限制只能录入 订单创建当天的 6 个月之前或者之后的；
           // 若订单已有业务日期，则限制只能录入 业务日期的 6 个月之前或者之后的；
           checkDate = this.bizDate || this.createdTime
           intervalMonth = 6
        } else if (this.businessType.includes('rail')) {
          //   铁路：
          if (['etdTime'].includes(this.field)) {
            // a. 预计发车时间：限制只能录入 订单创建当天的 2 个月之前或者之后的；
            checkDate = this.createdTime
            intervalMonth = 2
          } else {
            // b. 其他时间：限制只能录入业务日期的前后 3 个月内的时间；
            checkDate = this.bizDate
            intervalMonth = 3
          }
        } else if (this.businessType.includes('air_export')) {
          // 空运出口：
          if (['etdTime', 'etdTime1'].includes(this.field)) {
            // a. 预计起飞时间、国际1程的预计起飞时间：限制只能录入 订单创建当天的 2 个月之前或者之后的；
            checkDate = this.createdTime
            intervalMonth = 2
          } else {
             // b. 其他时间：限制只能录入业务日期的前后 3 个月内的时间；
            checkDate = this.bizDate
            intervalMonth = 3
          }
        } else if (this.businessType.includes('ship_export') || this.businessType.includes('ship_bulk_ro')) {
          // 海运出口、散杂滚装出口：
          if (['bargeEtdTime', 'etdTime'].includes(this.field)) {
            // a. 驳船预计开船时间、大船预计开船时间：限制只能录入 订单创建当天的 3 个月之前或者之后的；
            checkDate = this.createdTime
            intervalMonth = 3
          } else if (
            // b. 起运港的其他时间：// 限制只能录入业务日期的前后 3 个月内的时间；
            // 驳船实际开船时间、大船实际开船时间、截补料时间、截VGM时间、截报关时间、截放行时间、大船截关时间、驳船截关时间
            ['bargeTdTime', 'tdTime', 'siCutOff', 'vgmCutOff', 'ccCutOff', 'cvCutOff', 'cyCutOff', 'bargeCyCutOff'].includes(this.field) || 
            // “起运港拖柜” “起运港散车” “起运港报关/报检” “起运港仓储/堆场装箱” “熏蒸、各类检验”
            ['ShippingTruck', 'PolLtl', 'Clearance', 'Warehouse', 'Fume', 'InspectionAndDetection'].includes(this.$route.name)
          ) { 
            
            checkDate = this.bizDate
            intervalMonth = 3
          } else if (
            // c. 目的港的其他时间：限制只能录入业务日期的前后 6 个月内的时间；
            // 大船预计到港时间、大船实际到港时间、客户要求到港时间
            ['etaTime', 'taTime', 'taTimeCust'].includes(this.field) || 
            // 目的港换单 目的港委托清关 目的港仓储 目的港散车派送 目的港拖柜派送
             ['PodChangeDoc', 'PodCommClearance', 'PodWarehouseIng', 'PodLtlDelivery', 'PodFclDelivery'].includes(this.$route.name)
          ) {
            checkDate = this.bizDate
            intervalMonth = 6
          }
        }
        if (!checkDate || !intervalMonth) {
          if (['OrderDetail', 'RailwayOrderDetail', 'AirTransportOrderDetail'].includes(this.$route.name)) {
            checkDate = Date.now()
            intervalMonth = 2
          } else if (this.noCanFuture) {
             // 针对 实际时间、换单完成时间、签收时间、还空柜时间 不能选未来日期
            let nowDate = Date.now()
            return currentTime > nowDate
          } else {
            return false
          }
        }
        let obj = this.getTimeInterval(checkDate, intervalMonth)
        let { startTime, endTime } = obj
        if (this.noCanFuture) {
            // 针对 实际时间、换单完成时间、签收时间、还空柜时间 不能选未来日期
            let nowDate = Date.now()
            if (nowDate < startTime) {
              return true
            } else if (nowDate < endTime) {
              return currentTime < startTime || currentTime > nowDate
            } else {
              return currentTime < startTime || currentTime > endTime
            }
        } else {
            return currentTime < startTime || currentTime > endTime
        }
      },
      getTimeInterval(time, intervalMonth) {
         if ((time + '').includes('-')) {
           time = time.slice(0, 10) + ' 00:00:00' // 针对 订单创建时间精确到了时分秒，所以把订单创建时间的时分秒换成 00:00:00
           time = new Date(time)
           time = time.getTime()
         }
         let interValTime = intervalMonth * 30  * 24 * 60 * 60 * 1000
         let startTime = time - interValTime
         let endTime = time + interValTime
         return { startTime, endTime }
      },
      change(val) {
         this.$emit("input", val)
         this.$emit('change', val)
      }
    }
}
</script>

<style>

</style>