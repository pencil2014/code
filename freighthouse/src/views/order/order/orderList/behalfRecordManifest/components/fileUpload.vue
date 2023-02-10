<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="create-form">
      <el-form-item label="附件类型" prop="typeCode" :show-message="false">
        <el-select ref="typeCode" v-model="createdItem.typeCode" size="mini" clearable filterable placeholder="请选择附件类型" style="width: 100%">
          <el-option v-for="(item, index) in typeCodeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="舱单数" prop="manifestNum" :show-message="false">
        <el-input size="mini" v-model.number="createdItem.manifestNum" clearable placeholder="舱单数" @input="checkIntegerQuantity(createdItem.manifestNum, '舱单数')" style="width: 100%" />
      </el-form-item>
      <el-form-item label="报关单数" prop="customsNum" :show-message="false">
        <el-input size="mini" v-model.number="createdItem.customsNum" clearable placeholder="舱单数" @input="checkIntegerQuantity(createdItem.customsNum, '报关单数')" style="width: 100%" />
      </el-form-item>
      <el-form-item label="上传附件" prop="fileName" :show-message="false" class="is-required">
        <el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="multiple" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="uploadFile" :file-list='fileList' :disabled="!canSubmit">
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
import { fileTypeList } from '@/api/base'
import { fileBatchNo } from '@/api/airTransport/order-import'
import { parseTime, randomString } from '@/utils'
import { validateIntegerQuantity } from '@/utils/validate'
let timer = null
const defaultCreate = {
  orderNo: '',
  typeCode: '',
  serviceCode: '',
  fileName: '',
  manifestNum: '',
  customsNum: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '附件上传',
        show: true,
        size: 'medium',
        width: '460px'
      },
      canSubmit: true, // 可提交标识

      multiple: true,
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
        typeCode: [
          { required: true, message: '请选择附件类型', trigger: 'change' }
        ],
        manifestNum: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantity(), trigger: 'change' }
        ],
        customsNum: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantity(), trigger: 'change' }
        ]
      },
      interval: null
    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
    this.getFileTypeList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    checkIntegerQuantity(value, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9][0-9]*)$/
          if (!reg.test(value)) {
            this.$message({
              message: `${prop}请输入大于0的整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${prop}不能超过999999`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    // 获取小类
    getFileTypeList(val) {
      fileTypeList({ serviceCode: 'ocean_manifest' }).then((res) => {
        let { data } = res
        this.typeCodeOptions = []
        this.typeCodeOptions = data.map((item) => {
          return Object.assign(item, {
            label: item.typeName,
            value: item.typeCode
          })
        })
      })
    },

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
      this.fileList = fileList
    },

    // 移除文件
    handleRemove(file, fileList) {
      this.fileList = fileList
    },

    uploadFile(file) {
      this.fileData.append('fileName', file.file)
      //this.file = file.file
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

    handleImport(done) {
      // 根据后台需求数据格式
      this.fileData = new FormData()
      let jsonData = {
        orderNo: this.orderNo || this.$route.query.orderNo,
        typeCode: this.createdItem.typeCode,
        manifestNum: this.createdItem.manifestNum,
        customsNum: this.createdItem.customsNum
      }
      if (this.fileList.length === 1) {
        let paramsData = {
          data: jsonData,
          fromSystem: 'web_H5',
          toSystem: 'mng_base_server',
          reqId: randomString(),
          reqTime: parseTime(new Date().getTime())
        }
        this.fileData.append('jsonData', JSON.stringify(paramsData))
        this.$refs.upload.submit()
        if (this.sizeLimit) {
          this.handleProgress()
          this.canSubmit = false
          this.$store
            .dispatch('airTransport/orderSave', {
              uri: '/order/manifest/upload',
              params: this.fileData
            })
            .then((res) => {
              this.processLength = 100
              this.showProcess = false
              this.fileList = []
              this.canSubmit = true
              if (res.data.code === 0) {
                this.$message({
                  type: 'success',
                  message: '导入成功'
                })
                this.close('Confirm')
              }
            })
            .catch((err) => {
              clearInterval(this.interval)
              this.interval = null
              this.processLength = 0
              this.showProcess = false
              this.fileList = []
              this.canSubmit = true
            })
        }
      } else {
        fileBatchNo().then((res) => {
          jsonData.fileBatchNo = res.data
          let paramsData = {
            data: jsonData,
            fromSystem: 'web_H5',
            toSystem: 'mng_base_server',
            reqId: randomString(),
            reqTime: parseTime(new Date().getTime())
          }
          this.fileData.append('jsonData', JSON.stringify(paramsData))
          this.$refs.upload.submit()
          if (this.sizeLimit) {
            this.handleProgress()
            this.canSubmit = false
            this.$store
              .dispatch('airTransport/orderSave', {
                uri: '/order/manifest/upload',
                params: this.fileData
              })
              .then((res) => {
                this.processLength = 100
                this.showProcess = false
                this.fileList = []
                this.canSubmit = true
                if (res.data.code === 0) {
                  this.$message({
                    type: 'success',
                    message: '导入成功'
                  })
                  this.close('Confirm')
                }
              })
              .catch((err) => {
                clearInterval(this.interval)
                this.interval = null
                this.processLength = 0
                this.showProcess = false
                this.fileList = []
                this.canSubmit = true
              })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
</style>
