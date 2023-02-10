<template>
  <div>
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right"  class="create-form">    
        <div class="info-txt">
          <b>上传文件说明：</b><br/>
          1.下载Excel模板后，请按照模板说明进行操作；<br/>
          2.红色表头表示该项为必输项，请阅读后输入；<br/>
          3.将您的数据输入在Excel文件中，然后上传该Excel；<br/>
          4.上传的文件大小不能超过{{defaultFileSize}}M；
        </div>
        <div class="mb20">
          <span class="create-item-label">下载默认模板</span>
          <el-button type="default" size="mini" @click="handleDownload">集装箱导入模板</el-button>
        </div>
        <el-form-item label="" prop="fileName" class="is-required">
          <el-upload
            ref="upload"
            drag
            class="upload-file-cont"
            action="#"
            :multiple="false"
            :auto-upload="false"
            :before-upload="getFile"
            :on-change="handleChangeFile"
            :on-remove="handleRemove"
            :http-request="handleImport"
            :file-list='fileList'
            accept=".xls, .xlsx"
            :disabled="!canSubmit"
            >
              <div class="file-upload">
                <img class="file-upload-img" :src="require('@/assets/icon-upload.png')"/>
                <div class="file-upload__text">
                  <div class="txt">点击或将文件拖拽到这里导入</div>
                  <p class="info">支持 xls、xlsx格式文件，且文件大小限制在{{defaultFileSize}}M内</p>
                </div>
              </div>
            </el-upload>
            <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import Cookies from 'js-cookie'
import BaseDialog from '@/components/Base/Dialog/index'
import {orderFileTempDownload} from '@/api/order/list'

const defaultCreate = {
  orderNo: '',
  fileName: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '导入集装箱',
        show: true,
        size: 'medium',
        width: "540px"
      },
      canSubmit: true,    // 可提交标识
      defaultFileSize: 100,                             //文件默认不超过3M   
      sizeLimit: true,
      file: '',
      fileList:[],
      showProcess:false,
      processLength:0,
      rules: {
        // fileName: [{required: true, message: '请上传', trigger: 'on-change'}],
      },
      createdItem: Object.assign({}, defaultCreate),
      interval: null
      // img: {
      //   uploadIcon: require('@/assets/icon-upload.png')
      // }
    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
    // this.getBusinessType()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),  
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: 'error',
          message: '请上传文件',
          duration: 1000,
          onClose: () => {
          }
        })
        return false
      }
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (!this.validate() || !this.canSubmit) return 
        this.$refs.upload.submit(done)
      } else {
        this.close('Cancel')
      }
    },

    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
      if (!this.sizeLimit) {
          this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
      }
      return this.sizeLimit;
    },

    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = []
      this.fileList.push(file)
    },

    handleRemove(file, fileList) {
      this.fileList = fileList
    },

    handleImport(done) {
      // 根据后台需求数据格式
      const form = new FormData();
      // 文件对象
      form.append("fileName", this.file);
      form.append("orderNo", this.$route.query.orderNo);
      this.$route.query.jointNo && form.append("jointNo", this.$route.query.jointNo);
      
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store.dispatch('user/import', {
          uri: '/order/shiporder/container/import',
          params: form
        }).then(res => {
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '导入成功'
            })
            this.close('Confirm', res.data.data)
          }
        }).catch(err => {
          clearInterval(this.interval)
          this.interval = null
          this.processLength=0
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
        })
      }
    },

    // 上传进度条
    handleProgress(file, fileList){
      this.processLength=0
      this.showProcess=true
      this.interval=setInterval(()=>{
        if(this.processLength>=99){
          clearInterval(this.interval)
          return 
        }
        this.processLength+=1
      },200)
    },

    // 模板下载
    handleDownload() {
      this.$store.dispatch('order/downloadBlobFile', {
        uri: '/order/shiporder/file/temp/download',
        params: {
          folder: 'excel',
          fileName: 'container_temp.xlsx'
        }
      }).then(res => {
        console.log(res);
        let link = document.createElement("a")
        link.href = window.URL.createObjectURL(res);
        link.download = "集装箱导入模板.xlsx"
        link.click()
      })
    }
  }
};
</script>

<style lang="scss">
.info-txt{
  margin-bottom: 20px;
  font-size: 12px;
  line-height: 24px;
}
.mb20{
  margin-bottom: 20px;
}
.create-item-label{
  font-size: 12px;
  margin-right: 10px;
}
</style>
