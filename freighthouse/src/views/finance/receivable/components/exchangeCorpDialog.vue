<template>
  <el-dialog
    :visible.sync="dialogOption.show"
    @close="close"
    class="self-dialog"
    title="预收调转"
    width="500px"
  >
    <el-form :model="corpForm" ref="corpForm" :rules="corpRules" label-width="80px" size="mini">
      <el-form-item label="结算单位：" prop="settleCorp">
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
            v-for="(item,index) in settleCorpSelectList"
            :key="item.value+item.label+index"
            :label="item.label"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="调转原因：" prop="reason">
        <el-input
          v-model="corpForm.reason"
          type="textarea"
          placeholder="请输入调转原因"
          size="mini"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="isShowUpload"
        label="附件："
        prop="fileNo"
        class="invoice-payment-add-form-upload"
        style="position:relative;"
      >
        <el-input
          v-model="corpForm.fileNo"
          style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
        ></el-input>
        <FinanceUploadEmbed
          :upload-api="uploadApi2"
          :upload-params="uploadParams2"
          :limit="1"
          :width="372"
          @send-res-file-list="sendResFileList"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer" slot="footer">
      <el-button @click="exchangeCorp" size="mini" type="primary">确定</el-button>
      <el-button @click="dialogOption.show = false" size="mini">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { transferSettleCorp } from '@/api/fin/receivableReg'
export default {
  components: {
    FinanceUploadEmbed,
  },
  props: {
    dialogOption: {
      type: Object,
      default: () => ({ show: false }),
    },
    transferSettleCorpCode: '',
    receivablePrerevId: '',
  },
  data() {
    return {
      isShowUpload: true,
      uploadApi2: '/base/webapi/file/upload',
      corpForm: { settleCorp: '', fileNo: '', reason: '' },
      corpRules: {
        settleCorp: [{ required: true, message: ' ', trigger: 'change' }],
        reason: [{ required: true, message: ' ', trigger: 'change' }],
        fileNo: [{ required: true, message: '必填', trigger: 'change' }],
      },
      settleCorpSelectList: [],
      uploadParams2: {},
    }
  },
  created() {},
  methods: {
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    sendResFileList(val) {
      console.log(val)
      this.corpForm.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileName = val && val.length > 0 ? val[0].name : ''
    },
    // 修改结算单位
    exchangeCorp() {
      console.log(this.corpForm)
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        if (this.transferSettleCorpCode === this.corpForm.settleCorp.newSettleCorpCode) {
          return this.$msgErrClose('新的结算单位不能为旧的结算单位！')
        }
        let { value: newSettleCorpCode, label: newSettleCorpName } = this.corpForm.settleCorp
        let receivablePrerevId = this.receivablePrerevId
        transferSettleCorp({ ...this.corpForm, receivablePrerevId, newSettleCorpCode, newSettleCorpName }).then((res) => {
          this.$msgSucClose('调转成功！')
          this.$emit('close', true)
          // this.getData()
          // this.exchangeCorpDialog.show = false
        })
      })
    },
    close() {
      this.$emit('close')
    },
  },
  watch: {
    'dialogOption.show'(val) {
      this.isShowUpload = val
      if (val) {
        this.corpForm.settleCorp = ''
        this.corpForm.fileNo = ''
        this.corpForm.fileName = ''
        this.corpForm.reason = ''
        this.$nextTick(() => this.$refs.corpForm.clearValidate())
      }
    },
  },
}
</script>
