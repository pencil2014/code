<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="uploadFileForm" :model="createdItem" label-position="right" label-width="120px" class="create-form" :show-message="false">
      <el-form-item label="贸易单证类别" prop="docType" :rules="[{ required: true, message: '请选择贸易单证类别', trigger: 'change' }]">
        <el-select v-model="createdItem.docType" size="mini" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="item in dictMap.tradeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提单号" prop="blId" :rules="[{ required: orderInfo.serviceType === 'st01' ? true : false, message: '请选择提单号', trigger: 'change' }]" v-if="orderInfo.serviceType !== 'st02'">
        <el-select v-model="createdItem.blId" size="mini" clearable placeholder="请选择" @blur="selectBlur" style="width: 100%">
          <el-option v-for="(item, index) in blIdOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { airDocumentSave } from '@/api/order/document'
import { airBlList } from '@/api/airTransport/order'

const defaultCreate = {
  blId: '',
  // docName: '',
  docType: '',
  orderNo: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '新增贸易单证',
        show: true,
        size: 'medium',
        width: '560px',
        btns: [
          { label: '新增', action: 'Confirm', type: 'primary' },
          { label: '取消', action: 'Cancel' }
        ]
      },
      blIdOptions: [],
      canUpload: true,
      multiple: true,
      defaultFileSize: 100, //文件默认不超过100M
      sizeLimit: true,
      file: '',
      fileData: '',
      showProcess: false,
      processLength: 0,
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        docName: [
          { required: true, message: '请选择贸易单证类别', trigger: 'change' }
        ]
      },
      isClick: true
    }
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getBlNoList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getBlNoList() {
      airBlList({ orderNo: this.oQuery.orderNo }).then((res) => {
        // airBlList({ orderNo: 'S2020105280001'}).then(res => {
        this.blIdOptions = res.data.map((item) => {
          let label = `${item.blNo} (id: ${item.blId})`
          return Object.assign(
            {},
            {
              label: label,
              value: item.blId
            }
          )
        })
      })
    },

    close(action) {
      this.$emit('close', action)
    },

    selectBlur(e) {
      this.createdItem.blId = e.target.value
    },

    handleDownload(row) {
      let href = `/base/webapi/file/download?fileNo=${row.fileNo}`
      window.open(href)
    },

    handleView(item) {
      this.$store.dispatch('order/previewFile', {
        fileNo: item.fileNo,
        fileName: item.fileName
      })
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.uploadFileForm.validate((valid) => {
          if (valid) {
            this.createdItem.orderNo = this.orderNo || this.oQuery.orderNo
            if (this.oQuery.jointNo) {
              this.createdItem.jointNo = this.oQuery.jointNo
            }
            // 客户自定的blId不传
            if (
              this.oQuery.serviceType === 'st06' ||
              this.oQuery.serviceType === 'st14' ||
              this.oQuery.serviceType === 'st21' ||
              this.oQuery.serviceType === 'st22'
            ) {
              delete this.createdItem.blId
            }
            if (this.isClick) {
              this.isClick = false
              airDocumentSave(this.createdItem)
                .then((res) => {
                  this.$message({
                    type: 'success',
                    message: '保存成功',
                    duration: 1000,
                    onClose: () => {
                      this.isClick = true
                      this.close('Confirm')
                    }
                  })
                })
                .catch(() => {
                  this.isClick = true
                })
            }
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

<style lang="scss">
.btn-uploadFile {
  width: 300px;
}
.fileNo-list {
  margin: 10px 0;
  padding: 0;
  .link-fileNo {
    cursor: pointer;
    list-style: none;
    line-height: 24px;
    color: #3e80f5;
    font-size: 12px;
    text-decoration: underline;
  }
}
</style>
