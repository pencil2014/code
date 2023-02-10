<template>
  <div class="finance-container finance-regwriteoff regwriteoff">
    <div class="finance-page">
      <el-tabs v-model="activeName" @tab-click="tabClick" class="fin-el-tabs">
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="'tabsList' + index"
          :label="item.label"
          :name="item.name"
          class="fin-el-tab-pane"
        >
          <!-- <template v-if="true">
            <div v-if="item.name === 'regList' && activeName === 'regList'">
              <RegList :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
            </div>
            <div v-if="item.name === 'prerevList' && activeName === 'prerevList'">
              <PrerevList :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
            </div>
            <div v-if="item.name === 'writeoffRecvList' && activeName === 'writeoffRecvList'">
              <WriteoffRecvList :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
            </div>
          </template> -->
        </el-tab-pane>
      </el-tabs>
      <!-- 跳转更新需要好好测，暂不优化 -->
      <!-- 为提升性能，暂时牺牲部分不常用的路由跳转问题 -->
      <keep-alive>
        <component
          :isTabChange.sync="isTabChange"
          :ref="activeName"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import RegList from '../reg/index'
import PrerevList from '../prerev/index'
import WriteoffRecvList from '../writeoffRecv/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'regList',
      tabsList: [
        {
          label: '收款登记',
          name: 'regList',
        },
        {
          label: '预收款',
          name: 'prerevList',
        },
        {
          label: '收款核销',
          name: 'writeoffRecvList',
        },
      ],
      isJumpRouteFromPage: false,
      componentCfg: {
        regList: RegList,
        prerevList: PrerevList,
        writeoffRecvList: WriteoffRecvList,
      },
      isTabChange: false,
    }
  },
  created() {},
  components: {
    RegList,
    WriteoffRecvList,
    PrerevList,
  },
  methods: {
    tabClick(tab, event) {},
  },
  computed: {
    component() {
      // let obj = {
      //   regList: RegList,
      //   prerevList: WriteoffRecvList,
      //   writeoffRecvList: PrerevList,
      // }
      return this.componentCfg[this.activeName]
    },
  },
}
</script>
<style lang="scss">
</style>

