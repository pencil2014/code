<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createSoForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="createSo-form">
			<el-row>
				<el-col :span="6">
					<el-form-item label="派车类型" required prop="intrustTruckType" :show-message="false">
						<el-select style="width: 100%" size="mini" v-model="createItem.intrustTruckType" placeholder="请选择">
							<el-option v-for="ele in intrustTruckTypeOptions" :key="ele.value" :label="ele.label" :value="ele.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="soInfo-tit">
				<div class="tit">SO信息</div>
				<div class="operate">
					<el-button type="primary" size="mini" @click="addSo" v-if="soOptions.length !== createItem.soInfoList.length">添加箱型箱量</el-button>
				</div>
			</div>
			<div class="so-container-list" v-for="(item, index) in createItem.soInfoList" :key="index">
				<div class="so-list">
					<el-row style="width: 100%">
						<el-col :span="6">
							<el-form-item label="SO号" required>
								<el-select size="mini" v-model="item.so" style="width: 100%" clearable placeholder="请选择" @visible-change="val => visibleChangeSo(val, item)" @change="handleChangeSo(item)">
									<el-option v-for="ele in soOptions" :key="ele.value" :label="ele.label" :value="ele.value" :disabled="ele.disabled"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="14">
							<el-form-item label="箱型箱量" :required="intrustTruckTypeIsBOX">
								<div class="containerType-list" v-for="(ele, sIndex) in item.containerInfo" :key="sIndex">
									<el-select size="mini" v-model="ele.containerType" style="width: 80px" clearable placeholder="请选择" @visible-change="val => visibleChangeContainerType(val, ele, item)" @change="val => handleChangeContainerType(val, ele, item)">
										<el-option v-for="o in item.containerTypeOptions" :key="o.containerType" :label="o.containerType" :value="o.containerType" :disabled="o.disabled"> </el-option>
									</el-select>
									<span class="range">*</span>
									<el-input clearable size="mini" placeholder="请输入" v-model.number="ele.num" style="width: 78px" @blur="handleValidateNum(ele)"></el-input>
									<template v-if="ele.containerType === '20GP'">
										<span style="margin-left:10px;padding:0 4px;font-size:12px;color:red;">*</span>
										<span style="font-size:12px;">是否孖拖</span>
										<el-select @change="val => handleChangeTwinDrag(val, ele)" size="mini" v-model="ele.isTwinDrag" style="width: 80px;margin-left:4px;" clearable placeholder="请选择">
											<el-option v-for="item in yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<el-select size="mini" v-model="ele.boxPosition" style="width: 80px;margin-left:4px;" clearable placeholder="请选择">
											<el-option v-for="item in boxPositions" :key="item.value" :label="item.label" :value="item.value"></el-option>
										</el-select>
									</template>

									<i class="el-icon-circle-plus-outline" v-if="showAddContainer(sIndex, item)" @click="handleAddContainerType(item)"></i>
									<i class="el-icon-remove-outline" v-if="showRemoveContainer(sIndex, item)" @click="handleDeleteContainerType(item, sIndex)"></i>
								</div>
							</el-form-item>
						</el-col>

						<el-col :span="4" style="text-align:right;">
							<el-button type="text" class="red" size="mini" @click="handleDeleteSo(index)" v-if="index">删除</el-button>
						</el-col>
					</el-row>
				</div>
			</div>
			<div class="soInfo-tit">
				<div class="tit">装货信息</div>
			</div>
			<el-row class="mt10" v-if="!intrustTruckTypeIsBOX">
				<el-col :span="6">
					<el-form-item label="预计提柜时间" prop="takePreTime" required :show-message="false">
						<elDatePickerLimit :field="'takePreTime'" size="mini" v-model="createItem.takePreTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row class="mt10" v-if="intrustTruckTypeIsBOX">
				<el-col style="display:flex;" :span="6">
					<el-form-item label="委托装柜时间" prop="boxDate" required :show-message="false">
						<elDatePickerLimit :field="'preDate'" size="mini" @change="boxDateChange" v-model="createItem.boxDate" type="date" style="width: 110px;" clearable placeholder="日期" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item class="pre-box-time" prop="boxTime" required :show-message="false">
						<el-time-select
							@change="boxTimeChange"
							size="mini"
							v-model="createItem.boxTime"
							:picker-options="{
								start: '00:00',
								step: '00:30',
								end: '24:00'
							}"
							style="width: 80px;"
							clearable
							placeholder="时间"
							value-format="HH:mm"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="装货人" prop="boxContact" required :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.boxContact" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="装货人电话" prop="boxContactPhone" required :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.boxContactPhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="装货地点" prop="loadPlace" required :show-message="false">
						<el-cascader
							v-if="showCasPlace"
							filterable
							style="width:100%"
							size="mini"
							:emitPath="true"
							v-model="createItem.loadPlace"
							:options="loadPlaceData"
							:props="cityProps"
							clearable
							@visible-change="visibleChangePlace"
							@change="handleRevChange"
						></el-cascader>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="装货详细地址" prop="boxAddress" required :show-message="false">
						<div class="box-address-flex">
							<el-input size="mini" placeholder="请输入" v-model="createItem.boxAddress" clearable maxlength="512" show-word-limit class="box-address-input"></el-input>
							<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop">选择</el-button>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="木质包装" prop="isWoodenPackage" required :show-message="false">
						<el-select size="mini" v-model="createItem.isWoodenPackage" style="width: 100%" clearable placeholder="请选择">
							<el-option v-for="item in yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="是否过磅" prop="isWeighted" required :show-message="false">
						<el-select size="mini" v-model="createItem.isWeighted" style="width: 100%" clearable placeholder="请选择">
							<el-option v-for="item in yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="预计货重(KG)" prop="weight" required :show-message="false">
						<el-input @blur="weightBlur('weight', '预计货重', createItem.weight)" size="mini" placeholder="请输入" v-model="createItem.weight" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="是否危险品" prop="isDangerous">
						<el-select v-model="createItem.isDangerous" size="mini" clearable placeholder="请选择" style="width: 100%">
							<el-option v-for="(item, index) in isDangerousOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报关方式" prop="customsType" :show-message="false">
						<el-select size="mini" v-model="createItem.customsType" style="width: 100%" clearable placeholder="请选择">
							<el-option v-for="item in dictMap.customsType" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="意向供应商" prop="customsSupplierId" :show-message="false">
						<el-select size="mini" filterable remote v-model="createItem.customsSupplierId" style="width: 100%" :remote-method="supplierFilterMehod" @change="supplierChange" clearable placeholder="请选择">
							<el-option v-for="item in supplierOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="买单意向价格" prop="customsPrice" :show-message="false">
						<el-input size="mini" v-model="createItem.customsPrice" placeholder="请输入" style="width: 60%;" clearable @blur="inputBlur('customsPrice')"></el-input>
						<el-select size="mini" v-model="createItem.customsUnit" style="width: 40%;" clearable placeholder="币种">
							<el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="委派备注" prop="remark" :show-message="false">
						<el-input size="mini" placeholder="如果有名牌，手册报关，拼报请在装柜前告知，包柜请在装柜前提供大致箱单，以便所有货物能正常出运" v-model="createItem.remark" clearable maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="快捷输入">
						<div class="quick-flex-class">
							<el-input class="quick-input" size="mini" placeholder="请依次输入装货人、装货人电话、装货详细地址，中文逗号隔开" v-model="quickInputModel" clearable></el-input>
							<el-button class="quick-btn" type="primary" size="mini" @click="handleQuickInput">填充</el-button>
						</div>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div v-if="addressPopShow">
			<AddressPop @close="addressPopClose"></AddressPop>
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
import { blDeliveryCancel } from '@/api/order/bl'
import { fclTruckIntrustRegion, baseCurrencyList } from '@/api/base'
import { orderBookInfo, containerSoList } from '@/api/order/list'
import { orderAddressRegion } from '@/api/order/address'
import { randomString } from '@/utils'
import { getDictMap } from '@/utils/tools'
import { supplierList } from '@/api/crm/supplier'

const defaultCreate = {
	isDangerous: '',
	customsSupplierId: '',
	customsSupplierName: '',
	customsPrice: '',
	customsUnit: '',
	intrustTruckType: 'BOX',
	takePreTime: '',
	preBoxTime: '',
	boxDate: '',
	boxTime: '',
	boxContact: '',
	boxContactPhone: '',
	boxAddress: '',
	isWoodenPackage: '',
	customsType: '',
	isWeighted: '',
	weight: '',
	remark: '',
	loadPlace: [],
	boxProvince: '',
	boxCity: '',
	boxDistrict: '',
	soInfoList: [
		{
			so: '',
			containerInfo: [
				{
					containerType: '',
					num: '',
					isTwinDrag: '', //是否孖拖
					boxPosition: ''
				}
			],
			containerTypeOptions: []
		}
	]
}

export default {
	data() {
		return {
			showCasPlace: true,
			boxPositions: [
				{ label: '柜子摆前', value: '柜子摆前' },
				{ label: '柜子摆中', value: '柜子摆中' },
				{ label: '柜子摆尾', value: '柜子摆尾' }
			],
			isDangerousOptions: [
				{ label: '是', value: 'yes' },
				{ label: '否', value: 'no' }
			],
			supplierOptions: [],
			currencyList: [],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '新增委派信息',
				show: true,
				size: 'medium',
				width: '1120px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {},
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			soOptions: [],
			intrustTruckTypeOptions: [],
			containerInfo: [],
			defaultContainerItem: { containerType: '', num: '' },
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			loadPlace: [],
			loadPlaceData: [],
			containerTypesArr: [],
			soErrorMsg: '',
			quickInputModel: '',
			addressPopShow: false,
			isChina: true
		}
	},
	props: {},
	created() {
		// 箱型箱量默认为空
		this.createItem.soInfoList = [
			{
				so: '',
				containerInfo: [{ containerType: '', num: '' }],
				containerTypeOptions: [],
				isTwinDrag: '', //是否孖拖
				boxPosition: '' //柜子摆前 摆中 摆尾
			}
		]
		//获取省市区级联框数据
		this.getLoadPlaceData()
		this.getSoList()
		this.intrustTruckTypeOptions = getDictMap('intrustTruckType')
		console.log('派车类型数据字典', this.intrustTruckTypeOptions)
		this.getCurrencyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		intrustTruckTypeIsBOX() {
			return this.createItem.intrustTruckType === 'BOX'
		}
	},
	watch: {},
	components: {
		BaseDialog,
		AddressPop
	},
	methods: {
		visibleChangePlace(val) {
			console.log('🚀 ~ val', val)

			console.log('🚀 ~ this.createItem.loadPlace', this.createItem.loadPlace)

			console.log('🚀 ~ this.loadPlaceData', this.loadPlaceData)
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
				// 	this.createItem.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
				// 	this.createItem.boxCountry = value.addressCountry
				// 	this.createItem.boxProvince = value.addressProvince
				// 	this.createItem.boxCity = value.addressCity
				// 	this.createItem.boxDistrict = value.addressArea
				// }
				// // 国外国家到洲，有的数据只有国家没有洲
				// if (!this.isChina && !value.isChina) {
				// 	this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
				// 	this.createItem.boxCountry = value.addressCountry
				// 	this.createItem.boxProvince = value.addressProvince
				// }
			}
		},
		supplierFilterMehod(val) {
			if (val) {
				const data = {
					currPage: 1,
					pageSize: 10,
					descColumns: ['supplierId'],
					query: [
						{ column: 'serviceCode', type: 'eq', value: 'pol_declaration' },
						{ column: 'name', type: 'like', value: val }
					],
					verifyStatus: 'all'
				}
				supplierList(data).then(res => {
					if (res.data.list) {
						this.supplierOptions = res.data.list.map(item => {
							return {
								label: item.name,
								value: item.supplierId
							}
						})
					}
				})
			}
		},
		supplierChange(val) {
			let obj = this.supplierOptions.find(item => {
				return item.value === val
			})
			this.createItem.customsSupplierName = (obj && obj.label) || ''
		},
		getCurrencyList(queryString) {
			// 币别下拉列表
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		inputBlur(param) {
			if (param === 'customsNumber') {
				let numberReg = /^[0-9]+$/
				if (this.createItem[param] && !numberReg.test(this.createItem[param])) {
					this.$message({ type: 'error', message: '正报几票请输入数字' })
					this.createItem[param] = ''
				}
			} else if (param === 'customsPrice') {
				if (this.createItem[param] && !Number(this.createItem[param])) {
					this.$message({ type: 'error', message: '买单意向价格请输入数字' })
					this.createItem[param] = ''
				} else if (this.createItem[param] && Number(this.createItem[param])) {
					this.createItem[param] = Number(this.createItem[param]).toFixed(2)
				}
			}
		},
		weightBlur(param, text, val) {
			if (!val || !Number(val)) {
				this.$message.error('请输入' + text + '，且不能为0')
				this.createItem[param] = ''
			} else {
				let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
				if (!reg.test(val)) {
					if (isNaN(val)) {
						this.$message.error(text + '必须是数字')
						this.createItem[param] = ''
					} else {
						this.$message.error(text + '小数点最多3位')
						this.createItem[param] = Number(val).toFixed(3)
					}
				} else if (val > 999999999) {
					this.createItem[param] = 999999999
					this.$message.error(text + '请输入0-999999999的数字')
				}
			}
		},
		// 显示隐藏箱型箱量+号按钮,sIndex-so对应的箱型箱量的array索引，index-so的array索引
		showAddContainer(sIndex, item) {
			let result = false
			// 超过1个箱型箱量显示+号，索引为0的显示+号，添加的箱型箱量数量和箱型下拉的数组长度相等在索引为0不显示+号
			if (!sIndex && item.containerTypeOptions.length > 1 && item.containerTypeOptions.length !== item.containerInfo.length) {
				result = true
			}
			return result
		},
		// 显示隐藏箱型箱量减号按钮
		showRemoveContainer(sIndex, item) {
			let result = false
			// 超过1个箱型箱量显示减号，添加的箱型箱量数量和箱型下拉的数组长度相等在索引为0显示减号
			if (sIndex || (!sIndex && item.containerTypeOptions.length > 1 && item.containerTypeOptions.length === item.containerInfo.length)) {
				result = true
			}
			return result
		},
		getSoList() {
			// 获取so列表
			containerSoList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.soOptions = res.data.map(item => {
					let containerInfo = item.containerInfo.split('+')
					return { ...item, label: item.so, value: item.so, containerInfo, disabled: false }
				})
				// console.log('this.soOptions', this.soOptions)
			})
		},
		// 箱型箱量下拉框出现
		visibleChangeSo(val, item) {
			// 下拉展开
			if (val && this.soOptions) {
				// 选中过的so存入一个数组中
				let soArr = []
				soArr = this.createItem.soInfoList.map(item => item.so)
				// console.log(soArr)
				// 之前选过的禁选
				this.soOptions = this.soOptions.map(item => {
					item.disabled = false
					if (soArr.includes(item.so)) {
						item.disabled = true
					}
					return Object.assign({ ...item })
				})
			}
		},
		// 选择so带出箱型箱量
		handleChangeSo(item) {
			// console.log('item', item)
			let findItem = this.soOptions.find(ele => ele.so === item.so)
			// 获取so号对应的箱型下拉数组
			item.containerTypeOptions = findItem ? findItem.containerInfo : []
			if (item.containerTypeOptions.length) {
				item.containerTypeOptions = item.containerTypeOptions.map(ele => {
					let tempArr = ele.split('*')
					return { containerType: tempArr[0], num: tempArr[1], disabled: false }
				})
			}
			// 切换so号，选择的箱型箱量默认带出来
			item.containerInfo = [
				{
					containerType: item.containerTypeOptions[0]['containerType'],
					num: item.containerTypeOptions[0]['num']
				}
			]
			// console.log('item.containerTypeOptions', item.containerTypeOptions)
		},
		// 箱型箱量下拉框出现
		handleChangeTwinDrag(val, item) {
			console.log(val, item)
			console.log('🚀 ~ this.createItem.soInfoList', this.createItem.soInfoList)
		},
		// 箱型箱量下拉框出现
		visibleChangeContainerType(val, ele, item) {
			// console.log(val, ele);

			console.log('🚀 ~ item.containerTypeOptions', item.containerTypeOptions)
			// 下拉展开
			if (val) {
				if (item.containerTypeOptions.length) {
					// 选中过的箱型存入一个数组中
					this.containerTypesArr = []
					this.containerTypesArr = item.containerInfo.map(item => item.containerType)
					// console.log(this.containerTypesArr)
					// 之前选过的箱型禁选
					item.containerTypeOptions = item.containerTypeOptions.map(item => {
						item.disabled = false
						if (this.containerTypesArr.includes(item.containerType)) {
							item.disabled = true
						}
						return Object.assign({ ...item })
					})
				}
			}
		},
		// 选择箱型获取箱量值
		handleChangeContainerType(val, ele, item) {
			console.log(item.containerInfo, item.containerTypeOptions, val)
			let findItem = item.containerTypeOptions.find(o => o.containerType === val)
			let onum = findItem ? findItem.num : ''
			Object.assign(ele, { onum, num: onum })
		},
		handleValidateNum(ele) {
			if (ele.num > ele.onum) {
				ele.num = ele.onum
				return this.$message({ type: 'error', message: '最大不能超过' + ele.onum })
			}
		},
		// 增加箱型箱量
		handleAddContainerType(item) {
			item.containerInfo.push({ containerType: '', num: '' })
		},
		// 删除箱型箱量
		handleDeleteContainerType(item, sIndex) {
			item.containerInfo = item.containerInfo.filter((o, index) => index !== sIndex)
		},
		//获取省市区数据
		async getLoadPlaceData() {
			let res = await orderAddressRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
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
		// 添加一组so
		addSo() {
			this.createItem.soInfoList.push({
				so: '',
				containerInfo: [{ containerType: '', num: '' }],
				containerTypeOptions: []
			})
		},
		// 删除一组so箱型箱量
		handleDeleteSo(sIndex) {
			this.createItem.soInfoList = this.createItem.soInfoList.filter((item, index) => index !== sIndex)
		},
		boxTimeChange(val) {
			this.createItem.preBoxTime = `${this.createItem.boxDate} ${this.createItem.boxTime}`
			console.log('🚀 ~ this.createItem.preBoxTime', this.createItem.preBoxTime)
		},
		boxDateChange(val) {
			this.createItem.preBoxTime = `${this.createItem.boxDate} ${this.createItem.boxTime}`
			console.log('🚀 ~ this.createItem.preBoxTime', this.createItem.preBoxTime)
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		getParmasData() {
			if (this.intrustTruckTypeIsBOX) {
				// 装柜
				return Object.assign({}, this.createItem, {
					takePreTime: ''
				})
			} else {
				// 预提柜
				return Object.assign({}, defaultCreate, {
					intrustTruckType: this.createItem.intrustTruckType,
					takePreTime: this.createItem.takePreTime,
					soInfoList: this.createItem.soInfoList
				})
			}
		},
		checkSoInfo() {
			let check = true
			let len = this.createItem.soInfoList.length
			for (var i = 0; i < len; i++) {
				if (!this.createItem.soInfoList[i].so) {
					check = false
					this.soErrorMsg = '请选择SO号'
					break
				}
				if ((this.createItem.soInfoList[i].containerInfo || []).some(item => !item.containerType)) {
					check = false
					this.soErrorMsg = '请选择箱型'
					break
				}
				if ((this.createItem.soInfoList[i].containerInfo || []).some(item => !item.num)) {
					check = false
					this.soErrorMsg = '请输入箱量，且不能为0'
					break
				}
				// 验证孖拖
				if ((this.createItem.soInfoList[i].containerInfo || []).some(item => item.containerType === '20GP' && !item.isTwinDrag)) {
					check = false
					this.soErrorMsg = '请选择是否孖拖'
					break
				}
				// 验证柜子摆尾
				if ((this.createItem.soInfoList[i].containerInfo || []).some(item => item.containerType === '20GP' && !item.boxPosition)) {
					check = false
					this.soErrorMsg = '请选择柜子位置'
					break
				}
			}
			return check
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createSoForm.validate(valid => {
					if (valid) {
						console.log('createItem.soInfoList', this.createItem.soInfoList)
						if (!this.checkSoInfo()) {
							return this.$message.error(this.soErrorMsg)
						}
						let createTime = new Date().getTime()
						// 添加createTime参数，做单元格合并判断用
						let data = this.getParmasData()
						this.close('Confirm', {
							...data,
							createTimeStr: createTime,
							mergeId: createTime + '' + randomString()
						})
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
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
.createSo-form {
	padding: 0;
	.pre-box-time {
		.el-form-item__content {
			margin-left: 10px !important;
		}
	}
}
.createSo-form .soInfo-tit {
	font-size: 12px;
	line-height: 20px;
	display: flex;
	justify-content: space-between;
}
.createSo-form .so-container-list {
	display: flex;
	margin: 8px 0;
}
.createSo-form .so-container-list .so-list {
	width: 100%;
	display: flex;
	padding: 4px 0 0;
}
.so-list {
	border-radius: 2px;
	border: 1px solid #e9e9e9;
}
.createSo-form .soInfo-tit .tit {
	font-size: 12px;
	line-height: 20px;
	font-weight: bold;
}
.createSo-form .soInfo-tit .el-button--mini {
	line-height: 20px;
}
.createSo-form .el-form-item {
	margin-bottom: 4px;
}
.createSo-form .containerType-list {
	// display: inline-block;
	/* margin-left: 8px; */
	margin-bottom: 4px;
}
.createSo-form .range {
	display: inline-block;
	width: 20px;
	text-align: center;
}

.createSo-form .el-icon-circle-plus-outline,
.createSo-form .el-icon-remove-outline {
	font-size: 15px;
	margin-left: 5px;
}
.createSo-form .el-form-item__label {
	padding-right: 5px;
	line-height: 20px;
	/* height: 20px; */
}
.createSo-form .el-form-item__content {
	line-height: 20px;
	/* height: 20px; */
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
</style>
