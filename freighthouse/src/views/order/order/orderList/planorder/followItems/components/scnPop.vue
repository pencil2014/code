<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table
      :data="data"
      style="width: 100%">
      <el-table-column
        prop="mbl"
        label="MBL"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="shipper"
        label="Shipper">
        <template slot-scope="scope">
          <el-input type="textarea" v-model="scope.row.shipper" size="mini" readonly wrap="off"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="consignee"
        label="CNEE">
        <template slot-scope="scope">
          <el-input type="textarea" v-model="scope.row.consignee" size="mini" readonly wrap="off"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="forwardAgent"
        label="AGENT">
        <template slot-scope="scope">
          <el-input type="textarea" v-model="scope.row.forwardAgent" size="mini" readonly wrap="off"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="notify1"
        label="Notify Party">
        <template slot-scope="scope">
          <el-input type="textarea" v-model="scope.row.notify" size="mini" readonly wrap="off"></el-input>
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { getOrderFollowTransport } from '@/api/order/followItems'
export default {
  props: {
    orderNo: {
      type: String,
      default: ''
    }
  },
  components: {
    BaseDialog,
  },
  created() {
    this.getList()
  },
  data() {
    return {
      dialogConfig: {
				title: '查看收发通',
				show: true,
				size: 'medium',
				width: '1400px',
        btns: [
          {label: '关闭', action: 'Cancel'}
        ]
			},
      data: []
    }
  },
  methods: {
    getList() {
      getOrderFollowTransport({ orderNo: this.orderNo })
      .then(res => {
        this.data = (res.data || []).map(item => {
          item['notify'] = item.notify1 || item.notify2 || item.notify3
          return item
        })
      })
    },
    dialogCallback(action, done) {
			this.$emit('close')
		},
  }
}
</script>

<style>

</style>