<template>
  <div class="finance-page">
    <div class="finance-container finance-regwriteoff regwriteoff">
      <el-tabs
        v-model="activeName"
        @tab-click="tabClick"
        class="fin-el-tabs">
        <el-tab-pane
          v-for="(item, index) in typesList"
          :key="'typesList' + index"
          :label="item.label"
          :name="item.name"
          class="fin-el-tab-pane">
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :isJumpRouteFromPage.sync="isJumpRouteFromPage" :ref="refStr" :is="component" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import ByFee from '@/views/finance/settlement/feeList/index'
import BySettleUnit from '@/views/finance/settlement/feeList/indexSU'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'byFee',
      typesList: [
        {
          label: '按费用',
          name: 'byFee'
        },
        {
          label: '按结算单位',
          name: 'bySettleUnit'
        },
      ],
      isJumpRouteFromPage: false
    }
  },
  components: {
    ByFee,
    BySettleUnit
  },
  created() {
    let finLStorage = localStorage.getItem('finLStorage')
    if (finLStorage) {
      finLStorage = JSON.parse(finLStorage)
      this.activeName = finLStorage.feeListActiveType ? finLStorage.feeListActiveType : this.activeName
    }
  },
  methods: {
    tabClick(tab, event) {
      let finLStorage = localStorage.getItem('finLStorage')
      finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
      finLStorage.feeListActiveType = this.activeName
      localStorage.setItem('finLStorage', JSON.stringify(finLStorage))
    },
  },
  computed: {
    component() {
      return this.activeName === 'byFee' ? ByFee : BySettleUnit
    },
    refStr() {
      return this.activeName === 'byFee' ? 'byFee' : 'bySettleUnit'
    }
  },
}
</script>

