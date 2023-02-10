<template>
  <div class="markerror-dialog-pay">
    <el-dialog
      :title="$t('PayApplyList.markAcceptance')"
      width="880px"
      :visible.sync="loadingOpen"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      @closed="cancel"
    >
      <div
        class="markerror-dialog"
        v-for="(item, index) in payOrderNoList"
        :key="item + index"
      >
        <div v-if="index !== 0" class="markerror-dialog-solid"></div>
        <el-form
          :model="item"
          :ref="'form' + index"
          :inline="true"
          size="mini"
          label-width="180px"
        >
          <DetailDiv
            style="font-size:12px;"
            :width="'332'"
            :label="$t('PayApplyList.payOrderNo')"
            :content="item.payOrderNo"
          />
          <DetailDiv
            style="font-size:12px;"
            :width="'332'"
            :label="$t('PayApplyList.payAmt')"
            :content="item.currency + ' ' + item.applyAmt"
          />
          <br />
          <!-- <el-form-item :label="$t('PayApplyList.payAmt')" prop="applyAmt">
                        <el-input disabled :value="item.currency + ' ' + item.applyAmt" :placeholder="$t('Common.plEnter')"></el-input>
                    </el-form-item> -->
          <el-form-item
            :label="$t('PayApplyList.payWay')+': '"
            prop="payWay"
            :rules="{ required: true, message: ' ', trigger: 'change' }"
          >
            <el-select
              v-model="item.payWay"
              :placeholder="$t('Common.plSelect')"
              @change="payWayChange(item)"
            >
              <el-option
                v-for="it in dictMap['payWay']"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            :label="$t('PayApplyList.payAccountShortName')+': '"
            prop="payAccountData"
            :rules="{
              required: !['prepay_dedue', 'cash', 'cheque'].includes(
                item.payWay
              ),
              message: ' ',
              trigger: 'blur',
            }"
          >
            <el-select
              v-model="item.payAccountData"
              :placeholder="$t('Common.plSelect')"
              @change="payAccountShortNameChange(item)"
              value-key="settleUnitBankAcctId"
            >
              <el-option
                v-for="it in item.payAccountShortNameList"
                :key="it.settleUnitBankAcctId"
                :label="it.value"
                :value="it"
              >
              </el-option>
            </el-select>
          </el-form-item>
					<el-form-item v-if="(item.payWay==='hk_china'&&item.transferFeeDeductWay) || (item.payAccountData.payBankCode==='B0249H231000001'&&item.payAccountData.hasFixedTransferFee==='yes')" :label="$t('PayApplyList.transferFeeDeductWay')+': '" prop="transferFeeDeductWay" :rules="{ required: true, message: ' ', trigger: 'change' }">
            <!-- (item.payWay==='hk_china'&&item.transferFeeDeductWay) || item.payAccountData.hasFixedTransferFee==='yes' // 只判断花旗定价手续费，招行预扣手续费不判断 -->
						<el-select v-model="item.transferFeeDeductWay" :placeholder="$t('Common.plSelect')"
						>
							<el-option
								v-for="it in dictMap['transferFeeDeductWay']"
								:key="it.value"
								:label="it.label"
								:value="it.value">
							</el-option>
						</el-select>
					</el-form-item>
          <el-form-item
            v-if="!['prepay_dedue', 'cash'].includes(item.payWay)"
            :label="$t('PayApplyList.settleMode')+': '"
            prop="settleMode"
            :rules="{
              required: !['prepay_dedue', 'cash', 'intrabranch'].includes(
                item.payWay
              ),
              message: ' ',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="item.settleMode"
              clearable
              :placeholder="$t('OrderFee.plsSelect')"
            ><!-- placeholder="请选择账户结算方式" -->
              <el-option
                v-for="it in item.bankAccountSettleModeList"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            :label="$t('PayApplyList.payBankName')+': '"
            prop="payBankName"
          >
            <el-input
              disabled
              v-model="item.payBankName"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            :label="$t('PayApplyList.payAccountNo')+': '"
            prop="payAccountNo"
          >
            <el-input
              disabled
              v-model="item.payAccountNo"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            :label="$t('PayApplyList.payAccountName')+': '"
            prop="payAccountName"
          >
            <el-input
              disabled
              v-model="item.payAccountName"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('PayApplyList.recvBankName')+': '" prop="recvBankName">
            <el-input
              disabled
              v-model="item.recvBankName"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('PayApplyList.recvBankBranch')+': '" prop="recvBankBranch">
            <el-input
              disabled
              v-model="item.recvBankBranch"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('Settle.recvAccountNo')+': '" prop="recvAccountNo">
            <el-input
              disabled
              v-model="item.recvAccountNo"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('PayApplyList.recvAccountName')+': '" prop="recvAccountName">
            <el-input
              disabled
              v-model="item.recvAccountName"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash' && !item.settleOrderType.includes('customer_special')"
            label="SWIFT CODE: "
            prop="swiftCode"
          >
            <el-input
              disabled
              v-model="item.swiftCode"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <!-- 海外版不显示
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="身份证号：" prop="recvIdNo">
            <el-input
              disabled
              v-model="item.recvIdNo"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="手机号：" prop="recvMobileNo">
            <el-input
              disabled
              v-model="item.recvMobileNo"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="标识码：" prop="thirdPayChannelCode">
            <el-input
              disabled
              v-model="item.thirdPayChannelCode"
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item> -->
        </el-form>
      </div>
      <div slot="footer">
        <el-button
          size="mini"
          type="primary"
          :loading="loadingSave"
          @click="save"
          >{{$t('Common.submit')}}</el-button
        >
        <el-button size="mini" @click="cancel">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { mixin } from "@/views/finance/orderFee/orderFee/mixin";
import { acceptancePayOrder } from "@/api/fin/pay.js";
export default {
  name: "markError",
  props: {
    payOrderNoList: {
      type: Array,
      default: () => ({}),
    },
    dialogShow: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    dialogShow: {
      handler(val) {
        this.loadingOpen = val;
        clearTimeout(this.timer2);
        this.timer2 = setTimeout(() => {
          if (val) {
            for (let i = 0; i < this.payOrderNoList.length; i++) {
              console.log(this.payOrderNoList[i]);
              let hasIntrabranch = "";
              let hasChequeAcct = "";
              let countryOrgType = this.payOrderNoList[i].payWay;
              let unitCode = this.payOrderNoList[i].payCompCode;
              if (this.payOrderNoList[i].payWay === "intrabranch") {
                hasIntrabranch = "yes";
                countryOrgType = "";
              }
              if (this.payOrderNoList[i].payWay === "cheque") {
                hasChequeAcct = "yes";
                countryOrgType = "";
              }
              let queryString = {
                accountShortName: "",
                receipayType: "pay",
                hasIntrabranch,
                hasChequeAcct,
                currency: this.payOrderNoList[i].currency,
                countryOrgType,
                unitCode,
              };
              this.$store
                .dispatch("dict/companyBankAccountList", queryString)
                .then((data) => {
                  data.forEach(item => item.payBankCode = item.bankCode)
                  this.payOrderNoList[i].payAccountShortNameList = data || [];
                  if(!data.length){
                    this.payOrderNoList[i].settleMode = ''
                  }
                  if (this.payOrderNoList[i].payAccountNo) {
                    for (let j = 0; j < data.length; j++) {
                      if (
                        data[j].accountNo ===
                        this.payOrderNoList[i].payAccountNo
                      ) {
                        Object.assign(this.payOrderNoList[i], {
                          payAccountShortName: data[j].accountShortName,
                          payBankName: data[j].bankName,
                          payAccountName: data[j].accountName,
                          payAccountNo: data[j].accountNo,
                          payBankAccountId: data[j].settleUnitBankAcctId,
                          payBankCode: data[j].bankCode,
                          swiftCode: data[j].swiftCode,
                          bankAccountSettleModeList: (
                            data[j].settleMode || [this.payOrderNoList[i].settleMode]
                          ).filter(v=>v).map((items) => {
                            let dict = this.dictMap.bankAccountSettleMode;
                            return dict.find((v) => v.value === items);
                          }),
                          settleMode: this.payOrderNoList[i].settleMode
                            ? this.payOrderNoList[i].settleMode
                            : data[j].settleMode.length
                            ? data[j].settleMode[0]
                            : "",
                        });
                        data[j].payBankCode = data[j].bankCode
                        this.payOrderNoList[i].payAccountData = data[j];
                        // bankAccountSettleModeList = (data[j].settleMode || []).map((items) => {
                        // 	let dict = this.dictMap.bankAccountSettleMode
                        // 	return dict.find((v) => v.value === items)
                        // })
                        console.log(this.payOrderNoList);
                        return;
                      }
                    }
                    // this.payOrderNoList[i].bankAccountSettleModeList = bankAccountSettleModeList
                    if(!this.payOrderNoList[i].bankAccountSettleModeList.length && this.payOrderNoList[i].settleMode){
                      this.payOrderNoList[i].bankAccountSettleModeList = [this.payOrderNoList[i].settleMode].map((items) => {
                        let dict = this.dictMap.bankAccountSettleMode;
                        return dict.find((v) => v.value === items);
                      })
                    }
                    return this.$forceUpdate();
                  }
                  if (this.payOrderNoList[i].payCompCode !== "000001") {
                    for (let j = 0; j < data.length; j++) {
                      if (data[j].hasDefault === "yes") {
                        Object.assign(this.payOrderNoList[i], {
                          payAccountShortName: data[j].accountShortName,
                          payBankName: data[j].bankName,
                          payAccountName: data[j].accountName,
                          payAccountNo: data[j].accountNo,
                          payBankAccountId: data[j].settleUnitBankAcctId,
                          payBankCode: data[j].bankCode,
                          swiftCode: data[j].swiftCode,
                          bankAccountSettleModeList: (
                            data[j].settleMode || [this.payOrderNoList[i].settleMode]
                          ).filter(v=>v).map((items) => {
                            let dict = this.dictMap.bankAccountSettleMode;
                            return dict.find((v) => v.value === items);
                          }),
                          settleMode: this.payOrderNoList[i].settleMode
                            ? this.payOrderNoList[i].settleMode
                            : data[j].settleMode.length
                            ? data[j].settleMode[0]
                            : "",
                        });
                        data[j].payBankCode = data[j].bankCode
                        this.payOrderNoList[i].payAccountData = data[j];
                        return;
                      }
                    }
                  } else {
                    Object.assign(this.payOrderNoList[i], {
                      payAccountShortName: "",
                      payBankName: "",
                      payAccountName: "",
                      payAccountNo: "",
                      payBankAccountId: "",
                      swiftCode: "",
                      bankAccountSettleModeList: [],
                      settleMode: ''
                    });
                    this.payOrderNoList[i].payAccountData = {};
                  }
                  if(!this.payOrderNoList[i].bankAccountSettleModeList.length && this.payOrderNoList[i].settleMode){
                    this.payOrderNoList[i].bankAccountSettleModeList = [this.payOrderNoList[i].settleMode].map((items) => {
                      let dict = this.dictMap.bankAccountSettleMode;
                      return dict.find((v) => v.value === items);
                    })
                  }
                  this.$forceUpdate();
                });
            }
          }
        }, 100);
      },
      immediate: true,
    },
  },
  mixins: [mixin],
  data() {
    return {
      loadingSave: false,
      payAccountShortNameList: [],
      bankAccountSettleModeList: [],
      loadingOpen: false,
    };
  },
  computed: {},
  created() {
    //我司付款账号
    let alias1 = this;
    this.autocomplete1 = {
      querySearch: (queryString, cb) => {
        alias1.selectedOptionItem = "";
        alias1.companyBankAccountList(
          {
            accountShortName: queryString,
            receipayType: "pay",
            currency: "",
            countryOrgType: "",
            unitCode: "",
          },
          cb
        );
      },
      select: (optionItem, row) => {
        console.log(optionItem);
        alias1.selectedOptionItem = optionItem;
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (alias1.selectedOptionItem === "") {
            return;
          }
        }, 150);
      },
    };
  },
  methods: {
    save() {
      let formValid = true;
      // this.payOrderNoList.forEach((item, index) => {
      //   this.$refs["form" + index][0].validate((valid) => {
      //     if (!valid) {
      //       formValid = false;
      //     }
      //   });
      // });
      // if (!formValid) return;
      let list = [];
      this.payOrderNoList.forEach((item) => {
        list.push({
          payOrderNo: item.payOrderNo,
          confirmStatus: "pass",
          settleMode: item.settleMode,
          payBankAccountId: item.payBankAccountId,
          payWay: item.payWay,
          orderType: item.orderType,
          payAccountNo: item.payAccountNo,
					payAccountShortName: item.payAccountData.accountShortName,
					transferFeeDeductWay: item.transferFeeDeductWay
        });
			});
      if (list.length) {
        for (let i = 0; i < list.length; i++) {
          if (
            list[i].payWay !== "prepay_dedue" &&
            list[i].payWay !== "cash" &&
            list[i].payWay !== "cheque"
          ) {
            if (!list[i].payAccountShortName) {
              return this.$msgErrClose(this.$t('PayApplyList.payShortNotEmpty')); // 付款银行简称不能为空！
            }
          }
          if (
            list[i].orderType === "prepay" &&
            list[i].payWay === "prepay_dedue"
          ) {
            return this.$msgErrClose(this.$t('PayApplyList.prepayNotPayByDedut')); // 预付付款单不允许使用预付抵账付款方式
          }
        }
      }
      // return console.log(list);
      this.loadingSave = true;
      acceptancePayOrder(list)
        .then((res) => {
          this.$message({ message: this.$t('OrderFee.successOp'), type: "success" }); // "标记受理提交成功"
          this.$emit("payOrderNoListClose", false, true);
        })
        .finally(() => {
          this.loadingSave = false;
        });
    },

    companyBankAccountList(queryString, cb) {
      this.$store
        .dispatch("dict/companyBankAccountList", queryString)
        .then((data) => {
          cb(data);
        });
    },
    cancel() {
      this.$emit("payOrderNoListClose", false);
    },
    payAccountShortNameChange(item) {
      item.payBankName = item.payAccountData.bankName;
      item.payAccountName = item.payAccountData.accountName;
      item.payAccountNo = item.payAccountData.accountNo;
      item.swiftCode = item.payAccountData.swiftCode;
      item.payBankAccountId = item.payAccountData.settleUnitBankAcctId;
      item.payBankCode = item.payAccountData.payBankCode
      item.settleModeList = item.payAccountData.settleMode;
      console.log(this.dictMap.bankAccountSettleMode);
      console.log(item);
      item.settleMode = item.payAccountData.settleMode.length
        ? item.payAccountData.settleMode[0]
        : "";
      item.bankAccountSettleModeList = (
        item.payAccountData.settleMode || []
      ).map((items) => {
        let dict = this.dictMap.bankAccountSettleMode;
        return dict.find((v) => v.value === items);
			});
      // for (let i = 0; i < list.length; i++) {
      // 	if(list[i].value === val){
      // 		console.log(list[i]);
      // 		item.payBankName = list[i].bankName
      // 		item.payAccountName = list[i].accountName
      // 		item.payAccountNo = list[i].accountNo
      // 		item.swiftCode = list[i].swiftCode
      // 		item.payBankAccountId = list[i].settleUnitBankAcctId
      // 	}
      // }
    },
    payWayChange(item) {
      item.bankAccountSettleModeList = [];
      item.settleMode = "";
      item.payAccountShortName = "";
      item.payBankName = "";
      item.payAccountName = "";
      item.payAccountNo = "";
      item.swiftCode = "";
      item.payBankAccountId = "";
      item.payAccountData = "";
      let hasIntrabranch = "";
      let countryOrgType = item.payWay;
      if (item.payWay === "intrabranch") {
        hasIntrabranch = "yes";
        countryOrgType = "";
      }
      let hasChequeAcct = "";
      if (item.payWay === "cheque") {
        hasChequeAcct = "yes";
        countryOrgType = "";
      }
      let unitCode = item.payCompCode;
      let queryString = {
        accountShortName: "",
        receipayType: "pay",
        currency: item.currency,
        hasIntrabranch,
        hasChequeAcct,
        countryOrgType,
        unitCode,
      };
      this.$store
        .dispatch("dict/companyBankAccountList", queryString)
        .then((data) => {
          data.forEach(item => item.payBankCode = item.bankCode)
          item.payAccountShortNameList = data || [];
          if (item.payAccountName) {
            for (let j = 0; j < data.length; j++) {
              if (data[j].accountNo === item.payAccountNo) {
                Object.assign(item, {
                  payAccountShortName: data[j].accountShortName,
                  payBankName: data[j].bankName,
                  payAccountName: data[j].accountName,
                  payAccountNo: data[j].accountNo,
                  payBankAccountId: data[j].settleUnitBankAcctId,
                  payBankCode: data[j].bankCode,
                  swiftCode: data[j].swiftCode,
                  bankAccountSettleModeList: (data[j].settleMode || []).map(
                    (items) => {
                      let dict = this.dictMap.bankAccountSettleMode;
                      return dict.find((v) => v.value === items);
                    }
                  ),
                  settleMode: data[j].settleMode.length
                    ? data[j].settleMode[0]
                    : "",
                });
                data[j].payBankCode = data[j].bankCode
                console.log(item.payAccountData)
                return (item.payAccountData = data[j]);
              }
            }

            return this.$forceUpdate();
          }
          if (item.payCompCode !== "000001") {
            for (let j = 0; j < data.length; j++) {
              if (data[j].hasDefault === "yes") {
                Object.assign(item, {
                  payAccountShortName: data[j].accountShortName,
                  payBankName: data[j].bankName,
                  payAccountName: data[j].accountName,
                  payAccountNo: data[j].accountNo,
                  payBankAccountId: data[j].settleUnitBankAcctId,
                  swiftCode: data[j].swiftCode,
                  bankAccountSettleModeList: (data[j].settleMode || []).map(
                    (items) => {
                      let dict = this.dictMap.bankAccountSettleMode;
                      return dict.find((v) => v.value === items);
                    }
                  ),
                  settleMode: data[j].settleMode.length
                    ? data[j].settleMode[0]
                    : "",
                });
                data[j].payBankCode = data[j].bankCode
                return (item.payAccountData = data[j]);
              }
            }
          } else {
            Object.assign(item, {
              payAccountShortName: "",
              payBankName: "",
              payAccountName: "",
              payAccountNo: "",
              payBankAccountId: "",
              swiftCode: "",
            });
            item.payAccountData = {};
          }
          this.$forceUpdate();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.markerror-dialog {
  padding: 0 16px 2px;
  .markerror-dialog-solid {
    padding-top: 16px;
    border-top: 1px solid #e9e9e9;
  }
  ::v-deep .el-form-item {
    width: 332px;
  }
  ::v-deep .detail__div{
    margin-right: 10px;
    .detail__label{
      width: 180px !important;
    }
  }
}
</style>