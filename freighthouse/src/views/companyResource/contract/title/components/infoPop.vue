<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="saveForm" :rules="rules" :model="createdItem" label-position="right" class="save-form">
			<el-row>
				<el-col :span="6">
					<el-form-item label="英文名称" prop="ename" :required="true" :show-message="false" label-width="70px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.ename" maxlength="128"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="中文名称" prop="cname" :required="false" :show-message="false" label-width="80px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.cname" maxlength="128"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="纳税人识别号" prop="identNumber" :required="false" :show-message="false" label-width="100px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.identNumber" maxlength="128"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="联系人" prop="contact" :required="false" :show-message="false" label-width="80px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contact" maxlength="64"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="TEL" prop="contactTel" :required="false" :show-message="false" label-width="70px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contactTel" maxlength="64"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="手机" prop="contactPhone" :required="false" :show-message="false" label-width="80px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contactPhone" maxlength="64"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="邮箱" prop="contactEmail" :required="false" :show-message="false" label-width="100px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contactEmail" maxlength="64"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="中英文地址" prop="contactAddress" :required="false" :show-message="false" label-width="70px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contactAddress" maxlength="512"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="网址" prop="webUrl" :required="false" :show-message="false" label-width="100px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.webUrl" maxlength="512"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="抬头简介" prop="description" :required="true" :show-message="false" label-width="70px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.description" maxlength="512"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="备注信息" prop="remark" :required="false" :show-message="false" label-width="70px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.remark" maxlength="512"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="附件" prop="fileName" :required="false" :show-message="false" label-width="70px">
						<div class="file-row" v-if="infoFileList.length">
							<div v-for="(item, index) in infoFileList" :key="'file'+index" class="file-name">
								<el-button type="text" size="mini" @click="handleViewFile(item)">{{item.name}}</el-button>
								<i class="el-icon-close" @click="handleDeleteFile(item.oid)"></i>
							</div>
						</div>
						<div class="tip-upload">建议上传该抬头的营业执照、名片、开票信息等附件。</div>
						<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
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
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { contractTitleInfo} from '@/api/order/contract'

const defaultCreateQuery = {
	oid: undefined,
	ename: '',
	cname: '',
	identNumber: '',
	contact: '',
	contactTel: '',
	contactPhone: '',
	contactEmail: '',
	contactAddress: '',
	webUrl: '',
	description: '',
	remark: ''
}

export default {
	data() {
		return {
			state: '',
			dialogConfig: {
				title: '新增抬头',
				show: true,
				size: 'medium',
				width: '1000px'
			},
			createdItem: Object.assign({}, defaultCreateQuery),
			rules: {},
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			canSubmit: true,
			infoFileList: [],
			interval: null
		}
	},
	props: {
		infoPopQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.init(this.infoPopQuery)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		enameDisabled() {
			return this.createdItem.oid ? true : false
		}
	},
	watch: {
	},
	components: {
		BaseDialog
	},
	methods: {
		init(values) {
			console.log('values', values);
			if (values.oid) {
				this.$set(this.dialogConfig, 'title', '编辑抬头')
				this.$set(this.createdItem, 'oid', values.oid)
				this.getInfo()
			} else {
				this.$set(this.dialogConfig, 'title', '新建抬头')
				this.infoFileList = []
				this.createdItem = Object.assign({}, defaultCreateQuery)
			}
		},
		getInfo() {
			contractTitleInfo({oid: this.createdItem.oid}).then(res => {
				for (let i in defaultCreateQuery) {
					this.createdItem[i] = res.data[i]
				}
				this.infoFileList = res.data.fileList || []
			})
		},
		handleViewFile(item) {
      this.$store.dispatch('order/previewFile', {fileNo: item.fileNo, fileName: item.name})
    },
    handleDeleteFile(oid) {
      this.infoFileList = this.infoFileList.filter(item => item.oid !== oid)
    },
		close(action) {
			this.$emit('close', action)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.saveForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						// // 附件不能为空
						// if (this.fileList.length === 0) return this.$message.warning('附件不能为空!')
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
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = fileList
			// this.fileList = []
			// this.fileList.push(file)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		getFileNos(fileList) {
			let result = fileList.map(item => item.fileNo) || []
			if (result.length === 0) result = null
			return result
		},
		handleImport() {
			let {oid, ename, cname, identNumber, contact, contactTel, contactPhone, contactEmail, contactAddress, webUrl, description, remark} = this.createdItem
			let params = {
				data: {
					oid,
					ename,
					cname,
					identNumber,
					contact,
					contactTel,
					contactPhone,
					contactEmail,
					contactAddress,
					webUrl,
					description,
					remark,
					fileNoList: this.getFileNos(this.infoFileList)
				},
				fileName: this.fileList
			}
			// this.$refs.upload.submit()
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store.dispatch('order/soUpload', {
					uri: '/order/contract/title/save',
					params: params
				}).then(res => {
					this.processLength = 100
					this.showProcess = false
					this.fileList = []
					this.canSubmit = true
					if (res === 'error') return
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
						}
					})
				}).catch(err => {
					clearInterval(this.interval)
					this.interval = null
					this.processLength = 0
					this.showProcess = false
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
.tip-upload{
	font-size: 12px;
}
</style>
