<template>
  <div class="finance-page">
    <div class="finance-container finance-regwriteoff regwriteoff">
      <el-tabs v-model="activeType" @tab-click="tabClick" class="fin-el-tabs">
        <el-tab-pane
          v-for="(item, index) in typesList"
          :key="'typesList' + index"
          :label="item.label"
          :name="item.name"
          class="fin-el-tab-pane"
        ></el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :isJumpRouteFromPage1.sync="isJumpRouteFromPage" :ref="activeType" :is="activeType" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import BankList from './bankList'
import BankNameList from './bankNameList'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [ routerMixin],
  data() {
    return {
      activeType: 'BankList',
      typesList: [
        {
          label: '银行信息',
          name: 'BankList',
        },
        {
          label: '开户行',
          name: 'BankNameList',
        },
      ],
      isJumpRouteFromPage: false,
    }
  },
  components: {
    BankList,
    BankNameList,
  },
  methods: {
    tabClick(tab, event) {},
  },
}
</script>
<style lang="scss" scoped>
</style>

