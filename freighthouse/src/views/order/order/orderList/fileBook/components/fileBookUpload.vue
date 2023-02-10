<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :rules="rules" :model="createdItem" label-position="right" label-width="0" class="create-form">    
      <el-form-item label="" prop="fileName" class="is-required">
        <el-upload
          ref="upload"
          drag
          class="upload-file-cont"
          action="#"
          :auto-upload="false"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="uploadFile"
          :file-list='fileList'
          :disabled="!canSubmit"
          >
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
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {baseBusinessList} from '@/api/base'

const defaultCreate = {
  orderNo: '',
  custid: "",
  fileName: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '托书上传',
        show: true,
        width: "560px"
      },

      defaultFileSize: 100,                             //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileData: '',
      fileList:[],
      showProcess:false,
      processLength:0,

      createdItem: Object.assign({}, defaultCreate),
      rules: {
        // fileName: [{required: true, message: '请上传'}],
      },
      canSubmit: true,  // 可提交标识
      interval: null
    }
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    // this.getBusinessType()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
    }),  
  },
  watch: {
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
          type: "error",
          message: "请上传托书",
          duration: 1000,
          onClose: () => {}
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
            this.handleImport()
          } else {
            console.log('error submit!!');
            return false;
          }
        })
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

    uploadFile(file) {
      this.fileData.append('fileName', file.file);
      //this.file = file.file
    },

    handleImport(done) {
      // 根据后台需求数据格式
      this.fileData = new FormData();
      // 文件对象
      // form.append("fileName", this.file)
      this.fileData.append("orderNo", this.orderNo || this.oQuery.orderNo)
      this.fileData.append("custid", this.orderInfo.custid)
      this.$refs.upload.submit()
      
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store.dispatch('user/import', {
          uri: '/order/shiporder/file/book/upload',
          params: this.fileData
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
            this.close('Confirm')
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
    }
  }
};
</script>

<style lang="scss">

</style>
