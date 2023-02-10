<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="isBd">
        新建
      </el-button>
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        导出
      </el-button>
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleNotifyRelease" plain class="ml10" v-if="isBd && ['pass'].includes(tableQuery.orderStatus)">通知放舱</el-button> -->
    </div>

    <div class="table-filter-right">
      <el-checkbox v-model="isLoop" @change="changeIsLoop">自动刷新</el-checkbox>
      <div class="pulish-status" style="margin-left: 10px">
        <el-radio-group v-model="tableQuery.orderStatus" size="mini" @change="handleSearchByStatus">
          <el-tooltip :content="tabTipsObj[index]" placement="top" effect="dark" v-for="(item, index) in statusOptions" :key="index">
            <el-radio-button size="mini" :label="index">{{item}}</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { mapState } from 'vuex'
export default {
  mixins: [orderMixin],
  data() {
    return {
      isLoop: false
    }
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    },
    islLoop: {
      type: Boolean,
      default: false
    }
  },
  created() {},
  mounted() {},
  watch: {
		islLoop: {
			handler(newVal) {
				this.isLoop = newVal
			},
			immediate: true,
			deep: true
		}
	},
  computed: {
    ...mapState({
      currRole: (state) => state.user.currRole
    }),
    statusOptions() {
      if (this.isBd) {
        return {
          all: '全部',
          mine: '我的业务',
          submit: '待审核',
          draft: '未提交',
          pass: '已审核',
          refuse: '已拒绝',
          complete: '已完成',
          break: '已终止',
          cancel: '已取消',
          close: '已关闭'
        }
      }
      if (this.isOp || this.isCs || this.isAc || this.isRc || this.isEpricing) {
        return {
          all: '全部',
          mine: '我的业务',
          pass: '审核通过',
          // pass: '未处理',
          // operating: '处理中',
          complete: '已完成',
          break: '已终止',
          cancel: '已取消',
          close: '已关闭'
        }
      }

      if (this.isPricing) {
        return {
          all: '全部',
          mine: '我的业务',
          submit: '待审核',
          'pass,complete': '审核通过',
          pricingRefuse: '订舱拒绝'
        }
      }
    },
    tabTipsObj() {
			// console.log('this.currRole', this.isBd, this.currRole)
			if (this.isBd) {
				return {
					all: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					mine: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核、待审核',
					draft: '包含订单状态：草稿',
					pass: '包含订单状态：审核通过',
					refuse: '包含订单状态：审核拒绝',
					complete: '包含订单状态：完成',
					dropped: '包含订单状态：审核通过、取消、终止、关闭',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消',
					close: '包含订单状态：关闭'
				}
			}
			if (this.isOp || this.isCs || this.isAc || this.isRc || this.isEpricing) {
				return {
					all: '包含订单状态：审核通过、完成、取消、终止、关闭',
					mine: '包含订单状态：待审核、审核通过、完成、取消、终止、关闭',
					pass: '包含订单状态：审核通过',
					complete: '包含订单状态：完成',
					break: '包含订单状态：终止',
          cancel: '包含订单状态：取消',
          close: '包含订单状态：关闭'
				}
      }
      if (this.isPricing) {
				return {
					all: '包含订单状态：待审核、审核通过、完成',
					mine: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核、待审核',
					'pass,complete': '包含订单状态：审核通过、完成',
					pricingRefuse: '包含订单状态：待审核、审核通过'
				}
			}
		},
    isAc() {
      return this.currRole === 'ac' || this.currRole === 'eac'
    },
    isDoc() {
      return this.currRole === 'doc'
    },
    isRc() {
      return this.currRole === 'rc'
    },
    isOp() {
      return this.currRole === 'op'
    },
    isBd() {
      return (
        this.currRole === 'bd' ||
        this.currRole === 'obd' ||
        this.currRole === 'asst'
      )
    },
    isCs() {
      // 客服
      return this.currRole === 'cs' || this.currRole === 'ecs'
    },
    isEpricing() {
			return this.currRole === 'epricing'
		},
    isPricing() {
      return this.currRole === 'pricing'
    }
  },
  components: {},
  methods: {
    changeIsLoop(val) {
      // console.log(val)
      this.$emit('changeIsLoop', val)
    },
    // 新建
    handleAdd() {
      this.callback('Add')
    },

    // 导出
    handleExport() {
      this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.callback('Export')
      })
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 生成结算单
    handleGenerateStatement() {
      console.log('生成结算单')
    },

    // 通知放舱
    handleNotifyRelease() {
      this.callback('NotifyRelease')
    },

    // 按发布状态查询
    handleSearchByStatus(value) {
      Object.assign(this.tableQuery, {
        orderStatus: value
      })
      this.callback('SearchByOrderStatus')
    }
  }
}
</script>
<style scoped>
</style>  
