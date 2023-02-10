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
          <div class="money-title">申请押金</div>
        </div>
        <div class="money-box-right">
          <el-button type="primary" @click="submit" size="mini">提交申请</el-button>
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
        label-width="112px"
        size="mini"
      >
        <div style="position: relative;">
          <el-form-item label="客户/供应商名称" prop="settleCorpObj">
            <el-select
              size="mini"
              value-key="unitCode"
              v-model="form.settleCorpObj"
              filterable
              remote
              clearable
              :noRemote="true"
              :remote-method="searchSettle"
              @visible-change="(val) => val && searchSettle('')"
              @change="settleChange"
            >
              <el-option
                v-for="(o,index) in settleCorps"
                :key="o.value+'_'+index"
                :label="o.value"
                :value="o"
              ></el-option>
            </el-select>
          </el-form-item>
          <span style="padding: 0 5px"></span>
          <SettleCorpTypeTags :tags="form.settleCorpObj.unitTypes||''" />
          <span
            class="warn_msg"
            v-show="warnShow"
          >未在系统里找到该抬头{{searchQuery?`(${searchQuery})`:''}}相关信息，请先到CRM里面进行添加！</span>
        </div>
        <el-form-item label="押金类型" prop="depositType">
          <el-select v-model="form.depositType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['depositType']"
              :key="'depositType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="押金子类型"
          prop="depositSubType"
          :rules="depositSubTypeRule"
          v-show="depositSubTypeCfg[form.depositType]"
        >
          <el-input
            v-if="!depositSubTypeCfg[form.depositType] || !depositSubTypeCfg[form.depositType].length"
            v-model="form.depositSubType"
            placeholder="请输入"
            clearable
          ></el-input>
          <el-select v-else v-model="form.depositSubType" placeholder="请选择" clearable>
            <el-option
              v-for="(op, j) in depositSubTypeCfg[form.depositType]"
              :key="'depositSubType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="投标起止时间"
          prop="tenderDate"
          v-show="form.depositType === 'customer_tender'"
          :rules="tenderDateRule"
        >
          <el-date-picker
            v-model="form.tenderDate"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="押金收付类型" prop="receipayType">
          <el-select v-model="form.receipayType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['depositReceipayType']"
              :key="'receipayType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <DetailDiv labelWidth="112" label="所属分公司：" :content="form.applyCompany || ''" />
        <DetailDiv labelWidth="112" label="申请人：" :content="form.applyName || ''" />
        <DetailDiv labelWidth="112" label="所属部门：" :content="form.applyDept  || ''" />

        <el-form-item label="币种" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择" @change="clearAccount(true)">
            <el-option
              v-for="(op, j) in dictMap['validCurrencyNR']"
              :key="'curreny' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amt">
          <el-input
            v-model="form.amt"
            placeholder="请输入"
            clearable
            v-lsNumber="{value:'number', obj:form, key:'amt'}"
          ></el-input>
        </el-form-item>
        <!-- :rules="refOrderRule" -->
        <el-form-item label="关联工作单号" prop="orderNo" v-show="refOrderRule.required">
          <el-input v-model="form.orderNo" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item
          label="对方账号"
          prop="rivalAccount"
          v-show="form.receipayType === 'pay'"
          :rules="accountRule"
        >
          <el-select
            size="mini"
            value-key="accountNo"
            v-model="form.rivalAccount"
            filterable
            remote
            clearable
            :noRemote="true"
            :remote-method="searchAccount"
            @visible-change="(val) => val && searchAccount('')"
            @change="accountChange"
          >
            <el-option
              v-for="(o,index) in rivalAccounts"
              :key="o.value+'_'+index"
              :label="o.value"
              :value="o"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="对方户名" prop="rivalAccountName" v-show="form.receipayType === 'pay'">
          <el-input v-model="form.rivalAccountName" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="对方开户行" prop="rivalBankName" v-show="form.receipayType === 'pay'">
          <el-input v-model="form.rivalBankName" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item class="full-form-item" style="width:100%;" label="备注" prop="applyRemark">
          <el-input
            v-model="form.applyRemark"
            placeholder="请输入"
            maxlength="500"
            type="textarea"
            :autosize="true"
          ></el-input>
        </el-form-item>
        <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
        <el-form-item
          v-if="isShowUpload"
          label="押金申请附件"
          prop="applyFileNo"
          class="invoice-payment-add-form-upload"
          style="width: 100%"
        >
          <el-input
            v-model="form.applyFileNo"
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
  </div>
</template>
<script>
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getDepositType, depositApply } from '@/api/fin/deposit'
export default {
  name: 'depositApply',
  mixins: [mixin, routerMixin],
  components: {
    FinanceUploadEmbed,
  },
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    let userInfo = this.$store.state.user.userInfo
    this.form.applyName = userInfo.userName
    this.form.applyCompany = userInfo.settleCompanyName
    this.form.applyDept = userInfo.deptName
    this.form.settleCorpName = this.form.settleCorpCode = ''
    this.form.applyFileName = this.form.applyFileNo = ''
    this.uploadShow = false
    this.$nextTick(() => {
      this.uploadShow = true
      this.$refs.form && this.$refs.form.resetFields()
    })
  },
  data() {
    return {
      searchQuery: '',
      form: {
        settleCorpName: '',
        settleCorpCode: '',
        settleCorpObj: '',
        depositType: '',
        depositSubType: '',
        tenderDate: '',
        receipayType: '',
        currency: '',
        amt: '',
        orderNo: '',
        rivalAccount: '',
        rivalBankName: '',
        rivalAccountNo: '',
        rivalAccountName: '',
        applyFileNo: '',
        applyFileName: '',
        applyRemark: '',
        applyName: '',
        applyCompany: '',
        applyDept: '',
      },
      rules: {
        settleCorpObj: [{ required: true, message: ' ', trigger: 'change' }],
        depositType: [{ required: true, message: ' ', trigger: 'change' }],
        receipayType: [{ required: true, message: ' ', trigger: 'change' }],
        currency: [{ required: true, message: ' ', trigger: 'change' }],
        amt: [{ required: true, message: ' ', trigger: 'change' }],
      },
      tenderDateRule: { required: true, message: ' ', trigger: 'change' },
      depositSubTypeRule: { required: true, message: ' ', trigger: 'change' },
      refOrderRule: { required: false, message: ' ', trigger: 'change' },
      accountRule: { required: true, message: ' ', trigger: 'change' },
      showUploadBtn: true,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      isShowUpload: true,
      uploadShow: true,
      settleCorps: [],
      rivalAccounts: [],
      warnShow: false,
      depositSubTypeCfg: {},
      refOrderCfg: {},
    }
  },
  watch: {
    'form.depositType': {
      handler(val) {
        this.form.depositSubType = ''
        this.tenderDateRule.required = val === 'customer_tender'
        this.depositSubTypeRule.required = !!this.depositSubTypeCfg[val] && !!this.depositSubTypeCfg[val].length
        this.refOrderRule.required = this.refOrderCfg[val] === 'yes'
      },
      deep: true,
    },
    'form.receipayType': {
      handler(val) {
        this.clearAccount(true)
        this.accountRule.required = val === 'pay'
      },
      deep: true,
    },
    'refOrderRule.required': {
      handler() {
        this.form.orderNo = ''
      },
      deep: true,
    },
  },
  created() {
    // dictMap['depositSubType']
    let depositSubType = this.dictMap['depositSubType']
    getDepositType({}).then((res) => {
      let data = res.data || {}
      for (const key in data) {
        const obj = data[key]
        let arr = obj.depositSubType.map((v) => depositSubType.find((sub) => sub.value === v)).filter((v) => v)
        this.depositSubTypeCfg[key] = key === 'others' ? true : arr.length ? arr : false
        this.refOrderCfg[key] = obj.refOrder
      }
    })
  },
  methods: {
    cancel() {
      this.routerBack()
    },
    submit() {
      this.$refs.form.validate((valid) => {
        // console.log(this.form)
        if (!valid) return

        this.form.tenderStartDate = this.form.tenderDate[0]
        this.form.tenderEndDate = this.form.tenderDate[1]
        this.lsLoading = true
        depositApply({ ...this.form, settleCorpObj: '' })
          .then((res) => {
            this.$msgSucClose('申请成功！')
            sessionStorage.setItem('_refreshPage', 'depositManageList')
            this.routerDelBack()
          })
          .finally(() => (this.lsLoading = false))
      })
    },
    sendResFileList(val) {
      this.form.applyFileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.form.applyFileName = val && val.length > 0 ? val[0].name : ''
    },
    searchSettle(queryString) {
      this.querySettleUnit({ queryString, unitTypes: 'customer,supplier' }).then((data) => {
        // console.log(data)
        this.settleCorps = (data || []).map((v) => ({
          ...v,
          unitTypes: v.settleUnitRelaionList
            .filter((s) => s.refType === 'customer' || s.refType === 'supplier')
            .map((s) => s.refType)
            .join(','),
        }))
        this.searchQuery = queryString || ''
        this.warnShow = queryString && !this.settleCorps.length
      })
    },
    settleChange(val) {
      if (val) {
        this.form.settleCorpName = val.value
        this.form.settleCorpCode = val.key
      } else {
        this.form.settleCorpName = this.form.settleCorpCode = ''
      }
      this.clearAccount(true)
    },
    searchAccount(queryString) {
      console.log(this.form.settleCorpCode, this.form.currency)
      if (!this.form.settleCorpCode || !this.form.currency) {
        return this.$msgErrClose('请先选择客户/供应商名称和币种！')
      }
      let query = {
        accountName: queryString,
        receipayType: 'receive',
        unitCode: this.form.settleCorpCode,
        currency: this.form.currency,
        status: 'effect',
      }
      this.$store.dispatch('dict/bankAccountList', query).then((data) => {
        if (!data.length) this.$msgErrClose('所选客户/供应商名称和币种下，无账号信息')
        this.rivalAccounts = data || []
      })
    },
    clearAccount(clearAccount) {
      if (clearAccount) {
        this.form.rivalAccount = ''
      }
      this.form.rivalBankName = this.form.rivalAccountNo = this.form.rivalAccountName = ''
    },
    accountChange(val) {
      console.log(val)
      if (val) {
        this.form.rivalBankName = val.bankName
        this.form.rivalAccountNo = val.accountNo
        this.form.rivalAccountName = val.accountName
      } else {
        this.clearAccount()
      }
    },
  },
}
</script>
<style scoped lang="scss">
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
  padding: 20px 12px;
  .el-form-item {
    // border: 1px solid red;
  }
  // .special_item ::v-deep .el-form-item__content > div {
  //   width: 50% !important;
  // }
  // .special_item2 {
  //   width: 115px !important;
  //   position: absolute;
  //   right: 0;
  // }
  .warn_msg {
    position: relative;
    left: -18px;
    top: -2px;
    color: red;
  }
  ::v-deep {
    .el-form-item.settleCorpType__tags {
      width: 40px !important;
      margin-right: 2px !important;
    }
    .full-form-item .el-form-item__content {
      width: calc(100% - 112px);
    }
    .detail__div {
      // border: 1px solid red;
      margin-right: 10px !important;
      margin-bottom: 10px !important;
      width: 342px !important;
    }
    .bizDate_form_item {
      .el-select .el-input.is-focus .el-input__inner,
      .el-select .el-input__inner:focus {
        border-color: #dcdfe6;
      }
      label {
        margin-left: 1px;
        margin-right: -1px;
        padding-right: 0 !important;
        input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right-color: white;
        }
      }
      .el-form-item__content > div {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    .el-form-item__content {
      width: 230px;
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