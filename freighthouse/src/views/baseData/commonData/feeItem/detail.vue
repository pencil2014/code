<template>
  <div class="edit-container">
    <div class="edit-row">
      <div class="row-tit">
        <span class="tit">费用项详情</span>
        <div class="row-tit-operate">
          <el-button style="float:right" size="mini" ref="btnCancel" @click="handleCancel" plain>返回</el-button>
        </div>
      </div>
      <div class="detail_page">
        <DetailDiv label="中文名称：" :content="detailInfo.feeName"></DetailDiv>
        <DetailDiv label="英文名称：" :content="detailInfo.feeEnName"></DetailDiv>
        <DetailDiv label="费用编码：" :content="detailInfo.feeCode"></DetailDiv>
        <DetailDiv label="收付类型：" :content="detailInfo.receipayGroup"></DetailDiv>
        <DetailDiv label="计费单位：" :content="detailInfo.feeUnit"></DetailDiv>
        <DetailDiv label="默认币种：" :content="detailInfo.currency"></DetailDiv>
        <DetailDiv label="费用类别：" :content="detailInfo.finGroup"></DetailDiv>
        <DetailDiv label="收付成对出现：" :content="detailInfo.needPaired|yesNo"></DetailDiv>
        <DetailDiv label="成对费用项：" :content="detailInfo.pairedFeeName"></DetailDiv>
        <DetailDiv label="收付金额相等：" :content="detailInfo.needPairedAmt|yesNo"></DetailDiv>
        <DetailDiv label="合并显示费用：" :content="detailInfo.mergeFeeName"></DetailDiv>
        <DetailDiv label="应收是否开票：" :content="detailInfo.openerReceiveInvoice|yesNo"></DetailDiv>
        <DetailDiv
          v-show="detailInfo.openerReceiveInvoice ==='yes' "
          label="汇总开票名称："
          :content="detailInfo.invoiceSummaryName"
        ></DetailDiv>
        <DetailDiv
          v-show="detailInfo.openerReceiveInvoice ==='yes' "
          label="明细开票名称："
          :content="detailInfo.invoiceItemName"
        ></DetailDiv>
        <DetailDiv label="应付是否开票：" :content="detailInfo.openerPayInvoice|yesNo"></DetailDiv>
        <DetailDiv label="参与利润计算：" :content="detailInfo.profitType|yesNo"></DetailDiv>
        <DetailDiv label="是否启用：" :content="detailInfo.enabled|yesNo"></DetailDiv>
        <DetailDiv label="是否自动对冲：" :content="detailInfo.isAutoGedging|yesNo"></DetailDiv>
        <DetailDiv label="业务类型：" :content="detailInfo.businsessTypes" :isFull="true" />
        <DetailDiv label="服务模块：" :content="detailInfo.serviceCodes" :isFull="true" />
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import {
  feeItemClassList, // 费用类别
  feeItemInfo, // 详情
} from '@/api/fin/feeitem'
export default {
  data() {
    return { detailInfo: {} }
  },
  async created() {
    let business = localStorage.getItem('_BOBJ') || '[]'
    business = JSON.parse(business)
    let service = localStorage.getItem('_SOBJD') || '[]'
    service = JSON.parse(service)
    // console.log(business)
    // console.log(service)
    let FEEOBJ = {}
    await feeItemClassList({}).then((res) => {
      res.data.forEach((item) => {
        FEEOBJ[item.feeClassCode] = item.cname
      })
    })
    feeItemInfo({ feeCode: this.$route.query.feeCode }).then((res) => {
      let feeItemBizList = res.data.feeItemBizList
      let businsessTypes = [...new Set(feeItemBizList.map((v) => v.businsessType))]
      let serviceCodes = feeItemBizList.map((v) => (v.serviceCode === '*' ? '*' : `${v.businsessType},${v.serviceCode}`))
      this.detailInfo = res.data
      this.detailInfo.receipayGroup = this.dictMapObj['feeitemReceipayGroup'][res.data.receipayGroup.toLowerCase()]
      this.detailInfo.feeUnit = this.dictMapObj['feeUnit'][res.data.feeUnit.toLowerCase()]
      this.detailInfo.finGroup = FEEOBJ[res.data.finGroup]
      this.detailInfo.businsessTypes = businsessTypes.map((item) => business[item]).join(',')
      this.detailInfo.serviceCodes = [...new Set(serviceCodes)].map((item) => service[item]).join(',')
    })
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  filters: {
    yesNo(val) {
      return val === 'yes' ? '是' : val === 'no' ? '否' : ''
    },
  },
  methods: {
    // 取消
    handleCancel() {
      this.$router.replace({
        path: 'feeItem',
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.el-button {
  padding: 3px 7px;
}
.edit-row {
  background: rgba(255, 255, 255, 1);
  margin: 16px 16px 10px;
}
.row-tit {
  display: flex;
  justify-content: space-between;
  height: 36px;
  background: rgba(255, 255, 255, 1);
  border-bottom: 1px solid #e9e9e9;
  border-radius: 4px 4px 0px 0px;
  padding: 0 10px;
  .tit {
    font-size: 14px;
    color: #222;
    line-height: 36px;
    font-weight: 600;
    .redFont {
      color: #e63923;
      font-style: normal;
    }
  }
  .row-tit-operate {
    display: flex;
    height: 100%;
    align-items: center;
    .row-tit-label {
      font-size: 12px;
      margin-left: 40px;
      em {
        color: #3e80f5;
        margin-left: 5px;
        font-style: normal;
      }
      &.row-tit-info {
        color: #bfbfbf;
        font-size: 12px;
      }
    }
  }
}
.detail_page {
  padding: 20px 0;
}
</style>