<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="">
			<el-table fit highlight-current-row style="width: 100%" ref="contMultiTable" :max-height="tableHeight" :data="containerList" @selection-change="handleSelectionChange">
				<el-table-column type="selection" :selectable="checkSelectable"></el-table-column>
				<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
				<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
				<el-table-column prop="sn" label="封号" align="center"> </el-table-column>
				<el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
				<el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
				<el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
				<el-table-column prop="packageInfo" label="包装" align="center">
					<template slot-scope="scope">
						{{ scope.row.packageInfo | packageInfoFilter }}
					</template>
				</el-table-column>
			</el-table>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

import { baseSupplierList } from '@/api/base'
import { orderContainerList } from '@/api/railway/list'

export default {
	filters: {
		packageInfoFilter(packageInfo) {
			return getDictLabel('packageType', packageInfo)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			// containerList: [],
			multipleSelection: [],
			bindOids: [], // 已绑定集装箱的containerId集合
			tableHeight: null,
			dialogConfig: {
				title: '未关联集装箱列表',
				show: true,
				size: 'medium',
				width: '800px',
				btns: [
					{ label: '取消', action: 'Cancel' },
					{ label: '确定', action: 'Confirm', type: 'primary' }
				]
			}
		}
	},
	props: {
		containerList: {
			type: Array,
			default: () => []
		},
		//从MBL带过来的集装箱列表
		selectContainerList: {
			type: Array,
			default: () => []
		},
		//已绑定的集装箱列表
		bindContainerList: {
			type: Array,
			default: () => []
		},
		serviceType: {
			type: String,
			default: ''
		}
	},
	created() {
		// this.getContainerList()
	},
	mounted() {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - this.$refs.contMultiTable.$el.offsetTop - 270
			this.toggleRowSelection()
		})
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {
		//进入弹窗设置选中值
		selectContainerList: {
			handler(newVal, oldVal) {
				if (newVal.length > 0) {
					this.toggleRowSelection()
				}
			}
			// immediate:true
		}
	},
	methods: {
		checkSelectable(row) {
			// 多选框状态判断 {false不可选, true可选}
			if (this.serviceType === 'truck') {
				return row.so ? true : false
			}
			return true
		},
		toggleRowSelection() {
			this.$nextTick(function() {
				this.bindOids = []
				this.bindContainerList.forEach(item => {
					this.bindOids.push(item.containerId)
				})

				let selectedList = this.selectContainerList.filter(item => this.bindOids.includes(item.containerId))
				selectedList.forEach(row => {
					this.$refs.contMultiTable.toggleRowSelection(row, true)
				})
			})
		},

		// 集装箱列表
		getContainerList() {
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			orderContainerList(data).then(res => {
				//点击新增时候使用请求数据
				// this.containerList = res.data
				// parentId
				if (this.selectContainerList.length) {
					// this.containerList = this.selectContainerList
				}
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			console.log('🚀 ~ this.multipleSelection', val)
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
		}
	}
}
</script>
<style lang="scss"></style>
