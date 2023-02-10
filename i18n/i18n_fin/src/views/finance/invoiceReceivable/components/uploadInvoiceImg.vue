<template>
  <el-dialog
    :title="`${limit != 1 ? '批量' :''}上传发票`"
    :visible.sync="showUpload"
    width="500px"
    height="500px"
  >
    <el-form :model="upload" ref="upload">
      <el-form-item>
        <el-upload
          style="width:100%"
          ref="upload"
          drag
          action="#"
          :limit="limit"
          :on-exceed="handleExceed"
          :multiple="true"
          :auto-upload="autoUpload"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="handleImport"
          :file-list="fileList"
          accept=".pdf, .jpg, .png, .jpeg"
        >
          <div class="file-upload">
            <img class="file-upload-img" src="@/assets/icon-upload.png" />
            <div class="file-upload__text">
              <div class="txt">
                {{$t('BillList.clickToImport')}}
                <slot name="remark"></slot>
              </div>
              <p class="info">支持 {{ acceptTypes }} 格式文件， 且文件大小限制在{{defaultFileSize}}M内</p>
            </div>
          </div>
        </el-upload>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
      </el-form-item>
    </el-form>
    <slot></slot>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" @click="uploadAction" size="mini">{{$t('Common.sure')}}</el-button>
      <el-button @click="closeUpload" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { uploadInvoiceFileBatch, uploadInvoiceFile } from '@/api/fin/invoiceReceivable'
export default {
  props: {
    uploadTitle: {
      type: String,
      default: '批量上传发票',
    },
    autoUpload: { type: Boolean, default: false },
    showUpload: {
      type: Boolean,
      default: false,
    },
    uploadParams: {
      type: Object,
      default: () => ({}),
    },
    acceptTypes: {
      type: Array,
      default: () => ['pdf', 'jpg', 'png', 'jpeg'],
    },
    limit: {
      type: Number,
      default: 50,
    },
  },
  computed: {
    acceptTypesStr() {
      return this.acceptTypes.toString()
    },
  },
  data() {
    return {
      // showUpload: false,
      upload: {},
      file: null,
      fileList: [],
      resFileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 50,
      fileName: [],
      loading: false,
    }
  },
  methods: {
    handleExceed(files, fileList) {
      this.$message.error(`只能选择 ${this.limit} 个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$message.error(this.$t('Settle.uploadfile', {size:  this.defaultFileSize + 'M'}))
      }
      return sizeLimit
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        fileList.pop()
        this.$message.error(this.$t('Settle.uploadfile', {size:  this.defaultFileSize + 'M'}))
      }
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      let index = fileList.findIndex((item) => {
        return (item.uid = file.uid)
      })
      this.resFileList.splice(index, 1) // 删除对应的fileId
      this.fileList = fileList
    },
    handleImport(done) {
      this.handleProgress()
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
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            if (res.data.data) {
              this.resFileList.push(res.data.data)
            }
            this.$msgSucClose('上传成功')
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
      }, 60)
    },

    uploadAction() {
      if (this.fileList.length === 0) {
        this.$msgErrClose('未选择文件，不能上传!')
        return
      }
      this.handleUpload()
    },
    handleUpload(file) {
      const form = new FormData()
      const fileName = this.fileList.map((item) => item.raw)
      fileName.forEach((item, index) => form.append(this.limit == 1 ? 'file' : 'fileNames', item))
      let params = this.uploadParams
      for (const key in params) {
        form.append(key, params[key])
      }
      this.loading = true
      let method = this.limit == 1 ? uploadInvoiceFile : uploadInvoiceFileBatch
      method(form)
        .then((res) => {
          this.$msgSucClose(this.limit == 1 ? '上传成功' : '批量上传成功', 3000)
          this.closeUpload(true)
        })
        .finally(() => {
          this.loading = false
        })
    },
    //取消按钮
    closeUpload(refresh) {
      this.fileList = []
      this.$emit('update:showUpload', false)
      // this.showUpload = false
      this.$emit('close-upload', refresh)
    },
  },
  watch: {
    // showUpload(newVal) {
    //   this.showUpload = this.showUpload
    // },
    // showUpload(newVal) {
    //   if (!newVal) {
    //     this.$emit('close-upload')
    //   }
    // },
    // resFileList(newVal) {
    //     console.log(newVal);
    //   this.$emit('send-res-file-list', newVal)
    // }
  },
}
</script>
<style scoped>
.receivable-file-upload {
  display: flex;
  justify-content: center;
}
</style>