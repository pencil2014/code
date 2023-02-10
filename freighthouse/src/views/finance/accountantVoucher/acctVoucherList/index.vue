<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
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
            >删除凭证</el-button>
            <el-button class="finance-btn" size="mini" @click="preview">预览凭证</el-button>
            <el-button
              v-if="checkAuth($route.name, 'btn-export')"
              class="finance-btn"
              size="mini"
              @click="exportBtn"
            >导出</el-button>
          </div>
          <div class="money-box-right">
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </div>
        </div>
        <FinanceTable :option="tableOption" @send-multi="sendMulti" />
      </div>
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
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import AddVoucherDialog from '@/views/finance/voucher/components/addVoucherDialog'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryPayOrderByWriteoffNo } from '@/api/fin/writeoffPay'
import { exVoucherList, exVoucherListSum } from '@/api/fin/acct'
import { exVoucherDelete } from '@/api/fin/voucher'
let VOUCHERCLASS = [],
  ACBOOK = []
export default {
  mixins: [mixin, mixin2, routerMixin, voucherMixin],
  data() {
    return {
      pageSizeUrl: exVoucherList('geturl'),
      keyDownActive: true,
      tableOption: {},
      addVoucherDialog: {
        show: false,
        title: '新增记账凭证',
        VOUCHERCLASS: VOUCHERCLASS,
        ACBOOK: ACBOOK,
        isEx: true,
        // formItems: addDialogItems,
        // form: { ...formData },
      },
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        isEx: true,
      },
      searchOption: {},
      multipleSelection1: [],
      sumCfg: {},
      isFirst: true,
      totalCreditAmt: 0,
      totalDebitAmt: 0,
      customColumnsPopShow: false,
      selfColumnsBase: [
        {
          prop: 'voucherNo',
          label: '凭证号',
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
          label: '单号',
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
              bad_pre_writeoff: { name: 'BadOrderDetail', query: { source: 'detail', writeoffNopayNo: subItem } },
              rev_invoice: {
                name: 'InvoiceReceivableDetail',
                query: { source: 'detail', invoiceNo: subItem, invoiceReceivableId: row.invoiceId },
              },
              pay_invoice: {
                name: 'InvoicePaymentListDetail',
                query: { source: 'detail', invoiceNo: subItem, invoicePaymentId: row.invoiceId },
              },
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
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'rateType', label: '汇率类型', type: 'text', defaultVal: '固定汇率' },
        { prop: 'exRate', label: '汇率', type: 'text' },
        { prop: 'srcAmt', label: '原币金额', type: 'text' },
        { prop: 'debitAmt', label: '借方金额', formatter: ({ row: { debitCredit, amt } }) => (debitCredit === 'debit' ? amt : '') },
        { prop: 'creditAmt', label: '贷方金额', formatter: ({ row: { debitCredit, amt } }) => (debitCredit === 'credit' ? amt : '') },
        { prop: 'finDate', label: '凭证日期', type: 'text' },
        { prop: 'monPeriod', label: '期间', type: 'text' },
        // { prop: 'acSceneId', label: '凭证类型', type: 'text' }, //凭证类型即是凭证字
        { prop: 'acBookName', label: '账簿名称', type: 'text', width: 130 },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'summaryInfo', label: '摘要', type: 'text', width: 200 },
        { prop: 'createdName', label: '创建人', type: 'text' },
        { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      ],
    }
  },
  created() {
    this.voucherClassList('', () => {}).then((list) => {
      VOUCHERCLASS.splice(0, 1000, ...list)
    })
    this.acBookList({ currPage: 1, pageSize: 1000, query: [] }, () => {}).then((list) => {
      ACBOOK.splice(0, 1000, ...list.filter(v => v.acctSetType === 'external'))
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
            type: 'select',
            filterable: true,
            selectOptions: ACBOOK,
            remoteSelectList: [],
            // remoteMethod: (value, item) => {
            //   let data = { currPage: 1, pageSize: 50, query: [] }
            //   if (value) {
            //     data.query.push({ column: 'bookName', type: 'like', value })
            //   }
            //   this.acBookList(data).then((res) => {
            //     res = res.map((v) => ({ ...v, value: v.bookName, key: v.acBookId, label: v.bookName }))
            //     item.remoteSelectList.splice(0, 100, ...res)
            //   })
            // },
            // visibleChange: (queryString, item) => {
            //   let data = { currPage: 1, pageSize: 50, query: [] }
            //   this.acBookList(data).then((res) => {
            //     res = res.map((v) => ({ ...v, value: v.bookName, key: v.acBookId, label: v.bookName }))
            //     item.remoteSelectList.splice(0, 100, ...res)
            //   })
            // },
          },
          bizNo: { label: '单号', type: 'input' },
          voucherClass: { label: '凭证字', type: 'select', selectOptions: VOUCHERCLASS },
          voucherDate: { label: '凭证日期', type: 'lsDaterange', keys: ['startFinDate', 'endFinDate'], format: 'yyyy-MM-dd' },
          subjectCode: {
            label: '科目编码',
            type: 'autocomplete',
            querySearch: (queryString, cb) => {
              this.subjectList(queryString, cb)
            },
          },
          VoucherNo: { label: '凭证号', type: 'range', keys: ['startVoucherNo', 'endVoucherNo'] },
          Amt: { label: '金额', inputType: 'number', type: 'range', keys: ['startAmt', 'endAmt'] },
          bizType: { label: '单号类型', type: 'select', prop: 'voucherBizType' },
          finGroup: { label: '费用分类', type: 'select', prop: 'feeitemFinGroup' },
          // bussinessType: { label: '业务类型', type: 'select', selectOptions: BUSINESS },
          serviceType: { label: '服务类型', type: 'select', prop: 'diyServiceType' },
          srcCurrency: {
            label: '原币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          subjectName: { label: '科目名称', type: 'input' },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdDate: { label: '创建时间', type: 'lsDaterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
          // createdBy: { label: '凭证日期', type: 'daterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
          // createdDate: { label: '期间', type: 'daterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'tableOption',
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
      emptyText: '数据将在查询后显示',
    }
    this.tableOption.footerMethod = ({ columns, data }) => {
      const sums = []
      columns.forEach((column, index) => {
        if (column.property === 'voucherNo') {
          sums[index] = '合计'
        } else if (column.property === 'debitAmt') {
          sums[index] = this.totalDebitAmt
        } else if (column.property === 'creditAmt') {
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
        exVoucherListSum(data).then((res) => {
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
      return exVoucherList(data)
        .then((res) => {
          console.timeEnd()
          this.finCommonColumns(res, 'tableOption')
          if (customerList) return
          this.tableOption.data = res.data.list
          this.$set(this.tableOption, 'emptyText', '未查询到任何数据')
          Object.assign(this.tableOption.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    // 自定义求和
    sumMethod({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (column.property === 'voucherNo') {
          // 原币金额显示总计
          sums[index] = '合计'
        } else if (column.property === 'debitAmt') {
          sums[index] = this.totalDebitAmt
        } else if (column.property === 'creditAmt') {
          sums[index] = this.totalCreditAmt
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    // 查看详情
    voucherView({ voucherSeqNo }) {
      // if(!voucherSeqNo) return this.$message.warning('缺少凭证唯一标识号')
      this.previewDialog.seqNo = voucherSeqNo
      this.previewDialog.show = true
    },
    // 关闭弹框
    dialogClose(type, tag) {
      this[type].show = false
      if (tag === 'refresh') this.getData()
    },
    // 导出
    exportBtn() {
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data.query = this.searchBackup || []
      data.columns = this.tableOption.columns.map(v => v.prop)
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'exVoucherManageListExport' })
      this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = '会计凭证管理列表.xlsx'
        link.click()
      })
    },
    // 行内删除
    handleDelete($index, row, option) {
      this.$confirm('您是否确认删除该凭证？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          exVoucherDelete({ voucherSeqNos: [row.voucherSeqNo] }).then((res) => {
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
    preview() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请至少选择一项！')
      }
      this.previewDialog.seqNo = [...new Set(this.multipleSelection.map((val) => val.voucherSeqNo))].toString()
      this.previewDialog.show = true
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
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    AddVoucherDialog,
    PreviewDialog,
    CustomColumns,
  },
}
</script>
<style>
</style>