<template>
  <div class="default-table">
    <div class="row-tit" v-if="Object.keys(tableInfo).length>0">
      <span class="tit">{{tableInfo.title}}</span>
      <div class="row-tit-operate" v-if="tableInfo.titleBtnList && tableInfo.titleBtnList.length > 0">
        <slot></slot>
        <template v-for="(item, index) in tableInfo.titleBtnList" >
          <el-button size="mini" style="margin-left: 10px;" 
            v-if="!item.hide"
            :key="index"
            :type="item.type || 'default'"
            :disabled="item.disabled"
            @click="handleClick(item.key)">{{item.label}}</el-button>
        </template>
      </div>
    </div>
    <div class="row-table">
      <el-table ref="inPlanBox" fit style="width: 100%" class="inPlanBoxTable" :data="tableConfig.list">
        <el-table-column prop="cargoId" label="品名" align="center">
          <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.cargoId" placeholder="请选择" clearable filterable @change="(val) => changeCargo(val, scope.row, scope.$index)">
              <el-option v-for="(item, index) in cargo" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="mark" label="唛头" align="center" ></el-table-column>
        <el-table-column prop="quantity" label="件数" align="center">
          <template slot-scope="scope">
            <el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable disabled @blur="validateNum('quantity', scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="packageType" label="包装" align="center">
          <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
              <el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || !isOpTruck">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import store from '@/store'
import {mapState} from 'vuex'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'

export default {
  mixins: [quantityMixin],
  data () {
    return {
    }
  },
  props: {
    tableInfo: {
      type: Object,
      default: () => ({})
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    cargo: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      userEditRoles: state => state.order.orderList.userEditRoles
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
    },
    isOpTruck() {
      return this.userEditRoles.includes('op_truck')
    },
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
		},
  },
  components: {
  },
  methods: {
    handleClick(type) {
      this.$emit("tableClick", type)
    },
    changeCargo(val, row, index) {
      this.$emit("changeCargo", val, row, index)
    },
    handleDelete(row, index) {
      this.$emit("delete", row, index)
    }
  }
}
</script>
<style lang="scss">
.default-table {
  .row-tit {
    border: unset !important;
  }
  .row-table {
    padding: 0 10px;
    .el-table {
      display: grid;
    }
  }
  .operate-group .el-button--mini{
    padding: 0;
  }
}
</style>  
