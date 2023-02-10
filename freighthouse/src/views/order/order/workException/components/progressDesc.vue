<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="progress-desc-form">    
      <el-form-item label="跟进时间" prop="followTime" :show-message="false">
        <elDatePickerLimit size="mini"
          v-model="createItem.followTime"
          type="datetime"
          style="width: 100%"
          clearable
          placeholder="请选择"
          value-format="yyyy-MM-dd HH:mm:ss" />
      </el-form-item>
      <el-form-item label="进展描述" prop="progressDesc" :show-message="false">
        <el-input type="textarea" size="mini" v-model="createItem.progressDesc" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="上传附件">
        <FileUploadCom :config="uploadConfig" :fileNos="createItem.files" @upload="handleUpload" ref="progressUpload"/>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import FileUploadCom from './fileUploadCom'

import {workExceptionSaveProgress} from '@/api/order/workException'


export default {
  data() {
    return {
      dialogConfig: {
        title: '进展描述',  
        show: true,
        size: 'medium',
        width: '500px'
      },
      
      rules: {
        followTime: [{required: true, message: '请选择跟进时间', trigger: 'change'}],
        progressDesc: [{required: true, message: '请输入进展描述', trigger: 'change'}]
      },

      uploadConfig: {
        apiUrl: '/order/shipping/workException/uploadFile',
        multiple: true,
        autoUpload: false
      },

    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
  },
  watch: {
  },
  components: {
    BaseDialog,
    FileUploadCom
  },
  methods: {
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.handleSave(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    close(action) {
      this.$emit('close', action)
    },

    // 上传文件
    handleUpload(data) {
      console.log(data);
      // Object.assign(this.createItem, {files: data})
    },

    // 保存
    handleSave(done) {
      // if (!this.createItem.files|| !this.createItem.files.length) {
      //   return this.$message.error('请上传附件')
      // }
      Object.assign(this.createItem, {
        files: this.$refs.progressUpload.fileNosList
      })
      workExceptionSaveProgress(this.createItem).then(res => {
        this.$message({
          type: 'success',
          message: '保存成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    }
  }
};
</script>

<style lang="scss">
.progress-desc-form{
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
