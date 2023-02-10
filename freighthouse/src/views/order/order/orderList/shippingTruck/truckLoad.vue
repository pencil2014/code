<template>
	<div>
		<div class="component-cont table-com-layout" id="truckTable">
			<div class="mb10 between h20">
				<div class="ft12 bold">装货信息</div>
				<div class="el-button-group">
					<el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="isBd || isJoint || !isOpTruck ||isDisabledEdit" 
						btnText="新增" 
						:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
						class="operateBtn-tip ml10" 
						@click="handleAdd">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd || isJoint || !isOpTruck ||isDisabledEdit">新增</el-button> -->
				</div>
			</div>
			<el-table ref="table" fit border style="width: 100%" :data="list" :span-method="objectSpanMethod" class="border-table column-table mt10" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
				<el-table-column prop="intrustTruckType" label="派车类型" align="center" width="100">
					<template slot-scope="{ row }">
						{{ row.intrustTruckType | getDictLabelFilter('intrustTruckType') }}
					</template>
				</el-table-column>
				<el-table-column prop="shipperCustName" label="发货单位" align="center" width="120">
					<template slot-scope="scope">
						<div class="column-text">{{scope.row.shipperCustName}}</div>
					</template>
				</el-table-column>
				<el-table-column prop="boxContact" label="装货人" align="center" width="100"></el-table-column>
				<el-table-column label="装货地点" width="150" align="center">
					<template slot-scope="scope">
						<div class="column-text">{{ scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="boxAddress" label="装货详细地址" align="center" width="150">
					<template slot-scope="scope">
						<div class="column-text">{{scope.row.boxAddress}}</div>
					</template>
				</el-table-column>
				<el-table-column prop="preBoxTime" label="委托装柜时间" align="center" width="150">
					<template slot-scope="scope">
						{{scope.row.preBoxTime?scope.row.preBoxTime.substring(0,16):''}}
					</template>
				</el-table-column>
				<el-table-column prop="takePreTime" label="预计提柜时间" align="center" width="150"></el-table-column>
				<el-table-column prop="boxTime" label="实际到场时间" align="center" width="150"></el-table-column>
				<el-table-column prop="containerType" label="箱型" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.containerType }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="so" label="SO号" align="center" class-name="column" width="150">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.so }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="quantity" label="件数" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.quantity }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="weight" label="毛重" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.weight }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="volume" label="体积" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.volume }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="packageType" label="包装" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.packageType | packageTypeFilter }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="driverName" label="司机姓名" align="center" class-name="column">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.driverName }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="driverPhone" label="司机电话" align="center" class-name="column" width="120">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.driverPhone }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="licensePlate" label="车牌号" align="center" class-name="column" width="120">
					<template slot-scope="scope">
						<div class="column-table-td" v-for="item in scope.row.truckContainers" :key="item.oid">{{ item.licensePlate }}</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
							<ButtonTip
								btnType="text" 
								:btnDisabled="isBd || isJoint || !isOpTruck || isDisabledEdit" 
								btnText="删除" 
								:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
								class="operateBtn-tip" 
								btnClassName="red"
								@click="handleDelete(scope.row)">
							</ButtonTip>
							<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || isJoint || !isOpTruck ||isDisabledEdit">删除</el-button> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		</div>
		<!-- 详情 -->
		<div class="component-cont" id="truckDetail" v-if="showDetail">
			<div class="mb10 between h32 border-bt" id="saveBar">
				<div class="ft14">集卡装货信息</div>
				<div class="">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="isBd || isJoint || !isOpTruck || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
						class="operateBtn-tip ml10" 
						@click="handleSave">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || isJoint || !isOpTruck ||isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="mb10 between h32 border-bt isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<div class="ft14">集卡装货信息</div>
				<div class="">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="isBd || isJoint || !isOpTruck || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
						class="operateBtn-tip ml10" 
						@click="handleSave">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || isJoint || !isOpTruck ||isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<el-form :model="createItem" :rules="rules" ref="shippingTruckSave" class="row-flex truck-row" label-width="90px">
				<el-form-item label="" :show-message="false" class="flex-item" label-width="0px">
					<el-button size="mini" type="primary" @click="handleOpenSoInfoPop" style="width: 100%" :disabled="isBd || isJoint || !isOpTruck ||isDisabledEdit">关联委派信息</el-button>
				</el-form-item>
				<el-form-item label="派车类型" required prop="intrustTruckType" :show-message="false" class="flex-item">
					<el-select size="mini" v-model="createItem.intrustTruckType" style="width: 100%" placeholder="请选择">
						<el-option v-for="ele in intrustTruckTypeOptions" :key="ele.value" :label="ele.label" :value="ele.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item :required="!intrustTruckTypeIsBOX" label="预计提柜时间" prop="takePreTime" :show-message="false" class="flex-item">
					<elDatePickerLimit :field="'takePreTime'" size="mini" v-model="createItem.takePreTime" @change="preBoxTimeChange" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
				</el-form-item>

				<div class="flex-item truck-box-time" style="display:flex;">
					<!-- <elDatePickerLimit size="mini" v-model="createItem.preBoxTime" @change="preBoxTimeChange" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" /> -->
					<el-form-item class="pre-box-date" :required="intrustTruckTypeIsBOX" label="委托装柜时间" prop="preDate" :show-message="false">
						<elDatePickerLimit :field="'preDate'"  size="mini" @change="boxDateChange" v-model="createItem.preDate" type="date" clearable placeholder="日期" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item :required="intrustTruckTypeIsBOX" class="pre-box-time" prop="preTime" :show-message="false">
						<el-time-select
							style="width:100%;"
							@change="boxTimeChange"
							size="mini"
							v-model="createItem.preTime"
							:picker-options="{
								start: '00:00',
								step: '00:30',
								end: '24:00'
							}"
							clearable
							placeholder="时间"
							value-format="HH:mm"
						/>
					</el-form-item>
				</div>
				<el-form-item label="实际到场时间" prop="boxTime" class="flex-item">
					<elDatePickerLimit noCanFuture :field="'boxTime'" size="mini" v-model="createItem.boxTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
				</el-form-item>
				<el-form-item label="发货单位" prop="shipperCustid" :show-message="false" class="flex-item">
					<el-select v-model="createItem.shipperCustid" size="mini" clearable :filterable="true" @visible-change="custVisibleChange" :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
						<el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item :required="intrustTruckTypeIsBOX" label="装货人" prop="boxContact" :show-message="false" class="flex-item">
					<el-input size="mini" placeholder="请输入" v-model="createItem.boxContact" clearable></el-input>
				</el-form-item>
				<el-form-item :required="intrustTruckTypeIsBOX" label="装货人电话" prop="boxContactPhone" :show-message="false" class="flex-item">
					<el-input size="mini" placeholder="请输入" v-model="createItem.boxContactPhone" clearable></el-input>
				</el-form-item>
				<el-form-item :required="intrustTruckTypeIsBOX" label="装货地点" prop="loadPlace" :show-message="false" class="flex-item">
					<!-- <el-input size="mini" placeholder="请输入" v-model="createItem.boxArea" clearable></el-input> -->
					<el-cascader v-if="showCasPlace" style="width:100%" size="mini" :emitPath="true" v-model="createItem.loadPlace" :options="loadPlaceData" :props="cityProps" filterable clearable @change="handleRevChange"></el-cascader>
				</el-form-item>
				<el-form-item :required="intrustTruckTypeIsBOX" label="装货详细地址" prop="boxAddress" :show-message="false" class="flex-item" style="width: 100%">
					<div class="box-address-flex">
						<el-input size="mini" placeholder="请输入" v-model="createItem.boxAddress" clearable maxlength="512" show-word-limit class="box-address-input"></el-input>
						<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop">选择</el-button>
					</div>
				</el-form-item>
				<!-- <el-form-item label="司机姓名" prop="driverName" class="flex-item">
					<el-input size="mini" placeholder="请输入" v-model="createItem.driverName" clearable></el-input>
				</el-form-item>
				<el-form-item label="司机电话" prop="driverPhone" class="flex-item">
					<el-input size="mini" placeholder="请输入" v-model="createItem.driverPhone" clearable></el-input>
				</el-form-item>
				<el-form-item label="车牌号" prop="licensePlate" class="flex-item">
					<el-input size="mini" placeholder="请输入" v-model="createItem.licensePlate" clearable></el-input>
				</el-form-item> -->
				<el-form-item label="快捷输入" class="flex-item" style="width: 100%">
					<div class="quick-flex-class">
						<el-input class="quick-input" size="mini" placeholder="请依次输入装货人、装货人电话、装货详细地址，中文逗号隔开" v-model="quickInputModel" clearable></el-input>
						<el-button class="quick-btn" type="primary" size="mini" @click="handleQuickInput">填充</el-button>
					</div>
				</el-form-item>
			</el-form>
			<!-- 集装箱信息 -->
			<BindContainer :serviceType="'truck'" :isJoint="isJoint" :bindContainerList="createItem.truckContainers" @bind="handleBind" @cancelBind="handleCancelBind" />
		</div>
		<!-- 输出拖车委托单弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
		<!-- 关联委派信息弹窗 -->
		<div v-if="soInfoPopShow">
			<SoInfoPop @close="soInfoPopClose" />
		</div>
		<div v-if="addressPopShow">
			<AddressPop @close="addressPopClose"></AddressPop>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel, getDictMap } from '@/utils/tools'
import { baseSupplierList, fclTruckIntrustRegion } from '@/api/base'
import { customerInfo } from '@/api/crm/supplier'
import { fclTruckLoadList, fclTruckLoadDelete, fclTruckLoadSave, fclTruckIntrustUpdateBoxRemark } from '@/api/order/shippingTruck'
import BindContainer from './components/bindContainer'
import ExportPop from './components/exportPop'
import SoInfoPop from './components/soInfoPop'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'

const defaultQuery = {
	currPage: 1,
	pageSize: 30,
	query: [{ column: 'supplierName', type: 'default', value: '' }]
}
const defaultCreateQuery = {
	loadId: undefined,
	intrustNo: '',
	intrustTruckType: 'BOX',
	takePreTime: '',
	preBoxTime: '',
	preDate: '',
	preTime: '',
	boxTime: '',
	custName: '',
	shipperCustid: '',
	shipperCustName: '',
	boxContact: '',
	boxContactPhone: '',
	boxArea: '',
	boxAddress: '',
	truckContainers: [],
	// driverName: '',
	// driverPhone: '',
	// licensePlate: '',
	loadPlace: [],
	boxProvince: '',
	boxCity: '',
	boxDistrict: '',
	boxCountry:''
}

export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		},
		loadTypeFilter(loadType) {
			return getDictLabel('loadType', loadType)
		}
	},
	props: {
		truckDetailQuery: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		isOpTruckTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		},
		isJointTip: {
			type: String,
			default: ''
		},
		statusTip: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
			showCasPlace: true,
			isChina: true,
			soInfoPopShow: false, // 关联委派信息弹窗
			exportPopShow: false, // 输出弹窗
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			loadPlace: [],
			loadPlaceData: [],
			intrustTruckTypeOptions: [],
			oQuery: this.truckDetailQuery,
			list: [],
			loadIdSpanArr: [],
			showDetail: false,
			soContainerList: [],
			truckContainersShow: false,

			createItem: Object.assign({}, defaultCreateQuery),
			truckContainerItem: {
				oid: '',
				cn: '',
				sn: '',
				so: '',
				containerId: '',
				containerType: '',
				packageType: '',
				volume: '',
				weight: '',
				quantity: '',
				driverName: '',
				driverPhone: '',
				licensePlate: ''
			},
			// 发货单位下拉搜索
			custidOptions: [],
			type: '', // 保存类型,新增/编辑
			rules: {
				// preBoxTime: [{ required: true, message: '请选择委托装柜时间', trigger: 'change' }],
				// // shipperCustid: [{ required: true, message: '请选择发货单位', trigger: 'change' }],
				// boxContact: [{ required: true, message: '请填写装货人', trigger: 'blur' }],
				// boxContactPhone: [{ required: true, message: '请填写装货人电话', trigger: 'blur' }],
				// loadPlace: [{ required: true, message: '请填写装货地点', trigger: 'blur' }],
				// boxAddress: [{ required: true, message: '请填写装货详细地址', trigger: 'blur' }]
			},
			quickInputModel: '',
			addressPopShow: false
		}
	},
	created() {
		this.init()
		//获取省市区级联框数据
		this.getLoadPlaceData()
		this.intrustTruckTypeOptions = getDictMap('intrustTruckType')
	},
	activated() {
		// isUseCache为false时才重新刷新获取数据
		// 因为对OrderDetail使用keep-alive来缓存组件，所以默认是会使用缓存数据的
		if (!this.$route.meta.isUseCache) {
			this.$route.meta.isUseCache = true
			this.showDetail = false
			this.init()
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			// return this.ordDetRole === 'op'
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			// return this.ordDetRole === 'op_truck'
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		viewState() {
			return this.truckDetailQuery.action === 'view' && !this.isOp
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'truck')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' ? true : false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
		},
		intrustTruckTypeIsBOX() {
			return this.createItem.intrustTruckType === 'BOX'
		}
	},
	components: {
		BindContainer,
		ExportPop,
		SoInfoPop,
		AddressPop
	},
	watch: {
		truckDetailQuery: {
			handler(newVal, oldVal) {
				if (newVal) {
					this.getTruckLoadList()
					this.showDetail = false
				}
			},
			deep: true
		}
	},
	methods: {
		// 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
		boxTimeChange(val) {
			this.handleTime()
		},
		boxDateChange(val) {
			this.handleTime()
		},
		handleTime() {
			if (!this.createItem.preDate && !this.createItem.preTime) {
				return (this.createItem.preBoxTime = '')
			}
			if (!this.createItem.preDate) {
				this.createItem.preDate = '1900-01-01'
			}
			if (!this.createItem.preTime) {
				this.createItem.preTime = '00:00'
			}
			this.createItem.preBoxTime = `${this.createItem.preDate} ${this.createItem.preTime}`
			console.log('🚀 ~ this.createItem.preBoxTime', this.createItem.preBoxTime)
		},
		showAddressPop() {
			this.addressPopShow = true
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				this.createItem.boxContact = value.contactName || ''
				this.createItem.boxContactPhone = value.contactPhone || ''
				this.createItem.boxAddress = value.addressDetail
				console.log('🚀 ~ value.isChina', value.isChina)
				console.log('🚀 ~ this.isChina', this.isChina)
				this.showCasPlace = false
				if (!value.isChina) {
					this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
				} else {
					this.createItem.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
				}
				this.$nextTick(() => {
					this.showCasPlace = true
				})
				this.createItem.boxCountry = value.addressCountry
				this.createItem.boxProvince = value.addressProvince
				this.createItem.boxCity = value.addressCity
				this.createItem.boxDistrict = value.addressArea

				// // 国内省市区
				// if (this.isChina && value.isChina) {

				// }
				// // 国外国家到洲，有的数据只有国家没有洲
				// if (!this.isChina && !value.isChina) {
				// 	this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
				// 	this.createItem.boxCountry = value.addressCountry
				// 	this.createItem.boxProvince = value.addressProvince
				// }
			}
		},
		// 打开关联委派信息弹窗
		handleOpenSoInfoPop() {
			this.soInfoPopShow = true
		},
		soInfoPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.soInfoPopShow = false
				this.handleRelate(value)
			} else {
				this.soInfoPopShow = false
			}
		},
		handleRelate(row) {
			console.log('🚀 ~ row', row)
			this.createItem.intrustTruckType = row.intrustTruckType
			this.createItem.takePreTime = row.takePreTime
			this.createItem.preBoxTime = row.preBoxTime
			this.createItem.boxContact = row.boxContact
			this.createItem.boxContactPhone = row.boxContactPhone
			this.createItem.boxAddress = row.boxAddress
			this.createItem.boxCountry = row.boxCountry
			this.createItem.boxProvince = row.boxProvince
			this.createItem.boxCity = row.boxCity
			this.createItem.boxDistrict = row.boxDistrict
			// 处理委托装柜时间
			if (this.createItem.preBoxTime) {
				let preBoxTimeArr = this.createItem.preBoxTime.split(' ')
				if (preBoxTimeArr.length) {
					this.createItem.preDate = preBoxTimeArr[0]
					this.createItem.preTime = preBoxTimeArr[1]? preBoxTimeArr[1].substring(0,5):''
				}
			}
			//处理装货地点级联选择器
			if (row.boxCountry === '中国') {
				this.createItem.loadPlace = [row.boxCountry, row.boxProvince, row.boxCity, row.boxDistrict]
			} else {
				this.createItem.loadPlace = row.boxProvince ? [row.boxCountry, row.boxProvince] : [row.boxCountry]
			}

			// this.createItem.loadPlace = [row.boxCountry, row.boxProvince, row.boxCity, row.boxDistrict]
			// this.createItem.loadPlace = row.boxProvince ? [row.boxProvince, row.boxCity, row.boxDistrict] : []
			console.log('this.createItem', this.createItem)
		},
		handleCancelDetail() {
			this.$emit('hideDetail')
		},
		// 输出
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/truckIntrust/export',
					data: {
						orderNo: this.truckDetailQuery.orderNo,
						jointNo: this.truckDetailQuery.jointNo,
						oid: this.truckDetailQuery.oid,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `拖车委托单${this.truckDetailQuery.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 打开输出弹窗
		handleOpenExportPop() {
			this.exportPopShow = true
		},
		submitRemark() {
			fclTruckIntrustUpdateBoxRemark({
				oid: this.truckDetailQuery.oid,
				boxRemark: this.truckDetailQuery.boxRemark
			}).then(res => {
				this.$message.success('修改成功!')
			})
		},

		preBoxTimeChange(val) {
			console.log('🚀 ~ val', val)
		},
		//装货地点省市区
		handleRevChange(val) {
			this.createItem.boxCountry = val[0] || ''
			this.createItem.boxProvince = val[1] || ''
			this.createItem.boxCity = val[2] || ''
			this.createItem.boxDistrict = val[3] || ''

			// this.createItem.boxProvince = val[0] || ''
			// this.createItem.boxCity = val[1] || ''
			// this.createItem.boxDistrict = val[2] || ''
			console.log('🚀 ~ this.loadPlace', this.createItem.loadPlace)
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		//获取省市区数据
		async getLoadPlaceData() {
			// let res = await getDomesticCity({ firstCode: '00002057' })
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
		},

		init() {
			this.getTruckLoadList()
		},
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
      */

			this.loadIdSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.loadIdSpanArr.push(1) //loadIdSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是loadIdSpanArr的索引
				} else {
					// 判断日期当前元素与上一个元素是否相同
					if (data[i].loadId === data[i - 1].loadId) {
						this.loadIdSpanArr[this.pos] += 1
						this.loadIdSpanArr.push(0)
					} else {
						this.loadIdSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.loadIdSpanArr)
		},
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 发货单位、装货人、装货地点、装货详细地址、委托装柜时间、操作列需合并
			if ([0, 1, 2, 3, 4, 11].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.loadIdSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},

		// 车队配载列表
		getTruckLoadList() {
			fclTruckLoadList({
				orderNo: this.truckDetailQuery.orderNo,
				jointNo: this.truckDetailQuery.jointNo,
				intrustNo: this.truckDetailQuery.intrustNo
			}).then(res => {
				let { data } = res
				this.list = data
				if (data && data.length) {
					this.getSpanArr(this.list)
				}
			})
		},

		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val) {
			if (val) {
				this.getCustList()
			}
		},
		handleSelectCustid(val) {
			if (val) {
				let custItem = this.custidOptions.find(item => item.value === val)
				this.createItem.shipperCustName = custItem ? custItem.label : ''
				//根据发货单位反显装货数据
				customerInfo({ custid: val }).then(res => {
					let { contact } = res.data
					if (contact && contact.length) {
						Object.assign(this.createItem, {
							boxContact: contact[0].name,
							boxContactPhone: contact[0].mobileNo,
							// boxArea: contact[0].address
							boxProvince: contact[0].boxProvince,
							boxCity: contact[0].boxCity,
							boxDistrict: contact[0].boxDistrict,
							loadPlace: contact[0].boxProvince ? [contact[0].boxProvince, contact[0].boxCity, contact[0].boxDistrict] : []
						})
						console.log('选择了发货单位后的装货地点：', this.createItem.loadPlace)
					}
				})
			} else {
				Object.assign(this.createItem, {
					boxContact: '',
					boxContactPhone: '',
					// boxArea: ''
					boxProvince: '',
					boxCity: '',
					boxDistrict: '',
					loadPlace: [],
					shipperCustName: ''
				})
			}
		},

		// 获取发货单位
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list
				this.custidOptions = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},

		// 返回
		goBack() {
			this.$router.go(-1)
		},

		// 新增
		handleAdd() {
			this.type = 'create'
			// if (this.showDetail) return
			Object.assign(this.createItem, {}, defaultCreateQuery)
			this.showDetail = true
		},

		// 处理绑定集装箱的数据
		handleBind(value) {
			// this.createItem.truckContainers = value.map(item => {
			// 	for (let i in this.truckContainerItem) {
			// 		if (i !== 'oid') {
			// 			this.truckContainerItem[i] = item[i]
			// 			if (i === 'containerId') {
			// 				this.truckContainerItem[i] = item.oid
			// 			}
			// 			if (i === 'packageType') {
			// 				this.truckContainerItem[i] = item.packageInfo
			// 			}
			// 		}
			// 	}
			// 	return Object.assign({}, this.truckContainerItem)
			// })
			let containers = value.map(item => {
				for (let i in this.truckContainerItem) {
					if (i !== 'oid') {
						this.truckContainerItem[i] = item[i]
						if (i === 'containerId') {
							this.truckContainerItem[i] = item.oid
						}
						if (i === 'packageType') {
							this.truckContainerItem[i] = item.packageInfo
						}
					}
				}
				return Object.assign({}, this.truckContainerItem)
			})
			this.createItem.truckContainers = [...this.createItem.truckContainers, ...containers]
		},

		// 处理取消绑定集装箱的数据
		handleCancelBind(rowIndex) {
			this.createItem.truckContainers = this.createItem.truckContainers.filter((item, index) => {
				return rowIndex != index
			})
			console.log(this.createItem.truckContainers)
		},

		// 箱子校验
		validate(values) {
			// let reg = /^\d+(\.\d+)?$/, numberReg = /^[0-9]+$/
			// if (values.some(item => !numberReg.test(item.quantity))) {
			//   this.$message({type: 'error', message: '请填写正确的件数'})
			//   return false
			// }
			// if (values.some(item => item.quantity < 1)) {
			//   this.$message({type: 'error', message: '件数不能小于1'})
			//   return false
			// }
			// if (values.some(item => !reg.test(item.weight))) {
			//   this.$message({type: 'error', message: '请填写正确的毛重'})
			//   return false
			// }
			// if (values.some(item => !reg.test(item.volume))) {
			//   this.$message({type: 'error', message: '请填写正确的体积'})
			//   return false
			// }
			// if (values.some(item => !item.packageType)) {
			//   this.$message({type: 'error', message: '包装不能为空'})
			//   return false
			// }
			return true
		},

		// 取消
		handleCancel() {
			this.showDetail = false
		},

		// 新增保存
		handleSave() {
			this.$refs.shippingTruckSave.validate(valid => {
				if (valid) {
					let data = { ...this.createItem }
					data.truckContainers.forEach(item => {
						!item.oid && delete item.oid
					})
					if (!this.validate(this.createItem.truckContainers)) return

					fclTruckLoadSave(
						Object.assign(data, {
							intrustNo: this.truckDetailQuery.intrustNo,
							orderNo: this.truckDetailQuery.orderNo,
							jointNo: this.truckDetailQuery.jointNo
						})
					).then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.getTruckLoadList()
								this.showDetail = false
							}
						})
					})
				} else {
					console.log('submit Error')
					return false
				}
			})
		},

		// 取消关联集装箱
		handleCancelBind(rowIndex) {
			this.createItem.truckContainers = this.createItem.truckContainers.filter((item, index) => {
				return rowIndex != index
			})
			console.log(this.createItem.truckContainers)
		},

		// 详情
		handleInfo(row) {
			console.log('🚀 ~ row', row)
			this.type = 'edit'
			this.showDetail = true
			for (let i in this.createItem) {
				this.createItem[i] = row[i]
			}
			// 处理委托装柜时间
			if (this.createItem.preBoxTime) {
				let preBoxTimeArr = this.createItem.preBoxTime.split(' ')
				if (preBoxTimeArr.length) {
					this.createItem.preDate = preBoxTimeArr[0]
					this.createItem.preTime = preBoxTimeArr[1]? preBoxTimeArr[1].substring(0,5):''
				}
			}
				//处理装货地点级联选择器
			if (row.boxCountry === '中国') {
				this.createItem.loadPlace = [row.boxCountry, row.boxProvince, row.boxCity, row.boxDistrict]
			} else {
				this.createItem.loadPlace = row.boxProvince ? [row.boxCountry, row.boxProvince] : [row.boxCountry]
			}
			// this.createItem.loadPlace = row.boxProvince ? [row.boxProvince, row.boxCity, row.boxDistrict] : []
			this.custidOptions = [{ label: row.shipperCustName, value: row.shipperCustid }]
			console.log('this.createItem', this.createItem)
		},

		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return fclTruckLoadDelete({ loadId: row.loadId, orderNo: this.truckDetailQuery.orderNo, jointNo: this.truckDetailQuery.jointNo })
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.createItem.loadId === row.loadId) {
						this.showDetail = false
					}
					this.getTruckLoadList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		handleQuickInput() {
			let arr = this.quickInputModel.split('，')
			this.createItem.boxContact = arr[0] || ''
			this.createItem.boxContactPhone = arr[1] || ''
			this.createItem.boxAddress = arr[2] || ''
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
.truck-box-time {
	.el-form-item {
		margin-bottom: 4px;
	}

	.pre-box-date {
		flex: 2;
	}
	.pre-box-time {
		flex: 1;
		.el-form-item__content {
			margin-left: 10px !important;
		}
	}
}

.el-row.between {
	.item {
		display: block;
		margin-right: 3.5%;
		margin-bottom: 15px;
		// flex: 1;
	}
}
.column-table {
	// border: 1px solid #e8e8e8;
	// height: 32px;
	// line-height: 32px;
	padding: 0 !important;
}
.edit-container .component-cont .row-flex.truck-row .flex-item {
	width: 25%;
	margin-bottom: 4px;
	.box-address-flex {
		display: flex;
		display: flex;
		.box-address-input {
			flex: 1;
		}
		.box-address-btn {
			margin-left: 5px;
			width: 50px;
		}
	}
}
.edit-container .component-cont .row-flex.truck-row .flex-item .el-form-item__label {
	padding-right: 4px;
}
// .edit-container .component-cont .row-flex.truck-row .flex-item .el-form-item__content{
// 	margin-right: 10px;
// }
#truckDetail .between {
	&.isFixed {
		position: fixed;
		background-color: #fff;
		z-index: 999;
		padding: 5px 20px;
		height: 30px;
		box-shadow: 4px 0px 10px 0px #e9e9e9;
		top: 24px;
		// top: 64px;
		right: 0;
		.tit {
			line-height: 20px;
		}
	}
}
.quick-flex-class {
	display: flex;
	.quick-input {
		flex: 1;
	}
	.quick-btn {
		margin-left: 5px;
		width: 50px;
	}
}
</style>
