<template>
  <div class="detail_amt_summary">
    <div
      v-for="(sum, index) in option.sumList"
      :key="index"
      :style="{width:(+option.labelWidth||100)+246+'px'}"
      :class="{clear_both:index%2===0, no_data:!sum.list.length}"
    >
      <div class="amt_label" :style="{minWidth:option.labelWidth+'px'}">{{sum.label}}：</div>
      <el-popover
        placement="top"
        width="210px"
        trigger="click"
        popper-class="detail_amt_summary_popover"
        :disabled="sum.list.length<3"
      >
        <div slot="reference" class="detail_amt_summary_popover_reference">
          <div class="currency_div" v-for="(item, index) in sum.list.slice(0,2)" :key="index">
            <span class="amt_currency">{{item.currency}}</span>
            <span class="amt_text" :class="[sum.color]">{{item[option.sumKey || 'amt']}}</span>
          </div>
        </div>
        <div slot class="detail_amt_summary_popover_slot">
          <div
            class="currency_div"
            v-for="(item, index) in sum.list"
            :key="index"
          >
            <span class="amt_currency">{{item.currency}}</span>
            <span class="amt_text" :class="[sum.color]">{{item[option.sumKey || 'amt']}}</span>
          </div>
        </div>
      </el-popover>
      <div></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    option: {
      type: Object,
      default: () => ({ sumList: [] }),
    },
  },
  data() {
    return {}
  },
  computed: {},
  created() {
    console.log(this.option)
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
.detail_amt_summary ::v-deep {
  overflow: hidden;
  line-height: 20px;
  & > div {
    float: left;
    &.clear_both {
      clear: both;
    }
    &.no_data {
      width: 0 !important;
      overflow: hidden;
      display: none;
    }
  }
  .amt_label {
    text-align: right;
    float: left;
  }
  .detail_amt_summary_popover_reference {
    float: left;
  }
  .currency_div {
    float: left;
  }
  .amt_text {
    display: inline-block;
    padding-left: 2px;
    width: 92px;
    &.red {
      color: #e63923 !important;
    }
    &.green {
      color: #33b18a !important;
    }
  }
}
</style>
