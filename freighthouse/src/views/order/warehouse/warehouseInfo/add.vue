<template>
	<div class="edit-container">
		<div class="edit-row">
			<div class="edit-container">
				<div class="row-tit">
					<span class="tit">仓库信息</span>
					<div class="row-tit-operate ware-house-btns">
						<el-button @click="handleCancel" type="default" size="mini" style="margin-left: 10px"> 取消 </el-button>
						<el-button v-if="$route.query.whId" @click="handleUpdateState" :type="form.status === 'no_effect' ? 'primary' : 'danger'" size="mini" style="margin-left: 10px">{{ form.status === 'no_effect' ? '生效' : '失效' }}</el-button>
						<el-button @click="handleSave" type="primary" size="mini" style="margin-left: 10px"> 保存 </el-button>
					</div>
				</div>
				<div id="addform">
					<el-form ref="form" :show-message="false" :model="form" :rules="rules" label-width="90px" label-position="right" style="min-height: 500px">
						<el-row style="display: flex; flex-wrap: wrap">
							<el-col :span="5" class="mb10">
								<el-form-item label="名称" prop="warehouseName">
									<el-input v-model="form.warehouseName" size="mini" placeholder="请输入名称"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="19" class="mb10">
								<el-form-item label="地址" prop="warehouseAddress">
									<el-input v-model="form.warehouseAddress" size="mini" placeholder="请输入仓库地址"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<supplierSelect paramCategory="category" paramValue="ware_house" :supplierId.sync="form.supplierId" :supplierName.sync="form.supplierName" />
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item label="联系人" prop="contact">
									<el-input v-model="form.contact" size="mini" placeholder="请输入联系人"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item class="warehouse-contact-phone" label="联系人电话" prop="contactPhone">
									<el-input v-model="form.contactPhone" size="mini" placeholder="请输入联系电话"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item label="传真" prop="fax">
									<el-input v-model="form.fax" size="mini" placeholder="请输入传真"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="4" class="mb10">
								<el-form-item label="邮箱" prop="email">
									<el-input v-model="form.email" size="mini" placeholder="请输入邮箱"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item label="仓库免租期" prop="rentFreePeriod">
									<el-input size="mini" placeholder="请输入仓库免租期" v-model="form.rentFreePeriod">
										<template slot="append">天</template>
									</el-input>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item label="收货时间" prop="receiptTime">
									<!-- <el-input v-model="form.receiptTime" size="mini"></el-input> -->
									<el-time-picker size="mini" is-range v-model="receiptTime" value-format="HH:mm" format="HH:mm" range-separator="—" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" style="width: 100%">
									</el-time-picker>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item class="warehouse-contact-phone" label="仓位图">
									<!-- <UploadImg :uploadConf="uploadConf" @callBack="uploadCallBack"></UploadImg> -->
									<div class="upload-row">
										<el-upload
											style="display: inline-block"
											ref="upload"
											action="#"
											:auto-upload="true"
											:before-upload="getFile"
											:on-change="handleChangeFile"
											:http-request="content => handleImport(content)"
											:show-file-list="false"
											:file-list="fileList"
										>
											<!-- <el-button type="primary" size="mini">上传</el-button> -->
											<el-input ref="warehouseInput" @focus="handleView" size="mini" v-model="form.fileName"> </el-input>
											<el-button class="upload-btn" slot="trigger" size="mini" type="text"><i class="el-icon-upload2"></i></el-button>
										</el-upload>
										<!-- <el-button type="text" size="mini" v-if="form.fileNo">
											<span @click="handleView">{{ form.fileName }}</span>
											<i class="el-icon-close" @click="handleDeleteFile"></i>
										</el-button> -->
									</div>
								</el-form-item>
							</el-col>
							<el-col :span="5" class="mb10">
								<el-form-item prop="mapFileNo" label="路线图">
									<div class="upload-row">
										<el-upload
											style="display: inline-block"
											ref="upload"
											action="#"
											:auto-upload="true"
											:before-upload="getFileMap"
											:on-change="handleChangeFileMap"
											:http-request="content => handleImportMap(content)"
											:show-file-list="false"
											:file-list="fileListMap"
											accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP"
										>
											<el-input ref="mapInput" @focus="handleViewMap" size="mini" v-model="form.mapFileName"> </el-input>
											<el-button class="upload-btn" slot="trigger" size="mini" type="text"><i class="el-icon-upload2"></i></el-button>
										</el-upload>
										<!-- <el-button type="text" size="mini" v-if="form.mapFileNo">
											<span @click="handleViewMap">{{ form.mapFileName }}</span>
											<i class="el-icon-close" @click="handleDeleteFileMap"></i>
										</el-button> -->
									</div>
								</el-form-item>
							</el-col>
							<el-col :span="24" class="mb10">
								<el-form-item label="备注信息" prop="remark">
									<el-input type="textarea" v-model="form.remark" size="mini" placeholder="请输入备注信息"></el-input>
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { warehouseSave, warehouseDetail, updateStatus } from '@/api/order/warehouse'
// import UploadImg from '@/components/Base/upload/uploadImg'
import FileUpload from './fileUpload'
import supplierSelect from '@/components/Form/supplierSelect'

export default {
	data() {
		return {
			disableEffect: false,
			fileListMap: [],
			fileMap: '',
			uploadConf: {
				dialogImageUrl: '',
				dialogVisible: false,
				url: '/order/warehouse/uploadFile'
			},
			form: {
				warehouseName: '',
				warehouseAddress: '',
				supplierId: '',
				remark: '',
				contact: '',
				contactPhone: '',
				fileNo: '',
				fax: '',
				email: '',
				rentFreePeriod: '',
				mapFileNo: '',
				mapFileName: ''
			},
			receiptTime: ['07:00', '18:00'], // 收货时间
			rules: {
				warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				warehouseAddress: [{ required: true, message: '仓库地址不能为空', trigger: 'blur' }],
				contact: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
				contactPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
				supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
				// remark: [{ required: true, message: '备注信息不能为空', trigger: 'blur' }],
				fax: [{ required: true, message: '传真不能为空', trigger: 'blur' }],
				email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
				rentFreePeriod: [{ required: true, message: '', trigger: 'blur' }],
				mapFileNo: [{ required: true, message: '路线图不能为空', trigger: 'blur' }]
			},
			supplierList: [],
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			canSave: true
		}
	},
	components: {
		FileUpload,
		supplierSelect
	},
	created() {
		if (this.$route.query.whId) {
			this.getDetail()
		}
	},
	methods: {
		// 生效，失效
		handleUpdateState() {
			let text = this.form.status === 'no_effect' ? '生效' : '失效'
			let status = this.form.status === 'no_effect' ? 'effect' : 'no_effect'
			this.$confirm(`是否确认修改状态为${text}?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(() => {
					return updateStatus({ whId: this.$route.query.whId, status })
				})
				.then(() => {
					this.getDetail()
					this.$message({ message: '修改状态成功', type: 'success' })
				})
				.catch(() => {})
		},
		handleImportMap(content) {
			console.log(content)
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.fileMap)
			if (this.sizeLimit) {
				this.$store
					.dispatch('user/import', {
						uri: '/order/warehouse/uploadFile',
						params: form
					})
					.then(res => {
						this.fileListMap = []
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							this.form.mapFileNo = res.data.data.fileNo
							this.form.mapFileName = res.data.data.name
						}
					})
			}
		},
		// 新添加文件替换之前添加的文件
		handleChangeFileMap(file, fileList) {
			this.fileListMap = []
			this.fileListMap.push(file)
		},
		// 上传前钩子获取file名
		getFileMap(file) {
			this.fileMap = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		handleDeleteFileMap() {
			this.form.mapFileNo = ''
			this.form.mapFileName = ''
		},
		handleViewMap() {
			this.$store.dispatch('order/previewFile', { fileNo: this.form.mapFileNo, fileName: this.form.mapFileName })
			this.$refs.mapInput.blur()
		},
		// 请求详情数据
		getDetail() {
			warehouseDetail({ oid: this.$route.query.whId }).then(res => {
				if (!res.data) return
				this.form = res.data
				let begin = JSON.parse(res.data.receiptTime).begin
				let end = JSON.parse(res.data.receiptTime).end
				this.receiptTime = [begin, end]
			})
		},
		handleSave() {
			if (!this.form.mapFileNo) return this.$message.warning('请先上传路线图!')
			this.form.receiptTime = {
				begin: this.receiptTime[0],
				end: this.receiptTime[1]
			}
			this.$refs.form.validate(valid => {
				if (valid && this.canSave) {
					if (!Number.isInteger(Number(this.form.rentFreePeriod)) || this.form.rentFreePeriod < 0) return this.$message.warning('仓库免租期只能输入正整数!')
					if (this.form.rentFreePeriod > 999999) return this.$message.warning('仓库免租期最大只能为999999!')

					this.canSave = false
					let data = JSON.parse(JSON.stringify(this.form))
					delete data.revision
					warehouseSave(data).then(res => {
						this.$message({
							message: '保存成功',
							type: 'success',
							duration: 1000,
							onClose: () => {
								this.canSave = true
								if (this.$route.name === 'Add') {
									this.$router.go(-1)
								}
							}
						})
					})
				} else {
					console.log('error submit!!')
					this.canSave = true
					return false
				}
			})
		},
		handleCancel() {
			this.$router.go(-1)
		},
		uploadCallBack(data) {
			this.form.url = data.url
			this.form.fileNo = data.fileNo
		},
		handleView() {
			this.$store.dispatch('order/previewFile', { fileNo: this.form.fileNo, fileName: this.form.fileName })
			this.$refs.warehouseInput.blur()
		},
		handleDeleteFile() {
			this.form.fileNo = ''
			this.form.fileName = ''
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
		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(content) {
			console.log(content)
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.file)
			if (this.sizeLimit) {
				this.$store
					.dispatch('user/import', {
						uri: '/order/warehouse/uploadFile',
						params: form
					})
					.then(res => {
						this.fileList = []
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							this.form.fileNo = res.data.data.fileNo
							this.form.fileName = res.data.data.name
						}
					})
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../order/less/detail.scss';
.row-tit {
	.ware-house-btns {
		.el-button--mini {
			// padding: 4px 10px !important;
		}
	}
}
#addform {
	.el-date-editor .el-range__icon,
	.el-date-editor .el-range__close-icon {
		line-height: 14px !important;
	}
	.el-date-editor .el-range-separator {
		width: 0px;
		line-height: 13px;
	}
	.el-range-editor--mini.el-input__inner {
		height: 20px;
	}
	.el-input--mini .el-input__icon {
		line-height: 20px;
	}
	.upload-row > div {
		width: 100%;
		position: relative;
		.upload-btn {
			position: absolute;
			z-index: 999;
			top: -4px;
			right: 0px;
		}
		.el-input {
			position: absolute;
			top: 0px;
			left: 0px;
		}
	}
	.el-input--mini .el-input__inner {
		height: 20px;
		line-height: 20px;
	}
	.warehouse-contact-phone {
		.el-form-item__label {
			width: 90px !important;
		}
		.el-form-item__content {
			margin-left: 90px !important;
		}
	}
	padding: 20px;
	.el-form-item {
		padding: 0 10px;
	}
	.el-form-item__label {
		padding-bottom: 0px;
	}
	.mb10 {
		margin-bottom: 4px;
	}
}
</style>
