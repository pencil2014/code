<!--
 * @Description: 导入年度计划弹框
 * @Autor: yinjunying
 * @Date: 2022-06-01 16:09:40
-->
<template>
  <div class="import-box">
    <el-dialog title="导入数据" :append-to-body="true" :visible.sync="options.show" width="600px" :before-close="cancel"
      :modal-append-to-body='false' style="margin: 15vh auto 0 !important;">
      <div>
        <el-upload ref="upload" drag class="upload-file-cont" :accept="accept" action="#" :limit="limit" :on-exceed="handleExceed"
          :multiple="false" :auto-upload="false" :on-change="handleChangeFile" :file-list="fileList" :on-remove="handleRemove">
          <div class="file-upload">
            <img class="file-upload-img" src="@/assets/icon-upload.png" />
            <div class="file-upload__text">
              <div class="txt">点击或将文件拖拽到这里导入</div>
              <p class="info">支持 {{ comTypes }}格式文件， 且文件大小限制在{{ defaultFileSize }}M内</p>
            </div>
          </div>
        </el-upload>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="4"></el-progress>
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button size="mini" type="primary" :loading="importLoading" @click="handleImport">导入
        </el-button>
        <el-button size="mini" @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      file: null,
      limit: 1,
      accept: ".xls, .xlsx, .XLS, .XLSX",
      acceptTypes: ['xls', 'xlsx', 'XLS', 'XLSX'],
      defaultFileSize: 10,
      showProcess: false,
      processLength: 0,
      fileList: [],
      importLoading: false,
    }
  },
  computed: {
    comTypes () {
      return this.acceptTypes.join('、')
    },
  },
  methods: {
    /**
     * @description: 上传文件超过限制数量回调
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-02 15:41:09
     */
    handleExceed () {
      this.$msgErrClose(`只能选择 ${this.limit} 个文件！`)
    },
    /**
     * @description: 文件状态改变时的钩子
     * @param {*} file
     * @param {*} fileList
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-02 15:41:38
     */
    handleChangeFile (file, fileList) {
      let name = file.name
      let type = name.slice(name.lastIndexOf('.') + 1)
      let curType = type.toLowerCase();
      let isAllow = this.acceptTypes.includes(curType)
      if (!isAllow) {
        fileList.splice(-1, 1)
        return this.$msgErrClose('不支持上传此格式的文件！')
      }
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        fileList.splice(-1, 1)
        return this.$msgErrClose('上传文件大小超过' + this.defaultFileSize + 'M限制！')
      }
      if (file.raw.size === 0) {
        fileList.splice(-1, 1)
        return this.$msgErrClose(`上传文件内容不能为空！`);
      }
      this.fileList = fileList
    },
    /**
     * @description: 删除文件回调
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-02 17:07:20
     */
    handleRemove () {
      this.fileList = []
    },
    /**
     * @description: 导入数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-01 16:48:31
     */
    handleImport () {
      if (!this.fileList.length) return this.$msgErrClose(`附件不能为空！`)
      this.handleProgress()
      this.importLoading = true
      const form = new FormData()
      form.append('file', this.fileList[0].raw)
      this.$store
        .dispatch('user/import', {
          uri: '/crm/yearlyPlan/import',
          params: form,
        })
        .then((res) => {
          let { data, code } = res.data
          if (code === 0) {
            if (data && data.length) {
              this.$emit('sendPortData', data)
            }
            this.$message({
              type: 'success',
              message: '上传成功',
              duration: 1000,
            })
            this.cancel()
          } else {
            this.$msgErrClose('上传失败！')
          }
        }).catch(() => { })
        .finally(() => {
          this.processLength = 100
          this.showProcess = false
          this.importLoading = false
        })
    },
    /**
     * @description: 上传进度条
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-02 15:42:39
     */
    handleProgress () {
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
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-01 16:14:51
     */
    cancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
.el-dialog {
  margin: 30vh auto 0 !important;
}
</style>