<template>
  <div class="clipboard-container">
    <div class="clipboard-embed">
      <div class="clipboard-visible-btn" :style="{width: width + 'px'}" @click="handleVisible">点击粘贴上传</div>
    </div>
    <el-dialog
      :title="'粘贴上传'"
      :visible.sync="clipboardVisible"
      width="720px"
      :destroy-on-close="true"
    >
      <div class="clipboard-upload">
        <div class="clipboard-left" @paste="handlePaste">
          <img class="clipboard-left-img" src="@/assets/icon-upload.png" />
          <div class="clipboard-left-text">
            <div>
              <input id="clipboard-input" placeholder="点击按 Ctrl+V 将截图粘贴到这里"/>
            </div>
            <!-- <p class="info">
              支持 {{ this.comTypes }} 格式文件， 且文件大小限制在5M内
            </p> -->
            <!-- <img v-show="pasted" :src="previewImgSrc" /> -->
          </div>
          <div class="clipboard-left-img-overlay" :style="{left: overlayLeft + 'px', top: overlayTop + 'px'}"></div>
        </div>
        <div class="clipboard-preview-container">
          <div id="clipboard-preview"
            @mouseenter="handleShowPreviewDelete($event, 'yes')"
            @mouseleave="handleShowPreviewDelete($event, 'no')"
            @drop.prevent="handlePreviewDrop"
            @dragover.prevent="() => {}"
            @dragleave.prevent="() => {}">
            <!-- <i v-show="pasted" class="el-icon el-icon-close clipboard-preview-close" @click="deleteFile"></i> -->
            <div v-show="!pasted" class="clipboard-preview-text">截图预览</div>
            <span v-show="pasted && showPreviewDelete" class="clipboard-preview-delete-wrapper">
              <i class="el-icon el-icon-delete clipboard-preview-delete" @click="deleteFile"></i>
            </span>
          </div>
          <span class="clipboard-split"></span>
        </div>
        <ul v-show="fileList.length > 1" class="clipboard-file-indicator-list">
          <li v-for="(file, index) in fileList"
            :key="'fileIndicatorList' + index"
            :class="{active: file.active}"
            @click="toggleFile(file.fileUid, index)">
            <span class="clipboard-file-indicator"></span>
          </li>
        </ul>
      </div>
      <div slot="footer" class="clipboard-footer">
        <div class="clipboard-footer-upload">
          <el-upload
            class="upload-file-cont"
            action="#"
            :limit="limit"
            :on-exceed="handleExceed"
            :multiple="true"
            :on-change="handleChangeFile"
            :before-upload="handleBeforeUpload"
            :on-remove="handleRemove"
            :http-request="handleUpload"
            :file-list="fileListEl"
          >
            <!-- <el-button type="text">如需导入文件点击这里</el-button> -->
            <div class="file-upload__text">
              <div class="txt">如需导入文件点击这里</div>
            </div>
          </el-upload>
          <!-- finance-table-upload -->
        </div>
        <span class="clipboard-footer-btn">
          <el-button type="primary" @click="confirm" size="mini">确 定</el-button>
          <el-button @click="clipboardVisible = false" size="mini">取 消</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// import { Message } from 'element-ui'
export default {
  name: 'clipboardUpload',
  props: {
    limit: {
      type: Number,
      default: 1
    },
    width: {
      type: Number,
      default: 160
    }
  },
  data() {
    return {
      pasted: false,
      previewImgSrc: '',
      fileList: [],
      fileListEl: [], // 导入的文件列表
      fileListConcat: [],
      resFileList: [],
      uploadApi: '/base/webapi/file/uploadToTempPath', // '/base/webapi/file/upload', 20220830
      clipboardVisible: false,
      showPreviewDelete: false,
      fileUid: 1,
      file: '',
      showProcess: false,
			processLength: 0,
      defaultFileSize: 5,
      overlayLeft: 0,
      overlayTop: 0,
    }
  },
  methods: {
    confirm() {
      this.clipboardVisible = false
      // 返回fileNo, name的数据
      this.$emit('send-res-file-list', this.resFileList)
      console.log(this.resFileList)
      // 如需返回file的数据(一般可忽略)
      this.fileListConcat = this.fileList.concat(this.fileListEl.map(item => item.raw))
      this.$emit('send-file-list', this.fileListConcat)
      // console.log(this.fileListConcat)
    },
    handleVisible() {
      this.clipboardVisible = true
    },
    handleShowPreviewDelete(event, val) {
      if (val === 'yes') {
        this.showPreviewDelete = true
      } else {
        this.showPreviewDelete = false
      }
    },
    toggleFile(id) {
      let images = this.$el.querySelectorAll('#clipboard-preview img')
      images.forEach((image, index) => {
        image.className = ''
        let fileUid = image.getAttribute('file-uid')
        if (fileUid == id) {
          image.className = 'active'
          let file = this.fileList.find(file => file.fileUid == id)
          this.setFileActive(file)
        }
      })
    },
    deleteFile() {
      let preview = this.$el.querySelector('#clipboard-preview')
      let images = this.$el.querySelectorAll('#clipboard-preview img')
      try {
        images.forEach(image => {
          let className = image.className
          if (className.includes('active')) {
            let fileUid = image.getAttribute('file-uid')
            preview.removeChild(image)
            let index1 = this.fileList.findIndex(file => file.fileUid == fileUid)
            // console.log('index1', index1)
            this.fileList.splice(index1, 1)
            let index2 = this.resFileList.findIndex(file => file.fileUid == fileUid)
            // console.log('index2', index2)
            this.resFileList.splice(index2, 1)
            // console.log(this.fileList, this.resFileList)
            if (this.fileList[0]) {
              this.setFileActive(this.fileList[0])
            }
            if (this.fileList.length === 0) {
              this.pasted = false
            }
            throw new Error('ending')
          }
        })
      } catch (error) {
        images = this.$el.querySelectorAll('#clipboard-preview img')
        if (images.length) {
          images[0].className = 'active'
        }
      }
    },
    handlePaste(event) {
      if (this.fileListEl.length + this.fileList.length >= this.limit) {
        this.handleExceed()
        return
      }
      const items = (event.clipboardData || window.clipboardData).items;
      let file = null;
      if (!items || items.length === 0) {
        this.$message.error("无粘贴内容或当前浏览器不支持粘贴操作"); // 当前浏览器不支持本地
        return;
      }
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
      if (!file) {
        this.$message.error("粘贴内容非图片");
        return;
      }
      const reader = new FileReader()
      reader.onload = event => {
        let preview = this.$el.querySelector('#clipboard-preview') // 使用$el可防止一个页面有多个该组件导致获取元素混乱
        this.pasted = true
        let images = this.$el.querySelectorAll('#clipboard-preview img')
        images.forEach(image => image.className = '')
        let image = document.createElement('img')
        image.src = `${event.target.result}`
        image.setAttribute('file-uid', this.fileUid++)
        image.className = 'active'
        preview.appendChild(image)
      }
      reader.readAsDataURL(file)
      file.fileUid = this.fileUid
      this.fileList.push(file)
      this.setFileActive(file)
      this.handleUpload(file)
    },
    setFileActive(file) {
      this.fileList.forEach(file => {
        file.active = false
      })
      file.active = true
      this.$forceUpdate()
    },
    handlePreviewDrop(e) {
      // console.log(e.dataTransfer.files)
    },
    handleExceed(files, fileList) {
      this.$message.error(`只能选择 ${this.limit} 个文件！`) // Message.error
    },
		getFile(file, hideMsg) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
			if (!sizeLimit && !hideMsg) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
			}
			let isAccept = true
			const accept = this.acceptSelf || this.accept
			if (accept) {
				isAccept = accept.includes(file.type)
				if (!isAccept && !hideMsg) {
					this.$message.error(`上传文件只能是 ${this.acceptTypes.join('、')} 格式`);
				}
			}
			return sizeLimit && isAccept;
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
      this.fileListEl = fileList // 需赋值才有值
      if (file.status === 'ready') { // 如果添加文件，不符合条件的文件删除
				if (!this.getFile(file.raw)) {
          let index = fileList.findIndex(item => {
						return item === file
					})
					fileList.splice(index, 1)
				}
      }
      fileList.forEach(item => {
        item.raw.fileUid = item.raw.uid
      })
    },
    handleBeforeUpload(file) { // 此处file是raw
      console.log(this.fileListEl)
      if (this.fileListEl.length - 1 + this.fileList.length >= this.limit) {
        this.handleExceed()
        return false
      }
      if (!this.getFile(file, true)) {
        return false
      }
      return true
    },
    handleRemove(file, fileList) {
      console.log(file)
      this.fileListEl = fileList // 需再次赋值才有值
      let index = this.resFileList.findIndex(item => {
				return item.fileUid === file.raw.fileUid
      })
      if (index > -1) {
        this.resFileList.splice(index, 1) // 删除对应的resFile
      }
      console.log(this.resFileList)
      console.log(this.fileListEl)
    },
    openUpload(api) {
      this.fileList = []
      this.uploadApi = api
      this.showUploadIn = true
    },
    uploadAction() {
      if (this.fileList.length === 0) {
        this.$message({
          type: 'error',
          message: '请粘贴图片后上传！',
          showClose: true
        })
        return
      }
      this.fileList.forEach(file => {
        this.handleUpload(file)
      })
    },
    handleUpload(file) {
      if (file.file) { // el-upload
        file = file.file
      }
      console.log(file)
      const form = new FormData()
      form.append('file', file)
      this.handleProgress()
      this.$store.dispatch('user/import', {
        uri: this.uploadApi,
        params: form
      }).then(res => {
        if (res.data.code === 0) {
          this.processLength=100
          this.showProcess=false
          this.$message({
            type: 'success',
            message: '上传成功!',
            showClose: true
          })
          let resFile = res.data.data
          if (resFile) {
            resFile.fileUid = res.config.headers.fileUid
            this.resFileList.push(resFile)
            console.log(this.resFileList)
          }
        }else{
          this.$message.error(res.data.msg || 'Has Error') // Message.error
        }
      })
    },
    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength=0
      this.showProcess=true
      const interval=setInterval(()=>{
        if(this.processLength>=99){
          clearInterval(interval)
          return 
        }
        this.processLength+=1
      },200)
    },
    closeUpload() {
      this.fileList = [] //清除
      this.showUploadIn = false
      this.$emit('close-upload')
    },
    clipboardUploadEnter() {
      let clipboardUpload = document.getElementById('clipboard-input')
      clipboardUpload.focus()
    },
  },
  watch: {
		// resFileList(newVal) {
		// 	this.$emit('send-res-file-list', newVal)
    // },
    clipboardVisible(newVal, oldVal) {
      if (newVal) {
        this.$nextTick(() => {
          let el = document.getElementById("clipboard-input")
          el && el.focus()
        })
        setTimeout(() => {
          let Img = document.getElementsByClassName('clipboard-left-img')[0]
          let rect = Img.getBoundingClientRect()
          this.overlayLeft = rect.left
          this.overlayTop = rect.top
        }, 100)
      } else {
        this.pasted = false
        this.previewImgSrc = ''
        this.fileList = []
        this.fileListEl = []
        this.fileListConcat = []
        this.resFileList = []
        this.clipboardVisible = false
        this.showPreviewDelete = false
        this.fileUid = 1
        this.file = ''
      }
    },
	}
}
</script>
<style lang="scss">
.clipboard-container {
  .el-dialog__body {
    padding-bottom: 18px;
  }
  .el-dialog__footer {
    padding-bottom: 21px;
  }
}
.clipboard-visible-btn {
  width: 100%;
  height: 20px;
  color: #BFBFBF;
  padding: 0px 3px; // 2px
  text-align: left;
  font-size: 12px;
  line-height: 18px; // 14px
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
}
.clipboard-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
  width: 652px;
  height: 260px;
  margin: 0 10px;
  text-align: center;
  position: relative;
  background: #f8f9fd;
  // overflow: hidden;
  display: flex;
  position: relative;
}
.clipboard-left {
  width: 266px;
  // padding-top: 96px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 34px;
    height: 34px;
  }
}
#clipboard-input {
  outline: none;
  width: 220px;
  padding-left: 3px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 10px;
}
.clipboard-left-img-overlay {
  position: fixed;
  width: 34px;
  height: 44px;
}
.clipboard-preview-container {
  flex: 1;
  padding: 3px;
  height: 100%;
  position: relative;
}
#clipboard-preview {
  position: relative;
  height: 100%;
}
.clipboard-preview-text {
  color: #606266;
  // margin-top: 45px;
  opacity: 0.5;
  font-size: 12px;
  height: 100%;
  vertical-align: middle;
  display: inline-block;
  &::after {
    height: 100%;
    content: '';
    vertical-align: middle;
    display: inline-block;
  }
}
#clipboard-preview img {
  width: 378px;
  height: 252px;
  position: absolute;
  left: 0;
  top: -1000px;
  &.active {
    top: 0;
  }
}
.clipboard-preview-close {
  position: absolute;
  right: 5px;
  top: 5px;
  color: #606266;
  opacity: 0.5;
  cursor: pointer;
}
.clipboard-preview-close:hover {
  transform: scale(1.2);
  opacity: 1;
}
.clipboard-split {
  position: absolute;
  left: 0;
  top: 20px;
  width: 0;
  height: calc(100% - 40px);
  border-left: 1px dashed #d9d9d9;
}
.clipboard-preview-delete-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: default;
  text-align: center;
  color: #fff;
  font-size: 20px;
  background-color: rgba(0,0,0,.1);
  z-index: 100;
}
.clipboard-preview-delete {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
  cursor: pointer;
}
.clipboard-file-indicator-list {
  position: absolute;
  right: -24px;
  top: 0;
  z-index: 101;
  width: 20px;
  display: flex;
  flex-direction: column;
  li {
    padding: 6px 6px;
    .clipboard-file-indicator {
      display: block;
      opacity: .5;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ddd;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }
    &.active {
      .clipboard-file-indicator {
        background-color: #3e80f5;
      }
    }
  }
}
.clipboard-footer {
  margin: 0 10px;
  display: flex;
  justify-content: space-between;
}
.clipboard-footer-upload {
  width: 270px;
  .file-upload__text {
    text-align: left;
    color: #606266;
  }
}
</style>