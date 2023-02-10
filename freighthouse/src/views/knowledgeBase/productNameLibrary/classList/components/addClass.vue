<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="100px" class="create-order-form">
      <el-form-item v-if="createdItem.className" label="父级分类名称" prop="className">
        <el-input v-model="createdItem.className" disabled size="mini" clearable placeholder="" style="width: 100%">
        </el-input>
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="createdItem.name" size="mini" clearable maxlength="128" placeholder="分类名称" style="width: 100%">
        </el-input>
      </el-form-item>
      <el-form-item label="申报附件">
        <div style="text-align: right; margin-bottom: 4px;">
          <el-button @click="handleAdd()" type="primary" size="mini">新增附件</el-button>
        </div>
        <el-table :data="createdItem.fileList" stripe style="width: 100%">
          <el-table-column prop="fileType" label="附件类型" width="150" align="center">
            <template slot-scope="scope">
              <el-select ref="typeCode" v-model="scope.row.fileType" size="mini" clearable filterable placeholder="附件类型" style="width: 100%">
                <el-option v-for="(item, index) in dictMap.hscodeUploadType" :label="item.label" :value="item.value" :key="index"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="附件模板" align="center">
            <template slot-scope="scope">
              <div class="operate-group" v-if="scope.row.fileName">
                <el-button type="text" size="mini">
                  <el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
                    <span class="file-name-style">{{ scope.row.fileName }}</span>
                  </el-tooltip>
                </el-button>
              </div>
              <el-button v-else @click="handleUpload(scope.$index)" type="text" size="mini">上传</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" align="center" width="200">
            <template slot-scope="scope">
              <el-button v-if="scope.row.fileName" @click="handleUpload(scope.$index)" type="text" size="mini">重新上传</el-button>
              <el-button @click="handleAdd()" type="text" size="mini">新增</el-button>
              <el-button @click="handleDel(scope.$index)" type="text" class="red" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <div v-if="uploadPopShow" class="dialog-20vh">
      <FileUpload @close="uploadPopClose" />
    </div>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import FileUpload from './fileUpload.vue'
import { hscodeFileList } from '@/api/base'
const defaultCreate = {
  name: '',
  classCode: '',
  className: '',
  chapterCode: '',
  chapterName: '',
  fileList: [
    {
      fileNo: '',
      fileName: '',
      fileType: ''
    }
  ]
}

export default {
  data() {
    return {
      currentIndex: '',
      uploadPopShow: false,
      dialogConfig: {
        title: '新增分类',
        show: true,
        size: 'medium',
        width: '800px'
      },

      createdItem: Object.assign({}, defaultCreate),
      sellerOptions: [],
      custidOptions: [],
      custClass: '', // 委托单位客户类型
      custCode: '', // 委托单位code
      serviceTypeOptions: [],
      exportOrderArr: [], // 关联出口单下拉
      includesFeeder: 'y',

      // 是否包含驳船
      includesFeederOptions: {
        y: '是',
        n: '否'
      },

      rules: {
        name: [
          { required: true, message: ' ', trigger: 'change' },
          { max: 128, message: ' ', trigger: 'change' }
        ],
        className: [
          { required: true, message: ' ', trigger: 'change' },
          { max: 128, message: ' ', trigger: 'change' }
        ]
      },
      loading: false,
      timerTr: null
    }
  },
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  created() {
    if (this.detailData.oid) {
      this.dialogConfig.title = '查看'
      let type = ''
      if (this.detailData.chapterCode) {
        this.createdItem.className = this.detailData.className
        this.createdItem.classCode = this.detailData.classCode
        this.createdItem.name = this.detailData.chapterName
        this.createdItem.chapterCode = this.detailData.chapterCode

        type = 'chapter'
      } else {
        this.createdItem.name = this.detailData.className
        this.createdItem.classCode = this.detailData.classCode
        type = 'class'
      }

      hscodeFileList({
        oid: this.detailData.oid,
        type: type
      }).then((res) => {
        if (res.data.length) {
          this.createdItem.fileList = res.data
        } else {
          this.createdItem.fileList = [
            {
              fileNo: '',
              fileName: '',
              fileType: ''
            }
          ]
        }
      })
    } else if (!this.detailData.oid && this.detailData.classCode) {
      this.dialogConfig.title = '新增子分类'
      this.createdItem.classCode = this.detailData.classCode
      this.createdItem.className = this.detailData.className
      this.createdItem.fileList = [
        {
          fileNo: '',
          fileName: '',
          fileType: ''
        }
      ]
    } else {
      this.createdItem.name = ''
      this.createdItem.classCode = ''
      this.createdItem.className = ''
      this.createdItem.chapterCode = ''
      this.createdItem.chapterName = ''
      this.createdItem.fileList = [
        {
          fileNo: '',
          fileName: '',
          fileType: ''
        }
      ]
    }
  },
  activated() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles
    })
  },
  watch: {},
  components: {
    BaseDialog,
    FileUpload
  },
  methods: {
    uploadPopClose(action, val) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.$set(
          this.createdItem.fileList[this.currentIndex],
          'fileNo',
          val.fileNo
        )
        this.$set(
          this.createdItem.fileList[this.currentIndex],
          'fileName',
          val.name
        )
      }
    },
    handleDel(index) {
      this.createdItem.fileList.splice(index, 1)
    },
    handleAdd() {
      this.createdItem.fileList.push({
        fileNo: '',
        fileName: '',
        fileType: ''
      })
    },
    handleUpload(index) {
      this.currentIndex = index
      this.uploadPopShow = true
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createOrderForm.validate((valid) => {
          if (valid) {
            for (let i = 0; i < this.createdItem.fileList.length; i++) {
              if (
                this.createdItem.fileList[i].fileType &&
                !this.createdItem.fileList[i].fileNo
              ) {
                return this.$message.error('请上传附件')
              } else if (
                !this.createdItem.fileList[i].fileType &&
                this.createdItem.fileList[i].fileNo
              ) {
                return this.$message.error('请选择附件类型')
              }
            }
            this.close('Confirm', this.createdItem)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss"></style>
