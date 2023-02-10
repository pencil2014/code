<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div v-if="overseasFreightIsOnlyEnchars" style="color:red;font-size:14px;margin-bottom:8px">Tips: Please enter English, numbers and English symbols in the input box !</div>
    <el-form ref="custNoUpdataForm" id="resultFeedbackPop" :rules="rules" :model="createItem" label-position="top" :show-message="false">
      <el-form-item label="Successful bid results" prop="isBid" key="isBid">
        <el-radio-group v-model="createItem.isBid">
          <el-radio :label="'Y'">Awarded</el-radio>
          <el-radio :label="'N'">Unsuccessful bid</el-radio>
          <el-radio :label="'C'">To be determined</el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="createItem.isBid==='Y'">
        <el-form-item label="Successful bid scheme" prop="bidQuoteId" key="bidQuoteId">
          <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.bidQuoteId" filterable placeholder="Please select" style="width:100%">
            <el-option v-for="(item,index) in quoteOptions" :key="'bidQuoteId'+index" :label="item.schemeNumber" :value="item.oid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Order No." prop="orderNoList" key="orderNoList">
          <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.orderNoList" multiple collapse-tags filterable remote reserve-keyword :remote-method="(val)=>{ orderRemoteMethod(val)}" @focus="orderRemoteMethod('')" clearable placeholder="Please select" style="width: 100%">
            <el-option v-for="(item, index) in orderNoArr" :label="item" :value="item" :key="'orderNoList'+index"> </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div v-if="createItem.isBid==='N'">
        <el-form-item label="Reason for Unsuccessful bids" prop="bidNoReason" key="bidNoReason">
          <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.bidNoReason" multiple collapse-tags filterable placeholder="Please select" style="width:100%">
            <el-option v-for="(item,index) in dictMap.inquiryNoBidReason" :key="index" :label="item.en" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div v-if="createItem.isBid==='N'">
        <el-form-item label="" prop="bidNoRemark" key="bidNoRemark">
          <el-input type="textarea" size="mini" :rows="2" maxlength="2048" show-word-limit placeholder="Please write as much details as possible about the reasons for unsuccessful bids, including but not limited to the winning peer/ship division, peer price, etc." v-model="createItem.bidNoRemark">
          </el-input>
        </el-form-item>
      </div>
      <el-form-item :label="bidRemarkLabel" prop="bidRemark" :required="createItem.isBid==='C'" key="bidRemark">
        <el-input type="textarea" size="mini" :rows="2" maxlength="2048" show-word-limit :placeholder="bidRemarkLabel" v-model="createItem.bidRemark">
        </el-input>
      </el-form-item>
      <div class="pending-msg" v-if="createItem.isBid==='C'">
        Attention: Please be reminded within <span class="red">4 working days</span> to maintain the status of successful bids. If overdue for finishing the maintainace, we will remain you again.
      </div>
      <div v-if="createItem.isBid==='Y'" class="result-feedback-msg">
        Please be noted that if it is marked by <span class="red">"won"</span>, then it means you have confirmed this quotation.
      </div>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import { mapState } from 'vuex'
import { enquiryOrderList } from '@/api/charge'
import { validateOverseasFreightIsOnlyEnchars } from '@/utils/validate'
export default {
  data() {
    return {
      orderNoArr: [],
      dialogConfig: {
        title: 'Winning bid feedback',
        show: true,
        size: 'medium',
        width: '600px'
      },
      createItem: {
        isBid: '',
        bidQuoteId: '',
        bidNoReason: [],
        bidNoReasonName: '',
        bidNoRemark: '',
        bidRemark: '',
        orderNoList: []
      },
      rules: {
        isBid: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        bidQuoteId: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        bidNoReason: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        bidNoRemark: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        orderNoList: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        bidRemark: [
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ]
      }
    }
  },
  props: {
    currentRow: {
      type: Object,
      default() {
        return {}
      }
    },
    quoteOptions: {
      type: Array,
      default() {
        return []
      }
    }
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      overseasFreightIsOnlyEnchars: (state) =>
        state.charge.overseasFreightIsOnlyEnchars
    }),
    bidRemarkLabel() {
      if (this.createItem.isBid === 'C') {
        return 'Pending Reason'
      } else {
        return 'Remarks'
      }
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    orderRemoteMethod(val) {
      console.log(val)
      let params = {
        enquiryId: this.$route.query.id,
        orderNoStr: val
      }
      enquiryOrderList(params).then((res) => {
        this.orderNoArr = res.data || []
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.custNoUpdataForm.validate((valid) => {
          if (valid) {
            let data = Object.assign({}, this.createItem)
            if (data.isBid === 'N') {
              let arr = []
              for (let i = 0; i < data.bidNoReason.length; i++) {
                let findItem = this.dictMap.inquiryNoBidReason.find(
                  (el) => el.value === data.bidNoReason[i]
                )
                if (findItem) {
                  arr.push(findItem.label)
                }
              }
              data.bidNoReasonName = arr.join(',')
            }
            data.bidNoReason = data.bidNoReason.join(',')
            this.close('Confirm', data)
          } else {
            this.$msgErrClose(
              'Please fill in the fields in the red box as required!'
            )
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#resultFeedbackPop {
  .el-radio__label {
    font-size: 12px;
    padding-left: 10px;
  }
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
  .pending-msg {
    // padding-left: 20px;
    margin-top: 20px;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .result-feedback-msg {
    padding-left: 20px;
    margin-top: 20px;
    line-height: 16px;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
}
</style>
