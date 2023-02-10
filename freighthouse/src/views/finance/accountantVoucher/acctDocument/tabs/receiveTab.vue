<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-receivable-reg-list">
      <FinanceSearch :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherView')"
              class="finance-btn"
              @click="generateVoucher(true)"
              size="mini"
              type="primary"
            >预览凭证</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherCreate')"
              class="finance-btn"
              @click="generateVoucher"
              size="mini"
              type="primary"
            >生成凭证</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherDel')"
              class="finance-btn"
              @click="delVoucher"
              size="mini"
              type="danger"
            >删除凭证</el-button>
            <el-button-group
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-handleExport')"
            >
              <div class="finance-btn select-template-box">
                <el-dropdown trigger="click" @command="handleExport">
                  <span class="el-dropdown-link">
                    导出
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in exportTypeList"
                      :key="'exportTypeList' + index"
                      :command="item"
                    >导出{{item.label}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <!-- <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-handleExport')"
              class="finance-btn"
              @click="handleExport"
              size="mini"
            >导出</el-button>-->
          </div>
          <div class="money-box-right">
            <el-radio-group v-model="hasVoucher" size="mini">
              <el-radio-button label>全部</el-radio-button>
              <el-radio-button label="no">未生成</el-radio-button>
              <el-radio-button label="yes">已生成</el-radio-button>
            </el-radio-group>
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <!-- 凭证弹框组件 -->
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :bizNo="true"
      :showDel="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherCreate')"
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
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { exReceipayWriteOffGenerate, exVoucherDelete } from '@/api/fin/voucher'
import { listAccountantExPage, getListAmtSummary, getAccountantExListAmtSummary } from '@/api/fin/writeoffRecv'
import { querySourceTypeByNo } from '@/api/fin/fee'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
export default {
  name: 'writeoffRecvList',
  label: '收款核销',
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isVoucherRoute = true
    return {
      pageSizeUrl: listAccountantExPage('geturl'),
      keyDownActive: true,
      hasVoucher: '', //tab选项，凭证状态
      isVoucherRoute,
      searchBackup: [],
      receivablePrerevId: -1,
      currentComponent: '',
      receivableRegId: -1,
      option1: {},
      searchOption: {},
      table1DataBackup: [],
      multipleSelection1: [],
      orderNo: '',
      orderBillId: '',
      showInvoiceDetail: false,
      selectedOptionItem: '',
      writeoffReceipayId: 0,
      rowData: '',
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNos: '',
        seqNo: '',
        showData: {},
        isEx: true,
      },
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [
        {
          prop: 'writeoffReceipayNo',
          label: '核销编号',
          type: 'button',
          action: 'showAttachment',
          sortable: true,
          width: '155px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'voucherNo',
          label: '凭证号',
          type: 'columnTip',
          sortable: true,
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              let acctVoucherSeqno = row.acctVoucherSeqno_multiValue
              let seqNo = acctVoucherSeqno[index]
              if (!seqNo) return
              this.initShowVoucher(this.previewDialog, seqNo, '', '')
            },
          },
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'groupSettleCompName',
          label: '内部往来分公司',
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'settleCorpType',
          label: '结算单位类型',
          type: 'select',
          sortable: false,
          width: '104px',
          propInDict: 'unitType',
        },
        {
          prop: 'receivableRegNo',
          label: '收款登记号',
          width: '155px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              // if (row.writeoffSource === 'receivable_reg') {
              this.routerPush('WriteoffRecvDetail', { receivableRegId: row.receivableRegId, receivableRegNo: row.regNo }, true)
              // } else {
              //   this.routerPush(
              //     'PrerevWriteoff',
              //     { receivablePrerevId: row.receivablePrerevId, receivablePrerevNo: row.regNo },
              //     true
              //   )
              // }
            },
          },
        },
        {
          prop: 'receivablePrerevNo',
          label: '预收款登记号',
          width: '155px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              // if (row.writeoffSource === 'receivable_reg') {
              //   this.routerPush('WriteoffRecvDetail', { receivableRegId: row.receivableRegId, receivableRegNo: row.regNo }, true)
              // } else {
              this.routerPush(
                'PrerevWriteoff',
                { receivablePrerevId: row.receivablePrerevId, receivablePrerevNo: row.regNo },
                true
              )
              // }
            },
          },
        },
        {
          prop: 'prerevHasVoucher',
          label: '预收款凭证生成状态',
          type: 'select',
          sortable: false,
          width: '134px',
          propInDict: 'voucherYesNoPart',
        },
        {
          prop: 'realAmt',
          label: '收款金额',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'accountShortName',
          label: '收款银行简称',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'accountPublicType',
          label: '我司账户类型',
          type: 'select',
          sortable: true,
          propInDict: 'accountType',
          width: '104px',
        },
        {
          prop: 'accountNo',
          label: '收款银行账号',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'bankSeqNo',
          label: '银行流水号',
          type: 'text',
          width: '104px',
        },
        {
          prop: 'payAccountName',
          label: '付款账户名',
          type: 'text',
          width: '104px',
        },
        {
          prop: 'totalWirteoffAmt',
          label: '核销金额',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'interTransferFee',
          label: '内扣手续费',
          sortable: false,
          type: 'text',
          width: '104px',
        },
        {
          prop: 'outerTransferFee',
          label: '外扣手续费',
          sortable: true,
          type: 'text',
          width: '100px',
        },
        {
          prop: 'hasInternalDzg',
          label: '转移大掌柜',
          type: 'select',
          propInDict: 'yesNo',
          width: '104px',
        },
        {
          prop: 'internalDzgAmt',
          label: '大掌柜金额',
          type: 'text',
          width: '104px',
        },
        {
          prop: 'dzgWriteoffNo',
          label: '大掌柜核销编号',
          type: 'text',
          width: '155px',
        },
        {
          prop: 'lessRecvAmt',
          label: '短款金额',
          type: 'text',
          width: '104px',
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'receivePayDate',
          label: '收付日期',
          type: 'text',
        },
        {
          prop: 'writeoffSubType',
          label: '核销子类型',
          type: 'select',
          sortable: true,
          width: '104px',
          propInDict: 'recWriteoffSubType',
        },
        {
          prop: 'recheckStatus',
          label: '审核状态',
          type: 'select',
          sortable: true,
          width: '104px',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'hasVoucher',
          label: '凭证状态',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          type: 'select',
          propInDict: 'voucherStatus',
        },
        {
          prop: 'writeoffDate',
          label: '核销日期',
          type: 'text',
        },
        {
          prop: 'settleOrderNo',
          label: '关联结算单号',
          type: 'columnTip',
          width: 155,
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, componentProps) => {
              const query = { settleOrderNo: no, source: 'settlementDetail' }
              this.routerPushTab('SettlementDetail', query)
            },
          },
        },
        {
          prop: 'invoiceNos',
          label: '关联发票号',
          type: 'columnTip',
          width: 140,
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              const row = componentProps.row
              const invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              const invoiceReceivableId = invoiceReceivableIds[index]
              const query = { source: 'detail', invoiceReceivableId }
              this.routerPushTab('InvoiceReceivableDetail', query)
            },
          },
        },
        { prop: 'invoiceAmt', label: '已开票金额', type: 'text', sortable: false, width: '104px' },
        { prop: 'noInvoiceAmt', label: '未开票金额', type: 'text', sortable: false, width: '104px' },
        // {
        //   prop: 'writeoffReverseNo',
        //   label: '反核销编号',
        //   type: 'text',
        //   sortable:true,
        //   width: '104px',
        // },
        {
          prop: 'sourceBizNo',
          label: '工作单号',
          width: 138,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                if (res.code === 0) {
                  this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                }
              })
            },
          },
        },
        { prop: 'bdEmployeeName', label: '销售', type: 'text', sortable: false, width: 130 },
        { prop: 'recvCreatedName', label: '收款登记人', type: 'text', sortable: true, width: 104 },
        { prop: 'recvCreatedTime', label: '收款登记时间', type: 'text', sortable: true, width: 150 },
        {
          prop: 'writeoffName',
          label: '核销人',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'writeoffTime',
          label: '核销时间',
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'recheckName',
          label: '复核人',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'recheckTime',
          label: '复核时间',
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'bankseqFileCode',
          label: '到账水单',
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.bankseqFileCode) {
                let href = `/base/fileView/preview/${row.bankseqFileCode}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: '有', type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
        },
        {
          prop: 'payBankseqFileNo',
          label: '客户付款水单',
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.payBankseqFileNo) {
                let href = `/base/fileView/preview/${row.payBankseqFileNo}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: '有', type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
        },
        { prop: 'compareStatus', label: '对账状态', type: 'select', width: 80, propInDict: 'recvPayCompareStatus' },
        {
          prop: 'compareTime',
          label: '对账时间',
          type: 'text',
          sortable: true,
          width: 130,
        },
        {
          prop: 'remark',
          label: '核销备注',
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'recvRemark',
          label: '交易备注',
          type: 'text',
          sortable: true,
          width: '104px',
        },
      ],
      exportTypeList: [
        { label: '列表', value: 'writeoffRecvListExport', voucherValue: 'writeoffRecvAccExListExport' },
        { label: '明细（工作号汇总）', value: 'writeoffRecvDetailExport', voucherValue: 'writeoffRecvDetailAccExport' },
        { label: '明细表（发票号汇总）', value: 'writeoffRecvInvoiceExport', voucherValue: 'writeoffRecvInvoiceAccExport' },
        { label: '银行实收汇总', value: 'writeoffRecvTotalExport', voucherValue: 'writeoffRecvTotalAccExport' },
        { label: '收款核销汇总', value: 'writeoffRecvDetailTotalExport', voucherValue: 'writeoffRecvDetailTotalAccExport' },
      ],
    }
  },
  created() {
    let searchArr = ['allNo', 'writeoffSubType', 'totalWirteoffAmt', 'currency', 'settleCorpCode', 'writeoffTime']
    // 搜索配置
    this.searchOption = {
      // saveDefault: true,
      saveShow: true,
      saveName: 'writeoffRecvList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: '各类单号', type: 'input' },
          writeoffReceipayNo: { label: '核销编号', type: 'input' },
          sourceBizNo: { label: '工作单号', type: 'input', showType: '1' },
          voucherNo: { label: '凭证号', type: 'input' },
          receivableRegNo: { label: '收款登记号', type: 'input' },
          receivablePrerevNo: { label: '预收款登记号', type: 'input' },
          prerevHasVoucher: { label: '预收款凭证生成状态', type: 'select', prop: 'voucherYesNoPart' },
          settleOrderNo: { label: '关联结算单号', type: 'input' },
          invoiceNo: { label: '关联发票号', type: 'input' },
          writeoffSubType: { label: '核销子类型', type: 'select', prop: 'recWriteoffSubType', multiple: true },
          recheckStatus: {
            label: '审核状态',
            type: 'select',
            selectOptions: [
              { label: '未复核', value: 'no_check', en: 'no_check' },
              { label: '已复核', value: 'checked', en: 'checked' },
            ],
            multiple: true,
          },
          // hasVoucher: { label: '凭证状态', type: 'select', prop: 'voucherStatus', multiple: true },
          totalWirteoffAmt: { label: '核销金额', type: 'range' },
          realAmt: { label: '收款金额', type: 'range' },
          accountShortName: {
            label: '收款银行简称',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.bankAccountListAll('', item)
            },
            remoteSelectList: [],
          },
          accountPublicType: { label: '我司账户类型', type: 'select', prop: 'accountType' },
          accountNo: { label: '收款银行账号', type: 'input' },
          payAccountName: { label: '付款账户名', type: 'input' },
          bankSeqNo: { label: '银行流水号', type: 'input' },
          // 4
          currency: {
            label: '币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          settleCompCode: {
            label: '分公司',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          groupSettleCompCode: {
            label: '内部往来分公司',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          settleCorpType: { label: '结算单位类型', type: 'select', prop: 'settleUnitType', multiple: true },
          writeoffDate: { label: '核销日期', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          writeoffTime: { label: '核销时间', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          recheckTime: { label: '复核时间', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          receivePayDate: { label: '收付日期', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, 'bd'),
            visibleChange: (queryString, item) => this.listByRole(queryString, item, 'bd'),
          },
          recvCreatedBy: {
            label: '收款登记人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          recvCreatedTime: { label: '收款登记时间', type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
          writeoffBy: {
            label: '核销人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          recheckBy: {
            label: '复核人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          hasBankseqFile: { label: '到账水单', type: 'select', prop: 'hasNo' },
          hasPayBankseqFile: { label: '客户付款水单', type: 'select', prop: 'hasNo' },
          //  hasBankseqFile: {
          //     label: '水单状态',
          //     type: 'select',
          //     selectOptions: [
          //       { label: '有', value: 'yes' },
          //       { label: '无', value: 'no' },
          //     ],
          //   },
          hasInternalDzg: { label: '转移大掌柜', type: 'select', prop: 'yesNo' },
          internalDzgAmt: { label: '大掌柜金额', type: 'range' },
          dzgWriteoffNo: { label: '大掌柜核销编号', type: 'input' },
          lessRecvAmt: { label: '短款金额', type: 'range' },
          compareStatus: { label: '对账状态', type: 'select', prop: 'recvPayCompareStatus' },
          // compareTime: { label: '对账时间', type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '详情', type: 'text', show: true, width: '60px', action: 'showDetail' }],
    })
    if (!this.checkAuth(this.$route.name, 'tab-writeoffRecvList', 'btn-detail')) {
      operationBtns = false
    }
    const pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      $name: 'writeoffRecvList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      sortable: true,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      needTimeSort: true,
      emptyText: '数据将在查询后显示',
      colorColumns: ['voucherStatus'],
    })
    let columns = [...this.selfColumnsBase]
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }
    this.option1.columns = columns
    if (!this.searchOption.saveShow) {
      this.getData()
    }
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    // 删除凭证
    delVoucher() {
      console.log(this.$store.state.user)
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要删除凭证的项！`)
      }
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(`请勾选已生成凭证的项！`)
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(...val.voucherNo_multiValue)
        voucherSeqNos.push(...val.acctVoucherSeqno_multiValue)
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // 生成凭证
    generateVoucher(preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if (preview === 'refresh') {
        this.getData()
        return
      }
      const isPreview = preview === true
      if (!bizNo) this.previewDialog.show = false
      const selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要${isPreview ? '预览' : '生成'}凭证的项！`)
      }
      if (selectRow.length && isPreview) {
        let hasVoucher, noVoucher
        selectRow.forEach((v) => {
          if (v.hasVoucher === 'yes' && !(v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)) {
            hasVoucher = true
          } else {
            noVoucher = true
          }
        })
        if (hasVoucher && noVoucher) {
          return this.$msgErrClose('已生成和未生成凭证的记录不能同时预览！')
        }
      }
      if (
        selectRow.filter(
          (v) => v.hasVoucher === 'yes' && !(v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)
        ).length
      ) {
        if (isPreview) {
          console.log(selectRow.map((v) => v.voucherNo))
          this.initShowVoucher(this.previewDialog, '', selectRow.map((v) => v.acctVoucherSeqno).join(','), '')
        } else {
          this.$msgErrClose('请选择当前结算单位未生成凭证的记录！')
        }
        return
      }
      const data = {
        writeoffReceipayNos: bizNo && bizNo !== 'all' ? [bizNo] : selectRow.map((item) => item.writeoffReceipayNo),
        bizType: 'receive_writeoff',
      }
      if (isPreview) {
        data.preview = 'yes'
        this.lsLoading = true
        exReceipayWriteOffGenerate(data)
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose('没有可生成凭证的数据！')
            }
            this.initShowVoucher(this.previewDialog, '', '', res.data)
          })
          .finally(() => (this.lsLoading = false))
        return
      }
      this.$confirmWarn({ body: '确认生成凭证?', title: '生成凭证' }, () => {
        this.$refs.PreviewDialog.lsLoading = true
        exReceipayWriteOffGenerate(data)
          .then(() => {
            this.$msgSucClose('凭证已经处理！')
            !isPreview && !bizNo && this.getData()
          })
          .finally(() => (this.$refs.PreviewDialog.lsLoading = false))
      })
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString || '').then((data) => {
        cb(data)
      })
    },
    // 获取收款核销列表
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      if (this.debounceLsFn()) return Promise.resolve()
      this.lsLoading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (this.isVoucherRoute) {
        this.hasVoucher && data.query.push({ column: 'hasVoucher', type: 'in', value: this.hasVoucher })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || data.query
      return listAccountantExPage(data)
        .then((res) => {
          this.finCommonColumns(res, undefined, undefined, undefined, {
            configColumns: res.data.configColumns.filter((v) => {
              return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
            }),
          })
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns.filter((v) => {
          //     return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
          //   })
          // }
          if (this.isVoucherRoute) {
            let columns = []
            if (res.data.configColumns && res.data.configColumns.length) {
              columns = res.data.configColumns.filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            } else {
              columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            }
            columns = ['hasVoucher', 'voucherNo', ...columns]
            if (this.columnsBackup !== columns.toString()) {
              this.option1.columns = columns
                .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
                .filter((v) => v)
            }
            this.columnsBackup = columns.toString()
            // columns = ['hasVoucher', 'voucherNo', ...columns]
            // this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          }
          if (customerList) return
          if (res.code === 0) {
            const { list } = res.data
            const data = []
            list.forEach((item) => {
              // item.invoiceNo_multiValue = item.invoiceNo.split(',')
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                const arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                const arr = subItem.split('/')
                return arr[0]
              })
              item.voucherNo_multiValue = item.voucherNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.acctVoucherSeqno_multiValue = item.voucherNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              // 转字典
              const settleCorpTypeName = item.settleCorpType.split(',')
              item.settleCorpType = settleCorpTypeName
                .map((it) => {
                  const unitTypeObj = this.dictMap['unitType'].find((el) => el.value === it)
                  return unitTypeObj && unitTypeObj['label']
                })
                .toString()
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    getListAmtSummary(data) {
      getAccountantExListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          const labelObj = {
            writeoffAmtListLabel: '核销金额',
            noInvoiceAmtListLabel: '未开票金额',
          }
          const colorObj = {
            writeoffAmtListColor: 'green', // 支持red, green, black三种值
            noInvoiceAmtListColor: 'red',
          }
          const data = res.data
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
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      const data2 = { ascColumns: [], descColumns: [], query: [] }
      const ids = this.multipleSelection1.map((item) => item.writeoffReceipayId).join(',')
      if (ids) {
        data2.query.push({ column: 'writeoffReceipayIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => this.getListAmtSummary(data2))
      }
    },
    search(data) {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 详情
    showDetail(row) {
      const params = { writeoffNo: row.writeoffReceipayNo }
      const query = {
        source: 'writeoffRecv',
        receivableRegId: row.receivableRegId,
        writeoffReceipayId: row.writeoffReceipayId,
      }
      this.routerPush('WriteoffRecvDetail2', query, true, params)
    },
    //导出
    handleExport(type) {
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        columns: this.option1.columns.map((v) => v.prop),
        query: [],
      }
      if (!this.ascColumns.length && !this.descColumns.length) {
        data.descColumns = ['createdTime']
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (this.isVoucherRoute) {
        this.hasVoucher && data.query.push({ column: 'hasVoucher', type: 'in', value: this.hasVoucher })
      }
      if (this.multipleSelection1.length) {
        let value = this.multipleSelection1.map((v) => v.writeoffReceipayId).join(',')
        data.query = [{ column: 'writeoffReceipayIds', type: 'in', value }]
      }
      data.query.push({ column: 'queryDataModuleCode', value: type.voucherValue })
      if (type.value !== 'writeoffRecvListExport') {
        data.columns = []
      }
      this.$confirm('是否确认导出' + `${type.label || '收款核销单'}`, `${type.label ? '导出' + type.label : '收款核销单'}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.lsLoading = true
          this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: '/fin/common/queryDataExportExcel',
              data: { data },
            })
            .then((res) => {
              this.lsLoading = false
              console.log(res)
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(res)
              link.download = `${type.label ? '导出' + type.label : '收款核销单'}` + '.xlsx'
              link.click()
            })
            .catch(() => {
              this.lsLoading = false
              this.$message({ message: '导出失败', type: 'error' })
            })
        })
        .catch(() => {})
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({
          label: `${item.accountShortName}(${item.accountNo})`,
          value: item.accountShortName,
        }))
        this.remoteSelectCommon(item, data)
      })
    },
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
    hasVoucher() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
  },
  computed: {
    storeSettleCode() {
      return this.$store.state.user?.userInfo?.settleCompanyCode
    },
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
  },
  components: {
    FinanceTable,
    FinanceSearch,
    PreviewDialog,
    CustomColumns,
  },
}
</script>
