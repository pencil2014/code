<template>
  <el-dialog
    class="refund-dialog"
    :title="$t('Collect.refund')"
    :visible.sync="open"
    :before-close="cancel"
    :close-on-click-modal="false"
    width="1000px"
    top="8vh"
  >
    <el-form :model="form" ref="form" label-width="185px" size="mini" label-suffix=":">
      <h3>{{$t('Collect.refundInfo')}}</h3>
      <el-form-item :label="form.title+'('+form.currency+')'" prop="preceiveAmt" style="width:50%;" label-width="200px">
        <el-input disabled v-model="form.preceiveAmt"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Collect.refundcur')" prop="refundCurrency" :rules="defaultRules" label-width="220px">
        <el-select
          v-model="form.refundCurrency"
          @change="currencyChange"
          style="width:100%"
          :placeholder="$t('Common.plSelect')"
        >
          <el-option
            v-for="(item, index) in dictMap['validCurrency']"
            :key="'refundForm_refundCurrency' + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('PreClose.exRates')" prop="rate" :rules="defaultRules">
        <el-input
          :placeholder="$t('Collect.curTips')"
          v-model="form.rate"
          v-lsNumber="{value:'number', obj:form, key:'rate', dot:11 }"
          :maxlength="16"
        ></el-input>
      </el-form-item>
      
      <el-form-item
        :label="$t('Charge.actualAmt')"
        prop="realRefundAmt"
        v-lsNumber="{value:'number', obj:form, key:'realRefundAmt'}"
      >
        <el-input v-model="form.realRefundAmt" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('Charge.refundType')" prop="refundType" :rules="defaultRules">
        <el-select v-model="form.refundType" style="width:100%" :placeholder="$t('Common.plSelect')">
          <el-option
            v-for="(item, index) in dictMap['refundType']"
            :key="'refundType' + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Settle.bearer')" prop="transferChargeType" :rules="defaultRules">
        <div>
          <el-radio
            v-model="form.transferChargeType"
            label="customer"
            @change="chanegType"
            size="mini"
          >{{$t('Common.customer')}}</el-radio>
          <el-radio
            v-model="form.transferChargeType"
            label="employee"
            @change="chanegType"
            size="mini"
          >{{$t('PreClose.salesman')}}</el-radio>
        </div>
      </el-form-item>
      <el-form-item :label="$t('PreClose.salesman')" prop="employeeName" :rules="defaultRules">
        <el-select
          style="width:100%"
          v-model="form.employeeName"
          :placeholder="$t('Common.plEnter')"
          class="finance-transferfee-person-select"
          filterable
          remote
          :remote-method="employeeSelectlist"
          @visible-change="(value) => {value && employeeSelectlist && employeeSelectlist('')}"
          @change="(value) => {employeeSelectChange(value)}"
        >
          <el-option
            v-for="(item, index) in employeeSelectOptions"
            :key="'employeeSelectOptions' + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item :label="$t('Collect.transferFeeAmt')" prop="transferFeeAmt">
        <el-input v-model="form.transferFeeAmt" disabled :placeholder="$t('Common.plEnter')"></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('Collect.receiveRefundAmt')"
        prop="receiveRefundAmt"
        v-lsNumber="{value:'number', obj:form, key:'receiveRefundAmt'}"
        label-width="220px"
        style="width: 50%"
      >
        <!-- :rules="defaultRules" -->
        <el-input v-model="form.receiveRefundAmt" :placeholder="$t('Common.plEnter')" :maxlength="16"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Collect.handlingAmt')" prop="receiveTransferFeeAmt" :rules="originRules" label-width="220px"
        style="width: 50%">
        <el-input
          :disabled="form.transferChargeType == 'employee'"
          v-model="form.receiveTransferFeeAmt"
          :placeholder="$t('Common.plEnter')"
          :maxlength="16"
          v-lsNumber="{value:'number', obj:form, key:'receiveTransferFeeAmt'}"
        ></el-input>
        <!-- 使用onput value值有问题时只能改动原始输入框的值，v-model不生效了，改为v-lsNumber暂未发现问题 -->
        <!-- oninput="(value)=>{
            if(isNaN(value)){ form.receiveTransferFeeAmt=''} 
            if(value.indexOf('.')>0){ form.receiveTransferFeeAmt=value.slice(0,value.indexOf('.')+3)}
        }"-->
        <!-- v-lsNumber="{value:'number', obj:form, key:'receiveTransferFeeAmt'}" -->
      </el-form-item>
      <div class="devide-line"></div>
      <h3>{{$t('Settle.recvBankName')}}</h3>
      <el-form-item ref="bankAccount" :label="$t('Charge.customerBank')" prop="recvBankName" :rules="defaultRules">
        <!-- filterable -->
        <!-- 20220630迭代修改 -->
        <!-- disabled -->
        <!-- <el-input
          v-if="form.refund === 'pay' && form.isTemporary == 'yes'"
          v-model="form.recvBankName"
        ></el-input>-->
        <!-- v-else -->
        <el-select
          v-model="form.recvBankName"
          :placeholder="$t('Common.plSelect')"
          style="width:100%"
          filterable
          :allow-create="true"
          :remote-method="(queryString) => {bankAccountListChange(queryString)}"
          @visible-change="(value) => {if(value) bankAccountListChange()}"
          @change="(value) => {bankAccountChange(value)}"
        >
          <el-option
            v-for="(item, index) in bankAccountSelectOptions"
            :key="'bankAccountSelectOptions' + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Collect.accountName')" prop="recvAccountName">
        <el-input v-model="form.recvAccountName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('Charge.custRecAccNo')" prop="recvAccountNo">
        <el-input
          v-model="form.recvAccountNo"
          :disabled="form.isTemporary !== 'yes'"
          maxlength="32"
        ></el-input>
      </el-form-item>
      <div class="devide-line"></div>
      <h3>{{$t('Collect.paymentBank')}}</h3>

      <el-form-item :label="$t('Collect.paymentMethods')" prop="payWay" :rules="defaultRules">
        <el-select
          v-model="form.payWay"
          :placeholder="$t('Common.plSelect')"
          style="width:100%"
          @change="payWayChange"
        >
          <el-option
            v-for="(item, index) in [...(dictMap['payWay'].filter(item => item.value !== 'prepay_dedue'))]"
            :key="'form_payWay' + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-if="!payAccountHide" label="付款银行简称" prop="payAccountShortName" :rules="defaultRules"> -->
      <el-form-item
        v-if="!payAccountHide"
        :label="$t('Collect.payBankShort')"
        prop="payAccountShortName"
        :rules="defaultRules"
      >
        <el-select
          v-model="form.payAccountShortName"
          :placeholder="$t('Common.plSelect')"
          style="width:100%"
          @change="payAccountShortNameChange"
        >
          <el-option
            v-for="(item, index) in payAccountSelections"
            :key="'payAccountSelections' + index"
            :label="item.value"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="!payAccountHide" :label="$t('PayApplyList.payAccountNo')" prop="payAccountNo">
        <el-input v-model="form.payAccountNo" disabled></el-input>
      </el-form-item>
      <el-form-item v-if="!payAccountHide" :label="$t('Collect.paymentBank')" prop="payBankName">
        <el-input v-model="form.payBankName" disabled></el-input>
      </el-form-item>
      <el-form-item
        v-if="!payAccountHide"
        :label="$t('PayApplyList.settleMode')"
        prop="settleMode"
        :rules="settleModeRules"
      >
        <el-select style="width:100%" v-model="form.settleMode" clearable :placeholder="$t('Common.plSelect')">
          <el-option
            v-for="item in bankAccountSettleModeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('PayApplyList.refundRemark')" prop="remark" style="width:100%">
        <el-input
          type="textarea"
          :maxlength="500"
          show-word-limit
          v-model="form.remark"
          autosize
          :placeholder="$t('Collect.remarkTips')"
        ></el-input>
      </el-form-item>
      <el-form-item
        style="width:100%;padding-bottom:10px"
        :label="$t('Collect.refundMandate')"
        prop="trustFileIds"
        :rules="{required: true, message: $t('Common.required'), trigger: 'change'}"
        ref="uploadFormItem"
      >
        <el-upload
          ref="upload"
          drag
          class="upload-file-cont"
          action="#"
          :multiple="true"
          :auto-upload="true"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="handleImport"
          :file-list="fileList"
        >
          <div class="file-upload">
            <img class="file-upload-img" src="../../../../assets/icon-upload.png" />
            <div class="file-upload__text">
              <div class="txt">{{$t('BillList.clickToImport')}}</div>
              <p
                class="info"
              >{{$t('Payment.uploadTips')}}</p>
            </div>
          </div>
        </el-upload>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
      </el-form-item>
      <el-form-item
        style="width:100%;padding-bottom:6px"
        :label="$t('Collect.uploadSheets')"
        prop="payBankseqFileNo"
        ref="uploadFormItem2"
        :rules="{required: true, message: $t('Common.required'), trigger: 'change'}"
      >
        <el-upload
          drag
          class="upload-file-cont"
          action="#"
          :limit="1"
          :auto-upload="true"
          :before-upload="getFile"
          :on-change="handleChangeFile2"
          :http-request="handleImport2"
          :file-list="fileList2"
          :on-remove="handleRemove2"
          :on-exceed="onExceed"
        >
          <div class="file-upload">
            <img class="file-upload-img" src="../../../../assets/icon-upload.png" />
            <div class="file-upload__text">
              <div class="txt">{{$t('BillList.clickToImport')}}</div>
              <p
                class="info"
              >{{$t('Payment.uploadTips')}}</p>
            </div>
          </div>
        </el-upload>
        <el-progress v-show="showProcess2" :percentage="processLength2" :stroke-width="2"></el-progress>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :loading="isRefundLoading" type="primary" @click="refundSubmit" size="mini">{{$t('Common.sure')}}</el-button>
      <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { receivablePrerevRefund } from '@/api/fin/receivableReg'
import { regTransferRefund } from '@/api/fin/receivableReg'
import { queryAllBankAccountList, companyBankAccountList, bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { actualExchangeRate, listByRole, bankList } from '@/api/base'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'

export default {
  mixins: [mixin],
  props: {
    form: { type: Object, default: () => ({}) },
    open: { type: Boolean, default: false },
  },
  data() {
    return {
      isRefundLoading: false,
      bankAccountSelectOptions: [],
      payAccountSelections: [],
      disabled: true,
      fileList2: [],
      showProcess2: false,
      processLength2: 0,
      fileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 5,
      //业务员列表
      employeeSelectOptions: [],
      timer: null,
      exchangeRateList: [],
      changeRateList: [],
      recvCurrency: this.form.currency,
      payCurrency: this.form.currency,
      defaultRules: { required: true, message: ' ', trigger: 'change' },
      settleModeRules: { required: true, message: ' ', trigger: 'change' },
      originRules: { required: true, message: ' ', trigger: 'change' },
      payAccountHide: false,
      firstGetData: true,
      bankAccountSettleModeList: [],
    }
  },
  created() {
    this.backupRecvBankName = this.form.recvBankName
    this.backupAccountName = this.form.recvAccountName
    this.backupAccountNo = this.form.recvAccountNo
    console.log(this.form)
    
    // console.log(this.dictMap['payWay'])
    this.actualExchange()
    if (this.form.payBankseqFileNo) {
      this.fileList2.push({ name: this.form.payBankseqFileName })
    }
    if (this.form.refund === 'pay' && this.form.isTemporary === 'yes') {
      let dict = this.dictMap.bankAccountSettleMode
      let find = dict.find((v) => v.value === this.form.settleMode)
      this.bankAccountSettleModeList = find ? [find] : []
    } else {
      this.payWayChange(this.form.payWay, true)
      // this.bankAccountListChange().finally(() => {
      //   this.bankAccountChange('', this.form.recvBankName)
      // })
    }
  },
  methods: {
    payAccountShortNameChange(val, row) {
      let optionItem = this.payAccountSelections.find((v) => v.value === val)
      console.log(optionItem)
      this.form.payAccountNo = optionItem.accountNo
      this.form.payBankName = optionItem.bankName
      this.form.payBankAccountId = optionItem.settleUnitBankAcctId
      this.payCurrency = optionItem.currency
      this.form.settleMode = ''
      let dict = this.dictMap.bankAccountSettleMode
      this.bankAccountSettleModeList = optionItem.settleMode.map((item) => {
        return dict.find((v) => v.value === item)
      })
    },
    actualExchange() {
      actualExchangeRate({rateType: 'pay'}).then((res) => {
        if (res.code === 0) {
          this.exchangeRateList = res.data
          this.currencyChange(this.form.currency, true)
        }
      })
    },
    companyBankAccountList(queryString, cb, cb2) {
      this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
        cb2 && cb2(data)
      })
    },
    // 上传前钩子获取file名
    getFile(file) {
      // console.log(this.fileList)
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$msgErrClose(this.$t('Settle.uploadfile', {size: this.defaultFileSize + 'M'}))
        return false
      }
      return true
    },
    handleChangeFile2(file, fileList) {
      this.handleChangeFile(file, fileList, 'fileList2')
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList, type) {
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        return
      }
      this[type === 'fileList2' ? 'fileList2' : 'fileList'] = fileList
    },
    handleRemove2(file, fileList) {
      this.form.payBankseqFileName = ''
      this.$set(this.form, 'payBankseqFileNo', '')
      this.handleRemove(file, fileList, 'fileList2')
    },
    handleRemove(file, fileList, type) {
      let index = fileList.findIndex((item) => {
        return (item.uid = file.uid)
      })
      this.form.trustFileIds.splice(index, 1) // 删除对应的fileId
      this[type === 'fileList2' ? 'fileList2' : 'fileList'] = fileList
    },
    handleImport2(done) {
      this.handleImport(done, 'fileList2')
    },
    handleImport(done, type) {
      if (type === 'fileList2') {
        this.handleProgress2()
      } else {
        this.handleProgress(type)
      }
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('file', this.file)

      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form,
        })
        .then((res) => {
          if (type === 'fileList2') {
            this.processLength2 = 100
            this.showProcess2 = false
            this.$set(this.form, 'payBankseqFileNo', res.data.data.fileNo)
            this.form.payBankseqFileName = res.data.data.name
            this.$msgSucClose(this.$t('BillList.uploadSuccess'))
            this.$nextTick(() => {
              this.$refs.uploadFormItem2.clearValidate()
            })
            return
          }
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            this.form.trustFileIds.push({ fileNo: res.data.data.fileNo, fileName: res.data.data.name })
          }
          if (this.fileList.length === this.form.trustFileIds.length) {
            this.$msgSucClose(this.$t('BillList.uploadSuccess'), 1000)
            this.$nextTick(() => {
              this.$refs.uploadFormItem.clearValidate()
            })
          }
        }).catch(err => {
          this[type === 'fileList2' ? 'fileList2' : 'fileList'].pop()
          this.showProcess = false
          this.processLength2 = this.processLength = 0
          clearInterval(this.progressInterval)
        })
    },
    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength = 0
      this.showProcess = true
      this.progressInterval = setInterval(() => {
        if (this.processLength >= 99) {
          clearInterval(this.progressInterval)
          return
        }
        this.processLength += 1
      }, 200)
    },
    onExceed(file, fileList) {
      this.$msgErrClose(this.$t('Collect.onlyFile'))
    },
    // 上传进度条
    handleProgress2(file, fileList) {
      this.processLength2 = 0
      this.showProcess2 = true
      const interval = setInterval(() => {
        if (this.processLength2 >= 99) {
          clearInterval(interval)
          return
        }
        this.processLength2 += 1
      }, 200)
    },
    currencyChange(value, formRate) {
      let currency = this.form.currency
      this.changeRateList = this.exchangeRateList.filter((item) => {
        return currency === item.srcCurrency && value === item.toCurrency
      })
      if (this.changeRateList.length) {
        this.form.rate = this.changeRateList[0].rate
      } else {
        this.form.rate = null
      }
      if (this.form.currency === this.form.refundCurrency) {
        this.form.rate = 1
      }
      if (formRate) return
      //币种改变清除客户收款账号
      // if (this.recvCurrency !== value) {
      if (this.form.refund === 'pay' && this.form.isTemporary === 'yes') {
      } else {
        this.form.accountCode = ''
        this.form.recvBankName = ''
        this.form.recvAccountNo = ''
        this.form.recvAccountName = ''
        this.form.recvBankAccountId = ''
      }
      // }

      // if (this.payCurrency !== value) {
      this.form.payAccountNo = ''
      this.form.payAccountShortName = ''
      this.form.settleMode = ''
      this.bankAccountSettleModeList = []
      this.form.payBankAccountId = ''
      this.form.payBankName = ''
      // }
      // 获取付款银行列表
      this.payWayChange(this.form.payWay)
    },
    refundSubmit() {
      // if (this.form.transferChargeType === 'employee') {
      //   if (!this.form.employeeName) {
      //     this.$msgErrClose('选择业务员不能为空')
      //     return
      //   }
      // }
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (
            !this.validateMoney(this.form.rate, { positive: true }) ||
            !this.validateMoney(this.form.receiveRefundAmt, { positive: true }) ||
            (this.originRules.required && !this.validateMoney(this.form.receiveTransferFeeAmt, { positive: true }))
          ) {
            return
          }
          if (this.form.currency === this.form.refundCurrency) {
            if (this.form.rate != 1) {
              this.$msgErrClose(this.$t('Collect.rateTips'))
              return
            }
          }
          // if(this.changeRateList.length){
          //   let changeRate = this.changeRateList[0]
          //   if(Number(changeRate.lowerRate) < Number(this.form.rate)){
          //     this.$message({
          //       message: '系统设置汇率上下限:'+changeRate.srcCurrency+'->'+changeRate.toCurrency+'('+changeRate.lowerRate+'-'+changeRate.upperRate+')，请重新输入汇率',
          //       type: 'error',
          //       showClose: true
          //     })
          //     return
          //   }
          //   if(Number(changeRate.upperRate) > Number(this.form.rate)){
          //     this.$message({
          //       message: '系统设置汇率上下限:'+changeRate.srcCurrency+'->'+changeRate.toCurrency+'('+changeRate.lowerRate+'-'+changeRate.upperRate+')，请重新输入汇率',
          //       type: 'error',
          //       showClose: true
          //     })
          //     return
          //   }
          // }else{
          //   if(this.form.currency !== this.form.refundCurrency){
          //     this.$message({
          //       message: '系统没有维护今日结算汇率:'+this.form.currency+'->'+this.form.refundCurrency+'',
          //       type: 'error',
          //       showClose: true
          //     })
          //     return
          //   }

          // }
          let obj = {}
          // if(this.form.payWay == 'cash'){
          //   obj = {payAccountShortName:'',payAccountNo:'',payBankAccountId:'',payBankName:'',}
          // }
          this.form.trustFileIds.forEach((item) => (item.trustFileType = 'payProxyFile'))
          let data = Object.assign({}, this.form, obj, {
            fileList: this.form.trustFileIds.concat({
              fileName: this.form.payBankseqFileName,
              fileNo: this.form.payBankseqFileNo,
              trustFileType: 'payBankseqFile',
            }),
            receivableRegId: this.form.receivableRegId,
            receivablePrerevId: this.form.receivablePrerevId,
          })

          // if (this.backupAccountName !== this.form.recvAccountName || this.backupAccountNo != this.form.recvAccountNo) {
          //   return this.$msgErrClose(`请选择原收款账户'${this.backupAccountName}(${this.backupAccountNo})'`)
          // }
          let method = this.form.refund === 'pay' ? receivablePrerevRefund : regTransferRefund
          this.isRefundLoading = true
          method(data)
            .then((res) => {
              if (res.code === 0) {
                this.$message({ message: this.$t('Collect.refundSub'), type: 'success' })
                this.cancel(true)
              }
            })
            .finally(() => (this.isRefundLoading = false))
        }
      })
    },
    employeeSelectChange(val) {
      let obj = this.employeeSelectOptions.find((item) => {
        return item.value === val
      })
      this.form.employeeName = obj.label
      this.form.employeeId = obj.value
    },
    selfSetData(arr, key, val) {
      arr = arr || []
      let obj = {},
        result = []
      arr.forEach((item) => {
        if (!obj[item[key]]) {
          obj[item[key]] = true
          result.push({ label: item[key], value: item[val] })
        }
      })
      return result
    },
    //客户收款账号
    bankAccountListChange(queryString) {
      if (this.form.isTemporary == 'yes') {
        // 银行列表
        return bankList({
          currPage: 1,
          pageSize: 30,
          query: [{ column: 'cname', type: 'like', value: queryString }],
        }).then((res) => {
          this.bankAccountSelectOptions = (res.data.list || []).map((item) => {
            return { ...item, value: item.cname, label: item.cname }
          })
        })
        let query = {
          unitType: 'ex_client',
          currency: this.form.refundCurrency,
          // 用户使用时对于未显示的账号有疑问，去掉银行名搜索条件，显示所有的，保存时提醒
          accountName: this.form.accountShortName,
          unitCode: this.form.settleCorpCode,
          status: 'effect',
        }
        if (this.form.payWay === 'cash') {
          query.publicType = 'prv'
          query.accountName = ''
        }
        return bankAccountListAll(query).then(({ data }) => {
          // 不能去重，选账户时，根据id显示的
          // this.bankAccountSelectOptions = this.selfSetData(data, 'bankName','settleUnitBankAcctId')
          let list = data.length ? data : []
          // if (this.firstGetData) {
          //   this.firstGetData = false
          //   let find = list.find((item) => item.accountNo === this.form.recvAccountNo)
          //   this.form.recvBankAccountId = find ? find.settleUnitBankAcctId : ''
          // }
          this.bankAccountSelectOptions = list.map((item) => {
            item.value = item.settleUnitBankAcctId
            item.label = `${item.bankName + item.accountNo}`
            return item
          })
        })
      }
      let query = {
        // "accountNo":this.form.recvAccountNo,
        unitCode: this.form.settleCorpCode,
        currency: this.form.refundCurrency,
        // 用户使用时对于未显示的账号有疑问，去掉银行名搜索条件，显示所有的，保存时提醒
        // accountName: this.form.payWay === 'cash' ? '' : this.form.accountName,
        status: 'effect',
        receipayType: 'receive',
        publicType: this.form.payWay === 'cash' ? 'prv' : '',
      }
      return this.$store.dispatch('dict/bankAccountList', query).then((data) => {
        // 不能去重，选账户时，根据id显示的
        // this.bankAccountSelectOptions = this.selfSetData(data, 'bankName','settleUnitBankAcctId')
        let list = data.length ? data : []
        // if (this.firstGetData) {
        //   this.firstGetData = false
        //   let find = list.find((item) => item.accountNo === this.form.recvAccountNo)
        //   this.form.recvBankAccountId = find ? find.settleUnitBankAcctId : ''
        // }
        this.bankAccountSelectOptions = list.map((item) => {
          item.value = item.settleUnitBankAcctId
          item.label = `${item.bankName + item.accountNo}`
          return item
        })
      })
    },
    bankAccountChange(value, bankName) {
      if (value.length > 128) {
        this.form.recvBankName = ''
        return this.$msgErrClose(this.$t('Collect.wordCount'))
      }
      if (this.form.isTemporary === 'yes') {
        return
      }
      let obj = this.bankAccountSelectOptions.find((item) => {
        return item.settleUnitBankAcctId === value || item.bankName == bankName
      })
      this.form.accountCode = obj && obj.key
      this.form.recvBankName = obj && obj.bankName
      this.form.recvAccountNo = obj && obj.accountNo
      this.form.recvAccountName = obj && obj.accountName
      this.form.recvBankAccountId = obj && obj.settleUnitBankAcctId
      this.form.recvAccountPublicType = obj && obj.publicType
      this.$nextTick(() => this.$refs.bankAccount.clearValidate())
    },
    //业务员
    employeeSelectlist(name) {
      let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        this.employeeSelectOptions = list.map((v) => ({ ...v, label: v.cname, value: v.employeeId }))
      })
    },
    chanegType() {
      if (this.form.transferChargeType === 'customer') {
        this.originRules.required = true
        // this.form.employeeId = ''
        // this.form.employeeName = ''
        this.disabled = true

        let receiveRefundAmt = Number(this.form.receiveRefundAmt)
        let receiveTransferFeeAmt = Number(this.form.receiveTransferFeeAmt)
        if (receiveRefundAmt + receiveTransferFeeAmt > this.form.preceiveAmt) {
          this.$msgErrClose(this.$t('Collect.actualrefund'))
          this.form.receiveTransferFeeAmt = ''
        }
      }
      if (this.form.transferChargeType === 'employee' && this.form.receiveTransferFeeAmt) {
        this.form.receiveTransferFeeAmt = ''
        // this.disabled = false
      }
      if (this.form.transferChargeType === 'employee') {
        this.originRules.required = false
      }
      this.form.receiveTransferFeeAmt = ''
    },
    cancel(isBreak) {
      this.$emit('close-refund-dialog', false, isBreak) //第一参数返回不刷新，第二参数刷新列表
      this.form.trustFileIds = [] // 删除对应的fileId
      this.fileList = []
      this.$refs.form.resetFields()
      // this.actualExchange()
    },
    payWayChange(val, isFirst) {
      if (!isFirst) {
        this.form.settleMode = ''
      }
      if (val === 'intrabranch') {
        this.settleModeRules.required = false
        this.$refs.form.clearValidate(['settleMode'])
      } else {
        this.settleModeRules.required = true
      }
      this.bankAccountSettleModeList = []
      if (val === 'cash' || val == 'prepay_dedue') {
        this.payAccountHide = true
        if (!isFirst) {
          this.form.payAccountShortName = this.form.payAccountNo = this.form.payBankAccountId = this.form.payBankName = ''
        }
        this.form.payAccountShortName = this.form.payAccountNo = this.form.payBankAccountId = this.form.payBankName = ''
        if (this.form.recvAccountPublicType === 'pub') {
          console.log(this.form.recvAccountPublicType)
          if (this.form.refund === 'pay' && this.form.isTemporary === 'yes') {
          } else {
            this.form.accountCode =
              this.form.recvBankName =
              this.form.recvAccountNo =
              this.form.recvAccountName =
              this.form.recvBankAccountId =
                ''
          }
        }
      } else {
        this.payAccountHide = false
        if (!isFirst) {
          this.form.payAccountShortName = this.form.payAccountNo = this.form.payBankAccountId = this.form.payBankName = ''
        }
        // let query = { accountName: '', currency: this.form.refundCurrency, countryOrgType: val, receipayType: 'pay' }
        let query = {
          currency: this.form.refundCurrency,
          accountName: '',
          status: 'effect',
          receipayType: 'pay',
          hasChequeAcct: val === 'cheque' ? 'yes' : '', // 是否支票账户
          countryOrgType: ['cheque', 'intrabranch'].includes(val) ? '' : val, // 区域
          hasIntrabranch: val === 'intrabranch' ? 'yes' : 'no', // 是否内部往来
          unitCode: this.form.recvCompCode,
        }
        this.companyBankAccountList(
          query,
          () => {},
          (data) => {
            // if (data && data.length) {
            // console.log(data);
            this.payAccountSelections = data || []
            if (isFirst) {
              let obj = data.find((item) => item.accountNo === this.form.payAccountNo)
              if (obj) {
                let dict = this.dictMap.bankAccountSettleMode
                this.bankAccountSettleModeList = obj.settleMode.map((item) => dict.find((v) => v.value === item)).filter((v) => v)
                return
              } else if (this.form.payAccountShortName) {
                this.form.settleMode = ''
                this.$msgWarnClose(this.$t('Collect.automatic'))
              }
            }
            let obj = data[0]
            let dict = this.dictMap.bankAccountSettleMode
            this.bankAccountSettleModeList = obj.settleMode.map((item) => dict.find((v) => v.value === item)).filter((v) => v)
            this.form.settleMode = obj.settleMode[0]
            this.form.payAccountShortName = obj.accountShortName
            this.form.payAccountNo = obj.accountNo
            this.form.payBankAccountId = obj.settleUnitBankAcctId
            this.form.payBankName = obj.bankName
          }
          // }
        )
      }
    },
  },
  watch: {
    //原币实退金额
    'form.receiveRefundAmt': {
      handler(newVal, oldVal) {
        clearTimeout(this.timer)

        this.timer = setTimeout(() => {
          let realRefundAmt = Number(newVal)
          let rate = Number(this.form.rate)
          let receiveTransferFeeAmt = Number(this.form.receiveTransferFeeAmt ? this.form.receiveTransferFeeAmt : 0)
          if (!isNaN(rate)) {
            this.form.realRefundAmt = (realRefundAmt * rate).toFixed(2)
          }
          if (this.form.transferChargeType === 'employee') {
            console.log(realRefundAmt)
            console.log(receiveTransferFeeAmt)
            if (realRefundAmt > this.form.preceiveAmt) {
              this.form.receiveRefundAmt = ''
              return this.$msgErrClose(this.$t('Collect.greaterThen',{title: this.form.title}))
            }
            return
          }
          if (realRefundAmt + receiveTransferFeeAmt > this.form.preceiveAmt) {
            this.form.receiveRefundAmt = ''
            return this.$msgErrClose(this.$t('Collect.moreThen',{title: this.form.title}))
          }
          if (realRefundAmt < 0) {
            this.form.receiveRefundAmt = ''
            return this.$msgErrClose(this.$t('Collect.negativeTips'))
          }
        }, 500)
      },
      deep: true,
    },
    //汇率
    'form.rate': {
      handler(newVal, oldVal) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          let realRefundAmt = Number(newVal)
          let receiveRefundAmt = Number(this.form.receiveRefundAmt)
          let receiveTransferFeeAmt = Number(this.form.receiveTransferFeeAmt)
          if (realRefundAmt < 0) {
            this.form.rate = ''
            return this.$msgErrClose(this.$t('Collect.ratenegative'))
          }
          if (receiveRefundAmt !== 0 && !isNaN(receiveRefundAmt)) {
            this.form.realRefundAmt = (realRefundAmt * receiveRefundAmt).toFixed(2)
          }
          if (receiveTransferFeeAmt !== 0 && !isNaN(receiveTransferFeeAmt)) {
            this.form.transferFeeAmt = (receiveTransferFeeAmt * realRefundAmt).toFixed(2)
          }
        }, 500)
      },
      deep: true,
    },

    //原币手续费金额
    'form.receiveTransferFeeAmt': {
      handler(newVal, oldVal) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          let realRefundAmt = Number(newVal)
          let rate = Number(this.form.rate)
          let receiveRefundAmt = Number(this.form.receiveRefundAmt)
          if (rate !== 0 && !isNaN(rate)) {
            this.form.transferFeeAmt = (rate * (realRefundAmt ? realRefundAmt : 0)).toFixed(2)
          }
          if (this.form.transferChargeType === 'employee') {
            return
          }
          if (realRefundAmt + receiveRefundAmt > this.form.preceiveAmt) {
            this.form.receiveTransferFeeAmt = ''
            return this.$msgErrClose(this.$t('Collect.moreThen', {title: this.form.title}))
          }
          if (realRefundAmt < 0) {
            this.form.receiveTransferFeeAmt = ''
            return this.$msgErrClose(this.$t('Collect.handnegative'))
          }
        }, 500)
      },
      deep: true,
    },
  },
  computed: {
    ...mapState({ dictMap: (state) => state.dict.dictMap }),
  },
}
</script>

<style lang='scss' >
.refund-dialog {
  .el-dialog__body {
    max-height: none;
    padding-top: 0;
    padding-bottom: 0;
  }
  h3 {
    font-size: 14px;
    color: #222222;
    padding: 0;
    margin: 8px 0 6px 0;
  }
  .devide-line {
    background: #e9e9e9;
    height: 1px;
    margin-top: 4px;
  }
}
</style>
<style lang='scss'  scoped>
.refund-dialog ::v-deep {
  .el-form-item__label{
    word-break: normal;
  }
  .file-upload {
    display: flex;
    img {
      margin-left: 10px;
      flex-basis: 42px;
    }
    .txt {
      margin-bottom: 6px;
    }
  }
  .el-upload-list {
    margin-top: -6px;
    .el-upload-list__item {
      margin-top: 0px;
    }
  }
  .el-form-item--mini .el-form-item__error {
    margin-top: -6px;
  }
  .el-input {
    width: 100% !important;
  }
  .el-radio__label {
    font-size: 12px;
    padding-left: 6px;
  }
  .el-form-item--mini.el-form-item {
    display: inline-block;
    margin-bottom: 4px;
    width: 50%;
  }
}
</style>