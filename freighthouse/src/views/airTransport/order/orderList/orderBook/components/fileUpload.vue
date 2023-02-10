<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :rules="rules" :model="createdItem" label-position="left" label-width="80px" class="create-form">
      <el-form-item label="附件类型" prop="fileType">
        <el-select v-model="createdItem.fileType" size="mini" clearable placeholder="请选择附件类型" style="width: 100%" :disabled="!!fileType">
          <el-option v-for="(item, index) in typeCodeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传附件" prop="fileName" class="is-required">
        <el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="multiple" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="uploadFile" :file-list='fileList'>
          <div class="file-upload">
            <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
            <div class="file-upload__text">
              <div class="txt">点击或将文件拖拽到这里导入</div>
              <p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
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
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  orderNo: '',
  fileType: '',
  fileName: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '附件上传',
        show: true,
        size: 'medium',
        width: '400px'
      },
      canSubmit: true, // 可提交标识
      multiple: false,
      defaultFileSize: 100, //文件默认不超过100M
      sizeLimit: true,
      file: '',
      fileList: [],
      fileData: '',
      showProcess: false,
      processLength: 0,

      createdItem: Object.assign({}, defaultCreate),
      typeCodeOptions: [],
      rules: {
        fileType: [
          { required: true, message: '请选择附件类型', trigger: 'change' }
        ]
      }
    }
  },
  props: {
    param: {
      type: Object
    },
    fileType: {
      type: String,
      default: ''
    },
    isImportOrder: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    }
  },
  created() {
    this.createdItem.fileType = this.fileType
    // if (this.isImportOrder) {
    //   this.typeCodeOptions = [
    //     {
    //       label: '箱单发票', //
    //       value: 'air_import_xdfp'
    //     },
    //     {
    //       label: '报关单', //
    //       value: 'air_import_bgd'
    //     },
    //     {
    //       label: '放行条', //
    //       value: 'air_import_fxt'
    //     },
    //     {
    //       label: '保单',
    //       value: 'air_import_guarantee_slip'
    //     },
    //     {
    //       label: '账单',
    //       value: 'air_import_bill'
    //     },
    //     {
    //       label: '提单',
    //       value: 'air_import_bl'
    //     },
    //     {
    //       label: '其他清关资料', //
    //       value: 'air_import_qgzl'
    //     }
    //   ]
    // }
    if (!this.isImportOrder) {
      this.typeCodeOptions = [
        {
          label: '入仓单',
          value: 'AIR_PO'
        },
        {
          label: '交货保函',
          value: 'AIR_DELIVERY_LETTER'
        },
        {
          label: '清单',
          value: 'AIR_CHECKLIST'
        }
      ]
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {
    'detailData.serviceList': {
      handler(newVal) {
        // 服务项不同，展示的字段不一样
        console.log(newVal)
        if (newVal && newVal.includes('pod_comm_clearance')) {
          this.typeCodeOptions = [
            {
              label: '箱单发票', // 目的港委托清关 服务项专有的附件类型
              value: 'air_import_xdfp'
            },
            {
              label: '报关单', //
              value: 'air_import_bgd'
            },
            {
              label: '放行条', //
              value: 'air_import_fxt'
            },
            {
              label: '保单',
              value: 'air_import_guarantee_slip'
            },
            {
              label: '账单',
              value: 'air_import_bill'
            },
            {
              label: '提单',
              value: 'air_import_bl'
            },
            {
              label: '其他清关资料', //
              value: 'air_import_qgzl'
            }
          ]
        } else {
          this.typeCodeOptions = [
            {
              label: '保单',
              value: 'air_import_guarantee_slip'
            },
            {
              label: '账单',
              value: 'air_import_bill'
            },
            {
              label: '提单',
              value: 'air_import_bl'
            }
          ]
        }
        console.log(this.typeCodeOptions)
      },
      immediate: true
    }
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action) {
      this.$emit('close', action)
    },
    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: 'error',
          message: '请上传附件',
          duration: 1000,
          onClose: () => {}
        })
        return false
      }
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.uploadFileForm)
        this.$refs.uploadFileForm.validate((valid) => {
          if (valid) {
            if (!this.validate() || !this.canSubmit) return
            this.handleImport()
          } else {
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
        this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return this.sizeLimit
    },

    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      // this.fileList = fileList
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
    },

    // 移除文件
    handleRemove(file, fileList) {
      this.fileList = fileList
    },

    uploadFile(file) {
      this.fileData = file.file
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
    handleImport(done) {
      // 根据后台需求数据格式
      console.log(this.fileData)
      this.$refs.upload.submit()
      if (this.sizeLimit) {
        if (!this.isImportOrder) {
          this.handleProgress()
          this.canSubmit = false
          let uploadParams = {
            orderNo: this.$route.query.orderNo,
            fileType: this.createdItem.fileType
          }
          let url = '/order/air/book/file/upload'
          this.$store
            .dispatch('airTransport/soUpload', {
              uri: url,
              params: { fileName: this.fileData, data: uploadParams }
            })
            .then((res) => {
              this.processLength = 100
              this.showProcess = false
              this.fileList = []
              this.canSubmit = true
              if (res === 'error') return
              this.$message({
                type: 'success',
                message: '导入成功',
                duration: 1000,
                onClose: () => {
                  this.close('Confirm')
                }
              })
            })
        } else {
          let fileData = new FormData()
          fileData.append('orderNo', this.orderNo || this.$route.query.orderNo)
          fileData.append('typeCode', this.createdItem.fileType)
          fileData.append('fileName', this.fileData)
          this.handleProgress()
          this.canSubmit = false
          this.$store
            .dispatch('user/import', {
              uri: '/order/shiporder/file/upload',
              params: fileData
            })
            .then((res) => {
              this.processLength = 100
              this.showProcess = false
              this.fileList = []
              this.canSubmit = true
              if (res === 'error') return
              this.$message({
                type: 'success',
                message: '导入成功',
                duration: 1000,
                onClose: () => {
                  this.close('Confirm')
                }
              })
            })
            .catch(() => {
              this.showProcess = false
              this.fileList = []
              this.canSubmit = true
            })
        }
      }
    }
  }
}
</script>

<style lang="scss">
</style>
