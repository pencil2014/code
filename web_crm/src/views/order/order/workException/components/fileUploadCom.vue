<template>
	<div>
		<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="config.multiple" :auto-upload="config.autoUpload" :before-upload="getFile" :on-change="handleChangeFile" :http-request="uploadFile" :file-list="fileList">
			<div class="file-upload">
				<img class="file-upload-img" src="../../../../../assets/icon-upload.png" />
				<div class="file-upload__text">
					<div class="txt">点击或将文件拖拽到这里导入</div>
					<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
				</div>
			</div>
		</el-upload>
		<ul class="fileNo-list" v-if="fileNosList.length">
			<li class="link-fileNo" v-for="(item, index) in fileNosList" :key="index">
				<span @click="handleView(item)">{{ item.fileName }}</span>
				<i class="el-icon-close ml20" @click="handleDeleteFile(index)"></i>
			</li>
		</ul>
		<el-button type="primary" size="mini" @click="handleSubmit" class="btn-upload" style="width: 100%">上传</el-button>
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
			fileNosList: [],
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
		this.fileNosList = [...this.fileNos]
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
	components: {},
	methods: {
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},

		handleDeleteFile(index) {
			this.fileNosList.splice(index, 1)
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

			this.fileData = new FormData()
			this.fileData.append('orderNo', this.oQuery.orderNo)
			this.$refs.upload.submit()
			if (this.sizeLimit) {
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
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							let { data } = res.data
							this.fileNosList = this.fileNosList.concat(data)
							this.$emit('upload', this.fileNosList)
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
					})
			}
		}
	}
}
</script>

<style lang="scss">
.fileNo-list {
	margin: 10px 0;
	padding: 0;
	.link-fileNo {
		cursor: pointer;
		list-style: none;
		line-height: 24px;
		color: #3e80f5;
		font-size: 12px;
		text-decoration: underline;
	}
}
</style>
