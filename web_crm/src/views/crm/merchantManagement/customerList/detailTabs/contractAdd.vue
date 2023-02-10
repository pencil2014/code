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
              v-for="item in dictMap['customerContractType']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="合同编号:"
          prop="contractNoPrefix"
        >
          <el-select
            @change="changeContractNoPrefix"
            class="contract-select"
            placeholder="请选择"
            size="mini"
            v-model="form.contractNoPrefix"
            :disabled="disabledPrefix"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value==='NBSP' && form.contractType !=='inner_audit'"
              v-for="item in dictMap['contractNoPrefix']"
            ></el-option>
          </el-select>
          <el-input
            class="contract-input"
            placeholder="请输入数字"
            size="mini"
            v-model="form.contractNoSuffix"
          ></el-input>
        </el-form-item>
        <el-form-item label="业务类型:" prop="settleBusinessTypeList">
          <el-select
            collapse-tags
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.settleBusinessTypeList"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in businessTypeOptions"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="共享公司:" prop="contractRelCustList" class="relcust">
           <el-select
              class="custlist"
              collapse-tags
              multiple
              placeholder="请选择共享公司"
              size="mini"
              v-model="form.contractRelCustList"
              value-key="custid"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item"
                v-for="item in relationList"
                :disabled="item.custid === custid"
              ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="我司分公司:" prop="settleCompanyList">
          <el-select
            @change="changeSettleCompanyList"
            class="custlist"
            collapse-tags
            filterable
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.settleCompanyList"
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
        <el-form-item label="归属人:" prop="belongEmployeeName">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.belongEmployeeName"
          >
            <el-option
              :key="item.bdEmployeeId + '1'"
              :label="item.bdEmployeeName"
              :value="item.bdEmployeeName"
              v-for="item in OPEmployeeList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :prop="form.isEffectDate ? 'effectStartDate' : 'effectDate'"
          label="有效期:"
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
            v-model="form.effectStartDate"
            v-show="form.isEffectDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <el-checkbox
            label="长期有效"
            style="margin-left: 5px"
            v-model="form.isEffectDate"
          ></el-checkbox>
        </el-form-item>
        <el-form-item class="flex-item" label="上传合同:">
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
              :on-preview="handlePreview"
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
            maxlength="500"
            placeholder="请输入"
            show-word-limit
            type="textarea"
            v-model="form.remark"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import AddLine from './addLine'
import ContractSettlement from './contractSettlement.vue'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {
  companyPageList
} from '@/api/base'
import {
  relation,
  generateContractNo,
  contractDetail
} from '@/api/crm/control'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    ContractSettlement,
    AddLine
  },
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    custid: {
      type: [String, Number],
      default: ''
    },
    OPEmployeeList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      option1: {},
      custName: '',
      form: {
        contractType: '',
        contractNoPrefix: '',
        contractNoSuffix: '',
        settleBusinessTypeList: [],
        settleCompanyList: ['000000'],
        contractRelCustList: [],
        isEffectDate: false,
        effectDate: [],
        effectStartDate: '',
        effectEndDate: '',
        remark: '',
        belongEmployeeName:''
      },
      rules: {
        contractType: {
          required: true,
          message: '合同类型必选',
          trigger: 'change'
        },
        contractNoPrefix: {
          required: true,
          message: '合同编号必填',
          trigger: 'change'
        },
        settleBusinessTypeList: {
          required: true,
          message: '业务类型必选',
          trigger: 'change'
        },
        settleCompanyList: {
          required: true,
          message: '我司分公司必选',
          trigger: 'change'
        },
        contractRelCustList: {
          required: true,
          message: '共享公司必选',
          trigger: 'change'
        },
        effectDate: {
          required: true,
          message: '有效期必填',
          trigger: 'change'
        },
        effectStartDate: {
          required: true,
          message: '有效期开始时间必填',
          trigger: 'change'
        },
        belongEmployeeName: {
          required: true,
          message: '归属人必填',
          trigger: 'change'
        }
      },
      businessTypeOptions: [],
      settleCompanyList: [],
      defaultFileSize: 100,
      sizeLimit: true,
      file: '',
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0,
      relationList: [],
      disabledPrefix: false
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  created() {
    this.custName = this.$route.query.name
    this.getBusinessType()
    this.getCompanyList()
    this.getRelation()
  },
  methods: {
    // 修改合同类型
    changeContractType (val) {
      if (val === 'inner_audit') {
        this.disabledPrefix = true
        this.form.contractNoPrefix = 'NBSP'
        this.changeContractNoPrefix('NBSP')
      } else {
        this.disabledPrefix = false
        this.form.contractNoPrefix = ' '
        this.form.contractNoSuffix = ' '
      }
    },
    // 预览图片
    handlePreview(file) {
      const { uid } = file
      const source = this.fileListUpload.find((item) => item.uid === uid)
      const fileNo = source?.fileNo
      if (fileNo) {
        let fileName = source.name || 'preview'
        fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
        officePreview({ fileNo, name:fileName })
      }
    },
    // 返回
    cancle() {
      this.$emit('cancle')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { contractNoPrefix, contractNoSuffix } = this.form
          const reg = /^\d+$/
          if (!reg.test(contractNoSuffix) || !contractNoPrefix) {
            return this.$msgErrClose('合同编号须填写数字')
          }
          if (this.form.isEffectDate && !this.form.effectStartDate) {
            return this.$msgErrClose('有效期开始时间必填')
          }
          this.submitFn()
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 组装数据
    submitFn() {
      let {
        contractType,
        contractNoSuffix,
        contractNoPrefix,
        effectStartDate,
        effectEndDate,
        effectDate,
        isEffectDate,
        remark,
        settleBusinessTypeList,
        settleCompanyList,
        contractRelCustList,
        belongEmployeeName
      } = this.form
      if (isEffectDate) {
        effectEndDate = '9999-12-31'
      } else {
        effectStartDate = effectDate[0]
        effectEndDate = effectDate[1]
      }
      const contractBusinessTypeList = settleBusinessTypeList.map((item) => {
        return {
          businessType: item,
          custid: this.custid
        }
      })
      const contractFileList = this.fileListUpload.map((item) => {
        const { fileNo, name: fileName } = item
        return {
          fileNo,
          fileName
        }
      })
      const contractCompanyList = settleCompanyList.map((item) => {
        const source = this.settleCompanyList.filter(
          (ele) => ele.companyCode === item
        )[0]
        const { companyCode, companyName, companyId } = source
        return {
          companyCode,
          companyName,
          companyId
        }
      })
      const contractRelCustListMap = contractRelCustList.map(item => {
        return {
          custid: this.custid,
          custName: this.custName,
          relCustid: item.custid,
          relCustName: item.name
        }
      })
      const contractNo = contractNoPrefix + contractNoSuffix
      let bdEmployee = this.OPEmployeeList.find(item=>item.bdEmployeeName===belongEmployeeName)
      const data = {
        custid: this.custid,
        contractType,
        contractNo,
        contractNoSuffix,
        contractNoPrefix,
        effectStartDate,
        effectEndDate,
        remark,
        contractBusinessTypeList,
        contractFileList,
        contractCompanyList,
        contractRelCustList:contractRelCustListMap,
        belongEmployeeName,
        belongEmployeeId:bdEmployee.bdEmployeeId,
        belongDeptCode:bdEmployee.bdDeptCode
      }
      this.$emit('submit', data)
    },
    // 修改合同编号前缀
    changeContractNoPrefix(val) {
      const data = {
        contractNoPrefix: val
      }
      generateContractNo(data)
        .then((res) => {
          if (res.code === 0) {
            this.form.contractNoSuffix = res.data
          }
        })
        .catch(() => {})
    },
    // 改变我司分公司
    changeSettleCompanyList(val) {
      if (val.includes('000000')) {
        this.form.settleCompanyList = ['000000']
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
            this.fileListUpload.push(Object.assign({}, res.data.data, { uid }))
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
    // 取消新增合同
    hideSettlement() {
      this.settlementOption.show = false
    },
    // 业务类型下拉
    getBusinessType() {
      this.businessTypeOptions = this.dictMap['baseBusinessType'] || []
      // 默认全部勾选
      if (!this.form.settleBusinessTypeList.length) {
        this.form.settleBusinessTypeList = this.businessTypeOptions.map(
          (item) => item.value
        )
      }
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 1000,
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
      })
    },
     // 关联公司下拉
    getRelation() {
      const data = {
        custid: this.custid
      }
      relation(data)
        .then(res => {
          this.relationList = res.data.map(item => {
            // 新增时把自己选中
            if (item.custid === this.custid) {
              if (!this.dataSource.contractInfoNo) {
                this.form.contractRelCustList.push({
                  ...item,
                  label: item.name,
                  value: item.custid
                })
              }
            }
            return {
              ...item,
              label: item.name,
              value: item.custid
            }
          })
        })
        .catch(() => {})
    },
    // 获取合同详情
    getContractDetail(contractId) {
      const data = {
        contractId,
        custid: this.custid,
      }
      contractDetail(data)
        .then((res) => {
          if (res.code === 0) {
            // form表单信息
            const {
              contractNoPrefix,
              contractBusinessTypeList,
              contractCompanyList,
              contractRelCustList,
              contractFileList,
            } = res.data
            const settleBusinessTypeList =
              contractBusinessTypeList?.map((item) => item.businessType) || []
            const settleCompanyList =
              contractCompanyList?.map((item) => item.companyCode) || []
            const contractRelCustListMap = contractRelCustList.map(item => {
              let {relCustName,relCustid} = item
              return {
                custid: relCustid,
                name: relCustName,
                label: relCustName,
                value: relCustid
              }
            })
            this.form = Object.assign({}, this.form, {
              settleBusinessTypeList,
              settleCompanyList,
              contractRelCustList: contractRelCustListMap
            })
            // 请求新的合同编号
            if (contractNoPrefix) {
              this.changeContractNoPrefix(contractNoPrefix)
            }
            // 上传文件
            const fileList = contractFileList.map((item) =>
              Object.assign({}, item, { name: item.fileName })
            )
            this.fileList = fileList
            const fileListUpload = contractFileList.map((item) =>
              Object.assign({}, item, { name: item.fileName })
            )
            this.fileListUpload = fileListUpload
          }
        })
        .catch(() => {})
    },
  },
  mounted() {
    // 复制合同信息
    if (this.dataSource.contractInfoNo) {
      const { effectStartDate, effectEndDate } = this.dataSource
      const isEffectDate = effectEndDate === '9999-12-31'
      let effectDate = []
      if (!isEffectDate) {
        effectDate = [effectStartDate, effectEndDate]
      }
      this.form = Object.assign({}, this.form, this.dataSource, {
        isEffectDate,
        effectDate
      })
      // 获取客户合同信息详情
      this.getContractDetail(this.form.contractId)
    }
  }
}
</script>

<style lang="scss" scoped>
.top-box,
.title-box {
  display: flex;
  margin: 8px;
  .title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    &::before {
      content: '*';
      color: #ff4949;
      margin-right: 4px;
      font-weight: normal;
    }
  }
}
.add-form {
  .settle-form {
    /deep/ .el-form-item {
      margin-bottom: 20px;
      .el-select {
        width: 220px;
      }
      .contract-select {
        width: 80px;
      }
      .contract-input {
        width: 140px;
      }
      .contract-date {
        width: 220px;
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
        background-color: #fff;
        padding: 0;
        .el-upload-dragger {
          width: 100%;
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
        width: 750px;
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
  .el-select .el-select--mini,
  .el-input--mini .el-input__inner,
  .el-input .el-input--mini,
  .el-input.el-input--mini {
    width: 180px;
    text-align: center;
  }
  .item {
    margin-bottom: 5px;
    .el-select.el-select--mini:first-child {
      .el-input.el-input--mini {
        width: 180px;
      }
      width: 180px;
      .el-input--mini .el-input__inner {
        width: 180px;
      }
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
.relcust{
  /deep/.el-tag__close{
    display: none;
  }
}
</style>
