<template>
	<div class="agent-pop-container">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-table fit highlight-current-row style="width: 100%" :data="tableData" class="table-cont" @current-change="clickRow" :span-method="objectSpanMethod">
				<el-table-column align="center" label="" width="50">
					<template slot-scope="scope">
						<el-radio :disabled="!scope.row.checkable" v-model="selectData" :label="scope.row">
							<span></span>
						</el-radio>
					</template>
				</el-table-column>
				<el-table-column label="报关方式" align="center" width="120">
					<template slot-scope="scope">
						{{ scope.row.customsType | customsTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="customsNumber" label="正报几票" align="center" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="customsSupplierName" label="意向供应商" align="center" width="100" show-overflow-tooltip></el-table-column>
			  <el-table-column prop="customsPrice" label="买单意向价格" align="center" width="100" show-overflow-tooltip>
					<template slot-scope="{row}">
						{{row.customsPrice}} {{row.customsUnit}}
					</template>
			  </el-table-column>
				<el-table-column prop="remark" label="报关备注" align="center" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="cn" label="箱号" align="center" show-overflow-tooltip></el-table-column>
				<el-table-column prop="so" label="SO号" align="center" show-overflow-tooltip></el-table-column>
				<el-table-column label="附件" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleViewFile(scope.row)">查看{{getNum(scope.row)}}</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</BaseDialog>
		<div v-if="popFileShow">
			<PopFile :tableData="fileList" @close="popFileClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import PopFile from './popFile'
import { getDictLabel } from '@/utils/tools'
import { serviceInfoList } from '@/api/order/list'
export default {
	filters: {
		customsTypeFilter(customsType) {
			return getDictLabel('customsType', customsType)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '关联委派信息',
				show: true,
				size: 'medium',
				width: '1120px'
			},
			serviceCode: 'pol_declaration',
			tableData: [],
			popFileShow: false,
			fileList: [],
			selectData: {}, // 选中列
			mergeSpanArr: [],
			pos: 0
		}
	},
	props: {
		containerId: {
			type: String,
			default: ''
		},
		disabledContainers: {
			type: Array,
			default: () => {
				;[]
			}
		}
	},
	created() {
		this.tableData = []
		this.getServiceInfoList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog,
		PopFile
	},
	methods: {
		getNum(row) {
			if (row.fileList && row.fileList.length) {
				return `(${row.fileList.length})`
			} else {
				return ''
			}
		},
		// 储存合并相同的委派信息
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.mergeSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.mergeSpanArr.push(1) //mergeSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是mergeSpanArr的索引
				} else {
					// 判断mergeId当前元素与上一个元素是否相同
					if (data[i].mergeId && data[i - 1].mergeId && data[i].mergeId === data[i - 1].mergeId) {
						this.mergeSpanArr[this.pos] += 1
						this.mergeSpanArr.push(0)
					} else {
						this.mergeSpanArr.push(1)
						this.pos = i
					}
				}
			}
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 箱号，附件列需合并
			if ([1, 2, 3].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.mergeSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		handleViewFile(row) {
			this.popFileShow = true
			this.fileList = row.fileList
		},
		popFileClose() {
			this.popFileShow = false
		},
		// 获取委派信息列表
		getServiceInfoList() {
			serviceInfoList({ orderNo: this.$route.query.orderNo, serviceCode: this.serviceCode }).then(res => {
				this.tableData = res.data || []
				this.tableData.forEach(item => {
					let fileName = item.fileName.split(',')
					let fileNo = item.fileNo.split(',')
					let fileList = []
					fileName.forEach((ele, index) => {
						fileNo[index] && fileList.push({ fileName: fileName[index], fileNo: fileNo[index], typeCode: item.typeCode, typeName: item.typeName })
					})
					item.fileList = fileList
					console.log('🚀 ~ this.disabledContainers', this.disabledContainers)
					// 20211230 放开禁止关联同一个信息的限制
					item.checkable = true
					// if (this.disabledContainers.includes(item.containerId)) {
					// 	item.checkable = false
					// } else {
					// 	item.checkable = true
					// }
				})
				console.log("🚀 ~ this.tableData", this.tableData)
				this.getSpanArr(this.tableData)
				// if (this.containerId) {
				//   this.selectData = this.tableData.find(item => item.containerId === this.containerId)
				// }
			})
        
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 当一行被点中时
		clickRow(row) {
			if (!row.checkable) return
			this.selectData = row
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (Object.keys(this.selectData).length > 0) {
					this.close('Confirm', this.selectData)
				} else {
					this.$message.error('请选择委派信息！')
				}
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style>
.agent-pop-container .table-cont th {
	height: 24px;
	line-height: 16px;
	padding: 2px 0;
}
.agent-pop-container .table-cont td {
	line-height: 16px;
	padding: 2px 0;
}
.agent-pop-container .table-cont .cell {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
