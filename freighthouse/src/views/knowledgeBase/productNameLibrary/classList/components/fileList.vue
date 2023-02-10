<template>
  <div id="blFileList">
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <div class="customsClearance-bewteen">
        <span class="ft12">
          {{ `分类名称：${param.chapterName || param.className}` }}
        </span>
      </div>
      <el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont">
        <el-table-column show-overflow-tooltip prop="fileType" width="200" label="附件类型">
          <template slot-scope="scope"> {{ getFileType(scope.row.fileType) }} </template>
        </el-table-column>
        <el-table-column prop="fileName" label="模板名称" align="center">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button type="text" size="mini">
                <el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
                  <span class="file-name-style" @click="handleView(scope.row)">{{ scope.row.fileName }}</span>
                </el-tooltip>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="operate-group">
              <!-- <el-button type="text" size="mini" @click="handleView(scope.row)">预览</el-button> -->
              <el-button type="text" size="mini" @click="handleDownload(scope.row)">下载</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </BaseDialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { hscodeFileList } from '@/api/base'
import { getDictLabel } from '@/utils/tools'

export default {
  filters: {},
  data() {
    return {
      oQuery: this.$route.query,
      tableData: [],
      dialogConfig: {
        title: '申报附件',
        show: true,
        size: 'medium',
        width: '800px',
        showBtns: false
      }
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getFileList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  components: {
    BaseDialog
  },
  watch: {},
  methods: {
    // 文件类型
		getFileType(type) {
			return getDictLabel('hscodeUploadType', type)
		},
    // 附件列表
    getFileList() {
      let data = {
        oid: this.param.oid,
        type: 'class'
      }
      if (this.param.chapterCode) {
        data.type = 'chapter'
      }

      hscodeFileList(data).then((res) => {
        this.tableData = res.data
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.close('Confirm', this.tableData)
      } else {
        this.close('Cancel', this.tableData)
      }
    },
    // 预览
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.fileNo,
        fileName: row.fileName
      })
    },
    // 打包下载
    handleDownload(row) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: row.fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = row.fileName
          link.click()
        })
    }
  }
}
</script>
<style lang="scss">
.si-file-wrap {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.si-file-wrap span {
  cursor: pointer;
  color: #1890ff;
}
#blFileList .customsClearance-bewteen {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
#blFileList .table-cont .operate-group .el-button {
  white-space: normal;
}
#blFileList .table-cont .operate-group .el-button--mini span {
  display: block;
}
</style>
