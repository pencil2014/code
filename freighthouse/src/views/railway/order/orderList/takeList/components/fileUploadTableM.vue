<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="120px" class="create-form">
			<el-form-item v-if="row.blNo" >
				 <template slot="label">
					 <div>{{getLabel()}}</div>
				 </template>
                 <div class="fz-class">{{row.blNo}}</div>
			</el-form-item>
			<el-form-item label="附件类型：" prop="fileType" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createdItem.fileType" clearable filterable style="width: 100%;">
					<el-option v-for="(item, index) in blFileTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="上传附件：">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="handleImport" :file-list="fileList">
					<div class="file-upload">
						<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
						<div class="file-upload__text">
							<div class="txt">点击或将文件拖拽到这里导入</div>
							<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { getDocTypeName, getFileBatchNo } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileName: '',
	oid: '',
	fileType: ''
}

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
				width: '600px'
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
				fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			createdItem: Object.assign({}, defaultCreate),
			blFileTypeOptions: [
				{ label: 'M单正本', value: 'mbl_original' },
				{ label: 'HBL单正本', value: 'hbl_original' }
			]
		}
	},
	props: {
		sourceType: {
			type: String,
			default: ''
		},
		row: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// this.blFileTypeOptions = [{label: 'M单正本', value: 'mbl_original'}].concat(this.dictMap.tradeDocName)
		console.log('route', this.$route.name)

		this.getFileTypeOption()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			// orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		getLabel() {
		   let labelName = ''
           switch (this.sourceType) {
				case 'RailwayMblTakeList':
					labelName = 'M单号：'
					break
			    case 'RailwayHblTakeList':
					labelName = "H单号："		
				default:
					break
			}
			return labelName
		},
		getFileTypeOption() {
			console.log('🚀 ~ this.route.', this.$route)
			console.log('🚀 ~ row', this.row)
			switch (this.$route.name) {
				case 'RailwayHblTakeList':
					this.blFileTypeOptions = [{ label: 'HBL单正本', value: 'hbl_original' }]
					break
				case 'RailwayMblTakeList':
					this.blFileTypeOptions = [{ label: 'M单正本', value: 'mbl_original' }]
					break
				case 'RailwayTradeTakeList':
					getDocTypeName({ orderNo: this.row.orderNo }).then(res => {
						this.blFileTypeOptions = Object.keys(res.data).map(item => {
							return { label: res.data[item], value: item }
						})
					})
					break
				default:
					break
			}
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		validate() {
			if (!this.fileList.length) {
				this.$message({
					type: 'error',
					message: '请先上传附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						// this.$refs.upload.submit(done)
						this.handleImport()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		handleChangeFile(file, fileList) {
			// this.fileList.push(file)
			this.fileList = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let params = {
				data: {
					blId: this.row.blId,
					orderNo: this.row.orderNo,
					fileType: this.createdItem.fileType
				},
				fileName: this.fileList
			}
			if (this.fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: '/order/blFile/upload',
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
								this.canSubmit = true
								if (res === 'error') return
								this.$message({
									type: 'success',
									message: '导入成功',
									duration: 1000,
									onClose: () => {
										this.close('Confirm')
									}
								})
							})
					}
				})
			} else {
				params.data.fileBatchNo = ''
				if (this.sizeLimit) {
					this.canSubmit = false
					this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: '/order/blFile/upload',
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
							this.canSubmit = true
							if (res === 'error') return
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						})
				}
			}

			// if (this.sizeLimit) {
			// 	this.canSubmit = false
			// 	this.handleProgress()
			// 	this.$store
			// 		.dispatch('order/soUpload', {
			// 			uri: '/order/blFile/upload',
			// 			params: params
			// 		})
			// 		.then(res => {
			// 			this.processLength = 100
			// 			this.showProcess = false
			// 			this.fileList = []
			// 			this.canSubmit = true
			// 			if (res === 'error') return
			// 			this.$message({
			// 				type: 'success',
			// 				message: '导入成功',
			// 				duration: 1000,
			// 				onClose: () => {
			// 					this.close('Confirm')
			// 				}
			// 			})
			// 		})
			// }
		},

		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			const interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>
<style lang="scss" scoped>
.create-form {
   .fz-class {
	  font-size: 12px !important;
   }
}
</style>
