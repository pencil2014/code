<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableCancelList', 'btn-auditPass')"
            class="finance-btn"
            @click="audit('pass')"
            size="mini"
            type="success"
          >审核通过</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableCancelList', 'btn-auditRefuse')"
            class="finance-btn"
            @click="audit('refuse')"
            size="mini"
            type="danger"
          >审核拒绝</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableCancelList', 'btn-cancel')"
            class="finance-btn"
            @click="cancelInovice"
            size="mini"
            type="danger"
          >红冲作废</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <relateReveivableDialog
      v-if="relatePayInfoDialogVisible"
      :btnType="btnType"
      :row-data="rowData"
      :dialog-visible.sync="relatePayInfoDialogVisible"
      @relateSuc="getData"
    />
    <div class="cancel-invoice-receivable-form">
      <el-dialog :title="`发票${runshCancel}申请`" :visible.sync="dialogVisible" width="952px">
        <div>
          <el-form
            :model="cancelForm"
            ref="cancelForm"
            :inline="true"
            label-width="120px"
            size="mini"
            :rules="cancelInvoiceRules"
          >
            <el-form-item label="选择的发票号" prop="invoiceNo">
              <el-input v-model="cancelForm.invoiceNo" placeholder disabled></el-input>
            </el-form-item>
            <el-form-item label="发票类型" prop="invoiceType">
              <el-select v-model="cancelForm.invoiceType" placeholder="请选择责任类型" disabled>
                <el-option
                  v-for="item in dictMap['invoiceType']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="责任人类型" prop="chargePersonType">
              <el-select v-model="cancelForm.chargePersonType" placeholder disabled>
                <el-option
                  v-for="item in dictMap['invoiceCancelChangeType']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="`${runshCancel}原因`" prop="reason">
              <el-select v-model="cancelForm.reason" disabled>
                <el-option
                  v-for="(item, index) in dictMap['invoiceCancelReason']"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="cancelForm.chargePerson" label="责任人" prop="chargePerson">
              <el-input v-model="cancelForm.chargePerson" placeholder disabled></el-input>
            </el-form-item>
            <el-form-item v-if="isElec" label="红冲的发票号" prop="rivalInvoiceNo">
                <!-- maxlength="8" -->
              <el-input
                maxlength="20"
                v-model.trim="cancelForm.rivalInvoiceNo"
                placeholder="请输入8位或20位数字"
              ></el-input>
            </el-form-item>
            <el-form-item v-if="isElec" label="红冲的发票代码" prop="rivalInvoiceCode">
              <el-input
                v-model.trim="cancelForm.rivalInvoiceCode"
                placeholder="请输入红冲的发票代码"
                maxlength="12"
              ></el-input>
            </el-form-item>
            <!-- chargePersonType -->
            <el-form-item
              :label="`${runshCancel}说明`"
              prop="remark"
              class="el-form-item-cancelinvoice-remark"
            >
              <el-input
                disabled
                v-model="cancelForm.remark"
                type="textarea"
                style="width: 650px;"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            :loading="dialogBtnLoading"
            type="primary"
            size="mini"
            @click="cancelConfirm"
          >{{$t('Common.sure')}}</el-button>
          <el-button size="mini" @click="dialogVisible = !dialogVisible">{{$t('Common.cancel')}}</el-button>
        </span>
      </el-dialog>
    </div>

    <el-dialog title="审核拒绝" :visible.sync="dialogRefuseVisible" width="500px">
      <el-form
        :model="refuseForm"
        ref="refuseForm"
        label-width="80px"
        size="mini"
        :rules="refuseRules"
      >
        <el-form-item label="拒绝原因：" prop="refuseReason">
          <el-input type="textarea" v-model="refuseForm.refuseReason" :autosize="true"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="btnLoading2" type="danger" size="mini" @click="auditRefuseSure">拒绝</el-button>
        <el-button size="mini" @click="dialogRefuseVisible = !dialogRefuseVisible">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :isElec="singleInvoiceType"
    />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import relateReveivableDialog from '../components/relateReveivableDialog'
import CustomColumns from '@/components/customColumns'
import InovicePreviewPrint from '@/views/finance/invoiceReceivable/components/invoicePreviewPrint'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { printMixin } from '../components/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { employeeSelectlist } from '@/api/companyResource'
import {
  invoiceReceivableCancelList as listPage,
  cancelAudit,
  cancel,
  getListAmtSummaryCancel as getListAmtSummary,
} from '@/api/fin/invoiceReceivable'
import Vue from 'vue'

export default {
  name: 'InvoiceReceivableCancelList',
  mixins: [mixin, mixin2, printMixin, routerMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      //批量上传
      showUpload: false,
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      loading: true,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      dialogVisible: false,
      dialogBtnLoading: false,
      cancelForm: {
        invoiceReceivableId: '',
        invoiceNo: '',
        rivalInvoiceNo: '',
        rivalInvoiceCode: '',
        chargePerson: '',
        chargePersonType: '',
        reason: '',
        remark: '',
        invoiceType: '',
      },
      employeeSelectOptions: [],
      cancelInvoiceRules: {
        invoiceNo: [{ required: true, message: '选择的发票号不能为空', trigger: 'blur' }],
        rivalInvoiceNo: [
          // { required: true, message: '红冲的发票号不能为空', trigger: 'blur' },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value) {
                callback(/\d{8}/.test(value) ? undefined : new Error('请输入8位数字'))
              } else {
                callback(!rule.required || /\d{8}/.test(value) ? undefined : new Error('请输入8位数字'))
              }
            },
            trigger: 'blur',
          },
        ],
        reason: [{ required: true, message: '原因不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '说明不能为空', trigger: 'blur' }],
        chargePersonType: [
          {
            required: true,
            message: '责任类型不能为空',
            triggers: 'blur, change',
          },
        ],
      },
      dialogRefuseVisible: false,
      refuseForm: { refuseReason: '' },
      refuseRules: {
        refuseReason: [{ required: true, message: ' ', trigger: 'blur, change' }],
      },
      rowData: {},
      relatePayInfoDialogVisible: false,
      btnType: '',
      departmentList: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      selfColumnsBase: [
        { prop: 'applyNo', label: '红冲申请编号', width: 100 },
        {
          prop: 'invoiceNo',
          label: '申请发票号',
          type: 'button',
          width: 100,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              if (row.fileNo) {
                const href = `/base/fileView/preview/${row.fileNo}/${row.fileName}`
                window.open(href)
              } else {
                this.previewInvoiceFromList(row.invoiceReceivableId)
              }
            },
            // callback: (fn, index, row, option) => this.showDetail(row),
          },
        },
        { prop: 'invoiceType', label: '发票类型', type: 'select', width: 130 },
        { prop: 'invoiceWay', label: '开票方式', type: 'select', width: 130 },
        {
          prop: 'chargePersonType',
          label: '责任人类型',
          type: 'select',
          width: 130,
          propInDict: 'invoiceCancelChangeType',
        },
        { prop: 'chargePerson', label: '责任人', width: 130 },
        {
          prop: 'reason',
          label: '红冲原因',
          type: 'select',
          width: 130,
          propInDict: 'invoiceCancelReason',
        },
        { prop: 'remark', label: '红冲说明', width: 150 },
        {
          prop: 'invoiceReceivableApplyNo',
          label: '开票申请编号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showApplyDetail(row),
          },
        },
        { prop: 'currency', label: '开票币种', width: 80 },
        { prop: 'amt', label: '开票金额', width: 80 },
        { prop: 'confirmStatus', label: '审核状态', type: 'select', width: 80 },
        { prop: 'refuseReason', label: '拒绝原因', width: 150 },
        {
          prop: 'cancelStatus',
          label: '红冲状态',
          type: 'select',
          width: 80,
          propInDict: 'invoiceCancelStatus',
        },
        {
          prop: 'rivalInvoiceNo',
          label: '红冲发票号',
          type: 'button',
          width: 100,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              if (row.rivalFileNo) {
                const href = `/base/fileView/preview/${row.rivalFileNo}/${row.rivalFileName}`
                window.open(href)
              } else {
                this.previewInvoiceFromList(row.rivalInvoiceReceivableId)
              }
            },
            // callback: (fn, index, row, option) => this.showDetail(row, true),
          },
        },
        { prop: 'rivalCurrency', label: '红冲币种', width: 80 },
        { prop: 'rivalAmt', label: '红冲金额', width: 80 },
        { prop: 'feeAmt', label: '发票工本费', width: 80 },
        { prop: 'feeCurrency', label: '发票工本费币种', width: 80 },
        { prop: 'createdName', label: '红冲申请人', width: 130 },
        { prop: 'createdTime', label: '红冲申请时间', width: 130 },
        { prop: 'confirmName', label: this.$t('FinBill.approverName'), width: 130 },
        { prop: 'confirmTime', label: this.$t('FinBill.approveEndTime'), width: 130 },
        { prop: 'cancelName', label: '红冲人', width: 130 },
        { prop: 'cancelTime', label: '红冲时间', width: 130 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), width: 150 },
        { prop: 'title', label: '客户发票抬头', width: 150 },
        { prop: 'taxNo', label: '客户纳税人识别号', width: 130 },
        { prop: 'bankName', label: '客户银行名称', width: 130 },
        { prop: 'accountNo', label: '客户银行账号', width: 130 },
        { prop: 'emailAddrs', label: '客户邮箱', width: 130 },
        { prop: 'saleCompTitle', label: '我司发票抬头', width: 150 },
        { prop: 'taxpayerNo', label: '我司纳税人识别号', width: 130 },
        { prop: 'saleCompAccountShortName', label: '我司银行简称', width: 130 },
        { prop: 'saleCompBankName', label: '我司银行名称', width: 130 },
        { prop: 'saleCompAccountNo', label: '我司银行账号', width: 130 },
        { prop: 'invoiceRemark', label: '发票备注', width: 150 },
      ],
      cTimestamp: 0,
    }
  },
  computed: {
    isElec() {
      return this.rowData.reverseType === 'rush_red'
      if (!this.rowData.issueTime) {
        return this.rowData.invoiceType === 'electronic'
      }
      let s = this.rowData.issueTime
      var d = new Date(Date.parse(s.replace(/-/g, '/')))
      let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      // console.log(s.replace(/-/g, '/'))
      // console.log(year + '/' + month + '/' + '01' + ' 00:00:00')
      let dThisMonth = new Date(Date.parse(year + '/' + month + '/' + '01' + ' 00:00:00'))
      if (d.getTime() < dThisMonth.getTime()) {
        return true
      }
      if (this.rowData.invoiceType === 'electronic') {
        return true
      }
      return false
    },
    runshCancel() {
      return this.isElec ? '红冲' : '作废'
    },
  },
  created() {
    this.dictMap.invoiceCancelStatus = [
      { label: '已红冲作废', value: 'yes' },
      { label: '未红冲作废', value: 'no' },
    ]
    this.dictMapObj.invoiceCancelStatus = {
      yes: '已红冲作废',
      no: '未红冲作废',
    }
    let searchArr = ['applyNo', 'invoiceType', 'chargePersonType', 'settleCorpCode', 'reason', 'createdTime']
    this.searchOption = {
      saveShow: true,
      saveName: 'invoiceReceivableCancelList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 8,
        searchInputGroup: searchArr.map((key) => ({
          key,
          value: '',
          range: { min: '', max: '' },
        })),
        filterGroups: {
          applyNo: { label: '红冲申请编号', type: 'input' },
          invoiceNo: { label: '申请发票号', type: 'input' },
          invoiceType: {
            label: '发票类型',
            type: 'select',
            prop: 'invoiceType',
          },
          invoiceWay: { label: '开票方式', type: 'select', prop: 'invoiceWay' },
          chargePersonType: {
            label: '责任人类型',
            type: 'select',
            prop: 'invoiceCancelChangeType',
          },
          chargePerson: { label: '责任人', type: 'input' },
          reason: {
            label: '红冲原因',
            type: 'select',
            prop: 'invoiceCancelReason',
          },
          invoiceReceivableApplyNo: { label: '开票申请编号', type: 'input' },
          currency: {
            label: '开票币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          confirmStatus: {
            label: '审核状态',
            type: 'select',
            prop: 'confirmStatus',
            multiple: true,
          },
          cancelStatus: {
            label: '红冲状态',
            type: 'select',
            prop: 'invoiceCancelStatus',
          },
          createdBy: {
            label: '红冲申请人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          createdTime: {
            label: '红冲申请时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          confirmBy: {
            label: this.$t('FinBill.approverName'),
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          confirmTime: {
            label: this.$t('FinBill.approveEndTime'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          cancelBy: {
            label: '红冲人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          cancelTime: {
            label: '红冲时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
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
          title: { label: '客户发票抬头', type: 'input' },
          taxNo: { label: '客户纳税人识别号', type: 'input' },
          bankName: { label: '客户银行名称', type: 'input' },
          accountNo: { label: '客户银行账号', type: 'input' },
          emailAddrs: { label: '客户邮箱', type: 'input' },
          saleCompTitle: { label: '我司发票抬头', type: 'input' },
          taxpayerNo: { label: '我司纳税人识别号', type: 'input' },
          saleCompAccountShortName: { label: '我司银行简称', type: 'input' },
          saleCompBankName: { label: '我司银行名称', type: 'input' },
          saleCompAccountNo: { label: '我司银行账号', type: 'input' },

          // createdBy: {
          //   label: this.$t('Settle.applicant'),
          //   type: 'remoteSelect',
          //   remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
          //   visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
          //   remoteSelectList: [],
          // },
          // createdTime: { label: this.$t('Settle.applicationDate'), type: 'daterange', format: 'yyyy-MM-dd' },
          // deptCode: {
          //   label: '所属部门',
          //   showType: '100',
          //   prop: 'deptCode',
          //   type: 'cascader',
          //   cascaderList: this.departmentList,
          //   cascaderProps: {
          //     children: 'childList',
          //     label: 'deptCname',
          //     value: 'deptCode',
          //     checkStrictly: false,
          //   },
          // },
        },
      },
    }
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
      $name: 'invoiceReceivableList',
      data: [],
      tips: { text: '', show: false },
      operationBtns: false,
      pagination,
      listAmtSummary,
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['invoiceStatus'],
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = [...this.selfColumnsBase]
    this.cTimestamp = new Date().getTime()
    // 查询正常发票，查询参数加在searchOption中
    // TODO 搜索保存功能，首次加载自动搜索
    // this.getData()
  },
  activated() {
    let timestamp = new Date().getTime()
    // console.log('isUseCache:', this.$route.meta.isUseCache)
    if ((!this.$route.meta.isUseCache || this.$route.meta.refresh) && timestamp - this.cTimestamp > 500) {
      this.handleCurrentChange(1)
    }
  },
  methods: {
    employeeSelectlist(queryString) {
      let data = {
        state: 'valid',
        name: queryString,
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        this.employeeSelectOptions = data.map((item) => ({
          label: item.value,
          value: item.key,
        }))
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
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          this.option1.data = res.data.list.map((item) => {
            item.receivableRegNo_multiValue = item.receivableRegNo && item.receivableRegNo.split(',')
            item.settleOrderNo_multiValue = item.settleOrderNo && item.settleOrderNo.split(',')
            item.writeoffReceipayNo_multiValue = item.writeoffReceipayNo && item.writeoffReceipayNo.split(',')
            item.sourceBizNos_multiValue = (item.sourceBizNos || '').split(',')
            return item
          })
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
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
          let data = { rivalAmtList: [] }
          data = Object.assign(data, res.data)
          let labelObj = { rivalAmtListLabel: '红冲作废金额' }
          let colorObj = { rivalAmtListColor: 'red' }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = this.$t('Settle.orignalCurrency')
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
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection1.map((item) => item.invoiceReceivableCancelId).join(',')
      if (ids) {
        data2.query.push({
          column: 'invoiceReceivableCancelId',
          type: 'in',
          value: ids,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row, isCancel) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => this.commonRoute(to, from)
      let query = { invoiceReceivableId: row.rivalInvoiceReceivableId || row.invoiceReceivableId }
      this.routerPush('InvoiceReceivableDetail', query)
    },
    showApplyDetail(row) {
      console.log(row)
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => this.commonRoute(to, from)
      let query = {
        source: 'apply',
        invoiceReceivableApplyId: row.invoiceReceivableApplyId,
      }
      this.routerPush('InvoiceReceivableApplyDetail', query)
    },
    // 所属员工下拉框
    getEmployeeList2(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList.splice(0, 1000, ...list)
      })
    },
    audit(confirmStatus) {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose('请选择一项进行操作！')
      }
      let row = rows[0]
      if (row.confirmStatus !== 'pending') {
        return this.$msgErrClose('请选择审核状态为待审批的项进行操作！')
      }
      if (confirmStatus === 'pass') {
        this.$confirmWarn('是否确认审核通过？', () => {
          cancelAudit({
            applyNoList: [row.applyNo],
            confirmStatus: 'pass',
          }).then((res) => {
            this.getData()
            if (this.checkAuth(this.$route.name, 'tab-invoiceReceivableCancelList', 'btn-cancel')) {
              this.$confirmWarn('审核通过成功，是否继续红冲作废？', () => {
                this.cancelInovice(true, row)
              })
            }
          })
        })
      } else {
        this.dialogRefuseVisible = true
        this.$nextTick(() => {
          this.refuseForm.refuseReason = ''
          this.$refs.refuseForm.clearValidate()
        })
      }
    },
    auditRefuseSure() {
      this.btnLoading2 = true
      cancelAudit({
        applyNoList: [this.multipleSelection1[0].applyNo],
        confirmStatus: 'refuse',
        refuseReason: this.refuseForm.refuseReason,
      })
        .then((res) => {
          this.dialogRefuseVisible = false
          this.getData()
          this.$msgSucClose('拒绝操作成功！')
        })
        .finally(() => {
          this.btnLoading2 = false
        })
    },
    // 红冲作废按钮
    cancelInovice(jump, row) {
      if (jump !== true && this.notOk(this.multipleSelection1.length !== 1, '选择一张发票进行红冲作废！')) {
        return
      }
      row = row || this.multipleSelection1[0]
      if (jump !== true && (row.confirmStatus !== 'pass' || row.cancelStatus !== 'no')) {
        return this.$msgErrClose('请选择审核通过且未红冲作废的选项！')
      }
      this.rowData = row
      if ((row.invoiceType === 'electronic' && row.invoiceWay === 'system') || !this.isElec) {
        return this.$confirmWarn('确定红冲作废此发票？', () => {
          cancel({ applyNo: row.applyNo }).then(() => {
            this.$msgSucClose('红冲作废成功！')
            this.getData()
          })
        })
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.cancelForm.resetFields()
        this.$nextTick(() => this.$refs.cancelForm.clearValidate())
        this.cancelForm.invoiceNo = row.invoiceNo
        this.cancelForm.applyNo = row.applyNo
        this.cancelForm.chargePersonType = row.chargePersonType
        this.cancelForm.chargePerson = row.chargePerson
        this.cancelForm.reason = row.reason
        this.cancelForm.remark = row.remark
        this.cancelForm.invoiceType = row.invoiceType
        // if (row.invoiceType == 'electronic' && row.invoiceWay == 'system') {
        //   this.cancelInvoiceRules.rivalInvoiceNo[0].required = false
        // } else {
        //   this.cancelInvoiceRules.rivalInvoiceNo[0].required = true
        // }
        // console.log(this.cancelInvoiceRules.rivalInvoiceNo)
      })
    },
    // 红冲作废确定
    cancelConfirm() {
      this.$refs.cancelForm.validate((valid) => {
        if (valid) {
          let rivalInvoiceNo = this.cancelForm.rivalInvoiceNo
          if (rivalInvoiceNo.length && rivalInvoiceNo.length !== 8 && rivalInvoiceNo.length !== 20) {
            return this.$msgErrClose('红冲发票号必须是8位或20位数字！')
          }
          this.dialogBtnLoading = true
          cancel({
            ...this.cancelForm,
            reverseType: this.isElec ? 'rush_red' : 'cancel',
          })
            .then((res) => {
              this.$msgSucClose('红冲作废成功！')
              this.$refs.cancelForm.resetFields()
              this.$refs.cancelForm.clearValidate()
              this.getData()
              this.dialogVisible = false
            })
            .finally(() => (this.dialogBtnLoading = false))
        }
      })
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    relateReveivableDialog,
    CustomColumns,
    InovicePreviewPrint,
  },
}
</script>
<style>
.cancel-invoice-receivable-form .el-dialog__body {
  padding: 40px 80px 22px;
}
.cancel-invoice-receivable-form .el-dialog__footer {
  padding-bottom: 32px;
  padding-right: 90px;
}
.cancel-invoice-receivable-form .el-form .el-input {
  width: 260px;
}
.app-wrapper .cancel-invoice-receivable-form .el-form-item-cancelinvoice-remark textarea {
  min-height: 40px !important;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
  width: 162px;
}
.manual-regist-invoice .el-form .el-select {
  width: 162px;
}
.manual-regist-invoice .el-form .el-input {
  width: 162px;
}
.finance-page .el-tabs__nav-scroll {
  padding-left: 20px;
}
</style>