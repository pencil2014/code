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
      // 海运目的港服务项对应的router
      shipPodServiceObj: {
        'pod_comm_clearance': 'PodCommClearance',
        'pod_fcl_delivery': 'PodFclDelivery',
        'pod_warehouse': 'PodWarehouse',
        'pod_ltl_delivery': 'PodLtlDelivery'
      },
      // 空运目的港服务项对应的router
      airPodServiceObj: {
        'pod_comm_clearance': 'AirPodClearance',
        // 'pod_fcl_delivery': 'PodFclDelivery',
        'pod_warehouse': 'AirPodWarehouseIng',
        'pod_ltl_delivery': 'AirPodLtlDelivery'
      },
      // 铁路目的港服务项对应的router
      railPodServiceObj: {
        'pod_comm_clearance': 'RailPodCommClearance',
        'pod_fcl_delivery': 'RailPodFclDelivery',
        'pod_warehouse': 'RailPodWarehouseIng',
        'pod_ltl_delivery': 'RailPodLtlDelivery'
      },
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
      let { businessType, serviceType, serviceCode, orderNo, jointNo } = this.$route.query
      // 海运
      if (['ship_export_fcl', 'ship_export_lcl', 'ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro','ship_customs','ship_export_customs','ship_import_customs'].includes(businessType)) {
        let source = ''
        if (jointNo) {
          if (businessType === 'ship_oversea_wh') {
            source = 'whJointList'
          } else {
            source = 'jointList'
          }
        } else {
          if (businessType === 'ship_oversea_wh') {
            source = 'whOrderList'
          } else {
            source = 'orderList'
          }
        }
        this.redirectUrl({
          name: this.shipPodServiceObj[serviceCode],
          query: {
            source,
            showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_bulk_ro'].includes(businessType),
            showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st26', 'st27', 'st28', 'st02', 'st04'].includes(serviceType),
            // showRelate: isSameCode && ['st01', 'st15', 'st09'].includes(res.data.serviceType)
          }
        })
      }
      // 空运
      if (['air_export', 'air_import'].includes(businessType)) {
        this.redirectUrl({
          name: this.airPodServiceObj[serviceCode],
          query: {
            source: jointNo ? 'jointList' : 'orderList',
          }
        })
      }
      // 铁路
      if (['rail_export_fcl', 'rail_export_lcl'].includes(businessType)) {
        this.redirectUrl({
          name: this.railPodServiceObj[serviceCode],
          query: {
            source: jointNo ? 'jointList' : 'orderList',
            showBl: ['st07', 'st08'].includes(serviceType)
          }
        })
      }
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
