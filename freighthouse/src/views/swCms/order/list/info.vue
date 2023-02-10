<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="order-box" v-if="dataSource">
      <div class="top-cnt">
        <div class="top-box border">
          <div class="title">修改订单</div>
          <div class="btn-box">
            <el-button type="primary" size="mini" @click="submit" v-if="type === 'edit'"
              >保存</el-button
            >
            <el-button type="default" size="mini" @click="back">返回</el-button>
          </div>
        </div>
        <div class="status-box">
          <p>订单号：{{ dataSource.memOrderNo }}</p>
          <p>公司名称：{{ dataSource.corpName }}</p>
          <p>客户类型：{{ dictMapObj['customerClassNew'][dataSource.corpType] }}</p>
          <p>
            <!-- 订单状态：{{ dataSource.orderStatus | formatOrderStatus }} -->
             订单状态：<i v-if="isGreen" class="el-icon-success green"></i><span :class="{'red': dataSource.orderStatus==='refused', 'green': isGreen}">{{ dictMapObj['swMemOrderStatus'][dataSource.orderStatus]}}</span>
            <el-tooltip placement="top" v-if="dataSource.orderStatus==='refused'">
              <div slot="content">{{ dataSource.auditRefuseReason }}</div>
              <i class="el-icon-question icon"></i>
            </el-tooltip>
          </p>
        </div>
      </div>
      <div class="order-box">
        <el-tabs class="fin-el-tabs" v-model="activeItem">
            <el-tab-pane
            :key="item.name"
            :label="item.label"
            :name="item.name"
            v-for="item in tabData"
            ></el-tab-pane>
        </el-tabs>
        <OrderInfo v-if="activeItem === 'order'" ref="order" :type="type" :dataSource="dataSource" />
        <Appendix v-if="activeItem === 'appendix'" :memOrderNo="memOrderNo"></Appendix>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import OrderInfo from '../components/orderInfo'
import Appendix from '@/views/swCms/order/list/appendix'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderInfo, orderSave } from '@/api/swcms/index'
export default {
  mixins: [mixin, routerMixin],
  components: {
    OrderInfo,
    Appendix
  },
  data() {
    return {
      loading: false,
      memOrderNo: '',
      isEdit: 'info',
      dataSource: '',
      isGreen: false,
      tabData: [{
          label: '订单信息',
          name: 'order'
      },{
          label: '附件管理',
          name: 'appendix'
      }],
      activeItem: 'order'
    }
  },
  created() {
    this.memOrderNo = this.$route.query.memOrderNo
    this.type = this.$route.query.type || 'info'
    this.getOrderInfo()
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  methods: {
    getOrderInfo() {
      this.loading = true
      let data = {
        memOrderNo: this.memOrderNo,
      }
      orderInfo(data)
        .then((res) => {
          this.dataSource = res.data
          this.isGreen = ['accepted','booked','released','completed'].includes(this.dataSource.orderStatus)
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    back() {
      this.$router.go(-1)
    },
    submit() {
      this.$refs['order'].$refs['form'].validate((valid) => {
        if (valid) {
          let form = this.$refs['order'].$data.form
          let { containers } = form

          let status1 = containers.some(item => {
            let { containerNum} = item
            return Number(containerNum) > 200
          })
          if (status1) {
            return this.$msgErrClose('箱量最大不能超过200')
          }
          let status2 = containers.some(item => {
            let { weight} = item
            return Number(weight) > 53000
          })
          if (status2) {
            return this.$msgErrClose('单柜重量最大53000')
          }
          let status3 = containers.some(item => {
            let { volume } = item
            return Number(volume) > 100
          })
          if (status3) {
            return this.$msgErrClose('单柜体积最大100')
          }
          let data = {
            memOrderNo: this.memOrderNo,
            ...form,
          }
          orderSave(data)
            .then((res) => {
              if (res.code === 0) {
                this.$msgSucClose('订单保存成功!')
                // this.back()
                this.getOrderInfo()
              }
            })
            .catch(() => {})
        }
      })
    },
  },
  filters: {
    formatOrderStatus(val) {
      if (val) {
        let text = {
          not_accepted: '未受理',
          refused: '已拒绝',
          accepted: '已受理',
          booked: '已订舱',
          released: '已放舱',
          completed: '已完成',
          canceled: '已取消',
        }
        return text[val] || ''
      }
      return ''
    },
  },
}
</script>

<style lang="scss" scoped>
.order-box {
  .title {
    font-size: 12px;
    font-weight: bold;
    color: #222;
    line-height: 40px;
  }
  .border {
    border-bottom: 1px solid #f4f5f8;
  }
  .top-cnt {
    border-bottom: 8px solid #f4f5f8;
    padding: 10px 16px;
    .top-box {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-box {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      p {
        flex: 1;
        display: flex;
        align-items: center;
      }
      i {
        font-size: 16px;
        color: #ccc;
        margin-left: 5px;
        &.green{
          margin-left: 0;
          margin-right: 5px;
          color: #33B18A;
        }
      }
    }
  }
  .order-box {
    padding: 10px 16px;
  }
}
</style>
