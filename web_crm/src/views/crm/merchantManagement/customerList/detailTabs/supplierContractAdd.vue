<template>
  <div class="contract-add">
    <div class="top-box">
      <div class="title">新增合同信息</div>
      <div class="but-box">
        <el-button-group>
          <el-button @click="submit" size="mini" type="primary">保存</el-button>
        </el-button-group>
        <el-button-group>
          <el-button @click="cancle" size="mini">返回</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="add-form">
      <el-form
        :inline="true"
        :model="form"
        :rules="rules"
        class="settle-form"
        label-width="100px"
        ref="form"
        size="mini"
      >
        <el-form-item label="合同类型:" prop="contractType">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.contractType"
            @change="changeContractType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['supplierContractTypes']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="合同编号:"
          prop="contractNo"
        >
          <el-select
            @change="getSupContractNos"
            class="contract-select"
            placeholder="请选择"
            size="mini"
            v-model="form.contractNoPrefix"
            :disabled="disabledPrefix"
            v-if="form.contractType ==='inner_audit'"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value==='GYS' && form.contractType !=='inner_audit'"
              v-for="item in contractNoPrefix"
            ></el-option>
          </el-select>
          <!-- 短编号 -->
           <el-input 
            v-if="form.contractType ==='inner_audit'"
            placeholder="请输入"
            size="mini"
            :disabled="disabledPrefix"
            v-model="form.contractNo"
            class="contract-input"
            :maxlength="32"
          ></el-input>
            <!-- 长编号 -->
          <el-input
            v-else
            class="default-input"
            placeholder="请输入"
            size="mini"
            v-model="form.contractNo"
            :maxlength="32"
          ></el-input>
        </el-form-item>
        <el-form-item label="业务类型:" prop="businessTypes">
          <el-select
            collapse-tags
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.businessTypes"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in businessTypeOptions"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否交押金:" prop="isPayDeposit">
          <el-select
            v-model="form.isPayDeposit"
            placeholder="请选择"
            class="contract-select"
            style="width: 30%"
          >
            <el-option
              v-for="item in dictMap['yesNo']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-input
            :controls="false"
            :min="0"
            class="contract-input"
            placeholder="请输入金额"
            size="mini"
            v-model="form.depositAmount"
            v-if="form.isPayDeposit === 'yes'"
            style="width: 40%"
            :maxlength="10"
          ></el-input>
          <el-select
            v-model="form.depositCurrency"
            placeholder="请选择币种"
            v-if="form.isPayDeposit === 'yes'"
            style="width: 30%"
          >
            <el-option
              v-for="item in currencyList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合同签署类型:" prop="contractSignType">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.contractSignType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['supplierContractSignType']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="签订人:" prop="signEmployeeId">
          <el-select
            v-model="form.signEmployeeId"
            value-key="employeeId"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="
              (str) => {
                getBaseEmployeeList(str)
              }
            "
          >
            <el-option
              v-for="(item, index) in signEmployeeList"
              :key="item.employeeNo + index"
              :label="`${item.cname}_${item.employeeId}_${
                item.deptCname || '未知'
              }`"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="我司分公司:" prop="companies">
          <el-select
            @change="changeSettleCompanyList"
            class="custlist"
            collapse-tags
            filterable
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.companies"
          >
            <el-option
              :disabled="item.disabled"
              :key="item.companyCode"
              :label="item.companyName"
              :value="item.companyCode"
              v-for="item in settleCompanyList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=" 结算周期:" prop="settleCycle">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.settleCycle"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['supplierContractSettleCycle']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="信用额度-USD:" prop="creditAmountUsd">
          <el-input
            :controls="false"
            :min="0"
            v-model="form.creditAmountUsd"
            placeholder="请输入额度"
            class="default-input"
            :maxlength="8"
          ></el-input>
        </el-form-item>
        <el-form-item label="信用额度-CNY:" prop="creditAmountCny">
          <el-input
            :controls="false"
            :min="0"
            v-model="form.creditAmountCny"
            placeholder="请输入额度"
            class="default-input"
            :maxlength="8"
          ></el-input>
        </el-form-item>
        <el-form-item
          :prop="form.isEffectDate ? 'effectBeginDate' : 'effectDate'"
          label="有效期:"
          class="large-item"
        >
          <el-date-picker
            class="contract-date"
            clearable
            placeholder="请选择"
            size="mini"
            type="daterange"
            v-model="form.effectDate"
            v-show="!form.isEffectDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <el-date-picker
            class="contract-date"
            placeholder="请选择开始时间"
            type="date"
            v-model="form.effectBeginDate"
            v-show="form.isEffectDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <el-checkbox
            label="长期有效"
            style="margin-left: 5px"
            v-model="form.isEffectDate"
          ></el-checkbox>
        </el-form-item>
        <el-form-item class="flex-item" label="上传合同:" :required="isSup">
          <div class="file-upload">
            <el-upload
              :auto-upload="true"
              :before-upload="getFile"
              :file-list="fileList"
              :http-request="handleImport"
              :limit="5"
              :multiple="true"
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              action="#"
              class
              drag
              ref="upload"
            >
              <div class="file-box">
                <div class="icon">
                  <img
                    :src="require('@/assets/icon-upload.png')"
                    class="icon-img"
                  />
                </div>
                <div class="tips">
                  <div class="txt-title">点击或将文件拖拽到这里导入</div>
                  <p class="txt-desc">
                    支持
                    doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar
                    格式文件， 且文件大小限制在100M内
                  </p>
                </div>
              </div>
            </el-upload>
            <el-progress
              :percentage="processLength"
              :stroke-width="2"
              v-show="showProcess"
            ></el-progress>
          </div>
        </el-form-item>
        <el-form-item class="flex-item" label="备注:" prop="remark">
          <el-input
            class="contract-textarea"
            maxlength="512"
            placeholder="请输入"
            show-word-limit
            type="textarea"
            v-model="form.remark"
            autosize
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { baseEmployeeList, companyPageList } from '@/api/base'
import { supContractDetail } from '@/api/crm/contract'
import { getSupContractNos } from '@/api/crm/control'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass
  },
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    custid: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      isSup:false,
      form: {
        supplierId: '',
        contractId: '',
        contractNo: '',
        businessTypes: [],
        companies: ['000000'],
        isEffectDate: false,
        effectDate: [],
        effectBeginDate: '',
        effectEndDate: '',
        remark: '',
        isPayDeposit: 'yes',
        signEmployeeId: '',
        signEmployeeName: '',
        creditAmountUsd: '',
        creditAmountCny: '',
        depositAmount: '',
        depositCurrency: 'USD',
        disabledPrefix:false,
        contractNoPrefix:[{value:'GYS',label:'GYS'}],
      },
      rules: {
        contractNo: {
          required: true,
          message: '合同编号必填',
          trigger: 'change'
        },
        businessTypes: {
          required: true,
          message: '业务类型必选',
          trigger: 'change'
        },
        companies: {
          required: true,
          message: '我司分公司必选',
          trigger: 'change'
        },
        settleCycle: {
          required: true,
          message: '结算周期必选',
          trigger: 'change'
        },
        isPayDeposit: {
          required: true,
          message: '是否交押金必填',
          trigger: 'change'
        },
        depositAmount: {
          required: true,
          message: '押金金额必填',
          trigger: 'change'
        },
        signEmployeeId: {
          required: true,
          message: '签订人必选',
          trigger: 'change'
        },
        companies: {
          required: true,
          message: '我司分公司必选',
          trigger: 'change'
        },
        effectDate: {
          required: true,
          message: '有效期必填',
          trigger: 'change'
        },
        effectBeginDate: {
          required: true,
          message: '有效期开始时间必填',
          trigger: 'change'
        }
      },
      signEmployeeList: [],
      businessTypeOptions: [],
      settleCompanyList: [],
      defaultFileSize: 100,
      sizeLimit: true,
      file: '',
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0,
      isSignOptions: [
        {
          label: '已签署',
          value: 'yes'
        },
        {
          label: '未签署',
          value: 'no'
        }
      ],
      currencyList: [
        {
          label: 'USD',
          value: 'USD'
        },
        {
          label: 'CNY',
          value: 'CNY'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  created() {
    this.getBusinessType()
    this.getCompanyList()
  },
  watch: {
    "form.contractType"(val) {
        if(val==='inner_audit'){
          this.rules.signEmployeeId.required = false
          this.isSup = false
        }else{
          this.rules.signEmployeeId.required = true
          this.isSup = true
        }
      }
  },
  methods: {
    // 修改合同类型
    changeContractType (val) {
      if (val === 'inner_audit') {
        this.disabledPrefix = true
        this.form.contractNoPrefix = 'GYS'
        this.getSupContractNos('GYS')
      } else {
        this.disabledPrefix = false
        this.form.contractNoPrefix = ' '
        this.form.contractNo = ' '
      }
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 100,
        query: [
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          },
          {
            column: 'selfSettle',
            type: 'eq',
            value: 'yes'
          }
        ]
      }
      companyPageList(data).then((res) => {
        this.settleCompanyList = res.data.list.map((item) =>
          Object.assign({}, item, { disabled: false })
        )
        this.settleCompanyList.unshift({
          companyCode: '000000',
          companyName: '所有分公司',
          companyId: 0,
          disabled: false
        })
        // 默认禁用
        if (this.form.companies.includes('000000')) {
          this.form.companies = ['000000']
          this.settleCompanyList.forEach((item) => {
            if (item.companyCode !== '000000') {
              item.disabled = true
            }
          })
        }
      })
    },
        // 修改合同编号前缀
    getSupContractNos(val) {
      const data = {
        contractNoPrefix: val
      }
      getSupContractNos(data)
        .then((res) => {
          if (res.code === 0) {
            this.form.contractNo = res.data
          }
        })
        .catch(() => {})
    },
    // 改变我司分公司
    changeSettleCompanyList(val) {
      if (val.includes('000000')) {
        this.form.companies = ['000000']
        this.settleCompanyList.forEach((item) => {
          if (item.companyCode !== '000000') {
            item.disabled = true
          }
        })
      } else {
        this.settleCompanyList.forEach((item) => {
          item.disabled = false
        })
      }
    },
    // 签订人
    getBaseEmployeeList(str = '') {
      const data = {
        columns: [],
        currPage: 1,
        pageSize: 100,
        query: [{ column: 'name', type: 'eq', value: str }]
      }
      baseEmployeeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.signEmployeeList = res.data.list || []
            if (typeof this.form.signEmployeeId === 'number' ) {
              let source = this.signEmployeeList.find(item => item.employeeId === this.form.signEmployeeId)
              if (source) {
                this.form.signEmployeeId = source
              }
            }
          }
        })
        .catch(() => {})
    },
    // 返回
    cancle() {
      this.$emit('cancle')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const {
            isPayDeposit,
            depositAmount,
            creditAmountUsd,
            creditAmountCny,
            isEffectDate,
            effectBeginDate
          } = this.form
          const reg = /^([1-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}|0$/
          if (isPayDeposit === 'yes' && !depositAmount) {
            return this.$msgErrClose('押金金额必填')
          }
          if (isPayDeposit === 'yes' && !reg.test(depositAmount)) {
            return this.$msgErrClose('押金金额只支持整数或者两位小数')
          }
          if (isEffectDate && !effectBeginDate) {
            return this.$msgErrClose('有效期开始时间必填')
          }
          if (creditAmountUsd && !reg.test(creditAmountUsd)) {
            return this.$msgErrClose('信用额度-USD只支持整数或者两位小数')
          }
          if (creditAmountCny && !reg.test(creditAmountCny)) {
            return this.$msgErrClose('信用额度-CNY只支持整数或者两位小数')
          }
          if (this.form.contractType==='supplier'&& !this.fileListUpload.length) {
            return this.$msgErrClose('合同附件必传')
          }
          this.submitFn()
        }else {
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 组装数据
    submitFn() {
      const {
        isPayDeposit,
        isEffectDate,
        effectDate,
        signEmployeeId,
        companies,
        contractNo,
        contractNoPrefix
      } = this.form
      const data = Object.assign({}, this.form)
      if (isPayDeposit !== 'yes') {
        data.depositAmount = ''
        data.depositCurrency = ''
      }
      if (isEffectDate) {
        data.effectEndDate = '9999-12-31'
      } else {
        data.effectBeginDate = effectDate[0]
        data.effectEndDate = effectDate[1]
      }
      data.contractNo = contractNoPrefix + contractNo
      const { cname, employeeId } = signEmployeeId
      data.signEmployeeId = employeeId
      data.signEmployeeName = cname
      data.companies = companies.map((item) => {
        const source = this.settleCompanyList.find(
          (ele) => ele.companyCode === item
        )
        const { companyId, companyName, companyCode } = source
        return {
          companyId,
          companyName,
          companyCode
        }
      })
      data.files = this.fileListUpload
      this.$emit('submit', data)
    },
    // 超出限制
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择上传5个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      const sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$msgErrClose('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    // 删除上传文件
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.fileListUpload = this.fileListUpload.filter((item) => {
        if (file.fileNo) {
          return item.fileNo !== file.fileNo
        } else {
          return item.uid !== file.uid
        }
      })
    },
    // 上传文件
    handleImport() {
      this.handleProgress()
      const form = new FormData()
      form.append('file', this.file)
      const uid = this.file.uid
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        })
        .then((res) => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            this.$msgSucClose('上传成功!')
            const { name } = res.data.data
            this.fileListUpload.push(
              Object.assign({}, res.data.data, { uid, fileName: name })
            )
          }
        })
    },
    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength = 0
      this.showProcess = true
      const interval = setInterval(() => {
        if (this.processLength >= 99) {
          clearInterval(interval)
          return
        }
        this.processLength += 1
      }, 200)
    },
    // 业务类型下拉
    getBusinessType() {
      this.businessTypeOptions = this.dictMap['baseBusinessType'] || []
      // 默认全部勾选
      if (!this.form.businessTypes.length) {
        this.form.businessTypes = this.businessTypeOptions.map(
          (item) => item.value
        )
      }
    },
    // 获取合同详情
    getContractDetail(contractId) {
      const data = {
        contractId
      }
      supContractDetail(data)
        .then((res) => {
          if (res.code === 0) {
            const { effectBeginDate, effectEndDate, companies, depositCurrency,contractSignType,contractType} = res.data
            const isEffectDate = effectEndDate === '9999-12-31'
            let effectDate = []
            if (!isEffectDate) {
              effectDate = [effectBeginDate, effectEndDate]
            }
            this.getBaseEmployeeList(res.data.signEmployeeName)
            let companiesCode = companies.map(item => item.companyCode)
            this.form = Object.assign({}, this.form, res.data, {
              isEffectDate,
              effectDate,
              companies: companiesCode.length ? companiesCode : ['000000'],
              contractCode: '',
              contractNo: '',
              contractId: '',
              contractSignType:contractSignType[0],
              depositCurrency: depositCurrency ? depositCurrency : 'USD',
              files: []
            })
            // 请求新的合同编号
            this.changeContractType(contractType)
            delete this.form.status
            // 上传文件
            this.fileList = []
            this.fileListUpload = []
          }
        })
        .catch(() => {})
    }
  },
  mounted() {
    // 复制合同信息 获取客户合同信息详情
    if (this.dataSource.contractId) {
      this.getContractDetail(this.dataSource.contractId)
    }
  }
}
</script>

<style lang="scss" scoped>
.top-box,
.title-box {
  display: flex;
  margin: 15px 8px;
  .title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    // &::before {
    //   content: '*';
    //   color: #ff4949;
    //   margin-right: 4px;
    //   font-weight: normal;
    // }
  }
}
.add-form {
  .settle-form {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    /deep/ .el-form-item {
      width: 25%;
      margin-bottom: 20px;
      margin-right: 0;
      display: flex;
      align-items: center;
      &.large-item {
        width: 75%;
      }
      .el-form-item__content {
        width: 70%;
      }
      .el-select {
        width: 100%;
      }
      .contract-select {
        width: 30%;
      }
      .contract-input {
        width: 70%;
      }
      .contract-date {
        width: 33%;
      }
      .default-input {
        width: 100%;
      }
    }
    /deep/ .custlist .el-select__tags {
      display: flex;
      align-items: center;
      span {
        span:first-child {
          display: flex;
          align-items: center;
          .el-select__tags-text {
            display: inline-block;
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          i {
            top: 2px;
          }
        }
      }
    }
    .flex-item {
      width: 100%;
      /deep/ .file-upload {
        width: 100%;
        background-color: #fff;
        padding: 0;
        .el-form-item__content {
          width: 100%;
        }
        .el-upload-dragger {
          font-size: 12px;
          padding: 2px 10px;
          .file-box {
            display: flex;
            align-items: center;
            text-align: left;
            .icon {
              margin-right: 10px;
              align-items: center;
              display: flex;
            }
          }
          .txt-title {
            color: #222222;
            margin: 4px 0;
          }
          .txt-desc {
            color: #bfbfbf;
          }
        }
      }
      /deep/ .el-textarea__inner {
        width: 100%;
        height: 40px;
        font-size: 12px;
      }
    }
  }
}
.credit-box {
  width: 100%;
  display: flex;
  .flex-cnt {
    width: 100%;
  }
  .flex-icon {
    i {
      font-size: 20px;
      cursor: pointer;
      color: #999;
      &:hover {
        color: #1890ff;
      }
      margin-left: 10px;
    }
  }
}
.require-label {
  /deep/ .el-form-item__label::before {
    content: '*';
    color: #ff4949;
    margin-right: 4px;
  }
}
</style>
