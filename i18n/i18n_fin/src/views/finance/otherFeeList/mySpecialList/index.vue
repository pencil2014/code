<template>
  <div class="finance-page"
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-createSettlement')" class="finance-btn" size="mini" @click="createSettlement">生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('Common.refresh')}}</el-button>
          </el-button-group>
          <!-- <el-button-group>
            <el-button class="finance-btn" size="mini" @click="showVerticalColumnAction">showColumn</el-button>
          </el-button-group> -->
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as commonMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mySpecialList } from '@/api/fin/fee'
import { dateFormat } from '../../utils/finance'

export default {
  mixins: [mixin, mixin2, commonMixin, routerMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      orderNo: '',
      source: '',
      multipleSelection1: [],
      feeIds: [],
      loading: false,
    }
  },
  created() {
    // 搜索配置
    this.searchOption1 = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'orderNo', value: '', showType: '1' },
          { key: 'settleCorpName', value: '', showType: '2' },
          { key: 'date', value: '', showType: '3' },
        ],
        filterGroups: {
          orderNo: { label: this.$t('PreClose.bizNo'), type: 'input', showType: '1' },
          settleCorpName: { label: this.$t('FeeList.settleCorp'), type: 'autocomplete', showType: '2',
            querySearch: (queryString, cb) => {
              this.querySettleUnit(queryString, cb)
            },
            select: (optionItem) => {
              let find = this.searchOption1.addFilter.searchInputGroup.find(item => {
                return item.key === 'settleCorpName'
              })
              find.columnReq = 'settleCorpCode'
              find.settleCorpCode = optionItem.key
            },
          },
          date: { label: '录入时间', type: 'daterange', showType: '3' },
        }
      }
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = { ...this.option, id: 'option1', $name: 'MySpecialList', pagination, operationBtns: false }
    let columns = [
      {
        prop: 'orderNo',
        label: this.$t('PreClose.bizNo'),
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          // callback: (fn, index, row) => {
          //   if (!row.orderNo) {
          //     return this.$message.error('订单号不能为空！')
          //   }
          //   this.routerPush('OrderFee', {
          //     orderNo: row.orderNo,
          //     component: 'Fee',
          //     feeChild: 'specialManagementFee',
          //   })
          // },
          callback: (fn, index, row, option) => {
            this.showOneNoDetail('order', row.orderNo, { feeChild: 'specialManagementFee' }) // feeId: row.feeId, 
          },
        },
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        width: 160
      },
      {
        prop: 'feeName',
        label: '费用名',
        type: 'text',
        width: 130,
        // showVerticalColumn: true
      },
      {
        prop: 'feeAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'settleAmt',
        label: '结算金额',
        type: 'text',
      },
      {
        prop: 'settleOrderNo',
        label: this.$t('FeeList.settleOrderNo'),
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({
              type: 'settleOrderNos',
              no,
              componentProps,
            })
          },
        },
      },
      {
        prop: 'gedgingWriteoffAmt',
        label: this.$t('Hedge.hedgeAmount'),
        type: 'text',
      },
      {
        prop: 'invoiceAmt',
        label: this.$t('Collect.invoicedAmt'),
        type: 'text',
      },
      {
        prop: 'totalWriteoffAmt',
        label: '已核销金额',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '录入时间',
        type: 'text',
        width: 125
      },
    ]
    this.option1.columns = columns
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      let backup = {}
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value, columnReq, valueReq } = item
        if (columnReq && item[columnReq]) {
          backup[columnReq] = item[columnReq]
        } else if (value && value !== '') {
          if (key === 'date') {
            backup['startDate'] = dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
            backup['endDate'] = dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
          } else {
            backup[key] = value
          }
        }
      })
      if (isSearch) {
        this.searchBackup = backup
      }
      Object.assign(data, this.searchBackup || {})
      this.loading = true
      mySpecialList(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          list.forEach((item) => {
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
          })
          this.option1.data = [...list]
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
          this.option1.tips.show = false
        }
      }).finally(() => {
        this.loading = false
      })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    // 生成结算单
    createSettlement() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '请勾选需要生成结算单的项！',
          type: 'error',
          showClose: true,
        })
      }
      this.routerPush('CreateSettlement', {
        source: 'createSettlementFromSpecial',
        feeIds: JSON.stringify(this.multipleSelection1.map((item) => item.feeId)),
      })
    },
    showVerticalColumnAction() {
      let column = this.option1.columns.find(item => {
        return item.prop === 'feeName'
      })
      column.showVerticalColumn = !column.showVerticalColumn
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
  },
}
</script>
<style>
</style>