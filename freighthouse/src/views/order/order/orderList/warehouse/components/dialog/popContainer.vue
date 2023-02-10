<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback" class="table-com-layout">
		<el-table fit highlight-current-row style="width: 100%" ref="contMultiTable" :data="containerList" @selection-change="handleSelectionChange">
			<el-table-column type="selection" :selectable="selectable"></el-table-column>
			<el-table-column prop="so" label="SO" align="center"></el-table-column>
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
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { containerWhList } from '@/api/order/list'

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
				title: '集装箱列表',
				show: true,
				size: 'medium',
				width: '800px',
				btns: [
					{ label: '取消', action: 'Cancel' },
					{ label: '确定', action: 'Confirm', type: 'primary' }
				]
			},
			containerItemQuery: {
				cn: '',
				fileNum: '',
				containerId: null,
				currency: '',
				intrustNo: '',
				mark: '',
				name: '',
				packageType: '',
				quantity: '',
				unitPrice: '',
				volume: '',
				weight: '',
				totalPrice: ''
			}
		}
	},
	props: {
		bindContainerList: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.getContainerList()
	},
	mounted() {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - this.$refs.contMultiTable.$el.offsetTop - 270
		})
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		BaseDialog
	},
	watch: {
		containerList(newVal, oldVal) {
			if (newVal.length > 0) {
				this.toggleRowSelection()
			}
		}
	},
	methods: {
		selectable(row) {
			let bindOids = []
			this.bindContainerList.forEach(item => {
				bindOids.push(item.containerId)
			})
			// return !bindOids.includes(row.oid) && row.cn
			return !bindOids.includes(row.oid)
		},
		toggleRowSelection() {
			this.$nextTick(function() {
				this.bindOids = []
				this.bindContainerList.forEach(item => {
					this.bindOids.push(item.containerId)
				})
				this.containerList.forEach(row => {
					this.$refs.contMultiTable.toggleRowSelection(row, this.bindOids.includes(row.oid))
				})
			})
		},

		// 集装箱列表
		getContainerList() {
			let data = { orderNo: this.oQuery.orderNo, excludeContainerIds: this.bindContainerList }
			// let data = { orderNo: 'S202010190001001', excludeContainerIds: [1, 2] }
			containerWhList(data).then(res => {
				this.containerList = res.data
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		close(action, value) {
			this.$emit('close', action, value)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {				
				if (this.multipleSelection.length === 0) return this.$message.warning('请选择一条数据!')
				if (this.multipleSelection.length > 1) return this.$message.warning('只能选择一条数据!')
				this.close('Confirm', this.multipleSelection)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss"></style>
