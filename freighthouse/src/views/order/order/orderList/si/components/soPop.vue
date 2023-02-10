<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-table fit highlight-current-row style="width: 100%" :data="tableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" class="sopop-table">
				<el-table-column prop="so" label="so号" align="center"> </el-table-column>
				<el-table-column prop="containerInfo" label="箱型箱量" align="center"> </el-table-column>
				<el-table-column prop="vessel" label="船名" align="center" width=""> </el-table-column>
				<el-table-column prop="voyage" label="航次" align="center" width=""> </el-table-column>
				<el-table-column prop="polPortName" label="起运港" align="center"> </el-table-column>
				<el-table-column prop="porPortName" label="驳船收货地" align="center"> </el-table-column>
				<el-table-column prop="podPortName" label="目的地" align="center"> </el-table-column>
				<el-table-column prop="remark" label="so备注" align="center" width="150"></el-table-column>
				<el-table-column prop="bkgRemark" label="订舱备注" align="center" width="150">
					<template slot-scope="scope">
						<div class="column-text">{{scope.row.bkgRemark}}</div>
					</template>
				</el-table-column>
				<el-table-column prop="soFileName" label="附件名称" align="center" width="150">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini">
								<span class="file-name-style">{{ scope.row.soFileName }}</span>
							</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="80" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		</BaseDialog>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { blSoList } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {},
	data() {
		return {
			tableData: [],
			dialogConfig: {
				title: 'SO信息',
				show: true,
				size: 'medium',
				width: '85%',
				showBtns: false
			},
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null, // 行数据
      }
		}
	},
	props: {
		soListQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getSoList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog,
		tableTooltip
	},
	watch: {},
	methods: {
		// 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell;
      this.tableCellMouse.row = row;
      this.tableCellMouse.hidden = false;
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true;
    },
		// so列表
		getSoList() {
			let data = {
				orderNo: this.soListQuery.orderNo,
				blId: this.soListQuery.blId
			}
			blSoList(data).then(res => {
				this.tableData = res.data
			})
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.tableData)
			} else {
				this.close('Cancel', this.tableData)
			}
		},
		// 附件预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		},
		// 下载附件
		handleDownload(item) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: item.soFileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = item.soFileName
					link.click()
				})
		}
	}
}
</script>
<style lang="scss">
.sopop-table{
	.cell {
		display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
	}
}
</style>
