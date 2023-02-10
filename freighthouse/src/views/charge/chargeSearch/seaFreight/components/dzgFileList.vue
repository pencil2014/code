<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table :data="tabelData" style="width: 100%">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="cnname" label="附加费名称" width="100">
      </el-table-column>
      <el-table-column prop="code" label="代码" width="70">
      </el-table-column>
      <el-table-column prop="baseprice1" label="海运整箱/整箱驳船" width="150">
        <template>
          <span>海运整箱</span>
        </template>
      </el-table-column>
      <el-table-column prop="baseprice2" label="付费方式" width="70">
        <template slot-scope="scope">
          <span v-if="scope.row.paymentMethod==1">预付</span>
          <span v-else>到付</span>
        </template>
      </el-table-column>
      <el-table-column prop="baseprice3" label="计费单位" width="70">
        <template slot-scope="scope">
          <span v-if="scope.row.billUnit==20">票</span>
          <span v-else>箱型</span>
        </template>
      </el-table-column>
      <el-table-column prop="currency" label="币别" width="70">
      </el-table-column>
      <el-table-column prop="price" label="价格" width="70">
      </el-table-column>
      <el-table-column prop="price1" label="20'GP" width="70">
      </el-table-column>
      <el-table-column prop="price2" label="40'GP" width="70">
      </el-table-column>
      <el-table-column prop="price3" label="40'HQ" width="70">
      </el-table-column>
      <el-table-column prop="price4" label="45'HQ" width="70">
      </el-table-column>

    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { dzgPgFeeList } from '@/api/charge/route'
export default {
  data() {
    return {
      dialogConfig: {
        title: '附加费列表',
        show: true,
        size: 'medium',
        width: '900px',
        showBtns: false
      },
      tabelData: []
    }
  },
  props: {
    casenumbers: {
      type: [Number, String],
      default: ''
    }
  },
  created() {},
  mounted() {
    this.dzgPgFeeList()
  },
  computed: {},
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    dzgPgFeeList() {
      dzgPgFeeList({ casenumbers: this.casenumbers }).then((res) => {
        this.tabelData = res.data
      })
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createOrderForm.validate((valid) => {
          if (valid) {
            // if(!this.validate()) return
            this.handleCreateOrder(done)
          } else {
            this.$msgErrClose('红框内为必填项，请补充！')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    }
  }
}
</script>

<style lang="scss">
</style>
