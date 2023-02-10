<template>
  <div class="edit-container order-book" id="fileBook">
    <div class="order-container">
      <!-- 订单已取消提示 -->
      <CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
      <!-- 订单拒绝提示 -->
      <RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
      <div class="tabs-container">
        <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
        <div class="detail-container flex">
          <LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <CustInfo :orderInfo="orderInfo" />
              <div class="fileList-cont">
                <div class="mb10 between h28">
                  <div class="ft14">托书列表</div>
                  <el-button type="primary" size="mini" @click="handleAdd" v-if="isEditView">新增托书</el-button>
                </div>
                <el-table style="width: 100%" fit highlight-current-row :data="fileBookList">
                  <el-table-column prop="custName" label="委托单位" align="center"> </el-table-column>
                  <el-table-column prop="containerInfo" label="箱型箱量" align="center"> </el-table-column>
                  <el-table-column prop="quantity" label="件数/包装" align="center">
                    <template slot-scope="scope"> {{ scope.row.quantity }}/{{ scope.row.packageInfo | packageInfoFilter }} </template>
                  </el-table-column>
                  <el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
                  <el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
                  <el-table-column prop="fileName" label="附件名称" align="center">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <el-button @click="handleView(scope.row)" type="text" size="mini">{{ scope.row.fileName }}</el-button>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center" fixed="right">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
                        <el-button @click="handleDelete(scope.row)" type="text" size="mini" v-if="isEditView">删除</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- 上传 -->
              <div v-if="uploadPopShow">
                <FileBookUpload @close="uploadPopClose" :orderInfo="orderInfo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import {
  orderFileBookList,
  orderFileBookDelete
} from '@/api/order/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import FileBookUpload from './components/fileBookUpload'
import { getDictLabel } from '@/utils/tools'

export default {
  mixins: [orderMixin, routerMixin],
  filters: {
    packageInfoFilter(packageInfo) {
      return getDictLabel('packageType', packageInfo)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      fileBookList: [],
      uploadPopShow: false,
      activityKey: 'AirFileBook'
    }
  },
  created() {
    this.getOrderInfo()
    this.getFileBookList()
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.browserBack, false)
    }
  },
  computed: {
    isEditView() {
      return (
        this.ordDetRole === 'bd' ||
        this.ordDetRole === 'obd' ||
        this.ordDetRole === 'op' ||
        this.ordDetRole === 'doc'
      )
    }
  },
  components: {
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    CustInfo,
    FileBookUpload
  },
  destroyed() {
    window.removeEventListener('popstate', this.browserBack, false)
  },
  methods: {
    getFileBookList() {
      orderFileBookList({ orderNo: this.$route.query.orderNo }).then((res) => {
        this.fileBookList = res.data
      })
    },
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
          link.download = row.fileName
          link.click()
        })
    },
    handleView(row) {
      this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
    },
    handleDelete(row) {
      let data = {
        orderNo: row.orderNo,
        oid: row.oid
      }
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return orderFileBookDelete(data)
        })
        .then((response) => {
          this.getFileBookList()
          this.$message({ message: '删除成功', type: 'success' })
        })
        .catch(() => {})
    },
    // 新增上传托书
    handleAdd() {
      this.uploadPopShow = true
    },
    // 上传弹窗关闭回调
    uploadPopClose(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.getFileBookList()
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../less/index.scss';
</style>
