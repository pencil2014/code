<template>
	<div id="blFileList">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="customsClearance-bewteen">
				<span class="ft12">
					{{ param.blType === 'mbl' ? `MBL单号：${param.blNo}` : `HBL单号：${param.blNo}` }}
				</span>
				<!-- <div class="row-tit-operate">
          <el-button size="mini" type="primary" @click="handleUploadFile">上传附件</el-button>
        </div> -->
			</div>
			<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont">
				<el-table-column prop="fileNo" label="附件编号" align="center"></el-table-column>
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fileName" label="附件名称" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini">
								<el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
									<span class="file-name-style">{{ scope.row.fileName }}</span>
								</el-tooltip>
							</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="isValid" label="是否有效" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.isValid === 'y' ? '有效' : scope.row.isValid === 'n' ? '无效' : '' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createdName" label="上传人" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
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
			oQuery: this.$route.query,
			tableData: [],
			dialogConfig: {
				title: '附件列表',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: false
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
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog,
		BlFileUpload
	},
	watch: {},
	methods: {
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo,
				blId: this.param.blId,
				// includeFileModules: ['bl', 'si', 'take'], // 提单模块,补料模块，取单模块
				// excludeFileTypes: ['dn'] // 排除船东费用单
				module: 'BL'
			}
			blFileList(data).then(res => {
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
				this.close('Confirm', this.tableData)
			} else {
				this.close('Cancel', this.tableData)
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
#blFileList .table-cont .operate-group .el-button--mini span{
	display: block;
}
</style>
