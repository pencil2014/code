<template>
  <el-dialog
    :title="uploadTitle"
    :visible.sync="showUploadIn"
    class="finance-upload-file-dialog"
    width="600px"
  >
    <div>
      <el-form :model="uploadParams" ref="upload" :rules="uploadParamsRules" label-width="100px">
        <slot name="formItems"></slot>
        <el-form-item :label="fileLabel" prop="file">
          <el-upload
            ref="upload"
            drag
            class="upload-file-cont"
            action="#"
            :limit="limit"
            :multiple="true"
            :auto-upload="false"
            :on-exceed="handleExceed"
            :on-change="handleChangeFile"
            :on-remove="handleRemove"
            :file-list="fileList"
          >
            <div class="file-upload">
              <img class="file-upload-img" src="@/assets/icon-upload.png" />
              <div class="file-upload__text">
                <div class="txt">点击或将文件拖拽到这里导入</div>
                <p
                  class="info"
                >支持doc,docx,pdf,xls,xlsx,jpg,png,jpeg,bmp,tif,image,txt,zip,rar格式文件， 且文件大小在5M内</p>
              </div>
            </div>
          </el-upload>
          <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
        </el-form-item>
      </el-form>
      <slot name="bottom"></slot>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button :loading="btnLoading" type="primary" @click="uploadAction" size="mini">确定</el-button>
      <el-button @click="closeUpload" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { returnDetail } from '@/api/bkg/stockApply'
export default {
  name: 'financeUploadFile',
  props: {
    fileLabel: {
      type: String,
      default: '',
    },
    uploadTitle: {
      type: String,
      default: '',
    },
    uploadApi: {
      type: String,
      default: '',
    },
    showUpload: {
      type: Boolean,
      default: false,
    },
    uploadParams: {
      type: Object,
      default: () => ({}),
    },
    uploadParamsRules: {
      type: Object,
      default: () => ({}),
    },
    limit: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      btnLoading: false,
      showUploadIn: false,
      upload: {},
      file: null,
      fileList: [],
      resFileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 5,
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.uploadParams.file = ''
      this.fileList.splice(0, 100)
    },
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择 ${this.limit} 个文件！`)
    },
    handleChangeFile(file, fileList) {
      this.uploadParams.file = file.raw
      this.file = file.raw
      this.fileList = fileList
      this.$refs.upload.clearValidate('file')
      // 自动上传
      if (this.$attrs.autoUpload && fileList.length) {
        this.handleUpload(fileList[0].raw)
      }
    },
    uploadAction() {
      // if (this.fileList.length === 0) {
      //   return this.$msgErrClose('未选择文件，不能上传!')
      // }
      console.log(this.$attrs.needValid)
      if (this.$attrs.needValid) {
        this.$refs.upload.validate((valid) => {
          console.log(valid)
          if (!valid) return
          this.fileList.forEach((file) => {
            this.handleUpload(file.raw)
          })
        })
        return
      }
      this.fileList.forEach((file) => {
        this.handleUpload(file.raw)
      })
    },
    handleUpload(file) {
      const form = new FormData()
      form.append('file', file)
      let keys = Object.keys(this.uploadParams)
      console.log('keys:', keys)
      console.log(this.uploadParams)
      if (keys && keys.length > 0) {
        keys.forEach((key) => {
          let value = this.uploadParams[key]
          if (value && value !== '') {
            form.append(key, value)
          }
        })
      }

      this.handleProgress()
      this.btnLoading = true
      this.$store
        .dispatch('user/import', {
          uri: this.uploadApi,
          params: form,
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.processLength = 100
            this.showProcess = false
            this.$msgSucClose('上传成功!')
            let resFile = res.data.data
            if (resFile) {
              this.resFileList.push(resFile)
            }
            let objcet = {
              data: res.data.data,
              renovate: true, //上传成功刷新当前页面
              uploadTitle: this.uploadTitle,
            }
            this.$emit('send-res-upload', objcet) //上传成功回调
            // 暂时如下写，如上传多个文件，其中包括大文件，要改变写法
            if (!this.$attrs.autoUpload) {
              this.showUploadIn = false
              this.fileList = []
            }
          } else {
            if (this.$attrs.autoUpload) {
              this.fileList = []
            }
          }
        })
        .finally(() => {
          this.btnLoading = false
          // if (!this.$attrs.autoUpload) {
          //   this.fileList = []
          // }
          this.showProcess = false
          this.processLength = 0
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
    closeUpload(isSure) {
      this.fileList = [] //清除
      this.showUploadIn = false
      this.$emit('close-upload', isSure)
    },
  },
  watch: {
    showUpload: {
      handler(newVal) {
        this.showUploadIn = newVal
      },
      immediate: true,
    },
    showUploadIn(newVal) {
      if (!newVal) {
        this.$emit('close-upload')
      }
    },
    resFileList(newVal) {
      this.$emit('send-res-file-list', newVal)
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-upload-file-dialog ::v-deep {
  .el-dialog__body {
    padding: 24px;
  }
  .el-form-item {
    display: flex;
    margin-bottom: 8px;
    & > label {
      flex: 0 0 auto;
    }
    .el-form-item__content {
      margin-left: 0 !important;
      flex: 1 1 auto;
      & > div {
        width: 100%;
      }
    }
  }
  .el-form-item__error {
    left: -66px;
    top: 16px;
  }
}
</style>