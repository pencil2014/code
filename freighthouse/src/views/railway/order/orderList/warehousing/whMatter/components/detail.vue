<template>
<div class="whMatter-container">
  <div class="row-tit h32 mt10" id="saveBar">
    <div class="ft14 tit">进仓事项详情</div>
    <div class="row-tit-operate">
      <el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
      <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'finish'">保存</el-button>
    </div>
  </div>
  <div class="row-tit h32 mt10 isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
    <div class="ft14 tit">进仓事项详情</div>
    <div class="row-tit-operate">
      <el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
      <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'finish'">保存</el-button>
    </div>
  </div>
  <el-form ref="bvSave" :rules="rules" :model="detailData" class="form-body mt10" label-width="70px">
    <el-row>
      <el-col :span="6">
        <el-form-item label="客户名称" prop="custid" :show-message="false">
          <el-select v-model="detailData.custid" size="mini" clearable :filterable="true" @visible-change="custVisibleChange" disabled
            :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCust" style="width: 100%">
            <el-option v-for="(item, index) in custOptions" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="进仓事项" prop="matter" :show-message="false">
          <el-select v-model="detailData.matter" size="mini" clearable placeholder="请选择" @change="handleSelectMatter" style="width: 100%">
            <el-option v-for="(item, index) in dictMap.whMatterType" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="备注" prop="remark" :show-message="false">
          <el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable maxlength="512" show-word-limit></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <div class="row-tit h32" style="border-bottom: 0">
      <div class="ft14 tit"></div>
      <div class="row-tit-operate">
        <el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd || createItem.status === 'finish'">添加货品</el-button>
      </div>
    </div>
    <div>
      <el-table ref="outPlanBox" border fit highlight-current-row stripe style="width: 100%" class="outPlanBoxTable" 
        :data="tableData" :span-method="objectSpanMethod">
        <el-table-column prop="batchNo" label="进仓编号" align="center"></el-table-column>
        <el-table-column prop="whName" label="进仓仓库" align="center"></el-table-column>
        <el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column>
        <el-table-column prop="cname" label="品名" align="center"></el-table-column>
        <el-table-column prop="mark" label="唛头" align="center"></el-table-column>
        <el-table-column prop="quantity" label="件数" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || createItem.status === 'finish'">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-form>
  <div v-if="popCargoShow">
    <PopCargo @close="popCargoClose" :bindCargoList="tableData" :param="detailData"/>
  </div>
</div>
</template>

<script>
import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import {orderJointInfo, orderInfo} from '@/api/order/list'
import {supplierInfo, customerInfo } from '@/api/crm/supplier'
import PopCargo from '../../components/popCargo'

export default {
  filters: {
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
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
      custOptions: [],
      detailData: {},
      rules: {
        custid: [{ required: true, message: '请选择客户名称', trigger: 'change' }],
        matter: [{ required: true, message: '请选择进仓事项', trigger: 'change' }],
        remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
      },
      batchNoSpanArr: [],
      pos: 0,
      tableData: [],
      popCargoShow: false,  // 添加货品弹窗
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.railway.ordDetRole,
      serviceInfoList: state => state.railway.serviceInfoList
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
      return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || (!this.isDoc&&!this.isEpricing&&!this.isEcs) || this.isJoint
    },
    isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_wh_matter')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		}, 
    viewState() {
      return this.oQuery.action === 'view' && !this.isOp
    },
    jointState() {
      return this.oQuery.jointNo ? true : false
    },
    styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed ? {
				left: '120px',
				top: offsetTop + 24 + 'px'
			} : {}
		}
  },
  components: {
    PopCargo
  },
  watch: {
    createItem: {
      handler(newVal) {
        this.detailData = {...newVal}
        this.custOptions = [{label: newVal.custName, value: newVal.custid}]
        this.tableData = this.detailData.cargoInfoList
        this.getSpanArr(this.tableData)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 储存合并相同的进仓编号的id
    getSpanArr(data) {
      /*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
      this.batchNoSpanArr = [];
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.batchNoSpanArr.push(1);           //batchNoSpanArr是一个空数组，用于存放每一行记录的合并数
          this.pos = 0                        //pos是batchNoSpanArr的索引                               
        } else {
          // 判断进仓编号当前元素与上一个元素是否相同
          if (data[i].batchNo === data[i - 1].batchNo) {
            this.batchNoSpanArr[this.pos] += 1;
            this.batchNoSpanArr.push(0);
          } else {
            this.batchNoSpanArr.push(1);
            this.pos = i;
          }
        }
      }
      console.log(this.batchNoSpanArr);
    },
    // 合并单元格
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      // 进仓编号列需合并
      if (columnIndex === 0) {
        const _row = this.batchNoSpanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    // 选择货品
    handleAddCargo() {
      this.popCargoShow = true
    },
    // 货品关闭回调
    popCargoClose(action, values) {
      console.log(action, values)
      this.popCargoShow = false
      values = values || []
      if (action === 'Confirm') {
        if (!values.length) return
        values = values.map(item => {
          return Object.assign(item, {
            inBatchNo: item.batchNo,
            quantity: item.lastQuantity,
            weight: item.lastWeight,
            volume: item.lastVolume
          })
        })
        let itemIds = []
        this.tableData.map(item => {
          itemIds.push(item.inItemId)
        })
        // 过滤掉table已有的货品，只取新增的货品并默认显示添加进仓编号、件毛体包装等
        let addCargoData = values.filter(item => !itemIds.includes(item.inItemId))
        this.tableData = this.tableData.concat(addCargoData)
        this.getSpanArr(this.tableData)
      }
    },
    // 删除货物箱
    handleDelete(row, sIndex) {
      this.tableData = this.tableData.filter((item, index) => index !== sIndex)
      this.getSpanArr(this.tableData)
      console.log(this.tableData)
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    custVisibleChange(val) {
      if(val) this.customerSearch('')
    },
    custFilterMehod(val) {
      this.customerSearch(val)
    },
    // 客户模糊查询
    customerSearch(val) {
      this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
        let list = data.list
        this.custOptions = list.map(o => {
          return Object.assign(o, {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          })
        })
      })
    },
    handleSelectCust(val) {
      if (val) {
        let label = this.custOptions.filter(o => o.value === val)[0].label
        this.detailData.custName = label
      } else {
        this.detailData.custName = ''
      }
    },
    handleSelectMatter(val) {

    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleSave(){
      this.$refs.bvSave.validate(valid => {
        if (valid) {
          if (!this.tableData.length) {
            return this.$message({
              type: 'warning',
              message: '请添加货品信息',
              duration: 1000,
              onClose: () => {}
            })
          }
          let data = {...this.detailData}
          data.cargoInfoList = this.tableData
          this.$emit('save', data)
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    }
  }
}
</script>
<style lang="scss">
@import "../../../../less/index.scss";
.whMatter-container{
  .row-tit{
    padding: 0 !important;
    &.isFixed{
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
      height: 30px !important;
      line-height: 20px !important;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
      right: 0;
      margin-top: 0;
			.tit{
				line-height: 20px;
			}
		}
  }
  .form-body{
    .el-form-item {
      margin-bottom: 4px;
    }
    .el-form-item__label {
      padding-right: 4px;
    }
    .el-form-item__content {
      margin-right: 10px;
    }
  }
}
</style>