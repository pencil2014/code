<template>
	<div>
		<el-upload
			ref="upload"
			drag
			class="fin-upload-file-cont"
			:accept="accept"
			action="#"
			:style="{width:typeof width==='string' ? width : width + 'px' }"
			:limit="limit"
			:on-exceed="handleExceed"
			:multiple="true"
			:auto-upload="autoUpload"
			:on-change="handleChangeFile"
			:on-remove="handleRemove"
			:http-request="handleImport"
			:file-list="fileList"
		>
		<!-- :before-upload="getFile" 改在handleChangeFile里面调用getFile做相关处理，主要是为了autoUpload为false时做处理，否则用before-upload亦可 -->
			<div class="file-upload">
				<img class="file-upload-img" src="@/assets/icon-upload.png" />
				<div class="file-upload__text">
					<div class="txt">{{notice}}</div>
					<p class="info">
						支持 {{this.comTypes}} 格式文件， 且文件大小限制在5M内
					</p>
				</div>
			</div>
		</el-upload>
		<slot :name="'billFile'" :billFile="billFile"></slot>
		<el-progress
			v-show="showProcess"
			:percentage="processLength"
			:stroke-width="2"
		></el-progress>
	</div>
</template>
<script>
// 如果是自动上传，需要fileNo, name等数据，可以使用@send-res-file-list接收一个相关数据的数组，
// 如果是非自动上传，需要使用file的情况，可以使用@send-file-list接收file的数组。
export default {
	name: 'financeUploadEmbed',
	props: {
		uploadApi: {
			type: String,
			default: ''
		},
		uploadParams: { // 可选
			type: Object,
			default: () => ({})
		},
		width: { // 可选
			type: [Number, String],
			default: 645
		},
		limit: { // 可选
			type: Number,
			default: 10
		},
		acceptTypes: { // 如['jpg','jpeg','png','pdf']
			type: Array,
			default: () => ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar']
		},
		accept: {
			type: String,
			default: ''
		},
		fileListEdit: {
			type: Array,
			default: () => ([])
		},
		index: {
			type: Number,
			default: 0
		},
		acceptSelf: { // 增加acceptSelf是为了不使用accept，因为之前大多未设置accept，保持体验的一致。如'image/jpeg,application/pdf,image/jpeg,image/png'
			type: String,
			default: ''
		},
		autoUpload: {
			type: Boolean,
			default: true
		},
		notice: {
			type: String,
			default: '点击或将文件拖拽到这里导入'
		},
		billFile: {
			type: Object,
			default: () => ({})
		}
	},
	data () {
		return {
			file: null,
			fileList: [],
			resFileList: [],
			showProcess: false,
			processLength: 0,
			defaultFileSize: 5,
		}
	},
	computed: {
		comTypes () {
			return this.acceptTypes.join('、')
		}
	},
	created () {},
	methods: {
		handleExceed (files, fileList) {
			this.$message.error(`只能选择 ${this.limit} 个文件！`);
		},
		// 上传前钩子获取file名
		getFile (file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize;
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制');
			}
			let isAccept = true
			const accept = this.acceptSelf || this.accept
			if (accept) {
				isAccept = accept.includes(file.type)
				if (!isAccept) {
					this.$message.error(`上传文件只能是 ${this.acceptTypes.join('、')} 格式`);
				}
			}
			return sizeLimit && isAccept;
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile (file, fileList) {
			this.fileList = fileList
			if (file.status === 'ready') { // 如果添加文件，不符合条件的文件删除
				if (!this.getFile(file.raw)) {
					let index = fileList.findIndex(item => {
						return item === file
					})
					fileList.splice(index, 1)
				}
			}
			this.$emit('send-file-list', fileList.map(item => item.raw))
		},
		handleRemove (file, fileList) {
			let index = fileList.findIndex(item => {
				return item.uid = file.uid
			})
			this.resFileList.splice(index, 1) // 删除对应的resFile
			this.fileList = fileList
			this.$emit('send-file-list', fileList.map(item => item.raw))
		},
		handleImport (done) {
			this.handleProgress()
			// 根据后台需求数据格式
			const form = new FormData();
			// 文件对象
			form.append("file", this.file);

			this.$store.dispatch('user/import', {
				uri: '/base/webapi/file/upload',
				params: form
			}).then(res => {
				this.processLength = 100
				this.showProcess = false
				// let {data} = res.data
				// this.createUploadItem.dangerousDeclareFileList = []

				// Object.assign(this.createUploadItem, {
				//   dangerousDeclareFileList: data
				// })
				// data.forEach(item => {
				//   this.createUploadItem.dangerousDeclareFileList.push({fileNo: item})
				// })
				if (res.data.code === 0) {
					if (res.data.data) {
						this.resFileList.push(res.data.data)
					}
					this.$message({
						type: 'success',
						message: '上传成功',
						duration: 1000
					})
				}
			})
		},
		// 上传进度条
		handleProgress (file, fileList) {
			this.processLength = 0
			this.showProcess = true
			const interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(interval)
					return
				}
				this.processLength += 1
			}, 200)
		},
		// 新添加文件替换之前添加的文件
		// handleChangeFile(file, fileList) {
		//   this.fileList = []
		//   this.fileList.push(file)
		// },
	},
	watch: {
		resFileList (newVal) {
			this.$emit('send-res-file-list', newVal, this.index)
		},
		// 修改的显示附件
		fileListEdit (newVal) {
			if(newVal && newVal.length){
				console.log(newVal);
				this.fileList = newVal.length ? [...newVal] : []
			}
		}
	}
}
</script>
<style lang="scss">
.fin-upload-file-cont {
	.file-upload {
		padding: 10px;
		display: flex;
		.file-upload-img {
			width: 34px;
			height: 34px;
		}
		.file-upload__text {
			flex: 1;
			padding-left: 10px;
			.txt {
				margin-bottom: 0px;
				text-align: left;
			}
			.info {
				text-align: left;
				padding-left: 0px;
			}
		}
	}
}
</style>