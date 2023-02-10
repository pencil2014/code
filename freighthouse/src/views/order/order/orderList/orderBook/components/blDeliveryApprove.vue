<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<!-- <div class="" style="padding-left:55px; font-size:12px;line-height: 24px" v-if="agreePutQuery.custClass === 'FOREIGN_PEER' && agreePutQuery.blType === 'hbl' && isPost.includes(blMode)">
      {{agreePutQuery.isAgreeRelease === 'e' ? '客户已同意寄单了，' : '客户是否已同意寄单？'}}是否已同意放货？<br />
      1.若已提供保函，选择附件类型，点击上传保函即可。<br />
      2.若无提供保函，直接点击确定即可。<br />
    </div>
    <div class="" style="padding-left:55px; font-size:12px;line-height: 24px" v-else>
      客户是否已同意放货，<br />
      1.若已提供保函，选择附件类型，点击上传保函即可。<br />
      2.若无提供保函，直接点击确定即可。<br />
    </div> -->
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="115px" class="blDeliveryApprove-form">
			<el-form-item label="附件类型" prop="fileType" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createItem.fileType" clearable filterable style="width: 100%" @clear="fileTypeChange" @change="fileTypeChange">
					<el-option key="release_guarantee" label="放单保函" value="release_guarantee"></el-option>
					<el-option v-for="item in blFileTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="类型" prop="blDeliveryMode" :show-message="false">
				<el-radio-group size="mini" placeholder="请选择" v-model="createItem.blDeliveryMode">
					<el-radio v-for="(item, index) in blDeliveryModeOptions" :key="index" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<template v-if="!isSelectSelf">
				<el-row :gutter="10">
					<el-col :span="12">
						<el-form-item label="收件人" prop="receiveName" :show-message="false">
							<div class="receive-name-class">
								<el-input maxlength="128" type="text" class="receive-name-input-class" :rows="1" placeholder="请输入收件人" v-model="createItem.receiveName"> </el-input>
								<el-button v-if="createItem.blDeliveryMode === 'express'" type="default" size="mini" class="receive-name-btn-class" @click="selectAddress">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="收件人电话" prop="receivePhone" :show-message="false">
							<el-tooltip effect="dark" v-if="createItem.receivePhone && createItem.receivePhone.length > 30" :content="createItem.receivePhone" placement="top">
								<el-input maxlength="128" show-word-limit type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone"> </el-input>
							</el-tooltip>
							<el-input v-else maxlength="128" show-word-limit type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone"> </el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="收件方地址" prop="receiveAddress" :show-message="false">
					<el-input maxlength="512" type="textarea" :rows="1" placeholder="请输入收件方地址" v-model="createItem.receiveAddress"> </el-input>
				</el-form-item>
				<el-form-item label="寄送备注" prop="receiveRemark" :show-message="false">
					<el-input type="textarea" :rows="1" placeholder="请输入寄送备注" v-model="createItem.receiveRemark"> </el-input>
				</el-form-item>
			</template>
			<el-row :gutter="10">
				<el-col :span="24">
					<el-form-item label="一起寄其他单证附件" prop="docAndInsuranceIds" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.docAndInsuranceIds" clearable filterable multiple collapse-tags style="width: 100%">
							<el-option v-for="item in docAndInsuranceFileOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item class="relation-file-no" label="关联附件" prop="relationFileNo" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createItem.relationFileNo" clearable filterable style="width: 100%">
					<el-option v-for="item in relationFileNoOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
				<el-tooltip class="item" effect="dark" content="可关联本单已上传的其他放单保函附件." placement="top">
					<i class="el-icon-question"></i>
				</el-tooltip>
			</el-form-item>
			<el-form-item label="上传附件" prop="fileName" :class="{ 'is-required': mustUploadFile }">
				<el-upload
					:disabled="fileTypeIsLong || !canSubmit"
					ref="upload"
					drag
					class="upload-file-cont"
					action="#"
					:multiple="isGuarantee"
					:auto-upload="false"
					:before-upload="getFile"
					:on-change="handleChangeFile"
					:on-remove="handleRemove"
					:on-exceed="handleExceed"
					:http-request="uploadFile"
					:file-list="fileList"
					:limit="isGuarantee ? 5 : 1"
				>
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
		<div v-if="addressPop">
			<addressModulePop @close="addressPopClose" :custid="agreePutQuery.custid" />
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blCreateBlFromExist, blDetailForOrder, relationGuarantees } from '@/api/order/bl'
import addressModulePop from './addressModulePop.vue'
import { getDictMap } from '@/utils/tools'
import { tradeDocList } from '@/api/order/document'
import { insuranceList } from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'

const defaultCreate = {
	orderNo: '',
	fileType: 'release_guarantee',
	blId: '',
	fileName: '',
	receiveName: '',
	receivePhone: '',
	receiveAddress: '',
	blDeliveryMode: 'express',
	receiveRemark: '',
	agreePut: 'y',
	relationFileNo: '',
	docAndInsuranceIds: []
}

export default {
	data() {
		return {
			relationFileNoOptions: [],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '客户是否同意放货',
				show: true,
				size: 'medium',
				width: '800px'
			},
			blFileTypeOptions: [],
			blDeliveryModeOptions: [],
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
			// 正本为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb'],
			custFileNo: '', // 选择长期保函的附件编号
			custFileName: '',
			interval: null,
			addressPop: false,
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			docAndInsuranceFileOptions: []
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
		},

		agreePutQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		console.log("🚀 ~ this.agreePutQuery", this.agreePutQuery)
		// 电放 默认不选择类型
		if (this.isFileRequired) {
			this.createItem.blDeliveryMode = ''
		}
		// console.log("🚀 ~ this.dictMap.blMode", this.dictMap.blMode)
		//根据出单方式和服务类型设置必填项
		if (['st01'].includes(this.orderInfoDataObj.serviceType || this.agreePutQuery.serviceType)) {
			this.rules = {
				fileType: [{ required: this.isFileRequired, message: '请选择附件类型', trigger: 'change' }],
				blDeliveryMode: [{ required: !this.isFileRequired, message: '请选择类型', trigger: 'change' }]
			}
		} else {
			this.rules = {
				fileType: [{ required: this.isFileRequired, message: '请选择附件类型', trigger: 'change' }],
				blDeliveryMode: [{ required: !this.isFileRequired, message: '请选择类型', trigger: 'change' }],
				receiveName: [{ required: !this.isFileRequired, message: '请输入收件人', trigger: 'change' }],
				receivePhone: [{ required: !this.isFileRequired, message: '请输入收件人电话', trigger: 'change' }],
				receiveAddress: [{ required: !this.isFileRequired, message: '请输入收件方地址', trigger: 'change' }],
				receiveRemark: [{ required: !this.isFileRequired, message: '请输入寄送备注', trigger: 'change' }]
			}
		}

		this.createItem.receiveAddress = this.agreePutQuery.receiveAddress
		this.createItem.receiveName = this.agreePutQuery.receiveName
		this.createItem.receivePhone = this.agreePutQuery.receivePhone
		this.createItem.receiveRemark = this.agreePutQuery.receiveRemark
		this.blDeliveryModeOptions = getDictMap('blDeliveryMode') // 类型
		console.log('this.blDeliveryModeOptions ', this.blDeliveryModeOptions)
		// 委托单位为国外代理的H单正本的确定按钮设置
		if (this.agreePutQuery.custClass === 'FOREIGN_PEER' && this.agreePutQuery.blType === 'hbl' && this.isPost.includes(this.blMode)) {
			// 同意寄单同意放货
			if (this.agreePutQuery.isAgreeRelease === 'e') {
				this.dialogConfig.btns = [
					{ label: '同意寄单，同意放货', action: 'ConfirmY', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			} else {
				// 同意寄单不同意放货
				this.dialogConfig.btns = [
					{ label: '同意寄单，不同意放货', action: 'ConfirmE', type: 'primary' },
					{ label: '同意寄单，同意放货', action: 'ConfirmY', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			}
		}
		this.getBlDetailForOrder()
		this.getRelationGuarantees()
		this.getDocAndInsuranceFileList()
	},
		
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			custInfoObj: state => state.order.custInfoObj,
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		// 电放
		isFileRequired() {
			return ['telex_release', 'seaway_bill', 'jthdldf', 'bill_at_destination', 'tdcg', 'ibl', 'free_telex_release'].includes(this.blMode)
		},
		isSelectSelf() {
			// 类型选择了 自取
			return this.createItem.blDeliveryMode === 'self'
		},
		fileTypeIsLong() {
			// 附件类型选择了长期保函
			return !!this.createItem.fileType && this.createItem.fileType !== 'release_guarantee'
		},
		blModeIsPost() {
			// 出单方式选择了邮寄 邮寄的出单方式类型有：['original','jthdlzb','thzb']
			return this.isPost.includes(this.blMode)
		},
		mustUploadFile() {
			// 必须上传附件的条件
			return (
				!this.blModeIsPost && !this.fileTypeIsLong && !this.createItem.relationFileNo // 出单方式选择了 非邮寄
			) // 附件类型没选择了长期保函
		},
		isGuarantee() {
			return this.createItem.fileType === 'release_guarantee'
		}
	},
	watch: {},
	components: {
		BaseDialog,
		addressModulePop
	},
	methods: {
		getDocAndInsuranceFileList() {
			let data = {
				orderNo: this.$route.query.orderNo || this.agreePutQuery.orderNo,
				blId: this.agreePutQuery.blId
			}
			Promise.all([tradeDocList(data), insuranceList(data)]).then(res => {
				let data1 = res[0].data || []
				let data2 = res[1].data || []
				// data1.filter(item => item.fileNo)
				data1 = data1.map(item => {
					let docName = getDictLabel('tradeDocName', item.docName)
					return { ...item, label: `${docName}(${item.invoiceNo})`, value: item.docId }
				})
				// data2.filter(item => item.billFileNo)
				data2 = data2.map(item => {
					return { ...item, label: `保险(${item.invoiceNo})`, value: item.oid }
				})
				this.docAndInsuranceFileOptions = data1.concat(data2)
				console.log('this.docAndInsuranceFileOptions', this.docAndInsuranceFileOptions)
			})
		},
		getRelationGuarantees() {
			relationGuarantees({ orderNo: this.$route.query.orderNo || this.agreePutQuery.orderNo }).then(res => {
				if (res.data) {
					this.relationFileNoOptions = res.data.map(item => {
						return {
							label: item.fileName,
							value: item.fileNo
						}
					})
				}
			})
		},
		getBlDetailForOrder() {
			blDetailForOrder({ custid: this.custInfoObj.custid || this.agreePutQuery.custid }).then(res => {
				// guaranteeType
				console.log('长期保函字典：', this.dictMap['custGuaranteeType'])
				console.log('附件类型数据： ', res.data)
				let effectStatusData = res.data.filter(item => {
					return item.status === 'effect' // 筛选出有效的长期保函
				})
				if (effectStatusData && effectStatusData.length) {
					let custGuaranteeTypeList = this.dictMap['custGuaranteeType']
					let obj = {}
					effectStatusData.forEach(item1 => {
						obj = custGuaranteeTypeList.find(item2 => {
							return item1.guaranteeType === item2.value
						})
						if (obj && obj.value) {
							this.blFileTypeOptions.push({ ...obj, fileNo: item1.fileNo, fileName: item1.fileName })
						}
					})
				}
				console.log('客户拥有的有效的长期保函： ', this.blFileTypeOptions)
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		fileTypeChange(val) {
			if (this.fileTypeIsLong) {
				let obj = this.blFileTypeOptions.find(item => {
					return item.value === val
				})
				this.custFileNo = obj.fileNo
				this.custFileName = obj.fileName
				this.fileList = []
				this.fileList.push({
					name: this.custFileName
				})
			} else {
				this.fileList = []
				this.custFileNo = ''
				this.custFileName = ''
			}
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
			if (action.startsWith('Confirm')) {
				if (action === 'ConfirmE') {
					this.createItem.agreePut = 'e'
				}
				this.$refs.createForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						if (this.mustUploadFile) {
							if (!this.validate()) return
							this.handleImport(done)
							// this.$refs.upload.submit(done)
						} else {
							// 邮寄时，附件不是必传
							let msg = '请确认是否客户同意放货'
							if (action === 'ConfirmE') {
								msg = '请确认是否客户同意寄单，不同意放货'
							}
							this.$confirm(msg, '提示?', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									// if (this.fileList.length && !this.fileTypeIsLong) {
									// 	this.$refs.upload.submit(done)
									// } else {
									// 	this.handleImport()
									// }
									this.handleImport(done)
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
			// this.fileList = []
			// this.fileList.push(file)
			this.fileList = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleExceed(file, fileList) {
			this.isGuarantee && this.$message.error('最多上传5个附件!')
		},
		uploadFile(file) {
			this.file = file.file
		},
		handleImport(done) {
			let docAndInsuranceIds = this.docAndInsuranceFileOptions.filter(item => this.createItem.docAndInsuranceIds.includes(item.value))
			let params = {
				data: {
					blId: this.blId || this.agreePutQuery.blId,
					orderNo: this.$route.query.orderNo || this.agreePutQuery.orderNo,
					fileType: this.fileTypeIsLong ? 'cust_guarantee' : this.createItem.fileType,
					receiveName: this.createItem.receiveName,
					receivePhone: this.createItem.receivePhone,
					receiveAddress: this.createItem.receiveAddress,
					receiveRemark: this.createItem.receiveRemark,
					agreePut: this.createItem.agreePut,
					blDeliveryMode: this.createItem.blDeliveryMode,
					relationFileNo: this.createItem.relationFileNo,
					documentIds: docAndInsuranceIds.filter(item => item.docId).map(item => item.docId),
					insuranceIds: docAndInsuranceIds.filter(item => !item.docId).map(item => item.oid)
					// fileModule: 'bl'
				},
				// fileName: this.file
				fileName: this.fileList
			}
			if (this.$route.query.jointNo) {
				params.data.jointNo = this.$route.query.jointNo
			}
			if (this.fileTypeIsLong) {
				params.data.crmFileType = this.createItem.fileType
				params.data.fileNo = this.custFileNo
				params.fileName = null
				this.canSubmit = false
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shipping/bl/release/agree',
						params: params
					})
					.then(res => {
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
			} else {
				console.log('this.file', this.file)
				if (this.sizeLimit) {
					this.canSubmit = false
					this.file && this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: '/order/shipping/bl/release/agree',
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
						.catch(err => {
							clearInterval(this.interval)
							this.interval = null
							this.processLength = 0
							this.showProcess = false
							this.fileList = []
							this.canSubmit = true
						})
				}
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
		},
		selectAddress() {
			this.addressPop = true
		},
		addressPopClose(action, value) {
			this.addressPop = false
			console.log(value)
			if (action === 'Confirm') {
				this.createItem.receiveName = value.name || ''
				this.createItem.receivePhone = value.phone || ''
				this.createItem.receiveAddress = value.address || ''
			} else {
			}
		}
	}
}
</script>

<style lang="scss">
.blDeliveryApprove-form {
	.relation-file-no {
		position: relative;
		.el-icon-question {
			position: absolute;
			right: -16px;
			top: 3px;
		}
	}
	.el-form-item {
		margin-bottom: 4px;
		.el-radio__label {
			font-size: 12px;
		}
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
	.receive-name-class {
		display: flex;
		.receive-name-input-class {
			width: 90%;
		}
		.receive-name-btn-class {
			margin-left: 5px;
		}
	}
}
.edit-container .blDeliveryApprove-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
