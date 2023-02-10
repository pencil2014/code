<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.importSupBill')}}</div>
        </div>
        <div class="money-box-right">
          <el-button type="primary" @click="addSettlement" size="mini">{{$t('Supplier.importStat')}}</el-button>
          <el-button type="primary" @click="importBill" size="mini">{{$t('Supplier.reconciliation')}}</el-button>
          <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
        </div>
      </div>
    </div>
    <div class="detail_page_form">
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        :inline="true"
        label-width="180px"
        size="mini"
        label-suffix=":"
      >
        <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorpCodeObj">
          <el-select
            size="mini"
            value-key="key"
            v-model="form.settleCorpCodeObj"
            filterable
            remote
            clearable
            :remote-method="searchSettle"
            @visible-change="searchSettle('')"
            @change="settleChange"
          >
            <el-option v-for="(o,i) in settleCorps" :key="o.value + i" :label="o.value" :value="o"></el-option>
          </el-select>
          <!-- <el-autocomplete
            v-model="form.settleCorpName"
            :placeholder="$t('Common.plSelect')"
            clearable
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
            @select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
            @change="(value) => {autocomplete1.change && autocomplete1.change(value)}"
          ></el-autocomplete>-->
        </el-form-item>
        <!-- <el-form-item :label="$t('FeeList.templateType')" prop="templateType">
            <el-select
              v-model="form.templateType"
              :placeholder="$t('Common.plSelect')">
              <el-option
              v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
              :key="'supplierBillCompareStatementType' + j"
              :label="op.label"
              :value="op.value">
              </el-option>
            </el-select>
        </el-form-item>-->
        <el-form-item :label="$t('FeeList.receipayType')" prop="receipayType">
          <el-select v-model="form.receipayType" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['feeitemReceipayGroup']"
              :key="'receipayType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Supplier.parsingMode')" prop="parseMode">
          <el-select v-model="form.parseMode" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['supplierBillParseMode']"
              :key="'parseMode' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
          <!-- supplier_bill_compare_statement_type -->
        </el-form-item>
        <el-form-item :label="$t('Supplier.contrastMode')" prop="templateType">
          <el-select v-model="form.templateType" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
              :key="'templateType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- supplier_bill_match_crop_code -->
        <el-form-item :label="$t('Supplier.matchBranch')" prop="matchCompType">
          <el-select v-model="form.matchCompType" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['supplierBillMatchCropCode']"
              :key="'matchCompType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="bizDate" class="bizDate_form_item">
          <!-- <div slot="label" style="display:inline-block;cursor:pointer" @click="toggleDateType"> -->
          <el-select slot="label" v-model="form.matchDateType" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['supplierBillMatchDateType']"
              :key="'supplierBillMatchDateType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
          <!-- <span>{{dictMapObj['supplierBillMatchDateType'][form.matchDateType]}}</span>
            <span class="top_bottom_caret">
              <i class="el-icon el-icon-caret-top"></i>
              <i class="el-icon el-icon-caret-bottom"></i>
          </span>-->
          <el-date-picker
            v-model="form.bizDate"
            type="daterange"
            :start-placeholder="$t('Common.startDate')"
            :end-placeholder="$t('Common.endDate')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('Supplier.reCostSources')" prop="matchFeeSourceType">
          <el-select v-model="form.matchFeeSourceType" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="(op, j) in dictMap['supplierBillFeeSourceType']"
              :key="'matchFeeSourceType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="结算单号" prop="settleOrderNo">
          <el-input v-model="form.settleOrderNo" :placeholder="$t('Common.plEnter')" />
          <el-button style="position:absolute" type="text" size="mini" @click="addSettlement">添加</el-button>
        </el-form-item>-->
        <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
        <el-form-item
          v-if="isShowUpload"
          :label="$t('Supplier.importBill')"
          prop="fileNo"
          class="invoice-payment-add-form-upload"
          style="width: 100%"
        >
          <el-input
            v-model="form.fileNo"
            style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
          ></el-input>
          <FinanceUploadEmbed
            v-if="uploadShow"
            :upload-api="uploadApi2"
            :upload-params="uploadParams2"
            :limit="1"
            @send-res-file-list="sendResFileList"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="finance-search-list-gap" v-if="form.matchFeeSourceType === 'settle_order'"></div>
    <div class="finance-list-container" v-if="form.matchFeeSourceType === 'settle_order'">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.statementInfo')}}</div>
        </div>
        <div class="money-box-right"></div>
      </div>
      <div style="height:8px"></div>
      <FinanceTableMass :option="option1" />
    </div>
    <el-dialog
      v-if="dialogVisible"
      :title="$t('Supplier.selectStatement')"
      :visible.sync="dialogVisible"
      class="finance-select-settlement"
      width="1168px"
    >
      <SettlementList
        ref="settlementList"
        :justSelect="true"
        :supplierSettleCorpCode="form.settleCorpCode"
        :selectSettlement="selectSettlement"
        :selectedSettlement="selectedSettlement"
      />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="confirmAction">{{$t('Common.sure')}}</el-button>
        <el-button @click="dialogVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import SupplierBillDetailForm from './supplierBillDetailForm'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import SettlementList from '@/views/finance/supplierBill/supplierBillList/components/components/selectSettlement'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import DiffCompare from '@/views/finance/supplierBill/supplierBillList/components/diffCompare'
import { saveSupplierBill } from '@/api/fin/supplierBill'
export default {
  name: 'importBill',
  mixins: [mixin, routerMixin],
  components: {
    DiffCompare,
    SupplierBillDetailForm,
    FinanceUploadEmbed,
    SettlementList,
    FinanceTableMass,
  },
  activated() {
    console.log(this.$route.meta.isUseCache)
    if (this.$route.meta.isUseCache) {
      return
    }
    this.form.settleCorpName = ''
    this.form.fileId = ''
    this.selectedSettlement.splice(0, 100)
    this.uploadShow = false
    this.$nextTick(() => {
      this.uploadShow = true
      this.$refs.form.resetFields()
    })
  },
  data() {
    return {
      dateType: 'biz_date',
      form: {
        settleCorpName: '',
        settleCorpCode: '',
        settleCorpCodeObj: '',
        matchCropCode: '',
        templateType: '',
        receipayType: '',
        parseMode: '',
        bizDate: '',
        templateType: '',
        fileNo: '',
        fileId: '',
        matchDateType: 'biz_date',
        matchFeeSourceType: '',
        settleOrderNo: '',
        matchCompType: '',
      },
      rules: {
        settleCorpCodeObj: [{ required: true, message: this.$t('Supplier.setemptyTips'), trigger: 'change' }],
        matchCompType: [{ required: true,  message: this.$t('Supplier.branchTips'), trigger: 'change' }],
        receipayType: [{ required: true,  message: this.$t('Supplier.repayempTips'), trigger: 'change' }],
        parseMode: [{ required: true,  message: this.$t('Supplier.patternTips'), trigger: 'change' }],
        templateType: [{ required: true,  message: this.$t('Supplier.templateTips'), trigger: 'change' }],
        // bizDate: [{ required: true, message: '日期范围不能为空', trigger: 'change' }],
        // fin_date: [{ required: true,  message: this.$t('Supplier.busdateTips'), trigger: 'change' }],
        fileNo: [{ required: true,  message: this.$t('Supplier.attachmentTips'), trigger: 'change' }],
        matchFeeSourceType: [{ required: true, message: this.$t('Supplier.feesourceempty'), trigger: 'change' }],
        // settleOrderNo: [{ required: true, message: '结算单号不能为空', trigger: 'change' }],
      },
      showUploadBtn: true,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      isShowUpload: true,
      autocomplete1: {},
      dialogVisible: false,
      uploadShow: true,
      option1: {},
      selectSettlement: [],
      selectedSettlement: [],
      settleCorps: [],
    }
  },
  watch: {
    // 'form.settleCorpCode'(val) {
    //   console.log(val)
    // },
    // selectSettlement(val) {
    //   console.log('`````````````val`````````````')
    //   console.log(val)
    // },
    // selectedSettlement(val) {
    //   console.log('~~~~~~~~~~~~~~')
    //   console.log(val)
    // },
  },
  created() {
    let common = {
      data: this.selectedSettlement,
      tips: { show: false },
      selection: false,
      rootTipsHide: true,
      pagination: false,
    }
    this.option1 = Object.assign({}, this.option, common, {
      id: 'option1',
      $name: 'SupplierBillImport',
      operationBtns: Object.assign({}, this.option.operationBtns, {
        callback: (action, index, row) => {
          this.$confirmWarn(this.$t('Supplier.delStatement'), () => {
            this.option1.data.splice(index, 1)
          })
        },
        data: [{ show: true, label: this.$t('Common.del') }],
      }),
      columns: [
        { prop: 'settleOrderNo', label: this.$t('Supplier.stateNumber'), type: 'text', width: 138 },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
        { prop: 'receivePayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'receipayType', width: 80 },
        { prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), type: 'text', width: 80 },
        { prop: 'sumAmount', label: this.$t('Settle.sumAmount'), type: 'tooltip', width: 80 },
        { prop: 'writeoffStatus', label: this.$t('FeeList.writeoffStatuss'), type: 'select', width: 80 },
        // { prop: 'settleOrderStatus', label: '锁定状态', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
        // { prop: 'settleOrderStatus', label: '费用确认', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
        {
          prop: 'confirmStatus',
          label: this.$t('FeeList.confirmStatus'),
          type: 'text',
          width: 100,
          // formatter: (row, pItem) => {
          //   if (row[pItem.prop] === 'yes') {
          //     return this.$t('Common.confirmed')
          //   } else if (row[pItem.prop] === 'no') {
          //     return this.$t('Common.unconfirmed')
          //   } else {
          //     return row[pItem.prop]
          //   }
          // },
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return this.$t('Common.confirmed')
            } else if (cellValue === 'no') {
              return this.$t('Common.unconfirmed')
            } else {
              return cellValue
            }
          },
        },
        {
          prop: 'settleOrderStatus',
          label: this.$t('Settle.settleOrderStatus'),
          type: 'select',
          propInDict: 'finSettleOrderStatus',
          width: 100,
        },
        { prop: 'agentCompName', label: this.$t('Settle.agentCompName'), type: 'text', width: 150 },
        { prop: 'reciWriteOffAmtDesc', label: this.$t('Settle.reciWriteOffAmtDesc'), type: 'text', width: 100 },
        { prop: 'reciNoWriteOffAmtDesc', label: this.$t('Settle.reciNoWriteOffAmtDesc'), type: 'text', width: 100 },
        { prop: 'payWriteOffAmtDesc', label: this.$t('Settle.payWriteOffAmtDesc'), type: 'text', width: 100 },
        { prop: 'payNoWriteOffAmtDesc', label: this.$t('Settle.payNoWriteOffAmtDesc'), type: 'text', width: 100 },
        { prop: 'orderType', label: this.$t('Settle.orderType'), type: 'select', propInDict: 'settleOrderType', width: 80 },
        { prop: 'sourceType', label: this.$t('Settle.sourceType'), type: 'select', propInDict: 'settleOrderSourceType', width: 100 },
        { prop: 'payApplyNo', label: this.$t('Settle.payApplyNo'), type: 'text', width: 130 },
        { prop: 'payOrderNos', label: this.$t('Settle.payOrderNo'), type: 'text', width: 130 },
        { prop: 'writeoffNos', label: this.$t('FeeList.writeoffNo'), type: 'text', width: 130 },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', width: 100 },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130 },
      ],
    })
  },
  methods: {
    searchSettle(queryString) {
      this.querySettleUnit({ queryString, unitTypes: 'supplier' }).then((data) => {
        this.settleCorps = data || []
      })
    },
    cancel() {
      // console.log(this.form.matchFeeSourceType)
      // return
      this.routerBack()
    },
    importBill() {
      // settleCorpName	是	String	结算单位名称
      // settleCorpCode	是	String	结算单位编码
      // receipayType	是	String	收付类型 应收应付/仅应付
      // templateType	是	String	导入的模板类型 明细/总额
      // parseMode	是	String	解析模式 全部解析/排除退佣/仅退佣
      // matchCompType	是	String	匹配分公司 本分公司/集团
      // matchDateType	是	String	匹配日期类型 字典supplier_bill_match_date_type
      // bizDateStart	是	LocalDate	业务日期开始
      // bizDateEnd	是	LocalDate	业务日期结束
      // matchFeeSourceType	是	String	匹配费用来源 字典supplier_bill_fee_source_type
      // settleOrderNo	是	String	结算单号
      // fileNo	是	String	上传文件编号
      // fileName	是	String	上传文件名称
      this.$refs.form.validate((valid) => {
        // console.log(this.form)
        if (!valid) return
        if (this.form.matchFeeSourceType === 'settle_order' && !this.selectedSettlement.length) {
          return this.$msgErrClose(this.$t('Supplier.addstatement'))
        }
        let { value: settleCorpName, key: settleCorpCode } = this.form.settleCorpCodeObj
        let data = { ...this.form, settleCorpName, settleCorpCode }
        data.bizDateStart = data.bizDate[0]
        data.bizDateEnd = data.bizDate[1]
        data.settleOrderNo = this.selectedSettlement.map((v) => v.settleOrderNo).join(',')
        this.lsLoading = true
        saveSupplierBill(data)
          .then((res) => {
            let { supplierBillId, lastCompareId, matchResult } = res.data || {}
            this.$msgSucClose(this.$t('Supplier.importedSuc'))
            this.routerDelBack()
            this.routerPush('SupplierBillListResult', { supplierBillId, lastCompareId, matchResult, back: 2 })
            // console.log(this.form)
          })
          .finally(() => (this.lsLoading = false))
      })
    },
    sendResFileList(val) {
      this.form.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.form.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.form.fileName = val && val.length > 0 ? val[0].name : ''
    },
    // toggleDateType() {
    //   this.form.bizDate = ''
    //   if (this.form.matchDateType == 'biz_date') {
    //     this.form.matchDateType = 'fin_date'
    //   } else {
    //     this.form.matchDateType = 'biz_date'
    //   }
    //   // this.$nextTick(() => this.$refs.form.clearValidate())
    // },
    // 添加结算单，显示弹框
    addSettlement() {
      if (this.form.matchFeeSourceType !== 'settle_order') {
        return this.$msgErrClose(this.$t('Supplier.reconcilOnly'))
      }
      if (this.option1.data.length) {
        return this.$msgErrClose(this.$t('Supplier.onlyoneTips'))
      }
      this.dialogVisible = true
    },
    confirmAction() {
      if (this.selectSettlement.length < 1) {
        return this.$msgErrClose(this.$t('Supplier.selectStatementTips'))
      }
      if (this.selectSettlement.length > 1) {
        return this.$msgErrClose(this.$t('Supplier.onlyoneTips'))
      }
      this.selectedSettlement.push(...this.selectSettlement)
      this.dialogVisible = false
      // console.log(this.option1)
    },
    settleChange(val) {
      if (val) {
        this.form.settleCorpName = val.value
        this.form.settleCorpCode = val.key
      } else {
        this.form.settleCorpName = this.form.settleCorpCode = ''
      }
    },
  },
}
</script>
<style scoped lang="scss">
::v-deep .el-dialog__body {
  padding: 10px 20px;
}
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.money-box.money-box-overflow {
  padding: 10px 0 10px 16px;
  /* height: 100px; */
}
.money-box.money-box-overflow .money-title {
  line-height: 20px;
}
.money-box.money-box-overflow .money-title {
  min-width: 80px;
}
.top_bottom_caret {
  float: right;
  display: inline-block;
  position: relative;
  width: 16px;
  height: 20px;
  cursor: pointer;
  & > i {
    position: absolute;
    right: 0;
    top: 0;
    color: #d9d9d9;
    &.el-icon-caret-bottom {
      top: 8px;
    }
  }
}
.detail_page_form {
  padding-top: 20px;
  .el-range-editor.el-input__inner {
    padding: 3px 0 0 10px;
  }
  ::v-deep {
    .bizDate_form_item {
      .el-select .el-input.is-focus .el-input__inner,
      .el-select .el-input__inner:focus{
        border-color: #DCDFE6;
      }
      label {
        margin-left: 1px;
        margin-right: -1px;
        padding-right: 0 !important;
        input{
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right-color: white;
        }
      }
      .el-form-item__content>div{
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    .el-form-item__content {
      width: 200px;
      & > div {
        width: 100%;
      }
    }
    .upload-file-cont {
      width: 510px !important;
    }
  }
}
</style>