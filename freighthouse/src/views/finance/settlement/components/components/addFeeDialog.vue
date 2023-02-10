<template>
  <el-dialog title="添加费用" :visible.sync="dialogVisible.show" width="1090px" class="addfee__dialog">
    <div
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
      <div style="padding: 8px 8px 0">
        应收可结算金额合计：
        <span style="color:rgb(230, 57, 35);padding-right: 20px">{{recSumStr}}</span>
        应付可结算金额合计：
        <span style="color:rgb(51, 177, 138); ">{{paySumStr}}</span>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="add" size="mini">添加</el-button>
      <el-button @click="dialogVisible.show = false;dialVmN()" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listAddFeePage, listAddFeeSummary } from '@/api/fin/settleOrder'
export default {
  name: 'addFeeDialog',
  mixins: [mixin, routerMixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({}),
    },
    settleCorpCode: {
      type: String,
      default: '',
    },
    settleCompCode: {
      type: String,
      default: '',
    },
    settleCorpName: {
      type: String,
      default: '',
    },
    settleCompName: {
      type: String,
      default: '',
    },
    existFeeIds: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      option1: {},
      employeeSelectOptions: [],
      multipleSelection1: [],
      searchOption1: {},
      recSumStr: '',
      paySumStr: '',
      isFirst: true,
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
    }
  },
  created() {
    // 分公司、应收应付、结算单位、费用名称、结算锁定状态、结算方式、业务日期、单号
    let searchInputGroup = ['settleCompCode', 'settleCorpCode', 'bizDate']
    this.searchOption1 = {
      saveShow: true,
      saveName: 'listAddFeeSummary',
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          settleCompCode: {
            // disabled: true,
            label: '分公司',
            prop: 'settleCompCode',
            type: 'remoteSelect',
            showType: '6',
            remoteMethod: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            // remoteSelectList: [{ label: this.settleCompName, value: this.settleCompCode }],
            // defaultList: [{ label: this.settleCompName, value: this.settleCompCode }],
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '结算单位',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            showType: '6',
            remoteMethod: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
            remoteSelectList: [{ label: this.settleCorpName, value: this.settleCorpCode }],
            defaultList: [{ label: this.settleCorpName, value: this.settleCorpCode }],
          },
          receipayType: { label: '应收应付', type: 'select', prop: 'receipayGroup', showType: '4' },
          feeCode: {
            label: '费用名称',
            type: 'remoteSelect',
            prop: 'feeCode',
            showType: '3',
            remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            remoteSelectList: [],
          },
          settleLock: { label: '结算锁定状态', type: 'select', prop: 'finLockStatus' },
          settleCycle: { label: '结算方式', type: 'select', prop: 'settleCycle' },
          bizDate: { label: '业务日期', type: 'daterange', format: 'yyyy-MM-dd', dateArr: ['bizBeginDate', 'bizEndDate'] },
          sourceBizNo: { label: '单号', type: 'input' },
          currency: { label: '币种', type: 'select', prop: 'noOriginalCurrency' },
        },
      },
    }

    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'addFeeDialog',
      data: [],
      operationBtns: false,
      selection: { show: true, fixed: true },
      pagination,
      maxHeight: 340,
      sortable: true,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      colorColumns: ['receipayGroup'],
    })
    let columns = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showOneNoDetail(row.sourceType, row.sourceBizNo, { isTab: true })
          },
        },
      },
      {
        prop: 'settleCompName',
        label: '分公司',
        type: 'text',
        width: 150,
      },
      {
        prop: 'receipayType',
        label: '应收应付',
        type: 'select',
        propInDict: 'receipayGroup',
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        width: 150,
      },
      {
        prop: 'feeName',
        label: '费用名称',
        type: 'text',
      },

      {
        prop: 'feeEnName',
        label: '费用英文名',
        type: 'text',
        width: 125,
      },
      {
        prop: 'unitPrice',
        label: '单价',
        type: 'text',
      },
      {
        prop: 'unitCount',
        label: '数量',
        type: 'text',
      },
      {
        prop: 'feeAmt',
        label: '金额',
        type: 'text',
      },
      {
        prop: 'canUseSettleAmt',
        label: '可结算金额',
        type: 'text',
        width: 90,
      },
      {
        prop: 'currency',
        label: '费用币种',
        type: 'text',
      },
      {
        prop: 'settleLock',
        label: '结算锁定状态',
        type: 'select',
        propInDict: 'finLockStatus',
        width: 100,
      },
      {
        prop: 'remark',
        label: '费用备注',
        type: 'text',
      },
      {
        prop: 'settleCycle',
        label: '结算方式',
        type: 'select',
      },
      {
        prop: 'bizDate',
        label: '业务日期',
        type: 'text',
      },
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 125,
      },
    ]
    this.option1.columns = columns
    this.lsLoading = true
  },
  methods: {
    search(data, isReset) {
      if (isReset) this.isFirst = true
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    initSearchData() {
      let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
      let filterGroups = this.searchOption1.addFilter.filterGroups
      // filterGroups.settleCompCode.remoteSelectList.splice(0, 100, filterGroups.settleCompCode.defaultList[0])
      filterGroups.settleCorpCode.remoteSelectList.splice(0, 100, filterGroups.settleCorpCode.defaultList[0])
      // let compFind = searchInputGroup.find((item) => item.key === 'settleCompCode')
      // if (compFind) {
      //   compFind.value = this.settleCompCode
      // } else {
      //   searchInputGroup.push({ key: 'settleCompCode', value: this.settleCompCode })
      // }
      let corpFind = searchInputGroup.find((item) => item.key === 'settleCorpCode')
      if (corpFind) {
        corpFind.value = this.settleCorpCode
      } else {
        searchInputGroup.push({ key: 'settleCorpCode', value: this.settleCorpCode })
      }
    },
    getData(isSearch) {
      // if (this.isFirst) {
      //   this.isFirst = false
      //   this.isFirstData = true
      //   this.initSearchData()
      //   return this.getData(true)
      // }
      let obj = {}
      let filterGroups = this.searchOption1.addFilter.filterGroups
      this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
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
      console.log(obj)
      if (this.isFirst) {
        this.isFirst = false
        this.isFirstData = true
        // obj.settleCompCode = this.settleCompCode
        obj.settleCorpCode = this.settleCorpCode
        isSearch = true
      }
      if (isSearch) {
        this.searchBackup = obj
      }

      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        ...(this.searchBackup || {}),
        feeIds: this.existFeeIds,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      if (data.sourceBizNos) {
        data.sourceBizNos = data.sourceBizNos.replace(/[\s+,+，+]+/g, ' ')
      }
      listAddFeePage(data)
        .then((res) => {
          if (this.isFirstData) {
            this.isFirstData = false
            this.initSearchData()
          }
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      listAddFeeSummary(data).then((res) => {
        this.recSumStr = res.data.recCanSettleAmtList.map((v) => `${v.currency} ${v.amt}`).join('　')
        this.paySumStr = res.data.payCanSettleAmtList.map((v) => `${v.currency} ${v.amt}`).join('　')
      })
    },
    employeeSelectlist(queryString) {
      let data = {
        state: 'valid',
        name: queryString,
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        console.log(data)
        this.employeeSelectOptions = data.map((item) => {
          return {
            label: item.value,
            value: item.key,
          }
        })
      })
    },
    add() {
      if (this.multipleSelection1.length < 1) {
        return this.$msgErrClose('请选择费用进行添加！')
      }
      this.$emit('add-fee', this.multipleSelection1)
      this.dialogVisible.show = false
      this.dialVmN()
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      let data2 = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        ...(this.searchBackup || {}),
        feeIds: this.existFeeIds,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      let selectFeeIds = data.map((item) => item.feeId)
      if (selectFeeIds) {
        data2.selectFeeIds = selectFeeIds
      }
      this.debounceLs(() => this.getListAmtSummary(data2))
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    remoteFeeItemList(queryString, filterItem, lang) {
      this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then((data) => {
        filterItem.remoteSelectList = data
      })
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