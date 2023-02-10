<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :model="dropItem">    
      <div class="filter-container">
        <div class="filter">
          <div class="input-container width-auto">
            <span class="filter-text" style="width:120px">大船实际开船时间</span>
            <elDatePickerLimit size="mini"
              :field="'tdTime'"
              v-model="dropItem.tdTime"
              type="date"
              style="width: 200px"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
          </div>
          <div class="input-container width-auto">
            <span class="filter-text" style="width:120px"><em class="red">*</em>大船预计开船时间</span>
            <elDatePickerLimit size="mini"
              :field="'etdTime'"
              v-model="dropItem.etdTime"
              type="date"
              style="width: 200px"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
          </div>
        </div>
      </div>
      <el-table fit highlight-current-row style="width: 100%" :data="containerList" class="mt20">
        <el-table-column prop="so" label="SO" align="center" width="140"> </el-table-column>
        <el-table-column prop="cn" label="箱号" align="center" width="140"> </el-table-column>
        <el-table-column prop="sn" label="封号" align="center" width="140"> </el-table-column>
        <el-table-column prop="containerType" label="箱型" align="center"> </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
        <el-table-column prop="packageInfo" label="包装" align="center">
          <template slot-scope="scope">
            {{scope.row.packageInfo | packageFilter}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="btn-minus-search mini" @click="handleDeleteContainerList(scope.$index)"></div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {orderContainerList, orderContainerDrop} from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'

const defaultDropQuery = {
    orderNo: "",
    tdTime: '',
    etdTime: '',
    oidList: []
}

export default {
  filters: {
    packageFilter(packageInfo) {
      return getDictLabel('packageType', packageInfo)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '甩柜',
        show: true,
        size: 'medium',
        width: "1000px",
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '保存', action: 'Confirm', type: 'primary'}
        ]
      },
      dropItem: Object.assign({}, defaultDropQuery),
      containerList: [],
      cnList: []
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.dropItem.orderNo = this.createItem.orderNo
    this.dropItem.etdTime = this.createItem.ship.etdTime
    this.dropItem.tdTime = this.createItem.ship.tdTime
    this.getContainerList()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    // 集装箱列表
    getContainerList() {
      orderContainerList({orderNo: this.oQuery.orderNo}).then(res => {
        this.containerList = res.data
        this.cnList = []
      })
    },

    // 删除
    handleDeleteContainerList(index) {
      let cn = this.containerList[index].cn
      this.containerList.splice(index, 1)
      this.cnList.push(cn)
      console.log(this.containerList, cn)
    },
    
    close(action) {
      this.$emit('close', action)
    },

    validate() {
      if (!this.dropItem.etdTime) {
        this.$message.warning('预计开船时间必填')
        return false
      }
      // if (!this.dropItem.tdTime) {
      //   this.$message.warning('实际开船时间必填')
      //   return false
      // }
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.handleDropContainer()
      } else {
        this.close('Cancel')
      }
    },

    // 获取oids
    getOids() {
      let oidList = []
      this.containerList.map(item => {
        oidList.push(item.oid)
      })
      return oidList
    },

    // 甩柜
    handleDropContainer() {
      let oidList = this.getOids()
      Object.assign(this.dropItem, {
        oidList: oidList
      })
      if (!this.validate()) return
      if (this.cnList.length) {
        this.$confirm(`是否确定甩柜箱号：${this.cnList} 的数据?`, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return orderContainerDrop(this.dropItem)
        }).then(response => {
          this.$message({
            type: 'success',
            message: '甩柜成功',
            duration: 1000,
            onClose: () => {
              this.close('Confirm')
            }
          })
        }).catch((err) => {
        });
      } else {
        orderContainerDrop(this.dropItem).then(res => {
          this.$message({
            type: 'success',
            message: '甩柜成功',
            duration: 1000,
            onClose: () => {
              this.close('Confirm')
            }
          })
        })
      }
      
    }
  }
};
</script>

<style lang="scss">
.width-auto{
  width: auto
}
</style>
