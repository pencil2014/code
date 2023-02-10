<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="create-form">    
      <el-form-item label="业务模块" prop="serviceCode">
        <el-select v-model="createdItem.serviceCode" size="mini" clearable filterable placeholder="请选择业务模块" @change="handleSelectServiceCode" style="width: 100%">
          <el-option v-for="(item, index) in serviceCodeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="附件类型" prop="typeCode">
        <el-select v-model="createdItem.typeCode" size="mini" clearable filterable placeholder="请选择附件类型" style="width: 100%">
          <el-option v-for="(item, index) in typeCodeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传附件" prop="fileName" class="is-required">
        <el-upload
          ref="upload"
          drag
          class="upload-file-cont"
          action="#"
          :multiple="multiple"
          :auto-upload="false"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="uploadFile"
          :file-list='fileList'
          :disabled="!canSubmit"
          >
            <div class="file-upload">
              <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
              <div class="file-upload__text">
                <div class="txt">点击或将文件拖拽到这里导入</div>
                <p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
              </div>
            </div>
          </el-upload>
          <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {fileClassList, fileTypeList} from '@/api/base'

const defaultCreate = {
  orderNo: '',
  typeCode: "",
  serviceCode: 'book',
  fileName: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '附件上传',
        show: true,
        size: 'medium',
        width: "560px"
      },
      canSubmit: true,  // 可提交标识

      multiple: true,
      defaultFileSize: 100,                             //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileList:[],
      fileData: '',
      showProcess:false,
      processLength:0,

      createdItem: Object.assign({}, defaultCreate),
      serviceCodeOptions: [],
      typeCodeOptions: [],
      
      rules: {
        serviceCode: [{required: true, message: '请选择业务模块', trigger: 'change'}],
        typeCode: [{required: true, message: '请选择附件类型', trigger: 'change'}],
      },
      interval: null

    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
    this.getFileClassList()
    this.getFileTypeList('book')
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
    }),  
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    // 获取业务模块
    getFileClassList() {
      fileClassList().then(res => {
        let {data} = res
        // 过滤只要订舱和保函的业务模块
        this.serviceCodeOptions = data.filter(item => ['book', 'letter_of_guarantee'].includes(item.serviceCode)).map(item => {
          return Object.assign(item, {
            label: item.serviceName,
            value: item.serviceCode
          })
        })
      })
    },
    // 获取附件类别
    getFileTypeList(val) {
      fileTypeList({serviceCode: val}).then(res => {
        let {data} = res
        this.typeCodeOptions = []
        let filterArr = ['no_danger', 'msds', 'ysjds', 'hwtp', 'dgform']
        if (val === 'letter_of_guarantee') {
          filterArr = ['no_danger', 'msds', 'ysjds', 'hwtp', 'dgform']
        }
        this.typeCodeOptions = data.filter(item => filterArr.includes(item.typeCode)).map(item => {
          return Object.assign(item, {
            label: item.typeName,
            value: item.typeCode
          })
        })
      })
    },
    // 选择业务模块
    handleSelectServiceCode(val) {
      this.createdItem.typeCode = ''
      if (val) {
        this.getFileTypeList(val)
      } else {
        this.typeCodeOptions = []
      }
    },
    
    close(action) {
      this.$emit('close', action)
    },

    validate() {
      if (!this.fileList.length) {
        this.$message({
          type: "error",
          message: "请上传附件",
          duration: 1000,
          onClose: () => {}
        })
        return false
      }
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.uploadFileForm)
        this.$refs.uploadFileForm.validate((valid) => {
          if (valid) {
            if (!this.validate() || !this.canSubmit) return
            this.handleImport()
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
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
    },

    // 移除文件
    handleRemove(file,fileList) {
      this.fileList = fileList
    },

    uploadFile(file) {
      this.fileData.append('fileName', file.file);
      //this.file = file.file
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

    handleImport(done) {
      // 根据后台需求数据格式
      this.fileData = new FormData();
      this.fileData.append("orderNo", this.orderNo || this.$route.query.orderNo);
      this.fileData.append("typeCode", this.createdItem.typeCode);
      console.log(this.fileData)
      this.$refs.upload.submit()
      
      if (this.sizeLimit) {
        this.handleProgress()
        this.canSubmit = false
        this.$store.dispatch('user/import', {
          uri: '/order/shiporder/file/upload',
          params: this.fileData
        }).then(res => {
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '导入成功'
            })
            this.close('Confirm')
          }
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
  }
};
</script>

<style lang="scss">

</style>
