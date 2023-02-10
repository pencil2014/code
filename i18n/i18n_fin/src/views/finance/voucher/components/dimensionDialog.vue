<template>
  <el-dialog
    :title="dialogOption.title"
    :visible.sync="dialogOption.show"
    :width="(dialogOption.cfg && dialogOption.cfg.prop) === 'dimension' ? '700px' : '480px'"
    append-to-body
  >
    <!-- <FinanceSearch
      v-if="dialogOption.cfg.prop !== 'dimensions'"
      class="diy-search"
      :searchOption="searchOption"
      @search="search"
    />-->
    <!-- <div class="mid-title">{{dialogOption.cfg && dialogOption.cfg.label}}列表</div> -->
    <FinanceTable
      ref="dimensionTable"
      class="diy-table"
      rowKey="orderNo"
      id="sort-table"
      :option="tableOption"
      maxHeight="410px"
      @send-multi="sendMulti"
    />
    <span slot="footer" class="dialog-footer">
      <el-button
        style="font-size: 12px;height: 20px;padding: 3px 7px"
        type="primary"
        size="mini"
        @click="sure"
      >{{$t('Common.sure')}}</el-button>
      <el-button
        style="font-size: 12px;height: 20px;padding: 3px 7px"
        @click="cancel"
        size="mini"
      >{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '../mixin.js'
import { dimensionList } from '@/api/fin/acct'

export default {
  name: 'dimensionDialog',
  mixins: [mixin, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  props: {
    dialogOption: {
      type: Object,
      default: () => ({ cfg: {} }),
    },
  },
  data() {
    return {
      searchOption: {},
      tableOption: {},
      multipleSelection: [],
      cfg: {
        dimensions: 'Hs', // 核算维度
        feeName: 'Fee', // 费用编码
        consignerName: 'Km', // 科目编码
      },
    }
  },
  watch: {
    'dialogOption.show'(newVal) {
      if (newVal) {
        console.log(newVal)
        let _dimensions = this.dialogOption.cfg.form._dimensions
        this.$nextTick(() => {
          if (_dimensions && _dimensions.length) {
            // console.log(this.$refs.dimensionTable)
            let data = this.tableOption.data
            // console.log(_dimensions)
            // console.log(data)
            _dimensions.forEach((item) => {
              let len = data.length
              while (len--) {
                if (item.dimensionCode === data[len].dimensionCode) {
                  data[len].seq = item.seq
                  data[len].isRequired = item.isRequired
                  this.$refs.dimensionTable.setCurrentRow(this.tableOption.data[len])
                  break
                }
              }
            })
            // console.log(data)
          }
        })
      } else {
        this.$refs.dimensionTable.handleTableClearSelection()
        this.tableOption.data.forEach((item) => (item.seq = item.isRequired = ''))
      }
      // newVal && console.log(111111, this.dialogOption.cfg && this.dialogOption.cfg.prop)
      // console.log(newVal);
      // if (newVal && this[this.dialogOption.cfg.prop]) {
      //   this[this.dialogOption.cfg.prop]()
      // }
    },
  },
  created() {
    if (!this.$attrs.needDimensions) return
    console.log('dimention')
    // this.init()
    this.dimensions()
  },
  methods: {
    init() {
      this.tableOption = { ...this.option, id: 'option1', $name: 'dimensionDialog1', pagination: false, operationBtns: false }
      this.tableOption.columns = []
      this.tableOption.data = []
      // this.dimensions()
    },
    // 配置核算编码
    dimensions() {
      // let searchColumns = [{ label: '核算维度', prop: 'orderNo', type: 'input', placeholder: '请输入编码、核算维度名称' }]
      // this.searchOption = this.initSearchOption(searchColumns)
      this.tableOption = {
        ...this.option,
        id: 'option1',
        $name: 'dimensionDialog2',
        pagination: false,
        operationBtns: false,
        edit: true,
        rootTipsHide: true,
      }
      let columns = [
        { prop: 'dimensionCode', label: '编码', type: 'text', minWidth: 130 },
        { prop: 'dimensionName', label: '核算维度', type: 'text' },
        { prop: 'seq', label: '顺序', type: 'input', placeholder: '请输入序号' },
        {
          prop: 'isRequired',
          label: '是否必填',
          type: 'select',
          placeholder:  this.$t('Common.plSelect'),
          selectOptions: [
            { label: this.$t('Common.yes'), value: 'yes' },
            { label: this.$t('Common.no'), value: 'no' },
          ],
        },
      ]
      this.tableOption.columns = columns
      dimensionList().then((res) => {
        this.tableOption.data = res.data.map((item) => {
          return { ...item, seq: '', isRequired: '', edit: true }
        })
      })
    },
    sure() {
      // if (!this.multipleSelection.length) {
      //   return this.$message({
      //     message: '请至少选择一项',
      //     type: 'error',
      //     showClose: true,
      //   })
      // }
      let count = false
      this.multipleSelection.sort((a, b) => a.seq - b.seq)
      this.multipleSelection.forEach((item, index) => {
        if (+index + 1 !== +item.seq) count = true
      })
      if (count) {
        return this.$message({
          message: '所选项填写顺序数字必须连贯且不重复',
          type: 'error',
          showClose: true,
        })
      }

      this.dialogOption.cfg.form[this.dialogOption.cfg.prop] = this.multipleSelection
        .map((item) => item.dimensionName + item.seq)
        .join('/')
      this.dialogOption.cfg.form['_' + this.dialogOption.cfg.prop] = this.multipleSelection.map((item) => ({
        dimensionCode: item.dimensionCode,
        isRequired: item.isRequired,
        seq: item.seq,
      }))
      this.close()
      // console.log(this.multipleSelection)
      // console.log(this.tableOption.data)
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
    sendMulti(data) {
      this.multipleSelection = data
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__footer {
    padding: 0 18px 20px;
  }
  .el-dialog__body {
    padding: 10px 10px !important;
    overflow: hidden;
  }
  .el-select__caret {
    transform-origin: center center;
    width: 16px;
  }
  .el-icon-arrow-up:before {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    line-height: 20px;
  }
}
.el-select .el-input {
  width: 130px;
}
.el-form-item.to-block {
  display: block;
}
.mid-title {
  font-size: 16px;
  font-weight: bold;
  color: #222222;
}
.diy-search {
  padding: 0;
}
.diy-table {
  margin: 0;
}
</style>