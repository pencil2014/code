<template>
  <div
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <!-- <el-checkbox v-model="isListSelectRecord">记录勾选项</el-checkbox> -->
            <el-checkbox
              v-if="checkAuth($route.name, 'btn-createSettleMulti') || checkAuth($route.name, 'btn-createSettle')"
              v-model="isSelectAll"
              :indeterminate="false"
              :disabled="!hasSearch"
            >{{$t('FeeList.allResults')}}</el-checkbox>
            <el-button-group>
              <!-- v-if="checkAuth('SettlementFeeList-createSettlement')" -->
              <el-button
                v-if="checkAuth($route.name, 'btn-createSettleMulti')"
                class="finance-btn"
                @click="createSettlement('signal')"
                size="mini"
                type="primary"
              >{{$t('FeeList.multiple')}}</el-button>
              <!-- <el-button class="finance-btn" size="mini">全部结算</el-button> -->
            </el-button-group>
            <el-button-group>
              <!-- v-if="checkAuth('SettlementFeeList-btn-createSettlement')" -->
              <el-button
                v-if="checkAuth($route.name, 'btn-createSettle')"
                class="finance-btn"
                @click="createSettlement('group')"
                size="mini"
                type="primary"
              >{{$t('FeeList.single')}}</el-button>
              <!-- <el-button class="finance-btn" size="mini">全部结算</el-button> -->
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="regWriteoff" size="mini">{{$t('FeeList.regWriteoff')}}</el-button>
            </el-button-group>
            <!-- <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')"> -->
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="relationRegDialog" size="mini">{{$t('FeeList.relationReg')}}</el-button>
            </el-button-group>
            <el-button-group>
              <div
                v-if="checkAuth($route.name, 'btn-export')"
                class="finance-btn select-template-box"
              >
                <el-dropdown trigger="click" @command="handleCommand">
                  <span class="el-dropdown-link">{{$t('FeeList.export')}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in exportTypeList"
                      :key="'exportTypeList' + index"
                      :command="item.value"
                    >{{item.label}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="handleCommand2" size="mini" v-if="checkAuth($route.name, 'btn-export')"
                >{{$t('FeeList.exportStatement')}}</el-button>
            </el-button-group>
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button
                class="finance-btn"
                @click="confirmFee"
                size="mini"
                v-if="checkAuth($route.name, 'btn-confirmFee')"
              >{{$t('FeeList.confirmation')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-setAgentCompany')"
                class="finance-btn"
                size="mini"
                @click="openAgentReceipayDialog"
              >{{$t('FeeList.expenses')}}</el-button>
              <el-button
                v-if="checkAuth($route.name, 'btn-cancelAgentCompany')"
                class="finance-btn"
                size="mini"
                @click="cancelAgentCompany"
              >{{$t('FeeList.cancelExpense')}}</el-button>
            </el-button-group>
            <!-- <el-button-group>
							<el-button class="finance-btn" @click="exportBtn" size="mini"
								>导出</el-button
							>
            </el-button-group>-->
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('FeeList.refresh')}}</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass ref="listTableRef" :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <el-dialog
      :title="$t('FeeList.expenses')"
      :visible.sync="agentReceipayDialogVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="finance-agent-receipay"
      width="604px"
    >
      <div style="margin: 20px auto 0; width: 400px">
        <el-form ref="agentForm" :model="agentForm" label-width="120px" size="mini" label-suffix=":">
          <el-form-item
            :label="$t('FeeList.selectBranc')"
            prop="agentCompCode"
            :rules="{
							required: true,
							message: $t('FeeList.branchEmpty'),
							trigger: 'blur',
						}"
          >
            <el-select
              v-model="agentForm.agentCompCode"
              :placeholder="$t('Common.plSelect')"
              filterable
              remote
              clearable
              :remote-method=" (queryString) => remoteSelect1.remoteMethod(queryString, remoteSelect1) "
              @visible-change=" (value) => value && remoteSelect1.visibleChange('', remoteSelect1) "
              @change=" (value) =>  remoteSelect1.change(value, remoteSelect1) "
            >
              <el-option
                v-for="(optionItem, j) in remoteSelect1.remoteSelectList || []"
                :key="'remoteSelect1' + j"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="agentReceipayDialogVisible = false" size="mini">{{$t('FeeList.cancel')}}</el-button>
        <el-button type="primary" @click="setAgentCompany" size="mini" :loading="btnLoading">{{$t('FeeList.submit')}}</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <PreviewDialog :dialogOption="previewDialog" />
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
    <el-dialog :title="$t('FeeList.exportStatement')" :visible.sync="billDialog" width="500px">
      <div style="margin:10px auto -10px;" class="export__dialog">
        <!-- billExportType: '',
        billFeeType: '',-->
        <el-form
          ref="billDialogForm"
          :model="billDialogForm"
          label-width="120px"
          size="mini"
          :rules="billDialogRules"
          label-suffix=':'
          class="billForm"
        >
          <el-form-item :label="$t('FeeList.amountType')" prop="billFeeType">
            <el-select
              v-model="billDialogForm.billFeeType"
              :placeholder="$t('Common.plSelect')"
              :disabled="billDialogForm.billType === 'bill'"
            >
              <el-option
                v-for="item in dictMap['billFeeType'].filter(item=>item.value!=='settle_amt')"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('FeeList.language')" prop="lang">
            <el-select v-model="billDialogForm.lang" :placeholder="$t('Common.plSelect')">
              <!-- 海外版不导出中文 <el-option :label="$t('FeeList.chinese')" value="CN"></el-option> -->
              <el-option :label="$t('FeeList.english')" value="US"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('FeeList.templateType')" prop="billType">
            <el-select v-model="billDialogForm.billType" :placeholder="$t('Common.plSelect')" @change="billTypeChange">
              <el-option
                v-for="item in dictMap['settleOrderBillExportType'].filter(item=>item.value!=='bill')"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportBill" size="mini">{{$t('FeeList.submit')}}</el-button>
        <el-button @click="billDialog = false" size="mini">{{$t('FeeList.cancel')}}</el-button>
      </span>
    </el-dialog>
    <keep-alive v-if="relationRegDialogVisible.show">
      <RelationReg
        :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        :settleOrderIds="multipleSelection1.map(v=>v.feeId)"
        :dialog-visible="relationRegDialogVisible"
        :settleRegList="settleRegList"
        @goRelationReg="goRelationReg"
      />
      <!-- :settleOrderIds="multipleSelection1.map(v=>v.settleOrderId)" -->
    </keep-alive>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'
import RelationReg from '../components/components/relationRegFee'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { setAgentCompany, cancelAgentCompany, surplusStatementExport, feeAgentValid, exportCompareFeeList, generateBill } from '@/api/fin/fee'
import { listPage, confirmFee, getListAmtSummary, groupSettleOrderApply, listReceivableRegForWriteoff } from '@/api/fin/fee'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { feeListMixin } from '@/views/finance/settlement/feeList/feeListMixin'
import { mapState } from 'vuex'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { customerList } from '@/api/crm/supplier'
import { listByRole, countrySelectList } from '@/api/base'
import { toQuickRecvWriteoff } from '@/api/fin/receivableReg'
import { departmentTreeList } from '@/api/companyResource'
export default {
  mixins: [mixin, mixin2, routerMixin, feeListMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      bizDetailVisible: { show: false, feeId: '', isFinBill: false },
      exportTypeList: [
        { label: this.$t('FeeList.exportExpenseDetails'), value: 'feeDetail' },
        { label: this.$t('FeeList.exportOrder'), value: 'orderNo' },
        { label: this.$t('FeeList.exportFinance'), value: 'finDate' },
        { label: this.$t('FeeList.exportAccount'), value: 'exportCompareFeeList' },
      ],
      option1: {},
      option2: {},
      searchOption1: {},
      filterGroups: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      relationRegDialogVisible: { show: false },
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      selectedOptionItem: '',
      dialogVisible: false,
      currentComponent: '',
      settleOrderId: '',
      settleCorpCode: '',
      settleCorpName: '',
      settleCompCode: '',
      settleCompName: '',
      feeIds: [],
      source: '',
      dialogVisibleClosing: false,
      closingForm: {
        settleCompName: '',
        closingMonth: '',
        closingType: '',
      },
      closingRules: {
        settleCompName: [{ required: true, message: this.$t('FeeList.branchEmpty'), trigger: 'change' }],
        closingMonth: [{ required: true, message: this.$t('FeeList.monthEmpty'), trigger: 'change' }],
        closingType: [{ required: true, message: this.$t('FeeList.typeEmpty'), trigger: 'change' }],
      },
      agentReceipayDialogVisible: false,
      agentForm: {
        agentCompCode: '',
        agentCompName: '',
      },
      remoteSelect1: {},
      previewDialog: {
        show: false,
        title: this.$t('FeeList.voucherPreview'),
        seqNo: '',
        isEx: false,
      },
      loading: false,
      searchBackup: [],
      isFeeList: true,
      isSort: false,
      isSelectAll: false,
      resultDialogOption: {
        show: false,
        title: this.$t('FeeList.buildSuc'),
        resultType: 'success',
        text_cancel: this.$t('FeeList.close'),
        titleText: this.$t('FeeList.multipleSuc'),
      },
      settleOrderNos: '',
      departmentList: [],
      billDialog: false,
      billDialogForm: { lang: 'US', billFeeType: '', billType: '' },
      billDialogRules: {
        lang: { required: true, message: ' ', triggers: 'change' },
        billFeeType: { required: true, message: ' ', triggers: 'change' },
        billType: { required: true, message: ' ', triggers: 'change' },
      },
    }
  },
  created() {
    console.log(this.dictMapObj.settleUnitSubType)
    // 'sourceBizNos',
    let searchInputGroup = [
      'allNo',
      'confirmStatus',
      'serviceCodes',
      'receipayType',
      'feeAmt',
      'settleCorpCodes',
      'preCloseDate',
      'createdDate',
      'bdDeptCode',
    ]
    this.searchOption1 = {
      saveShow: true,
      contentShow: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      fixCreatedDate: true,
      fixCreatedKey: 'createdDate',
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: this.filterGroups
      }
    }
    this.remoteSelect1 = {
      remoteMethod: (queryString, item) => {
        this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
      },
      visibleChange: (queryString, item) => {
        this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
      },
      change: (value, item) => {},
      remoteSelectList: [],
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [{ label: this.$t('Common.details'), show: true, action: 'BizDetail' }],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true, 
      // lessPageSize: true
    })
    if (!this.checkAuth(this.$route.name, 'btn-detail')) {
      operationBtns = false
    }
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true, isPlaceBottom: true, isPartTop: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => {
              setTimeout(() => {
                this.handleCustomColumns()
              }, 600)
            })
          } else {
            this.handleCustomColumns()
          }
        },
      },
      id: 'option1',
      $name: 'SettlementFeeList',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
      listAmtSummary,
      sortable: true,
      sortChange: this.sortChange,
      colorColumns: ['receipayGroup', 'feeSettleStatus'],
      emptyText: this.$t('FeeList.emptyText'),
    })
    this.remoteBusinessServiceList()
    this.loanBasicData()
  },
  methods: {
    countrySelectList(countryCode, item) {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        item.remoteSelectList = (res.data || []).map((item) => {
          return { ...item, label: this.$lang === 'zh' ? item.cname : item.ename, value: item.countryCode }
        })
      })
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.loading = true
      let { prop, order } = this.sortParams
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = {
        columns: this.customColumnsKeys,
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['feeId'],
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption1, true, false, this.multipleSelection1)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listPage(data)
        .then((res) => {
          this.loading = false
          if (res.code === 0) {
            let { configColumns, list } = res.data
            this.columns = configColumns.length > 0 ? configColumns : this.defaultColumns
            this.columns = [...this.columns]
            this.customColumnsKeys = [...this.columns]

            let serviceCodeIndex = this.columns.findIndex((item) => item === 'serviceCode')
            if (serviceCodeIndex > -1) {
              this.columns.splice(serviceCodeIndex, 1, 'serviceName')
            }
            this.columns = [...new Set(this.columns)]

            let arr = []
            this.columns.forEach((value) => {
              if (value === 'lockReason') {
                arr.push({ prop: 'lockReason', label: this.$t('FeeList.lockReason'), type: 'text', key: 'lockReason', width: 130 })
                return
              }
              let obj = this.columnsBaseLocal.find((item) => {
                return item.prop === value
              })
              if (obj) {
                if (obj.prop === 'sourceBizNo') {
                  obj = Object.assign({}, obj, {
                    prop: 'sourceBizNo',
                    label: this.$t('FeeList.sourceBizNo'),
                    type: 'button',
                    width: 120,
                    operationBtns: {
                      show: true,
                      callback: (action, index, row, option) => {
                        this.showDetail(row)
                      },
                    },
                  })
                } else if (obj.prop === 'splitFromOrderNo') {
                  obj = Object.assign({}, obj, {
                    prop: 'splitFromOrderNo',
                    label: this.$t('FeeList.splitFromOrderNo'),
                    type: 'button',
                    operationBtns: {
                      show: true,
                      callback: (action, index, row, option) => {
                        this.showDetail(row)
                      },
                    },
                  })
                } else if (obj.prop === 'acctVoucherNos') {
                  obj = Object.assign({}, obj, {
                    label: this.$t('FeeList.acctVoucherNos'),
                  })
                }
                //  else if (obj.prop === 'receipayType') {
                //   obj = Object.assign({}, obj, {
                //     formatter: ({ cellValue }) => {
                //       if (cellValue === 'receive') {
                //         return '<span style="color:#33B18A">应收</span>'
                //       } else if (cellValue === 'pay') {
                //         return '<span style="color:#CD4130">应付</span>'
                //       } else {
                //         return this.dictMapObj.receipayGroup[cellValue]
                //       }
                //     },
                //   })
                // }
                arr.push(obj)
              }
            })
            if (!this.isSort && this.columnsBackup !== this.columns.toString()) {
              this.option1.columns = arr
            }
            this.columnsBackup = this.columns.toString()
            this.isSort = false

            if (customerList) return
            list.forEach((item) => {
              if (this.isSelectAll) {
                item._checkDisabled = true
              }
              item.settleOrderNos_multiValue = item.settleOrderNos ? item.settleOrderNos.split(',') : []
              // item.settleOrderNo_multiValue = item.settleOrderNo ? item.settleOrderNo.split(',') : []
              item.writeoffNos_multiValue = item.writeoffNos ? item.writeoffNos.split(',') : []
              item.settleTimes_multiValue = item.settleTimes.split(',')
              // item.invoiceNos_multiValue = item.invoiceNos.split(',')
              item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
              item.payOrderNos_multiValue = item.payOrderNos.split(',')
              item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.transferAcctVoucherNos_multiValue = item.transferAcctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.transferVoucherSeqNos_multiValue = item.transferAcctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.transferExVoucherNos_multiValue = item.transferExVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.transferExVoucherSeqNos_multiValue = item.transferExVoucherNos.split(',').map((subItem) => {
                return subItem.split('/')[0]
              })
              item.exVoucherNos_multiValue = item.exVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.exVoucherSeqNos_multiValue = item.exVoucherNos.split(',').map((subItem) => {
                return subItem.split('/')[0]
              })
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              // 收付日期重复显示一个, 20220831 zhangling
              let receivePayDates = item.receivePayDates.split(',')
              receivePayDates = [ ...new Set(receivePayDates) ]
              item.receivePayDates = receivePayDates.join(',')
            })
            // this.option1.data = list
            // // this.table1DataBackup = [...this.option1.data] // 页面无编辑，可不处理
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
            this.$set(this.option1, 'emptyText', this.$t('FeeList.noData'))
            this.dealPaginationSelect(this.option1, res.data, list, 'feeId')
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
      // this.debounceLs(() => {
      // 	this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            recSettleApplyAmtList: [],
            noRecSettleApplyAmtList: [],
            recInvoiceAmtList: [],
            recNoInvocieList: [],

            paySettleApplyAmtList: [],
            noPaySettleApplyAmtList: [],
            payInvoiceAmtList: [],
            payNoInvocieAmtList: [],
          }
          // let data2 = {
          //   recFeeAmtList: [],
          //   recNoWriteoffAmtList: [],
          //   payFeeAmtList: [],
          //   payNoWriteoffAmtList: [],
          // }
          data = Object.assign(data, res.data)
          let { recFeeAmtList, recNoWriteoffAmtList, payFeeAmtList, payNoWriteoffAmtList } = res.data
          // data2 = Object.assign(data2, res.data)
          let data2 = { recFeeAmtList, recNoWriteoffAmtList, payFeeAmtList, payNoWriteoffAmtList }
          let subData1 = { recFeeAmtList, recNoWriteoffAmtList }
          let subData2 = { payFeeAmtList, payNoWriteoffAmtList }
          let groups = [
            {
              label: this.$t('FeeList.receivable'),
              data: {
                // recFeeAmtList: data.recFeeAmtList,
                recSettleApplyAmtList: data.recSettleApplyAmtList,
                recInvoiceAmtList: data.recInvoiceAmtList,
              },
            },
            {
              data: {
                // recNoWriteoffAmtList: data.recNoWriteoffAmtList,
                noRecSettleApplyAmtList: data.noRecSettleApplyAmtList,
                recNoInvocieList: data.recNoInvocieList,
              },
            },
            {
              label: this.$t('FeeList.payable'),
              data: {
                // payFeeAmtList: data.payFeeAmtList,
                paySettleApplyAmtList: data.paySettleApplyAmtList,
                payInvoiceAmtList: data.payInvoiceAmtList,
              },
            },
            {
              data: {
                // payNoWriteoffAmtList: data.payNoWriteoffAmtList,
                noPaySettleApplyAmtList: data.noPaySettleApplyAmtList,
                payNoInvocieAmtList: data.payNoInvocieAmtList,
              },
            },
          ]
          let labelObj = {
            recFeeAmtListLabel: this.$t('FeeList.recFeeAmt'),
            recNoWriteoffAmtListLabel: this.$t('FeeList.recNoWriteoffAmt'),
            recSettleApplyAmtListLabel: this.$t('FeeList.recSettleApplyAmt'),
            noRecSettleApplyAmtListLabel: this.$t('FeeList.noRecSettleApplyAmt'),
            // recInvoiceAmtListLabel: this.$t('FeeList.recInvoiceAmt'),
            // recNoInvocieListLabel: this.$t('FeeList.recNoInvocie'),
            payFeeAmtListLabel: this.$t('FeeList.payFeeAmt'),
            payNoWriteoffAmtListLabel: this.$t('FeeList.payNoWriteoffAmt'),
            paySettleApplyAmtListLabel: this.$t('FeeList.paySettleApplyAmt'),
            noPaySettleApplyAmtListLabel: this.$t('FeeList.noPaySettleApplyAmt'),
            // payInvoiceAmtListLabel: this.$t('FeeList.payInvoiceAmt'),
            // payNoInvocieAmtListLabel: this.$t('FeeList.payNoInvocieAmt'),
          }
          let colorObj = {
            recFeeAmtListColor: 'red', // 支持red, green, black三种值
            recNoWriteoffAmtListColor: 'red',
            recSettleApplyAmtListColor: 'red',
            noRecSettleApplyAmtListColor: 'red',
            // recInvoiceAmtListColor: 'red',
            // recNoInvocieListColor: 'red',
            payFeeAmtListColor: 'green',
            payNoWriteoffAmtListColor: 'green',
            paySettleApplyAmtListColor: 'green',
            noPaySettleApplyAmtListColor: 'green',
            // payInvoiceAmtListColor: 'green',
            // payNoInvocieAmtListColor: 'green',
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data: data2,
            subData1,
            subData2,
            groups,
            labelObj,
            colorObj,
          })
        }
      })
    },
    remoteBusinessServiceList(queryString, filterItem) {
      this.$store.dispatch('dict/queryBusinessServiceList', {}).then((data) => {
        // filterItem.remoteSelectList = data
      })
    },
    remoteFeeItemList(queryString, filterItem, lang) {
      this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then((data) => {
        console.log(data)
        if (this.remoteSelectCommon(filterItem, data)) return
        filterItem.remoteSelectList = data
      })
    },
    // 部门下拉框
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
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    sortChange(column, prop, order) {
      this.sortParams = { prop, order }
      this.isSort = true
      this.getData()
    },
    createSettlement(type) {
      console.log(!!this.hasSearch, this.isSelectAll)
      let allResult = !!this.hasSearch && this.isSelectAll
      let data = { allResult, settleOrderBuildType: type }
      if (!allResult) {
        if (!this.multipleSelection1.length) {
          return this.$msgErrClose(this.$t('FeeList.selectTips'))
        }
        let multipleSelection = this.multipleSelection1
        let hasAgent = multipleSelection.some((item) => item.agentCompName !== '')
        if (hasAgent) {
          let bool = multipleSelection.some((item) => item.agentCompName === '')
          if (bool) {
            return this.$msgErrClose(this.$t('FeeList.errorTips'))
          }
          let agentCompName = multipleSelection[0].agentCompName
          bool = multipleSelection.some((item) => item.agentCompName !== agentCompName)
          if (bool) {
            return this.$msgErrClose(this.$t('FeeList.collectionTips'))
          }
          let bool1 = multipleSelection.some((item) => item.receipayType === 'receive')
          let bool2 = multipleSelection.some((item) => item.receipayType === 'pay')
          if (bool1 && bool2) {
            return this.$msgErrClose(this.$t('FeeList.coexistTips'))
          }
        }
        data.feeIds = this.multipleSelection1.map((v) => v.feeId).join(',')
      } else {
        data.query = this.searchBackup
      }
      this.loading = true
      groupSettleOrderApply(data)
        .then((res) => {
          if (res.data.settleOrderNos) {
            this.settleOrderNos = res.data.settleOrderNos
            this.resultDialogOption.show = true
            return
          }
          this.$store.state._feeToSettleParams = res
          // localStorage.setItem('_feeToSettleParams', JSON.stringify(res))
          this.routerPushTab('CreateSettlement',  { source: 'createSettlementFromFeeSearch' })
          // this.isJumpRouteFromPage = true
          // this.$router.push({
          //   path: '/finance/settlement/createSettlement',
          //   query: { source: 'createSettlementFromFeeSearch' },
          // })
        })
        .finally(() => (this.loading = false))
    },
    openAgentReceipayDialog() {
      let selectedArr = this.multipleSelection1
      if (selectedArr.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.expenseTips'))
      }
      if (selectedArr.some((item) => item.sourceType !== 'order')) {
        return this.$msgErrClose(this.$t('FeeList.businessTips'))
      }
      if (selectedArr.some((item) => item.sourceType === 'order' && item.sourceBizNo !== selectedArr[0].sourceBizNo)) {
        return this.$msgErrClose(this.$t('FeeList.sameTips'))
      }
      let data = {
        orderNo: this.multipleSelection1[0].sourceBizNo,
        orderFeeIds: this.multipleSelection1.map((item) => item.orderFeeId),
      }
      feeAgentValid(data).then(res => {
        this.agentReceipayDialogVisible = true
      })
    },
    setAgentCompany() {
      this.$refs.agentForm.validate((valid) => {
        if (valid) {
          let data = {
            orderNo: this.multipleSelection1[0].sourceBizNo,
            agentCompCode: this.agentForm.agentCompCode,
            orderFeeIds: this.multipleSelection1.map((item) => item.orderFeeId),
          }
          this.btnLoading = true
          setAgentCompany(data)
            .then((res) => {
              if (res.code === 0) {
                this.agentReceipayDialogVisible = false
                this.$msgSucClose(this.$t('Settle.paymentSuc'))
                this.getData()
              }
            })
            .finally(() => (this.btnLoading = false))
        }
      })
    },
    cancelAgentCompany() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.needsTips'))
      } else {
        let multipleSelection = this.multipleSelection1
        let bool = multipleSelection.some((item) => item.agentCompName === '')
        if (bool) {
          return this.$msgErrClose(this.$t('FeeList.noNeedTips'))
        }
      }
      this.$confirm(this.$t('FeeList.sureTips'), this.$t('FeeList.tips'), {
        confirmButtonText: this.$t('FeeList.sure'),
        cancelButtonText: this.$t('FeeList.cancel'),
        type: 'warning',
      })
        .then(() => {
          let data = {
            orderNo: this.multipleSelection1[0].sourceBizNo,
            orderFeeIds: this.multipleSelection1.map((item) => item.orderFeeId),
          }
          cancelAgentCompany(data).then((res) => {
            if (res.code === 0) {
              this.$msgSucClose(this.$t('FeeList.cancelTips'))
              this.getData()
            }
          })
        })
        .catch(() => {})
    },
    // 导出
    // exportBtn () {
    handleCommand(command) {
      let { prop, order } = this.sortParams
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = {
        columns: this.customColumnsKeys,
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['feeId'],
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = this.searchBackup || []
      data.query = JSON.parse(JSON.stringify(data.query))

      if (this.multipleSelection1.length) {
        data.query = [{ column: 'feeIds', type: 'in', value: this.multipleSelection1.map((v) => v.feeId).join(',') }]
      }
      if (command === 'feeDetail') {
        //查询对象的配置编码
        data.query.push({ column: 'queryDataModuleCode', value: 'feeListExport' })
        this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), `${this.$t('FeeList.expensesList')}.xlsx`)
        })
      } else if (['orderNo', 'finDate'].includes(command)) {
        data.exportType = command
        this.$confirm(`${this.$t('FeeList.confirmTips')}(${command === 'orderNo' ? this.$t('FeeList.orderNo') : this.$t('FeeList.financialDate')})?`, this.$t('FeeList.export'), {
          showCancelButton: true,
          confirmButtonText: this.$t('FeeList.sure'),
          cancelButtonText: this.$t('FeeList.cancel'),
          lockScroll: 'true',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = this.$t('FeeList.executing')
              setTimeout(() => {
                this.option1.loading = true
                this.$store
                  .dispatch('finance/downloadBlobFilePost', {
                    uri: '/fin/fee/surplusStatement/export',
                    data: { data },
                  })
                  .then((res) => {
                    this.option1.loading = false
                    console.log(res)
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(res)
                    link.download = `${this.$t('FeeList.statementTips')}(${command === 'orderNo' ? this.$t('FeeList.orderNo') : this.$t('FeeList.financialDate')}).xlsx`
                    link.click()
                    done()
                    instance.confirmButtonLoading = false
                    this.loading = false
                  })
                  .catch(() => {
                    this.option1.loading = false
                    this.$message({ message: this.$t('FeeList.exportFailed'), type: 'error' })
                    done()
                    instance.confirmButtonLoading = false
                    this.loading = false
                  })
              }, 10)
            } else {
              done()
              instance.confirmButtonLoading = false
              this.loading = false
            }
          },
        })
          .then(() => {})
          .catch(() => {})
        // surplusStatementExport(data).then((res) => this.aTagClick(res.data.filePath, res.data.name))
      } else if (command === 'exportCompareFeeList') {
        this.exportCompareFeeList()
      }
    },
    handleCommand2(command) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.checkTips'))
      }
      if (this.multipleSelection1.every(item => item.settleCorpCode === this.multipleSelection1[0].settleCorpCode) ||
      this.multipleSelection1.every(item => item.settleCorpSubType === "foreign_peer" || item.settleCorpSubType === "foreign_cust")) {
        this.billDialog = true
        this.$nextTick(() => {
          this.$refs.billDialogForm.resetFields()
        })
      } else {
        this.$msgErrClose(this.$t('FeeList.foreignTips'))
      }
    },
    exportBill() {
      this.$refs.billDialogForm.validate((valid) => {
        if (!valid) return
        this.billDialog = false
        let billDetailParams = {
          feeIds: this.multipleSelection1.map((val) => val.feeId)
          // settleOrderNo: this.multipleSelection1.map((val) => val.settleOrderNo).join(','),
          // soureType: 'settleOrder',
        }
        let settleOrderBillId = ''
        generateBill({ ...this.billDialogForm, ...billDetailParams }).then((res) => {
          settleOrderBillId = res.data.settleOrderBillId
          // if (res.data.length) {
          //   if (res.data.length === 1) {
          //     this.routerPush('BillDetail', { billId: res.data[0].orderBillId })
          //   } else {
          //     this.settleOrderBillIds = res.data.map((item) => item.orderBillNo).toString()
          //     this.resultDialogOption.show = true
          //   }
          // }
          this.routerPush('SettlementBillDetail',
            {
              settleOrderBillId
              // billDetailParams: JSON.stringify({ ...this.billDialogForm, ...billDetailParams }),
            },
            {
              isTab: true
            }
          )
        })
      })
    },
    billTypeChange(val) {
      console.log(val)
      if (val === 'bill') {
        this.billDialogForm.billFeeType = 'fee_amt'
      }
    },
    showDetail(row) {
      let sourceType = row.sourceType
      let sourceBizNo = row.sourceBizNo
      this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId, isTab: true })
    },
    showColumnDetail(params) {
      console.log(params.componentProps)
      if (params.type === 'paySettleApplyNo' || params.type === 'pay_order' || params.type === 'writeoffNos') {
        let agentCompName = params.componentProps.row && params.componentProps.row.agentCompName
        let compName = this.$store.state.user.userInfo.settleCompanyName
        if (agentCompName && compName !== agentCompName) {
          return this.$msgErrClose(this.$t('FeeList.noPermission'))
        }
      }
      this.showColumnDetailHandle(params, { isTab: true })
    },
    closingConfirm() {
      this.$refs.closingForm.validate((valid) => {
        if (valid) {
          console.log(valid)
        }
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
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data

      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1.map((item) => item.feeId).join(',')
      if (ids) {
        data2.query.push({ column: 'feeIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    confirmFee() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.confirmedTips'))
      }
      this.$confirm(this.$t('FeeList.confirmSelectedTips'), this.$t('FeeList.tips'), {
        confirmButtonText: this.$t('FeeList.sure'),
        cancelButtonText: this.$t('FeeList.cancel'),
        type: 'warning',
      })
        .then(() => {
          let feeIds = this.multipleSelection1.map((item) => item.feeId)
          confirmFee({ feeIds }).then((res) => {
            this.$msgSucClose(this.$t('FeeList.confirmedSuc'))
            this.getData()
          })
        })
        .catch(() => {})
    },
    // TODO 待删除
    customerConfirm() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.billTips'))
      }
      let arr = []
      this.multipleSelection1.forEach((item) => {
        let data = {
          billId: item.orderBillId,
          confirmStatus: 'yes',
        }
        arr.push(customerConfirm(data))
      })
      Promise.all(arr).then((res) => {
        this.$msgSucClose(this.$t('FeeList.billSuc'))
        this.getData()
      })
    },
    // TODO 收款登记
    regWriteoff() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.collectionRegTips'))
      }
      // this.routerPush('RegWriteoffDetail')
      this.loading = true
      toQuickRecvWriteoff({ feeIds: rows.map((v) => v.feeId) })
        .then((res) => {
          localStorage.setItem('_feeToRegParams', JSON.stringify(res))
          this.routerPushTab('RegWriteoffDetail')
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取订舱代理
    getSupplierList(queryString, item) {
      this.$store
        .dispatch('dict/querySupplierList', { category: 'category', value: 'bkg_agent', queryString: queryString })
        .then((data) => {
          if (data.list && data.list.length) {
            let arr = data.list.map((ele) => {
              return {
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : '',
              }
            })
            if (this.remoteSelectCommon(item, arr)) return
            item.remoteSelectList = data.list.map((ele) => {
              return Object.assign(ele, {
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : '',
              })
            })
          }
        })
    },
    // 获取委托单位
    getCustList(val = '', item) {
      let data = {
        currPage: 1,
        pageSize: 50,
        query: val
          ? [
              { column: 'name', type: 'like', value: val },
              // {"column": "bdEmployeeId", "type": "eq", "value": this.createdItem.seller},
              { column: 'roleType', type: 'eq', value: 'client' },
            ]
          : [
              //  {"column": "bdEmployeeId", "type": "eq", "value": this.createdItem.seller},
              { column: 'roleType', type: 'eq', value: 'client' },
            ],
      }
      customerList(data).then((res) => {
        if (this.remoteSelectCommon(item, res.data.list, { label: this.$language == 'en' ? 'ename' : 'name', value: 'custid' }))
          return
        item.remoteSelectList = res.data.list.map((o) => {
          return {
            value: o.custid,
            label: this.$language == 'en' ? o.ename : o.name,
          }
        })
      })
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [
        { column: 'roleCode', type: 'eq', value: role },
        { column: 'employeeStatus', type: 'eq', value: 'all' },
      ] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 50, query }).then(({ data: { list } }) => {
        if (
          this.remoteSelectCommon(
            item,
            list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
          )
        )
          return
        item.remoteSelectList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
      })
    },
    // 船司
    shipQuerySearch(queryString, item) {
      this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: '' }).then((data) => {
        if (this.remoteSelectCommon(item, data, { label: 'key', value: 'value' })) return
        item.remoteSelectList = data.map((ele) => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key,
          })
        })
      })
    },
    handleBizDetail(row) {
      console.log(row)
      // if (row.sourceType === 'finbill') {
      //   return this.showDetail(row)
      // }
      this.bizDetailVisible.isFinBill = row.sourceType === 'finbill'
      this.bizDetailVisible.show = true
      this.bizDetailVisible.feeId = row.feeId
    },
    exportCompareFeeList(){
      let { prop, order } = this.sortParams
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = {
        columns: this.customColumnsKeys,
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['feeId'],
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = this.searchBackup || []
      data.query = JSON.parse(JSON.stringify(data.query))

      if (this.multipleSelection1.length) {
        data.query = [{ column: 'feeIds', type: 'in', value: this.multipleSelection1.map((v) => v.feeId).join(',') }]
      }
      this.loading = true
      exportCompareFeeList(data).then(res=> {
        setTimeout(() => {
          this.$msgSucClose(this.$t('FeeList.emailTips'))
        }, 600)
      }).finally(() => setTimeout(() => {
        this.loading = false
      }, 600))
    },
    relationRegDialog() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('FeeList.associatedTips'))
      }
      this.lsLoading = true
      listReceivableRegForWriteoff({
        feeIds: this.multipleSelection1.map((v) => v.feeId),
      })
        .then((res) => {
          if(!res.data?.length){
            return this.$msgErrClose(this.$t('FeeList.noMatchTips'))
          }
          this.settleRegList = res.data
          this.relationRegDialogVisible.show = true
        })
        .finally(() => (this.lsLoading = false))
    },
    goRelationReg(obj){
      // obj && obj.data && this.routerPushTab(obj.name, {...obj.data})
      obj && obj.data && this.routerPushTab('WriteoffRecvFromFeeDetail', {...obj.data})
    },
  },
  watch: {
    agentReceipayDialogVisible(newVal) {
      if (newVal) {
        this.agentForm.agentCompCode = ''
      }
    },
    isSelectAll(newVal) {
      if (newVal) {
        let ref = this.$refs.listTableRef
        ref.handleMulti([])
        ref.$refs.xTable1 && ref.$refs.xTable1.clearCheckboxRow()
        this.option1.data.forEach((item) => {
          item._checkDisabled = true
        })
      } else {
        this.option1.data.forEach((item) => {
          item._checkDisabled = false
        })
      }
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    PreviewDialog,
    BizDetailList,
    RelationReg,
  },
  computed: {
    ...mapState({
      defaultColumns: (state) => state.finance.columns.defaultColumnsFeeList,
      columnsBase: (state) => state.finance.columns.columnsBase,
    }),
    hasSearch() {
      // 不再判断是否有搜索条件
      return true
      return this.searchBackup && this.searchBackup.length
    },
    // ...mapGetters(['dictMap'])
  },
}
</script>
<style lang="scss" scoped>
/deep/ .billForm{
  .el-form-item{
    width: 100% !important;
  }
}
.money-box-left ::v-deep {
  .el-checkbox {
    line-height: 40px;
  }
  .el-checkbox__label {
    padding-left: 4px;
    //  padding-right: 10px;
  }
}
.result-dialog-descript {
  margin-top: 12px;
  span {
    font-size: 12px;
    display: inline-block;
    color: #222;
    width: 33%;
    margin-top: 8px;
    float: left;
    text-align: left;
  }
}
</style>
<style>
.batch-print-create .el-dialog__body {
  padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
  padding-bottom: 32px;
  text-align: center;
}
.batch-print-create .el-form .el-input {
  width: 320px;
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
</style>
<style lang="scss" scoped>
// .select-template-box {
//   float: left;
// }
// .select-template-box .el-dropdown {
//   margin-left: 0;
//   margin-bottom: 0;
//   border-radius: 0;
//   font-size: 12px;
//   border: 1px solid #d9d9d9;
//   border-radius: 4px;
// }
// .select-template-box:hover .el-dropdown {
//   background: rgb(236, 245, 255);
//   color: rgb(64, 158, 255);
// }
// .select-template-box .el-dropdown-link {
//   cursor: pointer;
//   padding-left: 5px;
//   line-height: 18px;
//   display: inline-block;
// }
// .select-template-box .el-icon--right {
//   margin-left: 0;
// }
// .select-template-box .el-dropdown-link:focus {
//   outline: none;
// }
.export__dialog .el-form-item__content > div {
  width: 100%;
}
</style>
