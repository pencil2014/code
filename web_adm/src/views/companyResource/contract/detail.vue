<template>
	<div class="edit-container" id="contractNoDetail">
    <div class="tab-cont" id="tabCont">
      <div
        class="item"
        :class="activeComponent === item.key ? 'isActive' : ''"
        v-for="(item, index) in tabsArr"
        :key="item.key + index"
        @click="handleClickTab(item)"
      >
        {{ item.label }}
      </div>
    </div>
		<el-form ref="contractNoForm" :rules="rules" :model="createdItem" class="detailCont" v-if="activeComponent === 'detail'">
			<div class="status-row-cont">
				<span class="status">合约状态：{{applyStatusCn}}</span>
				<el-button type="primary" size="mini" @click="handleSaveContract" v-if="isMain">保存</el-button>
				<el-button type="default" size="mini" @click="goBack">返回</el-button>
			</div>
			<div class="contract-form-cont">
				<!-- 基本信息 -->
				<div class="row-cont">
					<div class="tit">基本信息</div>
					<el-row class="base-info-row mt8">
						<el-col :span="48">
							<el-form-item label="英文名称" prop="ename" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.ename" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="中文名称" prop="cname" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.cname" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="纳税人识别号" prop="identNumber" :required="false" :show-message="false" label-width="110px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.identNumber" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="联系人" prop="contact" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.contact" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="TEL" prop="contactTel" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.contactTel" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="手机" prop="contactPhone" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.contactPhone" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="48">
							<el-form-item label="邮箱" prop="contactEmail" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.contactEmail" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="144">
							<el-form-item label="网址" prop="webUrl" :required="false" :show-message="false" label-width="110px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.webUrl" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="中英文地址" prop="contactAddress" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.contactAddress" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="抬头简介" prop="description" :required="false" :show-message="false" label-width="80px">
								<el-input size="mini" placeholder="请输入" clearable v-model="title.description" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="title.fileList.length">
							<el-form-item label="附件" prop="fileName" :required="false" :show-message="false" label-width="80px">
								<div class="file-row">
									<div v-for="(item, index) in title.fileList" :key="'file'+index" class="file-name">
										<el-button type="text" size="mini" @click="handleViewFile(item)">{{item.name}}</el-button>
										<!-- <i class="el-icon-close" @click="handleDeleteFile(item.oid)"></i> -->
									</div>
								</div>
								<!-- <div class="tip-upload">建议上传该抬头的营业执照、名片、开票信息等附件。</div>
								<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
									<div class="file-upload">
										<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
										<div class="file-upload__text">
											<div class="txt">点击或将文件拖拽到这里导入</div>
											<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
										</div>
									</div>
								</el-upload>
								<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress> -->
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="备注" prop="remark" :required="false" :show-message="false" label-width="80px">
								<el-input type="textarea" size="mini" placeholder="请输入" clearable v-model="title.remark" :disabled="true"></el-input>
							</el-form-item>
						</el-col>
					</el-row>
				</div>
				<!-- 合约号信息 -->
				<div class="row-cont">
					<div class="tit">合约号信息</div>
					<el-row class="base-info-row" style="margin-top: 8px">
						<el-col :span="6">
							<el-form-item label="合约号" prop="contractNumber" :required="true" :show-message="false" label-width="100px">
								<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contractNumber" maxlength="128" :disabled="conInfoDisabled"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="创建人所属分公司" prop="createCompName" :required="false" :show-message="false" label-width="120px">
								<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.createCompName" disabled style="width: 100%;"></el-input>
								<!-- <el-select v-model="createdItem.createCompCode" size="mini" filterable clearable placeholder="请选择" :disabled="true" style="width: 100%;">
									<el-option v-for="item in companyList" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select> -->
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="创建人所属航线" prop="createSyslineCode" :required="true" :show-message="false" label-width="140px">
								<el-select v-model="createdItem.createSyslineCode" size="mini" clearable filterable disabled placeholder="请选择"  @change="handleSelectCreateSysLine" style="width: 100%">
									<el-option v-for="item in sysLineList" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="主维护人" prop="mainEmployeeId" :required="false" :show-message="false" label-width="90px">
								<el-select v-model="createdItem.mainEmployeeId" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
								@change="handleChangeMainEmployee" :disabled="conInfoDisabled">
									<el-option v-for="item in maintainerList" :label="item.label" :value="item.value" :key="'main' + item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="4">
							<el-form-item label="签约船公司" prop="signCompCode" :required="true" :show-message="false" label-width="100px">
								<el-select v-model="createdItem.signCompCode" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
								@change="handleChangeCompany" :disabled="conInfoDisabled">
									<el-option v-for="item in companyList" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="2">
							<el-form-item label="" prop="shipCarrierCode" :required="true" :show-message="false" label-width="10px">
								<el-select v-model="createdItem.shipCarrierCode" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
								@change="handleChangeShipCarrier" :disabled="conInfoDisabled">
									<el-option v-for="item in shipCarrierList" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="合约有效期" prop="contractBegin" :required="true" :show-message="false" label-width="120px">
								<el-date-picker 
									size="mini"
									style="width: 100%"
									v-model="createdItem.contractBegin" 
									type="daterange" 
									range-separator="至" 
									start-placeholder="开始日期" 
									end-placeholder="结束日期" 
									value-format="yyyy-MM-dd"
									@chagne="handleChangeContractBeginTime"
									:disabled="conInfoDisabled">
								</el-date-picker>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="合约优势" prop="contractGoodCode" :required="true" :show-message="false" label-width="140px">
								<el-select v-model="createdItem.contractGoodCode" size="mini" filterable clearable placeholder="请选择" style="width: 100%" :disabled="conInfoDisabled">
									<el-option v-for="item in dictMap.contractGoodType" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="审单维护人" prop="auditEmployeeId" :required="false" :show-message="false" label-width="90px">
								<el-select v-model="createdItem.auditEmployeeId" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
								@change="handleChangeAuditEmployee" :disabled="conInfoDisabled">
									<el-option v-for="item in audMaintainerList" :label="item.label" :value="item.value" :key="'audit' + item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row class="base-info-row">
						<el-col :span="createdItem.contractTypeCodeStr.includes('c_other') ? 6 : 12">
							<el-form-item label="合约类型" prop="contractTypeCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select" :class="conInfoDisabled ? 'multi-select-disabled' : ''">
								<el-select v-model="createdItem.contractTypeCodeStr" size="mini" filterable clearable multiple placeholder="请选择" style="width: 100%"
								@change="handleChangeContactType" :disabled="conInfoDisabled">
									<el-option v-for="item in dictMap.contractType" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6" v-if="createdItem.contractTypeCodeStr.includes('c_other')">
							<el-form-item label="" prop="contractTypeOther" :required="true" :show-message="false" label-width="10px">
								<el-input type="text" size="mini" v-model="createdItem.contractTypeOther" style="width: 100%" placeholder="请输入" :disabled="conInfoDisabled"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="是否为长帆抬头操作" prop="asLongsailingTitle" :required="true" :show-message="false" label-width="140px">
								<el-select v-model="createdItem.asLongsailingTitle" size="mini" filterable clearable placeholder="请选择" style="width: 100%" disabled>
									<el-option v-for="item in yesOrNoOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row class="base-info-row">
						<el-col :span="24">
							<el-form-item label="合约覆盖起运港" prop="polPortCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select" :class="conInfoDisabled ? 'multi-select-disabled' : ''">
								<el-select v-model="createdItem.polPortCodeStr" size="mini" filterable clearable multiple placeholder="请选择" style="width: 100%"
								@change="handleChangePolPortCode" :disabled="conInfoDisabled">
									<el-option v-for="(item, index) in polPortList" :label="item" :value="item" :key="'pol'+index"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row class="base-info-row">
						<el-col :span="24">
							<el-form-item label="合约覆盖航线" prop="syslineCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select" :class="conInfoDisabled ? 'multi-select-disabled' : ''">
								<el-select v-model="createdItem.syslineCodeStr" size="mini" clearable filterable multiple placeholder="请选择" @change="handleSelectSysLine" style="width: 100%" :disabled="conInfoDisabled">
									<el-option v-for="item in sysLineList" :label="item.label" :value="item.value" :key="item.value"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row class="base-info-row mt8">
						<el-col :span="24">
							<el-form-item label="合约详细内容" label-width="100px">
								<ItemList :itemListQuery="itemListQuery" :isMain="isMain" @getInfo="getInfo"/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row class="base-info-row mt8">
						<el-col :span="24">
							<el-form-item label="套约备注模板" label-width="100px">
								<TemplateList :tempListQuery="tempListQuery" :isMain="isMain" :isAudit="isAudit" @getInfo="getInfo"/>
							</el-form-item>
						</el-col>
					</el-row>
				</div>
				<!-- 维护人 -->
				<div class="row-cont">
					<EmployeeList :employeeListQuery="employeeListQuery" :isMain="isMain" @getInfo="getInfo"/>
				</div>
			</div>
		</el-form>
		<Log v-if="activeComponent === 'log'"/>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Log from './components/logs'
import ItemList from './components/itemList'
import TemplateList from './components/templateList'
import EmployeeList from './components/employeeList'
import { baseDeptParticipants, companyPageList } from '@/api/base'
import { contractInfo, contractSave, contractTitleInfo } from '@/api/order/contract'
const defaultCreateQuery = {
	oid: undefined,
	contractNumber: '',
	createCompCode: '',
	createCompName: '',
	createSyslineCode: '',
	createSyslineName: '',
	syslineCodeStr: '',
	syslineNameStr: '',
	signCompCode: '',
	signCompName: '',
	shipCarrierCode: '',
	contractGoodCode: '',
	polPortCodeStr: '',
	polPortNameStr: '',
	contractBegin: '',
	contractEnd: '',
	contractTypeCodeStr: '',
	contractTypeNameStr: '',
	contractTypeOther: '',
	asLongsailingTitle: '',
	mainEmployeeId: '',
	auditEmployeeId: '',
}
export default {
	mixins: [routerMixin],
	data() {
		return {
			activeComponent: 'detail',
			tabsArr: [
        { label: '合约号详情', key: 'detail' },
        { label: '日志', key: 'log' },
			],
			rules: {},
			applyStatusCn: '',
			createdItem: Object.assign({}, defaultCreateQuery),
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			title: {
				fileList: []
			},
			sysLineList: [],
			maintainerList: [],
			audMaintainerList: [],
			shipCarrierList: [],
			companyList: [],
			itemListQuery: {
				list: []
			},
			tempListQuery: {
				list: []
			},
			employeeListQuery: {
				list: [],
				empSelectData: []
			},
			yesOrNoOptions: [{label: '是', value: 'Y'}, {label: '否', value: 'N'}],
			cTimestamp: 0,
			audit: {},
			main: {}
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getCompanyList()
		this.getTitleInfo()
		this.getInfo()
		this.getSysLine()
		this.getEmployeeList()
		this.shipCarrierQuerySearch()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.activeComponent = 'detail'
			this.getTitleInfo()
			this.getInfo()
		}
	},
	mounted() {},
	computed: {
		...mapState('user',['userId', 'name', 'compCode', 'compName']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			polPortList: state => state.contract.polPortList,
		}),
		isMain() {
			return this.userId === this.main.employeeId
		},
		isAudit() {
			return this.userId === this.audit.employeeId
		},
		conInfoDisabled() {
			// 主维护人可编辑合约信息
			if (this.isMain) {
				return false
			}
			return true
		}
	},
	watch: {},
	components: {
		Log,
		ItemList,
		TemplateList,
		EmployeeList
	},
	methods: {
		getTitleInfo() {
			contractTitleInfo({oid: this.$route.query.titleId}).then(res => {
				this.title = res.data
			})
		},
		// 合约详情
		getInfo(noUpdate) {
			let data = {oid: this.$route.query.oid}
			contractInfo(data).then(res => {
				let {createCompName, createCompCode, mainEmployeeId, mainEmployeeName, auditEmployeeId, auditEmployeeName} = res.data
				console.log('this.main', this.main);
				this.getApplyStatusCn(res.data)
				if (!noUpdate) {
					for (let i in defaultCreateQuery) {
						this.createdItem[i] = res.data ? res.data[i] : ''
						if (['syslineCodeStr', 'polPortCodeStr', 'contractTypeCodeStr'].includes(i)) {
							this.createdItem[i] = res.data[i] ? res.data[i].split(',') : ''
						}
					}
					if (this.createdItem.contractBegin && this.createdItem.contractEnd) {
						this.createdItem.contractBegin = [this.createdItem.contractBegin, this.createdItem.contractEnd]
					}
					// 创建人所属分公司默认是登录人所属公司
					this.createdItem.createCompName = createCompName ? createCompName : this.compName
					this.createdItem.createCompCode = createCompCode ? createCompCode : this.compCode
					// 主维护人，审单维护人默认是登录人
					this.createdItem.mainEmployeeId = mainEmployeeId ? mainEmployeeId : this.userId
					this.createdItem.mainEmployeeName = mainEmployeeName ? mainEmployeeName : this.name
					this.createdItem.auditEmployeeId = auditEmployeeId ? auditEmployeeId : this.userId
					this.createdItem.auditEmployeeName = auditEmployeeName ? auditEmployeeName : this.name
					this.audit = {
						employeeId: this.createdItem.auditEmployeeId,
						employeeName: this.createdItem.auditEmployeeName
					}
					this.main = {
						employeeId: this.createdItem.mainEmployeeId,
						employeeName: this.createdItem.mainEmployeeName
					}
				}
				// 子合约，维护人列表数据
				this.$set(this.itemListQuery, 'list', res.data ? res.data.itemList : [])
				this.$set(this.employeeListQuery, 'list', res.data ? res.data.employeeList : [])
				// 套约模板数据处理
				let tempArr = []
				res.data.templateList.map(item => {
					tempArr.push({
						...item,
						org_lockBkgShipper: item.lockBkgShipper,
						org_lockBkgConsignee: item.lockBkgConsignee,
						org_lockBkgNotify: item.lockBkgNotify,
						org_lockBkgCargoName: item.lockBkgCargoName,
						org_lockBkgCargoWeight: item.lockBkgCargoWeight,
						org_lockBkgRemark: item.lockBkgRemark,
						org_lockBlShipper: item.lockBlShipper,
						org_lockBlConsignee: item.lockBlConsignee,
						org_lockBlNotify: item.lockBlNotify,
						org_lockBlCargoName: item.lockBlCargoName,
						org_lockBlCargoWeight: item.lockBlCargoWeight,
						org_lockBlSiRemark: item.lockBlSiRemark,
						org_lockPayRemark: item.lockPayRemark,
					})
				})
				this.$set(this.tempListQuery, 'list', tempArr)
				console.log('this.createdItem', this.createdItem)
			})
		},
		getApplyStatusCn(data) {
			let {applyStatus, contractNumber, createdBy, flowIndexEmployeeId} = data
			if (applyStatus === 'PASS' && !contractNumber) {
				this.applyStatusCn = '待维护'
			}
			if (applyStatus === 'PASS' && contractNumber) {
				this.applyStatusCn = '已维护'
			}
			if (applyStatus === 'SUBMIT' && flowIndexEmployeeId !== createdBy) {
				this.applyStatusCn = '待审核'
			}
			if (applyStatus === 'REFUSE') {
				this.applyStatusCn = '已拒绝'
			}
			if (applyStatus === 'BREAK') {
				this.applyStatusCn = '已关闭'
			}
			if (applyStatus === 'CLOSE') {
				this.applyStatusCn = '已关闭'
			}
		},
		// 合约保存
		handleSaveContract() {
			this.$refs.contractNoForm.validate(valid => {
				if (valid) {
					this.contractSave()
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		contractSave() {
			let data = {...this.createdItem}
			data.syslineCodeStr = data.syslineCodeStr.join(',')
			data.polPortCodeStr = data.polPortCodeStr.join(',')
			data.contractTypeCodeStr = data.contractTypeCodeStr.join(',')
			if (this.createdItem.contractBegin && this.createdItem.contractBegin.length) {
				data.contractBegin = this.createdItem.contractBegin[0]
				data.contractEnd = this.createdItem.contractBegin[1]
			} else {
				data.contractBegin = ''
				data.contractEnd = ''
			}
			contractSave(data).then(res => {
				this.$message({type: 'success', message: '保存成功'})
				this.getInfo()
			}).catch(err => {
				console.log('error');
			})
		},
		goBack() {
			this.$router.push({
				name: 'Contract'
			})
		},
		handleSelectCreateSysLine(val) {
			let findItem = this.sysLineList.find(item => item.value === val)
			this.createdItem.createSyslineName = findItem ? findItem.label : ''
		},
		handleSelectSysLine() {

		},
		handleChangeContactType(val) {
			console.log('val', val)
		},
		handleChangeContractBeginTime(val) {
		},
		handleChangePolPortCode(val) {
			console.log('val', val);
			
		},
		// 获取所有公司
		getCompanyList() {
			this.$store.dispatch('contract/getCompanyList').then(data => {
				this.companyList = data
			})
		},
		// 船公司下拉列表自动补充的数据
		shipCarrierQuerySearch() {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: '', state: 'valid' }).then(data => {
				this.shipCarrierList = data.map(item => {
					return {label: item.value, value: item.value}
				})				
			})
		},
		// 维护人下拉
		getEmployeeList() {
			let data = {name: '', roleCode: 'pricing'}
			baseDeptParticipants(data).then(res => {
				let result = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				if (!result.find(item => item.value === this.userId)) {
					result.push({label: this.name, value: this.userId})
				}
				this.maintainerList = result
				this.audMaintainerList = result
				this.setEmployeeOptions(result)
			})
		},
		setEmployeeOptions(list) {
			let empList = [...list]
			if (this.createdItem.mainEmployeeId && !empList.find(item => item.value === this.createdItem.mainEmployeeId)) {
				empList.push({label: this.main.employeeName, value: this.main.employeeId})
				this.maintainerList.push({label: this.main.employeeName, value: this.main.employeeId})
			}
			if (this.createdItem.auditEmployeeId && !empList.find(item => item.value === this.createdItem.auditEmployeeId)) {
				empList.push({label: this.main.employeeName, value: this.main.employeeId})
				this.audMaintainerList.push({label: this.main.employeeName, value: this.main.employeeId})
			}
			this.$set(this.employeeListQuery, 'empSelectData', empList)
		},
		handleChangeMainEmployee() {

		},
		handleChangeAuditEmployee() {

		},
		// 系统航线下拉列表自动补充的数据
		getSysLine() {
			this.$store.dispatch('dict/baseSystemLineList', { name: '', state: '' }).then(data => {
				this.sysLineList = data.map(item => {
					return {label: item.value, value: item.key}
				})
			})
		},
		handleChangeCompany() {

		},
		handleChangeShipCarrier() {

		},
		// 点击切换tab
    handleClickTab(item) {
      this.activeComponent = item.key
      // 从日志切换回详情
      if (this.activeComponent === 'detail') {
        
      }
		},
		handleViewFile(item) {
      this.$store.dispatch('order/previewFile', {fileNo: item.fileNo, fileName: item.name})
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
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let params = {
				data: {
				},
				fileName: this.fileList
			}
			let uri = '/order/blFile/upload'
			if (this.fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: uri,
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
								this.canSubmit = true
								if (res === 'error') return
								this.$message({
									type: 'success',
									message: '导入成功',
									duration: 1000,
									onClose: () => {
										this.close('Confirm')
									}
								})
							})
					}
				})
			} else {
				params.data.fileBatchNo = ''
				if (this.sizeLimit) {
					this.canSubmit = false
					this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: uri,
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
							this.canSubmit = true
							if (res === 'error') return
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						})
				}
			}
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
	}
}
</script>
<style lang="scss" scoped>
#contractNoDetail {
  .tab-cont {
    height: 24px;
    line-height: 24px;
    background-color: #ffffff;
    border-radius: 2px 2px 0px 0px;
    margin-top: 8px;
    border-bottom: 1px solid #e9e9e9;
    margin-left: 10px;
    .item {
      float: left;
      display: inline-block;
      // width: 84px;
      color: #3e80f5;
      text-align: center;
      cursor: pointer;
      position: relative;
      padding: 0 30px;
      font-size: 14px;
      &::before {
        content: '';
        position: absolute;
        display: block;
        height: 16px;
        width: 1px;
        right: -1px;
        top: 5px;
        background-color: #3e80f5;
      }
      &.isActive {
        color: #fff;
        background-color: #3e80f5;
        &::before {
          display: none;
        }
      }
    }
  }
	.status-row-cont{
		background-color: #fff;
		padding: 5px 10px;
		line-height: 20px;
		display: flex;
		justify-content: flex-end;
		border-bottom: 1px solid #f5f7f9;
		.status{
			margin-right: 20px;
		}
		.el-button--mini{
			padding: 0 7px;
		}
	}
	.detailCont{
		margin: 0 0 0 10px;
		.contract-form-cont{
			height: calc(100vh - 100px);
			overflow-y: auto;
			.row-cont {
				margin-top: 8px;
				border: 1px solid #ddd;
				background-color: #fff;
				overflow: hidden;
				.tit{
					border-bottom: 1px solid #ddd;
					line-height: 24px;
					height: 24px;
					font-size: 12px;
					padding-left: 10px;
				}
			}
		}
	}
	/deep/ .el-col-48{
		width: 20%;
	}
	/deep/ .el-col-144{
		width: 60%;
	}
	/deep/ .el-form-item__label{
		line-height: 20px;
		padding: 0 5px 0 0;
	}
	/deep/ .el-form-item__content{
		line-height: 20px;
	}
	/deep/ .el-input--mini .el-input__inner {
		height: 20px !important;
		line-height: 20px;
	}
	/deep/ .el-input--mini .el-input__icon {
		line-height: 20px;
	}
	/deep/ .el-range-editor--mini.el-input__inner{
		height: 20px;
	}
	/deep/ .el-range-editor.el-input__inner{
		padding: 0 5px;
	}
	.base-info-row{
		margin: 0 10px;
		&.mt8{
			margin-top: 8px;
			margin-bottom: 8px;
		}
	}
	.multi-select{
		/deep/ .el-select .el-select__tags {
			max-width: 100% !important;
			span{
				width: initial;
				max-width: 90%;
				.el-tag--mini {
					padding: 0 0 0 3px;
					max-width: 100%;
					&:first-child{
						flex: auto;
					}
					&:first-of-type{
						flex: auto;
					}
					&:nth-of-type(2) {
						width: initial;
					}
				}
			}
		}
		&.multi-select-disabled {
			/deep/ .el-select .el-select__tags span{
				max-width: 100%;
			}
		}
	}
}
</style>
