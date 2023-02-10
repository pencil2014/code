<template>
  <el-dialog :title="logOption.title" width="80%" :visible="logOption.show" @close="close">
    <FinanceTableMass :option="option1" />
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { baseDataLog } from '@/api/permission'
export default {
  props: {
    logOption: {
      type: Object,
      require: true,
      default: () => {},
    },
  },
  mixins: [mixin],
  components: {
    FinanceTableMass,
  },
  data() {
    return {
      option1: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: this.logOption.columns,
      tips: {
        text: '',
        show: false,
      },
      operationBtns: false,
      selection:{
        show:false
      },
    })
    this.getData()
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  methods: {
    close() {
      this.logOption.show = false
    },
    getData() {
      let data = {
        tableName: this.logOption.tableName,
        code: this.logOption.code,
      }
      baseDataLog(data)
        .then((res) => {
          this.option1.data = res.data.map((item) => JSON.parse(item))
        })
        .catch(() => {})
    },
  },
}
</script>
