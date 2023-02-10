<template>
  <div
    class="finance-page invoice-recei-apply"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">手填发票</div>
        </div>
        <div class="money-box-right">
          <el-button-group style="margin-right: 4px;">
            <el-button class="finance-btn" @click="submitRegist" type="primary" size="mini">提交</el-button>
          </el-button-group>
          <el-tooltip content="多张发票时允许提交一部分已填写完整信息的发票" placement="top" effect="dark">
            <i style="cursor: pointer;margin-right: 4px;" class="el-icon-question"></i>
          </el-tooltip>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel(true)" size="mini">取消</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="finance-container-scroll manual-regist-invoice">
      <el-form
        :model="manualRegistInvoiceForm"
        ref="form"
        :inline="true"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="申请编号" prop="invoiceReceivableApplyNo">
          <el-input
            v-model="manualRegistInvoiceForm.invoiceReceivableApplyNo"
            placeholder="请输入"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="taxNo">
          <el-input v-model="manualRegistInvoiceForm.taxNo" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="客户发票抬头" prop="title" style="width: 50%;">
          <el-input v-model="manualRegistInvoiceForm.title" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="开票方式" prop="invoiceWay">
          <el-select v-model="manualRegistInvoiceForm.invoiceWay" placeholder="请选择" disabled>
            <el-option
              v-for="(op, j) in dictMap['invoiceWay']"
              :key="'invoiceWay' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发票明细类型" prop="itemGoupType">
          <el-select v-model="manualRegistInvoiceForm.itemGoupType" placeholder="请选择" disabled>
            <el-option
              v-for="(op, j) in dictMap['invoiceItemGroupType']"
              :key="'invoiceItemGroupType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开票类型" prop="invoiceType">
          <el-select v-model="manualRegistInvoiceForm.invoiceType" placeholder="请选择" disabled>
            <el-option
              v-for="(op, j) in dictMap['invoiceType']"
              :key="'invoiceType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开票币种" prop="currency">
          <el-input v-model="manualRegistInvoiceForm.currency" placeholder="请选择" disabled></el-input>
        </el-form-item>
        <el-form-item label="开票金额" prop="amt">
          <el-input v-model="manualRegistInvoiceForm.amt" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="是否发送邮件" prop="isEmail" :rules="{required:true, message: ' '}">
          <el-select v-model="manualRegistInvoiceForm.isEmail " placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['yesNo']"
              :key="'invoiceType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱信息" prop="emailAddrs" style="width: 100%;">
          <el-input type="textarea" v-model="manualRegistInvoiceForm.emailAddrs" placeholder="请输入"></el-input>
        </el-form-item>
      </el-form>
      <div
        style="color: #E63923;padding-left: 100px;margin-top: -6px;margin-bottom:10px;"
      >可输入多个邮箱，每个邮箱之间用逗号区分开，请检查每个邮箱输入正确</div>
      <div
        v-for="(item, index) in invoiceTableList"
        :key="'invoiceTableList' + index"
        class="finance-table-container"
      >
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">发票服务项-发票{{index + 1}}</div>
            <div class="money-total">
              开票金额合计：
              <span v-html="'CNY' + item.amtCny"></span>
            </div>
          </div>
          <div class="money-box-right">
            <el-button @click="previewInvoice(index)" size="mini">预览发票</el-button>
          </div>
        </div>
        <FinanceTableMass :option="item" />
      </div>
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :list="invoicePreviewList"
      :isElec="manualRegistInvoiceForm.invoiceType"
      commitStatus="preview"
      :hideSave="true"
    />
  </div>
</template>
<script>
import { registerInvoice, info } from '@/api/fin/invoiceReceivableApply'
import { dateFormat } from '@/views/finance/utils/finance'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import InovicePreviewPrint from './invoicePreviewPrint'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  name: 'manualRegistInvoice',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    InovicePreviewPrint,
  },
  data() {
    return {
      customerInfo: {},
      sellerInfo: {},
      otherInvoiceInfo: {},
      invoicePreviewList: [],
      applyItemGroupList: [],
      dialogVisibleO: { show: false },
      manualRegistInvoiceForm: {
        settleCorpName: '',
        invoiceType: '',
        title: '',
        taxNo: '',
        currency: '',
        amt: '',
        splitNo: '',
        splitUnitAmt: '',
        itemGoupType: '',
        rate: '',
        emailAddrs: '',
        remark: '',
        latestDate: '',
        postAddr: '',
        postPhone: '',
        postType: '',
        isEmail: 'yes',
      },
      invoiceTableList: [],
      invoiceReceivableApplyId: '',
      selectionRow: {},
    }
  },
  methods: {
    init() {
      this.selectionRow = JSON.parse(this.$route.query.row) || {}
      let invoiceReceivableApplyId = this.selectionRow.invoiceReceivableApplyId
      info({ invoiceReceivableApplyId }).then((res) => {
        let resData = (this.backupRow = res.data || {})
        let list = resData.invoiceReceivableList
        this.manualRegistInvoiceForm = {
          ...this.manualRegistInvoiceForm,
          ...this.selectionRow,
          ...resData,
          isEmail: resData.isEmail || 'yes',
        }
        this.renderInvoiceReceivableList(list)
        this.$nextTick(() => this.$refs.form.clearValidate())
      })
    },
    renderInvoiceReceivableList(invoiceReceivableList) {
      this.invoiceReceivableList = invoiceReceivableList
      this.invoiceTableList = []
      invoiceReceivableList.forEach((item, i) => {
        this.addInvoice()
        this.invoiceTableList[i].invoiceReceivableId = item.invoiceReceivableId
        this.invoiceTableList[i].remark = item.remark
        this.invoiceTableList[i].amtCny = item.amtCny
        this.invoiceTableList[i].data = item.invoiceReceivableItemList.map((subItem, index) => {
          if (item.invoiceNo) {
            subItem.bothDisabled = true
          }
          subItem.invoiceNo = item.invoiceNo || ''
          subItem.invoiceCode = item.invoiceCode || ''
          subItem.issueTime = dateFormat('yyyy-mm-dd', item.issueTime ? new Date(item.issueTime) : new Date())
          subItem.fileId = item.fileNo || ''
          subItem.fileName = item.fileName || ''
          subItem.fileList = item.fileName ? [{ name: item.fileName }] : []
          subItem.rowsCount = item.invoiceReceivableItemList.length
          subItem.remark = item.remark || ''
          subItem.oldRemark = item.remark || ''
          // console.log(subItem.oldRemark.split('\u3000'))
          return {
            ...subItem,
            taxRate: '' + subItem.taxRate,
            edit: true,
            amtWithoutTax: new LSnum(subItem.amt).div(new LSnum(subItem.taxRate).plus(1).toNum(2)).toNum(2),
          }
        })
      })
    },
    addInvoice() {
      this.invoiceTableList.push(this.initInvoiceTableOption(this.invoiceTableList.length))
    },
    initInvoiceTableOption(index) {
      // 发票服务项
      let operationBtns2 = Object.assign({}, this.option.operationBtns, {
        show: false,
      })
      let option = Object.assign({}, this.option, {
        disableFixedIndex0: true,
        showOverflow: false,
        id: 'option' + (index + 2),
        $name: 'invoiceReceivableApplyList2',
        data: [],
        tips: {
          text: '',
          show: false,
        },
        operationBtns: operationBtns2,
        selection: {
          show: false,
        },
        edit: true,
        spanMethod: ({ row, column, rowIndex, columnIndex }) => {
          if (columnIndex >= 8) {
            if (rowIndex === 0) {
              return {
                rowspan: row.rowsCount, // 经过处理
                colspan: 1,
              }
            } else {
              return {
                rowspan: 0,
                colspan: 0,
              }
            }
          }
        },
      })
      option.columns = [
        { prop: 'itemName', label: '服务名称', type: 'text', width: 100 },
        {
          prop: 'unit',
          label: '单位',
          type: 'text',
          width: 50,
          formatter: ({ cellValue }) => {
            return this.renderPropLabel('feeUnit', cellValue)
          },
        }, // notAllowed: true, propInDict: 'feeUnit',
        { prop: 'count', label: '数量', type: 'text', width: 60 },
        { prop: 'price', label: '单价', type: 'text', width: 88 },
        // 和后台确定是含税的金额，但预览发票时要显示不含税的金额，要计算
        { prop: 'amt', label: '金额', type: 'text', width: 88 },
        { prop: 'amtWithoutTax', label: '金额（不含税）', type: 'text', width: 110 },
        { prop: 'taxRate', label: '税率', type: 'select', width: 60, propInDict: 'taxRateInfo', readOnly: true },
        { prop: 'taxAmt', label: '税额', type: 'text', width: 88 },
        {
          prop: 'invoiceNo',
          label: '发票号',
          type: 'input',
          minWidth: 128,
          placeholder: '请输入8位或20位数字',
          // maxlength: 8,
          required: true,
          bothDisabled: true,
          validateInput: (value, row) => {
            if (!/^\d+$/.test(value)) {
              let res = /(\d+)/.exec(value)
              row.invoiceNo = res ? (res[0] ? res[0] : '') : ''
            }
          },
        },
        {
          prop: 'invoiceCode',
          label: '发票代码',
          type: 'input',
          placeholder: '请输入12位数字',
          minWidth: 120,
          maxlength: 12,
          validateInput: (value, row) => {
            if (!/^\d+$/.test(value)) {
              let res = /(\d+)/.exec(value)
              row.invoiceNo = res ? (res[0] ? res[0] : '') : ''
            }
          },
          // required: true
        },
        {
          prop: 'issueTime',
          label: '开票时间',
          type: 'datePicker',
          bothDisabled: true,
          valueFormat: 'yyyy-MM-dd',
          minWidth: 120,
          required: true,
        },
        {
          prop: 'fileId',
          label: '发票附件',
          type: 'upload',
          minWidth: 160,
          // required: this.manualRegistInvoiceForm.invoiceType === 'electronic',
        },
        {
          prop: 'remark',
          label: '备注',
          type: 'textarea',
          minWidth: 280,
          maxlength: 230,
          showWordLimit: false,
          input: this.remarkChange,
        },
      ]
      return option
    },
    // 备注输入监听
    remarkChange(val, row, option) {
      if (!row) return
      let newVal = row.remark
      let oldVal = row.oldRemark
      // console.log(newVal, oldVal)
      // console.log(this.manualRegistInvoiceForm.currency)
      if (this.manualRegistInvoiceForm.currency !== 'CNY') {
        let reg3 = /\u3000.*\u3000/ // /\u3002.*\u3002/
        if (newVal.match(reg3)) {
          console.log('输入全局字符')
          option.remark = row.remark = oldVal
          // TODO ^改为全角空格
          return this.$msgErrClose('请勿输入全角字符！')
        }
        let reg1 = /.*\u3000.*/ // /.*\u3002.*/
        if (!newVal.match(reg1)) {
          console.log('未找到全局字符')
          option.remark = row.remark = oldVal
          return
        }
        if (newVal.split('\u3000')[0] != oldVal.split('\u3000')[0]) {
          option.remark = row.remark = oldVal
          return
        } else {
          row.oldRemark = option.remark = row.remark
          return
        }
      } else {
        let reg1 = /.*\u3000.*/ // /.*\u3002.*/
        if (newVal.match(reg1)) {
          option.remark = row.remark = oldVal
          // TODO ^改为全角空格
          return this.$msgErrClose('请勿输入全角字符！')
        }
      }
      let index = this.getCharLength(newVal)
      if (index) {
        // 实际maxlength已拦截，此处未进入
        option.remark = row.remark = newVal.slice(0, index)
        return this.$msgErrClose('备注字符长度不能超过230（1个中文占2个字符）！')
      }
      row.oldRemark = option.remark = row.remark

      // if (newVal.length > 115) {
      //   // 实际maxlength已拦截，此处未进入
      //   option.remark = row.remark = newVal.slice(0, 115)
      //   return this.$msgErrClose('备注信息已达最大值115个字符！')
      // }
      // row.oldRemark = option.remark = row.remark
    },
    getCharLength(str) {
      let len = 0,
        index = 0
      let length = str.length
      for (let i = 0; i < length; i++) {
        if (str.charCodeAt(i) > 255) {
          len += 2
        } else {
          len += 1
        }
        if (len > 230) {
          index = i
          break
        }
      }
      return index
    },
    // 手填发票对话框确认
    submitRegist() {
      console.log(this.invoiceTableList)
      this.$refs.form.validate((valid) => {
        if (!valid) return
        try {
          let len = this.invoiceTableList.length
          let errLen = 0
          this.invoiceTableList.forEach((invoice, index) => {
            let optionData = invoice.data
            // console.log(optionData)
            let item0 = optionData && optionData[0]
            // debugger
            // if (!item0.invoiceNo || !item0.invoiceCode || !item0.issueTime || !item0.fileNo) {
            // (!item0.fileNo && this.manualRegistInvoiceForm.invoiceType === 'electronic')
            if (item0.invoiceNo && !item0.issueTime) {
              this.$msgErrClose(`发票${+index+1}已填写发票号，请填写开票时间！`)
              throw new Error('ending')
            }
            if (len === 1) {
              if (!item0.invoiceNo || !item0.issueTime) {
                this.$msgErrClose('请填写发票信息！')
                throw new Error('ending')
              }
              if (item0.invoiceNo.length !== 8 && item0.invoiceNo.length !== 20) {
                this.$msgErrClose('发票号只能是8位或20位数字！')
                throw new Error('ending')
              }
              if (item0.invoiceCode.length && item0.invoiceCode.length !== 12) {
                this.$msgErrClose('发票代码只能是12位数字！')
                throw new Error('ending')
              }
            } else {
              if (!item0.invoiceNo || !item0.issueTime) {
                // debugger
                if (++errLen !== len) return
                this.$msgErrClose('请填写发票信息！')
                throw new Error('ending')
              }
              if (item0.invoiceNo.length !== 8 && item0.invoiceNo.length !== 20) {
                this.$msgErrClose('发票号只能是8位或20位数字！')
                // if (++errLen !== len) return
                throw new Error('ending')
              }
              if (item0.invoiceCode.length && item0.invoiceCode.length !== 12) {
                if (++errLen !== len) return
                this.$msgErrClose('发票代码只能是12位数字！')
                throw new Error('ending')
              }
            }
          })
        } catch (err) {
          if (err.message === 'ending') {
            return
          }
        }
        let data = { invoiceReceivableApplyId: this.selectionRow.invoiceReceivableApplyId }
        data.invoiceReceivableList = this.invoiceTableList.map((item) => {
          return {
            invoiceReceivableId: item.data[0].invoiceReceivableId,
            invoiceNo: item.data[0].invoiceNo,
            invoiceCode: item.data[0].invoiceCode,
            issueTime: item.data[0].issueTime && item.data[0].issueTime.split(' ')[0],
            fileNo: item.data[0].fileNo,
            fileName: item.data[0].fileName,
            remark: item.data[0].remark,
            oldRemark: item.data[0].remark,
          }
        })
        data.isEmail = this.manualRegistInvoiceForm.isEmail
        data.emailAddrs = this.manualRegistInvoiceForm.emailAddrs.replace(/，/g, ',')
        this.btnLoading = true
        registerInvoice(data)
          .then((res) => {
            this.$msgSucClose('登记发票成功！')
            this.cancel(true)
          })
          .finally(() => (this.btnLoading = false))
      })
    },
    cancel(refresh) {
      this.routerDelBack(refresh === true)
    },
    validateApply(index) {
      let invoiceTable = this.invoiceTableList[index]
      let itemSum = invoiceTable.data.reduce((sum, curr) => {
        return new LSnum(sum).plus(curr.amt).toNum(2)
      }, BIGZERO)
      let reg2 =
        /\u5f00\u7968\u5e01\u522b\uff1a[A-Z]{3}\uff0c\u5f00\u7968\u91d1\u989d\uff1a\d+\.*\d*\uff0c\u672c\u53d1\u7968\u53ea\u63a5\u53d7\u7f8e\u5143\u4ed8\u6b3e\uff0c\u5f00\u7968\u6c47\u7387\uff1a\d+\.*\d*.*/ // \u3002
      if (this.manualRegistInvoiceForm.currency === 'CNY' && invoiceTable.remark && invoiceTable.remark.match(reg2)) {
        return this.$msgErrClose('发票备注有误，如有疑问，请联系管理员！')
      }
      let applyItemGroupList = invoiceTable.data.map((item) => {
        return {
          ...item,
          taxRate: +item.taxRate,
          itemSum,
          itemSumInvoiceCurrency: invoiceTable.itemSumInvoiceCurrency,
        }
      })
      return applyItemGroupList
    },
    previewInvoice(index) {
      let applyItemGroupList = this.validateApply(index === true ? 0 : index)
      if (!(applyItemGroupList instanceof Array)) return
      let row = this.backupRow
      this.sellerInfo = {
        unitName: row.saleCompTitle,
        taxNo: row.taxpayerNo,
        accountNo: row.saleCompAccountNo,
        addr: row.saleCompAddr,
        bankName: row.saleCompBankBranchName,
        tel: row.saleCompTel,
      }
      this.customerInfo = {
        unitName: row.title,
        taxNo: row.taxNo,
        accountNo: row.accountNo,
        addr: row.addr,
        bankName: row.buyerBankInfo,
        tel: row.tel,
      }
      this.applyItemGroupList = JSON.parse(JSON.stringify(this.invoiceTableList[index === true ? 0 : index].data))
      let totalInvoiceAmtApply = applyItemGroupList[0].itemSum
      let remark = this.invoiceTableList[index === true ? 0 : index].remark
      this.otherInvoiceInfo = {
        currency: row.currency,
        totalInvoiceAmtApply,
        invoiceNo: applyItemGroupList[0].invoiceNo,
        invoiceCode: applyItemGroupList[0].invoiceCode,
        invoiceDate: applyItemGroupList[0].issueTime,
        receiver: null,
        reviewer: null,
        createdName: null,
        remark,
        // '此发票只接受US付款，币种：，航名航次：，开航日期：2021-03-30，起运港：特尔港，工作单号：S202103290002214，提单号：，开票汇率：USD-USD 1 ，'
      }
      this.dialogVisibleO.show = true
    },
  },
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    this.init()
  },
}
</script>
<style lang="scss" scoped>
.manual-regist-invoice .el-form-item {
  margin-right: 0;
  margin-bottom: 10px;
  width: 25%;
}
.manual-regist-invoice .finance-table-container {
  margin-left: 0px;
  margin-right: 0px;
}
.manual-regist-invoice ::v-deep .el-form-item > div {
  width: calc(100% - 100px) !important;
  & > div,
  .el-input {
    width: 100%;
  }
}
.manual-regist-invoice ::v-deep {
  .finance-table .vxe-table--render-default tr td {
    height: auto !important;
    textarea {
      min-height: 36px !important;
    }
  }
}
.invoice-recei-apply .finance-container-scroll {
  padding: 10px;
  height: calc(100vh - 98px);
  overflow: auto;
}
.finance-page ::v-deep {
  padding-bottom: 1px;
  .detail__div {
    margin-right: 14px !important;
  }
}
</style>