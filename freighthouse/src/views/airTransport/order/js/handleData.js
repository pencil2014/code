import { getDictLabel } from '@/utils/tools'
// 订舱基本信息
export var handleData = {
	bkgStatusDetail: [
		// 订舱详情状态
		{ label: '未订舱', value: 'pass' },
		{ label: '处理中', value: 'booking' },
		// { label: '订舱异常', value: 'book_exp' },
		{ label: '已订舱', value: 'booked' },
		{ label: '已放舱', value: 'book_release' }
	],
	bkgStatus: [
		// BKG订舱状态
		{ label: '全部', value: 'pass,booking,booked,book_release,book_refuse' },
		{ label: '未订舱', value: 'pass' },
		{ label: '处理中', value: 'booking' },
		// { label: '订舱异常', value: 'book_exp' },
		{ label: '已订舱', value: 'booked' },
		{ label: '已放舱', value: 'book_release' },
		{ label: '订舱拒绝', value: 'book_refuse' }
		// { label: '占舱单', value: 'pass,booking,booked,book_release,book_refuse,occupy' }
	],
	businessStatus: [
		// 商务订舱状态
		{ label: '全部', value: 'submit,pass,complete' },
		{ label: '待审核', value: 'submit' },
		{ label: '审核通过', value: 'pass,complete' },
		{ label: '订舱拒绝', value: 'submit,pass' }
	],

	// 订舱列表功能按钮
	businessBtnList: [
		{ label: '新建', type: 'Add' },
		{ label: '导出', type: 'Export' },
		{ label: '自定义表头', type: 'CustomColumns' }
	],
	// bkgBtnList: [
	// 	{ label: '导出', type: 'Export' },
	// 	{ label: '自定义表头', type: 'CustomColumns' }
	// ],
	btnList: [
		{ label: '导出', type: 'Export' },
		{ label: '自定义表头', type: 'CustomColumns' }
	],
	arrbookBaseInfo: (type, data) => {

		//  订单基础信息
		let orderInfo = [
			{ key: 'polPortName', name: '起运港', value: data.polPortName || '' },
			// { key: 'unloadingPortName', name: '卸货港', value: data.unloadingPortName || '' },
			{ key: 'podPortName	', name: '目的地', value: data.podPortName || '' },
			{ key: 'airTransitWay', name: '中转方式', value: (data.airTransitWay && getDictLabel('airTransferMode', data.airTransitWay)) || '' },
			{ key: 'airSysLineName', name: '航线', value: data.airSysLineName || '' },
			{ key: 'airBillType', name: '运单方式', value: (data.airBillType && getDictLabel('airTransitWay', data.airBillType)) || '' },
			{ key: 'etdTime', name: '预计起飞日', value: data.etdTime || '' },
			{ key: 'airPayMode', name: '付款方式', value: (data.airPayMode && getDictLabel('airPayMode', data.airPayMode)) || '' },
			{ key: 'poNo', name: '入仓编号', value: data.poNo || '' },
			{ key: 'poFileName', name: '入仓单', value: data.poFileName || '', fileId: data.poFileNo },
			{ key: 'intrustRemark', name: '委托备注', value: data.intrustRemark || '' },
			{ key: 'transportTerm', name: '运输条款', value: (data.transportTerm && getDictLabel('airTransportTerm', data.transportTerm)) || '' }
		]
		return orderInfo
	},
	arrContainerInfo: data => {
		let total = { container: '', weight: 0, volume: 0 },
			containerTypeList = { type: [], num: [] }
		if (data && data.length > 0) {
			data.forEach(ele => {
				if (ele.containerList.length > 0) {
					ele.containerList.forEach(item => {
						let typeIndex = containerTypeList.type.indexOf(item.containerType)
						if (typeIndex != -1) {
							containerTypeList.num[typeIndex] = containerTypeList.num[typeIndex] + item.containerNum
						} else {
							containerTypeList.type.push(item.containerType)
							containerTypeList.num.push(item.containerNum)
						}
						// 总重量
						total.weight += parseInt(item.weight) * parseInt(item.containerNum)
						// 总体积
						total.volume += parseInt(item.volume) * parseInt(item.containerNum)
					})
				}
			})
		}
		// 合计箱型
		for (let i in containerTypeList.type) {
			total.container += (total.container ? ' + ' : '') + containerTypeList.type[i] + '×' + containerTypeList.num[i]
		}
		return total
	},
	arrformInfo: (data, shipAgentSupplierList, bkgAgentSupplierList, polPortList, visibleChange, remoteMethod, change, queryVesselSearch, queryVoyageSearch) => {
		data.orderNo = ''
		let items = {
			auditInfo: {},
			bkgInfo: { form: {}, items: [] },
			businessInfo: { form: {}, items: [] }
		}
		items.bkgInfo = {
			form: { shipRefNo: data.shipRefNo, bkgRemark: data.bkgRemark },
			items: [
				{ label: '船东参考号', key: 'shipRefNo', type: 'input', inputType: 'text' },
				{ label: '订舱备注', key: 'bkgRemark', type: 'input', inputType: 'text' }
			]
		}

		items.businessInfo = {
			form: { polPortCode: data.ship.polPortCode, cyCutOff: data.ship.cyCutOff, shipCarrierCode: data.ship.shipCarrierCode },
			items: [
				{
					label: '起运港',
					key: 'polPortCode',
					type: 'select',
					prop: 'polPortCode',
					remote: true,
					options: polPortList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod,
					change: change
				},
				{ label: '截关时间', key: 'cyCutOff', type: 'date', inputType: 'text' },
				{
					label: '船公司',
					key: 'shipCarrierCode',
					type: 'select',
					prop: 'shipCarrierCode',
					remote: true,
					options: [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				}
			],
			rules: {
				polPortCode: [{ required: true, message: '起运港不能为空', trigger: 'change' }],
				cyCutOff: [{ required: true, message: '截关时间不能为空', trigger: 'cahnge' }],
				shipCarrierCode: [{ required: true, message: '船公司不能为空', trigger: 'change' }]
			}
		}
		items.auditInfo = {
			items: [
				{ label: '大船船名', key: 'vessel', type: 'autocomplete', inputType: 'text', prop: 'vessel', querySearch: queryVesselSearch },
				{ label: '大船航次', key: 'voyage', type: 'autocomplete', inputType: 'text', prop: 'voyage', querySearch: queryVoyageSearch },
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierId',
					type: 'select',
					prop: 'ship.bkgAgentSupplierId',
					remote: true,
					clearable: true,
					options: bkgAgentSupplierList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{
					label: '船公司代理',
					key: 'shipAgentSupplierId',
					type: 'select',
					prop: 'ship.shipAgentSupplierId',
					remote: true,
					clearable: true,
					options: shipAgentSupplierList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod,
					change: change
				},
				{ label: '系统航线', key: 'sysLineCode', type: 'input', inputType: 'text', prop: 'ship.sysLineCode', disabled: true, hide: true },
				{ label: '承运人航线', key: 'carrierLineName', type: 'input', inputType: 'text' },
				{ label: '航线代码', key: 'carrierService', type: 'input', inputType: 'text' },
				{ label: '合约号', key: 'contractNo', type: 'input', inputType: 'text' },
				{
					label: '合约公司',
					key: 'contractCompany',
					type: 'input',
					inputType: 'text',
					prop: 'contractCompany'
				},
				{ label: '审单备注', key: 'auditRemark', type: 'input', inputType: 'text', hide: true },
				{ label: '订舱人员', key: 'bkgEmployeeId', prop: 'bkgEmployeeId', type: 'select', options: [] },
				{ label: '协助审核人', key: 'auditEmployeeId', type: 'select', options: [], hide: data.orgAuditEmployeeId ? true : false }
			],
			rules: {
				// vessel: [
				//   { required: true, message: "大船船名不能为空", trigger: "blur" },
				// ],
				// voyage: [
				//   { required: true, message: "大船航次不能为空", trigger: "blur" },
				// ],
				'ship.bkgAgentSupplierId': [{ required: true, message: '订舱代理不能为空', trigger: 'change' }],
				bkgEmployeeId: [{ required: true, message: '订舱人员不能为空', trigger: 'change' }]
				// sysLineCode: [
				//   { required: true, message: "系统航线不能为空", trigger: "blur" },
				// ],
				// contractCompany: [
				//   { required: true, message: "合约公司不能为空", trigger: "blur" },
				// ],
			}
		}
		return items
	},
	arrWhBookBaseInfo: (data, type) => {
		// 订仓审核-订单信息
		let lclShipArr = [
			{ key: 'receiptPlaceName', name: '装货地', value: (data.ship && data.ship.receiptPlaceName) || '' },
			{ key: 'podPortName', name: '目的地', value: (data.ship && data.ship.podPortName) || '' },
			{ key: 'sysLineName', name: '系统航线', value: (data.ship && data.ship.sysLineName) || '' },
			{ key: 'cyCutOff', name: '大船截关时间', value: (data.ship && data.ship.cyCutOff) || '' },
			{ key: 'etdTime', name: '大船预计开船时间', value: (data.ship && data.ship.etdTime) || '' },
			{ key: 'quantity', name: '总件数', value: data.lcl && data.lcl.quantity, historyVal: data.lcl && data.lcl.orgQuantity },
			{ key: 'weight', name: '总毛重(KGS)', value: data.lcl && data.lcl.weight, historyVal: data.lcl && data.lcl.orgWeight },
			{ key: 'volume', name: '总体积(CBM)', value: data.lcl && data.lcl.volume, historyVal: data.lcl && data.lcl.orgVolume },
			{ key: 'intrustRemark', name: '委托备注', value: data.intrustRemark || '' }
		]
		if (type === 'whBook') {
			lclShipArr.push({ key: 'whAgentSupplierName', name: '订仓代理', value: data.lcl && data.lcl.whAgentSupplierName }, { key: 'auditRemark', name: '审单备注', value: data && data.auditRemark })
			console.log('lclShipArr', lclShipArr)
		}
		return lclShipArr
	},
	// 占舱信息
	arrformOccupyInfo: (data, bkgAgentSupplierList, polPortList, visibleChange, remoteMethod, podPortChange, queryVesselSearch, queryVoyageSearch) => {
		return {
			items: [
				{
					label: '驳船收货地',
					key: 'porPortCode',
					type: 'select',
					prop: 'porPortCode',
					remote: true,
					clearable: true,
					options: polPortList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{
					label: '大船起运港',
					key: 'polPortCode',
					type: 'select',
					prop: 'polPortCode',
					remote: true,
					clearable: true,
					options: polPortList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{
					label: '大船截关时间',
					key: 'cyCutOff',
					prop: 'cyCutOff',
					type: 'date',
					inputType: 'text',
					pickerOptions: {
						disabledDate(date) {
							return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
						}
					}
				},
				{
					label: '大船预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					type: 'date',
					inputType: 'text',
					pickerOptions: {
						disabledDate(date) {
							return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
						}
					}
				},
				{ label: '大船船名', key: 'vessel', type: 'autocomplete', inputType: 'text', clearable: true, querySearch: queryVesselSearch },
				{ label: '大船航次', key: 'voyage', type: 'autocomplete', inputType: 'text', clearable: true, querySearch: queryVoyageSearch },
				{
					label: '船公司',
					key: 'shipCarrierCode',
					type: 'select',
					prop: 'shipCarrierCode',
					remote: true,
					clearable: true,
					options: [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{
					label: '卸货港',
					key: 'unloadingPortCode',
					type: 'select',
					prop: 'unloadingPortCode',
					remote: true,
					clearable: true,
					options: polPortList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{
					label: '目的地',
					key: 'podPortCode',
					type: 'select',
					prop: 'podPortCode',
					remote: true,
					clearable: true,
					options: polPortList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod,
					change: podPortChange
				},
				{ label: '航线代码', key: 'carrierService', prop: 'carrierService', type: 'input', inputType: 'text', clearable: true },
				{ label: '订舱人员', key: 'bkgEmployeeId', type: 'select', options: [] },
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierId',
					type: 'select',
					prop: 'bkgAgentSupplierId',
					remote: true,
					clearable: true,
					options: bkgAgentSupplierList || [],
					filterable: true,
					visibleChange: visibleChange,
					remoteMethod: remoteMethod
				},
				{ label: '合约号', key: 'contractNo', prop: 'contractNo', type: 'input', inputType: 'text', clearable: true },
				{ label: '商务备注', key: 'auditRemark', type: 'input', inputType: 'text', clearable: true }
			],
			rules: {
				bkgEmployeeId: [{ required: true, message: '订舱人员不能为空', trigger: 'change' }],
				shipCarrierCode: [{ required: true, message: '船公司不能为空', trigger: 'change' }],
				// carrierService: [
				//   { required: true, message: "航线代码不能为空", trigger: "blur" },
				// ],
				cyCutOff: [{ required: true, message: '大船截关时间不能为空', trigger: 'change' }],
				etdTime: [{ required: true, message: '大船预计开船时间不能为空', trigger: 'change' }],
				polPortCode: [{ required: true, message: '大船起运港不能为空', trigger: 'change' }],
				contractNo: [{ required: true, message: '合约号不能为空', trigger: 'blur' }],
				bkgAgentSupplierId: [{ required: true, message: '订舱代理不能为空', trigger: 'blur' }],
				carrierService: [{ required: true, message: '航线代码不能为空', trigger: 'blur' }],
				unloadingPortCode: [{ required: true, message: '卸货港不能为空', trigger: 'change' }],
				podPortCode: [{ required: true, message: '目的港不能为空', trigger: 'change' }]
			}
		}
	},

	// so箱型箱量btn
	soBtnList: [
		{ label: '关联SO', key: 'relateSO' },
		{ label: '新增', key: 'add' }
	],
	soStatus: [
		{ label: '全部', value: 'valid' },
		{ label: '已绑定', value: 'bind' },
		{ label: '未绑定', value: 'unbind' },
		{ label: '已取消', value: 'cancel' }
	],

	// 订单报关服务项 代理报关 报关信息表头
	agentColumn: [
		{ label: '报关委托编号', key: 'intrustNo', prop: 'intrustNo', disabled: false },
		{ label: '委托状态', key: 'customsIntrustStatusLabel', prop: 'customsIntrustStatusLabel', disabled: false },
		{ label: '报关行', key: 'customsSupplierName', prop: 'customsSupplierName', disabled: false },
		{ label: '报关方式', key: 'customsTypeLabel', prop: 'customsTypeLabel', disabled: false },
		{ label: '委托日期', key: 'intrustTime', prop: 'intrustTime', disabled: false }
	],
	// 订单报关服务项 代理报关 报关信息表头
	agentDetailColumn(popoverComponent, customerSearch, getShipTradeModeList, viewFile) {
		return [
			{
				label: '经营单位',
				key: 'companyTitle',
				prop: 'companyTitle',
				disabled: false,
				type: 'remoteSelect',
				value: '',
				// width: '100px',
				data: [],
				visibleChange: (val, row, item, code) => {
					if (val) customerSearch('', item, code)
				},
				filterMehod: (queryString, item, code) => {
					customerSearch(queryString, item, code)
				},
				// change: (val, row) => {
				// 	Object.assign(row, {
				// 		companyTitle: val
				// 	})
				// },
				// select: (val, row) => {
				// 	Object.assign(row, {
				// 		companyTitle: val
				// 	})
				// },
				// formatter: (row, column) => {
				// 	return row.companyTitle ? row.companyTitle : '--'
				// },
				// change: (val, row) => {
				// 	Object.assign(row, {
				// 		companyTitle__save: val
				// 	})
				// }
			},
			{
				label: '海关编号',
				key: 'customsNo',
				prop: 'customsNo',
				disabled: false,
				type: 'input',
				value: '',
				maxlength: 32,
				// width: '100px',
				formatter: (row, column) => {
					return row.customsNo ? row.customsNo : '--'
				}
			},
			{
				label: '贸易方式',
				key: 'tradeTypeCode',
				prop: 'tradeTypeCode',
				// width: '150px',
				disabled: false,
				type: 'remoteSelect',
				data: [],
				visibleChange: (val, row, item, code) => {
					if (val) getShipTradeModeList('', item, code)
				},
				filterMehod: (queryString, item, code) => {
					getShipTradeModeList(queryString, item, code)
				},
				// change: (val, row) => {
				// 	Object.assign(row, {
				// 		tradeTypeCode: val
				// 	})
				// },
				// select: (val, row) => {
				// 	Object.assign(row, {
				// 		tradeTypeCode: val
				// 	})
				// },
				// selectSetData: (row, index, item) => {
				// 	if (item.data.length <= 0) item.data = [{ label: row.tradeTypeName, value: row.tradeTypeCode }]
				// }
			},
			{
				label: '货物信息',
				key: 'cargoInfo',
				prop: 'cargoInfo',
				// width: '150px',
				disabled: false,
				type: 'text'
			},
			{
				prop: 'fileData', // 属性
				label: '附件信息', // 名称
				// width: '100px',
				type: 'text',
				formatter: (row, column) => {
					// 展示个性化内容,如：变换颜色，突出文字
					return `<span style="color:#1890ff;cursor:pointer;">查看</span>`
				},
				method: (index, row) => {
					viewFile(index, row)
				}
			}
		]
	},
	// 集装箱列表表头
	containerColumn: [
		{ label: '中文品名', key: 'cname', prop: 'cname' },
		{ label: '英文品名', key: 'ename', prop: 'ename' },

		{ label: '件数', key: 'quantity', prop: 'quantity' },
		{ label: '毛重(KGS)', key: 'weight', prop: 'weight' },
		{ label: '体积(CBM)', key: 'volume', prop: 'volume' },
		{
			label: '包装',
			key: 'packageInfo',
			prop: 'packageInfo'
		},
		{ label: '长(M)', key: 'length', prop: 'length' },
		{ label: '宽(M)', key: 'width', prop: 'width' },
		{ label: '高(M)', key: 'height', prop: 'height' }
	],
	// 商品列表表头
	cargoColumn(hscodeQuerySearch, countryQuerySearch) {
		return [
			{
				label: '商品编号',
				key: 'commodityNo',
				prop: 'commodityNo',
				type: 'input',
				width: '100px',
				formatter: (row, column) => {
					return row.commodityNo ? row.commodityNo : '--'
				}
			},
			{
				label: 'HSCODE',
				key: 'hscode',
				prop: 'hscode',
				type: 'remoteSelect',
				width: '100px',
				data: [],
				filterMehod: (queryString, item) => {
					hscodeQuerySearch(queryString, item)
				},
				change: (val, row) => {
					Object.assign(row, {
						hscode: val
					})
				},
				select: (val, row) => {
					Object.assign(row, {
						hscode: val
					})
				},
				formatter: (row, column) => {
					return row.hscode ? row.hscode : '--'
				}
			},
			{
				label: '中文品名',
				key: 'commodityName',
				prop: 'commodityName',
				type: 'input',
				width: '100px',
				formatter: (row, column) => {
					return row.commodityName ? row.commodityName : '--'
				}
			},
			{
				label: '规格型号',
				key: 'commodityType',
				prop: 'commodityType',
				type: 'input',
				width: '100px',
				formatter: (row, column) => {
					return row.commodityType ? row.commodityType : '--'
				}
			},
			{
				label: '件数',
				key: 'quantity',
				prop: 'quantity',
				type: 'input',
				width: '100px',
				change: (val, row) => {
					let reg = /^[0-9]\d*$/
					if (val == 0 || !reg.test(val)) {
						Object.assign(row, {
							quantity: '',
							totalPrice: ''
						})
					} else if (row.unitPrice) {
						Object.assign(row, {
							totalPrice: val * row.unitPrice
						})
					}
				},
				formatter: (row, column) => {
					return row.quantity ? row.quantity : '--'
				}
			},
			{
				label: '单位',
				key: 'quantityUnit',
				prop: 'quantityUnit',
				type: 'input',
				width: '100px',
				formatter: (row, column) => {
					return row.quantityUnit ? row.quantityUnit : '--'
				}
			},
			{
				label: '最终目的国家',
				key: 'countryFinal',
				prop: 'countryFinal',
				type: 'remoteSelect',
				width: '100px',
				data: [],
				visibleChange: (val, row, item) => {
					if (val) countryQuerySearch(row.countryFinal, item)
				},
				filterMehod: (queryString, item) => {
					countryQuerySearch(queryString, item)
				},
				change: (val, row) => {
					Object.assign(row, {
						countryFinal: val
					})
				},
				select: (val, row) => {
					Object.assign(row, {
						countryFinal: val
					})
				},
				formatter: (row, column) => {
					return row.countryFinal ? row.countryFinal : '--'
				}
			},
			{
				label: '币种',
				key: 'currency',
				prop: 'currency',
				type: 'select',
				value: '',
				data: [],
				nonDictionary: true,
				width: '100px',
				// visibleChange: (val, row, item) => {
				//   if (val) currencyList('', item)
				// },
				// filterMehod: (queryString, item) => {
				//   currencyList(queryString, item)
				// },
				// change: (val, row) => {
				//   Object.assign(row, {
				//     currency: val
				//   })
				// },
				// select: (val, row) => {
				//   Object.assign(row, {
				//     currency: val
				//   })
				// },
				formatter: (row, column) => {
					return row.currency ? row.currency : '--'
				}
			},
			{
				label: '单价',
				key: 'unitPrice',
				prop: 'unitPrice',
				type: 'input',
				width: '100px',
				change: (val, row) => {
					let reg = /^\d+(?=\.{0,1}\d+$|$)/
					if (!reg.test(val)) {
						Object.assign(row, {
							unitPrice: '',
							totalPrice: ''
						})
					} else if (row.quantity) {
						Object.assign(row, {
							totalPrice: val * row.quantity
						})
					}
				},
				formatter: (row, column) => {
					return row.unitPrice ? row.unitPrice : '--'
				}
			},
			{
				label: '总价',
				key: 'totalPrice',
				prop: 'totalPrice',
				type: 'input',
				width: '100px',
				formatter: (row, column) => {
					return row.totalPrice ? row.totalPrice : '--'
				}
			},

			{
				label: '征免',
				key: 'taxExemption',
				prop: 'taxExemption',
				type: 'input',
				width: '100px',

				formatter: (row, column) => {
					return row.taxExemption ? row.taxExemption : '--'
				}
			}
		]
	},
	// 堆场信息表头
	yardBoxColumn: [
		{ label: '堆场名称', key: 'yardName', prop: 'yardName', width: '150px', disabled: false },
		{ label: '堆场状态', key: 'status_cn', prop: 'status_cn', width: '150px', disabled: false },
		{ label: '堆场地址', key: 'yardAddress', prop: 'yardAddress', width: '150px', disabled: false },
		{ label: '堆场联系人', key: 'yardContact', prop: 'yardContact', width: '150px', disabled: false },
		{ label: '堆场联系人电话', key: 'yardContactPhone', prop: 'yardContactPhone', width: '150px', disabled: false },
		{ label: '我司负责人', key: 'cname', prop: 'cname', width: '150px', disabled: false },
		{ label: '我司负责人电话', key: 'chargePhone', prop: 'chargePhone', width: '150px', disabled: false },
		{ label: '我司负责人邮箱', key: 'chargeEmail', prop: 'chargeEmail', width: '150px', disabled: false },
		{ label: '装箱要求', key: 'boxRemark', prop: 'boxRemark', width: '150px', disabled: false }
	],
	yardBoxItemVoColumn: [
		{ label: 'SO', key: 'so', prop: 'so', fixed: true, width: '150px', disabled: false },
		{ label: '箱号', key: 'cn', prop: 'cn', fixed: true, width: '150px', disabled: false },
		{ label: '封号', key: 'sn', prop: 'sn', fixed: true, width: '150px', disabled: false },
		{ label: 'HSCODE', key: 'hscode', prop: 'hscode', width: '150px', disabled: false },
		{ label: '中文品名', key: 'cname', prop: 'cname', width: '150px', disabled: false },
		{ label: '英文品名', key: 'ename', prop: 'ename', width: '150px', disabled: false },
		{ label: '唛头', key: 'mark', prop: 'mark', width: '150px', disabled: false },
		{ label: '货物描述', key: 'desc', prop: 'desc', width: '150px', disabled: false },
		{ label: '卸货港', key: 'podPortCode', prop: 'podPortCode', width: '150px', disabled: false },
		{ label: '件数', key: 'quantity', prop: 'quantity', width: '150px', disabled: false },
		{ label: '毛重', key: 'weight', prop: 'weight', width: '150px', disabled: false },
		{ label: '体积', key: 'volume', prop: 'volume', width: '150px', disabled: false },
		{ label: '包装', key: 'packageType', prop: 'packageType', width: '150px', disabled: false }
	],
	// 实际进仓信息弹窗
	yardBoxCargosColumn: (focusFunc, hscodeQuerySearch) => {
		return [
			{
				label: '品名',
				key: 'cname',
				prop: 'cname',
				width: '100px',
				type: 'input',
				placeholder: '点击添加品名',
				readonly: true,
				focus: index => {
					focusFunc(index)
				},
				formatter: (row, column) => {
					return row.cname ? row.cname : ''
				}
			},
			{
				label: 'HSCODE',
				key: 'hscode',
				prop: 'hscode',
				type: 'remoteSelect',
				width: '100px',
				disabled: true,
				data: [],
				filterMehod: (queryString, item) => {
					hscodeQuerySearch(queryString, item)
				},
				change: (val, row) => {
					Object.assign(row, {
						hscode: val
					})
				},
				select: (val, row) => {
					Object.assign(row, {
						hscode: val
					})
				},
				formatter: (row, column) => {
					return row.hscode ? row.hscode : '--'
				}
			},
			{
				label: '唛头',
				key: 'mark',
				prop: 'mark',
				width: '100px',
				type: 'input',
				disabled: false,
				formatter: (row, column) => {
					return row.mark ? row.mark : ''
				}
			},
			{
				label: '件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				formatter: (row, column) => {
					return row.quantity ? row.quantity : ''
				}
			},
			{
				label: '毛重(KGS)',
				key: 'weight',
				prop: 'weight',
				width: '100px',
				type: 'input',
				unit: 'KGS',
				formatter: (row, column) => {
					return row.weight ? row.weight : ''
				}
			},
			{
				label: '体积(CBM)',
				key: 'volume',
				prop: 'volume',
				width: '100px',
				type: 'input',
				unit: 'CBM',
				formatter: (row, column) => {
					return row.volume ? row.volume : ''
				}
			},
			{
				label: '包装',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				filterable: true,
				formatter: (row, column) => {
					return row.packageType ? row.packageType : ''
				}
			}
		]
	},
	// 异常单管理
	workExceptionColumn: [
		{ label: '异常编号', key: 'excpNo', prop: 'excpNo', width: '150px', disabled: false },
		{ label: '工作号', key: 'orderNo', prop: 'orderNo', width: '150px', disabled: false },
		{ label: '业务类型', key: 'businessType', prop: 'businessType', width: '150px', disabled: false },
		{ label: '所属模块', key: '', prop: '', width: '150px', disabled: false },
		{ label: '异常类型', key: 'excpContent', prop: 'excpContent', width: '150px', disabled: false },
		{ label: '状态', key: 'handleStatus', prop: 'handleStatus', width: '150px', disabled: false },
		{ label: '异常描述', key: '', prop: '', width: '150px', disabled: false }
	],
	yardBoxItemList: [
		{
			boxContainerId: 1,
			boxId: 1,
			cn: 'xx',
			sn: 'xx',
			so: 's001',
			yardBoxCargos: [
				{
					oid: 1,
					boxContainerId: 1,
					cname: '中文品名',
					ename: '英文名',
					cargo_desc: '货描',
					hscode: '100001',
					mark: '唛头',
					orderNo: 'hello_003',
					packageType: '', //字典：package_type
					podPortCode: 'xxx',
					quantity: 1,
					volume: 3,
					weight: 2
				},
				{
					oid: 2,
					boxContainerId: 1,
					cname: '中文品名',
					ename: '英文名',
					cargo_desc: '货描',
					hscode: '100001',
					mark: '唛头',
					orderNo: 'hello_003',
					packageType: '', //字典：package_type
					podPortCode: 'xxx',
					quantity: 1,
					volume: 3,
					weight: 2
				}
			]
		},
		{
			boxContainerId: 2,
			boxId: 1,
			cn: 'xx',
			sn: 'xx',
			so: 's001',
			yardBoxCargos: [
				{
					oid: 1,
					boxContainerId: 1,
					cname: '中文品名',
					ename: '英文名',
					cargo_desc: '货描',
					hscode: '100001',
					mark: '唛头',
					orderNo: 'hello_003',
					packageType: '', //字典：package_type
					podPortCode: 'xxx',
					quantity: 1,
					volume: 3,
					weight: 2
				},
				{
					oid: 2,
					boxContainerId: 1,
					cname: '中文品名',
					ename: '英文名',
					cargo_desc: '货描',
					hscode: '100001',
					mark: '唛头',
					orderNo: 'hello_003',
					packageType: '', //字典：package_type
					podPortCode: 'xxx',
					quantity: 1,
					volume: 3,
					weight: 2
				}
			]
		}
	]
}
export var handleWarehouseData = {
	// 计划进仓信息弹窗
	warehouseInplanCargoColumn: focusFunc => {
		return [
			{
				label: '品名',
				key: 'cname',
				prop: 'cname',
				width: '100px',
				type: 'input',
				placeholder: '点击添加品名',
				readonly: true,
				focus: index => {
					focusFunc(index)
				},
				formatter: (row, column) => {
					return row.cname ? row.cname : ''
				}
			},
			{
				label: '唛头',
				key: 'mark',
				prop: 'mark',
				width: '100px',
				type: 'input',
				disabled: true,
				clearable: true,
				formatter: (row, column) => {
					return row.mark ? row.mark : ''
				}
			},
			{
				label: '预计进仓件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				clearable: true,
				formatter: (row, column) => {
					return row.quantity ? row.quantity : ''
				}
			},
			// {
			//   label: '预计进仓毛重', key: 'weight', prop: 'weight', width: '100px', type: 'input',
			//   unit: "KGS",
			//   formatter: (row, column) => {
			//     return row.weight ? row.weight : ''
			//   }
			// },
			// {
			//   label: '预计进仓体积', key: 'volume', prop: 'volume', width: '100px', type: 'input',
			//   unit: "CBM",
			//   formatter: (row, column) => {
			//     return row.volume ? row.volume : ''
			//   }
			// },
			{
				label: '预计包装类型',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				clearable: true,
				filterable: true,
				data: []
			}
		]
	},

	// 实际进仓信息弹窗
	InWarehouseColumn: focusFunc => {
		return [
			{
				label: '品名',
				key: 'cname',
				prop: 'cname',
				width: '100px',
				type: 'input',
				placeholder: '点击添加品名',
				readonly: true,
				disabled: true,
				focus: index => {
					focusFunc(index)
				},
				formatter: (row, column) => {
					return row.cname ? row.cname : ''
				}
			},
			{
				label: '唛头',
				key: 'mark',
				prop: 'mark',
				width: '100px',
				type: 'input',
				disabled: true,
				formatter: (row, column) => {
					return row.mark ? row.mark : ''
				}
			},
			{
				label: '实际进仓件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				disabled: true,
				formatter: (row, column) => {
					return row.quantity ? row.quantity : ''
				}
			},
			// {
			//   label: '实际进仓毛重', key: 'weight', prop: 'weight', width: '100px', type: 'input', disabled: true,
			//   unit: "KGS",
			//   formatter: (row, column) => {
			//     return row.weight ? row.weight : ''
			//   }
			// },
			// {
			//   label: '实际进仓体积', key: 'volume', prop: 'volume', width: '100px', type: 'input', disabled: true,
			//   unit: "CBM",
			//   formatter: (row, column) => {
			//     return row.volume ? row.volume : ''
			//   }
			// },
			{
				label: '实际进仓包装',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				disabled: true,
				filterable: true,
				formatter: (row, column) => {
					return row.packageType ? row.packageType : ''
				}
			}
		]
	},
	// 计划出仓信息弹窗
	PlanOutWarehouseColumn: focusFunc => {
		return [
			{ label: '进仓编码', key: 'inBatchNo', prop: 'inBatchNo', width: '100px', type: 'text' },
			{
				label: '品名',
				key: 'cname',
				prop: 'cname',
				width: '100px',
				type: 'input',
				placeholder: '点击添加品名',
				readonly: true,
				focus: index => {
					focusFunc(index)
				},
				formatter: (row, column) => {
					return row.cname ? row.cname : ''
				}
			},
			{
				label: '唛头',
				key: 'mark',
				prop: 'mark',
				width: '100px',
				type: 'input',
				disabled: true,
				formatter: (row, column) => {
					return row.mark ? row.mark : ''
				}
			},
			{ label: '剩余库存件数', key: 'lastQuantity', prop: 'lastQuantity', width: '100px', type: 'text' },
			{
				label: '计划出仓件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				formatter: (row, column) => {
					return row.quantity ? row.quantity : ''
				}
			},
			{
				label: '计划出仓包装',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				filterable: true,
				formatter: (row, column) => {
					return row.packageType ? row.packageType : ''
				}
			}
			// { label: '剩余库存毛重', key: 'lastWeight', prop: 'lastWeight', width: '100px', type: 'text' },
			// {
			//   label: '计划出仓毛重', key: 'weight', prop: 'weight', width: '100px', type: 'input',
			//   unit: "KGS",
			//   formatter: (row, column) => {
			//     return row.weight ? row.weight : ''
			//   }
			// },
			// { label: '剩余库存体积', key: 'lastVolume', prop: 'lastVolume', width: '100px', type: 'text' },
			// {
			//   label: '计划出仓体积', key: 'volume', prop: 'volume', width: '100px', type: 'input',
			//   unit: "CBM",
			//   formatter: (row, column) => {
			//     return row.volume ? row.volume : ''
			//   }
			// },
		]
	},
	// 实际出仓信息弹窗
	OutWarehouseColumn: focusFunc => {
		return [
			{ label: '进仓编码', key: 'inBatchNo', prop: 'inBatchNo', width: '100px', type: 'text' },
			{
				label: '品名',
				key: 'cname',
				prop: 'cname',
				width: '100px',
				type: 'input',
				placeholder: '点击添加品名',
				readonly: true,
				disabled: true,
				focus: index => {
					focusFunc(index)
				},
				formatter: (row, column) => {
					return row.cname ? row.cname : ''
				}
			},
			{
				label: '唛头',
				key: 'mark',
				prop: 'mark',
				width: '100px',
				type: 'input',
				disabled: true,
				formatter: (row, column) => {
					return row.mark ? row.mark : ''
				}
			},
			{ label: '剩余库存件数', key: 'lastQuantity', prop: 'lastQuantity', width: '100px', type: 'text' },
			{
				label: '实际出仓件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				disabled: true,
				formatter: (row, column) => {
					return row.quantity ? row.quantity : ''
				}
			},
			// { label: '剩余库存毛重', key: 'lastWeight', prop: 'lastWeight', width: '100px', type: 'text' },
			// {
			//   label: '实际出仓毛重', key: 'weight', prop: 'weight', width: '100px', type: 'input', disabled: true,
			//   unit: "KGS",
			//   formatter: (row, column) => {
			//     return row.weight ? row.weight : ''
			//   }
			// },
			// { label: '剩余库存体积', key: 'lastVolume', prop: 'lastVolume', width: '100px', type: 'text' },
			// {
			//   label: '实际出仓体积', key: 'volume', prop: 'volume', width: '100px', type: 'input', disabled: true,
			//   unit: "CBM",
			//   formatter: (row, column) => {
			//     return row.volume ? row.volume : ''
			//   }
			// },
			{
				label: '实际出仓包装',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				disabled: true,
				filterable: true,
				formatter: (row, column) => {
					return row.packageType ? row.packageType : ''
				}
			}
		]
	},
	// 商品弹窗
	cnameDialogColumn: [
		{ label: '中文品名', key: 'cname', prop: 'cname', width: '100px' },
		{ label: '英文品名', key: 'ename', prop: 'ename', width: '100px' },
		{ label: '货物类型', key: 'type', prop: 'type', width: '100px' },
		{ label: '唛头', key: 'mark', prop: 'mark', width: '100px' },
		{ label: '海关编码', key: 'hscode', prop: 'hscode', width: '100px' }
	],
	// 商品弹窗
	carInfoColumn: [
		{ label: '发货单位', key: 'cname', prop: 'cname', width: '100px' },
		{ label: '装货人', key: 'ename', prop: 'ename', width: '100px' },
		{ label: '装货电话', key: 'type', prop: 'type', width: '100px' },
		{ label: '装货地点', key: 'mark', prop: 'mark', width: '100px' },
		{ label: '装货详细地址', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '委托装柜时间', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '实际到场时间', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '卸货人', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '卸货电话', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '卸货地点', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '卸货详细地址', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '件数', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '毛重', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '体积', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '包装', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '司机姓名', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '司机电话', key: 'hscode', prop: 'hscode', width: '100px' },
		{ label: '车牌号', key: 'hscode', prop: 'hscode', width: '100px' }
	],
	// 新增派车计划-装货信息-商品信息表头
	addCarCargoColumn: (cargoOptions, changeCargo) => {
		return [
			{
				label: '品名',
				key: 'cargoId',
				prop: 'cargoId',
				width: '100px',
				type: 'select',
				placeholder: '点击添加品名',
				data: cargoOptions,
				nonDictionary: true,
				formatter: (row, column) => {
					return row.commodityNo ? row.commodityNo : ''
				},
				change: (value, row, index) => {
					changeCargo(value, row, index)
				}
			},
			{ label: '唛头', key: 'mark', prop: 'mark', width: '100px', type: 'text' },
			{
				label: '件数',
				key: 'quantity',
				prop: 'quantity',
				width: '100px',
				type: 'input',
				formatter: (row, column) => {
					return row.commodityNo ? row.commodityNo : ''
				}
			},
			// {
			//   label: '毛重', key: 'weight', prop: 'weight', width: '100px', type: 'input',
			//   unit: "KGS",
			//   formatter: (row, column) => {
			//     return row.commodityNo ? row.commodityNo : ''
			//   }
			// },
			// {
			//   label: '体积', key: 'volume', prop: 'volume', width: '100px', type: 'input',
			//   unit: "CBM",
			//   formatter: (row, column) => {
			//     return row.commodityNo ? row.commodityNo : ''
			//   }
			// },
			{
				label: '包装',
				key: 'packageType',
				prop: 'packageType',
				width: '100px',
				type: 'select',
				nonDictionary: true,
				filterable: true,
				formatter: (row, column) => {
					return row.commodityNo ? row.commodityNo : ''
				}
			}
		]
	},
	// 散车收货列表头
	carListColumn: [
		{ label: '委托编号', prop: 'intrustNo', type: 'text', width: '150px', disabled: false },
		// {label: '派车状态', prop: 'dispatchStatus_cn',type: 'text', width: '150px', disabled: false},
		{ label: '委托状态', prop: 'intrustStatus_cn', type: 'text', width: '150px', disabled: false },
		{ label: '派车类型', prop: 'warehouseInoutType_cn', type: 'text', width: '150px', disabled: false },
		{ label: '车队', prop: 'supplierName', type: 'text', width: '150px', disabled: false },
		{ label: '车队联系人', prop: 'supplierContact', type: 'text', width: '150px', disabled: false },
		{ label: '车队联系人电话', prop: 'supplierContactPhone', type: 'text', width: '150px', disabled: false },
		{ label: '注意事项', prop: 'boxRemark', type: 'text', width: '150px', disabled: false }
	]
}
