<template>
  <div class="finance-table-container">
    <div class="money-box">
      <div class="money-box-left">
        <div class="money-title">{{option.title}}{{$t('Common.fees')}}</div>
        <div class="money-total">
          <el-popover placement="top" title="test" width="200" trigger="hover">
            <div class="money-total-item" slot="reference">
              <span class="money-total-span-left-space">{{$t('Hedge.hedgeSummary')}}：</span>
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
              <span class="money-total-span-left-space">{{$t('Hedge.payableSummary')}}：</span>
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
          >{{$t('Hedge.autoAllocation')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button
            v-if="isDetailPage"
            class="finance-btn"
            @click="feeSearchToggle = !feeSearchToggle"
            size="mini"
            type="primary"
          >{{feeSearchToggle ? $t('Common.hideSearch') : $t('Common.showSearch') }}</el-button>
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