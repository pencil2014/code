<template>
	<div class="si-detail si-detail-tab">
		<div class="si-bewteen si-file">
			<el-tabs v-model="activeFile" @tab-click="handleClick">
				<el-tab-pane label="附件列表" name="valid"></el-tab-pane>
				<el-tab-pane label="失效附件" name="inValid"></el-tab-pane>
			</el-tabs>
			<div v-if="activeFile === 'valid'" class="row-tit-operate">
				<el-button :disabled="(detailData.copyCheckStatus === 'submit' && detailData.takeApplyStatus === 'submit') || detailData.state === 'invalid' || notDraftConfirm" size="mini" type="primary" @click="handleUploadFile">上传附件</el-button>
			</div>
		</div>
		<div v-if="activeFile === 'valid'" class="si-table si-file">
			<el-table class="table-cont" key="valide" fit highlight-current-row style="width: 100%" :data="validData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>

				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="createdName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="createdTime" label="上传时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button :disabled="notDraftConfirm" style="margin-right:0;" type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
							<el-button
								:disabled="notDraftConfirm"
								v-if="!['mbl_original', 'hbl_original'].includes(scope.row.fileType)"
								:style="{ 'margin-right': 0, color: notDraftConfirm ? '#c0c4cc' : '#CD4130' }"
								type="text"
								size="mini"
								@click="handleInvalid(scope.row)"
								>失效</el-button
							>
							<el-button :disabled="notDraftConfirm" :style="{ 'margin-right': 0, color: notDraftConfirm ? '#c0c4cc' : '#CD4130' }" v-if="scope.row.fileName && !scope.row.noDel" type="text" size="mini" @click="handleDelete(scope.row, scope.$index)"
								>删除</el-button
							>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		</div>
		<div v-if="activeFile === 'inValid'" class="si-table si-file">
			<el-table class="table-cont" fit highlight-current-row style="width: 100%" :data="invalidData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fileNo" label="附件编号" align="center"></el-table-column>
				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>

				<el-table-column prop="checkStatus" label="附件状态" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.checkStatus === 'y' ? '已确认' : '未确认' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="isValid" label="是否有效" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.isValid === 'y' ? '有效' : scope.row.isValid === 'n' ? '无效' : '' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="invalidTime" label="失效时间" align="center"></el-table-column>
				<el-table-column prop="checkEmployeeName" label="确认人" align="center"></el-table-column>
				<el-table-column prop="checkTime" label="确认时间" align="center"></el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		</div>

		<div v-if="uploadShow">
			<FileUpload :detailData="detailData" @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { blFileList, blFileDelete, blBillDelete, blFileInvalid } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import FileUpload from './fileUpload'

export default {
	filters: {
		fileTypeFilter(fileType) {
			let typeTxt = ''
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let fileTypeOptions = blFileType.concat(tradeDocName)
			let sItem = fileTypeOptions.find(item => item.value === fileType)
			typeTxt = sItem ? sItem.label : ''
			return typeTxt
		}
	},
	data() {
		return {
			validData: [],
			invalidData: [],
			activeFile: 'valid',
			uploadShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	props: {
		notDraftConfirm: {
			type: Boolean,
			default: false
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		detailData: {
			type: Object,
			default: () => ({})
		},
		billInfo: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.init()
	},
	activated() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		FileUpload
	},
	methods: {
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		handleViewFile(row, index) {
			let fileNo = row.fileNo.split(',')[index]
			let fileName = row.fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
		handleInvalid(row) {
			console.log('🚀 ~ row', row)
			this.$confirm('是否失效该条附件?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let param = {
						fileNos: row.fileNo.split(','),
						blId: this.$route.query.blId,
						orderNo: this.$route.query.orderNo
					}
					return blFileInvalid(param)
				})
				.then(response => {
					this.$message({
						message: '失效成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.getFileList()
							this.$emit('getBillList')
						}
					})
				})
				.catch(() => {})
		},
		handleClick(val) {
			if (val.name === 'valid') {
				this.getFileList()
			} else {
				this.getInvalidFileList()
			}
		},
		// 初始化
		init() {
			this.getFileList()
		},
		// 无效附件列表
		getInvalidFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				blId: this.$route.query.blId,
				module: 'SI',
				isValid: 'n'
			}
			blFileList(data).then(res => {
				this.invalidData = res.data
			})
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				blId: this.$route.query.blId,
				// includeFileModules: ['bl', 'si'], // 提单模块
				// excludeFileTypes: [] // 排除附件类别
				module: 'SI',
				isValid: 'y'
			}
			if (!(this.$route.query.orderNo || this.$route.query.jointNo) || !this.$route.query.blId) return // 用于刷新其他页面时避免报错, 20220711
			blFileList(data).then(res => {
				this.validData = res.data
				this.validData.forEach(item => {
					//该条数据在船东费用单列表里是否已通过或者已拒绝
					let passOrRefuse = this.billInfo.some(bill => {
						return bill.fileNo === item.fileNo && (bill.dnCheckStatus === 'pass' || bill.dnCheckStatus === 'refuse')
					})
					// M单copy件，copy件单证已确认的不可修改附件
					if ((item.fileType === 'mbl_copy' && this.detailData.copySiCheck === 'y') || this.detailData.state === 'invalid' || passOrRefuse) {
						item.noUpload = true
						item.noDel = true
					}
					// obd提单，obd提单已确认的不可修改附件
					if ((item.fileType === 'obd' && this.detailData.obdCheck === 'y') || this.detailData.state === 'invalid' || passOrRefuse) {
						item.noUpload = true
						item.noDel = true
					}
					// 船东费用账单，船东费用账单已确认的不可修改附件
					if (item.fileType === 'dn' && this.detailData.dnFeeInput === 'y') {
						item.noUpload = true
						item.noDel = true
					}
				})
			})
		},
		uploadPopClose(action) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getFileList()
			}
		},
		// 预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.fileName
					link.click()
				})
		},
		// 附件删除
		handleDelete(row, index) {
			this.$confirm('是否删除该条附件?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let fileNos = this.billInfo.map(item => item.fileNo)
					if (fileNos.includes(row.fileNo)) {
						let param = {
							fileNo: row.fileNo
						}
						return blBillDelete(param)
					} else {
						let param = {
							fileNos: row.fileNo.split(','),
							blId: this.$route.query.blId,
							orderNo: this.$route.query.orderNo
						}
						return blFileDelete(param)
					}
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.getFileList()
							this.$emit('getBillList')
						}
					})
				})
				.catch(() => {})
		},
		// 打开上传附件弹窗
		handleUploadFile() {
			this.uploadShow = true
		}
	}
}
</script>
<style>
.si-detail-tab {
	margin-top: 10px;
}
.si-detail .si-bewteen.si-file {
	padding: 0;
	display: flex;
	justify-content: space-between;
	height: 40px;
	line-height: 40px;
}
.si-detail .si-table.si-file {
	padding: 0;
}
.si-file .table-cont th {
	height: 24px;
	line-height: 16px;
	padding: 5px 0;
}
.si-file .table-cont td {
	line-height: 16px;
	padding: 5px 0;
}
.si-file .table-cont .cell {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.si-detail .si-table .operate-group .el-button {
	white-space: normal;
	padding: 3px 3px;
}
</style>
