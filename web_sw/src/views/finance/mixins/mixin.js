import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import { employeeSelectlist } from '@/api/companyResource' // departmentTreeList

// 处理pageSize
function savePageSize(key, value) {
	let obj = JSON.parse(localStorage.getItem('finUrlPageSize') || '{}')
	obj[key] = value
	localStorage.setItem('finUrlPageSize', JSON.stringify(obj))
}
function getPageSize(key) {
	let obj = JSON.parse(localStorage.getItem('finUrlPageSize') || '{}')
	return obj[key]
}

export const mixin = {
	data() {
		return {
			option: {
				edit: false,
				columns: [],
				data: [],
				operationBtns: {
					width: '60px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, option) => {
						this['handle' + action] && this['handle' + action](row)
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'showDetail'
						}
					]
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				selection: {
					show: true,
					fixed: true
				},
				pagination: {
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false,
					show: false,
					currPage: 1,
					pageSize: -1,
					totalCount: 0,
					total: 0,
					callback: (action, val, option) => {
						if (action === 'SizeChange') {
							this.handleSizeChange(val, option)
						} else if (action === 'CurrentChange') {
							this.handleCurrentChange(val, option)
						}
					}
				},
				listAmtSummary: {
					show: false,
					count: 1, // 现默认即获取数据
					data: {},
					labelObj: {}, // 需传值
					colorObj: {}, // 可不传值
					colorRgbObj: {
						red: '#E63923',
						green: '#33B18A',
						black: '#4A4A4A'
					}
				},
				maxHeight: 515
				// hardCheckRows: [], // 需要设置勾选的行
			},
			selectedOptionItem: '',
			componentProps: '',
			columns: [], // 当前的表头
			columns2: [], // 应付(option2)当前的表头
			columns3: [], // SU应收(option7)当前的表头
			columns4: [], // SU应付(option8)当前的表头
			selfColumnsBase: [], // 当前页面的columnsBase
			customColumnsPopShow: false, // 显示自定义表头的弹窗状态
			configColumns: [], // 传给自定义表头当前用的字段
			customColumnsKeys: [], // 定制的表头
			customColumnsKeys2: [], // 应付(option2)定制的表头
			customColumnsKeys3: [], // SU应收(option7)定制的表头
			customColumnsKeys4: [], // SU应付(option8)定制的表头
			columnsBaseLocal: [],
			whichCustomColumns: 'customColumns',
			eLoadingText: '正在加载中',
			eLoadingSpinner: 'el-icon-loading',
			eLoadingBackground: 'rgba(255, 255, 255, 0.9)',
			// 需要此功能时，需要列表页添加checkbox，设置table的ref，搜索方法添加参数，接口返回数据特殊处理
			isListSelectRecord: false, // 是否记录勾选内容
			listSelectRecordArr: [], // 记录勾选内容
			sortParams: {} // 表格排序参数
		}
	},
	created() {},
	activated() {
		if (this.componentProps) {
			// 处理columnTip不消失
			this.componentProps.show = true
			this.componentProps.show = false
		}
	},
	methods: {
		refreshListPage() {
			this.handleCurrentChange && this.handleCurrentChange(1)
		},

		// 员工下拉框
		getEmployeeList(queryString, item, type) {
			let data = {}
			if (typeof queryString === 'object') {
				data.name = queryString.name
				data.roleCodes = queryString.roleCodes
			} else {
				data.name = queryString
			}
			if ((this.searchOption || this.searchOption1 || {})['addFilter']) {
				data.status = data.status || 'all'
			}
      if (type === 'company') {
        data.compCode = this.userInfo.compCode
      }
			employeeSelectlist(data).then(res => {
				let list = res.data.map(item => ({ label: `${item.cname}(${item.employeeNo})`, value: item.employeeId }))
				if (this.remoteSelectCommon(item, list)) return
				item.remoteSelectList.splice(0, 1000, ...list)
			})
		},

		// 统一处理remoteSelect的remoteSelectList
		// param 可以获取到queryString等请求参数
		remoteSelectCommon(item, data, cfg = { label: 'label', value: 'value' }, param = {}) {
			// item无值，说明不是搜索条件
			if (!item) return
			let addFilter = (this.searchOption || this.searchOption1 || {})['addFilter']
			if (!addFilter) return
			let searchInputGroup = addFilter.searchInputGroup
			let filterGroups = addFilter.filterGroups
			let key
			for (const filter in filterGroups) {
				if (Object.hasOwnProperty.call(filterGroups, filter)) {
					if (filterGroups[filter] === item) key = filter
				}
			}
			// console.log(key);
			// console.log(searchInputGroup);
			// 搜索条件内未找到项，说明不是搜索条件
			if (!key) return
			let searchItem = searchInputGroup.find(v => v.key === key)
			let remoteSelectList = data.map(item => {
				return { ...item, label: item[cfg.label], value: item[cfg.value] }
			})
			let saveList = (searchItem && searchItem.saveList) || []
			let arr = remoteSelectList.filter(o => {
				return !saveList.find(s => s.value === o.value)
			})
			let result = [...saveList, ...arr]
			if (item.defaultList && !result.find(v => v.value === item.defaultList[0].value) && !param.queryString) {
				result.unshift(item.defaultList[0])
			}
			item.remoteSelectList.splice(0, 1000, ...result)
			// console.log('接口请求···················');
			// console.log(searchItem);
			// console.log(item);
			return true
		},
		// 兼容之前的悬浮框的调用。多数情况默认只需传第一个参数，如果是tab页调用需传第二个参数{ isTab: true }
		showColumnDetailHandle(params, otherParams = {}) {
			console.log(otherParams)
			this.componentProps = params.componentProps // 赋值当前的componentProps
			let { isTab } = otherParams
			this.showOneNoDetail(params.type, params.no, { isTab, row: params.componentProps.row, receipayType: params.receipayType, from: otherParams.from })
		},

		// 自定义表头
		handleCustomColumns() {
			this.whichCustomColumns = 'customColumns'
			this.configColumns = this.columns.filter(value => {
				let columnsBaseLocal = this.selfColumnsBase && this.selfColumnsBase.length ? this.selfColumnsBase : this.columnsBaseLocal
				let obj = columnsBaseLocal.find(itemBase => {
					return itemBase.prop === value
				})
				if (obj) {
					return value !== 'frontIndex'
				} else {
					return false
				}
			})
			if (this.defaultColumns) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					return this.defaultColumns.some(subItem => {
						return subItem === item.prop
					})
				})
			} else if (this.defaultColumnsRecei) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					return this.defaultColumnsRecei.some(subItem => {
						return subItem === item.prop
					})
				})
			}
			this.customColumnsPopShow = true
		},
		// 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value) // getColumnsValues在本页面无作用
				this.customColumnsKeys = columnsKeys
				this.getData()
				this.isEdit = false // 当新增或修改费用时打开自定义表头，确定后，隐藏保存取消按钮
			}
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			let result = []
			value.map(item => {
				result.push(item)
			})
			result = Array.from(new Set(result))
			return result
		},

		// 财务内通用搜索方法
		/*
      @hms 时间区间手动添加时分秒 ' 00:00:00' ' 23:59:59'
      @gle  gle===true时时间区间使用le ge, gle==='rangeMinMax'时表示range使用字段max，min且type为eq， 而不是默认的eq
      @selectRecordArr 数组this.multipleSelection1 选中的记录arr
    */
		finCommonSearch(dataQuery = [], searchOption, hms, gle, multipleSelection, otherParams = {}) {
			if (!searchOption || !searchOption.addFilter || !searchOption.addFilter.searchInputGroup) {
				return console.error('searchOption参数有误')
			}
			if (multipleSelection && multipleSelection.length) {
				this.listSelectRecordArr = multipleSelection.map(item => ({ ...item }))
			}
			const { special } = otherParams
			const filterGroups = searchOption.addFilter.filterGroups
			searchOption.addFilter.searchInputGroup.forEach(item => {
				const { key, value, range, req, valueReq, scope } = item
				if (special) {
					if (special.key && special.key === key) {
						special['obj'][key] = special.arrayToString ? value.toString() : value
						return
					}
				}
				let filterGroup = filterGroups[key]
				if (!filterGroup) return
				let rangeMinMax = filterGroup.rangeMinMax
				if (range && (range.min || range.max)) {
					if (gle === 'rangeMinMax' || key === 'canSettleApplyAmt' || rangeMinMax) {
						range.min && dataQuery.push({ column: key + 'Min', type: 'eq', value: range.min })
						range.max && dataQuery.push({ column: key + 'Max', type: 'eq', value: range.max })
					} else {
						range.min && dataQuery.push({ column: key, type: 'ge', value: range.min })
						range.max && dataQuery.push({ column: key, type: 'le', value: range.max })
					}
					return
				}
				if (valueReq && item[valueReq]) {
					return dataQuery.push({ column: valueReq, type: 'eq', value: item[valueReq] })
				}
				let filterType = filterGroup.type
				gle = gle || filterGroup.gle
				hms = hms || filterGroup.hms
				let scopeType = 'in'
				if (filterGroup.scope && scope) {
					scopeType = scope === '1' ? 'notIn' : 'in'
				}
				if (value) {
					if (value instanceof Array) {
						if (value.length === 0) return
						if (['cascader', 'lsCascader', 'diyCascader'].includes(filterType)) {
							dataQuery.push({ column: key, type: 'eq', value: value[value.length - 1] })
						} else if (filterType === 'datetimerange' || filterType === 'lsDatetimerange' || filterType === 'monthrange') {
							let [start, end] = filterGroup.ranges || []
							value[0] && dataQuery.push({ column: start || key + 'Start', type: 'eq', value: value[0] })
							value[1] && dataQuery.push({ column: end || key + 'End', type: 'eq', value: value[1] })
						} else if (filterType === 'daterange' || filterType === 'lsDaterange') {
							// 有些时间字段命名不符合 key + 'start' 需要在配置内添加ranges[startKey, endKey]
							let [start, end] = filterGroup.ranges || []
							if (gle === true) {
								value[0] && dataQuery.push({ column: start || key, type: 'ge', value: value[0] + (hms ? ' 00:00:00' : '') })
								value[1] && dataQuery.push({ column: end || key, type: 'le', value: value[1] + (hms ? ' 23:59:59' : '') })
								return
							}
							value[0] && dataQuery.push({ column: start || key + 'Start', type: 'eq', value: value[0] + (hms ? ' 00:00:00' : '') })
							value[1] && dataQuery.push({ column: end || key + 'End', type: 'eq', value: value[1] + (hms ? ' 23:59:59' : '') })
						} else {
							// 费用列表 费用名称、费用英文名共用一个请求字段
							let reqKey = filterGroup['reqKey']
							if (reqKey) {
								let find = dataQuery.find(v => v.column === reqKey)
								if (find) {
									find.value += ',' + value.join(',')
								} else {
									dataQuery.push({ column: reqKey, type: scopeType, value: value.join(',') })
								}
							} else {
								dataQuery.push({ column: key, type: scopeType, value: filterGroup['isList'] ? value : value.join(',') })
							}
						}
					} else {
						if (filterType === 'input') {
							return dataQuery.push({ column: key, type: 'like', value: value.replace(/[\s+,+，+]+/g, ' ') })
						}
						dataQuery.push({ column: key, type: filterType === 'input' ? 'like' : 'eq', value: req || value })
					}
				}
			})
		},
		// 财务内通用自定义表头对比历史方法 体验：滚动条保持原位置
		// 并处理排序与自定义表头一起使用问题
		finCommonColumns(res, tableOption = 'option1', selfColumnsBase = 'selfColumnsBase', configColumns = 'configColumns', params) {
			if (!res || !res.data || !this[tableOption] || !this[selfColumnsBase] || !this[configColumns]) {
				if (process.env.NODE_ENV === 'development') {
					// 开发环境时页面直接报弹窗错误
					this.$msgErrClose('自定义表头处理参数有误！')
				}
				// 其它环境时，为不影响用户直观体验，只打印报错日志
				console.error('自定义表头处理参数有误！')
				return
			}
			let columns = res.data.configColumns
			if (columns && columns.length) {
				if (this.backupCustomerColumns === columns.toString()) {
					return
				}
				this[tableOption].columns = columns.map(prop => this[selfColumnsBase].find(item => item.prop === prop)).filter(v => v)
				this[tableOption].sortable &&
					setTimeout(() => {
						let ref = this[tableOption]['__vm__']
						if (ref) {
							if (this.ascColumns && this.ascColumns.length) {
								ref.$refs.xTable1.sort(this.ascColumns[0], 'asc')
							} else if (this.descColumns && this.descColumns.length) {
								ref.$refs.xTable1.sort(this.descColumns[0], 'desc')
							}
						}
					}, 0)
				this.backupCustomerColumns = columns.toString()

				// 后端返回的columns会存在历史数据，影响拖拽排序。使用表格配置的columns，保持数据正确
				this[configColumns] = (params && params.configColumns) || this[tableOption].columns.map(item => item.prop)
			}
		},
		// 记录勾选项， 请求列表接口后渲染数据及分页以及选中
		dealPaginationSelect(option, resData, list, key) {
			Object.assign(this.option1.pagination, resData)

			// 处理选中记录
			if (this.isListSelectRecord && this.listSelectRecordArr.length && key) {
				let selectIds = this.listSelectRecordArr.map(item => item[key])
				list = list.filter(item => !selectIds.includes(item[key]))
				list.unshift(...this.listSelectRecordArr)
				// 用nextTick不行，在table组件内访问table ref访问不到
				setTimeout(() => {
					this.listSelectRecordArr.forEach(row => {
						this.$refs.listTableRef && this.$refs.listTableRef.setCheckRow(row, true)
					})
				}, 100)
			}
			option.data = list
		},

		// enter按键事件
		handleKeyDown(e) {
			e = window.event || e
			if (e.keyCode === 13) {
				if (!this.callbackSearch) {
					this.search()
				} else {
					this.callbackSearch()
				}
			}
		}
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
	},
	activated() {
		if (this.keyDownActive) {
			window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		}
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	}
}
