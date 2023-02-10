<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="70px" class="create-form">    
      <el-form-item label="附件类型" prop="typeCode">
        <el-select size="mini" placeholder="请选择" v-model="createdItem.typeCode" clearable filterable>
          <el-option v-for="(item, index) in attachmentList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传附件">
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
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  orderNo: '',
  intrustNo: '',
  fileName: '',
  blId: '',
  typeCode: ''
}

export default {
  filters: {
  },
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '附件上传',
        show: true,
        size: 'medium',
        width: "460px"
      },
      canSubmit: true,    // 可提交标识
      defaultFileSize: 100,                             //文件默认不超过3M   
      sizeLimit: true,
      file: '',
      fileList:[],
      fileData: '',
      showProcess:false,
      processLength:0,
      rules: {
        typeCode: [{required: true, message: '请选择附件类型', trigger:'change'}]
      },
      createdItem: Object.assign({}, defaultCreate),
      interval: null
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    },
    attachmentList: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  components: {
    BaseDialog
  },
  watch: {
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: 'error',
          message: '请先上传附件',
          duration: 1000,
          onClose: () => {}
        })
        return false
      }
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.uploadFileForm.validate(valid => {
          if (valid) {
            if (!this.validate() || !this.canSubmit) return 
            // this.$refs.upload.submit(done)
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
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
      if (!this.sizeLimit) {
          this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
      }
      return this.sizeLimit;
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      // this.fileList = fileList
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
      this.fileData.append("orderNo", this.oQuery.orderNo)
      this.oQuery.jointNo && this.fileData.append("jointNo", this.oQuery.jointNo)
      this.fileData.append("intrustNo", this.param.intrustNo)
      this.fileData.append("blId", this.param.blId)
      this.fileData.append("typeCode", this.createdItem.typeCode)
      console.log(this.fileData)
      this.$refs.upload.submit()

      // const form = new FormData();
      // // 文件对象
      // form.append("fileName", this.file)
      // form.append("intrustNo", this.param.intrustNo)
      // form.append("blId", this.param.blId)
      // form.append("typeCode", this.createdItem.typeCode)
      // form.append("orderNo", this.oQuery.orderNo)
      // form.append("jointNo", this.oQuery.jointNo)
      
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store.dispatch('user/import', {
          uri: '/order/shipping/bv/file/upload',
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
    },
  }
}
</script>
<style lang="scss" scoped>
.create-form{
	/deep/ .el-form-item {
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label{
		line-height: 20px;
	}
	/deep/ .el-form-item__content{
		line-height: 20px;
	}
}
</style>