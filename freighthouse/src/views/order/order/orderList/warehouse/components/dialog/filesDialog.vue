<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table style="width: 100%" fit highlight-current-row :data="fileList">
      <el-table-column width="200px" prop="typeName" label="附件类别" align="left">
        <template>
          <div class="operate-group">
            {{warehouseType==='in'?'卸货照片':'装柜照片'}}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="附件名称" align="left" min-width="200px">
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button @click="handleView(scope.row)" type="text" size="mini">
              <el-tooltip class="item" effect="dark" :content="scope.row.name" placement="top-start">
                <span class="file-name-style">{{ scope.row.name }}</span>
              </el-tooltip>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="size" label="附件大小(kb)" align="left" width="120px"> </el-table-column>
      <el-table-column prop="createdName" label="上传人" align="left" width="150px"> </el-table-column>
      <el-table-column prop="createdTime" label="上传时间" align="left" min-width="160px"> </el-table-column> -->
      <el-table-column label="操作" width="180" align="left">
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { mapGetters, mapState } from 'vuex'
import {
  warehouseInWmsInFiles,
  warehouseOutWmsOutFiles
} from '@/api/order/list'
export default {
  data() {
    return {
      fileList: [], // 选中列
      dialogConfig: {
        title: '附件',
        show: true,
        size: 'medium',
        width: '800px',
        showBtns: false
      }
    }
  },
  props: {
    warehouseType: {
      type: String,
      default: ''
    },
    warehouseId: {
      type: [String, Number],
      default: ''
    }
  },
  created() {
    if (this.warehouseType === 'in') {
      warehouseInWmsInFiles({ oid: this.warehouseId }).then((res) => {
        this.fileList = res.data || []
      })
    } else if (this.warehouseType === 'out') {
      warehouseOutWmsOutFiles({ oid: this.warehouseId }).then((res) => {
        this.fileList = res.data || []
      })
    }
  },
  components: {
    BaseDialog
  },
  computed: {
    ...mapGetters(['dictMap']),
    ...mapState({
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
    })
  },
  methods: {
    handleDownload(row) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: row.fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = row.name
          link.click()
        })
    },
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.fileNo,
        fileName: row.name
      })
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
      } else {
        this.close('Cancel')
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    }
  }
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
  border-bottom: unset !important;
}
</style>
