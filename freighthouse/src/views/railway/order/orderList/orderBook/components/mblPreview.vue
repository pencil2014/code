<template>
	<div class="print">
		<div class="print-tools">
			<div class="w1000">
				<div class="set-options">
					<div class="item">
						<span class="fl label">文件类型:</span>
						<div class="fl ml10">
							<el-radio v-model="fileType" :label="item.label" v-for="item in fileTypeOptions" :key="item.label" @change="handleChangeFileType">{{ item.txt }}</el-radio>
						</div>
					</div>
				</div>
				<div style="margin-left:40px;" v-if="businessType === 'rail_export_lcl'" class="set-options">
					<div class="item">
						<span class="fl label">显示柜封号:</span>
						<div class="fl ml10">
							<el-radio v-model="showContainer" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangeSnNo">{{ item.txt }}</el-radio>
						</div>
					</div>
				</div>

				<div class="operate-btn">
					<el-button type="default" size="mini" @click="close">取消</el-button>
				</div>
			</div>
		</div>
		<iframe id="inlineFrameExample" title="Inline Frame Example" width="100%" height="100%" :src="fileUrl"></iframe>
	</div>
</template>

<script>
import { blFileReview } from '@/api/railway/bl'
export default {
	data() {
		return {
			showContainer: 'n',
			yesOrNoOptions: [
				{ label: 'n', txt: '否' },
				{ label: 'y', txt: '是' }
			],
			loading: false,
			fileUrl: '',
			query: {
				orderNo: '',
				blId: '',
				fileType: 'RAIL_MBL_DRAFT',
				docType: '',
				param: {
					showContainer: 'n',
					asRoleTxt: this.asRoleTxt
				}
			},
			fileType: 'agent',
			asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
			fileTypeOptions: [
				{ label: 'agent', txt: 'MBL不盖章AS AGENT', asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' },
				{ label: 'carrier', txt: 'MBL不盖章AS CARRIER', asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' }
			]
		}
	},
	created() {
		let { orderNo, blId, fileType, docType } = this.$route.query
		this.query = {
			orderNo,
			blId,
			fileType,
			docType,
			param: {
				showContainer: 'n',
				asRoleTxt: this.asRoleTxt
			}
		}
		this.getPreviewData()
	},
	computed: {
		businessType() {
			return JSON.parse(sessionStorage.custStr).businessType
		}
	},
	methods: {
		handleChangeSnNo(val) {
			console.log('🚀 ~ val', val)
			this.getPreviewData()
		},
		getPreviewData() {
			this.loading = true
			if (this.businessType === 'rail_export_lcl') {
				this.query.param.showContainer = this.showContainer
			} else {
				delete this.query.param.showContainer
			}
			this.query.param.asRoleTxt = this.asRoleTxt
			blFileReview(this.query)
				.then(res => {
					this.loading = false
					let { fileNo, name } = res.data
					this.fileUrl = this.getFileUrl({ fileNo, fileName: name })
					console.log('this.fileUrl', this.fileUrl)
				})
				.finally(() => {
					this.loading = false
				})
		},
		getFileUrl(params) {
			let { fileNo, fileName } = params
			if (!fileNo || !fileName) return
			let nameArr = fileName.split('.')
			let name = nameArr[nameArr.length - 1]
			name = name.toLowerCase()
			let href = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileNo}.${name}#toolbar=0&officePreviewType=pdf`
			return href
		},

		handleChangeFileType(val) {
			let findItem = this.fileTypeOptions.find(item => item.label === val)
			this.asRoleTxt = findItem ? findItem.asRoleTxt : ''
			this.getPreviewData()
		},
		close() {
			window.close()
		}
	}
}
</script>

<style lang="scss" scoped>
.print {
	height: 100vh;
	display: flex;
	flex-direction: column;
	#inlineFrameExample {
		flex: 1;
		border-width: 0;
	}
}
.print-tools {
	background: #f7f7f7;
	border-bottom: 1px solid #ddd;
	padding: 10px 20px;
	.w1000 {
		width: 1000px;
		margin: 0 auto;
		font-size: 12px;
		line-height: 28px;
		text-align: center;
		overflow: hidden;
		.set-options {
			float: left;
			line-height: 28px;
			::v-deep .el-radio__label {
				font-size: 12px;
			}
		}
		.operate-btn {
			text-align: right;
			float: right;
		}
		.fl {
			float: left;
		}
	}
	// .print-btn:hover {
	//   background: #666;
	// }
}
</style>
