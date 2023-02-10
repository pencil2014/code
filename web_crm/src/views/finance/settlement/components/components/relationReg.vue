<template>
  <el-dialog
    title="关联收款登记"
    :visible.sync="dialogVisible.show"
    width="1090px"
    class="addfee__dialog"
  >
    <div
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <FinanceSearch :searchOption="searchOption1" @search="getData" :border="true" />
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="relation" size="mini">关联</el-button>
      <el-button @click="dialogVisible.show = false;dialVmN()" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listReceivableRegForWriteoff } from '@/api/fin/settleOrder'
export default {
  name: 'settleOrderRelationReg',
  mixins: [mixin, routerMixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({}),
    },
    settleOrderIds: {
      type: Array,
      default: () => [],
    },
    settleOrderFeeIds: {
      type: Array,
      default: () => [],
    },
    settleRegList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      option1: {},
      searchOption1: {},
    }
  },
  created() {
    let searchInputGroup = ['regNo', 'regType', 'payAccountName']
    this.searchOption1 = {
      saveName: 'settleOrderRelationReg',
      addFilter: {
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          // settleCorpCode: {
          //   label: '结算单位',
          //   prop: 'settleCorpCode',
          //   type: 'remoteSelect',
          //   showType: '6',
          //   remoteMethod: (queryString, item) => {
          //     this.querySettleUnit2({ queryString, unitTypes: '' }, item)
          //   },
          //   visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
          //   remoteSelectList: [{ label: this.settleCorpName, value: this.settleCorpCode }],
          //   defaultList: [{ label: this.settleCorpName, value: this.settleCorpCode }],
          // },
          // bizDate: { label: '业务日期', type: 'daterange', format: 'yyyy-MM-dd', dateArr: ['recvDateStart', 'recvDateEnd'] },
          regNo: { label: '登记号', type: 'input' },
          regType: { label: '收款登记类型', type: 'select', prop: 'regTypeWeb' },
          payAccountName: { label: '付款账户名', type: 'input' },
          currency: { label: '币种', type: 'select', prop: 'noOriginalCurrency' },
          createdTime: {
            label: '创建时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            dateArr: ['createdTimeStart', 'createdTimeEnd'],
          },
        },
      },
    }

    let pagination = Object.assign({}, this.option.pagination, { show: false, isNew: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'addFeeDialog',
      data: [],
      operationBtns: false,
      selection: { show: true, fixed: true },
      pagination,
      maxHeight: 410,
    })
    let columns = [
      { prop: 'regNo', label: '登记号', type: 'text', width: 150 },
      { prop: 'regType', label: '收款登记类型', type: 'select', width: 100, propInDict: 'regTypeWeb' },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
      { prop: 'payAccountName', label: '付款账户名', type: 'text', width: 150 },
      { prop: 'accountShortName', label: '收款银行简称', type: 'text', width: 150 },
      { prop: 'balance', label: '可用金额', type: 'text', width: 100 },
      { prop: 'currency', label: '币种', type: 'text', width: 80 },
      { prop: 'lockStatus', label: '是否锁定', type: 'select', propInDict: 'finLockStatus', width: 80 },
      { prop: 'lockReason', label: '锁定原因', type: 'text', width: 150 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 125 },
    ]
    this.option1.columns = columns
    this.option1.data = this.settleRegList
    // this.getData()
  },
  methods: {
    getData() {
      let obj = {}
      let filterGroups = this.searchOption1.addFilter.filterGroups
      this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
        let { key, value } = item
        if (value) {
          if (filterGroups[key].type === 'daterange') {
            if (value.length) {
              obj[filterGroups[key]['dateArr'][0]] = value[0]
              obj[filterGroups[key]['dateArr'][1]] = value[1]
            }
            return
          } else if (value instanceof Array) {
            obj[key] = value.length ? value.join(',') : ''
          } else {
            obj[key] = value
          }
        }
      })

      this.lsLoading = true
      listReceivableRegForWriteoff({ ...obj, settleOrderIds: this.settleOrderIds, settleOrderFeeIds: this.settleOrderFeeIds })
        .then((res) => (this.option1.data = res.data || []))
        .finally(() => (this.lsLoading = false))
    },
    relation() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose('请选择一项进行操作！')
      }
      let { regNo, regType, lockStatus } = this.multipleSelection1[0]
      if (lockStatus === 'lock') {
        return this.$msgErrClose('请选择未锁定的收款登记进行关联！')
      }
      this.lsLoading = true
      // settleOrderToWriteoff({ settleOrderIds: this.settleOrderIds, settleOrderFeeIds: this.settleOrderFeeIds, regNo, regType })
      //   .then((res) => {
      //     this.dialogVisible.show = false
      //     this.dialVmN()
      //     // 预收款核销
      //     if (res.data.writeoffItemList?.length) {
      //       window.sessionStorage.setItem('writeoffItemList', JSON.stringify(res.data.writeoffItemList))
      //     }
      //     window.sessionStorage.setItem('_receivableRegFormSettle', true)
      //     if (res.data.writeoffSource === 'receivable_prerev') {
      //       this.$route.name !== 'SettlementList' && this.$store.dispatch('tagsView/delView', this.$route)
      //       this.routerPushTab('PrerevWriteoff', {
      //         source: 'createPrerevWriteoffFrom',
      //         receivablePrerevId: res.data?.receivablePrerev?.receivablePrerevId,
      //         routerBackReset: true,
      //       })
      //       return
      //     }

      //     // 收款核销
      //     window.sessionStorage.setItem('_writeoffCurrency', res.data.receivableReg.currency)
      //     window.sessionStorage.setItem('_receivableReg', JSON.stringify(res.data.receivableReg))
      //     this.$route.name !== 'SettlementList' && this.$store.dispatch('tagsView/delView', this.$route)
      //     // debugger
      //     this.routerPushTab('WriteoffRecvDetail', {
      //       receivableRegId: res.data?.receivableReg?.receivableRegId,
      //       routerBackReset: true,
      //       source: 'createFromReceivableRegId',
      //     })
      //   })
      //   .finally(() => (this.lsLoading = false))
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
  },
}
</script>
<style scoped lang="scss">
.addfee__dialog ::v-deep {
  .finance-table {
    padding: 8px 8px 0;
  }
  .el-dialog__body {
    padding: 8px 0;
    height: 520px;
    font-size: 12px;
  }
}
.addfee__dialog .finance-page {
  margin: 0;
}
</style>