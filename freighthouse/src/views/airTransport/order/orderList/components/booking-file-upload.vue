<template>
  <div class="upload-input-box" :class="{'disabled-input':disabled}">
    <label :for="refId" class="file-label" :class="{'has-files':!((!fetchFileList||JSON.stringify(fetchFileList)=='{}')&&localFileList.length===0)}">
      <!--  type="file" -->
      <input :id="refId" name="file" :disabled="disabled" multiple="multiple" @change="selectFile($event)" style="display:none">
      <p class="placeholder-text" v-if="(!fetchFileList||JSON.stringify(fetchFileList)=='{}')&&localFileList.length===0">请上传托书附件</p>
      <div class="upload-icon" v-if="!disabled"><i class="el-icon-upload2" title="上传"></i></div>
    </label>
    <ul class="file-list" v-if="!((!fetchFileList||JSON.stringify(fetchFileList)=='{}')&&localFileList.length===0)">
      <li class="file-item" v-for="(value,key,index) in fetchFileList" :key="index+'fetch'">
        <div class="file-info"><span class="file-name" title="预览" @click="handleView(value,key)">{{value}}</span>
          <i class="el-icon-close" v-if="!disabled" title="删除" @click="delFile(key)"></i>
          <span class="file-download" title="下载" @click="downloadFile(value,key)">下载</span>
        </div>
      </li>
      <li class="file-item" v-for="(item,i) in localFileList" :key="i+'local'">
        <div class="file-info"><span class="file-name">{{item.name}}</span>
          <i class="el-icon-close" title="删除" @click="delFileLocal(i)"></i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { unique } from '@/utils'
export default {
  props: {
    refId: {
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
    fetchFileList: {
      // 已上传的文件
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      // 选择的文件，还没上传
      localFileList: [],
      files: []
    }
  },
  computed: {},
  methods: {
    delFile(fileNo) {
      this.$emit('delFile', fileNo)
    },
    toArray(fileList) {
      return Array.prototype.slice.call(fileList)
    },
    selectFile(e) {
      if (this.disabled) {
        return false
      }
      this.files = e.target.files
      let bigSizeFiles = []
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].size > this.fileSize * 1024 * 1024) {
          let bigFile = `${this.files[i].name}`
          bigSizeFiles.push(bigFile)
        }
      }
      if (bigSizeFiles.length) {
        this.$message.error(bigSizeFiles.join(',') + '文件大小不能大于100M')
        return
      } else {
        // 选择文件，当文件名和文件大小相同时候不能重复选择

        this.localFileList = unique(
          [...this.localFileList, ...this.files],
          'name'
        )
        let formdata = new FormData()
        let emptyFiles = []
        for (let i = 0; i < this.localFileList.length; i++) {
          if (this.localFileList[i].size > 0) {
            formdata.append('files', this.localFileList[i])
          } else {
            emptyFiles.push(this.localFileList[i].name)
            this.localFileList.splice(i, 1)
          }
        }
        if (emptyFiles.length) {
          this.$message(`您选择的(${emptyFiles.join(',')})为空文件，文件不能上传！`)
        }
        this.$emit('selectFile', formdata, this.localFileList.length)
        e.target.value = '' // 解决不能重复选择文件的问题
      }
    },
    downloadFile(fileName, fileNo) {
      this.$emit('downloadFile', fileName, fileNo)
    },
    handleView(fileName, fileNo) {
      this.$emit('handleView', fileName, fileNo)
    },
    delFileLocal(index) {
      // 还未上传的文件删除
      this.localFileList.splice(index, 1)
      let formdata = new FormData()
      for (let i = this.localFileList.length; i >= 0; i--) {
        formdata.append('files', this.localFileList[i])
      }
      this.$emit('selectFile', formdata, this.localFileList.length)
    }
  },
  watch: {
    fetchFileList(newVal) {
      // 文件上传后，之前未上传的文件清空
      this.localFileList = []
      this.$emit('selectFile', null, 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-input-box {
  width: 100%;
  border-radius: 2px;
  border: 1px solid #e9e9e9;
  height: 78px;
  border-radius: 3px;
  padding: 4px;
  position: relative;
  .file-label {
    position: absolute;
    top: 4px;
    right: 4px;
    height: calc(100% - 8px);
    width: calc(100% - 8px);
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    .upload-icon {
      line-height: 16px;
      cursor: pointer;
      font-size: 16px;
      display: inline-block;
      .el-icon-upload2:hover {
        color: #3e80f5;
      }
    }
    .placeholder-text {
      color: #bfbfbf;
      font-size: 14px;
      font-weight: 500;
    }
  }
  .file-label:hover {
    .el-icon-upload2 {
      color: #3e80f5;
    }
  }
  .has-files {
    height: 16px;
    width: 16px;
  }
  .placeholder-text {
    color: #bfbfbf;
    font-size: 14px;
  }
  .file-list::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    background-color: #f5f5f5;
  }
  .file-list::-webkit-scrollbar {
    width: 0;
    height: 0;
    background-color: #f5f5f5;
  }
  .file-list::-webkit-scrollbar-thumb {
    border-radius: 20px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    background-color: #ccc;
  }
  .file-list {
    height: 100%;
    overflow: auto;
    .file-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      padding-right: 20px;
      .file-info {
        .el-icon-close {
          cursor: pointer;
          line-height: 20px;
          background: #ebf0ff;
          padding-left: 4px;
          vertical-align:top;
        }
        .el-icon-close:hover {
          font-weight: 800;
        }
        .file-name {
          color: #3e80f5;
          cursor: pointer;
          background: #ebf0ff;
          word-break: break-all;
        }
      }

      .file-download {
        margin-left: 4px;
        color: #3e80f5;
        cursor: pointer;
      }
    }
  }
}
.is-error {
  .upload-input-box {
    border-color: #ff4949 !important;
  }
}
.disabled-input {
  background-color: #f5f7fa;
  border-color: #dfe4ed;
}
.upload-input-box:hover {
  border-color: #c0c4cc;
}
.disabled-input:hover {
  border-color: #dfe4ed;
}
</style>