<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-invoicePrerevList', 'btn-auditPass')"
            class="finance-btn"
            @click="applyAudit('pass')"
            size="mini"
            type="success"
          >审核通过</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoicePrerevList', 'btn-auditRefuse')"
            class="finance-btn"
            @click="applyAudit('refuse')"
            size="mini"
            type="danger"
          >审核拒绝</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <FinDialog :option="dialogApply" @close="applyClose" />
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
import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { printMixin } from '../components/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { applyAudit } from '@/api/fin/invoiceReceivable'
import { listPrePage as listPage, getListAmtSummary } from '@/api/fin/invoiceReceivableApply'
import Vue from 'vue'

export default {
  mixins: [mixin, mixin2, printMixin, routerMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      loading: true,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      employeeSelectOptions: [],
      currentComponent: '',
      rowData: {},
      relatePayInfoDialogVisible: false,
      btnType: '',
      departmentList: [],
      applyDialogShow: false,
      dialogApply: {
        show: false,
        labelWidth: '60px',
        title: '审核拒绝',
        text: '拒绝',
        formItems: [{ label: '拒绝原因', type: 'textarea', prop: 'refuseReason' }],
        form: { refuseReason: '' },
      },
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'invoiceReceivableApplyNo',
          label: '申请编号',
          type: 'button',
          width: '130px',
          callback: (row) => this.showDetail(row),
        },
        { prop: 'title', label: '客户发票抬头', type: 'text', width: 150 },
        { prop: 'confirmStatus', label: '审核状态', type: 'select', width: 80, propInDict: 'auditStatus' },
        { prop: 'refuseReason', label: '拒绝原因', type: 'text', width: 130 },
        { prop: 'invoiceApplyStatus', label: '开票状态', type: 'select', width: 80 },
        { prop: 'invoiceWay', label: '开票方式', type: 'select', width: 80 },
        { prop: 'splitNo', label: '发票张数', type: 'text', width: 80 },
        { prop: 'invoiceType', label: '开票类型', type: 'select', width: 130 },
        { prop: 'currency', label: '发票币种', width: 80 },
        { prop: 'amt', label: '开票总金额', type: 'text', width: 80 },
        {
          prop: 'invoiceNos',
          label: '发票号',
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              let invoiceReceivableId = invoiceReceivableIds[index]
              this.showColumnDetail({
                type: 'invoiceNos',
                no: invoiceReceivableId,
                componentProps,
              })
              // this.componentProps = componentProps // 赋值当前的componentProps
              // this.showInvoiceDetail({}, no)
            },
          },
        },
        { prop: 'settleCorpName', label: '结算单位', width: 150 },
        { prop: 'taxNo', label: '客户纳税人识别号', type: 'text', width: 130 },
        { prop: 'bankName', label: '客户银行名称', type: 'text', width: 130 },
        { prop: 'accountNo', label: '客户银行账号', type: 'text', width: 130 },
        { prop: 'saleCompTitle', label: '我司发票抬头', type: 'text', width: 150 },
        { prop: 'taxpayerNo', label: '我司纳税人识别号', type: 'text', width: 130 },
        { prop: 'saleCompAccountShortName', label: '我司银行简称', width: 100 },
        { prop: 'saleCompBankName', label: '我司银行名称', type: 'text', width: 130 },
        { prop: 'saleCompAccountNo', label: '我司银行账号', type: 'text', width: 130 },
        { prop: 'emailAddrs', label: '客户邮箱', type: 'text', width: 130 },
        { prop: 'createdName', label: '申请人', type: 'text', width: 100 },
        { prop: 'createdTime', label: '申请时间', type: 'text', width: 130 },
        { prop: 'updatedName', label: '更新人', type: 'text', width: 100 },
        { prop: 'updatedTime', label: '更新时间', type: 'text', width: 130 },
      ],
    }
  },
  created() {
    this.loanBasicData()
    // 核销状态、业务员、所属部门
    let searchInputGroup = [
      'invoiceReceivableApplyNo',
      'invoiceApplyStatus',
      'bankName',
      'currency',
      'amt',
      'settleCorpCode',
      'createdTime',
    ]
    this.searchOption = {
      saveShow: true,
      saveName: 'invoicePrerevList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 7,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          invoiceReceivableApplyNo: { label: '申请编号', type: 'input', showType: '1' },
          settleOrderNo: { label: '结算单号', type: 'input', showType: '1' },
          invoiceNo: { label: '发票号', type: 'input', showType: '1' },
          invoiceApplyStatus: { label: '开票状态', type: 'select', showType: '100', prop: 'invoiceApplyStatus' },
          invoiceWay: { label: '开票方式', type: 'select', showType: '2', prop: 'invoiceWay' },
          invoiceType: { label: '开票类型', type: 'select', showType: '4', multiple: true, prop: 'invoiceType' },
          bankName: { label: '客户银行名称', type: 'input', showType: '5' },
          accountNo: { label: '客户银行账号', type: 'input', showType: '5' },
          emailAddrs: { label: '客户邮箱', type: 'input', showType: '5' },
          saleCompBankName: { label: '我司银行名称', type: 'input', showType: '5' },
          saleCompAccountNo: { label: '我司银行账号', type: 'input', showType: '5' },
          currency: {
            label: '发票币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          splitNo: { label: '发票张数', type: 'input', showType: '3' },
          amt: { label: '开票总金额', type: 'range', showType: '6' },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            showType: '7',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            remoteSelectList: [],
          },
          title: { label: '客户发票抬头', type: 'input', showType: '7' },
          taxNo: { label: '客户纳税人识别号', type: 'input', showType: '7' },
          saleCompTitle: { label: '我司发票抬头', type: 'input', showType: '7' },
          taxpayerNo: { label: '我司纳税人识别号', type: 'input', showType: '7' },
          createdTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd' },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }

    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [{ label: '详情', show: true, action: 'showDetail' }],
    })
    if (!this.checkAuth(this.$route.name, 'tab-invoicePrerevList', 'btn-detail')) operationBtns = false
    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'invoicePrerevList',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
      emptyText: '数据将在查询后显示',
      listAmtSummary,
      colorColumns: ['invoiceApplyStatus'],
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = [...this.selfColumnsBase]
    // 查询正常发票，查询参数加在searchOption中
    // TODO 搜索保存功能，首次加载自动搜索
    // this.getData()
  },
  methods: {
    employeeSelectlist(queryString) {
      let data = { state: 'valid', name: queryString }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        this.employeeSelectOptions = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 验证是否可以进行按钮操作
    notOk(boolean, message) {
      return boolean && this.$msgErrClose(message)
    },
    // 审核
    applyAudit(confirmStatus) {
      if (this.notOk(this.multipleSelection1.length !== 1, '选择一张发票进行操作！')) {
        return
      }
      if (this.notOk(this.multipleSelection1[0].confirmStatus !== 'pending', '不能重复审核！')) {
        return
      }
      if (confirmStatus == 'pass') {
        return this.sureApplyAudit(confirmStatus)
      }
      this.dialogApply.show = true
    },
    // 审核拒绝弹框
    applyClose(tag) {
      if (!tag) {
        return (this.dialogApply.show = false)
      }
      this.sureApplyAudit('refuse')
    },
    // 确定审核
    sureApplyAudit(confirmStatus) {
      let data = {
        invoiceReceivableApplyIds: this.multipleSelection1.map((item) => item.invoiceReceivableApplyId),
        confirmStatus,
        refuseReason: this.dialogApply.form.refuseReason,
      }
      applyAudit(data).then((res) => {
        this.dialogApply.show = false
        this.$msgSucClose('操作成功！')
        this.getData()
      })
    },
    // 关联结算单
    relateSettlement() {
      if (this.notOk(this.multipleSelection1.length !== 1, '选择一张发票进行操作！')) {
        return
      }
      this.rowData = this.multipleSelection1[0]
      this.btnType = 'relate'
      this.relatePayInfoDialogVisible = true
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (this.buttonSearch) {
        data.query.push({ column: 'status', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      // let value = this.activeName === 'first' ? 'normal' : 'cancel'
      data.query.push({ column: 'preInvoice', type: 'eq', value: 'yes' })
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          let { data } = res
          this.option1.data = data.list.map((item) => {
            // item.invoiceNo = '20412589,20283985'
            // item.invoiceNos = '575/20412589,576/20283985'
            item.invoiceNo_multiValue = item.invoiceNo.split(',')
            item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[0]
            })
            return item
          })
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.lsLoading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            invoiceApplyAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            invoiceApplyAmtListLabel: '开票金额',
          }
          let colorObj = {
            invoiceApplyAmtListColor: 'red', // 支持red, green, black三种值
            taxAmtListColor: 'green',
            amtWithoutTaxListColor: 'red',
          }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = '原币'
              }
            })
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      console.log(this.multipleSelection1)
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1.map((item) => item.invoiceReceivableApplyId).join(',')
      if (ids) {
        data2.query.push({ column: 'invoiceReceivableApplyIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      data2.query.push({ column: 'preInvoice', type: 'eq', value: 'yes' })
      console.log(data2)
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    search() {
      this.getData(true)
    },
    showInvoiceDetail(row) {
      this.showOneNoDetail('invoiceNo', row.invoiceReceivableId, { isTab: true, receipayType: 'receive' })
    },
    showDetail(row) {
      console.log(row)
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      let query = {
        source: 'apply',
        type: 'prerev',
        invoiceReceivableApplyId: row.invoiceReceivableApplyId,
      }
      this.routerPush('InvoicePrerevDetail', query)
    },
    showSettleOrderNoDetail(no) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
    },
    // 所属员工下拉框
    getEmployeeList2(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ ...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        item.remoteSelectList.splice(0, 1000, ...list)
        // console.log(this.employeeOptions)
      })
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    showColumnDetail(params) {
      if (params.type === 'invoiceNos') {
        params.receipayType = 'receive'
      }
      this.showColumnDetailHandle(params, { isTab: true })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    FinDialog,
    CustomColumns,
  },
}
</script>