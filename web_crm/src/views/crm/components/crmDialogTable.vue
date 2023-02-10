<template>
  <el-dialog :title="option.title" :visible.sync="option.show" :width="option.width">
    <div class="crm-dialog-table" style="margin-bottom: -2px">
      <template v-if="option.searchOption">
        <FinanceSearch :searchOption="option.searchOption" @search="search" :noLabelWidth="true" />
      </template>
      <div
        v-if="option.tableOption.title"
        style="color:#222;font-size:14px;font-weight:bold;padding:6px 0 10px;"
      >{{option.tableOption.title}}</div>
      <template v-if="option.tableOption">
        <FinanceTable
          maxHeight="400px"
          ref="table"
          :option="option.tableOption"
          @send-multi="sendMulti"
        />
      </template>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button
        :icon="option.icon? 'el-icon-'+option.icon:''"
        type="primary"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from './financeSearch'
import { mapGetters } from 'vuex'
import { truckLoadDelete } from '@/api/order/shippingTruck'
export default {
  name: 'crmDialogTable',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  watch: {
    'option.show'(val) {
      val && this.getData()
    },
  },
  methods: {
    sendMulti(data) {
      // console.log(data)
      this.selectionMulti = data
    },
    search() {
      this.getData()
    },
    getData() {
      if (this.option.selections && this.option.tableOption.data) {
        this.$nextTick(() => {
          let accIds = this.option.selections.map((item) => item.acctId)
          let table = this.$refs.table
          this.option.tableOption.data.forEach((row) => table.setCheckRow(row, accIds.includes(row.acctId)))
        })
      }
      this.option.tableOption.getData && this.option.tableOption.getData()
    },
    sure() {
      if (this.option.selections) {
        this.option.selections = this.selectionMulti || []
      }
      this.$emit('close', true)
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    // padding-bottom: 10px;
  }
  .finance-search-form,
  .finance-el-table {
    padding: 0;
    margin: 0;
  }
}
</style>