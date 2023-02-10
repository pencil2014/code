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
          <div class="money-title">导入供应商账单</div>
        </div>
        <div class="money-box-right">
          <el-button type="primary" @click="addSettlement" size="mini">导入结算单</el-button>
          <el-button type="primary" @click="importBill" size="mini">对账</el-button>
          <el-button @click="cancel" size="mini">取消</el-button>
        </div>
      </div>
    </div>
    <div class="detail_page_form">
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        :inline="true"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="结算单位" prop="settleCorpCodeObj">
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
            <el-option v-for="o in settleCorps" :key="o.value" :label="o.value" :value="o"></el-option>
          </el-select>
          <!-- <el-autocomplete
            v-model="form.settleCorpName"
            placeholder="请选择"
            clearable
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
            @select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
            @change="(value) => {autocomplete1.change && autocomplete1.change(value)}"
          ></el-autocomplete>-->
        </el-form-item>
        <!-- <el-form-item label="模板类型" prop="templateType">
            <el-select
              v-model="form.templateType"
              placeholder="请选择">
              <el-option
              v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
              :key="'supplierBillCompareStatementType' + j"
              :label="op.label"
              :value="op.value">
              </el-option>
            </el-select>
        </el-form-item>-->
        <el-form-item label="收付类型" prop="receipayType">
          <el-select v-model="form.receipayType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['feeitemReceipayGroup']"
              :key="'receipayType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="解析模式" prop="parseMode">
          <el-select v-model="form.parseMode" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['supplierBillParseMode']"
              :key="'parseMode' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
          <!-- supplier_bill_compare_statement_type -->
        </el-form-item>
        <el-form-item label="对比方式" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
              :key="'templateType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- supplier_bill_match_crop_code -->
        <el-form-item label="匹配分公司" prop="matchCompType">
          <el-select v-model="form.matchCompType" placeholder="请选择">
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
          <el-select slot="label" v-model="form.matchDateType" placeholder="请选择">
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
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="对账费用来源" prop="matchFeeSourceType">
          <el-select v-model="form.matchFeeSourceType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['supplierBillFeeSourceType']"
              :key="'matchFeeSourceType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="结算单号" prop="settleOrderNo">
          <el-input v-model="form.settleOrderNo" placeholder="请输入" />
          <el-button style="position:absolute" type="text" size="mini" @click="addSettlement">添加</el-button>
        </el-form-item>-->
        <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
        <el-form-item
          v-if="isShowUpload"
          label="导入账单"
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
          <div class="money-title">结算单信息</div>
        </div>
        <div class="money-box-right"></div>
      </div>
      <div style="height:8px"></div>
      <FinanceTableMass :option="option1" />
    </div>
    <el-dialog
      v-if="dialogVisible"
      :title="'选择结算单'"
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
        <el-button type="primary" size="mini" @click="confirmAction">确定</el-button>
        <el-button @click="dialogVisible = false" size="mini">取消</el-button>
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
        settleCorpCodeObj: [{ required: true, message: '结算单位不能为空', trigger: 'change' }],
        matchCompType: [{ required: true, message: '匹配分公司不能为空', trigger: 'change' }],
        receipayType: [{ required: true, message: '收付类型不能为空', trigger: 'change' }],
        parseMode: [{ required: true, message: '匹配模式不能为空', trigger: 'change' }],
        templateType: [{ required: true, message: '模板类型不能为空', trigger: 'change' }],
        // bizDate: [{ required: true, message: '日期范围不能为空', trigger: 'change' }],
        // fin_date: [{ required: true, message: '业务日期范围不能为空', trigger: 'change' }],
        fileNo: [{ required: true, message: '附件不能为空', trigger: 'change' }],
        matchFeeSourceType: [{ required: true, message: '费用来源不能为空', trigger: 'change' }],
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
          this.$confirmWarn('确定删除此结算单吗？', () => {
            this.option1.data.splice(index, 1)
          })
        },
        data: [{ show: true, label: '删除' }],
      }),
      columns: [
        { prop: 'settleOrderNo', label: '结算单编号', type: 'text', width: 138 },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
        { prop: 'receivePayType', label: '收付类型', type: 'select', propInDict: 'receipayType', width: 80 },
        { prop: 'settleCurrency', label: '结算币种', type: 'text', width: 80 },
        { prop: 'sumAmount', label: '汇总金额', type: 'tooltip', width: 80 },
        { prop: 'writeoffStatus', label: '核销状态', type: 'select', width: 80 },
        // { prop: 'settleOrderStatus', label: '锁定状态', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
        // { prop: 'settleOrderStatus', label: '费用确认', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
        {
          prop: 'confirmStatus',
          label: '结算单确认状态',
          type: 'text',
          width: 100,
          // formatter: (row, pItem) => {
          //   if (row[pItem.prop] === 'yes') {
          //     return '已确认'
          //   } else if (row[pItem.prop] === 'no') {
          //     return '未确认'
          //   } else {
          //     return row[pItem.prop]
          //   }
          // },
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return '已确认'
            } else if (cellValue === 'no') {
              return '未确认'
            } else {
              return cellValue
            }
          },
        },
        {
          prop: 'settleOrderStatus',
          label: '结算单锁定状态',
          type: 'select',
          propInDict: 'finSettleOrderStatus',
          width: 100,
        },
        { prop: 'agentCompName', label: '代收付分公司', type: 'text', width: 150 },
        { prop: 'reciWriteOffAmtDesc', label: '应收已核销金额', type: 'text', width: 100 },
        { prop: 'reciNoWriteOffAmtDesc', label: '应收未核销金额', type: 'text', width: 100 },
        { prop: 'payWriteOffAmtDesc', label: '应付已核销金额', type: 'text', width: 100 },
        { prop: 'payNoWriteOffAmtDesc', label: '应付未核销金额', type: 'text', width: 100 },
        { prop: 'orderType', label: '结算单类型', type: 'select', propInDict: 'settleOrderType', width: 80 },
        { prop: 'sourceType', label: '结算单来源', type: 'select', propInDict: 'settleOrderSourceType', width: 100 },
        { prop: 'payApplyNo', label: '请款单号', type: 'text', width: 130 },
        { prop: 'payOrderNos', label: '付款单号', type: 'text', width: 130 },
        { prop: 'writeoffNos', label: '核销单号', type: 'text', width: 130 },
        { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
        { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
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
          return this.$msgErrClose('对账费用来源为结算单类型时，请添加结算单！')
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
            this.$msgSucClose('导入成功！')
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
        return this.$msgErrClose('对账费用来源为结算单时才能添加结算单！')
      }
      if (this.option1.data.length) {
        return this.$msgErrClose('只能选择一个结算单！')
      }
      this.dialogVisible = true
    },
    confirmAction() {
      if (this.selectSettlement.length < 1) {
        return this.$msgErrClose('请选择结算单！')
      }
      if (this.selectSettlement.length > 1) {
        return this.$msgErrClose('只能选择一个结算单！')
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