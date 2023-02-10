<template>
	<div class="menu cosco-page">
		<div class="components-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<div class="branch-company-wrap">
								分公司:
								<el-select default-first-option clearable filterable size="mini" v-model="queryForm.sapid" placeholder="请选择分公司账号">
									<el-option v-for="item in branchCompanyOptions" :key="item.sapid" :label="item.companyCname" :value="item.sapid"> </el-option>
								</el-select>
							</div>
							<span class="filter-txt"> 出发地: </span>
							<el-autocomplete
								class="cosco-date"
								clearable
								size="mini"
								placeholder="支持港口/内陆城市"
								v-model="queryForm.porName"
								:fetch-suggestions="
									(queryString, cb) => {
										cityQuery(queryString, cb)
									}
								"
								@change="
									value => {
										citySelect(value, 'por')
									}
								"
								@select="
									value => {
										citySelect(value, 'por')
									}
								"
								highlight-first-item
							>
								<template slot-scope="{ item }">
									<div class="name">
										{{ item.cityFullNameCn + '-' + item.cityFullNameEn }}
									</div>
								</template>
							</el-autocomplete>
							<span class="filter-txt"> 目的地: </span>
							<el-autocomplete
								class="cosco-date"
								clearable
								size="mini"
								placeholder="支持港口/内陆城市"
								v-model="queryForm.fndName"
								:fetch-suggestions="
									(queryString, cb) => {
										cityQuery(queryString, cb)
									}
								"
								@change="
									value => {
										citySelect(value, 'fnd')
									}
								"
								@select="
									value => {
										citySelect(value, 'fnd')
									}
								"
								highlight-first-item
							>
								<template slot-scope="{ item }">
									<div class="name">
										{{ item.cityFullNameCn + '-' + item.cityFullNameEn }}
									</div>
								</template>
							</el-autocomplete>
							<span class="filter-txt">开航时间:</span>
							<el-date-picker class="cosco-date" clearable size="mini" v-model="queryForm.startDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="开始日期"></el-date-picker>-
							<el-date-picker class="cosco-date" clearable size="mini" v-model="queryForm.endDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="结束日期"></el-date-picker>
						</div>
					</div>
				</div>
				<el-button style="margin-left: 16px" size="mini" @click="handleSearch" type="primary"> <i class="el-icon-search"></i> 搜索 </el-button>
				<el-button size="mini" @click="handleReset" plain> 重置 </el-button>
			</div>
		</div>
		<div class="m-t-8 cosco-box">
			<el-table :data="shippingLineList" border v-loading="loading" :span-method="arraySpanMethod" class="orderTable cosco-table">
				<el-table-column header-align="center" align="left" label="出发地" width="150px">
					<template slot-scope="scope">
						<div v-if="scope.$index % 2 === 1">
							<div class="tableTitle">
								<span v-for="(item, i) in scope.row.scheduleData.legs" :key="i">
									<b> {{ item.vesselName ? item.vesselName : '' }}{{ item.voyageNo ? item.voyageNo : '' }}<span v-if="item.vesselName || item.voyageNo">/</span>{{ item.service ? item.service.serviceCode : '' }} </b>
								</span>
								<span class="haulangTypeClass">条款：{{ scope.row.haulageType }}</span>
							</div>
						</div>
						<div class="shippingLines" v-else>
							<div class="schedule-data">
								<el-row class="time-display">
									<el-col :span="6">
										<div>
											<div class="horizontal-content-div">
												<span v-if="scope.row.scheduleData.legs.length > 1">ETD</span>
											</div>
											<div class="horizontal-content-div">
												<span v-if="scope.row.scheduleData.legs.length > 1">
													{{ scope.row.scheduleData.legs[0].pol.etd ? scope.row.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}
												</span>
											</div>
										</div>
									</el-col>
									<el-col :span="6">
										<div v-if="scope.row.scheduleData.legs.length > 1">
											<div class="horizontal-content-div">ETD</div>
											<div class="horizontal-content-div">
												{{ scope.row.scheduleData.legs[1].pol.etd ? scope.row.scheduleData.legs[1].pol.etd.substring(0, 10) : '' }}
											</div>
										</div>
										<div v-if="scope.row.scheduleData.legs.length == 1">
											<div class="horizontal-content-div">ETD</div>
											<div class="horizontal-content-div">
												{{ scope.row.scheduleData.legs[0].pol.etd ? scope.row.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}
											</div>
										</div>
									</el-col>
									<el-col :span="6">
										<div class="horizontal-content-div">ETA</div>
										<div class="horizontal-content-div">
											{{ scope.row.eta ? scope.row.eta.substring(0, 10) : '' }}
										</div>
									</el-col>
									<el-col :span="6">
										<div class="horizontal-content-div"></div>
										<div class="horizontal-content-div"></div>
									</el-col>
								</el-row>
								<el-row class="circle-center">
									<el-col :span="6">
										<div class="hollow-circle"></div>
										<div class="beeline"></div>
									</el-col>
									<el-col :span="6">
										<div class="solid-circle"></div>
										<div class="beeline"></div>
									</el-col>
									<el-col :span="6">
										<div class="solid-circle"></div>
										<div class="beeline"></div>
									</el-col>
									<el-col :span="6">
										<div class="hollow-circle"></div>
									</el-col>
								</el-row>
								<el-row class="time-display">
									<el-col :span="6">
										<div class="horizontal-content-div">
											{{ scope.row.porCity.cityFullNameCn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.porCity.cityFullNameEn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.porFacilityCode }}
										</div>
									</el-col>
									<el-col :span="6">
										<div class="horizontal-content-div">
											{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pol.port.portFullNameCn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pol.port.portFullNameEn }}
										</div>
									</el-col>
									<el-col :span="6">
										<div class="horizontal-content-div">
											{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pod.port.portFullNameCn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pod.port.portFullNameEn }}
										</div>
									</el-col>
									<el-col :span="6">
										<div class="horizontal-content-div">
											{{ scope.row.fndCity.cityFullNameCn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.fndCity.cityFullNameEn }}
										</div>
										<div class="horizontal-content-div">
											{{ scope.row.fndFacilityCode }}
										</div>
									</el-col>
								</el-row>
							</div>
							<!-- 预期交货时间 -->
							<div class="symbol"></div>
							<div style="width:50px;">{{ scope.row.estimatedTransitTimeInDays || 0 }}天</div>
							<!-- 运价价格 -->
							<div class="symbol"></div>
							<div>
								<div class="product-price-wrapper">
									<div style="display: flex">
										<div class="symbol"></div>
										<div class="priceGroup">
											<div class="priceItem">
												<div class="ectPrice">
													<span>{{ scope.row.containerOceanFeeMap.get('20GP') }} </span>
												</div>
											</div>
										</div>
										<div class="priceGroup">
											<div class="priceItem">
												<div class="ectPrice">
													<span>{{ scope.row.containerOceanFeeMap.get('40GP') }} </span>
												</div>
											</div>
										</div>
										<div class="priceGroup">
											<div class="priceItem">
												<div class="ectPrice">
													<span>{{ scope.row.containerOceanFeeMap.get('40HQ') }} </span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="result-price-footer">
									<div style="position: relative">
										<el-popover placement="bottom-start" popper-class="extraTableClass" trigger="click">
											<!-- <el-table :data="extraFeeList" :span-method="extraFeeArraySpanMethod"> -->
											<el-table :data="extraFeeList">
												<el-table-column width="80" label="费用类型" property="chargeTag">
													<template slot-scope="scope">
														{{ switchExtraGroup(scope.row.chargeTag) }}
													</template>
												</el-table-column>
												<el-table-column width="100" property="chargeName" label="费用名称"></el-table-column>
												<el-table-column width="60" property="unitType" label="单位"></el-table-column>
												<el-table-column width="100" property="billPrice" label="单票价格">
													<template slot-scope="scope">
														{{ scope.row | billPriceFilter }}
													</template>
												</el-table-column>
												<el-table-column width="100" property="20GP" label="20GP">
													<template slot-scope="scope">
														{{ scope.row | price20GpFilter }}
													</template>
												</el-table-column>
												<el-table-column width="100" property="40GP" label="40GP">
													<template slot-scope="scope">
														{{ scope.row | price40GpFilter }}
													</template>
												</el-table-column>
												<el-table-column width="100" property="40HQ" label="40HQ">
													<template slot-scope="scope">
														{{ scope.row | price40HqFilter }}
													</template>
												</el-table-column>
												<el-table-column width="200" header-align="center" align="left" label="预付-到付">
													<template slot-scope="scope">
														<el-radio-group @change="handleChange('extraFeeList', scope.row)" v-model="scope.row.paymentTerm">
															<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('P')" label="P">预付</el-radio>
															<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('C')" label="C">到付</el-radio>
														</el-radio-group>
													</template>
												</el-table-column>
											</el-table>
											<el-button @click="getExtraFeeList(scope.row.id)" size="mini" type="text" style="background-color: transparent" slot="reference">
												<div>
													<span class="extra-charge-icon"> 附 </span>
													附加费明细
												</div>
											</el-button>
										</el-popover>
									</div>
									<div>运价有效期:&nbsp;&nbsp;{{ scope.row.effectiveStartDate.substring(0, 10) }}&nbsp;到&nbsp;{{ scope.row.effectiveEndDate.substring(0, 10) }}</div>
								</div>
							</div>
							<div class="symbol"></div>
							<div class="symbol"></div>
							<div class="symbol"></div>
							<!--库存信息  -->
							<div class="pay-panel">
								<div class="inventory">
									<span v-if="scope.row.inventory > 0"> 库存:{{ scope.row.inventory }}TEU</span>
									<span v-else> 暂无库存</span>
								</div>
								<div class="inventory">
									<el-button v-if="scope.row.inventory > 0" @click="buyOrder(scope.row.id)" type="primary">
										去购买
									</el-button>
								</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column header-align="center" align="left" label="装货(中转港)/ETD" width="150px"></el-table-column>
				<el-table-column header-align="center" align="left" label="卸货港/ETA" width="150px"></el-table-column>
				<el-table-column header-align="center" align="left" label="目的地" width="150px"></el-table-column>
				<el-table-column header-align="center" align="left" label="预期交货时间" width="100px"> </el-table-column>
				<el-table-column header-align="center" align="left" label="20GP" width="250px"> </el-table-column>
				<el-table-column header-align="center" align="left" label="40GP" width="150px"> </el-table-column>
				<el-table-column header-align="center" align="center" label="40HQ" width="150px"></el-table-column>
				<!-- <el-table-column header-align="center" align="left" label="优惠" min-width="300px"></el-table-column> -->
				<el-table-column header-align="center" align="left" label="" min-width="150px"></el-table-column>
			</el-table>
		</div>
		<!-- 分页 -->
		<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
	</div>
</template>
<script>
import Vue from 'vue'
import { parseTime } from '@/utils'
import { cityList, shippingLineListLong, extraChargeFeeListLong, sapidList, bookInfoLong } from '@/api/exec/cosco'

import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'

export default {
	name: 'cosoShippingList',
	data() {
		return {
			branchCompanyOptions: [],

			action: '',
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				sapid: '',
				porName: '',
				fndName: '',
				porCityId: null,
				fndCityId: null,
				startDate: '',
				endDate: ''
			},
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0
				}
			},
			shippingLineList: [],
			loading: false,
			//附加费列表
			extraFeeList: [],
			//海运费合并栏目
			oceanRowSpan: 0,
			porRowSpan: 0,
			podRowSpan: 0,
			//附加费列表
			extraFeeDataList: []
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	filters: {
		billPriceFilter(row) {
			if (!row.priceTicket) return
			if (row.paymentTerm === 'P') {
				return row.priceTicket.P && `${row.priceTicket.P.currency} ${row.priceTicket.P.price}`
			} else {
				return row.priceTicket.C && `${row.priceTicket.C.currency} ${row.priceTicket.C.price}`
			}
		},
		price20GpFilter(row) {
			if (!row.price20Gp) return
			if (row.paymentTerm === 'P') {
				return row.price20Gp.P && `${row.price20Gp.P.currency} ${row.price20Gp.P.price}`
			} else {
				return row.price20Gp.C && `${row.price20Gp.C.currency} ${row.price20Gp.C.price}`
			}
		},
		price40GpFilter(row) {
			if (!row.price40Gp) return
			if (row.paymentTerm === 'P') {
				return row.price40Gp.P && `${row.price40Gp.P.currency} ${row.price40Gp.P.price}`
			} else {
				return row.price40Gp.C && `${row.price40Gp.C.currency} ${row.price40Gp.C.price}`
			}
		},
		price40HqFilter(row) {
			if (!row.price40Hq) return
			if (row.paymentTerm === 'P') {
				return row.price40Hq.P && `${row.price40Hq.P.currency} ${row.price40Hq.P.price}`
			} else {
				return row.price40Hq.C && `${row.price40Hq.C.currency} ${row.price40Hq.C.price}`
			}
		}
	},
	created() {
		sapidList({}).then(res => {
			this.branchCompanyOptions = res.data
		})
	},
	mounted() {
		//初始化开航日期为今天
		this.queryForm.startDate = parseTime(new Date(), '{y}-{m}-{d}')
		this.getList()
	},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},

	methods: {
		handleChange(table, row) {
			console.log('🚀 ~ row', row)
			//切换第一条海运费才会改变其它
			if (row.oceanFlag) {
				//处理跟随海运数据
				this[table] = this[table].map(item => {
					if (item.followOceanFee && item.paymentTerms.includes(row.paymentTerm)) {
						item.paymentTerm = row.paymentTerm
					}
					return item
				})
			}
		},
		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.sapid = ''
			this.queryForm.porName = undefined
			this.queryForm.fndName = undefined
			this.queryForm.porCityId = null
			this.queryForm.fndCityId = null
			this.queryForm.startDate = parseTime(new Date(), '{y}-{m}-{d}')
			this.queryForm.endDate = undefined
			this.handleSearch()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange() {
			this.getList()
		},
		// 取消
		buyOrder(id) {
			this.$router.push({
				path: 'bookDetail',
				query: {
					productId: id,
					sapid: this.queryForm.sapid
				}
			})
		},

		cityQuery(queryString, cb) {
			//只有有关键字的时候才调用查询接口
			if (!queryString) {
				return cb([])
			}
			let params = {}
			Object.assign(params, {
				keywords: queryString
			})
			cityList(params).then(response => {
				cb(response.data.list)
			})
		},
		citySelect(val, type) {
			//解决删除选项后出现undefined问题
			if (!val) {
				this.queryForm.porCityId = null
				this.queryForm.fndCityId = null
				return
			}

			if (type === 'por') {
				this.queryForm.porCityId = val.id
				this.queryForm.porName = val.cityFullNameCn ? val.cityFullNameCn + '-' + val.cityFullNameEn : ''
			} else {
				this.queryForm.fndCityId = val.id
				this.queryForm.fndName = val.cityFullNameCn ? val.cityFullNameCn + '-' + val.cityFullNameEn : ''
			}
		},
		getList() {
			if (!this.queryForm.startDate) {
				return this.$message({
					message: '开航时间开始日期不能为空',
					type: 'error',
					showClose: true
				})
			}
			this.loading = true
			this.initQueryForm()
			shippingLineListLong(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.shippingLineList = res.data.list
				this.dataListDeal(this.shippingLineList)
				this.loading = false
			})
		},
		initQueryForm() {
			Object.assign(this.tableQuery, this.queryForm)
		},
		// 合并单元格计算
		arraySpanMethod({ row, column, rowIndex, columnIndex }) {
			if (rowIndex % 2 === 0) {
				if (columnIndex == 0) {
					return [1, 9]
				}
			} else {
				if (columnIndex === 0) {
					return [1, 9]
				} else {
					return [0, 0]
				}
			}
		},
		// 数据处理
		dataListDeal(data) {
			this.shippingLineList = []
			for (let i = 0, len = data.length; i < len; i++) {
				let newEle = data[i]
				//将运格转化为map结构
				if (newEle.routeProductPricingList.length > 0) {
					var containerOceanFeeMap = new Map()
					newEle.routeProductPricingList.map(item => {
						let pricePrefix = item.currency
						//转换需要显示的币别符号
						if (item.currency == 'USD') {
							pricePrefix = '$ '
						} else if (item.currency == 'CNY') {
							pricePrefix = '¥ '
						}
						//优先取tradePrice 其次price
						let price = item.tradePrice || item.price
						containerOceanFeeMap.set(item.cntrType, pricePrefix + price)
					})

					Vue.set(newEle, 'containerOceanFeeMap', containerOceanFeeMap)
				}
				//table合并· 所以push两条相同的数据
				this.shippingLineList.push(newEle)
				this.shippingLineList.push(newEle)
			}
		},
		//处理附加费相关数据  定义数据结构为双层map 结构  Map<chargeTag,Map<chargeCode,Fee>>
		getExtraFeeList(id) {
			//获取附加费明细数据
			extraChargeFeeListLong({ productId: id, sapid: this.queryForm.sapid }).then(res => {
				this.extraFeeDataList = res.data
				let oceanFeeList = JSON.parse(JSON.stringify(res.data))
					.filter(item => item.chargeTag === 'OCEAN')
					.map(item => {
						item.paymentTerm = item.paymentTerms[0]
						return item
					})
				let porFeeList = JSON.parse(JSON.stringify(res.data))
					.filter(item => item.chargeTag === 'POR')
					.map(item => {
						item.paymentTerm = item.paymentTerms[0]
						return item
					})
				bookInfoLong({ productId: id, sapid: this.queryForm.sapid }).then(res => {
					let routeProductObj = res.data.routeProductPricingList.reduce(
						(obj, curr) => {
							let cntrType = ''
							switch (curr.cntrType) {
								case '20GP':
									cntrType = 'price20Gp'
									break
								case '40GP':
									cntrType = 'price40Gp'
									break
								case '40HQ':
									cntrType = 'price40Hq'
									break
								default:
									break
							}
							obj[cntrType] = {
								P: {
									price: curr.price,
									currency: curr.currency
								},
								C: {
									price: curr.price,
									currency: curr.currency
								}
							}
							return obj
						},
						{ oceanFlag: true, chargeName: '海运费', chargeTag: 'OCEAN', paymentTerms: ['P', 'C'], paymentTerm: 'P', unitType: '箱型', priceTicket: {} }
					)
					this.extraFeeList = [...[routeProductObj], ...oceanFeeList, ...porFeeList]
					console.log('🚀 ~ this.extraFeeList', this.extraFeeList)
				})
			})
		},
		//处理数据结构
		handleFeeList(feeList, feeType) {
			let oceanObj = feeList
				.reduce((arr, curr) => {
					//扁平化数组
					let priceProp = curr.chargeModel === 'BL' ? 'billPrice' : curr.cntrSize
					let unit = curr.chargeModel === 'BL' ? '票' : '箱型'
					curr.chargeDetail.map(item => {
						item[priceProp] = `${item.currency} ${item.price}`
						item.unit = unit
					})
					arr = [...arr, ...curr.chargeDetail]
					return arr
				}, [])
				.map((item, index, arr) => {
					//是否有到付选项
					let hasPaymentC = arr.filter(subItem => subItem.chargeName === item.chargeName).some(paymentItem => paymentItem.paymentTerms === 'C')
					if (hasPaymentC) {
						item.hasPaymentC = true
					} else {
						item.hasPaymentC = false
					}
					return item
				})
				.filter(item => item.chargeTag === feeType && item.paymentTerms === 'P') //筛选预付,海运数据
				.reduce((obj, curr, index) => {
					//合并费用名称相同的数据
					if (index === 0) {
						obj[curr.chargeName] = curr
					} else {
						if (obj[curr.chargeName]) {
							Object.keys(curr).map(key => {
								if (!obj[curr.chargeName][key]) obj[curr.chargeName][key] = curr[key]
							})
						} else {
							obj[curr.chargeName] = curr
						}
					}
					return obj
				}, {})
			return Object.values(oceanObj)
		},
		handlerExtraChargeFeeList() {
			this.extraFeeList = []
			var extraFeeMap = new Map()
			//1.遍历外层结构   通过 chargeModel 知道单位 箱型/票  通过  cntrSize知道具体是哪个箱型的费用
			this.extraFeeDataList.map(item => {
				//2.遍历内层明细机构   通过chargeTag 知道是哪种类型的费用  并且按费用进行分组
				item.chargeDetail.map(fee => {
					var extraFeeDetailMap = extraFeeMap.get(fee.chargeTag)
					//如果已经存在分组
					if (extraFeeDetailMap) {
						//查看chargeCode 是否存在
						var feeObject = extraFeeDetailMap.get(fee.chargeName)
						//如果已经存在相同的费用  设置其它箱型的费用
						if (feeObject) {
							//把当前最新的记录复制给之前的记录
							feeObject.price = fee.price
							feeObject.currency = fee.currency
							this.setExtraFee(feeObject, item.chargeModel, item.cntrSize)
						} else {
							//如果不存在费用  需要新增费用
							this.setExtraFee(fee, item.chargeModel, item.cntrSize)
							extraFeeDetailMap.set(fee.chargeName, fee)
						}
					} else {
						//如果不存在分组
						extraFeeDetailMap = new Map()
						this.setExtraFee(fee, item.chargeModel, item.cntrSize)
						extraFeeDetailMap.set(fee.chargeName, fee)
						extraFeeMap.set(fee.chargeTag, extraFeeDetailMap)
					}
				})
			})
			//初始化合并分组数据
			this.oceanRowSpan = 0
			this.porRowSpan = 0
			this.podRowSpan = 0
			//添加海运费
			this.pushExtraFeeIntoList(extraFeeMap, 'OCEAN')
			//添加起始地地费用
			this.pushExtraFeeIntoList(extraFeeMap, 'POR')
		},
		/**
		 * 设置附加费列表展示数据
		 * feeMap 费用分组 Map
		 * groupCode 费用分组编码 string
		 */
		pushExtraFeeIntoList(extraFeeMap, groupCode) {
			// //将列表按顺序分割 OCEAN POR  POD
			var feeMap = new Map()
			feeMap = extraFeeMap.get(groupCode)
			if (feeMap) {
				feeMap.forEach((item, key) => {
					this.extraFeeList.push(item)
				})
				if (groupCode === 'OCEAN') {
					this.oceanRowSpan = feeMap.size
				} else if (groupCode === 'POR') {
					this.porRowSpan = feeMap.size
				} else if (groupCode === 'POD') {
					this.podRowSpan = feeMap.size
				}
			}
			console.log(feeMap)
		},

		// 附加费模板合并
		extraFeeArraySpanMethod({ row, column, rowIndex, columnIndex }) {
			if (columnIndex == 0) {
				if (rowIndex == 0 && this.oceanRowSpan > 0) {
					return [this.oceanRowSpan, 1]
				} else if (rowIndex == this.oceanRowSpan && this.porRowSpan > 0) {
					return [this.porRowSpan, 1]
				} else if (rowIndex == this.oceanRowSpan + this.porRowSpan && this.podRowSpan > 0) {
					return [this.podRowSpan, 1]
				} else {
					return [0, 0]
				}
			}
		},
		/**
		 * 设置附加费的费用项
		 * fee 费用项
		 * chargeModel 单位
		 * cntrSize 箱型
		 */
		setExtraFee(fee, chargeModel, cntrSize) {
			//单位
			if (chargeModel == 'BL') {
				//票结
				Vue.set(fee, 'unit', '票')
				Vue.set(fee, 'billPrice', fee.currency + ' ' + fee.price)
			} else if (chargeModel == 'CNTR') {
				//箱型
				Vue.set(fee, 'unit', '箱型')
				Vue.set(fee, cntrSize, fee.currency + ' ' + fee.price)
				Vue.set(fee, 'billPrice', '')
			}
		},
		switchExtraGroup(chargeType) {
			switch (chargeType) {
				case 'OCEAN':
					return 'OCEAN'
				case 'POR':
					return '起始地'
				case 'POD':
					return '目的地'
				default:
					return null
			}
		}
	}
}
</script>
<style lang="scss">
@import '/less/index.scss';
// components/Base组件
.menu {
	margin: 14px;
	.cosco-date {
		.el-input__suffix {
			line-height: 100%;
		}
		.el-input__prefix {
			line-height: 100%;
		}
		.el-input__icon {
			line-height: 100%;
		}
	}
	.branch-company-wrap {
		display: inline-block;
		margin-bottom: 4px;
		.el-input--mini .el-input__icon {
			line-height: 100% !important;
		}
	}
	.filter-containe {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		font-size: 12px;
		color: #333;
		align-items: baseline;
		flex-wrap: wrap;
		.filter {
			display: flex;
			// flex: 1;
			flex-direction: row;
			justify-content: flex-start;
			flex-wrap: wrap;
		}
		.filter-item {
			display: inline-block;
			vertical-align: middle;
		}
	}

	.input-container-dialog {
		float: left;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		margin: 10px 0 20px;
		margin-right: 25px;

		span.filter-txt {
			min-width: 80px;
			text-align: right;
		}
	}
	.el-table th > .cell {
		color: #222222;
	}
	.el-tag {
		background-color: #fff;
		color: #4a4a4a;
		border-style: none;
	}
	.dialog-add {
		margin-top: 16px;
		.el-button {
			border: 1px dashed #dcdfe6;
		}
	}
	.input-width {
		width: 150px;
	}
	.m-t-8 {
		margin-top: 8px;
	}
	.el-input__prefix {
		line-height: 28px;
		color: #000000;
	}
	.el-input--prefix .el-input__inner {
		padding-left: 45px;
	}
}

.search-layout .operation-btns-box {
	margin-left: 0;
	padding-left: 10px;
}
.parentWrap {
	margin-left: 12px;
	padding-bottom: 10px;
	.text {
		font-size: 14px;
	}
}
</style>

<style lang="scss" scoped>
.components-container {
	.pagination-container {
		margin-top: 10px;
		text-align: right;
	}
}
.cosco-page {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 58px);
	background: #fff;
	.cosco-box {
		flex: 1;
		text-align: right;
		overflow: auto;
		margin: 0 20px;
		.cosco-table {
			height: 100%;
			::v-deep {
				.el-table__body-wrapper {
					overflow: auto !important;
					width: 100%;
					height: calc(100% - 40px);
				}
			}
		}
	}
	.pagination-container {
		text-align: right;
		margin: 10px 0;
	}
}
</style>
