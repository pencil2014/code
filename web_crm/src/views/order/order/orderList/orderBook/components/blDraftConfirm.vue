<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bl-draft-confirm-form">
			<el-row>
				<el-col :span="12">
					<el-form-item label="单证中心" prop="employeeId" :show-message="false">
						<el-select size="mini" clearable filterable remote v-model="createItem.employeeId" style="width: 100%" placeholder="请选择"  :remote-method="employeeFilterMehod" @change="handleChangeEmployee">
							<el-option v-for="(o, index) in employeeOptions" :key="index" :label="o.label" :value="o.value">
								{{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="截补料时间" prop="siCutOff" :show-message="false">
						<elDatePickerLimit :field="'siCutOff'" size="mini" v-model="createItem.siCutOff" type="datetime" style="width: 100%" clearable :popper-class="'hideMinute'" placeholder="请选择" value-format="yyyy-MM-dd HH" format="yyyy-MM-dd HH" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="24">
					<el-form-item label-width="150px" label="补料是否以附件为准" prop="isBasedFile" :show-message="false">
						<el-radio-group class="bl-file-standard" v-model="createItem.isBasedFile">
							<el-radio :label="item.value" v-for="item in yesOrNoOptions" :key="item.value">{{ item.label }}</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="补料要求" prop="siRemark" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.siRemark" :height="300" />
				<!-- <el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.siRemark" maxlength="512" show-word-limit></el-input> -->
			</el-form-item>
			<el-form-item label="上传附件" :show-message="false">
				<el-upload
					ref="upload"
					drag
					class="upload-file-cont"
					action="#"
					:multiple="true"
					:auto-upload="false"
					:before-upload="getFile"
					:on-change="handleChangeFile"
					:on-remove="handleRemove"
					:http-request="handleImport"
					:file-list="fileList"
					:limit="limitNum"
					:on-exceed="handleExceed"
					:disabled="!canSubmit"
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
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseEmployeeListName, baseDeptParticipants } from '@/api/base'
import { blDraftConfirm, blDetail } from '@/api/order/bl'
import Tinymce from '@/components/Tinymce'

const defaultCreate = {
	orderNo: '',
	employeeId: null,
	blId: '',
	siRemark: '',
	siCutOff: '',
	isBasedFile: 'n'
}

export default {
	data() {
		return {
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '草单确认',
				show: true,
				size: 'medium',
				width: '1100px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				employeeId: [{ required: true, message: '请选择单证中心人员', trigger: 'change' }],
				siCutOff: [{ required: true, message: '请选择截补料时间', trigger: 'change' }],
				siRemark: [{ required: true, message: '请输入补料要求', trigger: 'blur' }],
				isBasedFile: [{ required: true, message: '', trigger: 'blur' }]
			},
			employeeOptions: [],
			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
			timerTr: null,
			cscData: [],
			targetObj: {},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			interval: null
		}
	},
	props: {
		blId: {
			type: [Number , Array],
			default: 0
		},
		workAssign: {
			type: Array,
			default: () => []
		},
		cscUpdateItem: {
			type: Object,
			default: () => ({})
		},
		limitNum: {
			type: Number,
			default: 10
		}
		// blInfoData: {
		//   type: Object,
		//   default: () => ({})
		// }
	},
	created() {
		if (this.cscUpdateItem.employeeId) {
			this.createItem.employeeId = this.cscUpdateItem.employeeId
		} else {
			this.cscData = this.workAssign.filter(item => item.jobCode === 'csc')
			this.createItem.employeeId = this.cscData.length ? this.cscData[0].employeeId : ''
			// 处理id等于0的情况
			this.createItem.employeeId === 0 ? (this.createItem.employeeId = null) : null
		}
		this.getInfo()
		// console.log('this.employeeOptions1111111', this.employeeOptions, this.blInfoData)
	},
	deactivated() {
		clearTimeout(this.timerTr)
		this.timerTr = null
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		BaseDialog,
		Tinymce
	},
	methods: {
		handleExceed(file, fileList) {
			this.$message.warning(`最多上传${this.limitNum}个附件!`)
		},
		getInfo() {
			let blId = ''
			if(Array.isArray(this.blId)){
				blId= this.blId[0]
			}else{
				blId= this.blId
			}
			blDetail({ blId: blId, orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				let { data } = res
				this.createItem.siCutOff = data.orderInfo.siCutOff || ''
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		employeeFilterMehod(val) {
			if(val) {
				this.debounceLxz(() => {
					this.getEmployeeName(val)
				})
			} else {
				this.mapEmployeeOptions()
			}
		},
		handleChangeEmployee(val) {
			let sItem = this.employeeOptions.find(ele => ele.value === val)
            this.targetObj = sItem || {}
			// Object.assign(item, {
			//   employeeId: sItem.employeeId
			// })
		},
		// 获取员工name
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'csc'
			}
			baseDeptParticipants(data).then(res => {
				this.employeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				this.mapEmployeeOptions()
				// console.log('this.createItem.employeeId', this.createItem.employeeId)
			})
		},
		mapEmployeeOptions() {
			if (this.createItem.employeeId && !this.employeeOptions.some(item => item.value === this.createItem.employeeId)) {
				this.employeeOptions.push({
					...this.targetObj,
					label: this.targetObj.label || this.cscUpdateItem.employeeName || this.cscData[0].employeeName,
					value: this.createItem.employeeId
				})
			}
		},
		debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						// this.handleBlDraftConfirm(done)
						if (!this.canSubmit) return
						// 选择以附件为准的时候 附件不能为空
						if (this.createItem.isBasedFile === 'y' && this.fileList.length === 0) return this.$message.warning('附件不能为空!')
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
		// 草单确认
		handleBlDraftConfirm(done) {
			this.createItem.orderNo = this.$route.query.orderNo
			this.createItem.jointNo = this.$route.query.jointNo
			this.createItem.blId = this.blId
			blDraftConfirm(this.createItem).then(res => {
				this.$message({
					type: 'success',
					message: '草单确认成功',
					duration: 1000,
					onClose: () => {
						this.close('Confirm')
					}
				})
			})
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
			this.file = file.raw
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let { siCutOff } = this.createItem
			let siCutOffTemp = ''
			// 截补料时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			if (siCutOff) {
				if (siCutOff.indexOf(':') !== -1) {
					siCutOffTemp = siCutOff.substring(13, 0) + ':00:00'
				} else {
					siCutOffTemp = siCutOff + ':00:00'
				}
			}

			let params ={}
			let url=''
			if(Array.isArray(this.blId)){
				params = {
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						blIdList: this.blId,
						employeeId: this.createItem.employeeId,
						siRemark: this.createItem.siRemark,
						siCutOff: siCutOffTemp,
						isBasedFile: this.createItem.isBasedFile
					},
					fileName: this.fileList
				}
				url= '/order/shipping/bl/draft/confirm/file/batch'
			}else{
				params = {
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						blId: this.blId,
						employeeId: this.createItem.employeeId,
						siRemark: this.createItem.siRemark,
						siCutOff: siCutOffTemp,
						isBasedFile: this.createItem.isBasedFile
					},
					fileName: this.fileList
				}
				url= '/order/shipping/bl/draft/confirm/file'
			}

			// this.$refs.upload.submit()
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: url,
						params: params
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '草单确认成功',
								duration: 1000,
								onClose: () => {
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
.bl-draft-confirm-form {
	.bl-file-standard {
		.el-radio__label {
			font-size: 12px;
		}
	}
}

.bl-draft-confirm-form .el-form-item {
	margin-bottom: 4px;
}
.bl-draft-confirm-form .el-form-item__label,
.bl-draft-confirm-form .el-form-item__content {
	line-height: 20px;
}
.bl-draft-confirm-form .el-form-item.is-error .mce-tinymce {
	border-color: #ff4949;
}
</style>
