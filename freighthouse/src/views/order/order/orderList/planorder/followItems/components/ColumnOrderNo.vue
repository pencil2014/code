<template>
  <el-tooltip placement="right"  popper-class="copyOrderNo-pop follow-items-orderNo-pop">
    <div class="copy-label" slot="content" @click="copy($event)">复制工作号</div>
    <div class="review-row-table-header-container orderno-class">
      <img v-if="isWhiteCust" :src="require(`@/views/order/order/images/white-new.png`)" class="img-class" />
      <span size="mini" class="underline" @click.stop="toDetail">{{ param.orderNo }}</span>
    </div>
  </el-tooltip>
</template>

<script>
import clip from '@/utils/clipboard'
import { mapState } from 'vuex'
export default {
  props: ['param', 'item'],
  data() {
    return {
      options: {
        'loa': 'FileList', // 托书
        'release': 'OrderBook', // 放舱
        'truck': 'ShippingTruck', // 起运港拖柜
        'vgm': 'ContainerList', // vgm
        'pol_warehouse': 'Warehouse', // 起运港仓储
        'stuffing': 'Warehouse', // 堆场
        'pol_ltl': 'PolLtl', // 起运港散车
        'pol_declaration': 'Clearance', // 报关
        'pol_inspection': 'Clearance', // 报检
        'fume': 'Fume', // 熏蒸
        'other_inspect': 'InspectionAndDetection', // 各类检验
        'mbl': 'BlList', // mbl
        'hbl': 'BlList', // hbl
        'doc': 'Document', // 贸易单证
        'insurance': 'Insurance', // 保险
        'pod_change_doc': 'PodChangeDoc', // 换单
        'pod_comm_clearance': 'PodCommClearance', // 清关
        'pod_warehouse': 'PodWarehouseIng', // 目的港仓储
        'delivery': 'PodFclDelivery', // 拖柜派送
        'delivery_ltl': 'PodLtlDelivery', // 散车派送
      },
      SiSubStatusTypeList: ['si_dn_bill_get', 'si_dn_fee_input']
    }
  },
  computed: {
		...mapState({
			serviceCodeVal: state => state.followItems.serviceCodeVal,
      subStatusTypeVal: state => state.followItems.subStatusTypeVal,
		}),
    isWhiteCust() {
      return ['Y', 'y'].includes(this.param.isWhiteCust)
    },
	},
  components: {
  },
  created() {
  },
  methods: {
    copy(e) {
			clip(this.param.orderNo, e)
		},
    toDetail() {
      console.log('param item', this.param, this.item)
      let orderNo = this.param.orderNo
      let routerName = ''
      let toTab = ''
      let queryObj = {}
      let paramsObj = {}
      if (this.options[this.serviceCodeVal]) {
        routerName = this.options[this.serviceCodeVal]
        if (this.serviceCodeVal === 'other_inspect') {
          // 各类检验
        } else if (['pol_declaration', 'pol_inspection'].includes(this.serviceCodeVal)) {
          // 报关 报检
          if (this.serviceCodeVal === 'pol_declaration') {
            toTab = 'Agent'
          } else {
            toTab = 'Inspection'
          }
        } else if (['pol_warehouse', 'stuffing'].includes(this.serviceCodeVal)) {
          // 仓储 堆场
            if (this.serviceCodeVal === 'pol_warehouse') {
            toTab = 'Warehouse'
          } else {
            toTab = 'YardBox'
          }
        } else if (this.serviceCodeVal === 'mbl' && this.SiSubStatusTypeList.includes(this.subStatusTypeVal)) {
          routerName = 'SiList'
        }
        
      } else {
        routerName = 'OrderDetail'
      }
      if (toTab) {
        queryObj = {
          toTab
        }
      }
      if (routerName !== 'SiList') {
        paramsObj = {
          orderNo
        }
      }
      let routeUrl = this.$router.resolve({
        name: routerName,
        params: paramsObj,
        query: {
          orderNo,
          ...queryObj
        }
      })
      window.open(routeUrl.href, '_blank')
    }
  },
}
</script>

<style lang="scss" scoped>
.orderno-class {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.img-class {
  width: 17px;
  height: 17px;
  margin-right: 3px;
}
</style>