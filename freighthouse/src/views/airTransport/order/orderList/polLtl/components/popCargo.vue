<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form id="cargoDialog" ref="form" :model="formData" class="table-com-layout">
      <el-row>
        <el-col :span="8">
          <el-form-item label="进仓编号：" prop="inBatchNo">
            <el-input v-model="formData.inBatchNo" size="mini"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="中文品名：" prop="cargoName">
            <el-input v-model="formData.cargoName" size="mini"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" style="text-align: right;">
          <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
          <el-button size="mini" @click="reset">重置</el-button>
        </el-col>
      </el-row>
      <el-table fit highlight-current-row style="width: 100%" ref="contMultiTable" 
      :max-height="tableHeight" :data="cargoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" :selectable="selectable"></el-table-column>
        <el-table-column prop="batchNo" label="进仓编号" align="center"></el-table-column>
        <el-table-column prop="whName" label="仓库名称" align="center"></el-table-column>
        <el-table-column prop="custName" label="客户名称" align="center"></el-table-column>
        <el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column>
        <el-table-column prop="mark" label="唛头" align="center"> </el-table-column>
        <el-table-column prop="cname" label="品名" align="center"> </el-table-column>
        <el-table-column prop="lastQuantity" label="剩余件数" align="center"> </el-table-column>
        <el-table-column prop="lastWeight" label="剩余毛重(KGS)" align="center"> </el-table-column>
        <el-table-column prop="lastVolume" label="剩余体积(CBM)" align="center"> </el-table-column>
        <el-table-column prop="packageType" label="包装" align="center">
          <template slot-scope="scope">
            {{scope.row.packageType | packageTypeFilter}}
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import {inItemList} from '@/api/order/podService/warehouse'

export default {
  filters: {
    packageTypeFilter(packageType) {
      return getDictLabel('packageType', packageType)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      cargoList: [],
      multipleSelection: [],
      bindItemIds: [], // 已选择的货品itemId
      tableHeight: null,
      dialogConfig: {
        title: '货品列表',
        show: true,
        size: 'medium',
        width: "800px",
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '确定', action: 'Confirm', type: 'primary'}
        ]
      },
      formData:{
        inBatchNo: '',
        cargoName: '',
        custId: '',
        whId: ''
      }
    }
  },
  props: {
    bindCargoList: {
      type: Array,
      default: () => ([])
    },
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getCargoList()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - this.$refs.contMultiTable.$el.offsetTop -270
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
    })
  },
  components: {
    BaseDialog
  },
  watch: {
    'cargoList'(newVal, oldVal) {
      if(newVal.length > 0){
        this.toggleRowSelection()
      }
    }
  },
  methods: {
    selectable(row) {
      let bindItemIds = []
      this.bindCargoList.forEach(item => {
        bindItemIds.push(item.inItemId)
      })
      return !bindItemIds.includes(row.itemId)
    },
    toggleRowSelection() {
      this.$nextTick(function () {
        this.bindItemIds = []
        this.bindCargoList.forEach(item => {
          this.bindItemIds.push(item.inItemId)
        })
        this.cargoList.forEach(row => {
          this.$refs.contMultiTable.toggleRowSelection(row, this.bindItemIds.includes(row.itemId))
        })
      })
    },
    handleSearch() {
      this.getCargoList()
    },
    reset() {
      Object.assign(this.formData, {
        inBatchNo: '',
        cargoName: ''
      })
      this.getCargoList()
    },
    // 货品列表
    getCargoList() {
      // Object.assign(this.formData, {
      //   orderNo: this.oQuery.orderNo,
      //   jointNo: this.oQuery.jointNo,
      //   custId: this.param.custid,
      //   whId: this.param.whId
      // })
      // let query = []
      // for (let i in this.formData) {
      //   if (this.formData[i]) {
      //     let type = i === 'cargoName' ? 'like' : 'eq'
      //     query.push({column: i, type, value: this.formData[i] })
      //   }
      // }
      let data = Object.assign({...this.formData}, {
        orderNo: this.oQuery.orderNo, 
        jointNo: this.oQuery.jointNo,
        custId: this.param.custid,
        whId: this.param.whId ? this.param.whId : undefined
      })
      inItemList(data).then(res => {
        this.cargoList = res.data.map(item => {
          return Object.assign(item, {
            inItemId: item.itemId
          })
        })
      })
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    close(action, value) {
      this.$emit('close', action, value)
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        let data = [...this.multipleSelection]
        data.map(item => {
          delete item.itemId
          return item
        })
        console.log(data);
        this.close('Confirm', data)
      } else {
        this.close('Cancel')
      }
    },

  }
}
</script>
<style lang="scss">
#cargoDialog {
  .el-row {
    padding: 0 20px;
  }
  .el-form-item {
    display: flex;
    .el-form-item__content {
      margin-right: 10px;
      display: inline-block;
      flex: 1;
    }
  }
  .el-collapse-item__content {
    padding-top: 10px;
    font-size: 12px;
  }
  .row-tit {
    padding: 0 20px !important;
  }
  .el-table td {
    padding: 12px 0;
  }
}
</style>