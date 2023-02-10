import Vue from 'vue'
import { mapGetters } from 'vuex'
import { queryPayOrderByWriteoffNo } from '@/api/fin/writeoffPay'
import { querySourceTypeByNo, orderRoute } from '@/api/fin/fee'
import { employeeSelectlist } from '@/api/companyResource' // departmentTreeList
import { checkAuth, checkAuthTab } from '@/utils/checkAuth'
import { info as invoiceReceivableInfo } from '@/api/fin/invoiceReceivable'
import { decimalFixed2, deepCloneLs } from '@/views/finance/utils/finance'

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
	data () {
		return {
			option: {
				edit: false,
				columns: [
					{ prop: 'settleCompName', label: '分公司', type: 'text', key: 'settleCompName', width: 160 },
					{ prop: 'settleCorpName', label: '结算单位', type: 'input', width: 160, key: 'settleCorpName', disabled: true },
					{ prop: 'serviceCode', label: '服务项', type: 'select', key: 'serviceCode', width: 100, disabled: true },
					{ prop: 'feeName', label: '费用名称', type: 'input', key: 'feeName', width: 110, disabled: true },
					{ prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName', width: 130 },
					{ prop: 'unitCount', label: '数量', type: 'input', key: 'unitCount', width: 70, disabled: true },
					{ prop: 'unitPrice', label: '单价', type: 'input', key: 'unitPrice', disabled: true },
					{ prop: 'feeUnit', label: '计费单位', type: 'select', key: 'feeUnit', width: 80, disabled: true },
					{ prop: 'feeAmt', label: '金额', type: 'input', key: 'feeAmt', disabled: true },
					{ prop: 'currency', label: '币种', type: 'select', key: 'currency', width: 70, propInDict: 'validCurrency', filterable: true, disabled: true },
					{ prop: 'taxRate', label: '税率', type: 'text', key: 'taxRate', width: 70, disabled: true, formatter: (row, pItem) => { if (row.taxRate) { return Number(row.taxRate) * 100 + '%' } else { return row.taxRate } } },
					{ prop: 'taxAmt', label: '税额', type: 'text', key: 'taxAmt' },
					{ prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text', key: 'feeAmtWithoutTax', width: 100 },
					{ prop: 'remark', label: '费用备注', type: 'input', key: 'remark', width: 130 }
				],
				data: [],
				operationBtns: {
					width: '60px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, option) => {
						if (action === 'Edit') {
							this.handleEdit(row);
						} else if (action === 'SingleEdit') {
							this.handleSingleEdit(row);
						} else if (action === 'Copy') {
							this.handleCopy(row, option);
						} else if (action === 'Delete') {
							this.handleDelete($index, row, option);
						} else if (action === 'Save') {
							this.handleSave($index, row, option);
						} else if (action === 'showLog') {
							this.showLog(row)
						} else if (action === 'showDetail') {
							this.showDetail(row)
						} else if (action === 'showDiff') {
							this.showDiff(row)
						} else if (action === 'Cancel') {
							this.handleCancel(row)
						} else {
							this['handle' + action] && this['handle' + action](row)
						}
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
				maxHeight: 515,
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
      sortParams: {}, // 表格排序参数
    }
  },
  created() {
    if (!this.columnsBase) this.columnsBase = []
    this.columnsBaseLocal = deepCloneLs(this.columnsBase)
    this.columnsBaseLocal.forEach(item => {
      // 此处增加需要搜索下拉查询的prop的内容
      if (item.prop === 'settleCorpName') {
        item = Object.assign(item, {
          type: 'autocomplete',
          clearable: true,
          querySearch: (queryString, cb, row, item) => {
            this.selectedOptionItem = ''
            if (!row.receipayType) {
              return this.$message({
                message: '须先选择收付类型',
								type: 'error',
								showClose: true,
								offset: 162
              })
						} else if (row.receipayType === 'pay') {
              // 费用单时不做此验证
              if (!this.isFinBillFee && (!row.serviceCode || !row.feeCode)) {
                return this.$message({
                  message: '应付的结算单位，须先选择费用名称、服务项',
									type: 'error',
									duration: 5000,
									showClose: true,
									offset: 162
                })
							}
							if (!queryString) return // 为空时不查询
              this.queryFinSupplierList({
                queryString,
								serviceCode: row.serviceCode,
								feeCode: row.feeCode, // 20210929当录入费用项的属性，要求成对录入的时候，下拉选择供应商时，应该能选到类型为客户的结算单位。
                size: 20
              }, cb)
            } else {
							if (!queryString) return // 为空时不查询
              this.querySettleUnit({
                queryString,
								unitTypes: 'customer,supplier,company,DEPT',
                isAdd: true,
                isForbid: true
              }, cb)
            }
          },
          select: (optionItem, row) => {
            this.selectedOptionItem = optionItem
            row[item.prop] = optionItem.value
						row[item.prop.replace('Name', 'Code')] = optionItem.key
						if (row.receipayType === 'pay') {
							this.settleCorpNamePay = optionItem.value
							this.settleCorpCodePay = optionItem.key
						} else if (row.receipayType === 'receive') {
							this.settleCorpNameRecei = optionItem.value
							this.settleCorpCodeRecei = optionItem.key
							this.preVerifyNeedBl(row, optionItem)
							this.modifyBlByFeeAndUnit(row)
						}
          },
          change: (val, row) => {
						// if (!val || val !== this.selectedOptionItem.value) {
						// 	row[item.prop] = ''
            //   row[item.prop.replace('Name', 'Code')] = ''
						// }
            // 延时140ms获取select中的改变，清除用户手输的值。select晚125ms左右
            setTimeout(() => {
              if (this.selectedOptionItem === '') {
                row[item.prop] = ''
								row[item.prop.replace('Name', 'Code')] = ''
              } else {
								this.selectedOptionItem === ''
							}
            }, 140)
					},
					input: (val, row) => {
						row.settleCorpName = row.settleCorpName.trim()
					}
        })
      } else if (item.prop === 'feeName') {
        item = Object.assign(item, {
					type: 'autocomplete',
          clearable: true,
          querySearch: (queryString, cb, row) => {
						this.selectedOptionItem = ''
						if (!row.receipayType) {
              return this.$message({
                message: '须先选择收付类型',
								type: 'error',
								showClose: true,
								offset: 162
              })
						}
						if (!queryString) return // 为空时不查询
						if (this.isSpecialFee) {
							if (this.useNo) {
								this.querySpecialFeeItemList({orderNo: this.useNo, queryString, operation: 'add'}, cb)
							} else {
								this.querySpecialFeeItemList({orderNo: this.orderNo, queryString, operation: 'add'}, cb)
							}
						} else {
							if (this.useNo) {
								this.queryFeeItemList({ orderNo: this.useNo, receipayType: row.receipayType, queryString, operation: 'add' }, cb) // this.$store.state.finance.orderNo. businessType: this.dictMap['orderFeeBusinessType'], serviceCode: row.serviceCode,
							} else {
								this.queryFeeItemList({ orderNo: this.orderNo, receipayType: row.receipayType, queryString, operation: 'add' }, cb) // this.$store.state.finance.orderNo. businessType: this.dictMap['orderFeeBusinessType'], serviceCode: row.serviceCode,
							}
						}
          },
          select: (optionItem, row) => {
            this.selectedOptionItem = optionItem
            row['feeName'] = optionItem.value
            row['feeCode'] = optionItem.key
						row['feeEnName'] = optionItem.feeEnName
						if (optionItem.feeUnit) {
							let feeUnit = optionItem.feeUnit.toLowerCase()
							if (feeUnit === 'bill' || feeUnit === 'count' || feeUnit === 'm' || feeUnit === 'rt' || feeUnit === 'unit' || feeUnit === 'teu') {
								row['feeUnit'] = feeUnit
							} else {
								row['feeUnit'] = feeUnit.toUpperCase()
							}
							this.setUnitCount(row, this.containerCount)
						}
						if (!row['currency']) {
							row['currency'] = optionItem.currency // 获取费用项默认的币种
						}
						row.orderServices = optionItem.orderServices
						let orderServices = row.orderServices
            if (this.$route.name === 'FinBillListDetail' && row.receipayType === 'pay') {
              this.getTaxRate && this.getTaxRate(row)
            } else	if (orderServices.length === 1) {
							row['serviceName'] = orderServices[0].serviceName
							row['serviceCode'] = orderServices[0].serviceCode
							if (row.receipayType === 'pay') {
								this.serviceNamePay = row['serviceName']
								this.serviceCodePay = row['serviceCode']
								this.getTaxRate && this.getTaxRate(row)
							} else if (row.receipayType === 'receive') {
								this.serviceNameRecei = row['serviceName']
								this.serviceCodeRecei = row['serviceCode']
							}
						}
						if (optionItem.finGroup === 'deposit') {
							row.isNoNeedBlFee = true
						} else {
							row.isNoNeedBlFee = false
						}
						this.modifyBlByFeeAndUnit(row)
          },
          change: (val, row) => {
            setTimeout(() => {
              if (this.selectedOptionItem === '') {
                row['feeName'] = ''
                row['feeCode'] = ''
                row['feeEnName'] = ''
              } else {
								this.selectedOptionItem === ''
							}
            }, 140)
          },
          clear: (row, item) => {
            row.serviceCode = ''
						row.serviceName = ''
						row.feeUnit = ''
          }
        })
      } else if (item.prop === 'serviceName' || item.prop === 'serviceCode') {
        item = Object.assign(item, {
          prop: 'serviceName',
          type: 'autocomplete',
          clearable: true,
          debounce: 0,
          querySearch: (queryString, cb, row, item) => {
            if (row.feeCode) {
              console.log('row.orderServices: ', row.orderServices)
              let orderServices = row.orderServices
              if (orderServices) {
                orderServices = orderServices.map(item => {
                  return {
                    value: item.serviceName,
                    key: item.serviceCode
                  }
								})
								if (orderServices.length === 0) {
                  this.$message({
                    message: '该费用项无对应服务项，无法添加该费用',
                    type: 'error',
										showClose: true,
										offset: 162
                  })
								}
								orderServices = orderServices ? orderServices : []
								cb(orderServices)
              } else if (!orderServices) {
								if (this.isSpecialFee) {
									if (this.useNo) {
										this.querySpecialFeeItemList({orderNo: this.useNo, queryString: row.feeName, operation: 'add'}).then(res => {
											let optionItem = res.find(item => {
												return item.feeCode === row.feeCode
											})
											orderServices = optionItem && optionItem.orderServices
											if (orderServices) {
												orderServices = orderServices.map(item => {
													return {
														value: item.serviceName,
														key: item.serviceCode
													}
												})
											}
											orderServices = orderServices ? orderServices : []
											cb(orderServices)
										})
									} else {
										this.querySpecialFeeItemList({orderNo: this.orderNo, queryString: row.feeName, operation: 'add'}).then(res => {
											let optionItem = res.find(item => {
												return item.feeCode === row.feeCode
											})
											orderServices = optionItem && optionItem.orderServices
											if (orderServices) {
												orderServices = orderServices.map(item => {
													return {
														value: item.serviceName,
														key: item.serviceCode
													}
												})
											}
											orderServices = orderServices ? orderServices : []
											cb(orderServices)
										})
									}
								} else {
									if (this.useNo) {
										this.queryFeeItemList({ orderNo: this.useNo, receipayType: row.receipayType, queryString: row.feeName, operation: 'add' }).then(res => {
											let optionItem = res.find(item => {
												return item.feeCode === row.feeCode
											})
											orderServices = optionItem && optionItem.orderServices
											if (orderServices) {
												orderServices = orderServices.map(item => {
													return {
														value: item.serviceName,
														key: item.serviceCode
													}
												})
											}
											orderServices = orderServices ? orderServices : []
											cb(orderServices)
										})
									} else {
										this.queryFeeItemList({ orderNo: this.orderNo, receipayType: row.receipayType, queryString: row.feeName, operation: 'add' }).then(res => {
											let optionItem = res.find(item => {
												return item.feeCode === row.feeCode
											})
											orderServices = optionItem && optionItem.orderServices
											if (orderServices) {
												orderServices = orderServices.map(item => {
													return {
														value: item.serviceName,
														key: item.serviceCode
													}
												})
											}
											orderServices = orderServices ? orderServices : []
											cb(orderServices)
										})
									}
								}
							}
            } else {
              cb([])
            }
          },
          select: (optionItem, row) => {
						row['serviceName'] = optionItem.value
						row['serviceCode'] = optionItem.key
						if (row.receipayType === 'pay') {
							this.serviceNamePay = optionItem.value
							this.serviceCodePay = optionItem.key
							this.getTaxRate && this.getTaxRate(row)
						} else if (row.receipayType === 'receive') {
							this.serviceNameRecei = optionItem.value
							this.serviceCodeRecei = optionItem.key
						}
          },
          change: (val, row) => {
						console.log(val)
						row['serviceName'] = ''
						row['serviceCode'] = ''
          },
          clear: (row, item) => {
            row.serviceCode = ''
          },
          focus: (row) => {
            if (!row.feeCode || row.feeCode === '') {
              this.$message({
                message: '须先选择费用名称，再选择服务项',
								type: 'error',
								duration: 5000,
								showClose: true,
								offset: this.isSpecialFee ? 108 : 162
              })
              return
            }
          }
        })
      } else if (item.prop === 'unitPrice') {
        item = Object.assign(item, {
          validateInput: this.validateInput,
					width: 90,
					change: (value, row, item, option) => {
						if (this.isBusinessFee) {
							if (!row.receipayType) {
								row.feeAmt = ''
								return this.$message({
									message: '须先选择收付类型',
									type: 'error',
									showClose: true,
									offset: 162
								})
							}
							// if (value < 0) {
							// 	if (row.receipayType === 'receive') {
							// 		this.$message({
							// 			message: `录入应收负数，再录入负数类型${this.isModifyFee ? '' : '（字段可从自定义表头添加）'}`,
							// 			type: 'warning',
							// 			duration: 5000,
							// 			showClose: true,
							// 			offset: 162
							// 		})
							// 	} else if (row.receipayType === 'pay') {
							// 		this.$message({
							// 			message: `录入应付负数，再录入负数类型和跟进人${this.isModifyFee ? '' : '（字段可从自定义表头添加）'}`,
							// 			type: 'warning',
							// 			duration: 5000,
							// 			showClose: true,
							// 			offset: 162
							// 		})
							// 	}
							// }
						}
					}
        })
      } else if (item.prop === 'unitCount') {
        item = Object.assign(item, {
          validateInput: this.validateInput
        })
      } else if (item.prop === 'feeUnit') {
				item = Object.assign(item, {
					filterable: true,
					change: (val, row) => {
						this.setUnitCount(row, this.containerCount)
					}
				})
			} else if (item.prop === 'feeAmt') {
        item = Object.assign(item, {
          validateInput: this.validateInput,
					width: 90
        })
      } else if (item.prop === 'negativeType') {
				item = Object.assign(item, {
					clearable: true,
					placeholder: '请选择',
					dependentParam: 'receipayType',
					propInDictObj: {
						'receive': 'feeRecvNegativeType',
						'pay': 'feePayNegativeType'
					},
					visibleChange: (item, row) => {
						if (row.unitPrice >= 0) {
							this.$message({
								message: '录入负数，才需选择负数类型',
								type: 'error',
								showClose: true,
								offset: this.isSpecialFee ? 108 : 162
							})
						}
					},
					// remote: true,
					// remoteSelectList: [],
					// visibleChange: (queryString, item, row) => {
					// 	let remoteSelectList = []
					// 	if (row.unitPrice >= 0) {
					// 		this.$message({
					// 			message: '录入负数，才需选择负数类型',
					// 			type: 'error',
					// 			showClose: true,
					// 			offset: 162
					// 		})
					// 	} else {
					// 		let dictOne = null
					// 		if (row.receipayType === 'receive') {
					// 			dictOne = this.dictMapObj['feeRecvNegativeType']
					// 		} else if (row.receipayType === 'pay') {
					// 			dictOne = this.dictMapObj['feePayNegativeType']
					// 		}
					// 		console.log(dictOne)
					// 		if (dictOne) {
					// 			for(let key in dictOne) {
					// 				remoteSelectList.push({ value: key, label: dictOne[key] })
					// 			}
					// 		}
					// 	}
					// 	item.remoteSelectList = remoteSelectList
					// 	if (this.option1.data.some(item => {
					// 		return item === row
					// 	})) {
					// 		this.$refs.option1 && this.$refs.option1.$refs.xTable1.updateData()
					// 	} 
					// 	if (this.option2 && this.option2.data && this.option2.data.some(item => {
					// 		return item === row
					// 	})) {
					// 		this.$refs.option2 && this.$refs.option2.$refs.xTable1.updateData()
					// 	}
					// },
					change: (value, item, row) => {
						// if (value === 'order_split') {
						// 	this.$message({
						// 		message: '选择拆单后，再录入原单号',
						// 		type: 'warning',
						// 		duration: 5000,
						// 		showClose: true,
						// 		offset: 162
						// 	})
						// }
					},
					formatter: ({row}) => {
						let dictOne = null
						if (row.receipayType === 'receive') {
							dictOne = this.dictMapObj['feeRecvNegativeType']
						} else if (row.receipayType === 'pay') {
							dictOne = this.dictMapObj['feePayNegativeType']
						}
						if (dictOne) {
							return dictOne[row.negativeType]
						} else {
							return ''
						}
					}
				})
			} else if (item.prop === 'negativeFollowerId') {
				item = Object.assign(item, {
					remote: true,
					clearable: true,
					placeholder: '请输入',
					remoteSelectList: [],
					remoteMethod: this.employeeSelectlistMx,
					visibleChange: (queryString, item, row) => {
						if (!row.unitPrice || row.unitPrice >= 0) {
							this.$message({
								message: '录入应付负数，跟进人必填；应收负数，跟进人非必填',
								type: 'error',
								showClose: true,
								offset: 162
							})
						}
					},
					change: this.personChangeMx
				})
			} else if (item.prop === 'splitFromOrderNo') {
				item = Object.assign(item, {
					clearable: true,
					placeholder: '请输入',
					focus: (row, item) => {
						if (row.receipayType !== 'receive' || row.unitPrice >= 0 || row.negativeType !== 'order_split') {
							this.$message({
								message: '录入应收负数且属于拆单，才需输入原单号',
								type: 'error',
								showClose: true,
								offset: 162
							})
						}
					}
				})
			} else if (item.prop === 'blId') {
				item = Object.assign(item, {
					remote: true,
					clearable: true,
					placeholder: '请选择',
					multiple: true,
					remoteSelectList: [],
					visibleChange: (queryString, item, row) => {
						if (!row.receipayType) {
							return this.$message({
                message: '请先选择收付类型',
								type: 'error',
								showClose: true,
								offset: 162
              })
						} else if (row.receipayType === 'receive') {
							if (!row.feeCode || !row.settleCorpCode) {
								this.$message({
									message: '请选择费用名称和结算单位，再关联提单号',
									type: 'error',
									showClose: true,
									offset: 162
								})
							}
						} else if (row.receipayType === 'pay') {
							this.$message({
								message: '应付费用无需关联提单号',
								type: 'error',
								showClose: true,
								offset: 162
							})
						}
					},
					change: (value, item, row) => {
					},
					formatter: ({ row }) => {
						if (row.blId && row.blId.length) {
							return row.blId.map(id => {
								let bl = this.blList.find(bl => bl.blId === id)
								return bl && `【${bl.blType === 'mbl' ? 'M' : bl.blType === 'hbl' ? 'H' : bl.blType === 'mawb' ? '主' : bl.blType === 'hawb' ? '分' : ''}】${bl.blNo ? bl.blNo : bl.blId}`
							}).join(',')
						} else {
							return ''
						}
					},
					clear: (row, item) => {
          }
				})
			} else if (item.prop === 'settleOrderNos') { 
        item = Object.assign(item, {
          type: 'columnTip',
          width: 148,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'settleOrderNos',
                no,
                componentProps
              })
            }
          }
        })
      } else if (item.prop === 'writeoffNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'writeoffNos',
                no,
                componentProps
              })
            }
          }
        })
      } else if (item.prop === 'settleTimes') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: []
          }
        })
      } else if (item.prop === 'invoiceNos' || item.prop === 'receiveInvocieNos' || item.prop === 'payInvocieNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index, row, item) => {
							let invoiceReceivableIds = []
							let receipayType = ''
              // let invoiceReceivableIds = row.invoiceReceivableIds_multiValue ? row.invoiceReceivableIds_multiValue : row.invoiceNos_multiValue
							if (item.prop === 'invoiceNos') {
								invoiceReceivableIds = row.invoiceReceivableIds_multiValue ? row.invoiceReceivableIds_multiValue : row.invoiceNos_multiValue
							} else if (item.prop === 'receiveInvocieNos') {
								invoiceReceivableIds = row.receiveInvocieIds_multiValue
								receipayType = 'receive'
							} else if (item.prop === 'payInvocieNos') {
								invoiceReceivableIds = row.payInvocieIds_multiValue
								receipayType = 'pay'
							}
							let invoiceReceivableId = invoiceReceivableIds[index]
							this.showColumnDetail({
                type: 'invoiceNos',
								no: invoiceReceivableId, // no,
								componentProps,
								receipayType
							})
            }
          }
        })
      } else if (item.prop === 'payApplySettleNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'paySettleApplyNo',
                no,
                componentProps
              })
            }
          }
        })
      } else if (item.prop === 'payOrderNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'pay_order',
                no,
                componentProps
              })
            }
          }
        })
      } else if (item.prop === 'acctVoucherNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let voucherSeqNos = row.voucherSeqNos_multiValue ? row.voucherSeqNos_multiValue : row.acctVoucherNos_multiValue
              let voucherSeqNo = voucherSeqNos[index]
              this.voucherView({ voucherSeqNo })
            }
          }
        })
      } else if (item.prop === 'transferAcctVoucherNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let transferVoucherSeqNos = row.transferVoucherSeqNos_multiValue ? row.transferVoucherSeqNos_multiValue : row.transferAcctVoucherNos_multiValue
              let transferVoucherSeqNo = transferVoucherSeqNos[index]
              this.voucherView({ voucherSeqNo: transferVoucherSeqNo })
            }
          }
        })
      } else if (item.prop === 'frontIndex') {
        item = Object.assign(item, {
          sortable: false
        })
      } else if (item.prop === 'jointToOrderNo') {
				item = Object.assign(item, {
					label: '对手单号',
					type: 'button',
					width: 120,
					operationBtns: {
						show: true,
						callback: (action, index, row, option) => {
							this.showOneNoDetail('order', row.jointToOrderNo)
						},
					},
				})
			}
		})
		checkAuthTab(this)
    // console.log('``````````````mixin created')
    // mixin created 早于组件created，延迟运行以下代码，如果组件使用async created，则需把以下方法放入组件内
    setTimeout(() => {
      if (this.pageSizeUrl && (this.option1 || this.tableOption)) {
        this.dealPageSize(this.pageSizeUrl, (this.option1 || this.tableOption).pagination)
      }
		}, 0);
	},
	activated() {
		if (this.componentProps) { // 处理columnTip不消失
			this.componentProps.show = true
			this.componentProps.show = false
		}
	},
	methods: {
		refreshListPage() {
			this.handleCurrentChange && this.handleCurrentChange(1)
		},
		/**
     * code规则：页面的pageCode与路由的name相同，且不含“-”；子模块的code包含一个“-”；除tab页和无子模块的的页面增加一个'基本信息'的子模块(用于解决树勾选方面的问题)，moduleCode是'page-show'。
     * button的moduleCode命名规则：'btn' + '-' + button的标识，例如'btn-closeApply'。
     * tab页的moduleCode命名规则：'tab' + '-' + tab的标识，例如'tab-regList'。
		 * 如果子模块是一个路由页面，moduleCode命名规则：'route' + '-' + 路由的name(首字母大写)。
     * 其他功能(如果有，非必要)的moduleCode命名规则：'other' + '-' + 其他功能的标识，例如'other-xxx'。
     * 子模块里面的功能路径url是后期用于后台鉴别接口权限，如果该模块有调接口才填写，多个url用英文逗号隔开，(编辑、提交功能路径不设置)
     * 各个页面和tab页(需使用tabsList和activeName变量)的鉴权已处理，各个页面的按钮、其他功能(如果有)需在各个页面调用checkAuth，传入code，自行处理。
     */
    checkAuth(pageCode, moduleCode, subModuleCode) {
      return checkAuth(pageCode, moduleCode, subModuleCode)
    },
		// 默认验证小于100亿，还可以验证正数，params传入{positive:true}
		validateMoney(amt, params = {}) {
			amt = Number(amt)
			if (isNaN(amt)) {
				this.$message({
					type: 'error',
					message: '数字输入不正确！',
					showClose: true
				})
				return false
			}
			if (amt > 10000000000) {
				this.$message({
					type: 'error',
					message: '输入的数字不能大于100亿！',
					showClose: true
				})
				return false
			}
			let { positive } = params
			if (positive) {
				if (amt < 0) {
					this.$message({
						type: 'error',
						message: '请输入正数！',
						showClose: true
					})
					return false
				}
			}
			return true
		},
		validateInput(value, row, pItem, changeE) {
			// 如果需要限制正数，亦可在pItem中添加positive: true
			// changeE表示是否是input change的value
			if (!value) return
			let positive = false
			if (pItem.prop === 'unitCount') {
				// positive = true // 以下特殊处理相当于positive: true
				// 特殊处理：数量输入按单位控制，箱、票、件为整数，吨，立方，运费吨，TEU最大可填4位小数
				let feeUnit = (row.feeUnit||'').toLowerCase()
				if (feeUnit === 'unit' || feeUnit === 'bill' || feeUnit === 'count' || feeUnit === 'teu') {
					if (!/^\d+$/.test(value)) {
						this.$message({
							type: 'error',
							message: '请输入正确的数字！',
							showClose: true
						})
						let res = /^\d+/.exec(row[pItem.prop])
						row[pItem.prop] = res && res[0]
					}
					return
				} else if (feeUnit === 'm' || feeUnit === 'rt') {
					if (!changeE) {
						if (!/^\d+(\.\d{0,4})?$/.test(value)) {
							this.$message({
								type: 'error',
								message: '请输入正确的数字！',
								showClose: true
							})
							let res = /^\d+(\.\d{0,4})?/.exec(row[pItem.prop])
							row[pItem.prop] = res && res[0]
						}
					} else {
						if (!/^\d+(\.\d{1,4})?$/.test(value)) {
							this.$message({
								type: 'error',
								message: '请输入正确的数字！',
								showClose: true
							})
							let res = /^\d+(\.\d{1,4})?/.exec(row[pItem.prop])
							row[pItem.prop] = res && res[0]
						}
					}
					return
				}
			}
			positive = positive || pItem.positive
      let negative = typeof pItem.negative === 'function' ? pItem.negative(row) : pItem.negative
			if (!changeE) {
				if (positive) {
					if (!/^\d+(\.\d{0,2})?$/.test(value)) {
						this.$message({
							type: 'error',
							message: '请输入正确的数字！',
							showClose: true
						})
						let res = /^\d+(\.\d{0,2})?/.exec(row[pItem.prop])
						row[pItem.prop] = res && res[0]
					}
				} else {
					if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
						this.$message({
							type: 'error',
							message: '请输入正确的数字！',
							showClose: true
						})
						let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
						row[pItem.prop] = res && res[0]
					}
				}
			} else {
				if (positive) {
					if (!/^\d+(\.\d{1,2})?$/.test(value)) {
						this.$message({
							type: 'error',
							message: '请输入正确的数字！',
							showClose: true
						})
						let res = /^\d+(\.\d{1,2})?/.exec(row[pItem.prop])
						row[pItem.prop] = res && res[0]
					}
        } else if (negative) {
          if (!/^-\d+(\.\d{1,2})?$/.test(value)) {
            this.$message({
              type: 'error',
              message: pItem.errMsg || '请输入负数！',
              showClose: true
            })
            let res = /^-\d+(\.\d{1,2})?/.exec(row[pItem.prop])
            row[pItem.prop] = res && res[0]
          }
        } else {
					if (!/^-?\d+(\.\d{1,2})?$/.test(value)) {
						this.$message({
							type: 'error',
							message: '请输入正确的数字！',
							showClose: true
						})
						let res = /^-?\d+(\.\d{1,2})?/.exec(row[pItem.prop])
						row[pItem.prop] = res && res[0]
					}
				}
			}
		},
		// 获取结算单位
    // 注意！注意！！注意！！！注意！！！！！！！！！！！！！！！！！！！！！！！！！
    // 费用录入时下拉结算单位一定要设置isForbid为true过滤掉黑名单
    querySettleUnit(param, cb) { // 此处param是一个对象或一个字符串
      // 处理请求空格---------beigin
      if(typeof param === 'object'){
        for (const key in param) {
          if (Object.hasOwnProperty.call(param, key)) {
            const element = param[key];
            if(typeof element === 'string'){
              param[key] = element.trim()
            }
          }
        }
      } else if (typeof param === 'string'){
        param = param.trim()
      }
      // 处理请求空格---------end
			return this.$store.dispatch('dict/querySettleUnit', param).then(data => {
				cb && cb(data)
				return data
			})
		},
		// 用于remote,  isNotSearch 是否不是搜索组件
    // 注意！注意！！注意！！！注意！！！！！！！！！！！！！！！！！！！！！！！！！
    // 费用录入时下拉结算单位一定要设置isForbid为true过滤掉黑名单
    querySettleUnit2(param, item, isNotSearch, remoteList) {
      // 处理请求空格---------beigin
      if (typeof param === 'object') {
        for (const key in param) {
          if (Object.hasOwnProperty.call(param, key)) {
            const element = param[key];
            if (typeof element === 'string') {
              param[key] = element.trim()
            }
          }
        }
      } else if (typeof param === 'string') {
        param = param.trim()
      }
      // 处理请求空格---------end
      isNotSearch = isNotSearch === true
      // 判断当前引用mixin组件是否是含有搜索条件的组件，有则表示列表，搜索添加参数containTemporary:'all'
      let addFilter = (this.searchOption || this.searchOption1 || {})['addFilter']
      if (!isNotSearch && addFilter && typeof param === 'object') {
        param = Object.assign({}, param, { containTemporary: 'all', isAdd: false})
      }
			this.$store.dispatch('dict/querySettleUnit', param).then(data => {
        if (!isNotSearch && this.remoteSelectCommon(item, data, {label:'value',value:'key'}, param)) return
        if (remoteList){
          remoteList.splice(0, 1000, ...data.map(item => ({label: item.value,value: item.key}) ))
          return
        }
        item.remoteSelectList = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
    },
    // 用于remote,  isNotSearch 是否不是搜索组件
    baseSystemLineList(name, item, isNotSearch, remoteList) {
      isNotSearch = isNotSearch === true
      let param = { name, state: 'valid' }
      this.$store.dispatch('dict/baseSystemLineList', param).then(data => {
        if (!isNotSearch && this.remoteSelectCommon(item, data, { label: 'value', value: 'key' }, param)) return
        if (remoteList) {
          remoteList.splice(0, 1000, ...data.map(item => ({ label: item.value, value: item.key })))
          return
        }
        item.remoteSelectList = data.map(item => {
          return Object.assign(item, { label: item.value, value: item.key })
        })
      })
    },
		// 员工下拉框
    getEmployeeList(queryString, item) {
	  	let data = {}
      if (typeof queryString === 'object'){
				data.name = queryString.name
				data.roleCodes = queryString.roleCodes
      } else {
				data.name = queryString
	  	}
      if ((this.searchOption || this.searchOption1 || {})['addFilter']) {
        data.status = data.status || 'all'
      }
      employeeSelectlist(data).then((res) => {
        // let list = res.data.map((item) => ({...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        let list = res.data.map((item) => ({ label: `${item.cname}(${item.employeeNo})`, value: item.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList.splice(0, 1000, ...list)
        console.log(item.remoteSelectList)
      })
    },
    // 起始地 远程搜索港口下拉数据   typeStr 海运basePortList、空运airportList、铁路baseRailPortList
    portSearch(queryString, item, port, portValue, typeStr) {
      let data = { queryString, portAttribute: port }
      if (typeof queryString === 'object'){
        data = queryString
      }
      this.$store.dispatch(`dict/${typeStr||'basePortList'}`, data).then(data => {
        if (this.remoteSelectCommon(item, data.map(item => ({ label: item.value, value: item[portValue || 'portId'] })))) return
        item.remoteSelectList = data.map(item => {
          return { label: item.value, value: item[portValue || 'portId'] }
        })
      })
    },
    // 空运港口
    airPortSearch(portName, portCodes, state, item) {
      this.$store
        .dispatch('dict/airportList', { portName, portCodes, state })
        .then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          item.data = portList
        })
    },
    // 统一处理remoteSelect的remoteSelectList    
    // param 可以获取到queryString等请求参数
    remoteSelectCommon(item, data, cfg = {label:'label', value:'value'}, param = {}) {
      // item无值，说明不是搜索条件
      if(!item) return
      let addFilter = (this.searchOption || this.searchOption1 || {})['addFilter']
      if(!addFilter) return
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
      if(!key) return 
      let searchItem = searchInputGroup.find(v => v.key === key)
      let remoteSelectList = data.map(item => {
        return {...item, label: item[cfg.label], value: item[cfg.value] }
      })
      let saveList = searchItem && searchItem.saveList || []
      let arr = remoteSelectList.filter((o) => {
        return !saveList.find((s) => s.value === o.value)
      })
      let result = [...saveList, ...arr]
      if (item.defaultList && !result.find(v => v.value === item.defaultList[0].value) && !param.queryString){
        result.unshift(item.defaultList[0])
      }
      item.remoteSelectList.splice(0, 1000, ...result)
      // console.log('接口请求···················');
      // console.log(searchItem);
      // console.log(item);
      return true
    },
		// 财务供应商结算单位列表
		queryFinSupplierList(param, cb) {
			return this.$store.dispatch('dict/queryFinSupplierList', param).then(data => {
				let results = data.map(item => {
					return {
						value: item.unitName,
						key: item.unitCode
					}
				})
				cb && cb(results)
				return results
			})
		},
		// 费用名称
		queryFeeItemList(params, cb) {
			return this.$store.dispatch('dict/queryFeeItemList', params).then(data => {
				cb && cb(data)
				return data
			})
		},
		queryFeeItemList2(params, item) {
			if (typeof param === 'string') {
				param = {
					queryString: param
				}
			}
			return this.$store.dispatch('dict/queryFeeItemList2', params).then(data => {
				item.remoteSelectList = data.map(item => {
					return item
				})
			})
		},
		queryFeeClassList(queryString, cb) {
			this.$store.dispatch('dict/queryFeeClassList', queryString).then(data => {
				cb && cb(data)
			})
		},
		// 根据订单号查询服务项列表
		queryServiceItemList(params) {
			this.$store.dispatch('dict/queryServiceItemList', params).then(data => {
			})
		},
		// 根据协同号查询服务项列表
		queryJointServiceItemList(params) {
			this.$store.dispatch('dict/queryJointServiceItemList', params).then(data => {
			})
		},
		// 获取专项管理费用项（财务模块提供）
		querySpecialFeeItemList(params, cb) {
			return this.$store.dispatch('dict/querySpecialFeeItemList', params).then(data => {
				cb && cb(data)
				return data
			})
		},
		// 查看凭证详情
		voucherView({ voucherSeqNo }) {
			// if(!voucherSeqNo) return this.$message.warning('缺少凭证唯一标识号')
			this.previewDialog.seqNo = voucherSeqNo
			this.previewDialog.show = true
		},
		computeMoneyTotalFront(matchObj = {'receive': 'option1', 'pay': 'option2'}) {
			let receiveOptionId, payOptionId
			if (matchObj.receive === 'option1') {
				receiveOptionId = 1
			} else if (matchObj.receive === 'option2') {
				receiveOptionId = 2
			} else {
				receiveOptionId = 1
			}
			let receiveData = []
			if (this['multipleSelection' + receiveOptionId] && this['multipleSelection' + receiveOptionId].length) {
				receiveData = this['multipleSelection' + receiveOptionId]
			} else {
				receiveData = this['option' + receiveOptionId] && this['option' + receiveOptionId].data ? this['option' + receiveOptionId].data : []
			}
      let currencys = receiveData.map(item => {
        return item.currency
      })
			currencys = [... new Set(currencys)]
			currencys.sort(function(a, b) {
				if (a === 'CNY') {
					return -1
				} else if (b === 'CNY') {
					return 1
				} else if (a === 'USD') {
					return -1
				} else if (b === 'USD') {
					return 1
				} else {
					return a - b
				}
			})
      this.moneyTotalReceive = currencys.map(item => {
        return {
          currency: item,
          sum: decimalFixed2(receiveData.reduce((sum, cur) => {
            if (item === cur.currency) {
							return sum + Number(cur.feeAmt)
            } else {
              return sum
            }
          }, 0))
        }
			})
			
			if (matchObj.pay === 'option1') {
				payOptionId = 1
			} else if (matchObj.pay === 'option2') {
				payOptionId = 2
			} else {
				payOptionId = 1
			}
			let payData = []
			if (this['multipleSelection' + payOptionId] && this['multipleSelection' + payOptionId].length) {
				payData = this['multipleSelection' + payOptionId]
			} else {
				payData = this['option' + payOptionId] && this['option' + payOptionId].data ? this['option' + payOptionId].data : []
			}
      currencys = payData.map(item => {
        return item.currency
      })
			currencys = [... new Set(currencys)]
			currencys.sort(function(a, b) {
				if (a === 'CNY') {
					return -1
				} else if (b === 'CNY') {
					return 1
				} else if (a === 'USD') {
					return -1
				} else if (b === 'USD') {
					return 1
				} else {
					return a - b
				}
			})
      this.moneyTotalPay = currencys.map(item => {
        return {
          currency: item,
          sum: decimalFixed2(payData.reduce((sum, cur) => {
            if (item === cur.currency) {
							return sum + Number(cur.feeAmt)
            } else {
              return sum
            }
          }, 0))
        }
			})
		},
		computeFeeSum(fees, param) {
			let currency = param && param.currency ? param.currency : 'currency'
			let feeAmt = param && param.feeAmt ? param.feeAmt : 'feeAmt'
			let returnType = param && param.returnType ? param.returnType : 'str'
			let feeSumList = []
			fees.forEach(item => {
				if (!item[currency]) return
				let f = feeSumList.find(subItem => {
					return subItem[currency] === item[currency]
				})
				if (!f) {
					feeSumList.push({
						currency: item[currency],
						sumAmt: Number(item[feeAmt])
					})
				} else {
					f.sumAmt += Number(item[feeAmt])
				}
			})
			if (returnType === 'list') {
				return feeSumList
			} else {
				return feeSumList.reduce((prev, curr, index) => {
					return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt).toNum(2) : prev + curr.currency + new LSnum(curr.sumAmt)
				}, '')
			}
		},
		// 兼容之前的悬浮框的调用。多数情况默认只需传第一个参数，如果是tab页调用需传第二个参数{ isTab: true }
		showColumnDetailHandle(params, otherParams = {}) {
			console.log(otherParams)
			this.componentProps = params.componentProps // 赋值当前的componentProps
			let { isTab } = otherParams
			this.showOneNoDetail(params.type, params.no, { isTab, row: params.componentProps.row, receipayType: params.receipayType, from: otherParams.from })
		},
		// tab页调用该方法才需传参数{ isTab: true }
		showOneNoDetail(type, no, otherParams = {}) {
			console.log(type, no, otherParams)
			this.isJumpRouteFromPage = true
      let { isTab, from, isFromSea, bkgReqNo } = otherParams
			if (isTab) {
				Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => { this.commonRoute && this.commonRoute(to, from) }
			}
			if (type === 'settleOrderNo' || type === 'settleOrderNos') {
				let arr = no.split('(')
				let noSp = arr[0]
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'SettlementDetail',
						query: { source: 'settlementDetail', settleOrderNo: noSp, fromOrder: true }
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'SettlementDetail',
						query: { source: 'settlementDetail', settleOrderNo: noSp }
					})
				}
			} else if (type === 'order') {
				orderRoute({ orderNo: no }).then(res => {
          if (res.code === 0) {
            let { orderNo, jointNo, businessType } = res.data
            if (businessType === 'ship_export_fcl' && isFromSea && (!this.dictMapObj.pricingOffOn || !this.dictMapObj.pricingOffOn.off)) {
              let routeUrl = this.$router.resolve({
                name: 'BookDetail',
                query: { orderNo, jointNo, bkgReqNo, roles:'pricing', activeComponent: 'fee', feeChild: 'specialManagementFee' } // source: 'jointList'为了从费用tab跳到订单协同详情tab
              })
              window.open(routeUrl.href, '_blank')
              return
            }
						let businessBroad = businessType ? businessType : ''
						let routeUrl = this.$router.resolve({
							name: 'OrderFee',
							params: { orderNo },
							query: { orderNo, jointNo, businessBroad, source: jointNo ? 'jointList' : '', source2: this.$route.name, feeChild: otherParams && otherParams.feeChild } // source: 'jointList'为了从费用tab跳到订单协同详情tab
						})
						window.open(routeUrl.href, '_blank')
					}
				})
			} else if (type === 'bill') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'BillDetail',
            query: { billId: no, fromOrder: true, }
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'BillDetail',
						query: { billId: no }
					})
				}
			} else if (type === 'settle_order_bill') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'SettlementBillDetail',
            query: { settleOrderBillId: no, fromOrder: true }
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'SettlementBillDetail',
						query: { billDetailParams: JSON.stringify({settleOrderBillId: no}) }
					})
				}
			} else if (type === 'finbill') {
				this.$router.push({
					name: 'FinBillListDetail',
					query: { name: 'FinBillListDetail', finBillNo: no }
				})
			} else if (type === 'receivable_reg') {
				this.$router.push({
          name: 'WriteoffRecvDetail',
					query: { receivableRegNo: no, source: 'regDetail' }
				})
			} else if (type === 'paySettleApplyNo' || type === 'pay_apply_order') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'SettleDetail',
            query: { applyNo: no, fromOrder: true}
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'SettleDetail',
						query: { applyNo: no }
					})
				}
			} else if (type === 'pay_order') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'OrderDetails',
            query: { payOrderNo: no, fromOrder: true}
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'OrderDetails',
						query: { payOrderNo: no }
					})
				}
			} else if (type === 'prepayApplyNo') {
				this.$router.push({
					name: 'PrepayDetail',
					query: { source: 'createRegPrepayFrom', applyNo: no }
				})
			} else if (type === 'invoiceNo' || type === 'invoiceNos') {
				let receipayType = otherParams.receipayType || (otherParams.row && otherParams.row.receipayType)
				if (receipayType) {
          let row = otherParams.row
          let type
          if (row && row.feeAmt !== undefined){
            if (receipayType === 'receive'){
              type = +row.feeAmt >= 0 ? 'receive' : 'pay'
            } else if (receipayType === 'pay') {
              type = +row.feeAmt >= 0 ? 'pay' : 'receive'
            }
          }else{
            type = receipayType
          }
          if (type === 'receive') {
						if (from === 'OrderFee') {
							let routeUrl = this.$router.resolve({
								name: 'InvoiceReceivableDetail',
                query: { source: 'detail', invoiceReceivableId: no, fromOrder: true }
							})
							window.open(routeUrl.href, '_blank')
						} else {
							this.$router.push({
								name: 'InvoiceReceivableDetail',
								query: { source: 'detail', invoiceReceivableId: no }
							})
						}
          } else if (type === 'pay') {
						if (from === 'OrderFee') {
							let routeUrl = this.$router.resolve({
								name: 'InvoicePaymentListDetail',
                query: { invoicePaymentId: no, fromOrder: true }
							})
							window.open(routeUrl.href, '_blank')
						} else {
							this.$router.push({
								name: 'InvoicePaymentListDetail',
								query: { invoicePaymentId: no }
							})
						}
					}
				} else {
					this.$message({ message: '无收付类型，不支持打开此发票号！', type: 'error', showClose: true })
				}
			} else if (type === 'invoiceReceiApply') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'InvoiceReceivableApplyDetail',
						query: { source: 'apply', invoiceReceivableApplyId: no, fromOrder: true }
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'InvoiceReceivableApplyDetail',
						query: { source: 'apply', invoiceReceivableApplyId: no }
					})
				}
			} else if (type === 'invoiceReceiPvw') {
				this.previewInvoiceFromList(no)
			} else if (type === 'sourceBizNo') {
				let data = { sourceBizNo: no }
				querySourceTypeByNo(data).then(res => {
					if (res.code === 0) {
						this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo, otherParams)
					}
				})
			} else if (type === 'gedging_apply') {
				let gedgingApplyId = no
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'GedgingDetail',
            query: { source: 'gedgingDetail', gedgingApplyId, fromOrder: true}
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'GedgingDetail', query: { source: 'gedgingDetail', gedgingApplyId }
					})
				}
			} else if (type === 'baddebt_apply') {
				if (from === 'OrderFee') {
					let routeUrl = this.$router.resolve({
						name: 'BadApplyDetail',
            query: { settleOrderBaddebtId: no, fromOrder: true}
					})
					window.open(routeUrl.href, '_blank')
				} else {
					this.$router.push({
						name: 'BadApplyDetail', query: { settleOrderBaddebtId: no }
					})
				}
			} else if (type === 'writeoffNos') {
				let data = { writeoffReceipayNo: no }
				queryPayOrderByWriteoffNo(data).then(res => {
					if (res.code === 0) {
						let writeoffType = res.data.writeoffType
						if (writeoffType === 'gedging_writeoff') {
							let gedgingApplyId = res.data.gedgingApplyId
							if (from === 'OrderFee') {
								let routeUrl = this.$router.resolve({
									name: 'GedgingDetail',
                  query: { source: 'gedgingDetail', gedgingApplyId, fromOrder: true}
								})
								window.open(routeUrl.href, '_blank')
							} else {
								this.$router.push({
									name: 'GedgingDetail', query: { source: 'gedgingDetail', gedgingApplyId }
								})
							}
						} else if (writeoffType === 'receive_writeoff') {
							if (from === 'OrderFee') {
								let routeUrl = this.$router.resolve({
									name: 'WriteoffRecvDetail2',
                  query: { source: 'writeoffRecvDetail', writeoffReceipayNo: no, fromOrder: true},
									params: { writeoffNo: no}
								})
								window.open(routeUrl.href, '_blank')
							} else {
								this.$router.push({
									name: 'WriteoffRecvDetail2', query: { source: 'writeoffRecvDetail', writeoffReceipayNo: no }, params: { writeoffNo: no}
								})
							}
						} else if (writeoffType === 'pay_writeoff') {
							if (from === 'OrderFee') {
								let routeUrl = this.$router.resolve({
									name: 'WritePayDetail',
                  query: { writeoffReceipayNo: no, fromOrder: true}
								})
								window.open(routeUrl.href, '_blank')
							} else {
								this.$router.push({ name: 'WritePayDetail', query: { writeoffReceipayNo: no } })
							}
						} else if (writeoffType === 'bad_debt_writeoff' || writeoffType === 'bad_gedging_writeoff' || writeoffType === 'bad_pre_writeoff') { // bad_debt_writeoff是老的类型，暂保留
							if (from === 'OrderFee') {
								let routeUrl = this.$router.resolve({
									name: 'SettleOrderBadDetail',
                  query: { source: 'detail', writeoffNopayNo: no, fromOrder: true}
								})
								window.open(routeUrl.href, '_blank')
							} else {
								this.$router.push({ name: 'SettleOrderBadDetail', query: { source: 'detail', writeoffNopayNo: no } })
							}
						} else {
							this.$message({ message: '不支持打开此编号！', type: 'error', showClose: true })
						}
					}
				}).catch(err => {
					console.log(err)
					this.isJumpRouteFromPage = false
					if (isTab) {
						Vue.prototype.$NotRouteBeforeRouteLeave = null
					}
				})
			} else {
				this.$message({ message: '不支持打开此编号！', type: 'error', showClose: true })
				this.isJumpRouteFromPage = false
				if (isTab) {
					Vue.prototype.$NotRouteBeforeRouteLeave = null
				}
			}
		},
		// 费用是否可以进入编辑
		editGuard(data, showMessage = false) {
			try {
				data.forEach(item => {
					let msgPrefix = `"${item.feeName}", 金额${item.feeAmt}`
					let message = ''
					if (item.settleStatus === 'finish') {
						message = `已结清的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.settleStatus === 'part_finish') {
						message = `已部分结算的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.invoiceStatus === 'finish' || item.invoiceStatus === 'part_finish') {
						message = `已开票的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.settleLock === 'lock') {
						message = `已锁定的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.confirmStatus === 'yes') {
						message = `已确认的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.precloseStatus === 'yes') {
						message = `已预关账的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.closeStatus === 'yes') {
						message = `已总关账的费用${msgPrefix}，不能修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.viewGroupType === 'special' && this.isBusinessFee) {
						message = `专项类费用请通过专项管理费页面进行修改和删除`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					} else if (item.jointStatus === 'yes' && item.jointMain === 'no') {
						message = `协同费用${msgPrefix}，不能修改和删除，请从对手单号${item.jointToOrderNo}发起修改`
						item.editGuardMsg = message
						showMessage && this.$message({ type: 'error', message, showClose: true, duration: 5000 })
						throw new Error('ending')
					}
				})
			} catch (e) {
				// console.log(e.message)
				return false
			}
			return true
		},
		debounceLs(fn, time = 600) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		// 校验非空
		validate(data, keys, labelObj) {
			console.log(data)
			if (data instanceof Array) {
				if (data.length === 0) {
					this.$message({
						type: 'error',
						message: '数据不能为空',
						showClose: true,
						duration: 4000
					})
					return false
				} else if (!keys || (keys instanceof Array && !keys.length)){
					return true
				}
				// 如果传进来的是数值成员的数组（根据keys判断）
				if (typeof (keys) === 'string') {
					for (let i = 0; i < data.length; i++) {
						let value = data[i]
						let key = keys
						if (value == null || value === '') {
							let column = this.columnsBaseLocal.find(item => {
								return item.prop === key
							})
							let label = column ? column.label : key
							this.$message({
								type: 'error',
								message: `${label}不能为空`,
								showClose: true,
								duration: 4000
							})
							return false
						}
					}
					return true
				}
				// 如果传进来的是对象成员的数组
				for (let i = 0; i < data.length; i++) {
					if (data[i] instanceof Object) {
						for (let j = 0; j < keys.length; j++) {
							let key = keys[j]
							let value = data[i][key]
							if (value == null || value === '') {
								let column = this.columnsBaseLocal.find(item => {
									return item.prop === key
								})
								let label = column ? column.label : key
								label = label + '不能为空'
								let specialKeys = ['settleCorpName', 'settleCorpCode', 'feeName', 'feeCode', 'serviceName', 'serviceCode']
								if (specialKeys.includes(key)) {
									label = (column ? column.label : key === 'serviceCode' ? '服务项' : key) + '不能为空，须下拉选择'
								}
								if (labelObj && labelObj[key]) {
									label = labelObj[key] + '不能为空'
								}
								this.$message({
									type: 'error',
									message: `${label}`,
									showClose: true,
									duration: 4000
								})
								return false
							}
						}
					}
				}
				return true
			} else if (data instanceof Object) {
				for (let i = 0; i < keys.length; i++) {
					let key = keys[i]
					let value = data[key]
					if (value == null || value === '') {
						let column = this.columnsBaseLocal.find(item => {
							return item.prop === key
						})
						let label = column ? column.label : key
						label = label + '不能为空'
						if (labelObj && labelObj[key]) {
							label = labelObj[key] + '不能为空'
						}
						this.$message({
							type: 'error',
							message: `${label}`,
							showClose: true,
							duration: 4000
						})
						return false
					}
				}
				return true
			} else if (typeof (data) === 'string') {
				let value = data
				let key = keys
				if (value == null || value === '') {
					let column = this.columnsBaseLocal.find(item => {
						return item.prop === key
					})
					let label = column ? column.label : key
					this.$message({
						type: 'error',
						message: `${label}不能为空`,
						showClose: true,
						duration: 4000
					})
					return false
				}
				return true
			}
		},
    // @noRender 字典中找不到值，不渲染
		renderPropLabel (prop, value, selectOptions, multi, noRender) {
			let obj = ''
      if(multi){
        let dict = this.dictMapObj[prop]
        let val = (value||'').toLowerCase()
        return val.replace(/\b(\w+)\b/g, (item) => (dict && dict[item]) || (noRender ? '' : item)).replace(/(,+)/g, ',')
      }
			let dict = this.dictMapObj[prop]
      if (multi) {
        console.log(dict);
        console.log(value);
      }
			if (dict) {
				// obj = this.dictMap[prop].find((item) => {
				// 	return item.value === value
				// })
        return dict[value] || (noRender ? '' : value)
			} else if (selectOptions) {
				obj = selectOptions.find((item) => {
					return item.value === value
				})
        return obj && obj.label || (noRender ? '' : value)
			}
		},
		// 自定义表头
		handleCustomColumns () {
			this.whichCustomColumns = 'customColumns'
			this.configColumns = this.columns.filter(value => {
				let columnsBaseLocal = this.selfColumnsBase && this.selfColumnsBase.length ? this.selfColumnsBase : this.columnsBaseLocal
				let obj = columnsBaseLocal.find(itemBase => {
					return itemBase.prop === value
				})
				if (obj) {
					return value !== 'frontIndex' && value !== 'settleCloseTime' && value !== 'invoiceReplenishAmt'
				} else {
					return false
				}
			})
			if (this.defaultColumns) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					if (this.isFeeList && item.prop === 'acctVoucherNos') { // 在订单费用显示为“凭证号”，在费用列表显示为“实收付凭证号”
						item.label = '实收付凭证'
					}
					return this.defaultColumns.some(subItem => {
						return subItem === item.prop
					})
				})
			} else if (this.defaultColumnsRecei) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					if (this.isFeeList && item.prop === 'acctVoucherNos') { // 在订单费用显示为“凭证号”，在费用列表显示为“实收付凭证号”
						item.label = '实收付凭证'
					}
					if (this.jointNo && !this.rail && item.prop === 'blId') {
						return false
					}
					return this.defaultColumnsRecei.some(subItem => {
						return subItem === item.prop
					})
				})
			}
			this.customColumnsPopShow = true
		},
		handleCustomColumns2 () {
			this.whichCustomColumns = 'customColumns2'
			this.configColumns = this.columns2.filter(value => {
				let obj = this.columnsBaseLocal.find(itemBase => {
					return itemBase.prop === value
				})
				if (obj) {
					return value !== 'frontIndex' && value !== 'settleCloseTime' && value !== 'invoiceReplenishAmt'
				} else {
					return false
				}
			})
			if (this.defaultColumnsPay) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					if (this.isFeeList && item.prop === 'acctVoucherNos') { // 在订单费用显示为“凭证号”，在费用列表显示为“实收付凭证号”
						item.label = '实收付凭证'
					}
					return this.defaultColumnsPay.some(subItem => {
						return subItem === item.prop
					})
				})
			}
			this.customColumnsPopShow = true
		},
		// 自定义表头关闭回调
		customColumnsPopClose (action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value) // getColumnsValues在本页面无作用
				if (this.whichCustomColumns === 'customColumns2') {
					this.customColumnsKeys2 = columnsKeys
					this.getData()
				} else if (this.whichCustomColumns === 'customColumns3') {
					this.customColumnsKeys3 = columnsKeys
					this.getDataSU()
				} else if (this.whichCustomColumns === 'customColumns4') {
					this.customColumnsKeys4 = columnsKeys
					this.getDataSU()
				} else {
					this.customColumnsKeys = columnsKeys
					this.getData()
				}
				this.isEdit = false // 当新增或修改费用时打开自定义表头，确定后，隐藏保存取消按钮
			}
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues (value) {
			let result = []
			value.map(item => {
				result.push(item)
			})
			result = Array.from(new Set(result))
			return result
		},
    debounceLsFn() {
      let timeStamp = +new Date()
      // console.log(timeStamp - this._diyTimeStamp)
      if (this._diyTimeStamp && timeStamp - this._diyTimeStamp < 900) {
        return true
      }
      this._diyTimeStamp = timeStamp
    },
    // 显示凭证弹框
    initShowVoucher(previewDialog, seqNo, seqNos, showData) {
      previewDialog.seqNo = seqNo
      previewDialog.seqNos = seqNos
      previewDialog.showData = showData
      previewDialog.show = true
    },
    // 从列表点击发票号，直接预览发票（请求发票详情，有fileName使用fileName，没有时使用自定义预览）
    previewInvoiceFromList(invoiceReceivableId){
      invoiceReceivableInfo({ invoiceReceivableId }).then(res => {
        if (res.data.fileNo) {
          window.open(this.getDownloadPath(res.data.fileNo, res.data.fileName))
          return 
        }
        this.singleInvoiceType = res.data.invoiceType
        let info = res.data.invoiceReceivableApply
        this.applyItemGroupList = res.data.invoiceReceivableItemList.map(item => {
          return { ...item, amtWithoutTax: item.amtWithoutTax || new LSnum(item.price).times(item.count).div(1 + item.taxRate).toNum(2)}
        }) //this.option2.data // applyItemGroupList
        let totalInvoiceAmtApply = this.applyItemGroupList.reduce((total, curr) => total.plus(curr.amt), BIGZERO).toFixed(2)
        this.otherInvoiceInfo = {
          currency: info.currency,
          totalInvoiceAmtApply,
          taxRate: res.taxRate * 100 === 0 ? '免税' : res.taxRate * 100 + '%',
          invoiceCode: res.data.invoiceCode || '',
          invoiceDate: res.data.issueTime ? res.data.issueTime.slice(0, 10) : null,
          receiver: null,
          reviewer: null,
          createdName: null,
          remark: res.data.remark,
          invoiceNo: res.data.invoiceNo,
        }
        let { bankName, bankBranchName, saleCompBankName, saleCompBankBranchName, buyerBankInfo } = info
        this.customerInfo = {
          ...info,
          // unitName: info.unitName,
          // taxNo: info.taxNo,
          // accountNo: info.accountNo,
          // addr: info.addr,
          bankName: buyerBankInfo,
          // tel: info.tel,
          // title: info.title
        }
        this.sellerInfo = {
          unitName: info.settleCompName,
          taxNo: info.taxpayerNo,
          accountNo: info.saleCompAccountNo, //saleCompBankNo
          addr: info.saleCompAddr,
          // bankName: `${saleCompBankName}${saleCompBankBranchName || ''}`,
          bankName: saleCompBankBranchName || '',
          tel: info.saleCompTel,
          title: info.saleCompTitle
        }
        // this.invoiceReceivableId = this.invoiceTableList[index].invoiceReceivableId
        this.dialogVisibleO.show = true
      })
    },
    // 验证列表内某个字段的值是否有小于0的
    validatePositive(arr = [], propAmt, propMsg) {
      return [...new Set(arr.map(item => item[propAmt] >= 0 ? undefined : item[propMsg]).filter(v => v))].join('、')
    },
    // 财务内通用搜索方法
    /*
      @hms 时间区间手动添加时分秒 ' 00:00:00' ' 23:59:59'
      @gle  gle===true时时间区间使用le ge, gle==='rangeMinMax'时表示range使用字段max，min且type为eq， 而不是默认的eq
      @selectRecordArr 数组this.multipleSelection1 选中的记录arr
    */
    finCommonSearch(dataQuery = [], searchOption, hms, gle, multipleSelection, otherParams = {}){
      if (!searchOption || !searchOption.addFilter || !searchOption.addFilter.searchInputGroup){
        return console.error('searchOption参数有误')
      }
      if (multipleSelection && multipleSelection.length){
        this.listSelectRecordArr = multipleSelection.map(item => ({...item}))
      }
      const {special} = otherParams
      const filterGroups = searchOption.addFilter.filterGroups
      searchOption.addFilter.searchInputGroup.forEach((item) => {
        const { key, value, range, req, valueReq, scope } = item
        if (special){
          if (special.key && special.key === key){
            special['obj'][key] = special.arrayToString ? value.toString() : value
            return
          }
        }
        // console.log(filterGroups[key].scope, scope);
        let filterGroup = filterGroups[key]
        if (!filterGroup) return
        let rangeMinMax = filterGroup.rangeMinMax
        if (range && (range.min || range.max)) {
          if (gle === 'rangeMinMax' || key === 'canSettleApplyAmt' || rangeMinMax) {
            range.min && dataQuery.push({ column: key + 'Min', type: 'eq', value: range.min })
            range.max && dataQuery.push({ column: key + 'Max', type: 'eq', value: range.max })
          }else{
            range.min && dataQuery.push({ column: key, type: 'ge', value: range.min })
            range.max && dataQuery.push({ column: key, type: 'le', value: range.max })
          }
          return
        }
        if (valueReq && item[valueReq]) {
          return dataQuery.push({ column: valueReq, type: 'eq', value: item[valueReq] })
        }
        let filterType = filterGroup.type
        // filterGroup内的优先级应大于函数入参的优先级
        gle = filterGroup.gle || gle
        hms = filterGroup.hms || hms
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
                let find = dataQuery.find((v) => v.column === reqKey)
                if (find) {
                  find.value += ',' + value.join(',')
                } else {
                  dataQuery.push({ column: reqKey, type: scopeType, value: value.join(',') })
                }
              }else{
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
      console.log('~~~~~~~~~~~~~finCommonColumns')
      if (!res || !res.data || !this[tableOption] || !this[selfColumnsBase] || !this[configColumns]){
        if (process.env.NODE_ENV === "development"){
          // 开发环境时页面直接报弹窗错误
          this.$msgErrClose('自定义表头处理参数有误！')
        }
        // 其它环境时，为不影响用户直观体验，只打印报错日志
        console.error('自定义表头处理参数有误！');
        return
      }
      let columns = res.data.configColumns
      if (columns && columns.length) {
        // console.log(this.backupCustomerColumns);
        // console.log(columns.toString());
        // console.log(this.backupCustomerColumns === columns.toString());
        if (this.backupCustomerColumns === columns.toString()){
          return
        }
        this[tableOption].columns = columns.map((prop) => this[selfColumnsBase].find((item) => item.prop === prop)).filter((v) => v)
        this[tableOption].sortable && setTimeout(() => {
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
        // if(params){
        //   if (params.configColumns){
        //     return this[configColumns] = params.configColumns
        //   }
        // }
        // 后端返回的columns会存在历史数据，影响拖拽排序。使用表格配置的columns，保持数据正确
        this[configColumns] = params && params.configColumns || this[tableOption].columns.map(item => item.prop)
      }
    },
    // 记录勾选项， 请求列表接口后渲染数据及分页以及选中
    dealPaginationSelect(option, resData, list, key){
      Object.assign(this.option1.pagination, resData)
      // option.pagination.currPage = resData.currPage
      // option.pagination.pageSize = resData.pageSize
      // option.pagination.totalCount = resData.totalCount
      // 处理选中记录
      if (this.isListSelectRecord && this.listSelectRecordArr.length && key){
        let selectIds = this.listSelectRecordArr.map(item => item[key])
        list = list.filter(item => !selectIds.includes(item[key]))
        list.unshift(...this.listSelectRecordArr)
        // 用nextTick不行，在table组件内访问table ref访问不到
        setTimeout(() => {
          this.listSelectRecordArr.forEach(row => {
            this.$refs.listTableRef && this.$refs.listTableRef.setCheckRow(row, true)
          })
        }, 100);
      }
      option.data = list
    },
		setUnitCount(row, containerCount) {
			if (row.feeUnit === 'bill' || row.feeUnit === 'count' || row.feeUnit === 'm' || row.feeUnit === 'rt') {
				row.unitCount = 1
			} else if (row.feeUnit === 'unit' || row.feeUnit === 'teu') {
				row.unitCount = containerCount || ''
			} else if (row.feeUnit === 'ESTIMATED' || row.feeUnit === 'ESTIMATED COUNT' || row.feeUnit === 'ESTIMATED MENSUREMENT' || row.feeUnit === 'ESTIMATED WEIGHT') {
				if (!this.air) {
					this.$message({
						type: 'error',
						message: '非空运订单不可选',
						showClose: true
					})
					row.feeUnit = ''
				} else {
					if (this.airCargoStates.predict) {
						if (row.feeUnit === 'ESTIMATED') row.unitCount = this.airCargoStates.predict.chargeWeight
						if (row.feeUnit === 'ESTIMATED COUNT') row.unitCount = this.airCargoStates.predict.totalQuantity
						if (row.feeUnit === 'ESTIMATED MENSUREMENT') row.unitCount = this.airCargoStates.predict.totalVolume
						if (row.feeUnit === 'ESTIMATED WEIGHT') row.unitCount = this.airCargoStates.predict.totalWeight
					} else {
						row.unitCount = ''
					}
				}
			} else if (row.feeUnit === 'ACTUAL BILL WEIGHT' || row.feeUnit === 'ACTUAL COUNT' || row.feeUnit === 'ACTUAL MENSUREMENT' || row.feeUnit === 'ACTUAL WEIGHT' || row.feeUnit === 'ACTUAL CHARGE WEIGHT') {
				if (!this.air) {
					this.$message({
						type: 'error',
						message: '非空运订单不可选',
						showClose: true
					})
					row.feeUnit = ''
				} else {
					if (this.airCargoStates.actual) {
						if (row.feeUnit === 'ACTUAL BILL WEIGHT') row.unitCount = this.airCargoStates.actual.chargeWeight
						if (row.feeUnit === 'ACTUAL COUNT') row.unitCount = this.airCargoStates.actual.totalQuantity
						if (row.feeUnit === 'ACTUAL MENSUREMENT') row.unitCount = this.airCargoStates.actual.totalVolume
						if (row.feeUnit === 'ACTUAL WEIGHT') row.unitCount = this.airCargoStates.actual.totalWeight
						if (row.feeUnit === 'ACTUAL CHARGE WEIGHT') row.unitCount = this.airCargoStates.actual.settleWeight
					} else {
						row.unitCount = ''
					}
				}
			} else if (row.feeUnit === 'DOC BILL WEIGHT' || row.feeUnit === 'DOC COUNT' || row.feeUnit === 'DOC MENSUREMENT' || row.feeUnit === 'DOC WEIGHT' || row.feeUnit === 'DOC CHARGE WEIGHT') {
				if (!this.air) {
					this.$message({
						type: 'error',
						message: '非空运订单不可选',
						showClose: true
					})
					row.feeUnit = ''
				} else {
					if (this.airCargoStates.bl) {
						if (row.feeUnit === 'DOC BILL WEIGHT') row.unitCount = this.airCargoStates.bl.chargeWeight
						if (row.feeUnit === 'DOC COUNT') row.unitCount = this.airCargoStates.bl.totalQuantity
						if (row.feeUnit === 'DOC MENSUREMENT') row.unitCount = this.airCargoStates.bl.totalVolume
						if (row.feeUnit === 'DOC WEIGHT') row.unitCount = this.airCargoStates.bl.totalWeight
						if (row.feeUnit === 'DOC CHARGE WEIGHT') row.unitCount = this.airCargoStates.bl.settleWeight
					} else {
						row.unitCount = ''
					}
				}
			}
			console.log(this.airCargoStates)
		},
		dialVmN() {
			let VMODAL = document.querySelector('body > .v-modal');if (VMODAL) { VMODAL.style.display = 'none' }
		},
		modifyBlByFeeAndUnit(row) {
			console.log(row)
			this.$nextTick(() => {
				if (this.isSpecialFee) return
				if (this.isModifyFee && row.blId && row.blId.length) return // 为了关账调费保留bl
				let data = this.option1.data.filter(item => {
					return item !== row
				})
				let one = data.find(item => item.settleCorpCode === row.settleCorpCode && item.blId && item.blId.length) // 其他相同settleCorpCode且有blId的row
				if (one) {
					row.blId = one.blId
				} else {
					if (!row.isNoNeedBlFee && !row.isNoNeedBlSettleUnit) {
						if (row.feeCode && row.settleCorpCode) {
							let mblList = this.blList && this.blList.filter(item => item.blType === 'mbl')
							let hblList = this.blList && this.blList.filter(item => item.blType === 'hbl')
							let settleList = this.option1.data.map(item => item.settleCorpCode).filter(item => item)
							settleList = [...new Set(settleList)]
							if (((mblList.length === 1 && hblList.length <= 1) || (mblList.length <= 1 && hblList.length === 1)) && settleList.length === 1) {
								if (settleList[0] === this.client.unitCode) {
									row.blId = mblList[0] ? [mblList[0].blId] : []
								} else {
									row.blId = hblList[0] ? [hblList[0].blId] : []
								}
							}
						}
					} else {
						row.blId = []
					}
				}
			})
		},
		employeeSelectlistMx(queryString, item, row, index, option) {
			if (queryString) {
				let data = {
					"state": "valid",
					"name": queryString
				}
				this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
					data.reverse().forEach(one => {
						let label = one.value
						let value = one.key + '' // 列表数据返回的字符串
						if (item.remoteSelectList.every(s => s.value !== value)) {
							item.remoteSelectList.unshift({
								label,
								value
							})
						}
					})
					let optionId = option.id
					this.$refs[optionId] && this.$refs[optionId].$refs.xTable1.updateData()
					this.$refs[optionId] && this.$refs[optionId].$refs['column_negativeFollowerId'] && this.$refs[optionId].$refs['column_negativeFollowerId'].forEach(item => item.$forceUpdate())
					// example
					// this.columns.forEach(column => {
					//   this.$refs['column_' + column.prop] && this.$refs['column_' + column.prop].forEach(item => item.$forceUpdate())
					// })
				})
			} else {
				let optionId = option.id
				option.data.forEach(one => {
					if (one.negativeFollowerId && item.remoteSelectList.every(s => s.value !== one.negativeFollowerId)) {
						item.remoteSelectList.push({
							label: one.negativeFollowerName,
							value: one.negativeFollowerId
						})
					}
				})
				this.$refs[optionId] && this.$refs[optionId].$refs.xTable1.updateData()
				this.$refs[optionId] && this.$refs[optionId].$refs['column_negativeFollowerId'] && this.$refs[optionId].$refs['column_negativeFollowerId'].forEach(item => item.$forceUpdate())
			}
		},
		personChangeMx(value, item, row){
			console.log(value)
      if (value) {
				let f = item.remoteSelectList.find(o => o.value === value)
				row.negativeFollowerName = f ? f.label : ''
      }
    },
    // 判断多个选项内，多个字段的值全一样
    selectedValueSame(selected = [], valArr = []){
      let isSame = true
      valArr.forEach(value => {
        if ([...new Set(selected.map(item => item[value]))].length !== 1){
          isSame = false
        }
      })
      return isSame
    },
    // 首次不加载数据的列表，无法正确渲染分页条数，需要单独处理
    dealPageSize(url, pagination){
      let size = +getPageSize(url)
      pagination.pageSize = size ? size : 10
    },
    // enter按键事件
    handleKeyDown(e) {
      e = window.event || e
      if (e.keyCode === 13) {
        console.log('keydown active');
        if(!this.callbackSearch){
          this.search()
        }else{
          this.callbackSearch()
        }
      }
    },
    printCallbackBeforeCommon(times, callback, fn, callbackFail){
      if(times - 1 > 0) {
        this.$confirmWarn(`确定进行第${times}次打印？`, () => {
          callback && callback()
          fn && fn()
        }, () => callbackFail && callbackFail())
      } else {
        callback && callback()
        fn && fn()
      }
    }
	},
	computed: {
    ...mapGetters(['dictMap', 'dictMapObj', 'allPageModuleAuth',]),
    userSettleCompanyCode(){
      return this.$store.state.user.userInfo.settleCompanyCode
    }
  },
  activated() {
    if (this.keyDownActive) {
      window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
    }
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
}