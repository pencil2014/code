<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" label-position="right" label-width="120px" class="create-form">
			<el-form-item label="保函类别" prop="docName">
				<el-select v-model="createdItem.docName" size="mini" clearable placeholder="请选择" style="width: 100%">
					<el-option v-for="item in dictMap.guaranteeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
				</el-select>
			</el-form-item>
			<!-- <el-form-item label="保函编号" prop="docNo">
        <el-input size="mini" v-model="createdItem.docNo" placeholder="请输入"></el-input>
      </el-form-item> -->
			<el-form-item label="提单号" prop="blId">
				<el-select v-model="createdItem.blId" size="mini" clearable placeholder="请选择" @blur="selectBlur" style="width: 100%">
					<el-option v-for="(item, index) in blIdOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="取单时间" prop="retrieveFinishTime">
				<elDatePickerLimit
					size="mini"
					v-model="createdItem.retrieveFinishTime"
					type="datetime"
					style="width: 100%"
					clearable
					placeholder="请选择"
					value-format="yyyy-MM-dd HH:mm:ss"
				/>
			</el-form-item>
			<el-form-item label="保函备注" prop="remark">
				<el-input size="mini" v-model="createdItem.remark" placeholder="请输入"></el-input>
			</el-form-item>
			<el-form-item label="上传附件" class="is-required">
				<el-upload
					ref="upload"
					drag
					class="upload-file-cont"
					action="#"
					:multiple="multiple"
					:auto-upload="false"
					:before-upload="getFile"
					:on-change="handleChangeFile"
					:on-remove="handleRemove"
					:http-request="uploadFile"
					:file-list="fileList"
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
				<ul class="fileNo-list" v-if="createdItem.documentFiles.length">
					<li class="link-fileNo" v-for="(item, index) in createdItem.documentFiles" :key="index">
						<span @click="handleView(item)">{{ item.name }}</span>
						<i class="el-icon-close ml20" @click="handleDeleteFile(index)"></i>
					</li>
				</ul>
				<el-button size="mini" type="primary" class="btn-uploadFile" @click="handleImport">上传</el-button>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { grtDocSave } from '@/api/order/document'
import { blListBox } from '@/api/order/bl'

const defaultCreate = {
	blId: '',
	docName: '',
	docType: 'guarantee',
	orderNo: '',
	retrieveFinishTime: '',
	remark: '',
	documentFiles: []
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '新增保函',
				show: true,
				size: 'medium',
				width: '560px'
			},
			blIdOptions: [],
			canSubmit: true, // 可提交标识
			canUpload: true,
			multiple: true,
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			fileData: '',
			showProcess: false,
			processLength: 0,

			createdItem: Object.assign({}, defaultCreate),
			interval: null
		}
	},
	props: {
		param: {
			type: Object
		}
	},
	created() {
		this.createdItem.documentFiles = []
		this.getBlNoList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getBlNoList() {
			blListBox({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.blIdOptions = res.data.map(item => {
					let blType = item.blType === 'mbl' ? 'MBL' : item.blType === 'hbl' ? 'HBL': ''
					let label = `${blType}: ${item.blNo} (id: ${item.blId})`
					return Object.assign({}, item, {
						label: label,
						value: item.blId
					})
				})
			})
		},

		close(action) {
			this.$emit('close', action)
		},

		validate() {
			console.log(this.createdItem)
			if (!this.createdItem.documentFiles.length) {
				this.$message.warning('请上传附件')
				return false
			}
			// if (!this.createdItem.docNo) {
			//   this.$message.warning('请输入保函单号')
			//   return false
			// }
			if (!this.createdItem.blId) {
				this.$message.warning('请选择提单号')
				return false
			}
			if (!this.createdItem.docName) {
				this.$message.warning('请选择保函类型')
				return false
			}
			if (!this.createdItem.retrieveFinishTime) {
				this.$message.warning('请选择取单时间')
				return false
			}
			return true
		},

		selectBlur(e) {
			this.createdItem.blId = e.target.value
		},

		handleDownload(item) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: item.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = item.name
					link.click()
				})
		},

		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
		},

		// 删除文件
		handleDeleteFile(index) {
			this.createdItem.documentFiles.splice(index, 1)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!this.validate() || !this.canSubmit) return
				this.createdItem.orderNo = this.orderNo || this.oQuery.orderNo
				this.createdItem.jointNo = this.oQuery.jointNo
				this.canSubmit = false
				grtDocSave(this.createdItem).then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
							this.canSubmit = true
						}
					})
				})
			} else {
				this.close('Cancel')
				this.canSubmit = true
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
		},

		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},

		uploadFile(file) {
			this.fileData.append('fileName', file.file)
			//this.file = file.file
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

		handleImport(done) {
			if (!this.fileList.length) return this.$message.warning('请上传附件')
			if (!this.canUpload) return
			// 根据后台需求数据格式
			this.fileData = new FormData()
			// 文件对象
			this.fileData.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && this.fileData.append('jointNo', this.oQuery.jointNo)
			this.fileData.append('docType', this.createdItem.docType)
			this.$refs.upload.submit()

			if (this.sizeLimit) {
				this.canUpload = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: '/order/shipping/grtDoc/uploadFile',
						params: this.fileData
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canUpload = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							res.data.data.forEach(item => {
								this.createdItem.documentFiles.push(item)
							})
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
						this.canUpload = true
					})
			}
		}
	}
}
</script>

<style lang="scss"></style>
