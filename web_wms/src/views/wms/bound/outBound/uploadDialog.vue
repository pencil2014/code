<template>
  <div>
    <el-dialog :before-close="handleCancel" :visible.sync="options.show" class="dialog" title="上传装货照片" :modal-append-to-body='false'
      width="750px">
      <el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini">
        <el-form-item label="装货照片：" prop="orderCustId" required>
          <UploadFile ref="uploadFile" :acceptTypes="['gif','jpg','jpeg','png','bmp']" :autoUpload=true :isShowFileList=false
            @sendFileData="getFileData">
          </UploadFile>
        </el-form-item>
        <el-form-item label=" ">
          <div v-for="(item, index) in formData.fileList" :key="item.fileNo" class="pic-box">
            <el-image :src="`/base/fileView/preview/${item.fileNo}/sowoll`" :preview-src-list="previewSrcList">
            </el-image>
            <div>
              <el-popconfirm title="确定删除该附件？" @onConfirm="deleteFile(index)">
                <el-link slot="reference" type="primary">删除</el-link>
              </el-popconfirm>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="handleUpload" size="mini" type="primary">上传</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UploadFile from '@/components/UploadFile/uploadFile'
import { uploadPic } from '@/api/wms/outBound.js'
export default {
  components: {
    UploadFile
  },
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      previewSrcList: [],
      formData: {
        outboundOrderId: '',
        fileList: []
      }
    }
  },
  created () {
    this.formData.outboundOrderId = this.options.id || ''
  },
  mounted () { },
  methods: {
    /**
     * @description: 解除文件异步上传成功后接口返回的参数
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-24 11:16:44
     */
    getFileData (data) {
      this.previewSrcList = []
      this.formData.fileList = data || []
      this.formData.fileList.forEach(item => {
        this.previewSrcList.push(`/base/fileView/preview/${item.fileNo}/sowoll`)
      })
    },
    /**
     * @description: 
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-26 17:55:09
     */
    handleUpload () {
      if (!this.formData.fileList.length) {
        this.$message.error("请上传装货照片！")
      } else {
        let data = JSON.parse(JSON.stringify(this.formData))
        console.log(`data.`, data.outboundOrderId);
        uploadPic(data).then(({ code }) => {
          if (code === 0) {
            this.$message.success("操作成功！")
            this.handleCancel()
            this.$emit("getData")
          }
        }).catch(() => { })
      }
    },
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:13:44
     */
    handleCancel () {
      this.options.show = false
    },
    /**
     * @description: 删除附件
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-02 14:03:43
     */
    deleteFile (index) {
      this.formData.fileList.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.pic-box {
  width: 120px;
  height: 140px;
  text-align: center;
  float: left;
}
/deep/ .el-image {
  width: 100px;
  height: 100px;
  margin: 10px;
}
</style>