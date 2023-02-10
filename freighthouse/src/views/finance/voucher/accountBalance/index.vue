<template>
  <div class="finance-page">
    <div class="account-balance">
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        class="fi-el-tabs"
      >
        <el-tab-pane
          v-for="item in tabsList"
          :label="item.value"
          :name="item.name"
          :key="item.name"
        >
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :is="activeName" @changeTab="changeTab"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import List from './components/list'
import ListDetail from './components/listDetail'
import Dimension from './components/dimension'
import DimensionDetail from './components/dimensionDetail'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  components: {
    List,
    ListDetail,
    Dimension,
    DimensionDetail
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      tabsList: [
        {
          name: 'List',
          value: '科目余额表'
        },
        {
          name: 'ListDetail',
          value: '科目余额明细表'
        },
        {
          name: 'Dimension',
          value: '核算维度余额表'
        },
        {
          name: 'DimensionDetail',
          value: '核算维度明细表'
        }
      ],
      activeName: 'List'
    }
  },
  methods: {
    handleClick(tab, event) {},
    changeTab(name) {
      this.activeName = name
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-page ::v-deep {
  .fi-el-tabs {
    .el-tabs__nav-scroll {
      padding-left: 20px;
    }
    .el-tabs__header {
      padding-top: 5px;
    }
    .el-tabs__item {
      color: #bfbfbf;
      &.is-active {
        color: #222;
        font-weight: 600;
      }
    }
  }
}
.account-balance {
  background-color: #fff;
}
</style>
