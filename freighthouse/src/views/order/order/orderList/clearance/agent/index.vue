<template>
	<div class="edit-row agent" id="agent" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div id="tableCont">
			<template v-if="orderInfoData.businessType === 'ship_export_fcl'">
				<div class="remark-container">
					<div class="remark-tit-row">
						<span class="tit">委派信息</span>
						<div class="operate">
							<ButtonTip
								btnType="primary" 
								:btnDisabled="!isOp || isFinish || !IntrustTableData.length || pushDisabled || isDisabledEdit" 
								btnText="推送关务操作" 
								:tipContent="isOpTip || isFinishTip || IntrustListTip || statusTip" 
								class="operateBtn-tip ml10" 
								@click="handlePush">
							</ButtonTip>
							<!-- <el-button type="primary" size="mini" class="ml10" @click="handlePush" :disabled="!isOp || isFinish || !IntrustTableData.length || pushDisabled || isDisabledEdit">推送关务操作</el-button> -->
							<ButtonTip
								btnType="primary" 
								:btnDisabled="!isOp || isFinish || isDisabledEdit" 
								btnText="新增委派" 
								:tipContent="isOpTip || isFinishTip || statusTip" 
								class="operateBtn-tip ml10" 
								@click="handleCreate">
							</ButtonTip>
							<!-- <el-button type="primary" size="mini" class="ml10" @click="handleCreate" :disabled="!isOp || isFinish || isDisabledEdit">新增委派</el-button> -->
							<span class="expand ml10" @click="handleToogleExpand"> {{ remarkShow ? '收起' : '展开' }}<i :class="remarkShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
						</div>
					</div>
					<IntrustTable :isFinish="isFinish" :isDisabledEdit="isDisabledEdit" :isOpTip="isOpTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :tableData="IntrustTableData" @delete="handleDeleteServiceInfo" v-if="remarkShow"></IntrustTable>
				</div>
			</template>
			<!-- 报关信息  -->
			<DefaultTableComp ref="defaultTableComp" class="agent-table table-com-layout" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick">
				<template>
					<ButtonTip
						btnType="default" 
						:btnDisabled="noPermit || isDisabledEdit" 
						btnText="输出报关委托单" 
						:tipContent="noPermitTip || isFinishTip || statusTip || isJointTip" 
						class="operateBtn-tip mr10" 
						@click="handleOut">
					</ButtonTip>
					<!-- <el-button size="mini" type="default" :disabled="noPermit || isDisabledEdit" class="mr10" @click="handleOut">输出报关委托单</el-button> -->
					委托状态：
					<el-select @change="changeStatus" v-model="intrustStatus" placeholder="请选择" size="mini" style="width: 100px;" :disabled="noPermit || isDisabledEdit">
						<el-option v-for="item in intrustStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</template>
			</DefaultTableComp>
		</div>
		<!-- 报关详情 -->
		<AgentDetail v-if="showDetail" :isJoint="isJoint" :isDisabledEdit="isDisabledEdit" :noPermitTip="noPermitTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :isJointTip="isJointTip" :oid="oid" :newIntrustNo="intrustNo" :orderInfoData="orderInfoData" @callBack="detailCallBack" :saveBarFixed="saveBarFixed" />
		<!-- 报关单输出弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
		<!-- 创建委派信息弹窗 createShow -->
		<div v-if="createShow">
			<Create :IntrustTableData="IntrustTableData" @close="createPopClose" />
		</div>
		<!-- 设置拖柜参与人 -->
		<div v-if="opTruckPopShow">
			<opTruckPop @close="opTruckPopClose" :bdDeptCode="bdDeptCode" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { mixin } from '../mixin'
import { handleData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import IntrustTable from './components/intrustList'
import Create from './components/create'
import opTruckPop from './components/opTruckPop'
import { getCustomsList, deleteCustoms, saveCustoms, updateIntrustStatus, getIntrustDoc, getIntrustNo, remarkInfo, remarkSave, serviceInfoList, serviceInfoSave, serviceInfoDelete, customsPushToOpTruck, addTruckOp } from '@/api/order/list'
import AgentDetail from './components/agentDetail'
import ExportPop from './components/exportPop'
import { deleteAlert } from '@/utils/tools'
import { getDictMap, getDictLabel } from '@/utils/tools'

export default {
	mixins: [mixin],
	data() {
		return {
			oQuery: this.$route.query,
			showDetail: false, // 显示委托详情
			oid: '',
			tableInfo: {
				title: '报关信息',
				titleBtnList: [{ label: '新增委托', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ intrustNo }) {
						return intrustNo ? true : false
					}
				},
				columns: handleData.agentColumn, //  表格显示的表头
				list: [],
				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row)
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},
						// {
						//   label: '输出',
						//   type: 'text',
						//   show: true,
						//   action: 'Out'
						// },
						{
							label: '删除',
							type: 'text',
							btnClassName: 'red',
							show: true,
							disabled: (item, row) => {
								// || row.intrustStatus === 'intrusted'
								if (this.noPermit  || this.isDisabledEdit) {
									return true
								}
								return false
							},
							action: 'Delete'
						}
					]
				},

				// 操作提示
				tips: {
					text: '',
					show: false
				},

				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			intrustNo: '',
			intrustStatusList: getDictMap('customsIntrustStatus') || [], // 委托状态
			intrustStatus: '', // 委托状态值
			progress: 'notStarted', // 报关进度
			exportPopShow: false, // 输出弹窗
			exportId: null,
			serviceCode: 'pol_declaration',
			IntrustTableData: [], //委派信息列表
			remark: '', // 委派备注
			remarkShow: true, // 委派信息默认展开
			createShow: false, // 新增委派信息弹窗
			createPopValue: {},
			opTruckPopShow: false,
			pushDisabled: false, 
			isSetOpTruck: false, // 是否设置过拖报人员
			btnType: ''
		}
	},
	created() {
		this.init()
		this.getServiceInfoList()
		this.getRemark()
	},
	mounted() {},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		orderInfoData: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			finCloseStatusCanEdit: state => state.order.finCloseStatusCanEdit,
		}),
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
			return isBd || this.isJoint
		},
		// shipCustomsDisabled(){
		// 	if (this.orderInfoData.businessType.includes('customs)) {
		// 		if(this.userEditRoles.includes('op_truck')){
		// 			return false
		// 		}else{
		// 			return true
		// 		}
		// 	}else{
		// 		return false
		// 	}
		// },
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		opTruckId() {
			let { workAssign, jointWorkAssign, serviceInfoList } = this.orderInfoData
			let id = ''
			// 协同参与人或是有协同服务项
			if (jointWorkAssign && jointWorkAssign.length) {
				let serviceItem = serviceInfoList.find(item => item.serviceCode === 'pol_declaration')
				let jointWorkItem = jointWorkAssign.find(item => item.jobCode === 'op_customs')
				if (serviceItem) {
					id = serviceItem.opEmployeeId
				} else if (jointWorkItem) {
					id = jointWorkItem.employeeId
				}
			} else {	// 主单的拖报参与人
				let item = workAssign && workAssign.find((el) => el.jobCode === 'op_customs')
				if (item && item.employeeId) {
					id = item.employeeId
				}
			}
			return id
    },
		bdDeptCode() {
      let { workAssign } = this.orderInfoData
      let item = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (item && item.deptCode) {
        return item.deptCode
      }
      return ''
    },
		opId() {
      let { workAssign } = this.orderInfoData
      let item = workAssign && workAssign.find((el) => el.jobCode === 'op')
      if (item && item.employeeId) {
        return item.employeeId
      }
      return ''
    },
		isJoint() {
			let findItem = this.tabMenus.find(item => item.code === 'pol_declaration')
			return findItem ? findItem.isJoint : false
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pol_declaration')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			}else if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)){
				return true
			}else{
				return false
			}
		},
		noPermit() {
			// 整箱-op_truck
			if (this.orderInfoData.businessType === 'ship_export_fcl') {
				return this.isBd || !this.isOpTruck
			}
			// 散杂滚装、散货-op,op_truck
      if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
        return this.isBd || !this.isOp && !this.isOpTruck
      }
			// 报关单、关务操作
      if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfoData.businessType)) {
        return !this.isOpTruck
      }
		},
		isOpTip() {
			if (!this.isOp) {
				return '非该单操作人员，不允许操作'
			}
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		IntrustListTip() {
			if (!this.IntrustTableData.length) {
				return '委派信息暂无数据，不允许操作'
			}
		},
		statusTip() {
			// 放开已关账、已完成的限制
			// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)) {
				return '订单状态为已取消、已完成，或是已关账，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isOpTruckTip() {
			if (!this.isOpTruck) {
				return '非该单拖报操作、仓储操作人员，不允许操作'
			}
		},
		noPermitTip() {
			// 整箱-op_truck
			if (this.orderInfoData.businessType === 'ship_export_fcl') {
				if (this.isBd || !this.isOpTruck) {
					return '非该单拖报操作、仓储操作人员，关务操作，不允许操作'
				}
			}
			// 散杂滚装、散货-op,op_truck
      if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
				if (!this.isOp && !this.isOpTruck) {
					return '非该单拖报操作、仓储操作、操作人员，不允许操作'
				}
      }
			// 报关单、关务操作
      if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfoData.businessType)) {
        if (!this.isOpTruck) {
					return '非该单关务操作人员，不允许操作'
				}
      }
		}
	},
	components: {
		DefaultTableComp,
		AgentDetail,
		ExportPop,
		IntrustTable,
		Create,
		opTruckPop
	},
	methods: {
		handlePush() {
			console.log('this.opTruckId', this.opTruckId);
			this.btnType = 'handlePush'
			// 服务项被协同的直接去推送
      if (!this.opTruckId && !this.isSetOpTruck && !this.isJoint) {
        // 订单还未设置拖柜操作的参与人
        this.opTruckPopShow = true
        return
      }
      this.pushToOpTruck()
		},
		pushToOpTruck() {
			// 推送关务操作
			this.pushDisabled = true
			customsPushToOpTruck({ 
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			})
			.then(res => {
				this.pushDisabled = false
				this.$message.success('推送成功')
			})
			.catch(() => {
				this.pushDisabled = false
			})
		},
		// 新增委派
		handleCreate() {
			this.createShow = true
		},
		createPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.btnType = 'created'
				if (!this.opTruckId && !this.isSetOpTruck && !this.isJoint) {
					this.createPopValue = value
					this.opTruckPopShow = true
				} else {
          this.handleServiceInfoSave(value)
				}
			} else {
				this.createShow = false
			}
		},
	  opTruckPopClose(action, value) {
			if (action === 'Confirm') {
        this.updataOpTruck(value)
      }
      this.opTruckPopShow = false
		},
		updataOpTruck(value) {
      let params = {
        employeeId: value,
        orderNo: this.$route.query.orderNo,
				jobCode: 'op_customs'
      }
      addTruckOp(params).then((res) => {
        this.$message.success('设置拖报人员成功')
				if (this.btnType === 'handlePush') {
					// 直接点击推送关务操作的
           if (value !== this.opId) {
							this.$confirm('是否继续推送给关务操作人员?', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									this.pushToOpTruck()
								})
								.catch(() => {})
						}
				} else {
					  // 新增后的
            this.handleServiceInfoSave(this.createPopValue)
				}
				this.isSetOpTruck = true
      })
    },
		// 删除委派信息
		handleDeleteServiceInfo(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						groupKey: row.groupKey,
						orderNo: this.$route.query.orderNo,
						serviceCode: this.serviceCode
					}
					serviceInfoDelete(data).then(res => {
						this.$message({ type: 'success', message: '删除成功' })
						this.getServiceInfoList()
					})
				})
				.catch(() => {})
		},
		// 保存委派信息
		handleServiceInfoSave(value) {
			console.log(value)
			let data = {
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				infoData: value
			}
			serviceInfoSave(data).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				this.createShow = false
				if (this.opTruckId !== this.opId) {
          this.$confirm('是否继续推送给关务操作人员?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.pushToOpTruck()
            })
            .catch(() => {})
        }
				this.getServiceInfoList()
			})
		},
		handleToogleExpand() {
			this.remarkShow = !this.remarkShow
		},
		// 获取so列表
		getRemark() {
			remarkInfo({ orderNo: this.$route.query.orderNo, serviceCode: this.serviceCode }).then(res => {
				this.remark = res.data.remark
			})
		},
		handleSaveRemark() {
			remarkSave({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				remark: this.remark
			}).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
			})
		},
		// 获取委派信息列表
		getServiceInfoList() {
			serviceInfoList({ orderNo: this.$route.query.orderNo, serviceCode: this.serviceCode }).then(res => {
				this.IntrustTableData = res.data || []
				this.IntrustTableData.forEach(item => {
					let fileName = []
					let fileNo = []
					let typeCode = []
					let typeName = []
					if (item.fileNo) {
             fileName = item.fileName.split(',')
						 fileNo = item.fileNo.split(',')
				     typeCode = item.typeCode.split(',')
					   typeName = item.typeName.split(',')
					}
					
					let fileList = []
					fileName.forEach((ele, index) => {
						fileList.push({ fileName: fileName[index], fileNo: fileNo[index], typeCode: typeCode[index], typeName: typeName[index] })
					})
					item.fileList = fileList
				})
				// console.log('this.intrustTableData', this.IntrustTableData)
			})
		},
		// 获取so列表
		init() {
			this.getList()
			this.tableConfig.operationBtns.data.map(item => {
				item.action === 'Delete' &&
					Object.assign(item, {
						disabled: this.noPermit  || this.isDisabledEdit ? true : false,
						tipContent: this.noPermitTip || this.isFinishTip || this.statusTip || this.isJointTip
					})
				return { ...item }
			})
			this.tableInfo.titleBtnList.map(item => {
				Object.assign(item, {
					hide: this.noPermit || this.isDisabledEdit ? true : false,
					tipContent: this.noPermitTip || this.isFinishTip || this.statusTip || this.isJointTip
				})
			})
		},
		getList() {
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			this.lsLoading = true
			getCustomsList(data).then(res => {
				this.tableConfig.list =
					(res.data &&
						res.data.map(item => {
							item.customsTypeLabel = getDictLabel('customsType', item.customsType)
							item.customsIntrustStatusLabel = getDictLabel('customsIntrustStatus', item.intrustStatus)
							item.isReleaseStr = item.isRelease === 'Y' ? '是' : item.isRelease === 'N' ? '否' : ''
							return item
						})) ||
					[]
				console.log(this.tableConfig.list)
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 委托详情
		handleInfo(row) {
			this.showDetail = true
			this.intrustNo = ''
			this.oid = row.oid
		},
		// 输出报关单
		handleOut() {
			let selectedCheckbox = this.$refs.defaultTableComp.selectedCheckbox
			if (selectedCheckbox.length !== 1) {
				return this.$message({ message: '请勾选一条报关信息', type: 'warning' })
			}
			this.exportPopShow = true
			this.exportId = selectedCheckbox[0].oid
		},
	
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
        this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/customs/export',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.exportId,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `报关委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},

		// 委托删除
		handleDelete(row) {
			deleteAlert(this, deleteCustoms, { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			this.showDetail = false
			this.getList()
		},
		// table 回调函数 新增委托、委托完成
		tableClick(type) {
			if (type == 'add') {
				// 新增获取报关委托单号
				getIntrustNo().then(res => {
					this.intrustNo = res.data.serialNo
					this.oid = ''
					this.showDetail = true
				})
			} else if (type == 'update') {
				let oid = this.$refs.defaultTableComp.selectedCheckbox.map(item => item.oid)
				if (!oid.toString()) {
					this.$message({ message: '请勾选报关信息', type: 'warning' })
					return false
				}
				updateIntrustStatus({ oid: oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
					this.$message({
						type: 'success',
						message: '状态修改成功'
					})
				})
			}
		},

		// 报关委托详情回调函数
		detailCallBack(data) {
			console.log('data', data)
			if (data.type == 'cancel') {
				this.showDetail = false
			} else if (data.type == 'save') {
				this.handleSave(data.list)
			}
		},
		validate(data) {
			console.log(data)
			let numberReg = /^[0-9]+$/
			if (data.customsNumber && !numberReg.test(data.customsNumber)) {
				this.$message({ type: 'error', message: '正报几票请输入数字' })
				return false
			}
			if (!data.customsType) {
				this.$message({ type: 'error', message: '报关方式不能为空' })
				return false
			}
			if (!data.customsSupplierId) {
				this.$message({ type: 'error', message: '报关行不能为空' })
				return false
			}
			if (data.isRelease==='Y' && !data.releaseTime) {
				this.$message({ type: 'error', message: '报关放行时间不能为空' })
				return false
			}
			if(!data.customsDeclarationList){
				this.$message({ type: 'error', message: '请关联委托单' })
				return false
			} else{
				if (data.isPayTaxes==='Y') {
					if(!Array.isArray(data.customsDeclarationList)){
						this.$message({ type: 'error', message: '请关联报关委托单中的商品信息' })
						return false
					}
					if(!data.customsDeclarationList.every(el=>el.customsCargoList&&el.customsCargoList.length>0)){
						this.$message({ type: 'error', message: '请关联报关委托单中的商品信息' })
						return false
					}
				}
			}
			
			// if (!data.declarant) {
			//   this.$message({type: 'error', message: '报关员姓名不能为空'})
			//   return false
			// }
			// if (!data.declarantPhone) {
			//   this.$message({type: 'error', message: '报关员电话不能为空'})
			//   return false
			// }
			return true
		},
		// 保存
		handleSave(data) {
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			if (!this.validate(data)) return
			saveCustoms(data).then(res => {
				this.getList()
				this.$message({
					type: 'success',
					message: '保存成功'
				})
				this.showDetail = false
			})
		},

		// 修改委托状态
		changeStatus(value) {
			let oids = this.$refs.defaultTableComp.selectedCheckbox.map(item => item.oid)
			if (!oids.toString()) {
				this.intrustStatus = ''
				this.$message({ message: '请勾选报关信息', type: 'warning' })
				return false
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return updateIntrustStatus({
						oids: oids,
						intrustStatus: value,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '状态修改成功！',
						duration: 1000,
						onClose: () => {
							this.intrustStatus = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.intrustStatus = ''
				})
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
#agent {
	.remark-container {
		background-color: #fff;
		margin-top: 8px;
		.remark-tit-row {
			display: flex;
			justify-content: space-between;
			height: 20px;
			line-height: 20px;
			padding: 0 20px;
			// border-bottom: 1px solid #e6ebf5;
			.tit {
				display: block;
				font-weight: bold;
				font-size: 12px;
			}
			.operate {
				.expand {
					cursor: pointer;
				}
			}
		}
		.remark-row {
			padding: 8px 20px;
			overflow: hidden;
		}
	}
	.operateBtn-tip{
		padding: 0; 
		display: inline-block;
	}
}
.edit-container .agent .agent-table .row-tit {
	border-bottom: unset !important;
	padding: 0 20px;
	line-height: 20px;
	height: 20px;
	margin-top: 8px;
	margin-bottom: 4px;
}
.edit-container .agent .agent-table .row-tit .tit {
	line-height: 20px;
	height: 20px;
	font-size: 12px;
}
.progress span {
	font-size: 12px;
}
.delete-class {
	color: #CD4130;
}
</style>
