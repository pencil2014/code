<template>
<div class="edit-row agent" id="matter">
  <div class="edit-container so" id="tableCont">
    <div class="row-tit so">
      <span class="tit ft12 bold">进仓事项</span>
      <div class="row-tit-operate">
        <div class="">
          <span class="mr10">完成状态</span> 
          <el-select v-model="inspectionStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isBd">
            <el-option v-for="item in dictMap.inspectionStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd">新增进仓事项</el-button>
        </div>
      </div>
    </div>
    <div class="row-form mt10">
      <el-table ref="matterTable" border fit highlight-current-row stripe style="width: 100%" class="matter-table-border"
        :data="matterList" @selection-change="handleSelectionChange" :span-method="objectSpanMethod">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="matterId" label="事项编号" align="center"></el-table-column>
        <el-table-column prop="custName" label="客户名称" align="center"></el-table-column>
        <el-table-column prop="matter" label="进仓事项" align="center">
          <template slot-scope="scope">
            {{scope.row.matter | matterFilter}}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center" ></el-table-column>
        <el-table-column prop="status" label="完成状态" align="center">
          <template slot-scope="scope">
            {{scope.row.status | inspectionStatusFilter}}
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="进仓编号" align="center"></el-table-column>
        <el-table-column prop="boxNo" label="货物箱号" align="center"> </el-table-column>
        <el-table-column prop="cname" label="品名" align="center"> </el-table-column>
        <el-table-column prop="mark" label="唛头" align="center"> </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || scope.row.status === 'finish'">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <div class="agentDetail" v-if="detailShow">
    <Detail ref="matterDetailForm" :createItem="createItem" :saveBarFixed="saveBarFixed" @save="handleSave" @cancel="handleCancel"/>
  </div>
</div>
</template>

<script>
import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import {baseCurrencyList} from '@/api/base'
import {orderJointInfo, orderInfo} from '@/api/order/list'
import {inspectionAttachmentList} from '@/api/order/inspection'
import {matterList, matterInfo, matterDelete, matterStatusChange, matterSave} from '@/api/order/podService/warehouse'
import Detail from './components/detail'

const defaultCreateQuery = {
  matterId: undefined,
  custid: '',
  custName: '',
  matter: '',
  remark: '',
  cargoInfoList: [],
}

export default {
  filters: {
    inspectionStatusFilter(status) {
      return getDictLabel('inspectionStatus', status)
    },
    matterFilter(matter) {
      return getDictLabel('whMatterType', matter)
    }
  },
  props: {
    tabMenus: {
      type: Array,
      default: () => ([])
    },
    saveBarFixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      state: 'valid',
      oQuery: this.$route.query,
      inspectionStatus: '', // 进仓事项状态
      detailShow: false,
      createItem: Object.assign({}, defaultCreateQuery),
      custStr: sessionStorage.getItem("custStr"),
      serviceCode: sessionStorage.getItem("serviceCode"),
      matterList: [],
      multipleSelection: [],
      batchNoSpanArr: [],       // batchNoSpanArr是一个空数组，用于存放进仓编号每一行记录的合并数
      batchNoPos: 0,            // batchNoPos是batchNoSpanArr的索引   
      matterIdSpanArr: [],
      pos: 0,
      canSave: true,
    }
  },
  created() {
    // this.getOrderInfo()
    this.getList()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole,
      userEditRoles: state => state.order.orderList.userEditRoles,
      serviceInfoList: state => state.order.serviceInfoList
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      return this.ordDetRole === 'doc'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isEpricing() {
      return this.userEditRoles.includes('epricing')
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
    },
    isBd() {
      let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc&&!this.isEpricing&&!this.isEcs)
      let findItem = this.tabMenus.find(item => item.code === 'pod_wh_matter')
      let isJoint = findItem ? findItem.isJoint : false
      if (this.$route.query.jointNo) {
				isJoint = false
			}
      return isBd || isJoint || this.isFinish
    },
    isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_wh_matter')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
    viewState() {
      return this.oQuery.action === 'view' && !this.isOp
    },
    jointState() {
      return this.oQuery.jointNo ? true : false
    },
  },
  components: {
    Detail
  },
  watch: {
  },
  methods: {
    // 获取订单详情
    getOrderInfo() {
      let {source, jointNo, orderNo} = this.oQuery
      if (jointNo) {
        return orderJointInfo({jointNo: jointNo, orderNo: orderNo}).then(res => {
          let {data} = res
        })
      }
      orderInfo({orderNo: orderNo}).then(res => {
        let {data} = res
      })
    },
    // 初始化表格
    setInitTableData(values){
      values = values || []
      let list = []
      if (!values.length) return this.matterList = []
      values.map(item => {
        let tempItem = Object.assign({}, item)
        if(item.cargoInfoList && item.cargoInfoList.length) {
          item.cargoInfoList.map(ele => {
            let query = Object.assign({... tempItem}, ele)
            console.log(query)
            list.push({... query})
          })
        } else {
          list.push({...tempItem})
        }
      })
      console.log(list)
      this.matterList = list
      this.getSpanArr(this.matterList)
    },
    // 储存合并相同的matterid和进仓编号
    getSpanArr(data) {
      this.matterIdSpanArr = [];
      this.batchNoSpanArr = [];
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.matterIdSpanArr.push(1);           //matterIdSpanArr是一个空数组，用于存放每一行记录的合并数
          this.pos = 0                        //pos是matterIdSpanArr的索引          
          this.batchNoSpanArr.push(1);
          this.batchNoPos = 0                          
        } else {
          // 判断matterId当前元素与上一个元素是否相同
          if (data[i].matterId === data[i - 1].matterId) {
            this.matterIdSpanArr[this.pos] += 1;
            this.matterIdSpanArr.push(0);
          } else {
            this.matterIdSpanArr.push(1);
            this.pos = i;
          }
          // 判断进仓编号当前元素与上一个元素是否相同
          if (data[i].matterId === data[i - 1].matterId && data[i].batchNo === data[i - 1].batchNo) {
            this.batchNoSpanArr[this.batchNoPos] += 1;
            this.batchNoSpanArr.push(0);
          } else {
            this.batchNoSpanArr.push(1);
            this.batchNoPos = i;
          }
        }
      }
      console.log(this.matterIdSpanArr, this.batchNoSpanArr);
    },
    // 合并单元格
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      // 0-6列需合并
      if (columnIndex < 6 || columnIndex === 11) {        //用于设置要合并的列
        const _row = this.matterIdSpanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,          //合并的行数
          colspan: _col           //合并的列数，设为0则直接不显示
        }
      }
      // 箱号列需合并
      if (columnIndex === 6) {
        const _row = this.batchNoSpanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    // 获取进仓事项列表
    getList() {
      matterList({orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo}).then(res => {
        let matterList = res.data || []
        this.setInitTableData(matterList)
      })
    },
    // 新增
    handleAdd() {
      this.detailShow = true
      let cust = JSON.parse(this.custStr)
      this.createItem = Object.assign({}, defaultCreateQuery, {
        custid: cust.custid || '',
        custName: cust.custName || '',
        cargoInfoList: []
      })
    },
    // 详情
    handleInfo(row) {
      this.detailShow = true
      let {orderNo, jointNo} = this.oQuery
      matterInfo({orderNo, jointNo, matterId: row.matterId}).then(res => {
        for (let i in this.createItem){
          this.createItem[i] = res.data[i]
        }
        Object.assign(this.createItem, {
          status: res.data.status
        })
        console.log('详情', this.createItem);
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('是否确认删除该条数据?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let data = {
          matterId: row.matterId, 
          orderNo: this.oQuery.orderNo, 
          jointNo: this.oQuery.jointNo
        }
        return matterDelete(data);
      }).then(response => {
        this.$message({
          message: '删除成功', 
          type: 'success',
          duration: 1000,
          onClose: () => {
            if (row.matterId = this.createItem.matterId) {
              this.detailShow = false
            }
            this.getList()
          }
        })
      }).catch(() => {
        this.getList()
      });
    },
     // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 获取选中的blId
    getOids() {
      let matterIds = [];
      this.multipleSelection.map(item => {
        matterIds.push(item.matterId)
      })
      return matterIds
    },
    validate() {
      return true
    },
    // 修改进仓事项状态
    handleUpdateStatus(val) {
      if (!val) return
      console.log(val);
      if (!this.multipleSelection.length) {
        return this.$message({
          type: 'error',
          message: '请选择进仓事项',
          duration: 1000,
          onClose: () => {
            this.inspectionStatus = ''
          }
        })
      }
      this.$confirm('是否确认修改状态?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return matterStatusChange({
          matterIds: this.getOids(), 
          orderNo: this.oQuery.orderNo,
          jointNo: this.oQuery.jointNo, 
          status: val
        })
      }).then(response => {
        this.$message({
          type: 'success',
          message: '修改进仓事项状态成功',
          duration: 1000,
          onClose: () => {
            this.inspectionStatus = ''
            this.getList()
          }
        })
      }).catch(err => {
        this.inspectionStatus = ''
      })
    },
    // 保存
    handleSave(values) {
      console.log(values);
      let data = Object.assign({}, values)
      data.orderNo = this.oQuery.orderNo
      data.jointNo = this.oQuery.jointNo
      if (!this.canSave) return
      this.canSave = false
      matterSave(data).then(res => {
        this.$message({
          type: 'success',
          message: '保存成功',
          duration: 1000,
          onClose: () => {
            this.canSave = true
            this.detailShow = false
            this.getList()
          }
        })
      }).catch(err => {
        setTimeout(() => {
          this.canSave = true
        }, 2000)
      })
    },
    // 取消
    handleCancel() {
      this.detailShow = false
    }
  }
}
</script>
<style lang="scss">
@import "../../../../less/index.scss";
#matter{
  padding: 0 10px;
  .matter-table-border td{
    border-right: 1px solid #dfe6ec !important;
  }
  .edit-container.so{
    padding: 0;
  }
}
</style>