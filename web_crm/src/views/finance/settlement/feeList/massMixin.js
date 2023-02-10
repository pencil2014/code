import { mapGetters } from 'vuex'
import Vue from 'vue'
import { queryPayOrderByWriteoffNo } from '@/api/fin/writeoffPay'
import { querySourceTypeByNo } from '@/api/fin/fee'
import { info as invoiceReceivableInfo } from '@/api/fin/invoiceReceivable'
import { deepCloneLs } from '@/views/finance/utils/finance'

export const massMixin = {
	data () {
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
						if (action === 'Edit') {
							this.handleEdit(row);
						} else if (action === 'SingleEdit') {
							this.handleSingleEdit(row);
						} else if (action === 'Copy') {
							this.handleCopy(row);
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
          show: false,
          currPage: 1,
          pageSize: 0,
          totalCount: 0,
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
      },
      // 费用列表默认表头
      defaultColumns: ['sourceBizNo', 'feeName', 'serviceName', 'feeEnName', 'finGroup', 'settleCorpName', 'receipayType', 'settleCompName', 'agentCompName', 'currency', 'feeAmt', 'unitPrice', 'feeUnit', 'unitCount', 
        'taxRate', 'taxAmt', 'feeAmtWithoutTax', 'confirmStatus', 'reviseStatus', 'acctExRate', 'basicMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'finDate', 'precloseStatus','intraStatus','jointStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle', 
        'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
        'gedgingStatus','writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'acctVoucherNos', 'transferAcctVoucherNos', 'remark', 'createdName',
        'createdTime', 'confirmName', 'confirmTime'],
      columnsBase: [
        {prop: 'settleCompName', label: '分公司', type: 'text', key: 'settleCompName', width: 125},
        {prop: 'feeName', label: '费用名称', type: 'text', key: 'feeName', width: 110, disabled: true},
        // {prop: 'feeCode', label: '费用名称', type: 'text', key: 'feeCode', width: 110},
        {prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName', width: 128},
        {prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName', width: 100, }, // disabled: true
        {prop: 'settleCorpName', label: '结算单位', type: 'text', width: 125, key: 'settleCorpName', disabled: true},
        // {prop: 'settleCorpCode', label: '结算单位', type: 'text', width: 125, key: 'settleCorpCode', disabled: true},
        {prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount', width: 70, disabled: true},
        {prop: 'unitPrice', label: '单价', type: 'text', key: 'unitPrice', disabled: true},
        {prop: 'feeUnit', label: '计费单位', type: 'select', key: 'feeUnit', disabled: true},
        {prop: 'feeAmt', label: '金额', type: 'text', key: 'feeAmt', disabled: true},
        {prop: 'currency', label: '币种', type: 'text', key: 'currency', width: 70, propInDict: 'validCurrency', filterable: true, disabled: true},
        {prop: 'taxRate', label: '税率', type: 'text', key: 'taxRate', width: 70, disabled: true, formatter: ({ cellValue }) => {if(cellValue) {return Number(cellValue)*100 + '%'} else {return cellValue}}},
        {prop: 'taxAmt', label: '税额', type: 'text', key: 'taxAmt'},
        {prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text', key: 'feeAmtWithoutTax', width: 100},
        {prop: 'remark', label: '费用备注', type: 'text', key: 'remark', width: 150},
        {prop: 'acctExRate', label: '折合CNY汇率', type: 'text', key: 'acctExRate', width: 110},
        {prop: 'basicMoneyAmt', label: '折合CNY金额', type: 'text', key: 'basicMoneyAmt', width: 110},
        {prop: 'usdExRate', label: '折合USD汇率', type: 'text', key: 'usdExRate', width: 110},
        {prop: 'usdMoneyAmt', label: '折合USD金额', type: 'text', key: 'usdMoneyAmt', width: 110},
        {prop: 'reviseStatus', label: '是否调账', type: 'text', key: 'reviseStatus', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'confirmStatus', label: '是否确认', type: 'text', key: 'confirmStatus', width: 80, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'} else {return cellValue}}},
        {prop: 'finDate', label: '财务日期', type: 'text', key: 'finDate', width: 105},
        {prop: 'precloseStatus', label: '预关账状态', type: 'text', key: 'precloseStatus', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'intraStatus', label: '是否内部往来', type: 'text', key: 'intraStatus', width: 120, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'jointStatus', label: '是否协同', type: 'select', key: 'jointStatus', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'precloseTime', label: '预关账时间', type: 'text', key: 'precloseTime', width: 125},
        {prop: 'closeStatus', label: '关账状态', type: 'text', key: 'closeStatus', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'closeTime', label: '关账时间', type: 'text', key: 'closeTime', width: 125},
        {prop: 'settleLock', label: '是否结算锁定', type: 'text', key: 'settleLock', width: 120, formatter: ({ cellValue }) => {if (cellValue === 'lock') {return '锁定'} else if (cellValue === 'unlock') {return '未锁定'}}},
        {prop: 'lockReason', label: '结算锁定原因', type: 'text', key: 'lockReason', width: 120},
        {prop: 'settleCycle', label: '结算方式', type: 'select', key: 'settleCycle', width: 100},
        {prop: 'settleStatus', label: '结算状态', type: 'select', key: 'settleStatus', width: 100, propInDict: 'feeSettleStatus'},
        {prop: 'settleOrderNos', label: '结算单号', type: 'text', key: 'settleOrderNos', width: 125},
        {prop: 'settleOrderNo', label: '结算单号', type: 'text', key: 'settleOrderNo', width: 125},
        {prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt', width: 100},
        {prop: 'settleTimes', label: '结算时间', type: 'text', key: 'settleTimes', width: 125},
        {prop: 'isIssueInvoice', label: '是否开票', type: 'text', key: 'isIssueInvoice', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'invoiceStatus', label: '发票状态', type: 'select', key: 'invoiceStatus', propInDict: 'feeInvoiceStatus', width: 100},
        {prop: 'invoiceNos', label: '发票号', type: 'text', key: 'invoiceNos', width: 125},
        {prop: 'invoiceAmt', label: '已开票金额', type: 'text', key: 'invoiceAmt', width: 100},
        {prop: 'notInvoiceAmt', label: '未开票金额', type: 'text', key: 'notInvoiceAmt', width: 100},
        {prop: 'gedgingStatus', label: '对冲状态', type: 'text', key: 'gedgingStatus', width: 100, formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}},
        {prop: 'writeoffStatus', label: '核销状态', type: 'select', key: 'writeoffStatus', width: 100, propInDict: 'writeoffStatus'},
        {prop: 'gedgingWriteoffAmt', label: '已对冲金额', type: 'text', key: 'gedgingWriteoffAmt', width: 100},
        {prop: 'badAmt', label: '坏账金额', type: 'text', key: 'badAmt', width: 100},
        {prop: 'payApplySettleNos', label: '请款单号', type: 'text', key: 'payApplySettleNos', width: 125},
        {prop: 'payOrderNos', label: '付款单号', type: 'text', key: 'payOrderNos', width: 125},
        {prop: 'writeoffNos', label: '核销编号', type: 'text', key: 'writeoffNos', width: 125},
        {prop: 'totalWriteoffAmt', label: '已核销金额', type: 'text', key: 'totalWriteoffAmt', width: 100},
        {prop: 'notWriteoffAmt', label: '未核销金额', type: 'text', key: 'notWriteoffAmt', width: 100},
        {prop: 'acctVoucherNos', label: '凭证号', type: 'text', key: 'acctVoucherNos', width: 100},
        {prop: 'transferAcctVoucherNos', label: '转字凭证', type: 'text', key: 'transferAcctVoucherNos'},
        {prop: 'createdName', label: '创建人', type: 'text', key: 'createdName', width: 100},
        {prop: 'createdTime', label: '创建时间', type: 'text', key: 'createdTime', width: 125},
        {prop: 'confirmName', label: '确认人', type: 'text', key: 'confirmName', width: 100},
        {prop: 'confirmTime', label: '确认时间', type: 'text', key: 'confirmTime', width: 125},
        {prop: 'receipayType', label: '收付类型', type: 'select', key: 'receipayType', propInDict: 'receipayGroup'},
        {prop: 'reason', label: '原因', type: 'text', key: 'reason'},
        {prop: 'sourceBizNo', label: '单号', type: 'text', key: 'sourceBizNo', width: 125},
        {prop: 'finGroup', label: '费用分组', type: 'select', key: 'finGroup', width: 125, propInDict: 'feeitemFinGroup'},
        {prop: 'agentCompName', label: '费用代收付分公司', type: 'text', key: 'agentCompName', width: 128},
      ],
      customColumnsPopShow: false,
      configColumns: [], // 传给自定义表头当前用的字段
      customColumnsKeys: [], // 定制的表头
      columnsBaseLocal: [],
    }
  },
  created() {console.log(this.columnsBase, this.columnsBase.length)
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
            // this.querySettleUnit({
            //   queryString,
            //   unitTypes: 'customer,supplier,company'
            // }, cb)
            // return
            // // 暂不启用
            if (!row.receipayType) {
              return this.$message({
                message: '须先选择应收应付类型！',
                type: 'error',
                showClose: true
              })
            } else if (row.receipayType === 'pay') {
              if (!row.serviceCode) {
                return this.$message({
                  message: '应付费用须先选择费用项和服务项！',
                  type: 'error',
                  showClose: true
                })
              }
              this.queryFinSupplierList({
                queryString,
                serviceCode: row.serviceCode,
                size: 20
              }, cb)
            } else {
              this.querySettleUnit({
                queryString,
                unitTypes: 'customer,supplier,company',
                isAdd: true, 
                isForbid: true
              }, cb)
            }
          },
          select: (optionItem, row) => {
            this.selectedOptionItem = optionItem
            row[item.prop] = optionItem.value
            row[item.prop.replace('Name', 'Code')] = optionItem.key
          },
          change: (val, row) => {
						if (!val || val !== this.selectedOptionItem.value) {
							row[item.prop] = ''
              row[item.prop.replace('Name', 'Code')] = ''
						}
            // // 延时150ms获取select中的改变，清除用户手输的值
            // setTimeout(() => {
						// 	console.log(this.selectedOptionItem)
            //   if (this.selectedOptionItem === '') {
            //     row[item.prop] = ''
            //     row[item.prop.replace('Name', 'Code')] = ''
            //     return
            //   } else {
						// 		this.selectedOptionItem === ''
						// 	}
            // }, 150)
          }
        })
      } else if (item.prop === 'feeName') {
        item = Object.assign(item, {
          type: 'autocomplete',
          clearable: true,
          querySearch: (queryString, cb, row) => {
            // if (!row.serviceCode || row.serviceCode === '') { // 产品废弃此设计
            //   cb([])
            //   this.$message({
            //     message: '请先选择服务项！',
            //     type: 'error',
            //     showClose: true
            //   })
            //   return
            // }
            this.selectedOptionItem = ''
            this.queryFeeItemList({ orderNo: this.$store.state.finance.orderNo, businessType: this.dictMap['orderFeeBusinessType'], serviceCode: row.serviceCode, receipayType: row.receipayType, queryString, operation: 'add' }, cb)
          },
          select: (optionItem, row) => {
            this.selectedOptionItem = optionItem
            row['feeName'] = optionItem.value
            row['feeCode'] = optionItem.key
            row['feeEnName'] = optionItem.feeEnName
            row['feeUnit'] = optionItem.feeUnit && optionItem.feeUnit.toLowerCase()
            // if (row['receipayType'] === 'receive') {
            //   row['taxRate'] = optionItem.znTaxRate * 100 // 应收带出税率---税率改成不从这里带出，从订单带出
            //   row['taxRate'] = optionItem.znTaxRate // 应收带出税率---税率改成不从这里带出，从订单带出
            // }
            row['currency'] = optionItem.currency // 获取费用项默认的币种
						row.orderServices = optionItem.orderServices
						let orderServices = row.orderServices
						if (orderServices.length === 1) {
							row['serviceName'] = orderServices[0].serviceName
							row['serviceCode'] = orderServices[0].serviceCode
						}
          },
          change: (val, row) => {
            setTimeout(() => {
              if (this.selectedOptionItem === '') {
                row['feeName'] = ''
                row['feeCode'] = ''
                row['feeEnName'] = ''
                return
              }
            }, 150)
          },
          clear: (row, item) => {
            row.serviceCode = ''
            row.serviceName = ''
          }
        })
      } else if (item.prop === 'serviceName' || item.prop === 'serviceCode') {
        item = Object.assign(item, {
          prop: 'serviceName',
          type: 'autocomplete',
          clearable: true,
          debounce: 0,
          // formatter: (row, pItem) => {
          //   let prop = pItem.prop
          //   if (prop.indexOf('Code') > 0) {
          //     prop = prop.replace('Code', 'Name')
          //   }
          //   return row[prop]
          // },
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
                    message: '该费用项无对应服务项，无法添加该费用！',
                    type: 'error',
                    showClose: true
                  })
                }
              } else {
                console.log(this.isSpecialFee)
                if (this.isSpecialFee) {
                  console.log(this.dictMap.serviceCode)
                  orderServices = this.dictMap.serviceCode.map(item => {
                    return {
                      value: item.label,
                      key: item.value
                    }
                  })
                }
                if (!orderServices || orderServices.length === 0) {
                  this.$message({
                    message: '无服务项，无法添加该费用！',
                    type: 'error',
                    showClose: true
                  })
                }
              }
              orderServices = orderServices ? orderServices : []
							cb(orderServices)
            } else {
              cb([])
            }
          },
          select: (optionItem, row) => {
            row['serviceCode'] = optionItem.key
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
                message: '须先选择费用项，再选择服务项！',
                type: 'error',
                showClose: true
              })
              return
            }
          }
        })
      } else if (item.prop === 'unitPrice') {
        item = Object.assign(item, {
          validateInput: this.validateInput,
          width: 90
        })
      } else if (item.prop === 'unitCount') {
        item = Object.assign(item, {
          validateInput: this.validateInput
        })
      } else if (item.prop === 'feeAmt') {
        item = Object.assign(item, {
          validateInput: this.validateInput,
          width: 90
        })
      } else if (item.prop === 'settleOrderNos') { 
        item = Object.assign(item, {
          type: 'columnTip',
          width: 138,
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
          width: 125,
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
          width: 125,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: []
          }
        })
      } else if (item.prop === 'invoiceNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 120,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
							let row = componentProps.row
              let invoiceReceivableIds = row.invoiceReceivableIds_multiValue ? row.invoiceReceivableIds_multiValue : row.invoiceNos_multiValue
              let invoiceReceivableId = invoiceReceivableIds[index]
							this.showColumnDetail({
                type: 'invoiceNos',
								no: invoiceReceivableId, // no,
                componentProps
							})
            }
          }
        })
      } else if (item.prop === 'payApplySettleNos') {
        item = Object.assign(item, {
          type: 'columnTip',
          width: 125,
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
          width: 125,
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
          width: 120,
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
          width: 120,
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
      } else if (item.prop === 'remark') {
        item = Object.assign(item, {
          type: 'tooltip'
        })
      } else if (item.prop === 'frontIndex') {
        item = Object.assign(item, {
          sortable: false
        })
      }
    })
    console.log(this.columnsBaseLocal, this.columnsBaseLocal.length)
		if (this.defaultColumns) {
			this.selfColumnsBase = this.defaultColumns.map(item => {
				let find = this.columnsBaseLocal.find(subItem => {
					return subItem.prop === item
				})
				if (find) {
					return find
				} else {
					return { prop: item, label: item, type: 'text', key: item }
				}
			})
		}
  },
  methods: {
    // 用于remote
		querySettleUnit2 (queryString, item) {
			this.$store.dispatch('dict/querySettleUnit', queryString).then(data => {
				item.remoteSelectList = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
    },
    debounceLs(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn() // 待后台发到uat
				}
			}, time)
		},
    // 自定义表头
		handleCustomColumns () {
			this.configColumns = this.columns.filter(item => {
				return item !== 'frontIndex' && item !== 'settleCloseTime' && item !== 'invoiceReplenishAmt'
			})
			this.customColumnsPopShow = true
		},
		// 自定义表头关闭回调
		customColumnsPopClose (action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value) // getColumnsValues在本页面无作用
				this.customColumnsKeys = columnsKeys
				this.getData()
				this.isEdit = false // 当新增或修改费用时打开自定义表头，确定后，隐藏保存取消按钮
			}
		},
  }
}