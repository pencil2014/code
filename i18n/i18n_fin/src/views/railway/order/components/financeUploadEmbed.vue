<template>
	<div>
		<el-upload
			ref="upload"
			drag
			id="upload-file-drop"
			class="upload-file-drop"
			:accept="accept"
			action="#"
			:style="{ width: width + 'px' }"
			:limit="limit"
			:on-exceed="handleExceed"
			:multiple="true"
			:auto-upload="false"
			:before-upload="getFile"
			:on-change="handleChangeFile"
			:on-remove="handleRemove"
			:http-request="handleImport"
			:file-list="fileList"
		>
			<div class="file-upload file-upload-bill">
				<div>
					<img class="file-upload-img file-upload-bill-img" src="@/assets/icon-upload.png" />
				</div>

				<div class="file-upload__text file-upload-bill__text">
					<div id="text-bill" class="txt">点击或将文件拖拽到这里导入</div>
					<p id="info-bill" class="info">支持 {{ this.comTypes }} 格式文件， 且文件大小限制在5M内</p>
				</div>
			</div>
		</el-upload>
		<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
	</div>
</template>
<script>
export default {
	name: 'financeUploadEmbed',
	props: {
		uploadApi: {
			type: String,
			default: ''
		},
		uploadParams: {
			// 可选
			type: Object,
			default: () => ({})
		},
		width: {
			//可选
			type: Number,
			default: 645
		},
		limit: {
			// 可选
			type: Number,
			default: 10
		},
		acceptTypes: {
			type: Array,
			default: () => ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar']
		},
		accept: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			file: null,
			fileList: [],
			resFileList: [],
			showProcess: false,
			processLength: 0,
			defaultFileSize: 5
		}
	},
	computed: {
		comTypes() {
			return this.acceptTypes.join('、')
		}
	},
	methods: {
		handleExceed(files, fileList) {
			this.$message.error(`只能选择 ${this.limit} 个文件！`)
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error(this.$t('Settle.uploadfile', {size:  this.defaultFileSize + 'M'}))
			}
			return sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = fileList
			console.log('🚀 ~ fileList', fileList)
			this.$emit('getFileList', fileList)
		},
		handleRemove(file, fileList) {
			let index = fileList.findIndex(item => {
				return (item.uid = file.uid)
			})
			this.resFileList.splice(index, 1) // 删除对应的fileId
			this.fileList = fileList
		},
		handleImport(done) {
			this.handleProgress()
			// 根据后台需求数据格式
			this.$store
				.dispatch('order/soUpload', {
					uri: this.uploadApi,
					params: { fileName: this.file, data: this.uploadParams }
				})
				.then(res => {
					this.processLength = 100
					this.showProcess = false
					console.log('res', res)
					if (res.data && res.data.msg === 'success') {
						this.resFileList.push(res.data.data)
						this.$emit('close')
						this.$message({
							type: 'success',
							message: this.$t('BillList.uploadSuccess'),
							duration: 1000
						})
					}
				})
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
	},
	watch: {
		resFileList(newVal) {
			this.$emit('send-res-file-list', newVal)
		}
	}
}
</script>
<style>
#upload-file-drop {
	width: 580px !important;
}
#upload-file-drop .file-upload-bill-img {
	padding-right: 10px;
	margin-left: 10px;
}
#upload-file-drop .file-upload-bill__text {
	display: inline-block;
}
#upload-file-drop #text-bill {
	text-align: left;
	padding-left: 10px;
	margin-bottom: 0;
}
#upload-file-drop #info-bill {
	text-align: left;
}

#upload-file-drop .file-upload-bill {
	display: flex;
	align-items: center;
}
</style>
