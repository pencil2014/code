<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createSoForm" :model="createdItem" class="so-update-form" label-width="80px">
			<el-row class="create-so">
				<el-col :span="12">
					<el-form-item label="SO号">
						<el-input disabled size="mini" v-model="createdItem.so"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="大船起运港">
						<el-select disabled size="mini" v-model="createdItem.polPortCode" remote style="width: 100%">
							<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="目的港">
						<el-select disabled size="mini" v-model="createdItem.podPortCode" remote style="width: 100%">
							<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="船名">
						<el-autocomplete disabled style="width: 100%" size="mini" v-model="createdItem.vessel" :maxlength="128"></el-autocomplete>
					</el-form-item>
				</el-col>

				<el-col :span="12">
					<el-form-item label="航次">
						<el-autocomplete disabled style="width: 100%" size="mini" v-model="createdItem.voyage" :maxlength="128"></el-autocomplete>
					</el-form-item>
				</el-col>

				<el-col :span="12">
					<el-form-item label="大船截关时间">
						<elDatePickerLimit disabled v-model="createdItem.cutOffDate" type="date" value-format="yyyy-MM-dd" size="mini" style="width: 100%"> </elDatePickerLimit>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="箱型箱量">
						<el-input disabled size="mini" v-model="createdItem.containerInfo"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="SO附件">
						<el-upload
							ref="upload"
							class="upload-demo"
							drag
							:multiple="false"
							action="#"
							:on-preview="handlePreview"
							:before-upload="beforeUpload"
							:on-change="handleChangeFile"
							:on-remove="handleRemove"
							:file-list="fileList"
							:http-request="handleUpload"
							:auto-upload="false"
							:disabled="!canSubmit"
						>
							<div class="el-upload">
								<div class="img">
									<img src="@/assets/icon-upload.png" />
								</div>

								<div class="el-upload__text">
									<div>点击或将文件拖拽到这里导入</div>
									<p>
										支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内
									</p>
								</div>
							</div>
						</el-upload>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { addSO, getBookSoList } from '@/api/order/book/list'

export default {
	data() {
		return {
			dialogConfig: {
				title: '更新SO',
				show: true,
				width: '800px'
			},

			createdItem: {
				vessel: '',
				voyage: '',
				cutOffDate: '',
				polPortCode: '',
				podPortCode: '',
				containerInfo: '',
				so: ''
			},

			file: '',
			fileList: [],
			showProcess: false,
			canSubmit: true, // 可提交标识
			processLength: 0,
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			interval: null,
			portList: []
		}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	async created() {
		//起运港反显 先填充数据源 再为下拉框赋值
		this.$store
			.dispatch('dict/basePortList', {
				queryString: this.orderInfo.polPortCode,
				portAttribute: 'port_of_basic',
				state: 'valid'
			})
			.then(data => {
				this.portList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.createdItem.polPortCode = this.orderInfo.polPortCode
			})
		//目的港反显 先填充数据源 再为下拉框赋值
		this.$store
			.dispatch('dict/basePortList', {
				queryString: this.orderInfo.podPortCode,
				portAttribute: 'port_of_destination',
				state: 'valid'
			})
			.then(data => {
				this.portList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.createdItem.podPortCode = this.orderInfo.podPortCode
			})
		// 数据反显
		this.createdItem.so = this.orderInfo.so
		this.createdItem.vessel = this.orderInfo.vessel
		this.createdItem.voyage = this.orderInfo.voyage
		this.createdItem.cutOffDate = this.orderInfo.cutOffDate
		this.createdItem.containerInfo = this.orderInfo.containerInfo
	},

	mounted() {},

	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		//预览上传的文件
		handlePreview(file) {
			let url = ''
			if (window['createObjcectURL'] != undefined) {
				url = window['createObjcectURL'](file.raw)
			} else if (window['URL'] != undefined) {
				url = window['URL'].createObjectURL(file.raw)
			} else if (window['webkitURL'] != undefined) {
				url = window['webkitURL'].createObjectURL(file.raw)
			}
			window.open(url)
		},

		// 港口
		portVisibleChange(val, type) {
			if (val) this.portSearch('', type)
		},

		portRemoteMehod(val, type) {
			this.portSearch(val, type)
		},

		// 港口下拉数据
		portSearch(queryString, type) {
			let portAttribute = ''
			if (type === 'polPortCode') portAttribute = 'port_of_basic'
			if (type === 'podPortCode') portAttribute = 'port_of_destination'
			this.$store
				.dispatch('dict/basePortList', {
					queryString,
					portAttribute,
					state: 'valid'
				})
				.then(data => {
					this.portList = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
					console.log('🚀 ~ this.portList', this.portList)
				})
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		validate() {
			if (!this.fileList.length) {
				this.$message({
					type: 'error',
					message: '请先上传SO附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createSoForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						this.$refs.upload.submit(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		beforeUpload(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = []
			this.fileList.push(file)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		// 上传
		handleUpload(done) {
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shiporder/spacebook/bkg/so/update',
						params: { fileName: this.file, data: this.createdItem }
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.file = ''
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '更新成功',
								duration: 1000,
								onClose: () => {
									// this.$emit('handleBack', res.data)
									this.close('Confirm')
								}
							})
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
						this.file = ''
						this.canSubmit = true
					})
			}
		},
		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			this.interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(this.interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>

<style lang="scss">
.so-update-form {
	.drop-so-title {
		padding-left: 68px;
		height: 25px;
		font-weight: 700;
		font-size: 12px;
	}
	.el-upload {
		display: flex;
		align-items: center;
		.img {
			margin-left: 10px;
		}
		.el-upload__text {
			padding: 10px;
			font-size: 12px;
			font-weight: 400;
			color: #4a4a4a;
			text-align: left;
			p {
				color: #bfbfbf;
			}
		}
	}
}
.so-update-form .create-so .el-col {
	padding-bottom: 5px;
}
.so-update-form .create-so .el-form-item__label {
	line-height: 28px;
}
.so-update-form .el-date-editor.el-input,
.so-update-form .el-date-editor.el-input__inner {
	width: auto;
}
.so-update-form .containerList .center {
	text-align: center;
	line-height: 28px;
}
.so-update-form .containerList .btn-plus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	margin-top: 0px;
	margin-left: 10px;
	&::before {
		content: '';
		display: block;
		position: absolute;
		width: 1px;
		height: 15px;
		background: #999;
		left: 9px;
		top: 2px;
	}
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
.so-update-form .containerList .btn-minus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	margin-top: 4px;
	margin-left: 10px;
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
.so-update-form .containerList .el-col {
	padding-bottom: 5px;
}
</style>
