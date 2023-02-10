<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">押金申请详情</div>
        </div>
        <div class="money-box-right">
          <el-button @click="routerBack()" size="mini">返回</el-button>
        </div>
      </div>
    </div>
    <div style="padding: 16px 8px 8px;">
      <DetailDiv
        class="special_item"
        labelWidth="118"
        label="客户/供应商名称："
        :content="form.settleCorpName"
      />
      <SettleCorpTypeTags style="margin-bottom: 4px;" :tags="form.unitType||''" />
      <br />
      <DetailDiv
        v-if="form.depositType"
        labelWidth="118"
        label="押金类型："
        :content="dictMapObj.depositType[form.depositType]"
      />
      <DetailDiv
        v-if="form.depositSubType"
        labelWidth="118"
        label="押金子类型："
        :content="dictMapObj.depositSubType[form.depositSubType] || form.depositSubType"
      />
      <DetailDiv
        v-if="form.tenderDate"
        labelWidth="118"
        label="投标起止时间："
        :content="form.tenderDate"
      />
      <DetailDiv
        labelWidth="118"
        label="押金收付类型："
        :content="dictMapObj.depositReceipayType[form.receipayType]"
      />
      <DetailDiv labelWidth="118" label="所属分公司：" :content="form.settleCompName" :isTooltip="true" />
      <DetailDiv labelWidth="118" label="申请人：" :content="form.applyName" />
      <DetailDiv labelWidth="118" label="所属部门：" :content="form.applyPersonDeptName" />
      <DetailDiv labelWidth="118" label="币种：" :content="form.currency" />
      <DetailDiv labelWidth="118" label="金额：" :content="form.amt" />
      <DetailDiv v-if="form.orderNo" labelWidth="118" label="关联单号：" :isSlot="true">
        <el-tag
          class="detail__content"
          size="medium"
          @click="showOneNoDetail('sourceBizNo', form.orderNo)"
        >{{ form.orderNo }}</el-tag>
      </DetailDiv>
      <DetailDiv
        v-if="form.rivalBankName"
        labelWidth="118"
        label="对方开户行："
        :content="form.rivalBankName"
      />
      <DetailDiv
        v-if="form.rivalAccountName"
        labelWidth="118"
        label="对方户名："
        :content="form.rivalAccountName"
      />
      <DetailDiv
        v-if="form.rivalAccountNo"
        labelWidth="118"
        label="对方账号："
        :content="form.rivalAccountNo"
        :isTooltip="true"
      />
      <DetailDiv labelWidth="118" label="押金申请附件：" :isSlot="true">
        <el-tooltip v-if="form.applyFileName" :content="form.applyFileName" placement="top-start">
          <el-tag
            class="detail__content"
            size="medium"
            @click="vmShowAttachment(form.applyFileNo)"
          >{{ form.applyFileName }}</el-tag>
        </el-tooltip>
      </DetailDiv>
      <DetailDiv labelWidth="118" label="押金条附件：" :isSlot="true">
        <el-tooltip
          v-if="form.depositFileName"
          :content="form.depositFileName"
          placement="top-start"
        >
          <el-tag
            class="detail__content"
            size="medium"
            @click="vmShowAttachment(form.depositFileNo)"
          >{{ form.depositFileName }}</el-tag>
        </el-tooltip>
      </DetailDiv>
      <DetailDiv labelWidth="118" label="申请备注：" :content="form.applyRemark" :isFull="true" />
      <!-- <DetailDiv labelWidth="118" label="拒绝原因：" :content="form.auditRemark" :isFull="true" /> -->
    </div>
  </div>
</template>
<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { depositApplyInfo } from '@/api/fin/deposit'
export default {
  name: 'depositApply',
  mixins: [mixin, routerMixin],
  components: {},
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    depositApplyInfo({ depositApplyNo: this.$route.query.depositApplyNo }).then((res) => {
      let { tenderStartDate, tenderEndDate } = res.data
      res.data.tenderDate = (tenderStartDate || tenderEndDate || '') && (tenderStartDate || '-') + '~' + (tenderEndDate || '-')
      Object.assign(this.form, res.data || {})
    })
  },
  data() {
    return {
      form: {
        settleCorpName: '',
        unitType: '',
        depositType: '',
        tenderDate: '',
        receipayType: '',
        settleCompName: '',
        applyName: '',
        applyPersonDeptName: '',
        currency: '',
        amt: '',
        orderNo: '',
        rivalBankName: '',
        bankAccBillNo: '',
        rivalAccountName: '',
        depositFileName: '',
        applyRemark: '',
      },
    }
  },
  created() {},
  methods: {},
}
</script>
<style scoped lang="scss">
.special_item {
  width: auto !important;
  ::v-deep .detail__content {
    width: auto !important;
  }
}
</style>