<template>
  <div>
    <el-upload
      style="width:100%"
      ref="upload"
      drag
      action="#"
      :accept="accept"
      :limit="limit"
      :on-exceed="handleExceed"
      :multiple="true"
      :auto-upload="autoUpload"
      :before-upload="getFile"
      :on-change="handleChangeFile"
      :on-remove="handleRemove"
      :http-request="handleImport"
      :file-list="fileList"
    >
      <div class="file-upload">
        <img class="file-upload-img" src="@/assets/icon-upload.png" />
        <div class="file-upload__text">
          <div class="txt">点击或将文件拖拽到这里导入</div>
          <p class="info">支持 {{ this.comTypes }} 格式文件， 且文件大小限制在{{this.defaultFileSize}}M内</p>
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
    autoUpload: { type: Boolean, default: false },
    uploadApi: { type: String, default: '' },
    uploadParams: { type: Object, default: () => ({}) },
    // width: { type: Number, default: 645 },
    limit: { type: Number, default: 10 },
    acceptTypes: {
      type: Array,
      default: () => ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'image', 'txt', 'zip', 'rar','mp4','mkv','wmv','avi'],
    },
    accept: { type: String, default: '' },
  },
  data() {
    return {
      file: null,
      fileList: [],
      resFileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 100,
    }
  },
  computed: {
    comTypes() {
      return this.acceptTypes.join('、')
    },
  },
  methods: {
    handleExceed(files, fileList) {
      this.$message.error(`只能选择 ${this.limit} 个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.file = file
      let name = file.name
      let type = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
      console.log(file)
      console.log(this.acceptTypes, type)
      if (!this.acceptTypes.includes(type)) {
        fileList.pop()
        this.$msgErrClose('不支持上传此格式的文件！')
      }
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        fileList.pop()
        this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      this.fileList = fileList
      this.$emit('getFile', fileList)
      // this.fileList = []
      // this.fileList.push(file)
    },
    handleRemove(file, fileList) {
      let index = fileList.findIndex((item) => {
        return (item.uid = file.uid)
      })
      this.resFileList.splice(index, 1) // 删除对应的fileId
      this.fileList = fileList
      this.$emit('getFile', fileList)
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
          // let {data} = res.data
          // this.createUploadItem.dangerousDeclareFileList = []

          // Object.assign(this.createUploadItem, {
          //   dangerousDeclareFileList: data
          // })
          // data.forEach(item => {
          //   this.createUploadItem.dangerousDeclareFileList.push({fileNo: item})
          // })
          if (res.data.code === 0) {
            if (res.data.data) {
              this.resFileList.push(res.data.data)
            }
            this.$message({
              type: 'success',
              message: '上传成功',
              duration: 1000,
            })
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
      }, 60)
    },
    // 新添加文件替换之前添加的文件
    // handleChangeFile(file, fileList) {
    //   this.fileList = []
    //   this.fileList.push(file)
    // },
  },
}
</script>
