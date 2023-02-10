<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container finance-list-container">
      <FinanceSearch v-if="searchOption.addFilter" :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'btn-add')"
            class="finance-btn"
            size="mini"
            @click="addBtn"
            type="primary"
          >新增凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-delete')"
            class="finance-btn"
            size="mini"
            @click="deleteBtn"
            type="danger"
          >{{$t('PayApplyList.deleteVoucher')}}</el-button>
          <el-button class="finance-btn" size="mini" @click="preview">{{$t('PayApplyList.previewVoucher')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-export')"
            class="finance-btn"
            size="mini"
            @click="exportBtn"
          >{{$t('Common.export')}}</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <!-- :autoMax="true" -->
      <div class="finance-list-container">
        <FinanceTable
          class="list-table"
          rowKey="orderNo"
          id="sort-table"
          :option="tableOption"
          @send-multi="sendMulti"
        />
      </div>
      <AddVoucherDialog
        v-if="addVoucherDialog.show"
        :dialogOption="addVoucherDialog"
        @close="dialogClose('addVoucherDialog', $event)"
      />
      <PreviewDialog
        :showDel="checkAuth($route.name, 'btn-delete')"
        :dialogOption="previewDialog"
        @close="dialogClose('previewDialog')"
      />
      <div v-if="customColumnsPopShow">
        <CustomColumns
          ref="CustomColumns"
          :columnsBase="selfColumnsBase"
          :configColumns="configColumns"
          :props="{key:'prop',label:'label'}"
          @close="customColumnsPopClose"
        />
      </div>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '../mixin.js'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import AddVoucherDialog from '../components/addVoucherDialog'
import PreviewDialog from '../components/previewDialog'
import { voucherList, voucherDelete, voucherListSum } from '@/api/fin/acct'
import { queryPayOrderByWriteoffNo } from '@/api/fin/writeoffPay'
import CustomColumns from '@/components/customColumns'

// 统一设置规则提醒
// const ruleMsg = [{ required: true, message: ' ' }]
// // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled br 需要换行
// const formItem = [
//   { label: '凭证字', type: 'select', prop: 'orderNo', r: true, d: true, br: true },
//   { label: '单据类型', type: 'select', prop: 'consignerName', r: true },
//   { label: '单据子类型', type: 'select', prop: 'settleCorpName' },
//   { label: '费用类别', type: 'select', prop: 'feeName', r: true },
//   { label: '指定费用编码', type: 'select', prop: 'feeName2', r: true },
//   { label: '当前配置科目', type: 'text', prop: 'feeName3', default: 'default', br: true },
//   { label: '借贷方向', type: 'select', prop: 'feeName4', r: true },
//   { label: '对手科目类型', type: 'select', prop: 'feeName5' },
//   { label: '对手科目编码', type: 'select', prop: 'feeName6' },
//   { label: '对手子科目匹配', type: 'select', prop: 'feeName7' },
//   { label: '现金交易转记字科目', type: 'select', prop: 'feeName8' },
//   { label: '现金交易子科目匹配', type: 'select', prop: 'feeName9' },
//   { label: '同科目金额合并', type: 'select', prop: 'feeName91' },
//   { label: '是否费用类别的默认规则', type: 'select', prop: 'feeName92' },
//   { label: this.$t('Finance.abstract'), type: 'textarea', prop: 'feeName93' },
//   { label: '摘要参数', type: 'select', prop: 'feeName94' },
// ]
// const formData = {}
// formItem.forEach((item) => (formData[item.prop] = item.default || ''))

let VOUCHERCLASS = [],
  ACBOOK = []
export default {
  name: 'voucherList',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    AddVoucherDialog,
    PreviewDialog,
    CustomColumns,
  },
  data() {
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    // let addDialogItems = []
    // formItem.map((item) => {
    //   addDialogItems.push(item.r ? { ...item, rules: ruleMsg } : { ...item })
    // })

    return {
      keyDownActive: true,
      pageSizeUrl: voucherList('geturl'),
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      addVoucherDialog: {
        show: false,
        title: '新增记账凭证',
        VOUCHERCLASS: VOUCHERCLASS,
        ACBOOK: ACBOOK,
        // formItems: addDialogItems,
        // form: { ...formData },
      },
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
      },
      sumCfg: {},
      isFirst: true,
      totalCreditAmt: 0,
      totalDebitAmt: 0,
      customColumnsPopShow: false,
      selfColumnsBase: [
        {
          prop: 'voucherNo',
          label: this.$t('Hedge.voucherNumber'),
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.voucherView(row)
            },
          },
        },
        { prop: 'voucherClassName', label: '凭证字', type: 'text' },
        {
          label: this.$t('PreClose.bizNo'),
          prop: 'bizNo',
          type: 'button',
          width: 160,
          orderNoBtn: true,
          callback: (subItem, row, item, option) => {
            // bad_pre_writeoff: "坏账预销"
            // finbill: "费用单"
            // gedging_writeoff: "对冲单核销"
            // order: "订单"
            // pay_writeoff: "付款核销"
            // receive_writeoff: "收款核销"
            if (row.bizType === 'order') {
              return this.showOneNoDetail('order', subItem)
            }
            let obj = {
              order: { name: 'OrderFee', query: { orderNo: subItem, component: 'Fee' } },
              finbill: { name: 'FinBillListDetail', query: { finBillNo: subItem } },
              gedging_writeoff: { name: 'GedgingDetail', query: { source: 'gedgingDetail' } },
              pay_writeoff: { name: 'WritePayDetail', query: { writeoffReceipayNo: subItem } },
              receive_writeoff: { name: 'WriteoffRecvDetail2', query: { source: 'writeoffRecv', writeoffReceipayNo: subItem } },
              bad_pre_writeoff: { name: 'SettleOrderBadDetail', query: { source: 'detail', writeoffNopayNo: subItem } },
            }
            if (row.bizType === 'gedging_writeoff') {
              return queryPayOrderByWriteoffNo({ writeoffReceipayNo: subItem }).then((res) => {
                let { name, query } = obj[row.bizType]
                query.gedgingApplyId = res.data.gedgingApplyId
                this.routerPush(name, query)
              })
            }
            let { name, query } = obj[row.bizType]
            this.routerPush(name, query, false, { writeoffNo: subItem })
          },
        },
        { prop: 'bizType', label: '单号类型', type: 'select', propInDict: 'voucherBizType', width: 140 },
        { prop: 'finGroup', label: '费用分类', type: 'text', width: 140 },
        { prop: 'serviceType', label: '服务类型', width: 150, type: 'select', propInDict: 'diyServiceType' },
        { prop: 'subjectName', label: '科目名称', type: 'text', width: 140 },
        { prop: 'subjectCode', label: '科目编码', type: 'text' },
        { prop: 'dimensioinInfo', label: '核算维度', type: 'text', width: 238 },
        { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'rateType', label: '汇率类型', type: 'text', defaultVal: '固定汇率' },
        { prop: 'exRate', label: '汇率', type: 'text' },
        { prop: 'srcAmt', label: '原币金额', type: 'text' },
        { prop: 'amt1', label: '借方金额', formatter: ({ row: { debitCredit, amt } }) => (debitCredit === 'debit' ? amt : '') },
        { prop: 'amt2', label: '贷方金额', formatter: ({ row: { debitCredit, amt } }) => (debitCredit === 'credit' ? amt : '') },
        { prop: 'finDate', label: '凭证日期', type: 'text' },
        { prop: 'monPeriod', label: '期间', type: 'text' },
        // { prop: 'acSceneId', label: '凭证类型', type: 'text' }, //凭证类型即是凭证字
        { prop: 'acBookName', label: '账簿名称', type: 'text', width: 130 },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
        { prop: 'summaryInfo', label: this.$t('Finance.abstract'), type: 'text', width: 200 },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text' },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130 },
      ],
    }
  },

  created() {
    console.log('````````````self created')
    // console.log(this.dictMapObj.voucherBizType)
    // console.log(this.dictMapObj.diyServiceType)
    // this.lsLoading = true
    this.voucherClassList('', () => {}).then((list) => {
      VOUCHERCLASS.splice(0, 1000, ...list)
    })
    this.acBookList({ currPage: 1, pageSize: 1000, query: [] }, () => {}).then((list) => {
      ACBOOK.splice(0, 1000, ...list.filter(v => v.acctSetType === 'internal'))
      console.log(ACBOOK)
    })
    // 搜索配置
    let searchInputGroup = [
      'acBookName',
      'bizNo',
      'voucherClass',
      'subjectCode',
      'voucherDate',
      'VoucherNo',
      'Amt',
      'createdDate',
    ]
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          acBookName: {
            label: '账簿名称',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (value, item) => {
              let data = { currPage: 1, pageSize: 50, query: [] }
              if (value) {
                data.query.push({ column: 'bookName', type: 'like', value })
              }
              this.acBookList(data).then((res) => {
                res = res.map((v) => ({ ...v, value: v.bookName, key: v.acBookId, label: v.bookName }))
                item.remoteSelectList.splice(0, 100, ...res)
              })
            },
            visibleChange: (queryString, item) => {
              let data = { currPage: 1, pageSize: 50, query: [] }
              this.acBookList(data).then((res) => {
                res = res.map((v) => ({ ...v, value: v.bookName, key: v.acBookId, label: v.bookName }))
                item.remoteSelectList.splice(0, 100, ...res)
              })
            },
          },
          bizNo: { label: this.$t('PreClose.bizNo'), type: 'input' },
          voucherClass: { label: '凭证字', type: 'select', selectOptions: VOUCHERCLASS },
          voucherDate: { label: '凭证日期', type: 'lsDaterange', keys: ['startFinDate', 'endFinDate'], format: 'yyyy-MM-dd' },
          subjectCode: {
            label: '科目编码',
            type: 'autocomplete',
            querySearch: (queryString, cb) => {
              this.subjectList(queryString, cb)
            },
            // type: 'remoteSelect',
            // remoteSelectList: [],
            // remoteMethod: (queryString, item) =>
            //   this.subjectList(queryString, '', '', item, { label: 'subjectCode', value: 'subjectCode' }),
            // visibleChange: (queryString, item) =>
            //   this.subjectList('', '', '', item, { label: 'subjectCode', value: 'subjectCode' }),
          },
          VoucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'range', keys: ['startVoucherNo', 'endVoucherNo'] },
          Amt: { label: this.$t('FeeList.feeAmt'), inputType: 'number', type: 'range', keys: ['startAmt', 'endAmt'] },
          bizType: { label: '单号类型', type: 'select', prop: 'voucherBizType' },
          finGroup: { label: '费用分类', type: 'select', prop: 'feeitemFinGroup' },
          // bussinessType: { label: this.$t('FeeList.businessTypes'), type: 'select', selectOptions: BUSINESS },
          serviceType: { label: '服务类型', type: 'select', prop: 'diyServiceType' },
          srcCurrency: {
            label: this.$t('Settle.orignalCurrency'),
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          subjectName: { label: '科目名称', type: 'input' },
          createdBy: {
            label: this.$t('Common.createdBy'),
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdDate: { label: this.$t('Common.createTime'), type: 'lsDaterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
          // createdBy: { label: '凭证日期', type: 'daterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
          // createdDate: { label: '期间', type: 'daterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'VoucherList',
      pagination,
      showFooter: true,
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => {
              setTimeout(() => {
                this.customColumnsPopShow = true
              }, 600)
            })
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      emptyText: this.$t('Common.emptyText'),
    }
    this.tableOption.footerMethod = ({ columns, data }) => {
      const sums = []
      columns.forEach((column, index) => {
        if (column.property === 'voucherNo') {
          sums[index] = '合计'
        } else if (column.property === 'amt1') {
          sums[index] = this.totalDebitAmt
        } else if (column.property === 'amt2') {
          sums[index] = this.totalCreditAmt
        } else {
          sums[index] = ''
        }
      })
      return [sums]
    }
    this.tableOption.operationBtns.data = this.delOperate
    this.tableOption.operationBtns = false
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    this.revisedHeight = -30
    // TODO 搜索保存，自动请求
    // this.getData()
  },
  activated() {
    if (this.isFirst) {
      this.isFirst = false
      return
    }
    // this.getData()
  },
  methods: {
    getData(data, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      if (data) {
        this.searchBackup = data.query
      }
      data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: customerList ? 0 : this.tableOption.pagination.pageSize,
        query: this.searchBackup || [],
        columns: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      console.time()
      console.log(data)
      if (data.currPage === 1 && !customerList) {
        voucherListSum(data).then((res) => {
          if (!res.data) {
            this.totalCreditAmt = 0
            this.totalDebitAmt = 0
            this.tableOption.data = [...this.tableOption.data]
            return
          }
          this.totalCreditAmt = res.data.totalCreditAmt
          this.totalDebitAmt = res.data.totalDebitAmt
          this.tableOption.data = [...this.tableOption.data]
        })
      }
      return voucherList(data)
        .then((res) => {
          console.timeEnd()
          this.finCommonColumns(res, 'tableOption')
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.tableOption.columns = columns
          //     .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
          //     .filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          if (customerList) return
          console.log(this.configColumns)
          // this.totalCreditAmt = res.data.totalCreditAmt
          // this.totalDebitAmt = res.data.totalDebitAmt
          this.tableOption.data = res.data.list
          this.$set(this.tableOption, 'emptyText', '未查询到任何数据')
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 导出
    exportBtn() {
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data.query = this.searchBackup || []
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'voucherManageListExport' })
      this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = '凭证管理列表.xlsx'
        link.click()
      })
    },
    // 关闭弹框
    dialogClose(type, tag) {
      this[type].show = false
      if (tag === 'refresh') this.getData()
    },
    // 行内删除
    handleDelete($index, row, option) {
      this.$confirm('您是否确认删除该凭证？', '', {
        confirmButtonText: '确认',
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning',
      })
        .then(() => {
          voucherDelete({ voucherSeqNos: [row.voucherSeqNo] }).then((res) => {
            this.$message({
              message: '删除成功！',
              type: 'success',
              showClose: true,
            })
            this.getData()
          })
        })
        .catch(() => {})
    },
    // 查看详情
    voucherView({ voucherSeqNo }) {
      // if(!voucherSeqNo) return this.$message.warning('缺少凭证唯一标识号')
      this.previewDialog.seqNo = voucherSeqNo
      this.previewDialog.show = true
    },
    preview() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请至少选择一项！')
      }
      this.previewDialog.seqNo = [...new Set(this.multipleSelection.map((val) => val.voucherSeqNo))].toString()
      this.previewDialog.show = true
    },
    // 自定义求和
    sumMethod({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (column.property === 'voucherNo') {
          // 原币金额显示总计
          sums[index] = '合计'
        } else if (column.property === 'amt1') {
          sums[index] = this.totalDebitAmt
        } else if (column.property === 'amt2') {
          sums[index] = this.totalCreditAmt
        }
        // totalCreditAmt
        // totalDebitAmt
        // 借方金额、贷方金额显示总计数字
        //   const values = data.map((item) => {
        //     if (item.debitCredit === 'debit' && column.label === '借方金额') {
        //       return Number(item[column.property]) || 0
        //     } else if (item.debitCredit === 'credit' && column.label === '贷方金额') {
        //       return Number(item[column.property]) || 0
        //     }
        //     return 0
        //   })
        //   sums[index] = values.reduce((prev, curr) => prev + curr, 0)
        //   sums[index] = sums[index] && sums[index].toFixed(2)
        // }
        else {
          sums[index] = ''
        }
      })
      return sums
    },
    // 添加
    addBtn() {
      this.addVoucherDialog.show = true
    },
    // 删除按钮
    deleteBtn() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请至少选择一项！')
      }
      let voucherNos = [...new Set(this.multipleSelection.map((val) => val.voucherNo))]
      let voucherSeqNos = [...new Set(this.multipleSelection.map((val) => val.voucherSeqNo))]
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
         this.$msgErrClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.list-table ::v-deep {
  .el-table__footer-wrapper td div,
  .el-table__fixed-footer-wrapper td div {
    font-weight: bold;
  }
  // .el-table .index-class {
  //   color: #e9e9e9;
  //   font-weight: bold;
  // }
  // .el-table__footer-wrapper {
  //   tr td:nth-of-type(10) {
  //     color: #222222;
  //   }
  //   td, td>div {
  //     background: #e7eeff;
  //     font-weight: bold;
  //     color: #3e80f5;
  //   }
  // }
}
</style>