<template>
  <el-dialog
    :title="options.title"
    :visible.sync="options.show"
    width="600px"
    :before-close="close"
    class="edit-relation"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="mini"
      class="form"
    >
      <el-form-item
        label="关联类型:"
        prop="relType"
        v-if="options.type === 'add'"
      >
        <el-select v-model="form.relType" placeholder="请选择关联关系">
          <el-option
            v-for="item in dictMap['supplierRelationType']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="公司名称:"
        prop="relSupplierId"
        v-if="options.type !== 'edit'"
      >
        <el-select
          v-model="form.relSupplierId"
          placeholder="请选择关联公司"
          filterable
          remote
          :remote-method="getCompanyList"
          :disabled="options.type === 'del'"
        >
          <el-option
            v-for="item in companyList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="附件有效期:"
        prop="fileEffect"
        v-if="options.type !== 'del'"
        :rules="{
          required: options.type === 'edit',
          message: '附件有效期必选',
          trigger: 'change'
        }"
      >
        <el-date-picker
          v-model="form.fileEffect"
          type="daterange"
          placeholder="请选择"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item
        label="上传附件:"
        v-if="options.type !== 'del'"
        :required="options.type === 'edit'"
      >
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
      <el-form-item
        label="解绑原因"
        prop="delReason"
        v-if="options.type === 'del'"
      >
        <el-select v-model="form.delReason" placeholder="请选择原因">
          <el-option
            v-for="item in dictMap['relieveReason']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="解绑备注:"
        prop="delRemark"
        v-if="options.type === 'del'"
      >
        <el-input
          type="textarea"
          v-model="form.delRemark"
          :autosize="{ minRows: 2, maxRows: 6 }"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">{{
        options.btnText
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import SUPPLIER from '@/api/crm/supplier'
export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    custid: ''
  },
  data() {
    return {
      form: {
        relType: '',
        relSupplierId: '',
        relSupplierName: '',
        fileEffect: [],
        fileEffectBeginDate: '',
        fileEffectEndDate: '',
        files: [],
        delReason: '',
        delRemark: ''
      },
      rules: {
        relType: { required: true, message: '关联关系必填', trigger: 'change' },
        relSupplierId: {
          required: true,
          message: '关联公司必选',
          trigger: 'change'
        },
        delReason: {
          required: true,
          message: '解绑原因必选',
          trigger: 'change'
        }
      },
      companyList: [],
      defaultFileSize: 100,
      sizeLimit: true,
      file: '',
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    // 关闭
    close() {
      this.$emit('close')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { fileEffect, files } = this.form
          const { type } = this.options
          const len1 = fileEffect?.length || 0
          const len2 = files.length
          if (
            Boolean(len1 || len2) !== Boolean(len1 && len2) &&
            type !== 'del'
          ) {
            return this.$msgErrClose('附件有效期与附件上传必须同时填写')
          }
          if (type === 'add') {
            const relSupplierName = this.companyList.find(
              (item) => item.supplierId === this.form.relSupplierId
            )
            if (relSupplierName) {
              this.form.relSupplierName = relSupplierName.name
            }
          }
          if (type === 'edit' && (!len1 || !len2)) {
            return this.$msgErrClose('附件有效期与附件上传必须填写')
          }
          this.$emit('submit', this.form)
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 公司列表
    getCompanyList(str = '') {
      const data = {
        currPage: 1,
        pageSize: 10,
        verifyStatus: 'pass',
        query: [{ column: 'name', type: 'like', value: str }]
      }
      SUPPLIER.mySupplierList(data)
        .then((res) => {
          this.companyList = res.data.list.map((item) => {
            return {
              ...item,
              value: item.supplierId,
              label: item.name
            }
          })
          const { type } = this.options
          if (type === 'add') {
            this.companyList = this.companyList.filter(
              (ele) => ele.supplierId !== this.custid
            )
          }
          if (type === 'del') {
            const { relSupplierId, relSupplierName } = this.form
            const source = this.companyList.find(
              (item) => item.supplierId === relSupplierId
            )
            if (!source) {
              this.getCompanyList(relSupplierName)
            }
          }
        })
        .catch(() => {})
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
      this.form.files = this.form.files.filter((item) => {
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
            this.form.files.push(
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
    }
  },
  mounted() {
    if (this.options.type === 'edit') {
      this.form = Object.assign(this.form, this.options.row, {
        fileEffect: [],
        fileEffectBeginDate: '',
        fileEffectEndDate: '',
        files: []
      })
    } else if (this.options.type === 'del') {
      const { fileEffectBeginDate, fileEffectEndDate } = this.options.row
      this.form = Object.assign(this.form, this.options.row, {
        fileEffect: [fileEffectBeginDate, fileEffectEndDate]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-relation {
  /deep/ .el-form-item {
    margin-bottom: 15px;
    .el-select,
    .el-date-editor {
      width: 100%;
    }
  }
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
}
</style>
