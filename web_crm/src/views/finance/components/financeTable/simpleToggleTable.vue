<template>
  <div class="toggle-div" :class="{noBorder:!tableOption.title}">
    <div class="toggle-title" v-if="tableOption.title">
      <!-- <span>{{ tableOption.title }}</span> -->
      <div class="title title-left">{{ tableOption.title }}</div>
      <div class="title-right">
        <slot name="right-button" />
        <div class="title-right-toggle" @click="showData = !showData">
          <span class="right-text">{{ showData ? '收起' : '展开' }}</span>
          <span :class="[showData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
        </div>
      </div>
      <!-- <el-button
        style="color:#333"
        type="text"
        class="collapse-btn"
        @click="showData=!showData"
        size="mini"
      >
        {{showData? '收起':'展开'}}
        <i :class="[showData?'el-icon-arrow-up':'el-icon-arrow-down']"></i>
      </el-button>-->
    </div>
    <div class="toggle-body" v-if="showData">
      <slot />
      <FinTable v-if="!tableOption.isSlot" :option="option1" />
    </div>
  </div>
</template>
<script>
import FinTable from '../financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'

export default {
  name: 'SimpleFinanceTable',
  mixins: [mixin],
  components: {
    FinTable,
  },
  props: {
    tableOption: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      option1: {},
      showData: true,
    }
  },
  watch: {
    tableOption: {
      deep: true,
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          this.option1.data = val.data || []
          this.option1.columns = val.columns || []
          // console.log(this.option1)
        })
      },
    },
  },
  created() {
    this.option1 = Object.assign({}, this.option, { operationBtns: false, selection: false, rootTipsHide: true })
  },
}
</script>
<style lang="scss" scoped>
// $horizon: 15px;
// $vertical: 15px;
// .toggle-div {
//   position: relative;
//   margin: 10px $horizon;
//   border: 1px solid #e9e9e9;
//   border-radius: 4px;
//   &.noBorder {
//     margin: 0;
//     border: none;
//     ::v-deep .finance-el-table {
//       padding: 0;
//     }
//   }
//   .toggle-title {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 0 $horizon;
//     line-height: 24px;
//     font-size: 13px;
//     font-weight: bold;
//     background: #f8f9fd;
//     color: #222;
//   }
//   .card-body {
//     padding: $vertical $horizon;
//   }
// }
.toggle-div {
  margin: 8px;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  overflow: hidden;
  &.noBorder {
    margin: 0;
    border: none;
    ::v-deep .finance-el-table {
      padding: 0;
    }
  }
  .toggle-title {
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    background: #f8f9fd;
    height: 30px;
    line-height: 30px;
    .title-left {
      font-weight: 600;
      color: #222222;
    }
    .title-right {
      & > div {
        display: inline-block;
      }
      .title-right-toggle {
        margin-left: 16px;
        cursor: pointer;
        .right-text {
          padding: 0 4px;
        }
      }
    }
  }
  .toggle-body {
    padding: 8px 0;
  }
}
</style>