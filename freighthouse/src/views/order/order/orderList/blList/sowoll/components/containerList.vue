<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="">
      <el-table fit highlight-current-row v-loading="tableLoading" style="width: 100%" ref="contMultiTable" :data="containerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" :selectable="checkSelectable"></el-table-column>
        <el-table-column prop="so" label="SO" align="center"></el-table-column>
        <el-table-column prop="cn" label="箱号" align="center"></el-table-column>
        <el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
        <el-table-column prop="sn" label="封号" align="center"> </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
        <el-table-column prop="packageInfo" label="包装" align="center">
          <template slot-scope="scope">
            {{ scope.row.packageInfo }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

import {baseSupplierList} from '@/api/base' 
import { custBlContainerList } from '@/api/order/bl'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      containerList: [],
      multipleSelection: [],
      bindOids: [], // 已绑定集装箱的containerId集合
      tableHeight: null,
      dialogConfig: {
        title: '未关联集装箱列表',
        show: true,
        size: 'medium',
        width: "800px",
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '确定', action: 'Confirm', type: 'primary'}
        ]
      },
      tableLoading: false,
    }
  },
  props: {
    bindContainerList: {
      type: Array,
      default: () => ([])
    },
    selectContainerList: {
      type: Array,
      default: () => ([])
    },
    custBlDictMap: {
			type: Object,
			default: () => ({})
		}
  },
  created() {
    this.getContainerList()
  },
  mounted() {
    this.$nextTick(() => {
      console.log(window.innerHeight, this.$refs.contMultiTable.$el.offsetTop);
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
    'containerList'(newVal, oldVal) {
      if(newVal.length > 0){
        this.toggleRowSelection()
      }
    }
  },
  methods: {
    checkSelectable(row) {
      return true
    },
    toggleRowSelection() {
      this.$nextTick(function () {
        this.bindOids = []
        this.bindContainerList.forEach(item => {
          this.bindOids.push(item.containerId)
        })
        
        let selectedList = this.containerList.filter(item => this.bindOids.includes(item.oid))
        selectedList.forEach(row => {
          this.$refs.contMultiTable.toggleRowSelection(row, true);
        })
      })
    },

    // 集装箱列表
    getContainerList() {
      this.tableLoading = true
      let data = {orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo}
      custBlContainerList(data).then(res => {
        this.containerList = res.data
      })
      .finally(() => {
				this.tableLoading = false
			})
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    validate() {
      return true
    },

    // 关联
    handleBind(done) {
      if (!this.validate()) return
      this.close('Confirm', this.multipleSelection)
    },

    close(action, value) {
      this.$emit('close', action, value)
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.handleBind()
      } else {
        this.close('Cancel')
      }
    },

  }
}
</script>
<style lang="scss">

</style>