<template>
  <div class="markerror-dialog-pay">
    <el-dialog
      title="标记受理"
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
          label-width="110px"
        >
          <DetailDiv
            style="font-size: 12px; width: 251px"
            label="付款单号："
            :content="item.payOrderNo"
          />
          <DetailDiv
            style="font-size: 12px"
            label="付款金额："
            :content="item.currency + ' ' + item.applyAmt"
          />
          <br />
          <!-- <el-form-item label="付款金额" prop="applyAmt">
                        <el-input disabled :value="item.currency + ' ' + item.applyAmt" placeholder="请输入"></el-input>
                    </el-form-item> -->
          <el-form-item
            label="付款方式："
            prop="payWay"
            :rules="{ required: true, message: ' ', trigger: 'change' }"
          >
            <el-select
              v-model="item.payWay"
              placeholder="请选择"
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
            label="付款银行简称："
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
              placeholder="请选择"
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
					<el-form-item v-if="(item.payWay==='hk_china'&&item.transferFeeDeductWay) || (item.payAccountData.payBankCode==='B0249H231000001'&&item.payAccountData.hasFixedTransferFee==='yes')" label="手续费扣款方式：" prop="transferFeeDeductWay" :rules="{ required: true, message: ' ', trigger: 'change' }">
            <!-- (item.payWay==='hk_china'&&item.transferFeeDeductWay) || item.payAccountData.hasFixedTransferFee==='yes' // 只判断花旗定价手续费，招行预扣手续费不判断 -->
						<el-select v-model="item.transferFeeDeductWay" placeholder="请选择"
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
            label="账户结算方式："
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
              placeholder="请选择账户结算方式"
            >
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
            label="付款银行："
            prop="payBankName"
          >
            <el-input
              disabled
              v-model="item.payBankName"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            label="付款账号："
            prop="payAccountNo"
          >
            <el-input
              disabled
              v-model="item.payAccountNo"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash'"
            label="付款账户名："
            prop="payAccountName"
          >
            <el-input
              disabled
              v-model="item.payAccountName"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="收款银行：" prop="recvBankName">
            <el-input
              disabled
              v-model="item.recvBankName"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="收款银行支行：" prop="recvBankBranch">
            <el-input
              disabled
              v-model="item.recvBankBranch"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="收款账号：" prop="recvAccountNo">
            <el-input
              disabled
              v-model="item.recvAccountNo"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="收款账户名：" prop="recvAccountName">
            <el-input
              disabled
              v-model="item.recvAccountName"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="item.payWay !== 'prepay_dedue' && item.payWay !== 'cash' && !item.settleOrderType.includes('customer_special')"
            label="SWIFT CODE："
            prop="swiftCode"
          >
            <el-input
              disabled
              v-model="item.swiftCode"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="身份证号：" prop="recvIdNo">
            <el-input
              disabled
              v-model="item.recvIdNo"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="手机号：" prop="recvMobileNo">
            <el-input
              disabled
              v-model="item.recvMobileNo"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="item.settleOrderType.includes('customer_special')" label="标识码：" prop="thirdPayChannelCode">
            <el-input
              disabled
              v-model="item.thirdPayChannelCode"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button
          size="mini"
          type="primary"
          :loading="loadingSave"
          @click="save"
          >提交</el-button
        >
        <el-button size="mini" @click="cancel">取消</el-button>
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
              return this.$msgErrClose("付款银行简称不能为空！");
            }
          }
          if (
            list[i].orderType === "prepay" &&
            list[i].payWay === "prepay_dedue"
          ) {
            return this.$msgErrClose("预付付款单不允许使用预付抵账付款方式");
          }
        }
      }
      // return console.log(list);
      this.loadingSave = true;
      acceptancePayOrder(list)
        .then((res) => {
          this.$message({ message: "标记受理提交成功", type: "success" });
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
  ::v-deep .detail__div{
    margin-right: 10px;
    .detail__label{
      width: 110px !important;
    }
  }
}
</style>