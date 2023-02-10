<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<!-- <div class="" style="padding-left:55px; font-size:12px;line-height: 24px">
      客户是否已同意放货，<br />
      1.若已提供保函，选择附件类型，上传保函即可。<br />
      2.若无需提供保函，直接点击确定即可。<br />
    </div> -->
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="blDeliveryApprove-form">
			<el-form-item label="附件类型" prop="fileType" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createItem.fileType" clearable filterable style="width: 100%">
					<el-option v-for="(item, index) in blFileTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<!-- <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="收件人" prop="receiveName" :show-message="false">
            <el-input type="text" :rows="1" placeholder="请输入收件人" v-model="createItem.receiveName">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收件人电话" prop="receivePhone" :show-message="false">
            <el-input type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="收件方地址" prop="receiveAddress" :show-message="false">
        <el-input type="textarea" :rows="1" placeholder="请输入收件方地址" v-model="createItem.receiveAddress">
        </el-input>
      </el-form-item>
      <el-form-item label="寄送备注" prop="receiveRemark" :show-message="false">
        <el-input type="textarea" :rows="1" placeholder="请输入寄送备注" v-model="createItem.receiveRemark">
        </el-input>
      </el-form-item> -->
			<el-form-item label="上传附件" prop="fileName" :class="{ 'is-required': !isPost.includes(blMode) }">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="false" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="handleImport" :file-list="fileList">
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
import BaseDialog from '@/components/Base/Dialog/index'
import { blCreateBlFromExist } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileType: 'release_guarantee',
	blId: '',
	fileName: '',
	receiveName: '',
	receivePhone: '',
	receiveAddress: '',
	receiveRemark: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '客户是否同意放货',
				show: true,
				size: 'medium',
				width: '800px'
			},
			blFileTypeOptions: [{ label: '放单保函', value: 'release_guarantee' }],
			createItem: Object.assign({}, defaultCreate),
			rules: {
				fileType: [{ required: false, message: '请选择附件类型', trigger: 'change' }],
				receiveName: [{ required: false, message: '请输入收件人', trigger: 'change' }],
				receivePhone: [{ required: false, message: '请输入收件人电话', trigger: 'change' }],
				receiveAddress: [{ required: false, message: '请输入收件方地址', trigger: 'change' }],
				receiveRemark: [{ required: false, message: '请输入寄送备注', trigger: 'change' }]
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			// 为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb']
		}
	},
	props: {
		blId: {
			type: Number,
			default: 0
		},
		blMode: {
			type: String,
			default: ''
		}
	},
	created() {
		console.log('🚀 ~ this.dictMap.blMode', this.dictMap.blMode)
		//根据出单方式设置必填项
		this.rules = {
			fileType: [{ required: this.isFileRequired, message: '请选择附件类型', trigger: 'change' }],
			receiveName: [{ required: !this.isFileRequired, message: '请输入收件人', trigger: 'change' }],
			receivePhone: [{ required: !this.isFileRequired, message: '请输入收件人电话', trigger: 'change' }],
			receiveAddress: [{ required: !this.isFileRequired, message: '请输入收件方地址', trigger: 'change' }],
			receiveRemark: [{ required: !this.isFileRequired, message: '请输入寄送备注', trigger: 'change' }]
		}
	},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		isFileRequired() {
			return ['telex_release', 'seaway_bill', 'jthdldf', 'bill_at_destination', 'tdcg', 'ibl', 'free_telex_release'].includes(this.blMode)
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
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
				this.$refs.createForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						// 出单方式为非邮寄的，需要上传附件。邮寄的出单方式类型有：['original','jthdlzb','thzb']
						if (!this.isPost.includes(this.blMode)) {
							if (!this.validate()) return
							this.$refs.upload.submit(done)
						} else {
							// 邮寄时，附件不是必传
							this.$confirm('请确认是否客户同意放货', '提示?', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									if (this.fileList.length) {
										this.$refs.upload.submit(done)
									} else {
										this.handleImport()
									}
								})
								.catch(err => {})
						}
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
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = []
			this.fileList.push(file)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			console.log('this.file', this.file)
			let params = {
				data: {
					blId: this.blId,
					orderNo: this.$route.query.orderNo,
					fileType: this.createItem.fileType,
					receiveName: this.createItem.receiveName,
					receivePhone: this.createItem.receivePhone,
					receiveAddress: this.createItem.receiveAddress,
					receiveRemark: this.createItem.receiveRemark
					// fileModule: 'bl'
				},
				fileName: this.file
			}
			if (this.$route.query.jointNo) {
				params.data.jointNo = this.$route.query.jointNo
			}

			if (this.sizeLimit) {
				this.canSubmit = false
				this.file && this.handleProgress()
				this.$store
					.dispatch('railway/soUpload', {
						uri: '/order/rail/bl/release/agree',
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

<style lang="scss">
.blDeliveryApprove-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
}
.edit-container .blDeliveryApprove-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
