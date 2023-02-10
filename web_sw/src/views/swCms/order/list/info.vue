<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="order-box">
      <div class="content-box">
        <el-tabs class="fin-el-tabs" v-model="activeItem">
            <el-tab-pane
            :key="item.name"
            :label="item.label"
            :name="item.name"
            v-for="item in tabData"
            ></el-tab-pane>
        </el-tabs>
        <div class="status-box">
          <div class="left">
            <div class="top">
              <p>订单号：{{ dataSource.memOrderNo }}</p>
              <p>公司名称：{{ dataSource.corpName }}</p>
              <p>客户类型：{{ dictMapObj['customerClassNew'][dataSource.corpType] }}</p>
            </div>
          </div>
          <div class="right">
            <div class="btn-wrap">
              <el-button type="primary" size="mini" class="btn" v-if="dataSource.orderStatus === 'not_accepted'" @click="submit">保存</el-button>
              <el-button type="success" size="mini" class="btn" v-if="dataSource.orderStatus === 'not_accepted'" @click="sureOrderTack">受理</el-button>
              <el-button type="danger" size="mini" class="btn" v-if="dataSource.orderStatus === 'not_accepted'" @click="orderTakeRefuse">拒绝</el-button>
              <el-button type="default" size="mini" @click="back">返回</el-button>
            </div>
            <div class="status">
              订单状态：<i v-if="isGreen" class="el-icon-success green"></i><span :class="{'red': dataSource.orderStatus==='refused', 'green': isGreen}">{{ dictMapObj['swMemOrderStatus'][dataSource.orderStatus]}}</span>
              <el-tooltip placement="top" v-if="dataSource.orderStatus==='refused'">
                <div slot="content">{{ dataSource.auditRefuseReason }}</div>
                <i class="el-icon-question icon"></i>
              </el-tooltip>
            </div>
          </div>
        </div>
        <keep-alive>
        <!-- <component :isJumpRouteFromPage1.sync="isJumpRouteFromPage" :ref="activeType" :is="activeType" /> -->
        <OrderInfo v-if="activeItem === 'order' && show" ref="order" :type="dataSource.orderStatus === 'not_accepted' ? '': 'info'" :dataSource="dataSource" :memOrderNo="memOrderNo" />
        <Appendix v-if="activeItem === 'appendix'" :memOrderNo="memOrderNo" :dataSource="dataSource"></Appendix>
        </keep-alive>
        <!-- <OrderInfo v-if="activeItem === 'order' && show" ref="order" :type="dataSource.orderStatus === 'not_accepted' ? '': 'info'" :dataSource="dataSource" :memOrderNo="memOrderNo" />
        <Appendix v-if="activeItem === 'appendix'" :memOrderNo="memOrderNo" :dataSource="dataSource"></Appendix> -->
      </div>
      <Accept v-if="acceptOption.show" :option="acceptOption" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import OrderInfo from '../components/orderInfo'
import Appendix from '@/views/swCms/order/list/appendix'
import Accept from '../components/accept'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import {joinEmployeeName } from '@/views/swCms/data'
import { orderInfo, orderSave, workAssignList , orderAccept} from '@/api/swcms/index'
export default {
  mixins: [mixin, mixin2],
  components: {
    OrderInfo,
    Appendix,
    Accept
  },
  data() {
    return {
      loading: false,
      memOrderNo: '',
      isEdit: 'info',
      dataSource: {},
      isGreen: false,
      tabData: [{
          label: '订单信息',
          name: 'order'
      },{
          label: '附件管理',
          name: 'appendix'
      }],
      activeItem: 'order',
      show: false,
      acceptOption: {
        show: false,
        data: '',
      },
    }
  },
  created() {
    this.memOrderNo = this.$route.query.memOrderNo
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
          this.show = true
          this.isGreen = ['accepted','booked','released','completed'].includes(this.dataSource.orderStatus)
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false
        })
    },
    getWorkAssign(sourceData) {
      this.sourceData = sourceData
      this.show = true
    },
    back() {
      this.$router.go(-1)
    },
    submit(type) {
      this.$refs['order'].$refs['form'].validate((valid) => {
        if (valid) {
          let form = this.$refs['order'].$data.form
          let { containers } = form
          let status1 = containers.some(item => {
            let { containerNum} = item
            return Number(containerNum) > 200
          })
          if (status1) {
            this.dataSource.workAssign = form.workAssign
            return this.$msgErrClose('箱量最大不能超过200')
          }
          let status2 = containers.some(item => {
            let { weight} = item
            return Number(weight) > 53000
          })
          if (status2) {
            this.dataSource.workAssign = form.workAssign
            return this.$msgErrClose('单柜重量最大53000')
          }
          let status3 = containers.some(item => {
            let { volume } = item
            return Number(volume) > 100
          })
          if (status3) {
            this.dataSource.workAssign = form.workAssign
            return this.$msgErrClose('单柜体积最大100')
          }
          form.workAssign = form.workAssign.map(item => {
            return {
               employeeId: item.employeeId,
               jobCode: item.jobCode
            }
          })
          let data = {
            memOrderNo: this.memOrderNo,
            ...form,
          }
          orderSave(data)
            .then((res) => {
              if (res.code === 0) {
                if (type && type === 'orderTack') {
                  let params = {
                    memOrderNo: this.memOrderNo
                  }
                  orderAccept(params).then(res => {
                    if (res.code === 0) {
                      let text = '订单受理成功'
                      this.$msgSucClose(text)
                      this.getOrderInfo()
                    }
                   }).catch(() => {
                     this.getOrderInfo()
                   })
                } else {
                  this.$msgSucClose('订单保存成功!')
                  // this.back()
                  this.getOrderInfo()
                }
              }
            })
            .catch(() => {
              this.getOrderInfo()
            })
        }
      })
    },
    sureOrderTack() {
      this.$confirm('受理后会将订单修改信息保存并且将当前订单创建到订单系统，是否确认受理当前订单？', {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.submit('orderTack')
      }).catch((err) => {
      });
    },
    orderTakeRefuse() {
      this.acceptOption.data = {
        memOrderNo:this.memOrderNo
      }
      this.acceptOption.show = true
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
.finance-page {
  background: #F4F5F8;
}
.order-box {
  .content-box {
    // background: #fff;
    .title {
      font-size: 12px;
      font-weight: bold;
      color: #222;
      line-height: 40px;
    }
    .border {
      border-bottom: 1px solid #f4f5f8;
    }
    .top-box {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .detail-box {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: #fff;
      p {
        flex: 1;
        display: flex;
        align-items: center;
      }
    }
    .status-box {
      display: flex;
      justify-content: space-between;
      background: #fff;
      height: 96px;
      margin-bottom: 8px;
      .left  {
        padding-top:20px;
        width: calc(100% - 280px);
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: #fff;
          line-height: 20px;
          p {
            flex: 1;
            display: flex;
            align-items: center;
          }
        }
      }
      .right {
        width: 280px;
        padding: 16px 16px 0 0;
        .btn-wrap {
          display: flex;
          justify-content: right;
          .btn {
            margin-right:8px;
          }
        }
        .status {
          display: flex;
          justify-content: right;
          margin-top:16px;
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
    }
  }
  .order-box {
    // padding: 10px 16px;
  }
}
</style>
