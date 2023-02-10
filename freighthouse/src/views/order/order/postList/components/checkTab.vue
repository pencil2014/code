<template>
  <div class="page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" @click="importAction" size="mini" type="primary">导入快递公司账单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="createSettlement"
              size="mini"
              type="primary"
            >生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancelCompare" size="mini" type="purple">撤销对账</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="searchResult" size="mini">
            <el-radio-button label>全部</el-radio-button>
            <el-radio-button label="none">不匹配</el-radio-button>
            <el-radio-button label="part">部分匹配</el-radio-button>
            <el-radio-button label="all">完全匹配</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <div class="cancel-invoice-receivable-form" v-if="dialogVisible">
      <el-dialog :title="'导入快递公司账单'" :visible.sync="dialogVisible" width="600px">
        <div>
          <el-form
            :model="form"
            :rules="rules"
            ref="form"
            :inline="true"
            label-width="110px"
            size="mini"
          >
            <el-form-item label="快递公司名称" prop="supplierCorpCode">
              <el-select
                style="width: 100%;"
                v-model="form.supplierCorpCode"
                value-key="value"
                placeholder="请选择快递公司"
                filterable
                remote
                :noRemote="true"
                :remote-method="(queryString) => supplierCorpRemote(queryString)"
                @visible-change="(val) => val && supplierCorpRemote('')"
                @change="(val) => supplierCorpChange(val)"
              >
                <el-option
                  v-for="(item,index) in supplierCorpSelectList"
                  :key="item.value+item.label+index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="对账日期范围" prop="bizDateRange">
              <el-date-picker
                v-model="form.bizDateRange"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              ></el-date-picker>
            </el-form-item>-->
            <el-form-item label="比对方式" prop="compareType">
              <el-select v-model="form.compareType" placeholder="请输入">
                <el-option
                  v-for="(op, j) in dictMap['expressBillCompareType']"
                  :key="'expressBillCompareType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
            <el-form-item
              v-if="isShowUpload"
              label="导入快递单"
              prop="fileNo"
              class="invoice-payment-add-form-upload"
              style="position:relative;"
            >
              <el-input
                v-model="form.fileNo"
                style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
              ></el-input>
              <FinanceUploadEmbed
                :upload-api="uploadApi2"
                :upload-params="uploadParams2"
                :limit="1"
                @send-res-file-list="sendResFileList"
              />
              <!-- :width="280" -->
            </el-form-item>
          </el-form>
          <div>
            <span style="font-size:12px;padding:0 12px">导入快递公司账单模板下载</span>
            <el-button size="mini" @click="download">模板下载</el-button>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="confirmAction">确定</el-button>
          <el-button @click="dialogVisible = false" size="mini">取消</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 修改结算单位 -->
    <el-dialog
      v-if="exchangeCorpDialog"
      :visible.sync="exchangeCorpDialog"
      title="生成结算单"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" size="mini">
        <el-form-item label="结算单归属分公司：" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            placeholder="请选择分公司"
            filterable
            remote
            :noRemote="true"
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectList"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <span style="color:#BFBFBF;padding-left: 130px;">请选择快递费付款的分公司</span>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="primary">确定</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin.js'
import EXPRESS from '@/api/fin/expressBill'

export default {
  name: 'post0',
  label: '对账列表',
  mixins: [mixin, routerMixin, voucherMixin],
  data() {
    return {
      corpForm: { settleCorp: '' },
      supplierCorpSelectList: [],
      corpRules: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialog: false,
      settleCorpSelectList: [],
      tableOption: {},
      searchOption: {},
      isAddPay: false,
      multipleSelection: [],
      multipleSelection2: [],
      form: {
        supplierCorpName: '',
        supplierCorpCode: '',
        // bizDateRange: '',
        fileNo: '',
        fileId: '',
        compareType: '',
      },
      orderNo: '',
      orderBillId: '',
      feeAdjustApplyId: 0,
      autocomplete1: {},
      dialogVisible: false,
      batchPrintCreateForm: {
        applyAmt: 0,
        invoiceAmt: 0,
        invoiceReceivableId: 0,
      },
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      currentComponent: '',
      expressBillId: '',
      source: '',
      rules: {
        supplierCorpCode: [{ required: true, message: ' ', trigger: 'change' }],
        // bizDateRange: [{ required: true, message: '对账日期范围不能为空', trigger: 'change' }],
        fileNo: [{ required: true, message: '附件不能为空', trigger: 'change' }],
      },
      showUploadBtn: true,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      searchResult: '',
      statusCfg: [
        { label: '已生成', value: 'yes' },
        { label: '未生成', value: 'no' },
      ],
      isShowUpload: true,
    }
  },
  watch: {
    searchResult(val) {
      this.search(val)
    },
  },
  created() {
    let searchInputGroup = ['supplierBillNo', 'supplierCorpCode', 'settleOrderStatus', 'createdTime']
    this.searchOption = {
      saveDefault: true,
      saveName: 'orderPostCheckList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 8,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          supplierBillNo: { label: '对账编号', type: 'input' },
          expressNo: { label: '快递单号', type: 'input' },
          orderNo: { label: '工作单号', type: 'input' },
          expressCode: { label: '寄单编号', type: 'input' },
          settleOrderNo: { label: '结算单号', type: 'input' },
          supplierCorpCode: {
            label: '快递公司',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'supplier' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'supplier' }, item),
          },
          settleOrderStatus: { label: '结算单状态', type: 'select', selectOptions: this.statusCfg },
          confirmStatus: { label: '费用确认', type: 'select', prop: 'webConfirmStatus' },
          createdTime: {
            label: '创建时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            range: ['createdTimeStart', 'createdTimeEnd'],
          },
          updatedTime: {
            label: '更新时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            range: ['updatedTimeStart', 'updatedTimeEnd'],
          },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '100px',
      data: [
        { label: '账单数据', type: 'text', show: true, action: 'showDetail' },
        { label: '对账', type: 'text', show: true, action: 'Edit' },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    this.tableOption = Object.assign({}, this.option, {
      id: 'tableOption',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
    })
    let columns = [
      // {
      //   prop: 'supplierCorpName',
      //   label: '结算单位名称',
      //   type: 'text',
      // },
      {
        prop: 'supplierBillNo',
        label: '对账编号',
        width: '140px',
        type: 'text',
        // type: 'button',
        // operationBtns: {
        //   show: true,
        //   callback: (fn, index, row, option) => {
        //     this.showDetail(row)
        //   },
        // },
      },
      {
        prop: 'supplierCorpName',
        label: '快递公司',
        type: 'text',
        width: '150px',
      },
      {
        prop: 'settleCompName',
        label: '结算分公司',
        type: 'text',
        width: '150px',
      },
      {
        prop: 'parseMode',
        label: '解析模式',
        type: 'select',
        propInDict: 'supplierBillParseMode',
      },
      // {
      //   prop: 'bizDateRange',
      //   label: '对账日期范围',
      //   type: 'text',
      //   width: '170px',
      //   formatter: (row, pItem) => row.bizDateStart + '-' + row.bizDateEnd,
      // },
      {
        prop: 'result',
        label: '系统核对结果',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => this.showDiff(row),
        },
        formatter: ({ cellValue }) => {
          return cellValue === 'all'
            ? `<span class="ls_green underline">完全匹配</span>`
            : cellValue === 'none'
            ? `<span class="ls_red underline">不匹配</span>`
            : cellValue === 'part'
            ? `<span class="ls_yellow underline">部分匹配</span>`
            : ''
          // all: '完全匹配'
          // none: '不匹配'
          // part: '部分匹配'
          // let obj = this.dictMap['supplierBillCompareMatchResult'].find((item) => item.value === cellValue)
          // return obj && obj.label
        },
      },
      // {
      //   prop: 'result',
      //   label: '系统核对结果',
      //   type: 'select',
      //   propInDict: 'supplierBillCompareMatchResult',
      //   // formatter: (val) => {
      //   //   let obj = this.dictMap['supplierBillCompareMatchResult'].find((item) => item.value === val)
      //   //   return obj && obj.label
      //   // },
      // },
      {
        prop: 'confirmStatus',
        label: '费用确认',
        type: 'select',
        propInDict: 'webConfirmStatus',
      },
      {
        prop: 'settleOrderStatus',
        label: '结算单状态',
        type: 'select',
        formatter: ({ cellValue }) => {
          return cellValue === 'yes' ? `<span class="ls_green">已生成</span>` : '未生成'
          // all: '完全匹配'
          // none: '不匹配'
          // part: '部分匹配'
          // let obj = this.dictMap['supplierBillCompareMatchResult'].find((item) => item.value === cellValue)
          // return obj && obj.label
        },
        // selectOptions: this.statusCfg,
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        width: '140px',
        type: 'button',
        orderNoBtn: true,
        callback: (subItem) => {
          this.routerPushTab('SettlementDetail', { source: 'settlementDetail', settleOrderNo: subItem })
        },
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
        width: 130,
      },
      {
        prop: 'updatedName',
        label: '更新人',
        type: 'text',
      },
      {
        prop: 'updatedTime',
        label: '更新时间',
        type: 'text',
        width: 130,
      },
    ]
    this.tableOption.columns = columns
    this.getData()
  },
  methods: {
    importAction() {
      this.form.compareType = this.dictMap['expressBillCompareType'][0].value
      this.form.supplierCorpName = this.form.supplierCorpCode = this.form.fileNo = ''
      this.dialogVisible = true
    },
    // 导入
    confirmAction() {
      // console.log('form:', this.form)
      this.$refs.form.validate((valid) => {
        if (valid) {
          let data = {
            supplierCorpName: this.form.supplierCorpName,
            supplierCorpCode: this.form.supplierCorpCode,
            // bizDateStart: dateFormat('yyyy-mm-dd', this.form.bizDateRange[0]),
            // bizDateEnd: dateFormat('yyyy-mm-dd', this.form.bizDateRange[1]),
            fileNo: this.form.fileNo,
            // compareType: this.dictMap['expressBillCompareType'][0].value,
            compareType: this.form.compareType,
          }
          EXPRESS.importBill(data).then((res) => {
            this.$message({
              message: '导入成功！',
              type: 'success',
              showClose: true,
            })
            // this.isShowUpload = false
            // this.$nextTick(() => {
            //   this.isShowUpload = true
            // })
            // this.$refs.form.resetFields()
            // this.form.supplierCorpName = ''
            this.dialogVisible = false
            this.getData()
          })
        }
      })
    },
    // 生成结算单
    createSettlement() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose('请勾选1个对账单！')
      }
      if (!this.multipleSelection[0].result) {
        return this.$msgErrClose('未对账不能生成结算单！')
      }
      if (this.multipleSelection[0].result !== 'all') {
        return this.$msgErrClose('部分匹配不能生成结算单！')
      }
      if (this.multipleSelection[0].confirmStatus !== 'yes') {
        return this.$msgErrClose('未进行费用确认不能生成结算单！')
      }
      let { settleCompanyCode, settleCompanyName } = this.$store.state.user.userInfo
      this.exchangeCorpDialog = true
      this.$nextTick(() => {
        this.settleCorpSelectList = [{ value: settleCompanyCode, label: settleCompanyName }]
        this.corpForm.settleCorp = this.settleCorpSelectList[0]
      })
    },
    // 撤销对账
    cancelCompare() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose('请勾选1个对账单！')
      }
      if (this.multipleSelection[0].confirmStatus === 'yes') {
        return this.$msgErrClose('费用已确认的对账单不能撤销！')
      }
      if (!this.multipleSelection[0].result) {
        return this.$msgErrClose('未对账，不能撤销！')
      }
      this.$confirmWarn('确认撤销此对账单？', () => {
        EXPRESS.cancelCompare({ expressBillId: this.multipleSelection[0].expressBillId }).then((res) => {
          this.$msgSucClose('撤销成功！')
          this.getData(true)
        })
      })
    },
    exchangeCorp() {
      console.log(this.corpForm.settleCorp)
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        this.exchangeCorpDialog = false
        this.routerPushTab('CreateSettlement', {
          source: 'createSettlementFromExpressBill',
          expressBillId: this.multipleSelection[0].expressBillId,
          supplierBillNo: this.multipleSelection[0].supplierBillNo,
          settleCompCode: this.corpForm.settleCorp.value,
          settleCompName: this.corpForm.settleCorp.label,
        })
      })
    },
    sendResFileList(val) {
      console.log(val)
      this.form.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.form.fileNo = val && val.length > 0 ? val[0].fileNo : ''
    },
    getData(isSearch) {
      if (isSearch === true) {
        this.tableOption.pagination.currPage = 1
      }
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        columns: [],
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.searchResult) {
        data.query.push({
          column: 'result',
          type: 'eq',
          value: this.searchResult || '',
        })
      }
      // console.log('data:', data)
      EXPRESS.listPage(data).then((res) => {
        this.tableOption.data = res.data.list
        Object.assign(this.tableOption.pagination, res.data)
        // this.tableOption.pagination.currPage = res.data.currPage
        // this.tableOption.pagination.pageSize = res.data.pageSize
        // this.tableOption.pagination.totalCount = res.data.totalCount
      })
    },
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.getData(true)
    },
    // 显示账单数据
    showDetail({ expressBillId }) {
      this.routerPushTab('PostListCheckData', { expressBillId })
    },
    // 显示对账页面
    handleEdit({ expressBillId }) {
      this.routerPushTab('PostListCheckResult', { expressBillId })
      // this.routerPushTab('PostListChecking', { expressBillId })
    },
    // 系统核对结果
    showDiff({ expressBillId }) {
      this.routerPushTab('PostListCheckResult', { expressBillId })
    },
    // 下载
    download() {
      this.$store
        .dispatch('finance/downloadBlobFile', {
          uri: '/fin/expressBill/templateDownload',
          params: {},
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '快递公司账单模板.xlsx'
          link.click()
        })
    },
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, unitTypes: 'company' }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    supplierCorpRemote(queryString) {
      this.querySettleUnit({ queryString, unitTypes: 'supplier', unitCategory: 'delivery', isAdd: true }).then((data) => {
        this.supplierCorpSelectList = data.map((v) => ({ value: v.key, label: v.value }))
      })
    },
    supplierCorpChange(val) {
      let find = this.supplierCorpSelectList.find((item) => item.value === val)
      this.form.supplierCorpName = find.label
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    FinanceUploadEmbed,
  },
  activated() {
    this.getData()
  },
}
</script>
<style lang="scss" scoped>
.page ::v-deep .el-table .cell {
  padding-left: 2px;
  padding-right: 2px;
}
.page ::v-deep .money-box-left .money-title {
  margin-right: 6px;
}
.money-box-right {
  padding-top: 0px;
}
// .page ::v-deep .el-dialog__body {
//   padding: 30px 24px;
//   // padding: 30px 70px;
// }
.page ::v-deep .el-dialog__body .el-input--mini,
.page ::v-deep .el-dialog__body .el-date-editor--daterange {
  width: 260px;
}
.page ::v-deep .el-dialog__body {
  padding: 30px 24px;
  .el-form-item {
    display: flex;
    & > label {
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
    }
  }
  .el-autocomplete,
  .el-autocomplete .el-input,
  .el-autocomplete .el-input input .el-autocomplete,
  .el-select,
  .el-select .el-input,
  .el-select .el-input input,
  .fin-upload-file-cont {
    width: 100% !important;
  }
}
</style>