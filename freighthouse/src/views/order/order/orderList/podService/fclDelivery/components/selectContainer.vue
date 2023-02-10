<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <p v-if="showErroeMsg" class="red">注：请先维护集装箱号，再进行关联！</p>
    <el-table fit highlight-current-row style="width: 100%" ref="contMultiTable" :data="containerList" @selection-change="handleSelectionChange">
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
          {{scope.row.packageInfo | packageInfoFilter}}
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

// import {baseSupplierList} from '@/api/base' 
import {orderContainerList} from '@/api/order/list'

export default {
  filters: {
    packageInfoFilter(packageInfo) {
      return getDictLabel('packageType', packageInfo)
    }
  },
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
      }
    }
  },
  props: {
    bindContainerList: {
      type: Array,
      default: () => ([])
    },
    serviceType: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getContainerList()
  },
  mounted() {
    this.$nextTick(() => {
      console.log(window.innerHeight);
      this.tableHeight = window.innerHeight - this.$refs.contMultiTable.$el.offsetTop -200
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
    }),
    showErroeMsg(){
      let result=this.containerList.some(el=>el.cn)
      return !result
    }
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
      console.log(row)
      return row.cn
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
      let data = {orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo}
      orderContainerList(data).then(res => {
        this.containerList = res.data
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
      let data = []
      this.multipleSelection.map(item => {
        data.push(Object.assign(item, {
          containerId: item.oid
        }))
      })
      this.close('Confirm', data)
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