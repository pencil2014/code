<template>
	<div id="blFileList">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="customsClearance-bewteen">
				<span class="ft12"> 提单号： {{ param.blNo }} </span>
				<div class="row-tit-operate">
					<el-button size="mini" type="primary" @click="handleAddRow">新增贸易单证</el-button>
				</div>
			</div>
			<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont">
				<el-table-column prop="docName" width="100" label="贸易单证类别" align="center">
					<span v-if="scope.row.docId" slot-scope="scope">
						{{ scope.row.docName | docNameFilter }}
					</span>
					<span v-else slot-scope="scope">
						<el-select v-model="scope.row.docName" size="mini" clearable placeholder="请选择" style="width: 100%">
							<el-option v-for="item in dictMap.tradeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</span>
				</el-table-column>
				<el-table-column prop="invoiceNo" label="发票号">
					<span style="padding-left:7px;" v-if="scope.row.docId && scope.row.putStatus === 'finish'" slot-scope="scope">
						{{ scope.row.invoiceNo }}
					</span>
					<span v-else slot-scope="scope">
						<el-input @blur="handleEdit(scope.row)" style="font-size:12px;" v-model="scope.row.invoiceNo"></el-input>
					</span>
				</el-table-column>
				<el-table-column prop="isValid" label="是否有效" align="center">
					<span slot-scope="scope">{{ scope.row.isValid === 'y' ? '有效' : scope.row.isValid === 'n' ? '无效' : '' }}</span>
				</el-table-column>
				<el-table-column prop="retrieveStatus" label="取单状态" align="center">
					<span slot-scope="scope">{{ scope.row.retrieveStatus }}</span>
				</el-table-column>
				<el-table-column prop="retrieveFinishTime" width="100" label="取单完成时间" align="center"> </el-table-column>
				<el-table-column prop="putStatus" label="放单状态" align="center">
					<span slot-scope="scope">{{ scope.row.putStatus }}</span>
				</el-table-column>
				<el-table-column prop="putFinishTime" width="100" label="放单完成时间" align="center"> </el-table-column>
				<el-table-column prop="expressNo" label="快递单号" align="center"> </el-table-column>

				<el-table-column prop="fileName" label="附件" align="center">
					<span slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini">
								<el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
									<span class="file-name-style">{{ scope.row.fileName }}</span>
								</el-tooltip>
							</el-button>
						</div>
					</span>
				</el-table-column>

				<el-table-column fixed="right" width="130" label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
							<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini">删除</el-button>
							<el-button v-if="scope.row.docId" @click="handleInvalid(scope.row)" type="text" size="mini">失效</el-button>
							<el-button v-if="!scope.row.docId" @click="handleSave(scope.row)" type="text" size="mini">保存</el-button>
							<!-- <el-button v-if="scope.row.docId && scope.row.putStatus != 'finish'" @click="handleEdit(scope.row)" type="text" size="mini">更新</el-button> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</BaseDialog>
		<div v-if="uploadShow">
			<BlFileUpload :param="param" :attachmentList="attachmentList" @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { blFileList } from '@/api/order/bl'
import BlFileUpload from './blFileUpload'
import { tradeDocList, tradeDocSave, documentSaveBatch, updateInvoiceNo, tradeDocDelete, tradeDocUpdateStatus, tradeDocDocDataDetail, tradeDocSaveDocData, documentInvalid, documentPut } from '@/api/order/document'

export default {
	filters: {
		docNameFilter(docName) {
			return getDictLabel('tradeDocName', docName)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			tableData: [],
			dialogConfig: {
				title: '贸易单证',
				show: true,
				size: 'medium',
				width: '800px'
			},
			uploadShow: false
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		},
		attachmentList: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.getFileList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.railway.orderNo,
			custid: state => state.railway.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog,
		BlFileUpload
	},
	watch: {},
	methods: {
		handleInvalid(row) {
			let data = {
				docId: row.docId
			}
			documentInvalid(data).then(res => {
				if (res.code === 0) {
					this.$message.success('操作成功!')
					this.getFileList()
				}
			})
		},
		handleSave(row) {
			let data = {
				orderNo: this.oQuery.orderNo,
				docName: row.docName,
				blId: this.param.blId,
				invoiceNo: row.invoiceNo
			}
			tradeDocSave(data).then(res => {
				this.$message.success('添加成功!')
				this.getFileList()
			})
		},
		//更新
		handleEdit(row) {
			if (!row.docId) return
			let data = {
				docId: row.docId,
				invoiceNo: row.invoiceNo
			}
			updateInvoiceNo(data).then(res => {
				this.$message.success('更新成功!')
				this.getFileList()
			})
		},
		// 删除
		handleDelete(row, index) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					if (!row.docId) {
						this.tableData.splice(index, 1)
					} else {
						tradeDocDelete({ orderNo: this.oQuery.orderNo, docId: row.docId }).then(response => {
							this.getFileList()
							this.$message({ message: '删除成功', type: 'success' })
						})
					}
				})
				.catch(() => {})
		},
		handleAddRow() {
			this.tableData.push({ docName: '', invoiceNo: '' })
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.oQuery.orderNo,
				blId: this.param.blId
			}
			tradeDocList(data).then(res => {
				this.tableData = res.data
			})
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		uploadPopClose(action) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getFileList()
			}
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				let data = this.tableData
					.filter(item => !item.docId)
					.map(item => {
						return {
							orderNo: this.oQuery.orderNo,
							blId: this.param.blId,
							docNo: item.docNo,
							docName: item.docName,
							invoiceNo: item.invoiceNo
						}
					})
				documentSaveBatch(data).then(res => {
					this.$message.success('批量保存成功!')
					this.close('Confirm', this.tableData)
				})
			} else {
				this.close('Cancel', this.tableData)
			}
		},

		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 下载
		handleDownload(row) {
			this.$store
				.dispatch('railway/downloadBlobFile', {
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
		// 打开上传附件弹窗
		handleUploadFile() {
			this.uploadShow = true
		}
	}
}
</script>
<style lang="scss">
#blFileList .customsClearance-bewteen {
	display: flex;
	justify-content: space-between;
	height: 32px;
	line-height: 32px;
}
#blFileList .table-cont .operate-group .el-button {
	white-space: normal;
}
#blFileList .table-cont .operate-group .el-button--mini span {
	display: block;
}
</style>
