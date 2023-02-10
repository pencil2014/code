<template>
  <div class="plan-table-filter">
    <div class="table-filter-left">
			<el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain>自定义服务项</el-button>
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="tableQuery.serviceCode === 'zero'" style="margin-left: 5px">创建待办</el-button>
    </div>
    <div class="table-filter-right">
      <!-- <el-scrollbar :vertical="false" class="scroll-row">
        <div class="pulish-status">
          <el-radio-group v-model="tableQuery.serviceCode" size="mini" @change="handleSearchByServiceType">
            <el-radio-button size="mini" v-for="(item, index) in followList" :key="item.key + index" :label="item.key" >{{item.label}}</el-radio-button>
          </el-radio-group>
        </div>
      </el-scrollbar> -->
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.serviceCode" size="mini" @change="handleSearchByServiceType" class="plan">
          <el-radio-button size="mini" v-for="(item, index) in followList" :key="item.key + index" :label="item.key" >
            <span>{{item.label}}</span>
            <span v-if="item.rows" class="red" style="margin-left: 4px;">({{item.rows}})</span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'

export default {
  data () {
    return {
    }
  },
  props: {
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    },
    followList: {
      type: Array,
      default: () =>([])
    }
  },
  created() {
  },
  mounted() {
    console.log(this.dictMap);
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    })
  },
  components: {
  },
  methods: {
    // 按状态查询
    handleSearchByServiceType(value) {
      Object.assign(this.tableQuery, {
        serviceCode: value
      })
      this.callback('SearchByServiceType', value)
    },
    handleCustomColumns() {
      this.callback('CustomColumns')
    },
    handleAdd() {
      this.callback('Add')
    }
  }
}
</script>
<style lang="scss">
// .scroll-row {
//   white-space: nowrap;
//   position: relative;
//   overflow: hidden;
//   width: 100%;
//   .el-scrollbar__bar {
//     bottom: 0px;
//   }
//   .el-scrollbar__wrap {
//     height: 49px;
//   }
// }
.plan-table-filter {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	margin-bottom: 8px;
	.table-filter-left {
    display: flex;
    width: 200px;
	}
	.table-filter-right {
		display: flex;
		.el-radio-button--mini .el-radio-button__inner {
			padding: 3px 4px;
		}
		.pulish-status {
      margin-left: 40px;
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: #fff;
        background-color: #1890ff;
        border-color: #1890ff;
      }
		}
	}
}
</style>  
