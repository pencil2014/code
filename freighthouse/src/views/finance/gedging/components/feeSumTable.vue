<template>
  <div class="finance-table-container">
    <div class="money-box">
      <div class="money-box-left">
        <div class="money-title">{{option.title}}费用</div>
        <div class="money-total">
          <el-popover placement="top" title="test" width="200" trigger="hover">
            <div class="money-total-item" slot="reference">
              <span class="money-total-span-left-space">对冲应收汇总：</span>
              <span
                v-for="(item, index) in option.receiveList.slice(0,2)"
                :key="'supplierReceive' + index"
                class="money-total-span-black"
              >
                {{item.currency}}
                <span
                  :class="{'money-pay-color': item.isPay ? true : false}"
                >{{item.amt}}</span>
              </span>
            </div>
            <div class="money-total-item" slot="content">
              <span
                v-for="(item, index) in option.receiveList"
                :key="'supplierReceive' + index"
                class="money-total-span-black"
              >
                {{item.currency}}
                <span
                  :class="{'money-pay-color': item.isPay ? true : false}"
                >{{item.amt}}</span>
              </span>
            </div>
          </el-popover>
          <el-popover placement="top" title="test" width="200" trigger="hover">
            <div class="money-total-item" slot="reference">
              <span class="money-total-span-left-space">应付汇总：</span>
              <span
                v-for="(item, index) in option.payList"
                :key="'supplierPay' + index"
                class="money-total-span-black"
              >
                {{item.currency}}
                <span
                  :class="{'money-pay-color': item.isPay ? true : false}"
                >{{item.amt}}</span>
              </span>
            </div>
          </el-popover>
        </div>
      </div>
      <div class="money-box-right">
        <el-button-group>
          <el-button
            class="finance-btn"
            v-if="!isDetailPage && showAuto"
            @click="autoCompulateGedgingFee"
            size="mini"
          >自动分配金额</el-button>
        </el-button-group>
        <el-button-group>
          <el-button
            v-if="isDetailPage"
            class="finance-btn"
            @click="feeSearchToggle = !feeSearchToggle"
            size="mini"
            type="primary"
          >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
        </el-button-group>
      </div>
    </div>
    <DetailFeeSearch
      v-show="feeSearchToggle && isDetailPage"
      ref="detailFeeSearch"
      :list="option.tableOption.data"
      @search="search"
    />
    <FinanceTable :option="option.tableOption" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import { mapGetters } from 'vuex'

export default {
  props: {
    option: {
      type: Object,
      default: { title: '', receiveList: [], payList: [], tableOption: { data: [], columns: [] } },
    },
    vm: {
      type: Object,
      default: {},
    },
    isDetailPage: {
      type: Boolean,
      default: false,
    },
    showAuto: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  components: {
    FinanceTable,
    DetailFeeSearch,
  },
  methods: {
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option.tableOption.data = [...list]
      vm.computeFeeGather &&
        vm.computeFeeGather.call(
          vm,
          this.option.tableOption.data.filter((item) => !item.invisible)
        )
    },
    autoCompulateGedgingFee() {
      vm.autoCompulateGedgingFee && vm.autoCompulateGedgingFee.call(vm)
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
}
</script>
<style scoped lang="scss">
.finance-table-container {
  margin: 4px 8px 18px;
}
.money-total .money-total-span-black {
  color: #222222;
  font-weight: 400;
  margin-right: 5px;
}
.money-total .money-total-span-left-space {
  margin-left: 8px;
  color: #222222;
  font-weight: 400;
}
</style>