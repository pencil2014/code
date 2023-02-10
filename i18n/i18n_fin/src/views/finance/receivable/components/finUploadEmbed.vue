<template>
  <div style="height: 20px;" :style="{width: width + 'px'}">
    <el-upload
      ref="upload"
      drag
      :accept="accept"
      action="#"
      :limit="limit"
      :on-exceed="handleExceed"
      :multiple="true"
      :auto-upload="autoUpload"
      :on-change="handleChangeFile"
      :on-remove="handleRemove"
      :http-request="handleImport"
      :file-list="fileList"
    >
      <el-input style="width:100%;"></el-input>
    </el-upload>
    <el-progress
      style="margin-top: -20px;"
      :style="{width: width + 'px'}"
      v-show="showProcess"
      :percentage="processLength"
      :stroke-width="2"
    ></el-progress>
  </div>
</template>
<script>
// 如果是自动上传，需要fileNo, name等数据，可以使用@send-res-file-list接收一个相关数据的数组，
// 如果是非自动上传，需要使用file的情况，可以使用@send-file-list接收file的数组。
export default {
  name: 'financeUploadEmbed',
  props: {
    uploadApi: {
      type: String,
      default: '/base/webapi/file/upload',
    },
    uploadParams: {
      // 可选
      type: Object,
      default: () => ({}),
    },
    limit: {
      // 可选
      type: Number,
      default: 1,
    },
    width: {
      // 可选
      type: Number,
      default: 162,
    },
    accept: {
      type: String,
      // default: '.pdf, .png, .jpg, .jpeg, .JPG, .JPEG, .PNG, .PDF',
      default: '',
    },
    fileListEdit: {
      type: Array,
      default: () => [],
    },
    acceptSelf: {
      // 增加acceptSelf是为了不使用accept，因为之前大多未设置accept，保持体验的一致
      type: String,
      default: '',
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      file: null,
      fileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 5,
    }
  },
  created() {},
  methods: {
    handleExceed(files, fileList) {
      let text = this.$t('Settle.onlyfiles', {limit: this.limit})
      this.$message.error(text)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        let text = this.$t('Settle.uploadfile', {size: `${this.defaultFileSize}M`})
        this.$message.error(text)
      }
      let isAccept = true
      const accept = this.acceptSelf || this.accept
      console.log(file);
      if (accept) {
        let fileType = file.type.split('/').pop()
        isAccept = accept.includes(fileType)
        if (!isAccept) {
          this.$message.error(this.$t('Settle.formatTips'))
        }
      }
      return sizeLimit && isAccept
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = fileList
      if (file.status === 'ready') {
        // 如果添加文件，不符合条件的文件删除
        if (!this.getFile(file.raw)) {
          let index = fileList.findIndex((item) => {
            return item === file
          })
          fileList.splice(index, 1)
        }
      }
    },
    handleRemove(file, fileList) {
      this.fileList = []
      this.$emit('send-file-list', {})
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
          if (res.data.code === 0) {
            if (res.data.data) {
              this.$emit('send-file-list', res.data.data)
            }
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
    },
    // 新添加文件替换之前添加的文件
    // handleChangeFile(file, fileList) {
    //   this.fileList = []
    //   this.fileList.push(file)
    // },
  },
}
</script>
<style lang='scss' scoped>
/deep/ {
  .el-icon-upload-success {
    display: none;
  }
  .el-upload-list__item:first-child {
    margin-top: -24px;
    padding-left: 8px;
  }
}
</style>