<template>
  <div class="finance-approve-detail">
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">专项管理费详情</div>
      <div class="finance-approve-btns-right">
        <el-button @click="closeDetail" size="mini">返回</el-button>
      </div>
    </div>
    <div class="finance-approve-detail-main">
      <div class="finance-detail-info">
        <div class="detail-info-other">
          <span class="detail-info-item">订单编号：{{detailData.orderNo || ''}}</span>
          <span class="detail-info-item">委托单位： modifyFeeData.orderType}}</span>
          <span class="detail-info-item">结算单位： modifyFeeData.applyPersonName}}</span>
          <span class="detail-info-item">调整原因： modifyFeeData.reason}}</span>
          <span class="detail-info-item">调整说明： modifyFeeData.remark}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
import { mySpecialDetail } from '@/api/fin/fee'
export default {
  name: 'mySpecialDetail',
  mixins: [mixin],
  props: {
    feeId: '',
  },
  data() {
    return {
      detailData: {},
    }
  },
  created() {
    mySpecialDetail({ feeId: this.feeId }).then((res) => {
      this.detailData = res.data
      console.log(this.detailData)
    })
  },
  methods: {
    closeDetail() {
      this.$emit('close-detail', false)
    },
  },
}
</script>
<style scoped>
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
.finance-approve-detail-main {
  padding: 20px 24px;
}
.detail-info-item {
  min-width: 275px;
  width: auto;
}
</style>