<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createItem" :rules="rules" label-position="right" label-width="80px" class="create-form">    
      <el-form-item label="签约时间" prop="signTime">
        <elDatePickerLimit size="mini"
          v-model="createItem.signTime"
          type="datetime"
          style="width: 100%"
          clearable
          placeholder="请选择签约时间"
          value-format="yyyy-MM-dd HH:mm:ss" />
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
          :http-request="handleImport"
          :file-list='fileList'
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
  fileName: '',
  signTime: ''
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
        width: "500px"
      },
      canSubmit: true,    // 可提交标识
      defaultFileSize: 100,                             //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileList:[],
      showProcess:false,
      processLength:0,
      rules: {
        signTime: [{required: true, message: ' ', trigger:'change'}]
      },
      createItem: Object.assign({}, defaultCreate),
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
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
            this.$refs.upload.submit(done)
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
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleImport(done) {
      // 根据后台需求数据格式
      const form = new FormData();
      // 文件对象
      form.append("file", this.file)
      
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store.dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        }).then(res => {
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
          if (res === 'error') return
          let {fileNo, name} = res.data.data
          this.$message({
            type: 'success',
            message: '上传成功',
            duration: 1000,
            onClose: () => {
              this.close('Confirm', {
                signTime: this.createItem.signTime,
                signFile: fileNo,
                signFileNo: fileNo,
                signFileName: name
              })
            }
          })
        })
      }
    },

    // 上传进度条
    handleProgress(file, fileList){
      this.processLength=0
      this.showProcess=true
      const interval=setInterval(()=>{
        if(this.processLength>=99){
          clearInterval(interval)
          return 
        }
        this.processLength+=1
      },200)
    },
  }
}
</script>
<style lang="scss">
</style>