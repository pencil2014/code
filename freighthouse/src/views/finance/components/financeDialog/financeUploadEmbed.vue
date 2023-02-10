<template>
  <div>
    <el-upload
      ref="upload"
      drag
      class="upload-file-cont"
      :accept="accept"
      action="#"
      :limit="limit"
      :on-exceed="handleExceed"
      :multiple="true"
      :auto-upload="true"
      :before-upload="getFile"
      :on-remove="handleRemove"
      :http-request="handleImport"
      :file-list="fileList"
    >
      <div class="file-upload">
        <img class="file-upload-img" src="@/assets/icon-upload.png" />
        <div class="file-upload__text">
          <div class="txt">点击或将文件拖拽到这里导入</div>
          <p class="info">支持 {{this.comTypes}} 格式文件， 且文件大小限制在{{this.defaultFileSize}}M内</p>
        </div>
      </div>
    </el-upload>
    <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
  </div>
</template>
<script>
export default {
  name: 'financeUploadEmbed',
  props: {
    uploadApi: { type: String, default: '' },
    limit: { type: Number, default: 10 },
    acceptTypes: {
      type: Array,
      default: () => ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'],
    },
    accept: { type: String, default: '' },
    value: { type: Array, default: () => [] },
  },
  watch: {
    value: {
      handler(val) {
        // console.log('--------------')
        // console.log(val)
        if (!val.length) this.fileList.splice(0, 100)
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      file: null,
      showProcess: false,
      processLength: 0,
      defaultFileSize: 100,
      fileList: [],
    }
  },
  computed: {
    comTypes() {
      return this.acceptTypes.join('、')
    },
  },
  methods: {
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择 ${this.limit} 个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      let name = file.name
      let type = name.slice(name.lastIndexOf('.') + 1)
      if (!this.acceptTypes.includes(type)) {
        this.$msgErrClose('不支持上传此格式的文件！')
        return false
      }
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$msgErrClose('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    handleRemove(file, fileList) {
      let index = fileList.findIndex((item) => (item.uid = file.uid))
      this.value.splice(index, 1) // 删除对应的fileId
      this.$emit('sendFileList', this.value)
      // console.log(index)
      // console.log(fileList)
      // console.log(this.value)
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
          if (res.data.code !== 0) return this.$msgErrClose('上传失败！')
          this.value.push(res.data.data)
          this.$emit('sendFileList', this.value)
          this.processLength = 100
          this.showProcess = false
          this.$message({
            type: 'success',
            message: '上传成功',
            duration: 1000,
          })
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
  },
}
</script>