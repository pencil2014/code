<template>
  <div class="ship-type">
    <div class="filter">
      <el-button size="mini" class="ship-type-download" @click="handleTemplateDownload">
        <i class="el-icon-download"></i> 下载模板
      </el-button>
      <el-upload class="filter-upload-demo" action="#" :auto-upload="true" :before-upload="getFile" :http-request="handleImport" :on-change="handleProgress" :file-list='fileList'>
        <el-button size="mini" type="primary">
          <i class="el-icon-plus"></i> 导入
        </el-button>
        <div class="tip" slot="tip"><span class="content">请用EXCEL表格进行上传</span>
          <span class="el-upload__tip"></span>
        </div>
      </el-upload>
      <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
    </div>
    <el-table v-loading="loading" :data="tabledata" border>
      <el-table-column width="75" align="center" type='index' label="序号">
      </el-table-column>
      <el-table-column min-width="160" prop="filePath" align="center" label="附件">
        <template slot-scope="scope">
          <span>{{scope.row.fileName}}</span>
          <el-button @click="handleExport(scope.row)" type="text" size="mini">下载</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="totalRows" align="center" label="总共条数">
      </el-table-column>
      <el-table-column align="center" label="成功数">
        <template slot-scope="scope">
          <span style="color:#7BD269">{{scope.row.importSuccessRows}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="失败数">
        <template slot-scope="scope">
          <span style="color:#E63923">{{scope.row.importFailedRows}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="importTime" align="center" label="导入时间">
      </el-table-column>
      <el-table-column align="center" width="350" label="操作">
        <template slot-scope="scope">
          <div class="route-operate-btns">
            <el-button type="text" size="mini" @click="handleDetailes(scope.row.importId)">详情</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.importSuccessRows<1" @click="handleToPublish(scope.row)">去发布</el-button>
            <el-button type="text" size="mini" :disabled="scope.row.importFailedRows<1" @click="handleExportError(scope.row)">下载失败运价</el-button>
            <el-button type="text" size="mini" @click="handleDelete(scope.row)" class="red">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination">
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
    </div>
  </div>
</template>

<script>
import {
  airChargeFilePageList,
  airChargeFileExportErrorList,
  airChargeFileDelete
} from '@/api/charge'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Base/Table/newPagination'

export default {
  components: { Pagination },
  data() {
    return {
      loading: false,
      sizeLimit: true,
      headers: {
        Authorization: getToken(),
        'content-type': 'multipart/form-data'
      },
      tabledata: [],
      file: '',
      total: 0,
      fileList: [],
      showProcess: false,
      processLength: 0,
      tableConfig: {
        // 分页
        pagination: {
          pageSize: 10,
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      },
      tableQuery: {
        pageSize: -1,
        currPage: 1,
        total: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 分页
    handleSizeChange(val) {
      this.getList()
    },
    handleCurrentChange(val) {
      this.getList()
    },
    handleDetailes(id) {
      this.$router.push({
        name: 'AirFreightRateImportDetail',
        query: {
          id: id
        }
      })
    },
    handleToPublish(row) {
      sessionStorage.setItem('airRouteImportToMainRoute', true)
      this.$router.push({
        name: 'AirFreightMaintenance',
        query: {
          importId: row.importId
        }
      })
    },
    //文件上传成功时的钩子
    handleChange(file) {},
    getFile(file) {
      this.file = file
      let suffix = this.getSuffix(file.name)
      if (!(suffix == 'xlsx' || suffix == 'xls')) {
        this.$message.error('只能上传excel格式的文件')
        this.showProcess = false
        this.processLength = 0
        return false
      }
    },
    getSuffix(str) {
      const fileExtension = str.substring(str.lastIndexOf('.') + 1)
      return fileExtension
    },
    handleImport(param) {
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('file', this.file)

      this.$store
        .dispatch('user/import', {
          uri: '/charge/air/charge/file/import',
          params: form
        })
        .then((res) => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code == 0) {
            this.$message({
              type: 'success',
              message: '导入成功',
              onClose: () => {
                this.getList()
                this.fileList = []
              }
            })
          } else {
            this.$message({
              type: 'error',
              message: '导入失败',
              onClose: () => {
                this.getList()
                this.fileList = []
                // window.location.reload()
              }
            })
          }
        })
        .catch(() => {
          this.showProcess = false
          this.fileList = []
          this.processLength = 0
        })
    },
    handleProgress(file, fileList) {
      if (file.status === 'ready') {
        this.processLength = 0
        this.showProcess = true
        const interval = setInterval(() => {
          if (this.processLength >= 99 || !this.showProcess) {
            clearInterval(interval)
            return
          }
          this.processLength += 1
        }, 200)
      }
    },
    getList() {
      this.loading = true
      airChargeFilePageList(this.tableQuery)
        .then((res) => {
          this.tabledata = res.data.list

          this.tableQuery.total = res.data.totalCount

          this.tableQuery.currPage = res.data.currPage
          this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
          this.tableConfig.pagination.isLastPage = res.data.isLastPage
          this.tableConfig.pagination.total = res.data.totalCount
          this.tableQuery.pageSize = res.data.pageSize
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 下载按钮操作
    handleExport(row) {
      this.$store
        .dispatch('charge/downloadBlobFile', {
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
    },
    //下载失败
    handleExportError(row) {
      if (row.importResultFileNo) {
        this.downloadErrorData(row.importResultFileNo, row.importResultFileName)
      } else {
        airChargeFileExportErrorList(row.importId).then((res) => {
          if (res.code == 0) {
            let { fileNo, name } = res.data
            row.importResultFileNo = fileNo
            row.importResultFileName = name
            this.downloadErrorData(fileNo, name)
          }
        })
      }
    },
    //下载模板
    handleTemplateDownload() {
      this.$confirm('是否确认下载模板?', '提示', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            setTimeout(() => {
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/charge/air/charge/file/templateDownload',
                  data: {}
                })
                .then((res) => {
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '空运运价导入模板.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.$message({ message: '下载失败', type: 'error' })
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        }
      })
        .then(() => {})
        .catch(() => {})
    },
    //删除
    handleDelete(row) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return airChargeFileDelete(row.importId)
        })
        .then((response) => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.getList()
            }
          })
        })
        .catch(() => {
          this.getList()
        })
    },
    downloadErrorData(fileNo, fileName) {
      this.$store
        .dispatch('charge/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.ship-type {
  .filter {
    margin-bottom: 10px;
    // margin-top: 2px;
    /deep/ .el-button--mini {
      padding: 2px 5px;
    }
    .content {
      margin-left: 16px;
      color: #bfbfbf;
    }
    .tip {
      display: inline;
    }
    .ship-type-download {
      position: relative;
      margin-right: 16px;
    }
    .filter-upload-demo {
      display: inline;
    }
    /deep/.el-upload.el-upload--text {
      width: 62px;
    }
  }
  .route-operate-btns .el-button {
    padding-right: 0;
    padding-left: 0;
    &.red {
      color: #cd4130;
    }
  }
  /deep/ .el-table .el-button--mini {
    padding: 2px 5px;
  }
  .pagination {
    text-align: right;
    .pagination-container {
      padding: 8px 0;
    }
    /deep/ .el-input--mini .el-input__icon {
      line-height: 20px;
    }
  }
}
</style>