<template>
  <div class="column-upload">
    <div class="file-show">
      <div class="btn" @click="lookFile">查看{{ getNum() }}</div>
      <div class="btn" style="margin-left: 10px;"  @click="uploadFile">上传</div>
    </div>
    <!-- 上传 -->
		<div v-if="uploadPopShow">
			<FileUpload @close="successCb" :orderNo="orderNo" :typeCode="'freetime_reply'" />
		</div>
    <div v-if="filePopShow">
       <fileNamePop @close="filePopClose" :orderNo="orderNo" :showName="showName" />
    </div>
  </div>
</template>

<script>
import FileUpload from '../table/loa/fileUpload.vue'
import fileNamePop from './fileNamePop.vue'
export default {
  props: ['param', 'item'],
  data() {
    return {
      title: '',
      orderNo: '',
      uploadPopShow: false,
      filePopShow: false,
    }
  },
  components: {
    FileUpload,
    fileNamePop,
  },
  watch: {
    param() {
      this.init()
    }
  },
  created() {
    this.init()
  },
  computed: {
    showName() {
      return (this.param.followItem && this.param.followItem.ftReplyFiles) || []
    }
  },
  methods: {
    init() {
      this.orderNo = this.param['orderNo']
    },
    getNum() {
      if (this.showName && this.showName.length) {
        return `(${this.showName.length})`
      } else {
        return ''
      }
    },
    lookFile() {
      this.filePopShow = true
    },
    uploadFile() {
      this.uploadPopShow = true
    },
    successCb(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.item.method()
      }
    },
    filePopClose(type) {
      if (type === 'delete') { 
        this.item.method()
      } else {
        this.filePopShow = false
      }
      
    }
  },
}
</script>

<style lang="scss" scoped> 
.file-show {
  display: flex;
  align-items: center;
}
.btn {
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}
</style>