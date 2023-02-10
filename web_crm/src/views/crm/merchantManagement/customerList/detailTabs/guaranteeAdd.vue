<template>
  <el-dialog
    :before-close="cancel"
    :appendToBody="true"
    :visible.sync="config.show"
    class="guarantee-add"
    :title="`${config.isEdit ? '编辑' : '新增'}保函`"
    width="800px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="guarantee-form"
      label-width="100px"
      ref="form"
      size="mini"
    >
      <el-form-item label="保函类型:" prop="guaranteeType">
        <el-select
          v-model="form.guaranteeType"
          placeholder="请选择"
          :disabled="disabledFormItem"
          @change="changeGuaranteeType"
        >
          <el-option
            v-for="item in dictMap['custGuaranteeType']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="保函编号" prop="guaranteeNo">
        <el-input
          v-model="form.guaranteeNo"
          placeholder="请填写"
          :disabled="disabledFormItem"
          :maxlength="64"
        ></el-input>
      </el-form-item>
      <el-form-item label="业务类型:" prop="guaranteeBusinessTypeList">
        <el-select
          v-model="form.guaranteeBusinessTypeList"
          placeholder="请选择"
          multiple
          filterable
          :clearable="!disabledFormItem"
          value-key="businessType"
          collapse-tags
          :class="{ 'hide-icon': disabledFormItem }"
        >
          <el-option
            v-for="item in dictMap['baseBusinessType']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="disabledFormItem"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="我司分公司:" prop="guaranteeCompanyList">
        <el-select
          v-model="form.guaranteeCompanyList"
          placeholder="请选择"
          value-key="companyCode"
          multiple
          filterable
          :clearable="!disabledFormItem"
          collapse-tags
          @change="changeCompanyList"
          :class="{ 'hide-icon': disabledFormItem }"
        >
          <el-option
            v-for="item in settleCompanyList"
            :key="item.companyCode"
            :label="item.companyName"
            :value="item"
            :disabled="item.disabled || disabledFormItem"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="有效期:" prop="effectStartDate" class="flex-item">
        <el-date-picker
          clearable
          placeholder="起签时间"
          type="date"
          v-model="form.effectStartDate"
          value-format="yyyy-MM-dd"
          :disabled="disabledFormItem"
        ></el-date-picker>
        <el-date-picker
          clearable
          placeholder="到期时间"
          type="date"
          v-model="form.effectEndDate"
          value-format="yyyy-MM-dd"
          :disabled="form.isEffectDate || disabledFormItem"
          v-show="!form.isEffectDate"
        ></el-date-picker>
        <el-checkbox
          label="长期有效"
          style="margin-left: 5px"
          v-model="form.isEffectDate"
          :disabled="disabledFormItem"
        ></el-checkbox>
      </el-form-item>
      <el-form-item
        label="备注:"
        prop="remark"
        class="flex-item"
        placeholder="请填写"
      >
        <el-input
          type="textarea"
          v-model="form.remark"
          :disabled="disabledFormItem"
          :maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="上传保函:" prop="fileNo" class="flex-item">
        <div class="file-box" v-if="disabledFormItem">
          {{ form.fileName }}
        </div>
        <div class="file-upload" v-else>
          <!-- :on-exceed="handleExceed" :before-upload="getFile"-->
          <el-upload
            :auto-upload="true"
            :file-list="fileList"
            :before-upload="getFile"
            :http-request="handleImport"
            :multiple="true"
            :limit="1"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            action="#"
            class
            drag
            ref="upload"
            :disabled="disabledFormItem"
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
                  格式文件
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
      <el-form-item label="保管人:" prop="custodianEmployeeId">
        <el-select
          v-model="form.custodianEmployeeId"
          placeholder="请选择"
          value-key="employeeId"
          filterable
          clearable
          :disabled="disabledFormItem"
          remote
          :remote-method="getBaseEmployeeList"
        >
          <el-option
            v-for="(item, index) in custodianList"
            :key="item.employeeNo + index"
            :label="`${item.cname}_${item.employeeId}_${
              item.deptCname || '未知'
            }`"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="归属人:" prop="belongEmployeeId">
        <el-select
          v-model="form.belongEmployeeId"
          placeholder="请选择"
          value-key="bdEmployeeId"
          filterable
          clearable
          :disabled="disabledFormItem"
        >
          <el-option
            v-for="(item, index) in belongList"
            :key="item.bdEmployeeId + '-' + index"
            :label="`${item.bdEmployeeName}_${item.bdEmployeeId}`"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div
      class="dialog-footer"
      slot="footer"
      v-show="isCts && (form.status !== 'no_effect' || !config.isEdit)"
    >
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button @click="submit" size="mini" type="primary"> 确定 </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { companyPageList, baseEmployeeList } from "@/api/base"
import { mapGetters } from "vuex"
import { listByRoleDept, belong, getGuaranteeNo } from "@/api/crm/guarantee"
export default {
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    isCts: {
      type: Boolean,
      default: false,
    },
    custid: {
      type: Number || String,
      default: "",
    },
  },
  components: {},
  computed: {
    ...mapGetters(["dictMap", "dictMapObj"]),
    disabledFormItem() {
      return (
        !this.isCts ||
        (this.isCts && this.form.status === "no_effect" && this.config.isEdit)
      )
    },
  },
  data() {
    return {
      form: {
        guaranteeType: "",
        guaranteeNo: "",
        effectStartDate: "",
        effectEndDate: "",
        isEffectDate: false,
        fileNo: "",
        fileName: "",
        custodianEmployeeId: "",
        custodianEmployeeName: "",
        belongEmployeeId: "",
        belongEmployeeName: "",
        remark: "",
        guaranteeBusinessTypeList: [],
        guaranteeCompanyList: [
          {
            companyCode: "000000",
            companyName: "所有分公司",
            companyId: 0,
            disabled: false,
          },
        ],
      },
      rules: {
        guaranteeType: {
          required: true,
          message: "保函类型必选",
          trigger: "change",
        },
        guaranteeNo: {
          required: true,
          message: "保函编号必填",
          trigger: "change",
        },
        effectStartDate: {
          required: true,
          message: "起签时间必选",
          trigger: "change",
        },
        fileNo: {
          required: true,
          message: "保函必传",
          trigger: "change",
        },
        guaranteeBusinessTypeList: {
          required: true,
          message: "业务类型必选",
          trigger: "change",
        },
        guaranteeCompanyList: {
          required: true,
          message: "分公司必选",
          trigger: "change",
        },
        custodianEmployeeId: {
          required: true,
          message: "保管人必选",
          trigger: "change",
        },
        belongEmployeeId: {
          required: true,
          message: "归属人必选",
          trigger: "change",
        },
      },
      businessTypes: [],
      settleCompanyList: [],
      custodianList: [],
      belongList: [],
      sizeLimit: true,
      file: "",
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0,
      guaranteeBusinessTypeList: [],
    }
  },
  created() {
    if (this.config.isEdit || this.config.form.guaranteeId) {
      this.form = Object.assign(this.form, this.config.form)
      let {
        guaranteeBusinessTypeList,
        effectEndDate,
        fileName,
        filePath,
        fileNo,
        custodianEmployeeId,
        custodianEmployeeName,
        guaranteeType,
      } = this.form
      // 缓存业务类型
      this.guaranteeBusinessTypeList = guaranteeBusinessTypeList
      // form业务类型赋值
      this.form.guaranteeBusinessTypeList = guaranteeBusinessTypeList.map(
        (item) => item.businessType
      )
      if (effectEndDate === "9999-12-31") {
        this.form.isEffectDate = true
        this.form.effectEndDate = ""
      }
      if (fileName) {
        this.fileList = [
          {
            fileName,
            filePath,
            fileNo,
            name: fileName,
          },
        ]
      }
      if (custodianEmployeeName) {
        this.getBaseEmployeeList(custodianEmployeeName)
      }
      this.changeGuaranteeType(guaranteeType)
    } else {
      this.form.guaranteeBusinessTypeList = this.dictMap[
        "baseBusinessType"
      ].map((item) => item.value)
    }
    this.getCompanyList()
    // this.getListByRoleDept()
    this.getBelong()
  },
  methods: {
    // 切换保函类型
    changeGuaranteeType(val) {
      let data = {
        guaranteeType: val,
      }
      getGuaranteeNo(data)
        .then((res) => {
          if (res.code === 0) {
            this.form.guaranteeNo = res.data.seqNo
          }
        })
        .catch(() => {})
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: "state",
            type: "eq",
            value: "valid",
          },
          {
            column: "selfSettle",
            type: "eq",
            value: "yes",
          },
        ],
      }
      companyPageList(data).then((res) => {
        this.settleCompanyList = res.data.list.map((item) =>
          Object.assign({}, item, { disabled: false })
        )
        this.settleCompanyList.unshift({
          companyCode: "000000",
          companyName: "所有分公司",
          companyId: 0,
          disabled: false,
        })
      })
    },
    // 修改分公司
    changeCompanyList(val) {
      let codes = val.map((ele) => ele.companyCode)
      if (codes.includes("000000")) {
        this.form.guaranteeCompanyList = [
          {
            companyCode: "000000",
            companyName: "所有分公司",
            companyId: 0,
            disabled: false,
          },
        ]
        this.settleCompanyList.forEach((item) => {
          if (item.companyCode !== "000000") {
            item.disabled = true
          }
        })
      } else {
        this.settleCompanyList.forEach((item) => {
          item.disabled = false
        })
      }
    },
    // 取消
    cancel() {
      this.$emit("cancel")
    },
    // 提交
    submit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let {
            isEffectDate,
            effectEndDate,
            fileNo,
            guaranteeId,
            guaranteeBusinessTypeList,
          } = this.form
          if (!isEffectDate && !effectEndDate) {
            return this.$msgErrClose("到期时间必选")
          }
          if (isEffectDate) {
            this.form.effectEndDate = "9999-12-31"
          }
          if (!fileNo) {
            return this.$msgErrClose("保函必须上传")
          }
          // 处理业务类型
          let { isEdit } = this.config
          let oldTypes = this.guaranteeBusinessTypeList.map(
            (item) => item.businessType
          )
          let businessTypeList = []
          guaranteeBusinessTypeList.forEach((item) => {
            if (oldTypes.includes(item)) {
              let source = this.guaranteeBusinessTypeList.find(
                (v) => v.businessType === item
              )
              businessTypeList.push(source)
            } else {
              businessTypeList.push({
                businessType: item,
                custid: this.custid,
                guaranteeId: isEdit ? guaranteeId : "",
              })
            }
          })
          let data = Object.assign({}, this.form, {
            guaranteeBusinessTypeList: businessTypeList,
          })
          this.$emit("submit", data)
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 超出限制
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择上传1个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      // const sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      // if (!sizeLimit) {
      //   this.$msgErrClose('上传文件大小超过' + this.defaultFileSize + 'M限制')
      // }
      // return sizeLimit
    },
    // 删除上传文件
    handleRemove(file, fileList) {
      this.fileList = []
      this.form.fileName = ""
      this.form.fileNo = ""
      this.form.filePath = ""
    },
    // 上传文件
    handleImport() {
      this.handleProgress()
      const form = new FormData()
      form.append("file", this.file)
      const uid = this.file.uid
      this.$store
        .dispatch("user/import", {
          uri: "/base/webapi/file/upload",
          params: form,
        })
        .then((res) => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            this.$msgSucClose("上传成功!")
            let { name: fileName, fileNo, filePath } = res.data.data
            this.form = Object.assign(this.form, {
              fileName,
              fileNo,
              filePath,
            })
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
    // 保管人
    getListByRoleDept() {
      let data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: "roleCode",
            type: "eq",
            value: "op",
          },
          {
            column: "deptRole",
            type: "eq",
            value: "manager",
          },
        ],
      }
      listByRoleDept(data)
        .then((res) => {
          if (res.code === 0) {
            this.custodianList = res.data.list || []
            // 初始化编辑信息
            let { custodianEmployeeId } = this.form
            if (custodianEmployeeId) {
              let source = res.data.list.find(
                (item) => item.employeeId === custodianEmployeeId
              )
              if (source) {
                this.form.custodianEmployeeId = source
              }
            }
          }
        })
        .catch(() => {})
    },
    // 归属人
    getBelong() {
      let data = {
        custid: this.custid,
      }
      belong(data)
        .then((res) => {
          if (res.code === 0) {
            this.belongList = res.data || []
            // 初始化编辑信息
            let { belongEmployeeId } = this.form
            if (belongEmployeeId) {
              let source = res.data.find(
                (item) => item.bdEmployeeId === belongEmployeeId
              )
              if (source) {
                this.form.belongEmployeeId = source
              }
            }
          }
        })
        .catch(() => {})
    },
    // 保管人
    getBaseEmployeeList(str = "") {
      let data = {
        columns: [],
        currPage: 1,
        pageSize: 30,
        query: [{ column: "name", type: "eq", value: str }],
      }
      baseEmployeeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.custodianList = res.data.list || []
            // 初始化编辑信息
            let { custodianEmployeeId } = this.form
            if (custodianEmployeeId) {
              let source = res.data.list.find(
                (item) => item.employeeId === custodianEmployeeId
              )
              if (source) {
                this.form.custodianEmployeeId = source
              }
            }
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.guarantee-add {
  .guarantee-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    /deep/ .el-form-item {
      width: 50%;
      margin-right: 0;
      display: flex;
      align-items: center;
      .el-form-item__label {
        height: 20px;
        line-height: 20px;
      }
      .el-form-item__content {
        flex: 1;
        // overflow: hidden;
        line-height: 24px;
      }
      .el-input__inner,
      .el-select,
      .el-select__tags {
        height: 20px !important;
        width: 100%;
      }
      .el-date-editor {
        width: 200px;
        margin-right: 5px;
        .el-input__inner {
          width: 200px;
        }
      }
      .hide-icon {
        .el-tag__close.el-icon-close {
          display: none;
        }
      }
    }
    .flex-item {
      width: 100%;
      textarea {
        width: 100%;
      }
    }
    .file-box {
      font-size: 12px;
    }
  }
  .dialog-footer {
    /deep/.el-button--mini {
      font-size: 12px;
      height: 20px;
      padding: 3px 15px;
    }
  }
  /deep/ .file-upload {
    margin: 0;
    padding: 0;
    // background: #f8f9fd;
    background-color: #fff;
    .file-box {
      padding-top: 5px;
    }
    .el-upload-dragger {
      font-size: 12px;
      .txt-desc {
        color: #bfbfbf;
      }
    }
  }
}
</style>
