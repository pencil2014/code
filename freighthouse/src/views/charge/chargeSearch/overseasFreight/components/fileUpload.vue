<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="top" label-width="70px" class="create-form">
      <el-form-item label="Upload attachment">
        <el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="false" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="handleImport" :file-list='fileList' :disabled="!canSubmit">
          <div class="file-upload">
            <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
            <div class="file-upload__text">
              <div class="txt">Click or drag and drop files here to import</div>
              <p class="info">Support doc, docx, pdf, xls, xlsx, jpg, png, jpeg, bmp, tif, image, txt, zip, rar format files, and the file size is limited to 100M</p>
            </div>
          </div>
        </el-upload>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
// import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index-en.vue'

const defaultCreate = {
  orderNo: '',
  intrustNo: '',
  fileName: '',
  loadId: '',
  signTime: '',
}

export default {
  filters: {},
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: 'Attachment Upload',
        show: true,
        size: 'medium',
        width: '460px',
      },
      canSubmit: true, // 可提交标识
      defaultFileSize: 100, //文件默认不超过100M
      sizeLimit: true,
      file: '',
      fileList: [],
      showProcess: false,
      processLength: 0,
      rules: {
        signTime: [{ required: true, message: 'Please choose the time to sign', trigger: 'change' }],
      },
      createdItem: Object.assign({}, defaultCreate),
      interval: null,
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({}),
    },
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      role: (state) => state.user.role,
    }),
  },
  components: {
    BaseDialog,
  },
  watch: {},
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: 'error',
          message: 'Please upload the attachment first',
          duration: 1000,
          onClose: () => {},
        })
        return false
      }
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.uploadFileForm.validate((valid) => {
          if (valid) {
            if (!this.validate() || !this.canSubmit) return
            this.$refs.upload.submit(done)
          } else {
            this.$msgErrClose('Please fill in the fields in the red box as required!')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!this.sizeLimit) {
        this.$message.error( `Upload file size exceeds ${this.defaultFileSize}M limit`)
      }
      return this.sizeLimit
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleImport(done) {
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('file', this.file)
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store
          .dispatch('user/import', {
            uri: '/base/webapi/file/upload',
            params: form,
          })
          .then((res) => {
            this.processLength = 100
            this.showProcess = false
            this.fileList = []
            this.canSubmit = true
            if (res === 'error') return
            this.$message({
              type: 'success',
              message: 'Upload successful',
              duration: 1000,
              onClose: () => {
                this.close('Confirm', res.data.data)
              },
            })
          })
      }
    },

    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength = 0
      this.showProcess = true
      this.interval = setInterval(() => {
        if (this.processLength >= 99) {
          clearInterval(this.interval)
          return
        }
        this.processLength += 1
      }, 200)
    },
  },
}
</script>
<style lang="scss">
</style>