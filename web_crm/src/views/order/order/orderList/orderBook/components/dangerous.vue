<template>
	<div class="edit-row" id="dangerousPage">
		<div class="edit-container so" style="padding-bottom: 10px" id="tableCont">
			<div class="row-tit so">
				<span class="tit ft12">危险品申报信息</span>
				<div class="row-tit-operate">
					<div class="">
						<span class="mr10">申报状态</span>
						<el-select v-model="declareStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isBd">
							<el-option v-for="item in dictMap.dangerousDeclareStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
					<div class="el-button-group">
						<el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd">新增申报</el-button>
					</div>
				</div>
			</div>
			<div class="row-form table-com-layout mt10">
				<el-table ref="dangerousTable" stripe :data="tableList" @selection-change="handleSelectionChange" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
					<el-table-column type="selection" min-width="50"></el-table-column>
					<el-table-column prop="intrustNo" label="委托单号" align="center"> </el-table-column>
					<el-table-column prop="declareStatus" label="申报状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.declareStatus | declareStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="supplierName" label="委托公司" align="center"> </el-table-column>
					<el-table-column prop="supplierContact" label="联系人" align="center"> </el-table-column>
					<el-table-column prop="supplierContactPhone" label="电话" align="center"> </el-table-column>
					<el-table-column prop="supplierContactEmail" label="邮件" align="center"> </el-table-column>
					<el-table-column label="操作" width="120" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || scope.row.declareStatus === 'declared'">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail mt10" v-show="showDetail">
			<div :class="['row-tit',{'isFixed': saveBarFixed}]" :style="styleObject" id="saveBar">
				<span class="tit">危险品申报</span>
				<div class="row-tit-operate">
					<el-button type="default" size="mini" style="margin-left: 10px;" @click="handleCancel">取消</el-button>
					<el-button type="primary" size="mini" style="margin-left: 10px;" @click="handleSave('createdItem')" :disabled="isBd || createdItem.declareStatus === 'declared'"
						>保存</el-button
					>
				</div>
			</div>
			<el-form class="bkg-dangerous-form" label-position="left" label-width="75px" ref="saveForm" :model="createdItem" :rules="rules">				
				<div class="row-flex dangerous-form-row ml20">
					<el-form-item label="委托单号" prop="intrustNo" class="flex-item mb12" :show-message="false">
						<el-input size="mini" disabled placeholder="请输入" v-model="createdItem.intrustNo" clearable></el-input>
					</el-form-item>
					<el-form-item label="委托公司" prop="supplierId" class="flex-item mb12" :show-message="false">
						<el-select
							size="mini"
							style="width: 100%"
							placeholder="请选择"
							v-model="createdItem.supplierId"
							filterable
							@visible-change="
								val => {
									getCustVisibleChange(val)
								}
							"
							:filter-method="
								val => {
									getCustVisibleChange(val)
								}
							"
							@change="
								val => {
									handleChangeSupplier(val)
								}
							"
						>
							<el-option v-for="(item, index) in supplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="联系人姓名" prop="supplierContact" class="flex-item mb12" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createdItem.supplierContact" clearable></el-input>
					</el-form-item>
					<el-form-item label="联系人电话" prop="supplierContactPhone" class="flex-item mb12" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createdItem.supplierContactPhone" clearable></el-input>
					</el-form-item>
					<el-form-item label="邮箱" class="flex-item mb12">
						<el-input size="mini" placeholder="请输入" v-model="createdItem.supplierContactEmail" clearable></el-input>
					</el-form-item>
				</div>
			</el-form>

			<div class="edit-container so" style="padding-bottom: 10px">
				<div class="row-tit so">
					<span class="tit">危险品附件列表</span>
					<div class="row-tit-operate">
						<div class="el-button-group">
							<el-button size="mini" type="primary" class="ml10" @click="handleAddEnclosure('')" :disabled="isBd || createdItem.declareStatus === 'declared'">添加附件</el-button>
						</div>
					</div>
				</div>
				<div class="row-form table-com-layout mt10">
					<el-table :data="createdItem.dangerousDeclareContainerList">
						<el-table-column type="selection" width="50"></el-table-column>
						<el-table-column prop="cn" label="箱号" align="center" v-if="!isBulkRo"> </el-table-column>
						<el-table-column prop="commodityName" label="品名" align="center"> </el-table-column>
						<el-table-column prop="hscode" label="HS CODE" align="center"> </el-table-column>
						<el-table-column prop="dangerousGrade" label="危险品等级" align="center">
							<template slot-scope="scope">
								{{ scope.row.dangerousGrade | dangerousGradeFilter }}
							</template>
						</el-table-column>
						<el-table-column prop="dangerousCode" label="联合国危险品编码" width="200px" align="center"> </el-table-column>
						<el-table-column prop="dangerousDeclareFileList" label="放行单附件" align="center" width="280px">
							<template slot-scope="scope">
								<div v-for="(ele, index) in scope.row.dangerousDeclareFileList" :key="index" class="operate-group">
									<span class="file-link" @click="handleView(ele)">{{ ele.fileName }}</span>
									<el-button @click="handleDownload(ele)" type="text" size="mini" v-if="ele.fileName">下载</el-button>
								</div>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="120" align="center" fixed="right">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-button @click="handleDeleteContainer(scope)" type="text" size="mini" :disabled="isBd || createdItem.declareStatus === 'declared'">删除</el-button>
									<el-button @click="handleAddEnclosure(scope)" type="text" size="mini" :disabled="isBd || createdItem.declareStatus === 'declared'">详情</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</div>
		<!-- 危险品申报附件弹框 -->
		<el-dialog title="危险品申报附件上传" :visible.sync="uploadVisible" :lock-scroll="true" width="780px">
			<el-form ref="createUploadItem" :rules="rulesCreateItem" :model="createUploadItem" label-position="right" label-width="75px" class="dangerous-upload">
				<el-form-item label="箱号" prop="cn" style="width: 100%" :show-message="false" v-if="!isBulkRo">
					<el-select v-model="createUploadItem.cn" filterable clearable allow-create size="mini" style="width: 100%" placeholder="请选择" @change="handleSelectCn">
						<el-option v-for="(item, index) in containerList" :label="item.cn" :value="item.cn" :key="index"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="品名" prop="commodityName" style="width: 50%" :show-message="false">
					<el-input size="mini" placeholder="请输入" v-model="createUploadItem.commodityName" clearable></el-input>
				</el-form-item>
				<el-form-item label-width="120px" label="危险品等级" prop="dangerousGrade" style="width: 50%">
					<el-select v-model="createUploadItem.dangerousGrade" size="mini" style="width: 100%" placeholder="请选择">
						<el-option v-for="item in dictMap.dangerousGrade" :label="item.label" :value="item.value" :key="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="HSCODE" prop="hscode" style="width: 50%">
					<el-select size="mini" v-model="createUploadItem.hscode" style="width: 100%" remote filterable clearable placeholder="请选择" :remote-method="(val) => queryCargoHscode(val)">
						<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label-width="120px" label="联合国危险品编码" prop="dangerousCode" style="width: 50%" :show-message="false">
					<el-select
						size="mini"
						v-model="createUploadItem.dangerousCode"
						style="width: 100%"
						clearable
						placeholder="请选择国际危码"
						remote
						filterable
						:remote-method="(val) => queryCargoUnno(val)"
					>
						<el-option v-for="(item, index) in dangerousCodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="上传附件" prop="fileName" class="is-required">
					<el-upload
						ref="upload"
						drag
						class="upload-file-cont"
						action="#"
						:multiple="true"
						:auto-upload="true"
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
					<ul class="fileNo-list" v-if="fileNos.length">
						<li class="link-fileNo" v-for="(item, index) in fileNos" :key="index">
							<span @click="handleView(item)">{{ item.fileName }}</span>
							<i class="el-icon-close ml20" @click="handleDeleteFile(index)"></i>
						</li>
					</ul>
					<!-- <el-button type="primary" size="mini" @click="handleImport" class="btn-upload" style="width: 100%" :disabled="isBd">上传</el-button> -->
					<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createUploadItem')" :disabled="isBd"> <i class="el-icon-copy-document"></i> 保存 </el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { getSoList } from '@/api/order/book/list'
import { dangerousList, dangerousDetail, dangerousCreateSerialNo, dangerousSave, dangerousDelete, dangerousUpdateStatus } from '@/api/order/dangerous'
import { orderContainerList } from '@/api/order/list'
import { baseEmployeeListName, baseSupplierList, cargoHscodeList, cargoUnnoList } from '@/api/base'

const defaultCreateUploadQuery = {
	cn: '',
	containerId: null,
	commodityName: '',
	dangerousCode: '',
	dangerousDeclareFileList: [],
	dangerousGrade: '',
	declareStatus: '',
	hscode: '',
	intrustNo: '',
	oid: undefined,
	orderNo: '',
	fileName: ''
}
const defaultQuery = {
	currPage: 1,
	pageSize: 30,
	query: [{ column: 'supplierName', type: 'default', value: '' }]
}
const defaultCreateQuery = {
	oid: undefined,
	dangerousDeclareContainerList: [],
	intrustNo: '',
	orderNo: '',
	declareStatus: '',
	supplierContact: '',
	supplierContactEmail: '',
	supplierContactPhone: '',
	supplierId: '',
	supplierName: ''
}
export default {
	name: 'dangerous',
	filters: {
		declareStatusFilter(declareStatus) {
			return getDictLabel('dangerousDeclareStatus', declareStatus)
		},
		dangerousGradeFilter(dangerousGrade) {
			return getDictLabel('dangerousGrade', dangerousGrade)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			uploadVisible: false,
			containerList: [],
			showDetail: false,
			tableList: [],
			// isReport:false,
			declareStatus: '',
			multipleSelection: [],
			canSubmit: true, // 可提交标识
			createUploadItem: Object.assign({}, defaultCreateUploadQuery),
			fileNos: [],
			createdItem: Object.assign({}, defaultCreateQuery),
			employeeOptions: [],
			supplierOptions: [],
			// 发货单位下拉搜索
			supplierQuery: Object.assign({}, defaultQuery),
			pagenation: {
				currPage: 1,
				total: 0,
				pageSize: 30,
				sizes: [10, 20, 30, 50, 100]
			},
			hscodeOptions: [],
			dangerousCodeOptions: [],
			// 表单校验
			rules: {
				intrustNo: [{ required: true, message: '必填', trigger: 'blur' }],
				supplierId: [{ required: true, message: '必填', trigger: 'blur' }],
				supplierContact: [{ required: true, message: '必填', trigger: 'blur' }],
				supplierContactPhone: [{ required: true, message: '必填', trigger: 'blur' }]
			},
			rulesCreateItem: {
				cn: [{ required: true, message: '必填', trigger: 'change' }],
				commodityName: [{ required: true, message: '必填', trigger: 'blur' }],
				dangerousCode: [{ required: true, message: '必填', trigger: 'blur' }]
			},
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileData: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			index: undefined,
			fileEditState: false,
			serialNo: '',
			interval: null
		}
	},
	created() {
		if(this.$route.name==='LclWhBook'){
			this.$set(this.rulesCreateItem,'cn',[{ required: false }])
		}
		this.getList()
	},
	mounted() {},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isAc || this.isDoc || this.isOpTruck
			let findItem = this.tabMenus.find(item => item.code === 'dangerous')
			let isJoint = findItem ? findItem.isJoint : false
			return isBd || isJoint || this.isFinish
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'dangerous')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed ? {
				left: '120px',
				top: offsetTop + 24 + 'px'
			} : {}
		},
		isBulkRo() {
			return this.orderInfoDataObj.businessType === 'ship_bulk_ro'
		}
	},
	methods: {
		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString && cargoHscodeList({ keyword: queryString }).then(response => {
				this.hscodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.cargoDesc,
						value: item.hscode
					})
				})
			})
		},
		// 国际危险品编码查询
		queryCargoUnno(queryString) {
			queryString && cargoUnnoList({ keyword: queryString }).then(response => {
				this.dangerousCodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.unDesc,
						value: item.unNo
					})
				})
			})
		},
		getContainerList() {
			orderContainerList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.containerList = res.data.filter(item => item.cn)
			})
		},
		// 选择cn
		handleSelectCn(val) {
			let sItem = this.containerList.find(item => item.cn === val)
			this.createUploadItem.containerId = sItem ? sItem.oid : ''
		},
		// 获取列表
		getList() {
			this.lsLoading = true
			dangerousList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(response => {
				this.tableList = response.data
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 新建申报
		handleAdd() {
			Object.assign(this.createdItem, {}, defaultCreateQuery, {
				dangerousDeclareContainerList: []
			})
			dangerousCreateSerialNo().then(res => {
				this.createdItem.intrustNo = res.data.serialNo
			})

			// this.isReport = false
			this.showDetail = true
		},

		// 详情修改
		handleDetail(row) {
			this.$refs.saveForm.resetFields()
			dangerousDetail({ intrustNo: row.intrustNo, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				for (let i in this.createdItem) {
					this.createdItem[i] = res.data[i]
				}
				this.supplierOptions = [{ label: res.data.supplierName, value: res.data.supplierId }]
			})
			// this.isReport = this.createdItem.declareStatus == 'y' ? true : false
			this.showDetail = true
			console.log(this.createdItem)
		},

		handleDelete(row) {
			this.$confirm('是否确认删除?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return dangerousDelete({ intrustNo: row.intrustNo, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.createdItem.intrustNo === row.intrustNo) {
						this.showDetail = false
					}
					this.getList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(function() {})
		},

		// 保存
		handleSave() {
			this.$refs.saveForm.validate(valid => {
				if (valid) {
					// this.createdItem.isReport = this.isReport ? 'y' : 'n'
					this.createdItem.orderNo = this.oQuery.orderNo
					this.createdItem.jointNo = this.oQuery.jointNo
					dangerousSave(this.createdItem).then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.getList()
								this.showDetail = false
							}
						})
					})
				}
			})
		},

		//添加附件&详情
		handleAddEnclosure(scope) {
			this.showProcess = false
			this.uploadVisible = true
			this.fileNos = []
			// 获取箱号下拉
			this.getContainerList()
			// 详情
			if (scope) {
				this.index = scope.$index
				this.fileEditState = true
				for (let key in this.createUploadItem) {
					this.createUploadItem[key] = scope.row[key]
				}
				this.fileNos = [...this.createUploadItem.dangerousDeclareFileList]
			} else {
				this.fileEditState = false
				Object.assign(this.createUploadItem, {}, defaultCreateUploadQuery)
			}
		},

		validate() {
			if (!this.fileNos.length) {
				this.$message({
					type: 'error',
					message: '请上传附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},

		//附件保存按钮
		submitForm(form) {
			this.$refs[form].validate(valid => {
				if (valid) {
					if (!this.validate()) return
					this.handleSet()
					//this.handleImport()
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},

		handleSet() {
			Object.assign(this.createUploadItem, { dangerousDeclareFileList: this.fileNos })
			if (this.fileEditState) {
				for (let key in this.createUploadItem) {
					this.createdItem.dangerousDeclareContainerList[this.index][key] = this.createUploadItem[key]
				}
				console.log(this.createdItem.dangerousDeclareContainerList)
			} else {
				this.createdItem.dangerousDeclareContainerList.push({ ...this.createUploadItem })
			}
			this.uploadVisible = false
		},

		handleDeleteContainer(row) {
			this.createdItem.dangerousDeclareContainerList.splice(row.$index, 1)
		},

		handleCancel() {
			this.showDetail = false
		},

		cancel() {
			this.uploadVisible = false
		},

		// 获取责任人公司
		getCustVisibleChange(val) {
			if (val === true) val = ''
			this.getSupplierList(val)
		},

		// 获取发货单位
		getSupplierList(val) {
			this.$store.dispatch('dict/queryCustomerList', val).then(res => {
				let list = res.list
				this.supplierOptions = list.map(o => {
					return Object.assign(o, {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					})
				})
			})
		},

		// 下拉选择委托公司
		handleChangeSupplier(val) {
			let findItem = this.supplierOptions.find(o => {
			  return o.value === val
			})
			this.createdItem.supplierName = findItem ? findItem.label : ''
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
			// this.fileData.append('fileName', file.file)
			this.file = file.file
			this.handleImport()
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
			if (!this.fileList.length) {
				return this.$message({
					type: 'error',
					message: '请上传附件',
					duration: 1000
				})
			}
			if (!this.canSubmit) return

			// 根据后台需求数据格式
			this.fileData = new FormData()
			this.fileData.append('fileName', this.file)
			this.fileData.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && this.fileData.append('jointNo', this.oQuery.jointNo)
			// this.$refs.upload.submit()

			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: '/order/shipping/dangerous/uploadFile',
						params: this.fileData
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							let fileNos = res.data.data
							fileNos.map((item, index) => {
								this.fileNos.push({
									cn: this.createUploadItem.cn,
									fileNo: item.fileNo,
									fileName: item.fileName
								})
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

		// 附件预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
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

		// 删除文件
		handleDeleteFile(index) {
			this.fileNos.splice(index, 1)
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},

		// 获取intrustNos
		getIntrustNos() {
			let intrustNos = []
			this.multipleSelection.map(item => {
				intrustNos.push(item.intrustNo)
			})
			return intrustNos
		},

		// 更新状态
		handleUpdateStatus(val) {
			if (!val) return
			if (this.multipleSelection.length === 0) {
				this.declareStatus = ''
				return this.$message.error('请勾选一条要更新状态的危险品')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let intrustNos = this.getIntrustNos()
					return dangerousUpdateStatus({
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						declareStatus: val,
						intrustNos: intrustNos
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '更新状态成功',
						duration: 1000,
						onClose: () => {
							this.declareStatus = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.declareStatus = ''
				})
		}
	}
}
</script>
<style lang="scss" scoped>
@import '../../../less/index.scss';
.bkg-dangerous-form{
	 /deep/.el-form-item__label{
      padding-right: 0;
      padding-right: 4px;
      text-align: right;
    }
}
.row-tit-operate {
	float: right;
}
.flex-item {
	width: 20% !important;
}
.flex-item:nth-child(13),
.flex-item:nth-child(14) {
	width: 49.5% !important;
}

.dangerous-upload .el-form-item {
	margin-bottom: 4px;
	float: left;
}

.el-form-item__content {
	line-height: 20px;
}
#dangerousPage .agentDetail .row-tit {
	&.isFixed{
		position: fixed;
		background-color: #fff;
		z-index: 999;
		padding: 5px 20px;
		height: 30px;
		box-shadow: 4px 0px 10px 0px #e9e9e9;
		top: 24px;
		// top: 64px;
		right: 0;
		.tit{
			line-height: 20px;
		}
	}
}
</style>
<style>
.el-form-item__label,
.el-form-item__content {
	line-height: 20px !important;
}
.fileNo-list {
	/* margin: 10px 0; */
	padding: 0;
}
.fileNo-list .link-fileNo {
	cursor: pointer;
	list-style: none;
	line-height: 24px;
	color: #3e80f5;
	font-size: 12px;
	text-decoration: underline;
}
.operate-group .file-link {
	margin-right: 10px;
	cursor: pointer;
	color: #3e80f5;
	text-decoration: underline;
	display: inline-block;
	max-width: 200px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
</style>
<style lang="scss" scoped>
.create-form {
	padding: 20px 80px 20px 20px;
}
.el-form-item__label,
.el-form-item__content {
	line-height: 30px;
}
.el-form-item {
	margin-bottom: 18px;
}
.el-upload {
	height: 78px;
	background: #f8f9fd;
	border-radius: 4px;
	.el-upload-img {
		margin: 20px 0 0;
	}
	.txt {
		padding: 0 20px;
		font-size: 12px;
	}
	.info {
		margin: 0;
		padding: 0 20px;
		line-height: 20px;
		font-size: 12px;
		color: #999;
	}
}
.el-upload-dragger {
	height: auto;
	color: #999;
}
</style>
