<template>
  <div class="reg-detail-info">
    <h3 class="title">{{isPre ? $t('Collect.preCollect') :$t('Collect.receiptReg')}}</h3>
    <slot name="baseInfoSlot" />
    <DetailDiv
      v-if="isPre"
      :label="$t('Settle.advanceAmt')"
      :content="`${infoData.currency||''}<b>${infoData.balance===0?infoData.balance:(infoData.balance||'')}</b>`"
    />
    <DetailDiv
      v-else-if="!isEdit"
      :label="$t('Collect.amtReceived')"
      :content="`${infoData.currency||''}<b>${infoData.realAmt===0?infoData.realAmt:(infoData.realAmt||'')}</b>`"
    />
    <DetailDiv :label="$t('Settle.branchCompany')" :content="infoData.recvCompName" :isTooltip="true" />
    <DetailDiv :label="$t('Collect.branchCollect')" :content="infoData.assistedCompName" :isTooltip="true" />
    <DetailDiv :label="$t('FeeList.settleCorp')" :content="infoData.settleCorpName" :isTooltip="true">
      <!-- 收款核销 且 未完成核销 才能修改结算单位，。 20211101 核销前可修改结算单位，此处不需要了 -->
      <!-- <i
        v-if="!isPre && infoData.writeoffStatus !== 'finish'"
        class="el-icon el-icon-edit"
        slot="afterIcon"
        @click="exchangeCorpDialog = true"
      ></i>-->
    </DetailDiv>
    <div class="toggle-div" v-if="isPre">
      <div class="toggle-title">
        <div class="title title-left">{{$t('Settle.advanceRe')}}</div>
        <div class="title-right" @click="showPreData = !showPreData">
          <span>{{ showPreData ? $t('Common.collapse') : $t('Common.expand')}}</span>
          <span :class="[showPreData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
        </div>
      </div>
      <div class="toggle-body" v-show="showPreData">
        <DetailDiv :label="$t('Collect.advanceNo')" :content="infoData.receivablePrerevNo" label-width="260"/>
        <!-- TODO -->
        <DetailDiv :label="$t('Collect.amountReceipts')" :content="`${infoData.currency}<b>${infoData.preceiveAmt}<b>`" />
        <!-- <DetailDiv label="预收可用金额：" :content="infoData.balance" /> -->
        <DetailDiv :label="$t('Settle.receiptwfNo')" :isSlot="true">
          <el-button type="text" size="mini" @click="jumpToRoute">{{infoData.writeoffReceipayNo}}</el-button>
        </DetailDiv>
        <DetailDiv :label="$t('Common.createdBy')" :content="infoData.createdName" />
        <DetailDiv :label="$t('Common.createTime')" :content="infoData.createdTime" />
        <DetailDiv :label="$t('Common.updatedBy')" :content="infoData.updatedName" />
        <DetailDiv :label="$t('Common.updateTime')" :content="infoData.updatedTime" />
        <DetailDiv :label="$t('Collect.lockStatus')" :content="dictMapObj['finLockStatus'][infoData.lockStatus]" />
        <DetailDiv :label="$t('FeeList.lockReason')" :content="infoData.lockReason" :isFull="true" />
      </div>
    </div>
    <div class="toggle-two">
      <div class="toggle-div">
        <div class="toggle-title">
          <div class="title title-left">{{$t('Collect.receiptInfo')}}</div>
          <div class="title-right" @click="showRecData = !showRecData">
            <span>{{ showRecData ? $t('Common.collapse') : $t('Common.expand') }}</span>
            <span :class="[showRecData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
          </div>
        </div>
        <div class="toggle-body" v-show="showRecData">
          <DetailDiv :label="$t('Collect.receivableRegNo')" :content="recInfo.receivableRegNo" :isFull="true" />
          <!-- dictMapObj['fin_lock_status'][infoData.lockStatus] -->
          <DetailDiv :label="$t('Collect.receiptType')" :content="dictMapObj['receivableRegType'][recInfo.type]" />
          <DetailDiv
            :label="$t('Collect.receiptStatus')"
            :content="dictMapObj['receivableRegStatus'][recInfo.confirmStatus]"
          />
          <slot name="receiveInfoSlot" />
          <DetailDiv v-if="!isEdit" :label="$t('FeeList.receivePayDates')" :content="recInfo.recvDate" />
          <DetailDiv
            v-if="isPre"
            :label="$t('Collect.amtReceived')"
            :content="`${recInfo.currency}<b>${recInfo.realAmt}</b>`"
          />
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Collect.recvWay')"
            :content="dictMapObj['recvWay'][recInfo.recvWay]"
          />
          <DetailDiv v-if="!isEdit" :label="$t('PreClose.bankabbr')" :content="recInfo.accountShortName" />
          <DetailDiv :label="$t('Settle.recvAccountNo')" :content="recInfo.accountNo" />
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Settle.settleMode')"
            :content="dictMapObj['bankAccountSettleMode'][recInfo.settleMode]"
          />
          <slot name="bankSeqNoSlot" />
          <DetailDiv v-if="!isEdit" :label="$t('FinBill.bankSerial')" :content="recInfo.bankSeqNo" :isTooltip="true" />
          <DetailDiv :label="$t('Collect.waterBill')" :isSlot="true">
            <el-tooltip
              v-if="recInfo.bankseqFileName"
              :content="recInfo.bankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="showAttachment(recInfo.bankseqFileCode, recInfo.bankseqFileName)"
                :closable="recInfo.writeoffStatus !== 'finish'"
                @close="handleClose('bankseq')"
              >{{ recInfo.bankseqFileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv :label="$t('Common.createdBy')" :content="recInfo.createdName" />
          <DetailDiv :label="$t('Common.createTime')" :content="recInfo.createdTime" />
          <DetailDiv :label="$t('Common.updatedBy')" :content="recInfo.updatedName" />
          <DetailDiv :label="$t('Common.updateTime')" :content="recInfo.updatedTime" />
          <DetailDiv :label="$t('Collect.transRemarks')" :content="recInfo.remark" :isFull="true" :isTooltip="true" />
        </div>
      </div>
      <div class="toggle-div">
        <div class="toggle-title">
          <div class="title title-left">{{$t('Settle.paymentInfo')}}</div>
          <div class="title-right" @click="showPayData = !showPayData">
            <span>{{ showPayData ? $t('Common.collapse') : $t('Common.expand') }}</span>
            <span :class="[showPayData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
          </div>
        </div>
        <div class="toggle-body" v-show="showPayData">
          <slot name="payInfoSlot" />
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Collect.paymentBank')"
            :content="`${recInfo.payBankName}${!recInfo.payBankBranch?'':'('+recInfo.payBankBranch+')'}`"
            :isFull="true"
          />
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Collect.accountName')"
            :content="recInfo.payAccountName"
            :isTooltip="true"
          />
          <DetailDiv v-if="!isEdit" :label="$t('Collect.accountNumber')" :content="recInfo.payAccountNo" />
          <DetailDiv v-if="!isEdit" :label="$t('Collect.payAccountCountry')" :content="recInfo.payAccountCountryName" />
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Collect.paymentAccountType')"
            :content="dictMapObj['accountType'][recInfo.payAccountPublicType]"
          />
          <DetailDiv v-if="!isEdit" label="SWIFT CODE" :content="recInfo.payAccountSwiftCode" />
          <DetailDiv :label="$t('Collect.paymentWaterBill')" :isSlot="true">
            <el-tooltip
              v-if="recInfo.payBankseqFileName"
              :content="recInfo.payBankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="showAttachment(recInfo.payBankseqFileNo, recInfo.payBankseqFileName)"
              >{{ recInfo.payBankseqFileName }}</el-tag>
              <!-- 不需删除，可以利用上传按钮进行文件替换 -->
              <!-- closable
              @close="handleClose('payBankseq')"-->
            </el-tooltip>
          </DetailDiv>
          <DetailDiv
            v-if="!isEdit"
            :label="$t('Settle.recvRegAddr')"
            :content="recInfo.payAccountBankCompAddr"
            :isFull="true"
          />
        </div>
      </div>
    </div>
    <!-- 修改结算单位 -->
    <el-dialog :visible.sync="exchangeCorpDialog" class="self-dialog" :title="$t('Settle.modifyset')" width="500px">
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" label-width="80px" size="mini">
        <el-form-item :label="$t('FeeList.settleCorp')" style="margin-bottom: 0;" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="item in settleCorpSelectList"
              :key="item.value"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="warning">{{$t('Common.modify')}}</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { updateSettleUnit } from '@/api/fin/receivableReg'
import { regDeleteBankseqFile } from '@/api/fin/receivableReg'
export default {
  name: 'regDetailInfo',
  props: {
    infoData: {
      type: Object,
      default: () => ({ receivableReg: {} }),
    },
    isPre: '',
  },
  computed: {
    ...mapState({ dictMapObj: (state) => state.dict.dictMapObj }),
    recInfo() {
      return !this.isPre ? this.infoData : this.infoData.receivableReg || {}
    },
    isEdit() {
      return this.$attrs.isEdit
    },
  },
  data() {
    return {
      showPreData: true,
      showRecData: true,
      showPayData: true,
      exchangeCorpDialog: false,
      corpForm: { settleCorp: '' },
      corpRules: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      settleCorpSelectList: [],
    }
  },
  watch: {
    exchangeCorpDialog(val) {
      if (val) {
        this.corpForm.settleCorp = ''
        this.$nextTick(() => this.$refs.corpForm.clearValidate())
      }
    },
  },
  methods: {
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, containTemporary: 'all' }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    showAttachment(path, name) {
      window.open(`/base/fileView/preview/${path}/sowoll`)
    },
    //关闭附件
    handleClose(val) {
      let text = val === 'bankseq' ? this.$t('Setle.delincom') : this.$t('Setle.delpayment')
      this.$confirmWarn( text, () => {
        this.handleCloseDelete(val)
      })
    },
    handleCloseDelete(val) {
      console.log(this.infoData)
      let data = { bankseqFileCode: undefined }
      if (this.infoData.receivableRegId) {
        data.receivableRegId = this.infoData.receivableRegId
      }
      //水单附件
      regDeleteBankseqFile(data).then((res) => {
        let text = val === 'bankseq' ? this.$t('Setle.incomSuc') : this.$t('Setle.paymentSucDel')
        this.$msgSucClose(text)
        this.infoData.bankseqFileName = this.infoData.bankseqFileCode = ''
      })
    },
    // 修改结算单位
    exchangeCorp() {
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        let { value: settleCorpCode, label: settleCorpName } = this.corpForm.settleCorp
        updateSettleUnit({ receivableRegId: this.infoData.receivableRegId, settleCorpCode, settleCorpName }).then((res) => {
          this.$msgSucClose(this.$t('Hedge.modifyTips'))
          this.infoData.settleCorpCode = settleCorpCode
          this.infoData.settleCorpName = settleCorpName
          this.exchangeCorpDialog = false
        })
      })
    },
    jumpToRoute() {
      let data = {
        name: 'WriteoffRecvDetail2',
        query: {
          source: 'writeoffRecvDetail',
          receivableRegId: this.infoData.receivableRegId,
          writeoffReceipayNo: this.infoData.writeoffReceipayNo,
        },
        params: { writeoffNo: this.infoData.writeoffReceipayNo },
      }
      this.$emit('jumpToRoute', data)
    },
  },
}
</script>
<style scoped lang="scss">
.reg-detail-info {
  padding: 0 8px;
  & > .title {
    border-bottom: 1px solid #e9e9e9;
    margin-bottom: 8px;
  }
  .title {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    font-weight: 600;
    color: #222222;
  }
  .toggle-two {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 8px;
    & > div {
      width: calc(50% - 4px);
    }
  }
  .detail__div {
    width: 25% !important;
    margin-right: 0;
  }
  .toggle-div {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    overflow: hidden;
    .toggle-title {
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      background: #f8f9fd;
      height: 30px;
      line-height: 30px;
      .title-right {
        cursor: pointer;
        & > span:nth-child(1) {
          padding-right: 4px;
        }
      }
    }
    /deep/.toggle-body {
      padding: 8px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;
      .detail__div,.el-form-item {
        width: 48% !important;
        margin-right: 0;
        .detail__label,.el-form-item__label{
          width: 200px !important;
        }
        .el-date-editor{
          width: 100%;
        }
      }
    }
  }
  .el-icon.el-icon-edit {
    color: #1890ff;
    cursor: pointer;
    line-height: 20px;
    // position: absolute;
    // right: -10px;
    font-size: 14px;
  }
}
</style>
