<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createdItem" label-position="right" label-width="70px" class="fileList-upload-form">
      <el-form-item label="附件类型" prop="typeCode" required>
        <el-select v-model="createdItem.typeCode" placeholder="请选择附件类型" size="mini">
          <el-option v-for="(item, index) in typeCodeList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>  
      <el-form-item label="上传附件" prop="fileName" class="is-required">
        <el-upload
          ref="upload"
          drag
          class="upload-file-cont"
          action="#"
          :multiple="multiple"
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
    <div v-if="compareFilePopShow">
      <compareFileDialog :compareFileObj="compareFileObj"  @close="compareFileClose" />
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import compareFileDialog from '@/views/order/order/orderList/fileList/components/compareFileDialog.vue'
import { fileTypeList } from '@/api/base'

const defaultCreate = {
  fileName: '',
  typeCode: 'ls_booking'
}
export default {
  data() {
    return {
      dialogConfig: {
        title: '上传',
        show: true,
        size: 'medium',
        width: "460px"
      },
      canSubmit: true,  // 可提交标识

      multiple: true,
      defaultFileSize: 100,                             //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileList:[],
      fileData: '',
      showProcess:false,
      processLength:0,

      createdItem: Object.assign({}, defaultCreate),
      interval: null,
      typeCodeSelect: ['ls_booking', 'cust_booking'],
      typeCodeList: [],
      compareFilePopShow: false,
      compareFileObj: {},
    }
  },
  props: {
    orderNo: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getTypeCodeList()
  },
  mounted() {

  },
  computed: {
  },
  watch: {
  },
  components: {
    BaseDialog,
    compareFileDialog,
  },
  methods: {
    getTypeCodeList() {
      fileTypeList({ serviceCode: "book" })
      .then(res => {
        this.typeCodeList = (res.data || [])
        .filter(item => {
          return this.typeCodeSelect.includes(item.typeCode)
        })
        .map(item => {
          item['value'] = item.typeCode
          item['label'] = item.typeName
          return item
        })
      })
    },
    close(action) {
      this.$emit('close', action)
    },

    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: "error",
          message: "请上传附件",
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
      this.fileList = fileList
    },

    // 移除文件
    handleRemove(file,fileList) {
      this.fileList = fileList
    },

    uploadFile(file) {
      this.fileData.append('fileName', file.file);
      //this.file = file.file
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
    compareFileClose() {
      this.compareFilePopShow = false
      this.close('Confirm')
    },
    handleImport(done) {
      // 根据后台需求数据格式
      this.fileData = new FormData();
      this.fileData.append("orderNo", this.orderNo)
      this.fileData.append("typeCode", this.createdItem.typeCode);
      console.log(this.fileData)
      this.$refs.upload.submit()
      
      if (this.sizeLimit) {
        this.handleProgress()
        this.canSubmit = false
        this.$store.dispatch('user/import', {
          uri: '/order/shiporder/file/upload',
          params: this.fileData
        }).then(res => {
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
          if (res.data.code === 0) {
            if ((res.data.data || []).some(item => item.bkAttentionCheckStatus === 'fail')) {
              this.$message({
                type: 'warning',
                message: '请注意，该托书的“注意事项”的内容跟我司格式件里的不一致；若该托书是我司长期格式托书，建议跟客户核实，再重新上传。',
                duration: 5000,
                showClose: true
              })
              this.$store.dispatch('order/compareFile', { orderNo: this.$route.query.orderNo, fileNo: res.data.data[0].fileNo})
              .then(result => {
                this.compareFilePopShow = true
                this.compareFileObj = result
              })
              .catch(() => {
                this.close('Confirm')
              })
              return
            } else if ((res.data.data || []).some(item => item.bkAttentionCheckStatus === 'pass')) {
              this.$message.success('”注意事项“内容验证通过')
            } else {
              this.$message({
                type: 'success',
                message: '导入成功'
              })
            }
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
  }
};
</script>

<style lang="scss">
.fileList-upload-form{
  .el-form-item{
    margin-bottom: 4px;
    .el-form-item__label, .el-form-item__content{
      line-height: 20px;
    }
  }
}
</style>
