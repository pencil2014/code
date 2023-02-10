<template>
	<div class="row-cont mt15 si-detail" style="margin-top: 8px">
		<div class="row-cont-tit si-bewteen">
			<span class="ft12"><b>附件列表</b></span>
			<div class="row-tit-operate">
				<el-button size="mini" type="primary" @click="handleUploadFile" :disabled="viewState">{{ fileAddText }}</el-button>
			</div>
		</div>
		<div class="si-table">
			<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ getFileTypeText(scope.row.fileType) }}
					</template>
				</el-table-column>
				<el-table-column prop="fileName" label="附件名称" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini"
								><el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
									<span class="file-name-style">{{ scope.row.fileName }}</span>
								</el-tooltip></el-button
							>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="state" label="附件状态" align="center">
					<template slot-scope="scope">
						{{ getFileStatusText(scope.row, scope.row.state) }}
					</template>
				</el-table-column>
				<el-table-column prop="createdName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="createdTime" label="上传时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName">下载</el-button>
							<el-button type="text" size="mini" @click="handleDelete(scope.row, scope.$index)" v-if="scope.row.fileName" :disabled="viewState">删除</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-if="uploadShow">
			<FileUpload :fileTypeOptions="fileTypeOptions" :fileType="fileType" @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { whBookFileList, whBookFileDelete } from '@/api/order/list'
import FileUpload from './fileUpload'

export default {
	data() {
		return {
			tableData: [],
			uploadShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			lclInfo: {}
		}
	},
	props: {
		fileListData: {
			type: Array,
			default: () => []
		},
		fileTypeOptions: {
			type: Array,
			default: () => []
		},
		fileType: {
			type: String,
			default: ''
		},
		orderStatus: {
			type: String,
			default: ''
		},
		fileAddText: {
			Type: String,
			default: ''
		},
		lclStatus: {
			type: String,
			default: ''
		},
		source: {
			type: String,
			default: ''
		},
		bookDetailForm: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			ordDetRole: state => state.order.orderList.ordDetRole,
			dictMap: state => state.dict.dictMap
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		 isEpricing() {
			return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
		viewState() {
			console.log('source', this.source, this.ordDetRole)

			// 协同单的上传和删除按钮都要置灰，disabled.订舱服务项除外
			// 订舱服务项，散货订单客户自订共用FileList组件，权限设置要分别判断
			// 订舱服务项的已成功拼箱的不可在上传和删除附件，只可读
			if (this.$route.query.source === 'jointList') {
				if (this.$route.name === 'LclWhBook') {
					return false
				}
				return true
			}
			if (this.source === 'whBook') {
				// if (this.lclStatus === 'done') return true
				if (!this.ordDetRole || this.isBd || this.isDoc || this.isAc) return true
				return false
			}
			// 散货订单的客户自订
			if (this.source === 'selfDetail') {
				// 创建客户自订的订单非草稿和拒绝状态，都不可编辑
				if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
					return true
				}
				// 订单列表进来的操作是不可上传删除PO,url上不含有协同单号的就是订单列表来的。散货订单操作可上传PO.
				if ((this.isOp && !this.$route.query.jointNo) || this.isOpTruck) {
					return true
				}
				if (!this.ordDetRole || this.isEpricing || this.isEcs || this.isDoc || this.isAc) {
					return true
				}
			}
			return false
		}
	},
	watch: {
		fileListData: {
			handler(newVal) {
				this.tableData = newVal
			},
			deep: true,
			immediate: true
		},
		bookDetailForm: {
			handler(newVal) {
				this.lclInfo = newVal.lcl || {}
			},
			deep: true,
			immediate: true
		}
	},
	components: {
		FileUpload
	},
	methods: {
		// 初始化
		init() {
			// this.getFileList()
		},
		getFileStatusText(row, status) {
			let text = ''
			text = status === 'valid' ? '有效' : '无效'
			// 订舱服务项页面的PO，入舱核实单的附件状态特殊处理,其他附件状态显示为空
			if (this.$route.name === 'LclWhBook') {
				text = ''
				if (row.fileType === 'wh_po') {
					text = this.lclInfo.isPoRelease === 'y' ? '已放给客户' : '未放给客户'
				}
				if (row.fileType === 'wh_check') {
					text = this.lclInfo.isPoInCheck === 'y' ? '已核对' : '未核对'
				}
			}
			return text
		},
		getFileTypeText(fileType) {
			let typeTxt = ''
			let findItem = this.fileTypeOptions.find(item => item.value === fileType)
			typeTxt = findItem ? findItem.label : ''
			return typeTxt
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}
			whBookFileList(data).then(res => {
				this.tableData = res.data
			})
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
					whBookFileDelete({
						oid: row.oid,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}).then(res => {
						this.$message({
							message: '删除成功',
							type: 'success',
							duration: 1000,
							onClose: () => {
								this.getFileList()
							}
						})
					})
				})
				.catch(() => {})
		},
		// 打开上传附件弹窗
		handleUploadFile() {
			this.uploadShow = true
		},
		uploadPopClose(action) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getFileList()
			}
		}
		// // 上传前钩子获取file名
		// getFile(file) {
		//   this.file = file
		//   this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
		//   if (!this.sizeLimit) {
		//       this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
		//   }
		//   return this.sizeLimit;
		// },
		// // 新添加文件替换之前添加的文件
		// handleChangeFile(file, fileList) {
		//   this.fileList = []
		//   this.fileList.push(file)
		// },
		// // 移除文件
		// handleRemove(file,fileList) {
		//   this.fileList = fileList
		// },
		// handleImport(content, row) {
		//   console.log(content,row);
		//   let params = {
		//     data: {
		//       blId: this.$route.query.blId,
		//       orderNo: this.$route.query.orderNo,
		//       fileType: row.fileType,
		//       fileModule: 'take',
		//     },
		//     fileName: this.file
		//   }
		//   if (this.sizeLimit) {
		//     this.$store.dispatch('order/soUpload', {
		//       uri: '/order/shipping/bl/file/upload',
		//       params: params
		//     }).then(res => {
		//       if(res.data.code === 0) {
		//         this.$message({
		//           type: 'success',
		//           message: '导入成功',
		//           duration: 1000,
		//           onClose: () => {
		//             this.fileList = []
		//             this.getFileList()
		//           }
		//         })
		//       } else {
		//         this.$message({
		//           type: 'error',
		//           message: res.data.msg,
		//           duration: 1000,
		//           onClose: () => {
		//             this.fileList = []
		//             this.getFileList()
		//           }
		//         })
		//       }
		//     })
		//   }
		// },
	}
}
</script>
<style>
.si-detail .si-bewteen {
	padding: 0 10px;
	display: flex;
	justify-content: space-between;
	height: 40px;
	line-height: 40px;
}
.si-detail .si-table {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 0 10px;
}
</style>
