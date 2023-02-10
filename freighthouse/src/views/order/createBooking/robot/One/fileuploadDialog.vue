<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
     <div>
        <el-upload
          ref="upload"
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="uploadFile"
          :show-file-list="false"
          :file-list='fileList'
          :disabled="!canSubmit">
          <el-button size="mini" type="primary">上传</el-button>
        </el-upload>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
     </div>
     <div class="table-class">
      <el-table
        :data="fileTableData"
        border
        style="width: 100%">
        <el-table-column
          prop="fileType"
          width="150px"
          label="附件类型">
          <template slot-scope="scope">
            <el-select v-model="scope.row.fileType" placeholder="" size="mini">
              <el-option
                v-for="item in fileTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          prop="fileName"
          show-overflow-tooltip
          label="附件名称">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleView(scope.row)" type="text" size="mini">
                <span class="file-name-style">{{ scope.row.fileName }}</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
         <el-table-column
          prop="fileName"
          width="80px"
          label="操作">
          <template slot-scope="scope">
            <el-button class="red" type="text" size="mini" @click="deleteRow(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
     </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
  components: {
    BaseDialog
  },
  props: {
    dictAll: {
      type: Object,
      default: () => {
        return {}
      }
    },
    files: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
        width: '800px'
			},
      fileTypeOptions: [],
      fileTableData: [],
      canSubmit: true,
      defaultFileSize: 100, //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileList:[],
      fileData: '',
      showProcess:false,
      processLength:0,
      interval: null,
    }
  },
  created() {
    this.fileTableData = this.files
    this.getDictAllData()
  },
  methods: {
    getDictAllData() {
      const source1 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_one_file_type'
      )[0]
      this.fileTypeOptions = source1.dictItems.map((item) => {
        const { descpt, itemCode, baseItemCode } = item
        return {
          label: `${descpt}`,
          value: itemCode,
          baseItemCode,
        }
      })
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
      if (!this.sizeLimit) {
          this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
      }
      return this.sizeLimit;
    },

    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = fileList
      this.handleImport()
    },

    handleImport(done) {
      // 根据后台需求数据格式
      this.fileData = new FormData();
      this.$refs.upload.submit()
      
      if (this.sizeLimit) {
        this.handleProgress()
        this.canSubmit = false
        this.$store.dispatch('user/import', {
          uri: '/ext/ai/si/file/upload',
          params: this.fileData
        }).then(res => {
          if (res.data.code === 0) {
            this.addFile(res.data.data)
          }
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
        }).catch(err => {
          clearInterval(this.interval)
          this.interval = null
          this.processLength=0
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
        })
      }
    },

    // 移除文件
    handleRemove(file,fileList) {
      this.fileList = fileList
    },

    uploadFile(file) {
      this.fileData.append('fileName', file.file);
    },

    // 上传进度条
    handleProgress(file, fileList){
      this.processLength=0
      this.showProcess=true
      this.interval=setInterval(()=>{
        if(this.processLength>=99){
          clearInterval(this.interval)
          return 
        }
        this.processLength+=1
      },200)
    },
    addFile(obj) {
      let fileType = this.fileTypeOptions[0].value
      this.fileTableData.push({
        fileType,
        fileName: obj.name,
        fileNo: obj.fileNo,
      })
    },
    deleteRow(index) {
      this.fileTableData.splice(index, 1)
    },
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.fileNo,
        fileName: row.fileName
      })
    },
    close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.fileTableData.filter(item => item.fileNo))
			} else {
				this.close('Cancel')
			}
		}
  }
}
</script>

<style lang="scss" scoped>
.table-class {
  margin-top: 10px;
}
/deep/.el-upload {
  text-align: left !important;
}
.upload-demo {
  display: inline-block;
}
</style>