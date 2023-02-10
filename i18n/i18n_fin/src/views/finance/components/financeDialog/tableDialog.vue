<template>
  <el-dialog :title="option.title" :visible.sync="option.show" :width="option.width">
    <div>
      <FinanceTable maxHeight="400px" ref="table" :option="option.tableOption" />
    </div>
    <span slot="footer" class="dialog-footer" v-if="!option.buttonHide">
      <el-button
        :icon="option.icon? 'el-icon-'+option.icon:''"
        type="primary"
        size="mini"
        @click="sure"
      >{{option.text||$t('Common.sure')}}</el-button>
      <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mapGetters } from 'vuex'
export default {
  name: 'finDialogTable',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    FinanceTable,
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
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