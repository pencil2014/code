<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-table fit highlight-current-row style="width: 100%" ref="cargoInfoTable" :data="containerList">
			<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
			<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
			<el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
			<el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
			<el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
			<el-table-column prop="packageType" label="包装" align="center">
				<template slot-scope="scope">
					{{ scope.row.packageType | packageTypeFilter }}
				</template>
			</el-table-column>
			<el-table-column prop="driverName" label="司机" align="center"></el-table-column>
			<el-table-column prop="driverPhone" label="司机电话" align="center"></el-table-column>
			<el-table-column prop="licensePlate" label="车牌号" align="center"></el-table-column>
			<el-table-column prop="signFileName" label="签收信息" align="center" width="240">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button type="text" size="mini" @click="handleViewFile(scope.row)" class="file-name">{{ scope.row.signFileName }}</el-button>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="signTime" label="签收时间" align="center"></el-table-column>
		</el-table>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			tableHeight: null,
			containerList: [...this.cargoInfoList],
			dialogConfig: {
				title: '集装箱信息',
				show: true,
				showBtns: false,
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
		cargoInfoList: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {
		this.$nextTick(() => {
			console.log(window.innerHeight)
			this.tableHeight = window.innerHeight - this.$refs.cargoInfoTable.$el.offsetTop - 200
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
	watch: {},
	methods: {
		close(action, value) {
			this.$emit('close', action, value)
		},

		dialogCallback(action, done) {
			this.close('Cancel')
		},
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.signFileName, fileName: row.signFileName })
		}
	}
}
</script>
<style lang="scss">
.operate-group {
	.file-name {
		padding: 2px;
		span {
			display: inline-block;
			max-width: 240px;
			line-height: 16px;
			height: 16px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}
</style>
