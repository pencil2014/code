<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createItem" :rules="rules" label-position="right" label-width="70px" class="soUpload-form">    
      <el-form-item label="SO号" prop="so" :show-message="false">
        <el-input clearable size="mini" placeholder="请输入SO号" v-model="createItem.so"></el-input>
      </el-form-item>
      <el-form-item label="箱型箱量" prop="containerInfoList" :show-message="false">
        <div v-for="(item, index) in createItem.containerInfoList" :key="index">
          <el-row>
            <el-col :span="5">
              <el-select size="mini" placeholder="请选择箱型" v-model="item.containerType" filterable clearable @change="handleChangeContainerType" @visible-change="containerTypeVisibleChange">
                <el-option v-for="(item, index) in containerTypeOptions" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
              </el-select>
            </el-col>
            <el-col :span="2" class="center">--</el-col>
            <el-col :span="5">
              <el-input clearable size="mini" placeholder="请输入箱量" v-model.number="item.num"></el-input>
            </el-col>
            <el-col :span="2" class="center">--</el-col>
            <el-col :span="8">
              <el-input clearable size="mini" placeholder="请输入单柜重量" v-model.number="item.weight">
                <template slot="append">KGS</template>
              </el-input>
            </el-col>
            <el-col :span="2">
              <div class="btn-plus" @click="handleAddContainer" v-if="index === 0"></div>
              <div class="btn-minus" @click="handleDeleteContainer(index)" v-if="index > 0"></div>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item label="上传附件" required :show-message="false">
        <el-upload
          ref="upload"
          drag
          class="upload-file-cont"
          action="#"
          :multiple="false"
          :auto-upload="false"
          :before-upload="getFile"
          :on-change="handleChangeFile"
          :on-remove="handleRemove"
          :http-request="handleImport"
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
        <div class="file-name" @click="handleView(fileObj)" v-if="Object.keys(fileObj).length">{{fileObj.fileName}}</div>
        <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import {attachmentList} from '@/api/order/podService/customsClearance'

const defaultCreate = {
  orderNo: '',
  so: '',
  fileName: '',
  containerInfoList: [{}],
}

export default {
  filters: {
  },
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '新增SO',
        show: true,
        size: 'medium',
        width: "700px"
      },
      canSubmit: true,    // 可提交标识
      defaultFileSize: 100, //文件默认不超过100M   
      sizeLimit: true,
      file: '',
      fileList:[],
      showProcess:false,
      processLength:0,
      rules: {
        so: [{required: true, message: 'so号不能为空', trigger:'blur'}],
        containerInfoList: [{required: true, message: '箱型箱量不能为空', trigger:'blur'}]
      },
      createItem: Object.assign({}, defaultCreate),
      containerTypesArr: [],
      containerTypeOptions: [],
      interval: null,
      fileObj: {}
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    // 新增
    if (!this.param.soId) {
      this.createItem = Object.assign({}, defaultCreate, {
        containerInfoList: [{}]
      })
    } else {
      this.dialogConfig.title = '编辑SO'
      this.fileObj = {
        fileName: this.param.fileName,
        fileNo: this.param.fileNo
      }
      this.createItem = Object.assign({}, defaultCreate, {
        so: this.param.so,
        soId: this.param.soId,
        containerInfoList: this.param.containerInfoList
      })
    }
    this.containerTypeOptions = []
    // console.log(this.dictMap.containerTypeShiporder)
    this.containerTypeOptions = this.dictMap.containerTypeShiporder.map(item => {
      if (this.createItem.containerInfoList.some(ele => ele.containerType === item.value)) {
        return {...item, disabled: true}
      } else {
        return {...item, disabled: false}
      }
    })
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
    })
  },
  components: {
    BaseDialog
  },
  watch: {
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate() {
      let numberReg = /^[0-9]+$/, reg = /^\d+(\.\d+)?$/
      let containerTypeValid = this.createItem.containerInfoList.some(item => !item.containerType)
      let numValid = this.createItem.containerInfoList.some(item => !item.num || !numberReg.test(item.num))
      let numMaxValid = this.createItem.containerInfoList.some(item => item.num > 200)
      let weightValid = this.createItem.containerInfoList.some(item => !item.weight || !reg.test(item.weight))
      let weightMaxValid = this.createItem.containerInfoList.some(item => item.weight > 53000)
      if (containerTypeValid) {
        this.$message({type: 'error', message: '箱型不能为空'})
        return false
      }
      if (numValid) {
        this.$message({type: 'error', message: '请填写正确的箱量'})
        return false
      }
      if (numMaxValid) {
        this.$message({type: 'error', message: '箱量不能大于200'})
        return false
      }
      if (weightValid) {
        this.$message({type: 'error', message: '请填写正确的单柜重量'})
        return false
      }
      if (weightMaxValid) {
        this.$message({type: 'error', message: '单柜重量不能大于53吨'})
        return false
      }
      // 新增SO需要校验文件必填
      if (!this.param.soId && !this.fileList.length) {
        this.$message({
          type: 'error',
          message: '请先上传附件',
          duration: 1000,
          onClose: () => {}
        })
        return false
      }
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.uploadFileForm.validate(valid => {
          if (valid) {
            if (!this.validate() || !this.canSubmit) return 
            // 编辑保存强提示
            if (this.param.soId) {
              this.$confirm('是否确定修改该SO信息?', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                if (Object.keys(this.fileObj).length) {
                  this.handleImport()
                } else {
                  this.$refs.upload.submit(done)
                }
              }).catch(() => {
              })
            } else {  // 新增直接保存
              this.$refs.upload.submit(done)
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 新增箱子
    handleAddContainer() {
      this.createItem.containerInfoList.push({
        containerType: '',
        num: '',
        weight: ''
      })
    },
    // 删除箱子
    handleDeleteContainer(sIndex) {
      this.createItem.containerInfoList = this.createItem.containerInfoList.filter((item, index) => {
        return index !== sIndex
      })
    },
    containerTypeVisibleChange(val) {
      if (val) {
        let {containerInfoList} = this.createItem
        // 之前选过的箱型禁选
        this.containerTypeOptions = this.containerTypeOptions.map(item => {
          if (containerInfoList.find(ele => ele.containerType === item.value)) {
            return {...item, disabled: true}
          } else {
            return {...item, disabled: false}
          }
        })
      }
    },
    // 选择箱型
    handleChangeContainerType(val) {
    },
    handleView(row) {
			this.$store.dispatch('order/previewFile', {fileNo:  row.fileNo, fileName: row.fileName })
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
      this.fileList = []
      this.fileList.push(file)
      this.fileObj = {}
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleImport(done) {
      let params = {
        data: {
          orderNo: this.$route.query.orderNo,
          so: this.createItem.so,
          soId: this.createItem.soId,
          containerInfoList: this.createItem.containerInfoList,
        },
        fileName: this.file
      }
      if (this.sizeLimit) {
        this.canSubmit = false
        this.handleProgress()
        this.$store.dispatch('order/soUpload', {
          uri: '/order/shiporder/book/so/upload',
          params: params
        }).then(res => {
          this.processLength=100
          this.showProcess=false
          this.fileList = []
          this.canSubmit = true
          if (res === 'error') return
          this.$message({
            type: 'success',
            message: '导入成功',
            duration: 1000,
            onClose: () => {
              this.close('Confirm')
            }
          })
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
  }
}
</script>
<style lang="scss">
.soUpload-form{
  .el-form-item{
    margin-bottom: 4px;
    .el-col{
      margin-bottom: 4px;
    }
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
  .center{
    text-align: center;
    line-height: 20px;
  }
  .btn-plus{
    position: relative;
    width:20px;
    height:20px;
    border-radius:10px;
    border:1px solid #999;
    // margin-top: 4px;
    margin-left: 10px;
    &::before{
      content: '';
      display: block;
      position: absolute;
      width:1px;
      height:15px;
      background:#999;
      left: 9px;
      top: 2px;
    }
    &::after{
      content: '';
      display: block;
      position: absolute;
      width:15px;
      height:1px;
      background:#999;
      left: 2px;
      top: 9px;
    }
  }
  .btn-minus{
    position: relative;
    width:20px;
    height:20px;
    border-radius:10px;
    border:1px solid #999;
    // margin-top: 4px;
    margin-left: 10px;
    &::after{
      content: '';
      display: block;
      position: absolute;
      width:15px;
      height:1px;
      background:#999;
      left: 2px;
      top: 9px;
    }
  }
  .el-form-item__content .el-input-group {
    vertical-align: baseline;
  }
  .file-name{
    color: #3e80f5;
    font-size: 12px;
    cursor: pointer;
  }
}

</style>