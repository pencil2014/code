<template>
  <el-dialog :title="options.title" :visible.sync="options.show" width="800px">
    <div :style="{padding:options.padding || '0 20px'}">
      <div style="line-height: 20px" v-if="options.isText">{{ options.message}}</div>
      <FinanceTable v-else :option="option1" />
    </div>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  name: 'baseDialog',
  mixins: [mixin],
  props: {
    options: {
      type: Object,
      default: () => ({ data: [] }),
    },
  },
  components: {
    FinanceTable,
  },
  watch: {
    options: {
      handler: (val) => {
        console.log(val)
      },
      deep: true,
    },
  },
  data() {
    return {
      option1: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      columns: [
        {
          prop: 'd_name',
          label: '费用项/服务项名称',
          type: 'text',
          width: 130,
        },
        {
          prop: 'd_content',
          label: '内容',
          type: 'text',
        },
      ],
      data: this.options.data,
      tips: {
        text: '',
        show: false,
      },
      selection: {
        show: false,
      },
      operationBtns: false,
    })

    // console.log(this.option)
    // console.log(this.option1)
  },
  methods: {},
}
</script>
<style lang="scss" scoped>

</style>