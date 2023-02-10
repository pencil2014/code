<template>
  <el-dialog :appendToBody="true" :visible.sync="option.show" title="上传合同附件" width="600px">
    <el-form
      :model="form"
      :rules="rules"
      class="settle-form"
      label-width="100px"
      ref="form"
      size="mini"
    >
      <el-form-item label="合同编号:" prop="contractNo">
        <!-- <el-input placeholder="请输入" v-model="form.contractNo"></el-input> -->
        <el-select placeholder="请选择" size="mini" v-model="form.contractNo">
          <el-option
            :key="item.contractNo"
            :label="item.contractNo"
            :value="item.contractNo"
            v-for="item in option.contractNoList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="flex-item" label="上传合同:">
        <div class="file-upload">
          <el-upload
            :auto-upload="true"
            :before-upload="getFile"
            :file-list="fileList"
            :http-request="handleImport"
            :limit="5"
            :multiple="true"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            action="#"
            class
            drag
            ref="upload"
          >
            <div class="file-box">
              <div class="icon">
                <img :src="require('@/assets/icon-upload.png')" class="icon-img" />
              </div>
              <div class="tips">
                <div class="txt-title">点击或将文件拖拽到这里导入</div>
                <p
                  class="txt-desc"
                >支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
              </div>
            </div>
          </el-upload>
          <el-progress :percentage="processLength" :stroke-width="2" v-show="showProcess"></el-progress>
        </div>
      </el-form-item>
    </el-form>
    <div class="dialog-footer" slot="footer">
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button @click="submit" size="mini" type="primary">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ContractFile',
  props: {
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        contractNo: ''
      },
      rules: {
        contractNo: {
          required: true,
          message: '合同编号必选',
          trigger: 'change'
        }
      },
      defaultFileSize: 100,
      sizeLimit: true,
      file: '',
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0
    }
  },
  created() {},
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (!this.fileListUpload.length) {
            return this.$msgErrClose('请先上传附件再提交')
          }
          const source = this.option.contractNoList.filter(
            item => item.contractNo === this.form.contractNo
          )[0]
          const { contractId, contractNo, custid } = source
          const data = this.fileListUpload.map(item => {
            const { name: fileName, fileNo } = item
            return {
              contractId,
              contractNo,
              custid,
              fileName,
              fileNo
            }
          })
          this.$emit('submit', data)
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 超出限制
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择上传5个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      const sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$msgErrClose('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.fileListUpload = this.fileListUpload.filter(
        item => item.uid !== file.uid
      )
    },
    handleImport() {
      this.handleProgress()
      const form = new FormData()
      form.append('file', this.file)
      const uid = this.file.uid
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        })
        .then(res => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            // this.$msgSucClose('上传成功!')
            this.fileListUpload.push(Object.assign({}, res.data.data, { uid }))
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
      }, 200)
    }
  }
}
</script>

<style lang="scss" scoped>
.settle-form {
  font-size: 12px;
  /deep/ .file-upload {
    background-color: #fff;
    padding: 0;
    .el-upload-dragger {
      width: 100%;
      font-size: 12px;
      padding: 2px 10px;
      .file-box {
        display: flex;
        align-items: center;
        text-align: left;
        .icon {
          margin-right: 10px;
          align-items: center;
          display: flex;
        }
      }
      .txt-title {
        color: #222222;
        line-height: 1.2;
        margin: 2px 0;
      }
      .txt-desc {
        color: #bfbfbf;
        line-height: 1.2;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
