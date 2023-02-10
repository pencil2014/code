<template>
  <!-- 区别于finDialog，主要是应用于接口上传的文件是字节流，不是fileNo -->
  <el-dialog :title="option.title" :visible.sync="option.show" width="500px">
    <el-form
      :model="option.form"
      :rules="option.rules"
      ref="ruleForm"
      size="mini"
      label-width="150px"
    >
      <el-form-item :label="$t('PayApplyList.payAccountName')" prop="payName">
        <el-input v-model="option.form.payName" :placeholder="$t('Common.plEnter')" size="mini" clearable></el-input>
      </el-form-item>
      <el-form-item :label="$t('Supplier.originalFile')" v-if="option.oldFile&&option.oldFile.fileName">
        <el-button @click="openOldFile" size="mini" type="text">{{option.oldFile.fileName}}</el-button>
      </el-form-item>
      <el-form-item prop="file" :label="$t('Supplier.uploadFile')" v-if="option.show">
          <!-- :acceptTypes="['doc','docx','pdf','jpg','jpeg','png']" -->
        <UploadFile
          :limit="1"
          @getFile="getFile"
        ></UploadFile>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="submitForm('ruleForm')" size="mini" type="primary" >{{$t('Common.sure')}}</el-button>
      <el-button size="mini" @click="showDialog(false)">{{$t('Common.cancel')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import UploadFile from './uploadFile.vue'

export default {
  name: 'finFileDialog',
  components: {
    UploadFile,
  },
  props: {
    option: { type: Object, default: () => ({}) },
  },
  methods: {
    showDialog(flag) {
      this.option.show = flag
      this.dialVmN()
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) return
        this.showDialog(false)
        this.$emit('close', true)
      })
    },
    getFile(fileList) {
      this.option.form.file = fileList[0] ? fileList[0].raw : ''
      console.log(this.option.form)
      // this.$emit('getFile', fileList)
    },
    openOldFile() {
      window.open(this.getDownloadPath(this.option.oldFile.fileNo))
    },
    dialVmN() {
			let VMODAL = document.querySelector('body > .v-modal');if (VMODAL) { VMODAL.style.display = 'none' }
		},
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding: 20px 20px 10px 20px;
    .el-form-item {
      // display: flex;
      margin: 0 !important;
      margin-bottom: 4px !important;
      .upload-file-cont {
        width: 100% !important;
      }
    }
    .el-form-item__content {
      flex: 1 1 auto;
      & > div {
        width: 100%;
      }
    }
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
}
</style>