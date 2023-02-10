<template>
	<div class="edit-container fullWrap" id="shipNewOccupyDetail">
		<div class="alert-cont" id="alertCont">
			<!-- 订舱单拒绝提示 -->
			<RefuseAlert v-if="isPricing && isRefuse" :refuseReason="refuseReason" />
		</div>
		<div class="tab-cont" id="tabCont">
			<div class="item isActive">占舱详情</div>
		</div>
		<el-form ref="form" :model="saveItems">
			<div class="bookDetail-row" id="infoCont">
				<div class="row-tit">
					<span class="small-tit">
						<span v-if="type == 'edit'">
							<img class="icon" :src="require('@/assets/icon-file.png')" />
							<span class="bkgNo">订舱单号:</span>
							<span class="bkgNo"> {{ bookDetailForm.bkgReqNo }} {{ bookDetailForm.orderNo ? `(${bookDetailForm.orderNo})` : '' }}</span>
							<span class="bkgStatus"> 
								<span class="mr5">订舱状态</span>
								<i :class="bookDetailForm.bkgStatus"></i>
								<span :class="bookDetailForm.bkgStatus">{{ bookDetailForm.bkgStatus | bkgStatusFilter }}</span>
							</span>
						</span>
					</span>
					<div class="row-tit-operate">
						<el-button type="text" size="mini" class="underline" style="margin-left: 20px" @click="handleViewCheckPoint" v-if="type == 'edit'">操作记录</el-button>
						<el-button type="primary" size="mini" @click="saveFunc('save')" class="btn-save" v-if="['draft', 'submit', 'book_refuse'].includes(bookDetailForm.bkgStatus) || !$route.query.bkgReqNo">保存</el-button>
						<el-button type="primary" size="mini" @click="saveFunc('pass')" class="btn-pass ml10" v-if="['draft', 'submit', 'book_refuse'].includes(bookDetailForm.bkgStatus) || !$route.query.bkgReqNo">提交</el-button>
						<!-- <el-button size="mini" @click="handleGoBack" class="ml10">返回</el-button> -->
					</div>
				</div>
			</div>
			<div class="book-cont">
				<div class="left-cont" :style="{height: `${bookInfoHeight}px`}">
					<!-- 订舱信息 -->
					<div class="soInfo-row" >
						<el-collapse v-model="activeNames">
							<el-collapse-item title="订舱信息" name="1">
								<template>
									<ul class="bookInfo">
										<el-form :model="saveItems" :rules="rules" ref="bookForm" label-width="110px">
											<NewOccupyBookInfo 
												:employeeListParam="employeeListParam"
												:saveItems="saveItems" 
												:bookDetailForm="bookDetailForm" 
												:bkgAgentList="bkgAgentList"
												:fillPortCodes="fillPortCodes"
												@getCountryCode="getCountryCode"/>
											<!-- <li v-for="(ele, index) in arrformInfo.items" :key="index" :class="ele.key === 'auditRemark' ? ele.key : ''">
												<el-form-item v-if="ele.key == 'bkgEmployeeId'" class="el-form-block" :id="ele.key" :required="ele.required" :label="ele.label" :prop="ele.key" :show-message="false">
													<el-select
														size="mini"
														:filterable="true"
														remote
														v-model="saveItems[ele.key]"
														style=""
														clearable
														placeholder="请选择"
														@visible-change="
															val => {
																visibleChange(val)
															}
														"
														:filter-method="
															val => {
																filterMehod(val)
															}
														"
														@change="
															val => {
																handleChangeEmployee(val)
															}
														"
														:style="{ width: '100%' }"
													>
														<el-option v-for="(o, index) in employeeOptions" :key="index" :label="o.label" :value="o.value"> </el-option>
													</el-select>
												</el-form-item>

												<FormItem v-else :item="ele" :form="saveItems" />
											</li> -->
										</el-form>
									</ul>
								</template>
								<SoContainer :containerTotal="containerTotal" :createItem="containerInfo" :bookDetailForm="bookDetailForm" ref="containerInfo" />
								<Cargo :cargoList="cargoList" :bookDetailForm="bookDetailForm" :countryCode="countryCode" @delete="handleDeleteCargo" ref="occupyCargo"/>
								<!-- SO列表 -->
								<div class="row-form">
									<el-table class="so-tableinfo" style="width: 100%;" :data="soLists">
										<el-table-column prop="so" label="so号" align="center"> </el-table-column>
										<el-table-column prop="containerInfo" label="箱型箱量" align="center" width="150"> </el-table-column>
										<el-table-column prop="vessel" label="船名" width="100" align="center"> </el-table-column>
										<el-table-column prop="voyage" label="航次" width="100" align="center"> </el-table-column>
										<el-table-column prop="polPortName" label="起运港" align="center"> </el-table-column>
										<el-table-column prop="porPortName" label="驳船收货地" align="center"> </el-table-column>
										<el-table-column prop="podPortName" label="目的地" align="center"> </el-table-column>
										<el-table-column prop="remark" label="so备注" width="150" align="center"> </el-table-column>
									</el-table>
								</div>
							</el-collapse-item>
						</el-collapse>
					</div>
				</div>
			</div>
		</el-form>
		<!-- 操作记录弹窗 -->
		<div v-if="checkPointPopShow">
			<CheckPointPop :params="bookDetailForm" @close="checkPointPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { baseEmployeeListName } from '@/api/base'
import { supplierList } from '@/api/crm/supplier'
import { bookInfo, bookNewHoldInfo, bookCreate, soList } from '@/api/order/book/list'
import { handleData } from '../js/handleData'
// import FormItem from '@/components/Form/elFormItem'
import SoContainer from '../orderList/components/soContainerOccupy'
import Cargo from './components/occupyCargo'
import RefuseAlert from './components/refuseAlert'
import { copyArry, objToForm, getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import NewOccupyBookInfo from './components/newOccupyBookInfo'
import CheckPointPop from './components/checkPointPop'

export default {
	filters: {
		bkgStatusFilter(bkgStatus) {
			return getDictLabel('bkgStatus', bkgStatus)
		}
	},
	mixins: [routerMixin],
	data() {
		return {
			cTimestamp: '',
			soLists: [],
			activeNames: '1',
			bookDetailForm: {},
			bkgReqNo: this.$route.query.bkgReqNo,
			// 订舱基本信息
			bookBaseInfo: {
				title: '订舱基本信息',
				showTitle: false,
				type: 'base',
				info: handleData.occupyInfo
			},
			// 箱型箱量信息
			containerInfo: {
				title: '箱型箱量信息',
				type: 'container',
				isNew: false,
				container: '',
				weight: '',
				volume: '',
				soContainerList: [{
					isSplit: 'n',
					containerList: [{ containerType: '', isHeavy: '' }]
				}]
			},
			cargoList: [{ boxRemark: '无' }],
			saveItems: {},
			// 下拉人员选项
			employeeOptions: [],
			bkgAgentSupplierList: [], // 订舱代理
			polPortList: [],
			isRefuse: false, // 被拒绝
			refuseReason: '',
			rules: {
				bkgEmployeeId: [{ required: true, message: '订舱人员不能为空', trigger: 'change' }],
				shipCarrierCode: [{ required: true, message: '船公司不能为空', trigger: 'change' }],
				cyCutOff: [{ required: true, message: '大船截关时间不能为空', trigger: 'change' }],
				etdTime: [{ required: true, message: '大船预计开船时间不能为空', trigger: 'change' }],
				polPortCode: [{ required: true, message: '大船起运港不能为空', trigger: 'change' }],
				contractNo: [{ required: true, message: '合约号不能为空', trigger: 'blur' }],
				bkgAgentSupplierId: [{ required: true, message: '订舱代理不能为空', trigger: 'blur' }],
				carrierService: [{ required: true, message: '航线代码不能为空', trigger: 'blur' }],
				unloadingPortCode: [{ required: true, message: '卸货港不能为空', trigger: 'change' }],
				podPortCode: [{ required: true, message: '目的港不能为空', trigger: 'change' }]
			},
			fillPortCodes: '',
			bkgAgentList: [],
			countryCode: '',	// 国家用来判断是否木质包装
			checkPointPopShow: false, // 操作记录弹窗
			bookInfoHeight: 0,	// 订舱信息高度
			employeeListParam: {},
		}
	},
	mounted() {
		window.addEventListener('resize', this.getBookInfoHeight)
		this.$nextTick(() => {
			this.getBookInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getBookInfoHeight)
	},
	computed: {
		...mapState({
			userId: state => state.user.userId
		}),
		type() {
			return this.$route.query.bkgReqNo ? 'edit' : 'add'
		},
		isPricing() {
			return this.$store.state.user.roles.includes('pricing')
		},
		// 箱型箱量统计
		containerTotal() {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let { soContainerList } = this.containerInfo
			if (soContainerList && soContainerList.length === 0) {
				return {
					quantity: '',
					weight: '',
					volume: '',
					container: ''
				}
			}
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(3))
					volume = parseFloat(volume.toFixed(3))
					quantity = parseFloat(quantity.toFixed(3))
					containerArr.push({
						containerType: o.containerType ? o.containerType : '',
						containerNum: o.containerNum ? o.containerNum : ''
					})
				})
			})

			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			let containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			containerTypeArr.forEach(item => {
				let arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})

			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType || item.containerNum) {
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})

			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container
			}
		}
	},
	components: {
		// FormItem,
		SoContainer,
		Cargo,
		RefuseAlert,
		NewOccupyBookInfo,
		CheckPointPop
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getSoList()
		this.bkgReqNo ? this.getBookInfo() : this.init()
	},

	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.isRefuse = false
			this.$route.query.bkgReqNo ? this.getBookInfo() : this.init()
		}

		this.getSoList()
	},
	methods: {
		getBookInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let tabHeight = document.getElementById('tabCont').offsetHeight
			let infoHeight = document.getElementById('infoCont').offsetHeight
			// console.log('🚀 ~ offsetTop', bodyHeight)
			this.workAssignHeight = bodyHeight - alertHeight - tabHeight - infoHeight	-24// 24:参与人标题高度
			this.bookInfoHeight = bodyHeight - alertHeight - tabHeight - infoHeight
		},
		handleViewCheckPoint() {
			this.checkPointPopShow = true
		},
		checkPointPopClose(action) {
			this.checkPointPopShow = false
		},
		handleDeleteCargo(index) {
			this.cargoList = this.cargoList.filter((item, sindex) => {
        return sindex !== index
      })
		},
		//获取so列表
		getSoList() {
			soList(this.$route.query.bkgReqNo).then(res => {
				this.soLists = res.data
			})
		},
		init() {
			this.countryCode = ''
			this.bookDetailForm = {}
			this.containerInfo.soContainerList = [{
				isSplit: 'n',
				containerList: [{ containerType: '', isHeavy: '' }]
			}]
			this.cargoList = [{ boxRemark: '无' }]
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['bookForm'].clearValidate()
			})
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		// 获取订舱详情数据
		getBookInfo() {
			let data = { bkgReqNo: this.$route.query.bkgReqNo }
			bookNewHoldInfo(data).then(response => {
				this.bookDetailForm = copyArry(response.data)
				// 订舱人员、订舱代理、船公司代理反显
				let { auditEmployeeId, auditEmployeeName, bkgEmployeeId, bkgEmployeeName, porPortCode, porPortName, bkgAgentSupplierName, bkgAgentSupplierId, shipAgentSupplierName, 
					shipAgentSupplierId, polPortCode, polPortName, podPortCode, podPortName, unloadingPortCode, unloadingPortName } = this.bookDetailForm
				this.bkgAgentList = [{ label: bkgAgentSupplierName, value: bkgAgentSupplierId }]
				let portCodeArr = []
				porPortCode ? portCodeArr.push(porPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// 获取目的港countryCode，做木质包装显示隐藏
				if (podPortCode) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === podPortCode)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
				}
				// 获取箱型箱量信息
				this.containerInfo.soContainerList = response.data.soContainer
				Object.assign(this.containerInfo, handleData.arrContainerInfo(response.data.soContainer))
				this.cargoList = response.data.cargoList && response.data.cargoList.length ? response.data.cargoList : [{ boxRemark: '无' }]
				// 获取拒绝信息
				let { refuseReason, refuseRemark, refuseEmployeeId } = this.bookDetailForm
				this.isRefuse = refuseEmployeeId === this.userId ? true : false
				let refuseReasonCn = getDictLabel('bkgRefuseReason', refuseReason)
				if (this.isRefuse) {
					this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
				}
				this.employeeListParam = {
					bkg: [{ label: response.data.bkgEmployeeName, value: response.data.bkgEmployeeId }],
				}
				console.log('this.employeeListParam', this.employeeListParam)
			})
		},
		// 下拉搜索自定义查询
		filterMehod(val) {
			this.getEmployeeName(val)
		},
		// 下拉展开
		visibleChange(val) {
			if (val) {
				this.getEmployeeName()
			}
		},
		// 选中协同人员下拉
		handleChangeEmployee(val) {
			console.log(this.bookDetailForm)
		},
		// 获取姓名
		getEmployeeName(val) {
			let data = {
				name: val
			}
			baseEmployeeListName(data).then(res => {
				this.employeeOptions = res.data.filter(item => item.status === 'on').map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
			})
		},
		// select remote下拉搜索处理
		visibleChangeSupplier(value, item) {
			if (value) {
				if (item.key === 'polPortCode' || item.key === 'porPortCode' || item.key === 'podPortCode' || item.key === 'unloadingPortCode') {
					let portAttribute = ''
					if (item.key === 'polPortCode' || item.key === 'porPortCode') portAttribute = 'port_of_basic'
					if (item.key === 'podPortCode') portAttribute = 'port_of_destination'
					if (item.key === 'unloadingPortCode') portAttribute = 'port_of_discharge'

					return this.queryPortList('', portAttribute, item)
				}
				if (item.key === 'shipCarrierCode') return this.queryCarrierCode('', item)

				if (item.key === 'bkgAgentSupplierId')
					return this.getSupplierList('bkg_agent', '').then(res => {
						item.options = res.data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId
							})
						})
					})
			}
		},
		remoteMehodSupplier(val, item) {
			if (item.key === 'polPortCode' || item.key === 'porPortCode' || item.key === 'podPortCode' || item.key === 'unloadingPortCode') {
				let portAttribute = ''
				if (item.key === 'polPortCode' || item.key === 'porPortCode') portAttribute = 'port_of_basic'
				if (item.key === 'podPortCode') portAttribute = 'port_of_destination'
				if (item.key === 'unloadingPortCode') portAttribute = 'port_of_discharge'

				return this.queryPortList(val, portAttribute, item)
			}

			if (item.key === 'shipCarrierCode') return this.queryCarrierCode(val, item)

			if (item.key === 'bkgAgentSupplierId')
				return this.getSupplierList('bkg_agent', val).then(res => {
					item.options = res.data.list.map(ele => {
						ele.label = this.$language == 'en' ? ele.ename : ele.name
						ele.value = ele.supplierId
						return ele
					})
				})
		},
		queryVesselSearch(queryString, cb) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				cb(data)
			})
		},
		queryVoyageSearch(queryString, cb) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel: this.saveItems.vessel }).then(data => {
				cb(data)
			})
		},
		// 获取港口
		queryPortList(queryString, portAttribute, item) {
			this.$store.dispatch('dict/basePortList', { queryString: queryString, portAttribute: portAttribute, state: 'valid' }).then(data => {
				item.options = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 获取船公司
		queryCarrierCode(val, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: val, state: 'valid' }).then(data => {
				item.options = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 供应商信息模糊查询
		getSupplierList(category, supplierName) {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: supplierName
					? [
							{ column: 'category', type: 'eq', value: category },
							{ column: 'name', type: 'like', value: supplierName }
					  ]
					: [{ column: 'category', type: 'eq', value: category }]
			}
			return supplierList(data)
		},
		// 返回
		handleGoBack() {
			this.isRefuse = false
			this.$router.push({name:'BookShip'})
		},
		// 获取货物信息提交数据
		getCargoListValue() {
			// 某行必填项未填写的忽略掉该行
			this.cargoList = this.cargoList.filter(item => {
				if (item.hscode && item.cname && item.ename && item.property && item.boxRemark) {
					if (item.property !== 'dangerous') {
						return true
					} else if (item.dangerousGrade && item.dangerousCode) {
						return true
					}
				}
			})
			// console.log('this.cargolist', this.cargoList);
			let cargoList = this.cargoList.map(item => {
				let cargoObj = {
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					boxRemark: item.boxRemark,
					commodityTypeCode: item.commodityTypeCode,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined
				}
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				return cargoObj 
			})
			return cargoList
		},
		// 保存或提交
		saveFunc(type) {
			this.saveItems.submitType = type
			this.saveItems.soContainerList = [...this.containerInfo.soContainerList]
			let canSubmit = true
			let containerList = this.$refs['containerInfo'].$refs['containerList']
			console.log(this.saveItems)
			this.$refs.bookForm.validate(valid => {
				if (valid) {
					for (var i = 0; i < containerList.length; i++) {
						containerList[i].validate(isVaild => {
							if (isVaild) {
								console.log('可提交')
							} else {
								canSubmit = false
								console.log('error submit!!')
								return
							}
						})
					}
				} else {
					canSubmit = false
					console.log('error submit!!')
					return false
				}
			})

			if (canSubmit) {
				this.saveItems.cargoList = this.getCargoListValue()
				bookCreate(this.saveItems).then(res => {
					this.$message({
						type: 'success',
						message: type === 'pass' ? '提交成功' : '保存成功',
						// duration: 1000,
						// onClose: () => {
						// 	// this.handleGoBack()
						// }
					})
					console.log('query',{...this.$route.query, bkgReqNo: res.data.bkgReqNo})
					this.routerPush('NewOccupyDetail', {...this.$route.query, bkgReqNo: res.data.bkgReqNo})
					this.getBookInfo()
				})
			}
		}
	},
	watch: {
		bookDetailForm: {
			handler(newVal) {
				let {bkgReqNo,shipCarrierCode,cyCutOff,etdTime,sysLineCode,carrierLineName,carrierService,vessel,voyage,bkgAgentSupplierId,contractNo,contractSupplierId,
				shipAgentSupplierId,porPortCode,bkgEmployeeId,polPortCode,unloadingPortCode,podPortCode,auditRemark,isExternal} = this.bookDetailForm
				this.saveItems = {
					submitType: '',
					bkgReqNo,
					shipCarrierCode,
					cyCutOff,
					etdTime,
					sysLineCode,
					carrierLineName,
					carrierService,
					vessel,
					voyage,
					bkgAgentSupplierId,
					contractNo,
					contractSupplierId,
					shipAgentSupplierId,
					porPortCode,
					bkgEmployeeId,
					polPortCode,
					unloadingPortCode,
					podPortCode,
					auditRemark,
					isExternal
					// soContainerList: newVal.soContainer || [
					// 	{
					// 		isSplit: 'n',
					// 		containerList: [{ containerType: '', isHeavy: ''  }]
					// 	}
					// ]
				}
			},
			deep: true
		}
	}
}
</script>
<style lang="scss">
@import '../less/detail.scss';
#shipNewOccupyDetail {
	.tab-cont{
		height: 24px;
		line-height: 24px;
		background-color: #FFFFFF;
		// box-shadow: 0px -1px 0px 0px #E9E9E9;
		border-radius: 2px 2px 0px 0px;
		margin-top: 8px;
		border-bottom: 1px solid #e9e9e9;
    margin-left: 10px;
		.item{
			float: left;
			display: inline-block;
			// width: 84px;
			color: #3E80F5;
			text-align: center;
			cursor: pointer;
			position: relative;
			padding: 0 30px;
			font-size: 14px;
			&::before{
				content: "";
				position: absolute;
				display: block;
				height: 16px;
				width: 1px;
				right: -1px;
				top: 5px;
				background-color: #3e80f5;
			}
			&.isActive{
				color: #fff;
				// font-weight: bold;
				background-color: #3E80F5;
				&::before{
					display: none;
				}
			}
		}
	}
	&.fullWrap{
		background-color: rgb(245, 247, 249);
		height: 100%;
		overflow: hidden;
		.tab-cont{
			margin-left: 0;
			margin-top: 0;
		}
		.alert-cont{
			margin-left: 0;
		}
	}
	.el-table .cell.el-tooltip {
		padding-right: 0;
		overflow: hidden;
	}
	.alert-cont {
		margin: 0 10px;
	}
	.bookDetail-row {
		height: 36px;
		line-height: 36px;
		margin-top: 4px;
		.row-tit {
			display: flex;
			justify-content: space-between;
			background: #fff;
			border-radius: 2px;
			height: 36px;
			line-height: 36px;
			align-items: center;
			padding: 0 8px;
			&.soInfo-tit {
				border-radius: 2px 2px 0px 0px;
				border-bottom: 1px solid #e9e9e9;
				height: 24px;
				line-height: 24px;
			}
			&.bt{
				border-bottom: 1px solid #f5f7f9;
			}
		}
		.row-form {
			padding: 8px;
		}
		.small-tit .bkgNo {
			color: #222;
		}
		.small-tit .bkgStatus {
			display: inline-block;
			color: #4a4a4a;
			max-width: 300px; 
			margin-left: 50px;
			.mr5 {
				margin-right: 5px;
			}
			.book_refuse, .refuse{
				color: #CD4130;
			}
			.booking, .booked{
				color: #3E80F5;
			}
			.book_release, .complete{
				color: #33B18A;
			}
			.book_exp, .submit{
				color: #EDB534;
			}
			i {
				display: inline-block;
				width: 14px;
				height: 14px;
				border-radius: 50%;
				line-height: 14px;
				background: url(../../../../assets/icon_bkgStatus.png) center center no-repeat;
				background-color: #4a4a4a;
				margin-right: 5px;
				vertical-align: sub;
				// &.booking {
				// 	background-color: #674dc9;
				// }
				&.book_refuse,
				&.refuse {
					background-color: #cd4130;
				}
				&.booking,
				&.booked {
					background-color: #3e80f5;
				}
				&.book_release, &.complete {
					background-color: #33b18a;
				}
				&.book_exp,
				&.submit {
					background-color: #edb534;
				}
			}
		}
		.small-tit .icon {
			vertical-align: sub;
			margin-right: 5px;
			width: 14px;
		}
		.row-tit-operate {
			.btn-save,
			.btn-refuse,
			.btn-pass {
				display: inline-block;
				// vertical-align: middle;
			}
			.el-button--mini {
				padding: 0 8px;
				height: 20px;
			}
		}
	}
	.soInfo-row {
		margin-top: 4px;
		background-color: #fff;
		.row-tit {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 8px;
			border-radius: 2px 2px 0px 0px;
			border-bottom: 1px solid #e9e9e9;
			height: 24px;
			line-height: 24px;
		}
		ul.bookInfo {
			list-style: none;
			zoom: 1;
			padding-left: 10px;
			margin-top: 10px;
			margin-bottom: 6px;
			li {
				list-style: unset;
				width: 20%;
				float: left;
				.el-form-item {
					margin-bottom: 4px;
					margin-right: 6px;
					&.vessel-time{
						.el-form-item__content{
							display: flex;
						}
						.vessel-time-popover{
							.el-button {
								height: 20px;
								// line-height: 20px;
								padding: 2px 5px;
							}
						}
						.el-button {
							height: 20px;
							padding: 2px 5px;
						}
					}
				}
				.el-input--mini .el-input__icon {
					line-height: 20px;
				}
				.el-form-item__label:before {
					margin-right: 2px;
				}
				&.auditRemark {
					width: 100%;
				}
			}
		}
		ul.bookInfo::after {
			content: '';
			display: block;
			clear: both;
			visibility: hidden;
		}
		.row-form {
			padding: 8px;
		}
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__label,
		.el-form-item__content {
			font-size: 12px;
			line-height: 20px;
			height: 20px;
		}
		.el-input--mini .el-input__inner {
			line-height: 20px;
			height: 20px;
		}
		.so-tableinfo {
			.el-table__fixed-right::before,
			&.el-table::before {
				height: 0;
			}
			.el-table__empty-block {
				height: 20px !important;
				min-height: 20px !important;
				.el-table__empty-text {
					line-height: 20px !important;
				}
			}
			th {
				height: 24px;
				line-height: 16px;
				padding: 0;
				border-bottom: 0 !important;
			}
			td {
				padding: 2px 0;
			}
		}
		.el-collapse-item__content {
			padding-bottom: 10px;
			font-size: 12px;
		}
	}
	.hr {
		height: 1px;
		border: none;
		border-top: 1px solid #e9e9e9;
	}
	.edit-row .el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.edit-row .el-form-item__content {
		margin-right: 10px;
	}
	// .el-collapse-item__content > div > div {
	// 	margin: 0;
	// }
	#bkgEmployeeId {
		.el-select {
			width: calc(100% - 56px);
			input {
				border-top-right-radius: unset;
				border-bottom-right-radius: unset;
			}
		}
		button {
			border-left: unset;
			border-top-left-radius: unset;
			border-bottom-left-radius: unset;
		}
	}
	.el-collapse-item__header {
		height: 24px;
		line-height: 24px;
		padding: 0 0 0 8px;
		border-bottom: 0;
		font-weight: bold;
		font-size: 12px;
		&.is-active {
			border-bottom: 1px solid #e6ebf5;
		}
	}
	.row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 5px 8px 0;
		overflow: hidden;
		.row-cont-tit {
			background: rgba(248, 249, 253, 1);
			border-radius: 4px 4px 0px 0px;
			height: 24px;
			line-height: 24px;
			.tit {
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
				em{
					font-style: normal;
					color: #ff4949;
					font-weight: normal;
				}
			}
			.row-cont-rt {
				font-size: 12px;
				float: right;
				padding-right: 12px;
				.expand {
					margin-left: 15px;
					cursor: pointer;
				}
			}
		}
		.occupyCargo-form .row-flex.flex-cargo{
			margin-top: 10px;
    	overflow: hidden;
			.btn-minus-search, .btn-plus-search{
				float: right;
				margin-right: 6px;
				margin-top: 24px;
				margin-top: 2px;
			}
			
			.flex-item{
				float: left;
				width: 15.8%;
				display: flex;
				height: 20px;
				padding: 0 10px 0 10px;
				margin-bottom: 4px;
				&.is-required label::before {
					margin-right: 0;
				}
				.el-form-item__label, .item-label{
					font-size: 12px;
					width: 85px;
					padding-right: 4px;
					line-height: 20px;
					height: 20px;
					margin-bottom: 0;
					display: flex;
				}
				.item-label .lab{
					display: block;
					width: 100%;
					text-align: right;
				}
				.el-form-item__content, .item-content{
					flex: 1;
					line-height: 20px;
					height: 20px;
				}
				.el-input__icon{
					line-height: 20px;
					height: 20px;
				}
				&.cname{
					.el-form-item__label, .item-label{
						width: 60px;
					}
				}
				&.hscode{
					.el-form-item__label, .item-label{
						width: 70px;
					}
				}
			}
		}
	}
}
</style>
