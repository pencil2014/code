<template>
	<div class="table-com-layout" id="applyFume">
		<div class="mt10 between" style="margin-bottom: 4px">
			<div class="ft12 bold">申请人列表</div>
			<div class="el-button-group" v-if="isBkg">
				<el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="!isBkg || isJoint || detailData.intrustStatus === 'finished'">添加申请人</el-button>
			</div>
		</div>
		<el-table ref="table" fit highlight-current-row style="width: 100%" :data="tableData">
			<el-table-column prop="custName" label="申请公司" align="center" width="180"></el-table-column>
			<el-table-column prop="custContact" label="申请联系人" align="center" width="120"></el-table-column>
			<el-table-column prop="custContactPhone" label="申请联系人电话" align="center"></el-table-column>
			<el-table-column prop="blNo" label="提单号" align="center"></el-table-column>
			<el-table-column prop="fumeContainers" label="集装箱号" align="center" v-if="detailInfo.businessType === 'ship_export_fcl'">
				<template slot-scope="scope">
					<div class="operate-group">
						<div class="" v-for="(item, index) in scope.row.fumeContainers" :key="index">{{ item.cn }}</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="fumeFiles" label="熏蒸文件附件编号" align="center" width="200">
				<template slot-scope="scope">
					<div class="operate-group flex-class" v-for="(item, index) in scope.row.fumeFiles" :key="index">
						<!-- <el-button @click="handleView(item)" type="text" size="mini" class="file-link"> -->
						<el-tooltip class="item" effect="dark" :content="item.fileName" placement="top-start">
							<span @click="handleView(item)" class="file-name-style">{{ item.fileName }}</span>
							<!-- <span class="file-name-style">{{ item.fileName }}</span> -->
						</el-tooltip>
						<!-- </el-button> -->
						<el-button class="btn" @click="handleDownload(item)" type="text" size="mini" v-if="item.fileName" :disabled="detailData.intrustStatus === 'finished'">下载</el-button>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="160" align="center" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-upload
							style="display: inline-block; margin-right: 0"
							ref="upload"
							action="#"
							:auto-upload="true"
							:before-upload="getFile"
							:on-change="handleChangeFile"
							:http-request="content => handleImport(content, scope.row)"
							:show-file-list="false"
							:file-list="fileList"
							:disabled="!isBkg || detailData.intrustStatus === 'finished'"
						>
							<el-button type="text" size="mini" style="text-decoration: underline" :disabled="!isBkg || isJoint || detailData.intrustStatus === 'finished'">上传附件</el-button>
						</el-upload>
						<el-button @click="handleInfo(scope.row, scope.$index)" type="text" size="mini" :disabled="!isBkg || isJoint || detailData.intrustStatus === 'finished'">详情</el-button>
						<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isBkg || isJoint || detailData.intrustStatus === 'finished'">删除</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<!-- 添加申请人弹窗 -->
		<div v-if="addApplyerShow">
			<AddApplyer :applierData="applierDetailData" :detailInfo="detailInfo" :custids="custids" @close="addApplyerPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
// import { mixin } from '../../mixin'
import AddApplyer from './addApplyer'

export default {
	// mixins: [mixin],
	data() {
		return {
			oQuery: this.$route.query,
			addApplyerShow: false,
			tableData: [],
			clickRow: '',
			custids: [], // 申请人列表已存在的申请人id集合
			applierDetailData: {},
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: []
		}
	},
	props: {
		fumeBls: {
			type: Array,
			default: () => []
		},
		detailData: {
			type: Object,
			default: () => ({})
		},
		detailInfo: {
			type: Object,
			default: () => ({})
		},
		isJoint: {
			type: Boolean,
			default: false
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			userEditRoles: state => state.railway.orderList.userEditRoles,
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole,
			serviceList: state => state.railway.serviceList,
			serviceInfoList: state => state.railway.serviceInfoList,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		isBkg() {
			return this.ordDetRole === 'bkg'
		}
	},
	components: {
		AddApplyer
	},
	watch: {
		fumeBls: {
			handler(newVal) {
				console.log(newVal)
				if (newVal && !newVal.length) {
					this.tableData = []
				} else {
					this.tableData = []
					newVal.map(item => {
						let fumeFiles = item.fumeFiles.map(ele => {
							return {
								fileNo: ele.fileNo,
								fileName: ele.fileName,
								oid: ele.oid //主键，新增没有
							}
						})
						let fumeContainers = (fumeContainers = item.fumeContainers.map(ele => {
							return {
								oid: ele.oid,
								cn: ele.cn,
								containerId: ele.containerId
							}
						}))
						this.tableData.push({
							fbId: item.fbId,
							blId: item.blId,
							blNo: item.blNo,
							custContact: item.custContact,
							custContactPhone: item.custContactPhone,
							custName: item.custName,
							custid: item.custid,
							fumeContainers,
							fumeFiles
						})
					})
				}
				console.log('watch_table', this.tableData)

				// this.bindContList = JSON.parse(JSON.stringify(newVal))
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// 获取表格所有的申请人id
		getCustids(custid) {
			this.custids = []
			this.tableData.map(item => {
				this.custids.push(item.custid)
			})
			if (custid) {
				this.custids = this.custids.filter(item => item !== custid)
			}
		},
		handleAdd() {
			this.addApplyerShow = true
			this.applierDetailData = {}
			this.clickRow = ''
			this.getCustids()
		},
		addApplyerPopClose(action, values) {
			this.addApplyerShow = false
			if (action === 'Confirm') {
				// 关闭详情回调
				if (this.clickRow || this.clickRow === 0) {
					Object.assign(this.tableData[this.clickRow], values)
				} else {
					// 新增
					this.tableData.push(values)
				}
			}
			console.log('申请人弹窗回调', this.tableData)
		},
		handleInfo(row, index) {
			console.log('row', row)
			this.addApplyerShow = true

			Object.assign(this.applierDetailData, row)
			this.clickRow = index
			this.getCustids(row.custid)
		},
		handleDelete(row, index) {
			this.tableData.splice(index, 1)
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
					link.download = item.fileName
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = fileList
		},
		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(content, row) {
			console.log(content, row)
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.file)
			form.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && ('jointNo', this.oQuery.jointNo)

			this.$store
				.dispatch('user/import', {
					uri: '/order/shipping/fume/uploadFile',
					params: form
				})
				.then(res => {
					let { data } = res.data
					this.fileList = []
					if (res.data.code === 0) {
						this.$message({
							type: 'success',
							message: '导入成功'
						})
						if (row.fumeFiles && row.fumeFiles.length) {
							row.fumeFiles.map(item => {
								return Object.assign(item, {
									fileNo: data.fileNo,
									fileName: data.fileName
								})
							})
						} else {
							this.$set(row, 'fumeFiles', [data])
							// let fumeFiles = []
							// fumeFiles.push(data)
							// Object.assign(row, { fumeFiles })
						}
					}
				})
				.catch(err => {
					this.$message.error(err.message)
				})
		}
	}
}
</script>
<style lang="scss">
#applyFume .operate-group .file-link {
	max-width: 140px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
#applyFume .flex-class {
	display: flex;
	align-items: center;
	justify-content: center;
	.file-name-style {
		color: #1890ff;
		cursor: pointer;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.btn {
		width: 40px;
	}
}
</style>
