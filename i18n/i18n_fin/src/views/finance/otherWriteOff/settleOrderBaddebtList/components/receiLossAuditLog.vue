<template>
  <div v-if="isShow">
    <TableDialog v-if="isDialog" :option="logDialogOption" />
    <FinanceTable v-else :option="logDialogOption.tableOption" />
    <el-dialog
      v-if="adjApproverVisible"
      :title="$t('Charge.revisionAdj')"
      :visible.sync="adjApproverVisible"
      :noModalClose="true"
      width="620px"
      custom-class="fin-adjapprover-dial"
    >
      <el-form :model="modifyForm" ref="modifyForm" label-width="120px" label-suffix=":">
        <el-form-item
          :label="$t('Charge.newApprovers')"
          prop="employeeId"
          :rules="{required: true, message: ' ', trigger: 'change'}"
        >
          <el-select
            v-model="modifyForm.employeeId"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            clearable
            :noRemote="true"
            :remote-method="employeeSelectlist"
            @visible-change="(value) => value && employeeSelectlist('')"
          >
            <el-option
              v-for="(item, index) in employeeSelectOptions"
              :key="'employeeSelectOptions' + index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('Charge.approverRole')"
          prop="approverRoleDesc"
          :rules="{required: true, message: ' ', trigger: 'blur'}"
        >
          <el-input v-model="modifyForm.approverRoleDesc" :placeholder="$t('Common.plEnter')" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="adjApproverSubmit" size="mini">{{$t('Common.sure')}}</el-button>
        <el-button @click="adjApproverVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import TableDialog from '@/views/finance/components/financeDialog/tableDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { getAuditLog, modifyApprover, delApprover } from '@/api/fin/settleOrderBaddebt'
export default {
  name: 'receiLossFeeDetail',
  mixins: [mixin],
  components: {
    FinanceTable,
    TableDialog,
  },
  props: ['isShow', 'settleOrderBaddebtId', 'isDialog'],
  data() {
    return {
      logDialogOption: {
        show: false,
        title: this.$t('Common.approvalLog'),
        buttonHide: true,
        width: '900px',
        tableOption: { data: [], columns: [] },
      },
      adjApproverVisible: false,
      modifyForm: { employeeId: '', approverRoleDesc: '', approveSeq: '' },
      employeeSelectOptions: [],
    }
  },
  created() {
    this.logDialogOption.tableOption = {
      ...this.option,
      id: 'option11',
      $name: 'baddeListLog',
      selection: false,
      rootTipsHide: true,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        width: 230,
        data: [
          {
            label: this.$t('Charge.modifyApprover'),
            type: 'text',
            showFn: (row) =>
              row.approvalResult === 'pending' && this.checkAuth('SettleOrderBaddebtList', 'tab-baddeList', 'btn-auditEdit'),
            action: 'edit',
            colorType: 'edit',
          },
          {
            label: this.$t('Charge.deleteApprover'),
            type: 'text',
            showFn: (row) =>
              row.approvalResult === 'pending' && this.checkAuth('SettleOrderBaddebtList', 'tab-baddeList', 'btn-auditDel'),
            action: 'del',
            colorType: 'del',
          },
        ],
        show: true,
        callback: (action, $index, row, option) => {
          if (action === 'edit') {
            this.modifyForm = { employeeId: '', approverRoleDesc: '', approveSeq: row.approveSeq }
            this.adjApproverVisible = true
          } else {
            this.$confirmWarn({ body: this.$t('Settle.confirmWarn'), customClass: 'noModalClose' }, () => {
              let data = {
                bizId: this.settleOrderBaddebtId,
                approveSeq: row.approveSeq,
              }
              delApprover(data).then((res) => {
                this.$msgSucClose(this.$t('Charge.delSuc'))
                this.getData()
              })
            })
          }
        },
      }),
      columns: [
        { prop: 'approverName', label: this.$t('FinBill.approverName'), type: 'text', minWidth: 120 },
        { prop: 'approverDesc', label: this.$t('FinBill.approverDesc'), type: 'text', minWidth: 120 },
        { prop: 'approveEndTime', label: this.$t('FinBill.approveEndTime'), type: 'text', minWidth: 130 },
        { prop: 'approvalResult', label: this.$t('FinBill.approvalResult'), type: 'select', propInDict: 'auditStatus', minWidth: 100 },
        { prop: 'approvalComments', label: this.$t('Charge.auditInst'), type: 'text', minWidth: 220 },
      ],
      colorColumns: ['auditStatus'],
    }
    this.logDialogOption.tableOption.data = [{}]
  },
  methods: {
    employeeSelectlist(queryString) {
      let data = { state: 'valid', name: queryString }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        console.log(data)
        this.employeeSelectOptions = data.map((item) => {
          return { label: item.value, value: item.key }
        })
      })
    },
    getData(errClose) {
      getAuditLog({ settleOrderBaddebtId: this.settleOrderBaddebtId })
        .then((res) => {
          this.logDialogOption.tableOption.data = res.data || []
          this.logDialogOption.show = true
        })
        .catch((err) => errClose && this.$emit('update:isShow', !isDialog || false))
    },
    adjApproverSubmit() {
      this.$refs.modifyForm.validate((valid) => {
        if (!valid) return
        modifyApprover({ ...this.modifyForm, bizId: this.settleOrderBaddebtId }).then((res) => {
          this.$msgSucClose(this.$t('Hedge.modifyTips'))
          this.adjApproverVisible = false
          this.getData()
        })
      })
    },
  },
  watch: {
    'logDialogOption.show'(val) {
      // console.log(val)
      if (!val) {
        this.$emit('update:isShow', false)
      }
    },
    isShow(val) {
      // console.log(val)
      if (val) {
        // this.logDialogOption.show = true
        this.$nextTick(() => this.getData(true))
      }
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding: 18px 8px 24px 8px;
  }
  .fin-adjapprover-dial {
    .el-select {
      width: 360px;
    }
    .el-input {
      width: 360px;
    }
  }
}
</style>
