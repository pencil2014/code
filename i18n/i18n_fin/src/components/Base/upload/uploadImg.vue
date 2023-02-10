<template>
<div>
  <el-upload
    action="#"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-change="afterUpload"
    :before-upload="beforeAvatarUpload"
    :http-request="httpRequest"
    :file-list="fileList"
    :on-remove="handleRemove"
    accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF">
    <i class="el-icon-plus"></i>
  </el-upload>
  <el-dialog :visible.sync="dialogVisible" class="imgViewDialog">
    <img width="100%" :src="dialogImageUrl" alt="">
  </el-dialog>
</div>
</template>

<script>
import {uploadFile} from '@/api/order/warehouse'
export default {
    data(){
      return {
        dialogImageUrl: '',
        dialogVisible: false,
        file: '',
        fileList: []
      }
    },
    props: {
      uploadConf: {}
    },
    methods: {
      handleRemove(file, fileList) {
        this.$emit('callBack', '')
        setTimeout(function(){
          document.getElementsByClassName("el-upload")[0].style.display="block"
        }, 500)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      beforeAvatarUpload(file) {
        this.file = file
        // const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 5;

        // if (!isJPG) {
        //   this.$message.error('上传仓位图只能是 JPG、PNG、 格式!');
        // }
        if (!isLt2M) {
          this.$message.error('上传仓位图大小不能超过 5MB!');
        }
        return isLt2M;
      },
      afterUpload(file, fileList) {
        this.fileList = fileList
        document.getElementsByClassName("el-upload")[0].style.display="none"
      },
      httpRequest() {
        // 根据后台需求数据格式
        const form = new FormData();
        // 文件对象
        form.append("fileName", this.file)
        this.$store.dispatch('user/import', {
          uri: '/order/warehouse/uploadFile',
          params: form
        }).then(res => {
          this.fileList[0].url = "/base/webapi/file/preview?fileNo=" + res.data.data.fileNo
          this.$emit('callBack', res.data.data)
        }).catch(res => {
          this.fileList = []
          this.$emit('callBack', '')
          document.getElementsByClassName("el-upload")[0].style.display="block"
          this.$message({
            message: '上传失败',
            type: 'warning'
          });
        })
      }
    }
}
</script>
<style lang="scss">
.imgViewDialog{
  .el-dialog__header{
    padding: 0;
  }
}
</style>