<template>
	<div>
		<div class="workException-upload-row">
			<el-upload
				ref="upload"
				drag
				class="upload-input"
				action="#"
				:multiple="config.multiple"
				:auto-upload="config.autoUpload"
				:before-upload="getFile"
				:on-change="handleChangeFile"
				:http-request="uploadFile"
				:file-list="fileList"
			>
				<div class="file-upload">
					<i class="el-icon-upload2"></i>
				</div>
			</el-upload>
			<el-button type="default" size="mini" @click="handleSubmit" class="btn-upload">上传</el-button>
			<ul class="file-list" v-if="fileNosList && fileNosList.length">
				<li class="link-fileNo" v-for="(item, index) in fileNosList" :key="index">
					<span @click="handleView(item)" class="name">{{ item.fileName }}</span>
					<i class="el-icon-close" @click="handleDeleteFile(index)"></i>
				</li>
			</ul>
		</div>
		<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
	</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			oQuery: this.$route.query,

			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			fileData: '',
			showProcess: false,
			processLength: 0,
			fileNosList: [...this.fileNos],
			canUpload: true,
			interval: null
		}
	},
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		fileNos: {
			type: Array,
			default: () => []
		}
	},
	created() {
		// this.fileNosList = [...this.fileNos]
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid
		})
	},
	watch: {
		fileNos: {
			handler(newVal) {
				this.fileNosList = [...newVal]
			},
			deep: true,
			immediate: true
		}
	},
	components: {},
	methods: {
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},

		handleDeleteFile(index) {
			this.$emit('deleteFile', index)
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

		uploadFile(file) {
			this.fileData.append('fileName', file.file)
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

		handleSubmit() {
			if (this.fileList.length === 0) {
				return this.$message.error('请选择文件')
			}
			if (!this.canUpload) return
			this.fileData = new FormData()
			this.fileData.append('orderNo', this.oQuery.orderNo)
			this.$refs.upload.submit()

			if (this.sizeLimit) {
				this.canUpload = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: this.config.apiUrl,
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
							res.data.data &&
								res.data.data.map(item => {
									this.fileNosList.push(item)
								})
							this.$emit('upload', this.fileNosList)
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

<style lang="scss">
.workException-upload-row {
	display: flex;
	// justify-content: space-between;
	.upload-input {
		width: 24%;
		// height: 20px;
		line-height: 20px;
		.el-upload {
			width: 100%;
		}
		.el-upload-dragger {
			height: 20px;
			line-height: 20px;
			background-color: #fff;
			background-image: none;
			border: 1px solid #dcdfe6;
			.file-upload {
				position: relative;
				background-color: #fff;
				padding-bottom: 0;
				padding-top: 0;
				.el-icon-upload2 {
					position: absolute;
					right: 10px;
					top: 4px;
					color: #ccc;
				}
			}
		}
		.el-upload-list__item:first-child{
			margin-top: 0;
		}
	}
	.btn-upload {
		height: 20px;
		line-height: 20px;
		margin-left: 10px;
		padding: 0 15px;
	}
	.file-list {
		margin: 0 0 0 10px;
		padding: 0;
		display: flex;
		line-height: 28px;
		height: 20px;
		.link-fileNo {
			display: flex;
			cursor: pointer;
			list-style: none;
			line-height: 20px;
			color: #3e80f5;
			font-size: 12px;
			margin-right: 10px;
			.name {
				text-decoration: underline;
				display: block;
				max-width: 150px;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			.el-icon-close {
				line-height: 20px;
				margin-left: 10px;
			}
		}
	}
}
</style>
