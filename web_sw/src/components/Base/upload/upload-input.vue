<template>
  <div class="upload-input-box" :class="{'upload-disabled':disabled,'upload-is-not-disabled':!disabled}">
    <div class="upload-label" @click="uploadAction">
      <div class="placeholder-text" v-show="!fileName">请选择{{accept.join(',')}}文件</div>
      <div class="placeholder-text" v-show="fileName" @click="outUploadFile($event)">
        <div class="file-name" title="预览" @click.stop="handleView" v-show="fileName">
          {{fileName}}
        </div>
        <div v-show="(fileName&&!isAllowDel)&&!disabled" class="close-file" title="删除" @click.stop="clearFile">
          <i class="el-icon-close"></i>
        </div>
        <div @click.stop="downloadFile" class="download-file" title="下载">下载</div>
      </div>
      <!-- 上传图标：没有上传文件或者不展示删除文件时候都需要展示，浏览模式除外 -->
      <div class="upload-icon" @click="uploadFile"><i v-show="!disabled" title="上传" class="el-icon-upload2"></i></div>
    </div>
    <!-- <div v-show="(fileName&&!isAllowDel)&&!disabled" class="close-file" @click="clearFile">
      <i class="el-icon-close"></i>
    </div> -->
  </div>
</template>

<script>
export default {
  props: {
    refName: {
      type: String,
      default: 'upload-input' + Math.random()
    },
    fileSize: {
      type: Number,
      default: 100 // 默认100M
    },
    disabled: {
      //禁止上传
      type: Boolean,
      default: false
    },
    fileName: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      default: ''
    },
    accept: {
      //接受上传的文件类型
      type: Array,
      default() {
        return []
      }
    },
    onSuccessText: {
      //上传成功的提示内容
      type: String,
      default: '上传成功'
    },
    uploadFn: {
      type: Function
    },
    isAllowDel: {
      // 是否允许删除
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'fileName',
    event: 'update'
  },
  data() {
    return {}
  },
  methods: {
    clearFile() {
      this.$emit('delFile')
    },
    uploadFile() {
      if (this.disabled) {
        return false
      }
      console.log(1111)
      this.$emit('uploadFile')
    },
    uploadAction() {
      console.log(this.fileName,88)
      if (!this.fileName && !this.disabled) {
        this.$emit('uploadFile')
      }
    },
    downloadFile() {
      this.$emit('downloadFile')
    },
    handleView() {
      this.$emit('handleView')
    },
    outUploadFile(event) {
      if (event.target.className === 'placeholder-text') {
        this.uploadFile()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-is-not-disabled:hover {
  border-color: #c0c4cc;
  .upload-label:hover {
    .upload-icon {
      color: #3e80f5;
    }
  }
}
.close-file {
  background: #ebf0ff;
  .el-icon-close {
    font-size: 14px;
    color: #333;
  }
}
.close-file:hover {
  .el-icon-close {
    font-weight: 800;
  }
}
.upload-disabled {
  background: #f5f7fa;
}
.upload-is-not-disabled {
  background: #ffffff;
}
.is-error {
  .upload-input-box {
    border-color: #ff4949;
  }
}
.upload-input-box {
  width: 100%;
  height: 20px;
  border-radius: 2px;
  border: 1px solid #e9e9e9;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 3px;

  .upload-input {
    visibility: hidden;
    width: 0;
  }
  .upload-label {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0 4px;
    cursor: pointer;
    outline-style: none;
    .placeholder-text {
      font-size: 12px;
      font-weight: 400;
      color: #bfbfbf;
      line-height: 16px;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      user-select: none;
      display: flex;
      padding: 1px 0;
    }
    .file-name {
      font-size: 14px;
      font-weight: 400;
      color: #3e80f5;
      line-height: 16px;
      // flex: 1;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      // text-decoration: underline;
      background: #ebf0ff;
    }
    .download-file {
      font-size: 14px;
      font-weight: 400;
      color: #3e80f5;
      line-height: 16px;
    }
    .upload-icon {
      cursor: pointer;
      height: 100%;
      width: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #333;
    }
  }
  .close-file {
    // position: absolute;
    // right: 4px;
    // top: 0;
    height: 100%;
    width: 20px;
    line-height: 16px;
    text-align: center;
  }
}
// .is-required {
//   .upload-is-not-disabled {
//     background: #fef5f4;
//   }
// }
</style>