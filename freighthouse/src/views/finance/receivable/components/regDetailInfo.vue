<template>
  <div class="reg-detail-info">
    <h3 class="title">{{isPre ? '预收款' :'收款登记' }}</h3>
    <slot name="baseInfoSlot" />
    <DetailDiv
      v-if="isPre"
      label="预收款可用金额："
      :content="`${infoData.currency||''}<b>${infoData.balance===0?infoData.balance:(infoData.balance||'')}</b>`"
    />
    <DetailDiv
      v-else-if="!isEdit"
      label="收款金额："
      :content="`${infoData.currency||''}<b>${infoData.realAmt===0?infoData.realAmt:(infoData.realAmt||'')}</b>`"
    />
    <DetailDiv label="所属分公司：" :content="infoData.recvCompName" :isTooltip="true" />
    <DetailDiv label="代分公司收款：" :content="infoData.assistedCompName" :isTooltip="true" />
    <DetailDiv label="结算单位：" :content="infoData.settleCorpName" :isTooltip="true">
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
        <div class="title title-left">预收款信息</div>
        <div class="title-right" @click="showPreData = !showPreData">
          <span>{{ showPreData ? '收起' : '展开' }}</span>
          <span :class="[showPreData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
        </div>
      </div>
      <div class="toggle-body" v-show="showPreData">
        <DetailDiv label="预收款登记号：" :content="infoData.receivablePrerevNo" />
        <!-- TODO -->
        <DetailDiv label="预收款金额：" :content="`${infoData.currency}<b>${infoData.preceiveAmt}<b>`" />
        <!-- <DetailDiv label="预收可用金额：" :content="infoData.balance" /> -->
        <DetailDiv label="收款核销编号：" :isSlot="true">
          <el-button type="text" size="mini" @click="jumpToRoute">{{infoData.writeoffReceipayNo}}</el-button>
        </DetailDiv>
        <DetailDiv label="创建人：" :content="infoData.createdName" />
        <DetailDiv label="创建时间：" :content="infoData.createdTime" />
        <DetailDiv label="更新人：" :content="infoData.updatedName" />
        <DetailDiv label="更新时间：" :content="infoData.updatedTime" />
        <DetailDiv label="锁定状态：" :content="dictMapObj['finLockStatus'][infoData.lockStatus]" />
        <DetailDiv label="锁定原因：" :content="infoData.lockReason" :isFull="true" />
      </div>
    </div>
    <div class="toggle-two">
      <div class="toggle-div">
        <div class="toggle-title">
          <div class="title title-left">收款信息</div>
          <div class="title-right" @click="showRecData = !showRecData">
            <span>{{ showRecData ? '收起' : '展开' }}</span>
            <span :class="[showRecData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
          </div>
        </div>
        <div class="toggle-body" v-show="showRecData">
          <DetailDiv label="收款登记号：" :content="recInfo.receivableRegNo" :isFull="true" />
          <!-- dictMapObj['fin_lock_status'][infoData.lockStatus] -->
          <DetailDiv label="收款单类型：" :content="dictMapObj['receivableRegType'][recInfo.type]" />
          <DetailDiv
            label="收款登记状态："
            :content="dictMapObj['receivableRegStatus'][recInfo.confirmStatus]"
          />
          <slot name="receiveInfoSlot" />
          <DetailDiv v-if="!isEdit" label="收付日期：" :content="recInfo.recvDate" />
          <DetailDiv
            v-if="isPre"
            label="收款金额："
            :content="`${recInfo.currency}<b>${recInfo.realAmt}</b>`"
          />
          <DetailDiv
            v-if="!isEdit"
            label="收款方式："
            :content="dictMapObj['recvWay'][recInfo.recvWay]"
          />
          <DetailDiv v-if="!isEdit" label="银行简称：" :content="recInfo.accountShortName" :isTooltip="true"/>
          <DetailDiv label="收款账号：" :content="recInfo.accountNo" />
          <DetailDiv
            v-if="!isEdit"
            label="账户结算方式："
            :content="dictMapObj['bankAccountSettleMode'][recInfo.settleMode]"
          />
          <slot name="bankSeqNoSlot" />
          <DetailDiv v-if="!isEdit" label="银行流水：" :content="recInfo.bankSeqNo" :isTooltip="true" />
          <DetailDiv label="到账水单：" :isSlot="true">
            <el-tooltip
              v-if="recInfo.bankseqFileName"
              :content="recInfo.bankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="vmShowAttachment(recInfo.bankseqFileCode)"
                :closable="recInfo.writeoffStatus !== 'finish'"
                @close="handleClose('bankseq')"
              >{{ recInfo.bankseqFileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv label="创建人：" :content="recInfo.createdName" />
          <DetailDiv label="创建时间：" :content="recInfo.createdTime" />
          <DetailDiv label="更新人：" :content="recInfo.updatedName" />
          <DetailDiv label="更新时间：" :content="recInfo.updatedTime" />
          <DetailDiv label="交易备注：" :content="recInfo.remark" :isFull="true" :isTooltip="true" />
        </div>
      </div>
      <div class="toggle-div">
        <div class="toggle-title">
          <div class="title title-left">付款信息</div>
          <div class="title-right" @click="showPayData = !showPayData">
            <span>{{ showPayData ? '收起' : '展开' }}</span>
            <span :class="[showPayData?'el-icon-arrow-up':`el-icon-arrow-down`]"></span>
          </div>
        </div>
        <div class="toggle-body" v-show="showPayData">
          <slot name="payInfoSlot" />
          <DetailDiv
            v-if="!isEdit"
            label="付款银行："
            :content="`${recInfo.payBankName}${!recInfo.payBankBranch?'':'('+recInfo.payBankBranch+')'}`"
            :isFull="true"
          />
          <DetailDiv
            v-if="!isEdit"
            label="付款账户名："
            :content="recInfo.payAccountName"
            :isTooltip="true"
          />
          <DetailDiv v-if="!isEdit" label="付款账号：" :content="recInfo.payAccountNo" />
          <DetailDiv v-if="!isEdit" label="发卡行国家：" :content="recInfo.payAccountCountryName" />
          <DetailDiv
            v-if="!isEdit"
            label="付款账户类型："
            :content="dictMapObj['accountType'][recInfo.payAccountPublicType]"
          />
          <DetailDiv v-if="!isEdit" label="SWIFT CODE：" :content="recInfo.payAccountSwiftCode" />
          <DetailDiv label="客户付款水单：" :isSlot="true">
            <el-tooltip
              v-if="recInfo.payBankseqFileName"
              :content="recInfo.payBankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="vmShowAttachment(recInfo.payBankseqFileNo)"
              >{{ recInfo.payBankseqFileName }}</el-tag>
              <!-- 不需删除，可以利用上传按钮进行文件替换 -->
              <!-- closable
              @close="handleClose('payBankseq')"-->
            </el-tooltip>
          </DetailDiv>
          <DetailDiv
            v-if="!isEdit"
            label="公司地址："
            :content="recInfo.payAccountBankCompAddr"
            :isFull="true"
          />
        </div>
      </div>
    </div>
    <!-- 修改结算单位 -->
    <el-dialog :visible.sync="exchangeCorpDialog" class="self-dialog" title="修改结算单位" width="500px">
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" label-width="80px" size="mini">
        <el-form-item label="结算单位：" style="margin-bottom: 0;" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            placeholder="请选择结算单位"
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
        <el-button @click="exchangeCorp" size="mini" type="warning">修改</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">取消</el-button>
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
    //关闭附件
    handleClose(val) {
      this.$confirmWarn('确定删除' + (val === 'bankseq' ? '到账水单附件' : '付款水单附件') + '？', () => {
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
        this.$msgSucClose(`${val === 'bankseq' ? '到账水单附件' : '付款水单附件'}删除成功!`)
        this.infoData.bankseqFileName = this.infoData.bankseqFileCode = ''
      })
    },
    // 修改结算单位
    exchangeCorp() {
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        let { value: settleCorpCode, label: settleCorpName } = this.corpForm.settleCorp
        updateSettleUnit({ receivableRegId: this.infoData.receivableRegId, settleCorpCode, settleCorpName }).then((res) => {
          this.$msgSucClose('修改成功！')
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
    .toggle-body {
      padding: 8px;
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
