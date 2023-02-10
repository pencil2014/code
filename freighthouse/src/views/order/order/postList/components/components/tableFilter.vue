<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary"> <!-- <i class="el-icon-plus"></i>  -->{{ $t('charge.add') }} </el-button>
			<el-button size="mini" @click="handleExport" type="default">导出</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<el-button size="mini" ref="btnCreate" @click="handleImport" type="default">批量导入快递单</el-button>
			<el-button size="mini" :loading="loadingObj.confirmFeeLoading" ref="btnCreate" @click="handleConfirmFee" type="default">推送费用</el-button>
			<el-button size="mini" :loading="loadingObj.cancelFeeLoading" ref="btnCreate" @click="handleCancelFee" type="default">撤回推送费用</el-button>
			<el-button size="mini" ref="btnCreate" @click="handlePrint" type="default">打印签收单</el-button>
			<!-- <div class="ml10">
        <span>寄件状态：</span>
        <el-select v-model="status" size="mini" placeholder="请选择" style="width:120px" @change="handleUpdateStatus">
          <el-option v-for="item in dictMap.postStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div> -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.feeStatus" size="mini" @change="handleSearchByStatus">
					<el-radio-button size="mini" v-for="(item, index) in feeStatusOptions" :key="index" :label="index">{{ item }}</el-radio-button>
				</el-radio-group>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			status: ''
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
		loadingObj: {
			type: Object,
			default: () => ({})
		},
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		}),
		statusOptions() {
			return {
				all: '全部',
				to_send: '待寄单',
				to_collect: '待收取',
				collected: '已收取',
				signed: '已签收'
			}
		},
		feeStatusOptions() {
			return {
				all: '全部',
				init: '未推送',
				// confirmed: '已确认',
				sended: '已推送',
				checked: '已对账'
			}
		}
	},
	components: {},
	methods: {
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
		// 寄单完成
		handlePostFinish() {
			console.log('寄单完成')
			this.callback('PostFinish')
		},
		// 签收完成
		handleSignFinish() {
			this.callback('SignFinish')
		},
		// 修改状态
		handleUpdateStatus(value) {
			this.callback('UpdateStatus', value)
		},
		// 按tab状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				status: value
			})
			console.log(this.tableQuery.status)
			this.callback('SearchByStatus')
		},
		// 导入
		handleImport() {
			this.callback('Import')
		},
		// 费用确认
		handleConfirmFee() {
			this.callback('ConfirmFee')
		},
		// 撤回推送费用
		handleCancelFee() {
			this.callback('CancelFee')
		},
		// 打印签收单
		handlePrint() {
			this.callback('Print')
		}
	}
}
</script>
<style scoped></style>
