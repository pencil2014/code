<template>
  <div class=""></div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import {mapState} from 'vuex'
import { mainInfo } from '@/api/order/list'

export default {
  data() {
    return {
      
    }
  },
  created() {
    this.getMainInfo()
  },
  mounted() {
  },
  computed: {
    
  },
  watch: {
  },
  components: {
  },
  methods: {
    getMainInfo() {
      mainInfo({ orderNo: this.$route.query.orderNo }).then(res => {
        if (!res.data) {
          return this.$message.error('未查寻到当前订单信息')
        }
        // 海运
        if (['ship_export_fcl', 'ship_export_lcl', 'ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro','ship_customs','ship_export_customs','ship_import_customs'].includes(res.data.businessType)) {
          let source = ''
          if (this.$route.query.jointNo) {
            if (res.data.businessType === 'ship_oversea_wh') {
              source = 'whJointList'
            } else {
              source = 'jointList'
            }
          } else {
            if (res.data.businessType === 'ship_oversea_wh') {
              source = 'whOrderList'
            } else {
              source = 'orderList'
            }
          }
          this.redirectUrl({
            name: this.$route.query.jointNo ? 'JointOrderDetail' : 'OrderDetail',
            query: {
              source,
              showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_bulk_ro'].includes(res.data.businessType),
              showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st26', 'st27', 'st28', 'st02', 'st04'].includes(res.data.serviceType),
              // showRelate: isSameCode && ['st01', 'st15', 'st09'].includes(res.data.serviceType)
            }
          })
        }
        // 空运
        if (['air_export', 'air_import'].includes(res.data.businessType)) {
          this.redirectUrl({
            name: 'AirTransportOrderDetail',
            query: {
              source: this.$route.query.jointNo ? 'jointList' : 'orderList',
            }
          })
        }
        // 铁路
        if (['rail_export_fcl', 'rail_export_lcl'].includes(res.data.businessType)) {
          this.redirectUrl({
            name: 'RailwayOrderDetail',
            query: {
              source: this.$route.query.jointNo ? 'jointList' : 'orderList',
              showBl: ['st07', 'st08'].includes(res.data.serviceType)
            }
          })
        }
      })
    },
    redirectUrl(param) {
      let {query} = this.$route
      this.$router.push({
        name: param.name,
        params: {
          orderNo: query.orderNo,
          jointNo: query.jointNo
        },
        query: {...query, ...param.query}
      })
    }
  }
}
</script>
<style lang="scss">
</style>
