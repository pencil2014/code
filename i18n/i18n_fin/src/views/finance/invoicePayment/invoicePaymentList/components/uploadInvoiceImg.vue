<template>
<div>
  <el-dialog
    :title="uploadTitle"
    :visible.sync="showUploadIn"
    @close="closeUpload"
    class="pay_self__css"
    width="600px" height="600px">
    <div >
        <el-form :model="upload" ref="upload">
            <el-form-item>
                <el-upload
                style="width:100%;"
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
                :accept="acceptTypes"
                >
                <div class="file-upload">
                    <img class="file-upload-img" src="@/assets/icon-upload.png" />
                    <div class="file-upload__text">
                    <div class="txt">{{$t('BillList.clickToImport')}}</div>
                    <p class="info">支持 {{ this.acceptTypes }} 格式文件， 且文件大小限制在{{this.defaultFileSize}}M内</p>
                    </div>
                </div>
                </el-upload>
                <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
            </el-form-item>
        </el-form>
        <slot></slot>
        <el-link  v-show="uploadTitle === '上传发票查验件' " type="primary" target="_blank" href="https://inv-veri.chinatax.gov.cn/index.html" style="font-size: 12px;">国家税务总局发票查验平台</el-link>
        <div class="download-model" v-show="uploadTitle === '上传发票信息' ">
          <el-link type="primary" @click="stockDownload">下载模板</el-link>
      </div>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :loading='loading' @click="uploadAction" size="mini">{{$t('Common.sure')}}</el-button>
      <el-button @click="closeUpload" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import { Message } from 'element-ui'
import { uploadInvoiceImg, batchImport, uploadCheckInvoiceImg } from '@/api/fin/invoicePayment'
export default {
  props: {
    uploadTitle: {
      type: String,
      default: '批量上传发票'
    },
    autoUpload: { type: Boolean, default: false },
    uploadApi: {
      type: String,
      default: ''
    },
    showUpload: {
      type: Boolean,
      default: false
    },
    uploadParams: {
      type: Object,
      default: () => ({})
    },
    acceptTypes: {
      type: String,
      default: '.xls, .xlsx',
    },
    limit: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      errorFile: {},
      showUploadIn: false,
      upload: {},
      file: null,
      fileList: [],
      resFileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 50,
      fileName:[],
      loading:false
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
      let name = file.name
      let type = name.slice(name.lastIndexOf('.') + 1)
      console.log(file)
      console.log(this.acceptTypes, type)
      // if (![ 'PDF', 'JPG', 'PNG', 'JPEG','pdf', 'jpg', 'png', 'jpeg'].includes(type)) {
      //   fileList.pop()
      //   this.$msgErrClose('不支持上传此格式的文件！')
      // }
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
          // let {data} = res.data
          // this.createUploadItem.dangerousDeclareFileList = []

          // Object.assign(this.createUploadItem, {
          //   dangerousDeclareFileList: data
          // })
          // data.forEach(item => {
          //   this.createUploadItem.dangerousDeclareFileList.push({fileNo: item})
          // })
          if (res.data.code === 0) {
            if (res.data.data) {
              this.resFileList.push(res.data.data)
            }
            this.$message({
              type: 'success',
              message: this.$t('BillList.uploadSuccess'),
              duration: 1000,
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
      }, 60)
    },

    
    
    uploadAction() {
      if (this.fileList.length === 0) {
        this.$message({
          type: 'error',
          message: '未选择文件，不能上传!',
          showClose: true
        })
        return
      }
      if(this.uploadTitle === '上传发票信息'){
        this.handleBatchImport()
      }
      if(this.uploadTitle === '上传发票附件'){
        this.handleUpload()
      }
      if(this.uploadTitle === '上传发票查验件'){
        this.handleUploadCheckInvoiceImg()
      }
    },
    handleUploadCheckInvoiceImg(){
      console.log(this.uploadParams.invoicePaymentIdList);
      const form = new FormData()
      const fileName = this.fileList.map((item) => item.raw)
      fileName.forEach((item, index) => form.append('fileNames', item))
      if(this.uploadParams && this.uploadParams.invoicePaymentIdList && this.uploadParams.invoicePaymentIdList.length){
        form.append('invoicePaymentIdList', this.uploadParams.invoicePaymentIdList)
      }
      this.loading = true
      uploadCheckInvoiceImg(form).then(res=>{
          this.$message({
            type: 'success',
            message: this.$t('BillList.uploadSuccess'),
            duration: 1000,
          })
          this.closeUpload()
      }).finally(()=>{
          this.loading = false
      })
    },
    handleUpload(file) {
        const form = new FormData()
        const fileName = this.fileList.map((item) => item.raw)
        fileName.forEach((item, index) => form.append('fileNames', item))
        this.loading = true
        uploadInvoiceImg(form).then(res=>{
            this.$message({
              type: 'success',
              message: '批量上传成功',
              duration: 1000,
            })
            this.closeUpload()
        }).finally(()=>{
            this.loading = false
        })
    },
    handleBatchImport(){
      const form = new FormData()
      const fileName = this.fileList.map((item) => item.raw)
      fileName.forEach((item, index) => form.append('importExcel', item))
      this.loading = true
      batchImport(form).then(res=>{
          // if(res.data.length){
          //   for (let i = 0; i < res.data.length; i++) {
          //     this.$message({ message: res.data[i].failReason, type: 'error', showClose: true })
          //   }
          // }else{
          //   this.$message({
          //     type: 'success',
          //     message: '批量上传成功',
          //     duration: 1000,
          //   })
          // }
          this.sendResUpload(res)
          this.closeUpload()
      }).finally(()=>{
          this.loading = false
      })
    },
    sendResUpload(data) {
      if (data) {
        this.errorFile = data.data.errorFile
        const h = this.$createElement
        let message
        if (data.data.errorFile) {
          message = h('div', { style: 'text-align:center;padding:10px 0' }, [
            h('i', { class: 'el-icon-warning', style: 'display: inline-block;font-size: 38px;color:#CD4130' }, ''),
            h('p', null, '数据导入异常，请检查数据？ '),
            h('p', null, data.data.resultMsg),
            h('a', { style: 'color: #3E80F5;text-decoration:underline;', on: { click: this.onSendResUpload } }, '下载异常数据'),
          ])
        } else {
          message = h('div', { style: 'text-align:center;padding:16px 0' }, [
            h('i', { class: 'el-icon-success', style: 'display: inline-block;font-size: 38px;color:#33B18A' }, ''),
            h('p', null, data.data.resultMsg),
          ])
        }
        this.$msgbox({ title: '', message, showCancelButton: false, confirmButtonText: '关闭' })
          .then((action) => {})
          .catch((err) => {})
      }
    },
    //下载失败
    onSendResUpload() {
      let fileNo = this.errorFile.fileNo
      let name = this.errorFile.name
      this.$store.dispatch('order/downloadBlobFile', { uri: '/base/webapi/file/download', params: { fileNo } }).then((res) => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = name
        link.click()
      })
    },
    //取消按钮
    closeUpload() {
      this.fileList = []
      this.showUploadIn =false
      this.$emit('close-upload')
    },
    stockDownload() {
      this.$store
        .dispatch('finance/downloadBlobFile', {
          uri: '/base/webapi/file/downloadDataImportTemplate?templateType=invoice_payment_import_template',
          params: {},
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '批量上传发票模板.xlsx'
          link.click()
        })
      // stockDownload({ folder: 'excel', FileName: 'so_import_temp.xlsx' }).then((res) => {})
    },
  },
  watch: {
    showUpload(newVal) {
      this.showUploadIn = newVal
    },
    // showUploadIn(newVal) {
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
<style lang="scss" scoped>
.receivable-file-upload{
    display: flex;
    justify-content: center;
}

.pay_self__css {
  /deep/ .el-dialog__body {
    padding: 10px 20px;
  }
  /deep/ .file-upload{
    padding-bottom: 30px !important;
  }
}
</style>