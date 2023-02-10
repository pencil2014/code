<template>
  <div v-if="isShow">
    <TableDialog v-if="isDialog" :option="logDialogOption" />
    <FinanceTable v-else :option="logDialogOption.tableOption" />
    <el-dialog
      v-if="adjApproverVisible"
      :title="'修改调费申请审批人'"
      :visible.sync="adjApproverVisible"
      :noModalClose="true"
      width="600px"
      custom-class="fin-adjapprover-dial"
    >
      <el-form :model="modifyForm" ref="modifyForm" label-width="100px">
        <el-form-item
          label="新审批人"
          prop="employeeId"
          :rules="{required: true, message: ' ', trigger: 'change'}"
        >
          <el-select
            v-model="modifyForm.employeeId"
            placeholder="请选择"
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
          label="审批人角色"
          prop="approverRoleDesc"
          :rules="{required: true, message: ' ', trigger: 'blur'}"
        >
          <el-input v-model="modifyForm.approverRoleDesc" placeholder="请输入" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="adjApproverSubmit" size="mini">确定</el-button>
        <el-button @click="adjApproverVisible = false" size="mini">取消</el-button>
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
        title: '审批日志',
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
        width: 150,
        data: [
          {
            label: '修改审批人',
            type: 'text',
            showFn: (row) =>
              row.approvalResult === 'pending' && this.checkAuth('SettleOrderBaddebtList', 'tab-baddeList', 'btn-auditEdit'),
            action: 'edit',
            colorType: 'edit',
          },
          {
            label: '删除审批人',
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
            this.$confirmWarn({ body: '是否确认删除？', customClass: 'noModalClose' }, () => {
              let data = {
                bizId: this.settleOrderBaddebtId,
                approveSeq: row.approveSeq,
              }
              delApprover(data).then((res) => {
                this.$msgSucClose('删除成功!')
                this.getData()
              })
            })
          }
        },
      }),
      columns: [
        { prop: 'approverName', label: '审核人', type: 'text', minWidth: 120 },
        { prop: 'approverDesc', label: '审核人角色', type: 'text', minWidth: 120 },
        { prop: 'approveEndTime', label: '审核时间', type: 'text', minWidth: 130 },
        { prop: 'approvalResult', label: '审核状态', type: 'select', propInDict: 'auditStatus', minWidth: 100 },
        { prop: 'approvalComments', label: '审核说明', type: 'text', minWidth: 220 },
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
          this.$msgSucClose('修改成功!')
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
