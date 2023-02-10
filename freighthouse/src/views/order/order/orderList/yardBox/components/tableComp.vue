<template>
  <div class="yardBox-table">
    <div class="row-table">
      <el-table ref="inPlanBox" fit style="width: 100%" class="inPlanBoxTable" :data="tableConfig.list" :show-summary="tableConfig.summary.showSummary"
        :summary-method="tableConfig.summary && tableConfig.summary.summaryMethod">
        <el-table-column prop="cname" label="品名" align="center">
          <template slot-scope="scope">
            <el-input size="mini" placeholder="点击添加品名" v-model="scope.row.cname" @focus="cnameClick(scope.row, scope.$index)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="hscode" label="HSCODE" align="center">
          <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.hscode" placeholder="请选择" clearable disabled remote>
              <el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="mark" label="唛头" align="center" >
          <template slot-scope="scope">
            <el-input size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center">
          <template slot-scope="scope">
            <el-input size="mini" placeholder="请输入件数" v-model="scope.row.quantity" clearable @blur="validateQuantity('quantity', scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center">
          <template slot-scope="scope">
            <el-input size="mini" placeholder="请输入" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center">
          <template slot-scope="scope">
            <el-input size="mini" placeholder="请输入" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
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
              <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd">删除</el-button>
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
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole
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
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
  },
  components: {
  },
  methods: {
    cnameClick(row, index) {
      this.$emit("cnameClick", index)
    },
    handleDelete(row, index) {
      this.$emit("delete", row, index)
    }
  }
}
</script>
<style lang="scss">
.yardBox-table {
  .row-tit {
    border: unset !important;
  }
  .row-table {
    padding: 0;
    .el-table {
      display: grid;
    }
  }
}
</style>  
