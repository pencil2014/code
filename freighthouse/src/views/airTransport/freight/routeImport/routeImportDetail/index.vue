<template>
  <div class="routeImportDetail">
    <div class="components-container">
      <div class="filter">
        <span class="content">总共导入运价信息共有 {{titleData.totalRows}} 条</span>
        <el-checkbox @change='setCurrentSuccess' v-model="checked.success">成功 <span style="color:#7BD269">{{titleData.importSuccessRows}}</span> 条</el-checkbox>
        <el-checkbox @change="setCurrentError" v-model="checked.error">失败 <span style="color:#E63923">{{titleData.importFailedRows}}</span> 条</el-checkbox>
        <el-button v-if="titleData.importFailedRows>0" style="float:right;" @click="handleExportError" size="mini" type="primary">
          <i class="el-icon-bottom"></i> 下载失败运价
        </el-button>
        <el-button @click="handleGoback" style="float:right;margin-right:10px;" size="mini">返回</el-button>
      </div>
      <!-- v-loading="loading" -->
      <el-table v-loading="loading" :data="tableData" border :row-class-name="tableRowClassName">
        <el-table-column fixed width="55" align="center" type='index' label="序号">
        </el-table-column>
        <el-table-column fixed width="85" align="center" label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.state == 'success'" style="display: flex;"><i class="icon-success"></i>成功</span>
            <span v-if="scope.row.state == 'error'" style="display: flex;"><i class="iocn-error"></i>失败</span>
          </template>
        </el-table-column>
        <el-table-column fixed width="" align="center" label="原因" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{scope.row.checkDesc ? scope.row.checkDesc : '--'}}</span>
          </template>
        </el-table-column>
        <el-table-column width="200" prop="polPortCode" align="center" label="起运港">
        </el-table-column>
        <el-table-column width="200" prop="podPortCode" align="center" label="目的地">
        </el-table-column>
        <el-table-column width="200" prop="airLine" align="center" label="航空公司">
        </el-table-column>
        <el-table-column width="200" prop="packageInfo" align="center" label="包装">
          <template slot-scope="scope">
            {{getDictLabel('airChargePackage', scope.row.packageInfo)}}
          </template>
        </el-table-column>
        <el-table-column width="200" prop="flightRate" align="center" label="航班频率">
        </el-table-column>
        <el-table-column width="200" prop="beginDate" align="center" label="有效日期（开始）">
        </el-table-column>
        <el-table-column width="200" prop="endDate" align="center" label="有效日期（结束）">
        </el-table-column>
        <el-table-column width="200" prop="prescription" align="center" label="时效">
        </el-table-column>
        <el-table-column width="200" prop="cargoType" align="center" label="货型（泡比）">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { airChargeFileInfo, airChargeFileExportErrorList } from '@/api/charge'
import { getDictLabel } from '@/utils/tools'
export default {
  name: 'routeImportDetail',
  data() {
    return {
      getDictLabel: getDictLabel,
      loading: false,
      checked: {
        success: true,
        error: true
      },
      titleData: {},
      //表格
      tableData: [],
      tableDataList: [],
      total: 0,
      importId: this.$route.query.id
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 取消
    handleGoback() {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.name === this.$route.name
      )
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
      this.$router.push({
        name: 'AirFreightRateImport'
      })
    },
    // 查看成功勾选按钮
    setCurrentSuccess(value) {
      if (this.checked.error == this.checked.success) {
        this.tableData = this.tableDataList
      } else {
        if (value) {
          this.tableData = this.filter('success')
        } else {
          this.tableData = this.filter('error')
        }
      }
    },
    // 查看失败勾选按钮
    setCurrentError(value) {
      if (this.checked.error == this.checked.success) {
        this.tableData = this.tableDataList
      } else {
        if (value) {
          this.tableData = this.filter('error')
        } else {
          this.tableData = this.filter('success')
        }
      }
    },
    //过滤方法
    filter(value) {
      let createdList = []
      let list = this.tableDataList
      createdList = list.filter((item, index) => {
        return item.state === value
      })
      return createdList
    },
    getList() {
      this.loading = true
      airChargeFileInfo(this.importId).then((res) => {
        for (let i in res.data) {
          this.titleData[i] = res.data[i]
        }
        this.tableData = res.data.airCharges
        this.tableDataList = res.data.airCharges
        this.loading = false
      })
    },
    //下载失败
    handleExportError() {
      if (this.titleData.importResultFileNo) {
        this.downloadErrorData(
          this.titleData.importResultFileNo,
          this.titleData.importResultFileName
        )
      } else {
        airChargeFileExportErrorList(this.titleData.importId).then((res) => {
          if (res.code == 0) {
            let { fileNo, name } = res.data
            this.titleData.importResultFileNo = fileNo
            this.titleData.importResultFileName = name
            this.downloadErrorData(fileNo, name)
          }
        })
      }
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
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.state === 'error') {
        return 'warning-row'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.routeImportDetail {
  padding: 20px;
  .components-container {
    padding: 20px;
    background-color: #fff;
    position: relative;
  }
  .filter {
    margin-bottom: 10px;
    // margin-top: 10px;
    height: 20px;
    .content {
      // margin-left:16px;
      margin-right: 32px;
    }
    /deep/ .el-button--mini {
      padding: 2px 5px;
    }
  }
  /deep/ .el-table thead {
    color: #000000;
  }
  .iocn-error {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    background: url('../../../../../assets/icon-error.png') 0 0 no-repeat;
  }
  .icon-success {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    background: url('../../../../../assets/icon-success.png') 0 0 no-repeat;
  }
  /deep/ .el-table .warning-row {
    background-color: rgb(253, 246, 244);
  }
  /deep/ .el-table .success-row {
    background: #fff;
  }
  .self-tootip {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>