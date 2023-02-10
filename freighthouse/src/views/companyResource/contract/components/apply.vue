<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="applyForm" :rules="rules" :model="createdItem" label-position="right" class="apply-form">
			<el-row>
				<el-col :span="12">
					<el-form-item label="英文名称" prop="ename" :required="true" :show-message="false" label-width="100px">
						<el-select v-model="createdItem.ename" size="mini" clearable filterable placeholder="请选择"  @change="handleSelectTitle" style="width: 100%" :disabled="isTitle">
							<el-option v-for="item in titleList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
						<!-- <el-input size="mini" placeholder="请输入" clearable v-model="createdItem.ename" :disabled="isTitle"></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="中文名称" prop="cname" :required="false" :show-message="false" label-width="140px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.cname" :disabled="true"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="创建人所属航线" prop="createSyslineCode" :required="true" :show-message="false" label-width="100px">
						<el-select v-model="createdItem.createSyslineCode" size="mini" clearable filterable placeholder="请选择"  @change="handleSelectCreateSysLine" style="width: 100%">
							<el-option v-for="item in sysLineList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="是否为长帆抬头操作" prop="asLongsailingTitle" :required="true" :show-message="false" label-width="140px">
						<el-select v-model="createdItem.asLongsailingTitle" size="mini" clearable filterable placeholder="请选择"  @change="handleSelectIsLongSail" style="width: 100%">
							<el-option v-for="item in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="合约有效期" prop="contractDateType" :required="true" :show-message="false" label-width="100px">
						<el-select v-model="createdItem.contractDateType" size="mini" clearable filterable placeholder="请选择" @change="handleSelectContractDateType" style="width: 100%">
							<el-option v-for="item in dictMap.contractDateType" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="申请人" prop="applyEmployeeId" :required="true" :show-message="false" label-width="140px">
						<el-select v-model="createdItem.applyEmployeeId" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
						@change="handleChangeApplyer">
							<el-option v-for="item in applyerList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="合约覆盖航线" prop="syslineCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select">
						<el-select v-model="createdItem.syslineCodeStr" size="mini" clearable filterable multiple placeholder="请选择"  @change="handleSelectSysLine" style="width: 100%">
							<el-option v-for="item in sysLineList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="合约覆盖起运港" prop="polPortCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select">
						<el-select v-model="createdItem.polPortCodeStr" size="mini" clearable filterable multiple placeholder="请选择" style="width: 100%"
						@change="(val) => handleChangePolPortCode(val)">
							<el-option v-for="(item, index) in polPortList" :label="item" :value="item" :key="'pol'+index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="签约船公司" prop="signCompCode" :required="true" :show-message="false" label-width="100px">
						<el-select v-model="createdItem.signCompCode" size="mini" filterable clearable placeholder="请选择" style="width: 100%;"
						@change="handleChangeCompany">
							<el-option v-for="item in companyListOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="" prop="shipCarrierCode" :required="true" :show-message="false" label-width="10px">
						<el-select v-model="createdItem.shipCarrierCode" size="mini" filterable clearable placeholder="请选择" style="width: 100%"
						@change="handleChangeShipCarrierCode">
							<el-option v-for="item in shipCarrierList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="合约类型" prop="contractTypeCodeStr" :required="true" :show-message="false" label-width="100px" class="multi-select">
						<el-select v-model="createdItem.contractTypeCodeStr" size="mini" filterable clearable multiple placeholder="请选择" style="width: 100%;"
						@change="handleChangeContractType">
							<el-option v-for="item in dictMap.contractType" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12" v-if="createdItem.contractTypeCodeStr.includes('c_other')">
					<el-form-item label="" prop="contractTypeOther" :required="true" :show-message="false" label-width="10px">
						<el-input size="mini" placeholder="请输入" clearable v-model="createdItem.contractTypeOther" style="width: 100%"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="抬头简介" prop="description" :required="true" :show-message="false" label-width="100px">
						<el-input type="textarea" size="mini" placeholder="请输入" clearable v-model="createdItem.description" :disabled="true"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="申请理由" prop="applyReason" :required="true" :show-message="false" label-width="100px">
						<el-input type="textarea" size="mini" placeholder="请输入" clearable v-model="createdItem.applyReason" maxlength="512"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseEmployeeListName, companyPageList } from '@/api/base'
import { contractTitleList, contractTitleInfo, contractApply } from '@/api/order/contract'

const defaultCreateQuery = {
	titleId: '',
	ename: '',
	cname: '',
	createSyslineCode: '',
	createSyslineName: '',
	asLongsailingTitle: 'y',
	contractDateType: '',
	syslineCodeStr: '',
	syslineNameStr: '',
	polPortCodeStr: '',
	polPortNameStr: '',
	applyEmployeeId: '',
	applyEmployeeName: '',
	signCompCode: '',
	signCompName: '',
	shipCarrierCode: '',
	contractTypeCodeStr : '',
	contractTypeNameStr: '',
	contractTypeOther: '',
	description: '',
	applyReason: ''
}

export default {
	data() {
		return {
			state: '',
			dialogConfig: {
				title: '合约申请',
				show: true,
				size: 'medium',
				width: '900px'
			},
			createdItem: Object.assign({}, defaultCreateQuery),
			rules: {},
			sysLineList: [],
			saveList: [],	// 本地保存选中的港口
			applyerList: [],
			shipCarrierList: [],
			companyListOptions: [],
			titleList: []
		}
	},
	props: {
		applyPopQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// this.createdItem = {...this.applyPopQuery}
		let {titleId, ename, cname, description} = this.applyPopQuery
		this.createdItem.titleId = titleId
		this.createdItem.ename = ename
		this.createdItem.cname = cname
		this.createdItem.description = description
		console.log('this.sysUserId', this.userId);
		
		this.createdItem.applyEmployeeId = this.userId
		if (!titleId) {
			this.getTitleList()
		}
		// this.getTitleInfo()
		this.getSysLine()
		this.getApplyerList()
		this.shipCarrierQuerySearch()
		this.getCompanyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			userId: state => state.user.userId,
			polPortList: state => state.contract.polPortList
		}),
		isTitle() {
			return this.applyPopQuery.titleId ? true : false
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getTitleList() {
			let data = {
				pageSize: 1000,
				currPage: 1,
				columns: [],
				ascColumns: [],
				descColumns: ['createdTime'],
				query: [],
			}
			contractTitleList(data).then(res => {
				this.titleList = res.data.list.filter(item => item.titleStatus !== 'INVALID').map(item => {
					return {...item, label: item.ename, value: item.oid}
				})
			})
		},
		getTitleInfo() {
			contractTitleInfo({oid: this.applyPopQuery.oid}).then(res => {
				for (let i in defaultCreateQuery) {
					this.createdItem[i] = res.data[i]
				}
			})
		},
		handleSelectTitle(val) {
			let findItem = this.titleList.find(item => item.oid == val)
			this.createdItem.titleId = findItem ? findItem.oid : undefined
			this.createdItem.ename = findItem ? findItem.ename : ''
			this.createdItem.cname = findItem ? findItem.cname : ''
			this.createdItem.description = findItem ? findItem.description : ''
		},
		handleChangeContractType() {
		},
		handleChangeCompany(val) {
			let findItem = this.companyListOptions.find(item => item.value === val)
			this.signCompName = findItem ? findItem.label : ''
		},
		// 获取所有公司
		getCompanyList() {
			this.$store.dispatch('contract/getCompanyList').then(data => {
				this.companyListOptions = data
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
		handleChangeShipCarrierCode(val) {

		},
		handleChangeApplyer(val) {
		},
		// 获取申请人下拉
		getApplyerList() {
			this.$store.dispatch('contract/getEmployeeList').then(data => {
				this.applyerList = data
			})
		},
		handleChangePolPortCode(val) {
		},
		handleSelectContractDateType(val) {

		},
		// 系统航线下拉列表自动补充的数据
		getSysLine() {
			this.$store.dispatch('dict/baseSystemLineList', { name: '', state: '' }).then(data => {
				console.log('sysLineCode', data)
				this.sysLineList = data.map(item => {
					return {label: item.value, value: item.key}
				})
			})
		},
		handleSelectCreateSysLine(val) {
			let findItem = this.sysLineList.find(item => item.value === val)
			this.createdItem.createSyslineName = findItem ? findItem.label : ''
		},
		handleSelectSysLine(val) {
		},
		handleSelectIsLongSail(val) {
			
		},
		close(action) {
			this.$emit('close', action)
		},
		validate() {
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.applyForm.validate(valid => {
					if (valid) {
						this.handleApply()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		handleApply() {
			let data = {...this.createdItem}
			data.syslineCodeStr = this.createdItem.syslineCodeStr.join(',')
			data.polPortCodeStr = this.createdItem.polPortCodeStr.join(',')
			data.polPortNameStr = this.createdItem.polPortCodeStr.join(',')
			data.contractTypeCodeStr = this.createdItem.contractTypeCodeStr.join(',')
			let contractTypeNameArr = this.dictMap.contractType.filter(item => this.createdItem.contractTypeCodeStr.includes(item.value)).map(item => item.label)
			data.contractTypeNameStr = contractTypeNameArr.join(',')
			let sysLineArr = this.sysLineList.filter(item => this.createdItem.syslineCodeStr.includes(item.value)).map(item => item.label)
			data.syslineNameStr = sysLineArr.join(',')
			let applyEmpItem = this.applyerList.find(item => item.value === this.createdItem.applyEmployeeId)
			data.applyEmployeeName = applyEmpItem ? applyEmpItem.label : ''
			contractApply(data).then(res => {
				this.$message({type: 'success', message: '申请成功'})
				this.close('Confirm')
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.apply-form{
	/deep/ .el-input--mini .el-input__inner {
		height: 20px !important;
	}
	.multi-select{
		/deep/ .el-select .el-select__tags {
			max-width: 100% !important;
			span{
				width: auto;
				max-width: 90%;
				.el-tag--mini {
					padding: 0 0 0 3px;
					&:first-child{
						flex: auto;
					}
					&:first-of-type{
						flex: auto;
					}
					// &:nth-of-type(2) {
					// 	width: 30px;
					// }
				}
			}
		}
	}
}
</style>
