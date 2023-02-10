<template>
	<div class="rail-shipper">
		<div class="so-total">
			<div v-if="createItem.serviceType === 'st08'" class="lcl-total-wrap">
				<span class="quantityTotal">件数合计：{{ quantityTotal }} </span>
				<span class="weightTotal">毛重合计：{{ weightTotal }} KGS</span>
				<span class="volumeTotal">体积合计：{{ volumeTotal }} CBM</span>
			</div>

			<el-button size="mini" type="primary" style="float: right;" :disabled="viewState" @click="handelAddSo">新增发货单位</el-button>
		</div>

		<el-form-item id="so-list-form" class="so-row-cont" v-for="(o, index) in createItem.shipperList" :key="index" prop="">
			<div class="row-cont-tit">
				<span class="tit">货物信息</span>
				<div class="row-cont-rt">
					<el-button size="mini" type="text" class="ml10" :disabled="viewState || o.orderNo != $route.query.orderNo" @click="handleDeleteSo(index)" v-if="index > 0">删除<i class="el-icon-close"></i></el-button>
					<span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
				</div>
			</div>
			<div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
				<div v-if="o.orderNo != $route.query.orderNo" class="rail-shipper-title">
					拼箱的工作号：<span @click="handleInfo(o.orderNo)">{{ o.orderNo }}</span>
				</div>
				<div class="row-flex flex-so">
					<div class="railway-send-cargo-content">
						<el-form-item :prop="`shipperList.${index}.shipperCustid`" class="unit-item" label="发货单位" :show-message="false" :rules="{ required: true, message: '请选择发货单位', trigger: 'change' }">
							<el-select
								style="width:100%;"
								v-model="o.shipperCustid"
								size="mini"
								clearable
								remote
								:filterable="true"
								@visible-change="val => custVisibleChange(val, index, o.shipperCustid)"
								:remote-method="val => custFilterMehod(val, index)"
								placeholder="请选择"
								:disabled="viewState || o.orderNo != $route.query.orderNo"
							>
								<el-option v-for="(item, index) in o.shipperCustidOptions || []" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="unit-item" label="件数">
							<el-input size="mini" v-model="o.quantity" clearable placeholder="请输入" :disabled="viewState || o.orderNo != $route.query.orderNo" @blur="validateQuantityNum(o)"></el-input>
						</el-form-item>
						<el-form-item class="unit-item" label="毛重">
							<el-input size="mini" v-model="o.weight" clearable placeholder="请输入" :disabled="viewState || o.orderNo != $route.query.orderNo" @blur="validateWeight(o)">
								<template slot="append">KGS</template>
							</el-input>
						</el-form-item>
						<el-form-item class="unit-item" label="体积">
							<el-input size="mini" v-model="o.volume" clearable placeholder="请输入" :disabled="viewState || o.orderNo != $route.query.orderNo" @blur="validateVolume(o)">
								<template slot="append">CBM</template>
							</el-input>
						</el-form-item>
						<el-form-item class="unit-item" label="包装">
							<el-select size="mini" v-model="o.packageInfo" style="width: 100%" clearable placeholder="请选择" :disabled="viewState || o.orderNo != $route.query.orderNo" filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</div>
					<div style="opacity:0;" class="rail-shipper-btn">
						<div class="btn-minus-search"></div>
						<div class="btn-plus-search"></div>
					</div>
				</div>
				<el-form class="row-flex flex-so" v-for="(item, sIndex) in o.cargoList" :key="sIndex" :model="createItem.shipperList[index]" ref="containerList">
					<div class="railway-send-cargo-content">
						<el-form-item class="unit-item" label="HS Code" :prop="`cargoList.${sIndex}.hscode`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
							<el-tooltip v-if="viewState || o.orderNo != $route.query.orderNo" class="item" effect="dark" :content="item.hscode" placement="top">
								<el-select size="mini" v-model="item.hscode" style="width: 100%" placeholder="请选择海关编号" disabled>
									<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-tooltip>
							<el-select
								v-else
								style="width:100%;"
								size="mini"
								v-model="item.hscode"
								remote
								filterable
								clearable
								placeholder="请选择海关编号"
								:disabled="viewState || o.orderNo != $route.query.orderNo"
								@change="handleChangeHscode"
								:remote-method="val => queryCargoHscode(val)"
							>
								<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="unit-item cname-ename" label="中文品名" :prop="`cargoList.${sIndex}.cname`" :show-message="false" :rules="[{ required: true, trigger: 'blur' }]">
							<el-tooltip v-if="viewState || o.orderNo != $route.query.orderNo" class="item" effect="dark" :content="item.cname" placement="top">
								<el-input size="mini" v-model="item.cname" clearable placeholder="请输入中文品名" disabled></el-input>
							</el-tooltip>
							<el-input v-else maxlength="1024" size="mini" v-model="item.cname" clearable placeholder="请输入" :disabled="viewState || o.orderNo != $route.query.orderNo"></el-input>
						</el-form-item>
						<el-form-item class="unit-item cname-ename" label="英文品名" :prop="`cargoList.${sIndex}.ename`" :show-message="false" :rules="[{ required: true, trigger: 'blur' }]">
							<el-tooltip v-if="viewState || o.orderNo != $route.query.orderNo" class="item" effect="dark" :content="item.ename" placement="top">
								<el-input size="mini" v-model="item.ename" placeholder="请输入英文品名" disabled></el-input>
							</el-tooltip>
							<el-input v-else maxlength="1024" clearable size="mini" v-model="item.ename" placeholder="请输入" :disabled="viewState || o.orderNo != $route.query.orderNo"></el-input>
						</el-form-item>
						<el-form-item class="unit-item" label="货品分类" :prop="`cargoList.${sIndex}.commodityTypeCode`" :show-message="false">
							<el-select size="mini" v-model="item.commodityTypeCode" style="width: 100%" filterable clearable placeholder="请选择货品分类" :disabled="viewState || o.orderNo != $route.query.orderNo">
								<el-option v-for="item in commodityTypeCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="unit-item" label="装箱要求" :prop="`cargoList.${sIndex}.boxRemark`" :show-message="false" :rules="[{ required: true, trigger: 'blur' }]">
							<el-input maxlength="512" clearable size="mini" v-model="item.boxRemark" @focus="handleClear(o)" @blur="handleBlur(o)" placeholder="无装箱要求填无" :disabled="viewState || o.orderNo != $route.query.orderNo"> </el-input>
						</el-form-item>
					</div>

					<div :style="{ opacity: o.orderNo != $route.query.orderNo ? 0 : 1 }" class="rail-shipper-btn">
						<div class="btn-minus-search" @click="handleDeleteContainerList(index, sIndex)" v-if="sIndex > 0 && !viewState"></div>
						<div class="btn-plus-search" @click="handleAddContainerList(o.cargoList)" v-if="!viewState"></div>
					</div>
				</el-form>
			</div>
		</el-form-item>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { soList } from '@/api/railway/book/list'
import { cargoHscodeList, cargoTypeList, cargoUnnoList } from '@/api/base'

export default {
	data() {
		return {
			quantityTotal: '',
			weightTotal: '',
			volumeTotal: '',
			hscodeOptions: [], // hscode下拉数据
			shipperCustidOptions: [], // 发货单位下拉数据
			commodityTypeCodeOptions: [] // 货品分类下拉数据
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		}
	},
	created() {
		this.queryCargoTypeList()
		this.queryCargoHscode({ keyword: '' })
		// this.fillCustid(this.createItem.shipperList)
	},
	mounted() {
		setTimeout(() => {
			console.log('🚀 ~ this.roles', this.roles)
		}, 3000)
	},

	computed: {
		...mapState('railway', ['ordDetRole', 'userEditRoles']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles,
			userId: state => state.user.userId
		}),
		viewState() {
			if (!this.ordDetRole) {
				return true
			}
			if (this.isOp || this.isEpricing || this.isEcs) {
				return true
			}
			// bd角色，草稿和拒绝状态的可以编辑，除了草稿和拒绝状态的都置灰，只读
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			if (this.isPricing) {
				return true
			}
			// op角色，审核通过的可以编辑，除了审核通过的都置灰，只读
			if (this.isBkg && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		}
	},
	watch: {
		'createItem.shipperList': {
			handler(val) {
				this.quantityTotal = val.reduce((sum, cur) => {
					return sum + Number(cur.quantity)
				}, 0)
				this.weightTotal = val.reduce((sum, cur) => {
					return sum + Number(cur.weight)
				}, 0)
				this.volumeTotal = val.reduce((sum, cur) => {
					return sum + Number(cur.volume)
				}, 0)
			},
			deep: true,
			immediate: true
		}
	},
	components: {},
	methods: {
		// 去详情页
		async handleInfo(orderNo) {
			console.log('🚀 ~ this.createItem', this.createItem)
			let action = ''
			// 业务除草稿和拒绝状态都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(this.createItem.orderStatus)) {
				action = 'view'
			}
			// 操作角色非审核通过都不可编辑
			if (this.isOp && !['pass'].includes(this.createItem.orderStatus)) {
				action = 'view'
			}
			this.isJumpRouteFromPage = true
			let isSameCode = await this.$store.dispatch('railway/getValueByKeys', { custid: this.createItem.main.custid })
			let routeUrl = this.$router.resolve({
				name: 'RailwayOrderDetail',
				params: {
					orderNo: orderNo
				},
				query: {
					orderNo: orderNo,
					source: 'orderList',
					action: action,
					showBl: ['st07', 'st08'].includes(this.createItem.serviceType),
					showRelate: isSameCode && ['st07'].includes(this.createItem.serviceType) && (this.isPricing || this.isOp)
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 发货单位回显
		fillCustid(cargoList) {
			cargoList.map(item => {
				if (item.shipperCustid === 0) item.shipperCustid = ''
				item.shipperCustid && this.shipperCustidOptions.push({ value: item.shipperCustid, label: item.shipperCustName })
			})
			// 去重
			this.shipperCustidOptions = new Set(this.shipperCustidOptions)
			this.shipperCustidOptions = Array.from(this.shipperCustidOptions)
		},
		custFilterMehod(val, index) {
			val !== undefined && this.getCustList(val, index)
		},
		custVisibleChange(val, index, custid) {
			if (val) {
				!custid && this.getCustList('', index)
			}
		},
		// 获取发货单位
		getCustList(val = '', index) {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
				this.$set(this.createItem.shipperList[index], 'shipperCustidOptions', list)
			})
		},

		// 移除焦点未填写装箱特殊要求默认设置为无
		handleBlur(o) {
			o.boxRemark = o.boxRemark || '无'
		},
		// 获取焦点清除默认的无
		handleClear(o) {
			if (o.boxRemark === '无') o.boxRemark = ''
		},
		// 货品分类
		queryCargoTypeList() {
			cargoTypeList().then(response => {
				this.commodityTypeCodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.chapterName,
						value: item.chapterCode
					})
				})
			})
		},
		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString &&
				cargoHscodeList({ keyword: queryString }).then(response => {
					this.hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
				})
		},
		handleChangeHscode(val) {
			if (!val) this.hscodeOptions = []
		},

		// 箱型箱量展开收起
		handleToogleExpand(index) {
			let { containerListShowState } = this.createItem.shipperList[index]
			this.$set(this.createItem.shipperList[index], 'containerListShowState', !containerListShowState)
		},

		// 增加一组so
		handelAddSo() {
			this.createItem.shipperList.push({
				orderNo: this.$route.query.orderNo,
				shipperCustid: '',
				shipperCustName: '',
				quantity: '',
				weight: '',
				volume: '',
				cargoList: [
					{
						oid: '',
						commodityTypeCode: '',
						hscode: '',
						cname: '',
						ename: '',
						boxRemark: '无'
					}
				]
			})
		},

		// 删除一组so
		handleDeleteSo(index) {
			this.createItem.shipperList = this.createItem.shipperList.filter((item, sIndex) => {
				return index !== sIndex
			})
		},

		// 增加一行箱型箱量
		handleAddContainerList(data) {
			data.push({
				oid: '',
				commodityTypeCode: '',
				hscode: '',
				cname: '',
				ename: '',
				boxRemark: '无'
			})
		},

		// 删除一行箱型箱量
		handleDeleteContainerList(i, index) {
			let cargoList = this.createItem.shipperList[i].cargoList
			this.createItem.shipperList[i].cargoList = cargoList.filter((item, sIndex) => {
				return sIndex !== index
			})
		},

		// 箱量校验
		checkContainerNum(rule, value, callback) {
			if (!Number.isInteger(value)) {
				callback(new Error('请输入数字值'))
			} else {
				if (value <= 0) {
					callback(new Error('请输入正整数'))
				} else {
					callback()
				}
			}
		},
		validateContainerNum(item) {
			const intReg = /^[0-9]\d*$/
			if (!intReg.test(item.containerNum) && item.containerNum) {
				item.containerNum = ''
				return this.$message.error('请输入数字值')
			}
			if (item.containerNum > 200) {
				item.containerNum = 200
				this.$message.error('最大不能超过200')
			}
		},
		validateQuantityNum(item) {
			const intReg = /^[0-9]\d*$/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.error('请输入正确的件数,只能输入整数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},
		checkNum(rule, value, callback) {
			if (!Number.isInteger(value)) {
				callback(new Error('请输入数字值'))
			} else {
				if (value <= 0) {
					callback(new Error('请输入正整数'))
				} else {
					callback()
				}
			}
		},
		validateNum(item, val) {
			const intReg = /^[0-9]\d*$/
			if (!intReg.test(item[val]) && item[val]) {
				item[val] = ''
				let message = ''
				switch (val) {
					case 'specialLength':
						message = '特种长'
						break
					case 'specialHeight':
						message = '特种高'
						break
					case 'specialWidth':
						message = '特种宽'
						break
					default:
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
		},
		checkTemprature(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
			console.log(item)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入数字'))
			} else {
				callback()
			}
		},
		validateTemprature(item, val) {
			const reg = /^\-?[0-9]\d*\.?\d*$/
			if (!reg.test(item[val]) && item[val]) {
				item[val] = ''
				let message = '温度'
				if (val === 'airMete') message = '通风量'
				return this.$message.error(`请输入正确的${message}`)
			}
		},
		checkWeight(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
			console.log(item, value)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入数字'))
			} else {
				callback()
			}
		},
		validateWeight(item) {
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.weight) && item.weight) {
				item.weight = ''
				return this.$message.error('请输入正确的毛重,最多包含三位小数')
			}
			if (item.weight > 53000) {
				item.weight = 53000
				this.$message.error('最大不能超过53000')
			}
		},
		checkVolume(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
			console.log(item)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的数字'))
			} else if (Number(value) > 100) {
				callback(new Error('请输入100内数字'))
			} else {
				callback()
			}
		},
		validateVolume(item) {
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.volume) && item.volume) {
				item.volume = ''
				return this.$message.error('请输入正确的体积,最多包含三位小数')
			}
			if (item.volume > 100) {
				item.volume = 100
				this.$message.error('最大不能超过100')
			}
		},
		validatePoint(item, val) {
			const reg = /^\d+(\.\d+)?$/
			if (item[val] && !reg.test(item[val])) {
				item[val] = ''
				return this.$message.error('请输入正确数字')
			}
		}
	}
}
</script>

<style lang="scss">
.rail-shipper {
	margin-top: 10px;
	padding-right: 0;

	#so-list-form .el-form-item__content {
		margin-right: 0 !important;
	}
	.so-total {
		margin: 0 8px;
		line-height: 20px;
		height: 20px;
		overflow: hidden;
		.lcl-total-wrap {
			display: inline-block;
			span {
				display: inline-block;
				&.quantityTotal {
					width: 200px;
					margin-left: 10px;
				}
				&.weightTotal {
					width: 200px;
					margin-left: 10px;
				}
				&.volumeTotal {
					width: 200px;
					margin-left: 10px;
					// flex: 1;
				}
			}
		}
	}
	.so-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 4px 8px 0;
		overflow: hidden;
		&.margin0 {
			margin: 0;
		}
		&.mt10 {
			margin-top: 10px;
		}
		.row-cont-tit {
			background: rgba(248, 249, 253, 1);
			border-radius: 4px 4px 0px 0px;
			height: 32px;
			line-height: 32px;
			.tit {
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
			}
			.delete {
				font-size: 20px;
				margin-right: 10px;
				margin-top: 6px;
				color: #999;
				cursor: pointer;
			}
			.row-cont-rt {
				font-size: 12px;
				float: right;
				padding-right: 12px;
				.el-checkbox {
					.el-checkbox__label {
						font-size: 12px;
					}
				}
				.expand {
					margin-left: 15px;
					cursor: pointer;
				}
			}
		}
		.rail-shipper-title {
			padding-left: 15px;
			font-size: 12px;
			span {
				color: #1890ff;
				cursor: pointer;
			}
		}
		.row-flex {
			display: flex;
			&.flex-so {
				padding-top: 0;
				zoom: 1;
				.railway-send-cargo-content {
					flex: 1;
					
					display: flex;
					flex-wrap: wrap;

					.unit-item {
						// flex: 1;
						width: 20%;
						display: flex;
						margin-bottom: 4px;
						.el-form-item__label {
							width: 75px !important;
							flex-shrink: 0;
						}
						.el-form-item__content {
							flex: 1;
							display: flex;
							align-items: center;
						}
					}
					.cname-ename{
						width: 40%;
					}
				}
				.rail-shipper-btn {
					width: 50px;
					margin-left: 10px;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					.btn-minus-search,
					.btn-plus-search {
						display: inline-block;
						margin-right: 6px;
					}
				}
				&:last-child {
					border-bottom: 0;
				}

				.btn-minus-search,
				.btn-plus-search {
					margin-top: 0;
				}
				.btn-plus-search {
					margin-right: 0;
				}
			}
			&.flex-so::after {
				display: block;
				clear: both;
				content: '';
				visibility: hidden;
				height: 0;
			}

			.flex-item {
				width: 25%;
				padding: 0 10px 0 10px;
				margin-bottom: 4px;
				float: left;
				.item-label {
					font-size: 12px;
					line-height: 20px;
					height: 20px;
					margin-bottom: 0;
					display: flex;
					// justify-content: space-between;
					span {
						display: block;
					}
					.lab {
						display: flex;
						em {
							font-style: normal;
						}
					}
				}
			}
		}
		.el-input--suffix .el-input__inner {
			padding-right: 20px;
		}
	}
}
</style>
