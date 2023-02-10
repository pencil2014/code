<template>
  <el-dialog
    :visible.sync="option.show"
    :title="option.type === 'add' ? '新增银行信息' : '编辑银行信息'"
    width="1000px"
  >
    <el-form
      :model="form"
      :rules="rules"
      size="mini"
      label-width="100px"
      :inline="true"
      class="account-form"
      ref="form"
    >
      <div class="sub-title" style="margin-top: 0;">账户归属信息</div>
      <el-form-item label="所属分公司" prop="companyName">
        <el-autocomplete
          v-model="form.companyName"
          placeholder="请选择"
          :fetch-suggestions="getCompnay"
          @select="changeCompany"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="结算分公司" prop="settleCompanyName">
        <el-input v-model="form.settleCompanyName" placeholder="" disabled></el-input>
      </el-form-item>
      <el-form-item label="账户区域" prop="countryOrgType">
        <el-select v-model="form.countryOrgType" placeholder="请选择" @change="changeCountry">
          <el-option
            v-for="item in dictMap['countryOrgType']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账户简称" prop="accountShortName">
        <el-input v-model="form.accountShortName" placeholder="请输入" maxlength="32"></el-input>
      </el-form-item>
      <el-form-item label="账户类型" prop="publicType">
        <el-select v-model="form.publicType" placeholder="请选择">
          <el-option
            v-for="item in dictMap['accountType']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否有效" prop="state">
        <el-select v-model="form.state" placeholder="请选择">
          <el-option label="是" value="valid"></el-option>
          <el-option label="否" value="invalid"></el-option>
        </el-select>
      </el-form-item>
      <div class="sub-title">账户中文信息</div>
      <el-form-item label="账户名称" prop="accountName">
        <el-input v-model="form.accountName" placeholder="请输入" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="开户行" prop="bankCode">
        <el-select
          v-model="form.bankCode"
          placeholder="请选择"
          filterable
          remote
          :noRemote="true"
          clearable
          :remote-method="getBankList"
          @change="changeBankCode"
          @visible-change="(v) => v && getBankList()"
        >
          <el-option
            v-for="(item, index) in bankList"
            :label="item.label"
            :value="item.value"
            :key="index+'_'+item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="支行名称" prop="bankBranch">
        <el-input v-model="form.bankBranch" placeholder="请输入" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="银行账号" prop="accountNo">
        <el-input v-model="form.accountNo" placeholder="请输入" maxlength="32"></el-input>
      </el-form-item>
      <el-form-item label="币种" prop="currency">
        <el-select v-model="form.currency" placeholder="请选择">
          <el-option
            v-for="item in dictMap['validCurrency']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="银行地址" prop="bankAddr">
        <el-input v-model="form.bankAddr" placeholder="请输入" maxlength="160"></el-input>
      </el-form-item>
      <div class="sub-title">账户英文信息</div>
      <el-form-item label="Account Name" prop="accountEname">
        <el-input v-model="form.accountEname" placeholder="请输入" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="Bank Name" prop="bankEname">
        <el-input v-model="form.bankEname" placeholder="请输入" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="Bank Code" prop="bankCodeReal">
        <el-input v-model="form.bankCodeReal" placeholder="请输入" maxlength="32"></el-input>
      </el-form-item>
      <el-form-item label="SWIFT Code" prop="swiftCode">
        <el-input v-model="form.swiftCode" placeholder="请输入" maxlength="32"></el-input>
      </el-form-item>
      <el-form-item label="Branch" prop="bankBranchEname">
        <el-input v-model="form.bankBranchEname" placeholder="请输入" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="Branch Code" prop="bankBranchCode">
        <el-input v-model="form.bankBranchCode" placeholder="请输入" maxlength="32"></el-input>
      </el-form-item>
      <el-form-item label="Branch Address" prop="bankEaddr">
        <el-input v-model="form.bankEaddr" placeholder="请输入" maxlength="160"></el-input>
      </el-form-item>
      <div class="sub-title">账户财务信息</div>
      <el-form-item label="科目代码" prop="subjectCode">
        <el-input v-model="form.subjectCode" placeholder="请输入" maxlength="32">
					<template slot="prepend">{{ form['subjectCode_prepend'] || ''}}</template>
        </el-input>
      </el-form-item>
      <el-form-item label="是否支持开票" prop="isInvoiceBankAcct">
        <el-select v-model="form.isInvoiceBankAcct" placeholder="请选择" class="small-select" @change="changeIsInvoiceBankAcct">
          <el-option
            v-for="item in dictMap['yesNo']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
        <el-checkbox label="默认首选"  v-model="form.isDefault"  true-label="yes" false-label="no" :disabled="form.isInvoiceBankAcct === 'no'"></el-checkbox>
      </el-form-item>
      <el-form-item label="收付类型" prop="receipayType">
        <el-select v-model="form.receipayType" placeholder="请选择">
          <el-option
            v-for="item in dictMap['feeitemReceipayGroup']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="共享公司" prop="companyBankRelationCodes"> -->
      <el-form-item label="共享公司部门" prop="companyBankRelationCodes">
          <!-- filterable -->
        <el-cascader
          :clearable="true"
          size="mini"
          :options="departmentList"
          v-model="form.companyBankRelationCodes"
          :collapse-tags="true"
          @change="(value) => cascaderChange(value)"
          :props="{
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              multiple: true,
            }"
          placeholder="请选择"
        >
          <!-- <template slot-scope="{ node, data }">
            <span>{{ data.deptCname }}</span>
            <span v-if="!node.isLeaf"> ({{ data.childList.length }}) </span>
          </template> -->
        </el-cascader>
        <!-- <el-select
          v-model="form.companyBankRelationCodes"
          placeholder="请选择"
          filterable
          remote
          multiple
          clearable
          :remote-method="getCompnay"
        >
          <el-option
            v-for="(item, index) in companyList"
            :label="item.label"
            :value="item.value"
            :key="index"
          ></el-option>
        </el-select> -->
      </el-form-item>
      <el-form-item label="是否账单禁用" prop="hasBillForbidden">
        <el-select v-model="form.hasBillForbidden" placeholder="请选择"  class="small-select" @change="changeHasBillForbidden">
          <el-option
            v-for="item in dictMap['yesNo']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
        <el-checkbox label="默认账号" v-model="form.hasDefault" true-label="yes" false-label="no" :disabled="form.hasBillForbidden === 'yes'"></el-checkbox>
      </el-form-item>
      <!-- <el-form-item label="内部往来" prop="hasIntrabranch">
        <el-select v-model="form.hasIntrabranch" placeholder="请选择" @change="changeHasIntrabranch">
          <el-option
            v-for="item in dictMap['yesNo']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item> -->
      <!-- <el-form-item label="是否支持支票" prop="hasChequeAcct">
        <el-select v-model="form.hasChequeAcct" placeholder="请选择">
          <el-option
            v-for="item in dictMap['yesNo']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="账户结算方式" prop="settleMode">
        <el-select v-model="form.settleMode" placeholder="请选择" multiple>
          <el-option
            v-for="item in dictMap['bankAccountSettleMode']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="submit">确定</el-button>
			<el-button @click="cancel" size="mini">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import baseData from '@/api/baseData'
import { bankList } from '@/api/base'
import { mapGetters } from 'vuex'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        companyName: '',
        companyCode: '',
        settleCompanyName: '',
        settleCompanyCode: '',
        countryOrgType: '',
        accountShortName: '',
        currency: '',
        accountName: '',
        accountEname: '',
        bankCode: '',
        bankName: '',
        bankCodeReal: '',
        bankEname: '',
        bankBranch: '',
        bankBranchCode: '',
        bankBranchEname: '',
        accountNo: '',
        swiftCode: '',
        bankAddr: '',
        bankEaddr: '',
        receipayType: '',
        subjectCode: '',
        isInvoiceBankAcct: '',
        isDefault: 'no',
        state: '',
        companyBankRelationCodes: [],
        // hasIntrabranch: '',
        hasDefault: 'no',
        // hasChequeAcct: '',
        settleMode: [],
        hasBillForbidden: 'no',
      },
      rules: {
        publicType: { required: true, message: ' ', trigger: 'change' }, // 20220826添加必填 收款登记会使用，没填不能开票
        companyName: { required: true, message: ' ', trigger: 'change' },
        countryOrgType: { required: true, message: ' ', trigger: 'change' },
        accountShortName: { required: true, message: ' ', trigger: 'change' },
        currency: { required: true, message: ' ', trigger: 'change' },
        accountName: { required: true, message: ' ', trigger: 'change' },
        bankCode: { required: true, message: ' ', trigger: 'change' },
        bankBranch: { required: true, message: ' ', trigger: 'change' },
        bankBranchCode: { required: false, message: ' ', trigger: 'change' },
        accountNo: { required: true, message: ' ', trigger: 'change' },
        receipayType: { required: true, message: ' ', trigger: 'change' },
        subjectCode: { required: true, message: ' ', trigger: 'change' },
        isInvoiceBankAcct: { required: true, message: ' ', trigger: 'change' },
        state: { required: true, message: ' ', trigger: 'change' },
        // companyBankRelationCodes: { required: true, message: ' ', trigger: 'change' },
        // hasIntrabranch: { required: true, message: ' ', trigger: 'change' },
        // hasChequeAcct: { required: true, message: ' ', trigger: 'change' },
        settleMode: { required: true, message: ' ', trigger: 'change' },
        hasBillForbidden: { required: true, message: ' ', trigger: 'change' },
      },
      bankList: [],
      companyList: [],
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    departmentList(){
      return this.option.departmentList || []
    }
  },
  created () {
    // setTimeout(() => {
    //   this.form.companyBankRelationCodes.push(['000'])
    //   this.form.companyBankRelationCodes.push(['000', '000001'])
    // }, 1000);
    if (this.option.type === 'edit') {
      // this.form = Object.assign({},this.form, this.option.form)
      this.bankList = [{
        en:this.option.form.bankEname,
        bankCode:this.option.form.bankCode,
        label:this.option.form.bankName,
        bankName:this.option.form.bankName,
        value: this.option.form.bankCode,
      }]
      this.$nextTick(() => {
        this.form = Object.assign({},this.form, this.option.form)
        console.log(this.form);
        console.log(this.bankList);
      })
    }
  },
  methods: {
    cascaderChange(val){
      console.log(val);
    },
    changeCountry (val) {
       if (val === 'hk_china' || val === 'abroad') {
        this.rules.bankBranchCode.required = true
       } else {
        this.rules.bankBranchCode.required = false
       }
    },
    changeCompany (val) {
      let {label, settleCompanyCode, settleCompanyFullName} = val
      this.form.companyCode = label
      this.form.settleCompanyCode = settleCompanyCode
      this.form.settleCompanyName = settleCompanyFullName
    },
    changeBankCode (val) {
      let find = this.bankList.find(({ bankCode }) => bankCode === val)
      let { en, bankCode, label } = find
      this.form.subjectCode_prepend = val === 'KHHNBWL' ? '1143' : '1111'
      this.form.bankEname = en
      this.form.bankCode = bankCode
      this.form.bankName = label
    },
    changeHasBillForbidden (val) {
      if (val === 'yes') {
        this.form.hasDefault = 'no'
      }
    },
    // changeHasIntrabranch (val) {
    //   this.form.subjectCode_prepend = val === 'yes' ? '1143' : '1111'
    // },
    changeIsInvoiceBankAcct (val) {
      if (val === 'no') {
        this.form.isDefault = 'no'
      }
    },
    getCompnay(str = '', cb) {
      let data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          { column: 'companyName', type: 'eq', value: str },
          { column: 'state', type: 'eq', value: 'valid' },
        ],
      }
      baseData.COMPANY.pageList(data)
        .then((res) => {
          if (!cb) {
            let result = res.data.list.map((item) => {
            return {
              ...item,
              value: item.companyCode,
              label: item.companyName,
            }
          })
            this.companyList.splice(0, 200, ...result)
          } else {
            let result = res.data.list.map((item) => {
            return {
              ...item,
              value: item.companyName,
              label: item.companyCode,
            }
          })
            cb(result)
          }
        })
        .catch(() => {})
    },
    getBankList(str = '') {
      console.log('```````````12');
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [{ column: 'cname', type: 'like', value: str },{ column: 'enable', type: 'eq', value: 'yes' }],
      }
      bankList(data).then((res) => {
        let result = res.data.list.map((item) => {
          return { ...item, value: item.bankCode, label: item.cname, en: item.ename }
        })
        this.bankList.splice(0, 100, ...result)
        // 已修改开户行名称的数据，下拉数据时自动更新为新数据
        let formBankcode = this.form.bankCode
        let find = this.bankList.find(({ bankCode }) => bankCode === formBankcode)
        if(find && find.bankName !== this.form.bankName){
          this.form.bankCode = ''
          this.$nextTick(() => this.changeBankCode(formBankcode))
        }
      })
    },
    cancel () {
      this.$emit('cancel')
    },
    submit () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let list = JSON.parse(JSON.stringify(this.form.companyBankRelationCodes || []))
          list.forEach(item => {
            if(item && item.length){
              let curLen = item.length
              let lastStr = item[curLen - 1]
              list.forEach(v => {
                if(v && v.length && curLen < v.length){
                  if(v.find(str => str === lastStr)){
                    v.splice(0, 100)
                  }
                }
              })
            }
          })
          this.$emit('submit', {...this.form, companyBankRelationCodes: list.filter(v => v.length)})
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.el-form{
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
 
  
  .sub-title{
    width: 100%;
    font-weight: bold;
    margin: 10px 0 10px 0;
    color: #000;
  }
  .el-form-item {
    width: 33.3%;
    margin-right: 0;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    /deep/ .el-input-group__prepend{
      min-width: 40px;
    }
    /deep/.el-form-item__content{
      flex: 1;
      .el-input__inner,.el-autocomplete,.el-select,.el-cascader{
        width: 100%;
      }
      .small-select{
        width: 118px;
        margin-right: 10px;
      }
      .el-cascader__tags > span {
        max-width: 196px;
      }
      .el-cascader__search-input{
        margin-top: 4px !important;
        line-height: 16px !important;
        height: 16px !important;
      }
    }
  }
}
</style>

<style>
.app-wrapper .finance-page .account-form .el-form-item__label {
  height: auto !important;
}
</style>