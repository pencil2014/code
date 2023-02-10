<template>
  <div class="finance-page">
    <div class="finance-container finance-regwriteoff regwriteoff">
      <el-tabs
        v-model="activeName"
        @tab-click="tabClick"
        class="fin-el-tabs">
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="'tabsList' + index"
          :label="item.label"
          :name="item.name"
          class="fin-el-tab-pane">
          <!-- 切换时样式出现问题，利用component组件 -->
          <!-- <template>
            <div class="finance-search-tabs-gap">
            </div>
            <div v-show="item.name === 'gedgingList' && activeName === 'gedgingList'">
              <GedgingList ref="first" :isJumpRouteFromPage.sync='isJumpRouteFromPage' />
            </div>
            <div v-show="item.name === 'gedgingWriteOffList' && activeName === 'gedgingWriteOffList'">
              <GedgingWriteOffList ref="second" :isJumpRouteFromPage.sync='isJumpRouteFromPage' />
            </div>
          </template> -->
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :isJumpRouteFromPage.sync="isJumpRouteFromPage" :ref="refStr" :is="component" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import GedgingList from '@/views/finance/gedging/gedgingList'
import GedgingWriteOffList from '@/views/finance/otherWriteOff/gedgingWriteOffList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      orderNo: this.$store.state.finance.orderNo,
      activeName: 'gedgingList',
      tabsList: [
        {
          label: this.$t('Settle.createGedging'),
          name: 'gedgingList'
        },
        {
          label: this.$t('Hedge.hedgeWrite'),
          name: 'gedgingWriteOffList'
        },
      ],
      isJumpRouteFromPage: false
    }
  },
  components: {
    GedgingList,
    GedgingWriteOffList
  },
  methods: {
    tabClick(tab, event) {
    },
  },
  computed: {
    component() {
      return this.activeName === 'gedgingList' ? GedgingList : GedgingWriteOffList
    },
    refStr() {
      return this.activeName === 'gedgingList' ? 'gedgingList' : 'gedgingWriteOffList' // 'first' : 'second'
    }
  },
}
</script>
<style lang="scss" scoped>
</style>

