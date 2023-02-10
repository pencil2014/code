export const feeListMixin = {
  data() {
    return {
      keyDownActive: true,
      option2: {},
      searchOption2: {},
    }
  },
  created() {
    this.filterGroups = {
      allNo: { label: '各类单号', type: 'input', placeholder: '多个用英文逗号分隔' },
      sourceBizNos: { label: '工作号', type: 'input', placeholder: '多个用英文逗号分隔' },
      exportOrderNo: { label: '关联出口单号', type: 'input' },
      hbl: { label: 'HBL', type: 'input' },
      mbl: { label: 'MBL', type: 'input' },
      soNo: { label: 'SO号', type: 'input' },
      billNo: { label: '系统账单编号', type: 'input' },
      dnNo: { label: '账单号', type: 'input' },
      containerNo: { label: '箱号', type: 'input', showType: '1' },
      shipCarrierOrderNo: { label: '船司订单号', type: 'input', showType: '1' },
      whPoNo: { label: '入舱单号', type: 'input', showType: '1' },
      settleOrderNo: { label: '结算单号', type: 'input' },
      payOrderNo: { label: '付款单号', type: 'input' },
      writeoffNo: { label: '核销单号', type: 'input' },
      acctVoucherNos: { label: '实收付凭证', type: 'input' },
      transferAcctVoucherNos: { label: '转字凭证', type: 'input' },
      hasTransferAcctVoucherNos: { label: '是否已生成转字凭证', type: 'select', prop: 'yesNo' },
      confirmStatus: { label: '是否确认', type: 'select', prop: 'yesNo' },
      reviseStatus: { label: '调账状态', type: 'select', prop: 'feeReviseStatus', multiple: true },
      settleLock: { label: '是否结算锁定', type: 'select', prop: 'finLockStatus' },
      intraStatus: { label: '是否内部往来', type: 'select', prop: 'yesNo' },
      jointStatus: { label: '是否协同费用', type: 'select', prop: 'yesNo' },
      // jointDeptName: { label: '协同部门', type: 'input' },
      jointToOrderNo: { label: '协同单号', type: 'input' },
      settleStatuss: { label: '结清状态', type: 'select', multiple: true, prop: 'feeSettleStatus' },
      settleOrderStatus: { label: '结算单生成状态', type: 'select', prop: 'finFeeSettleOrderStatus', multiple: true },
      invoiceStatuss: { label: '发票状态', type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
      gedgingStatus: { label: '对冲状态', type: 'select', prop: 'yesNo' },
      writeoffStatuss: { label: '核销状态', type: 'select', multiple: true, prop: 'writeoffStatus' },
      precloseStatus: { label: '预关账状态', type: 'select', prop: 'yesNo' },
      closeStatus: { label: '总关账状态', type: 'select', prop: 'yesNo' },
      serviceCodes: { label: '服务项', type: 'select', multiple: true, prop: 'allServiceCode', filterable: false },
      feeName: {
        label: '费用名称',
        type: 'remoteSelect',
        reqKey: 'feeCode',
        multiple: true,
        remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
        visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
        remoteSelectList: [],
        scope: true,
      },
      feeEname: {
        label: '费用英文名',
        type: 'remoteSelect',
        reqKey: 'feeCode',
        multiple: true,
        remoteMethod: (queryString, filterItem) => {
          this.remoteFeeItemList(queryString, filterItem, 'en')
        },
        visibleChange: (queryString, filterItem) => {
          this.remoteFeeItemList(queryString, filterItem, 'en')
        },
        remoteSelectList: [],
      },
      feeUnit: { label: '计费单位', type: 'select', prop: 'feeUnit' },
      currency: { label: '币种', type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
      receipayType: { label: '收付类型', type: 'select', prop: 'receipayGroup' },
      settleCycles: { label: '结算方式', type: 'select', multiple: true, prop: 'settleCycle' },
      feeAmt: { label: '金额', type: 'range' },
      taxAmt: { label: '税额', type: 'range' },
      feeAmtWithoutTax: { label: '不含税金额', type: 'range' },
      canSettleApplyAmt: { label: '未生成结算金额', type: 'range' },
      settleCorpCodes: {
        label: '结算单位',
        prop: 'settleCorpCode',
        type: 'remoteSelect',
        showType: '6',
        multiple: true,
        clearable: true,
        isList: true,
        remoteMethod: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: '' }, item)
        },
        visibleChange: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: '' }, item)
        },
        remoteSelectList: [],
      },
      settleCompCodes: {
        label: '分公司',
        prop: 'settleCompCode',
        type: 'remoteSelect',
        showType: '6',
        multiple: true,
        clearable: true,
        remoteMethod: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
        },
        visibleChange: (queryString, item, row) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
        },
        remoteSelectList: [],
      },
      agentCompCodes: {
        label: '代收付分公司',
        prop: 'agentCompCode',
        type: 'remoteSelect',
        multiple: true,
        clearable: true,
        remoteMethod: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
        },
        visibleChange: (queryString, item, row) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
        },
        remoteSelectList: [],
      },
      settleCorpType: { prop: 'unitType', label: '结算单位类型', type: 'select' },
      settleCorpSubType: { prop: 'settleUnitSubType', label: '结算单位子类型', type: 'select' },
      preCloseDate: {
        label: '预关账时间',
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['preCloseBeginDate', 'preCloseEndDate'],
      },
      closeDate: { label: '总关账时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['closeBeginDate', 'closeEndDate'] },
      finDate: { label: '财务日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['finBeginDate', 'finEndDate'] },
      createdDate: { label: '创建日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
      confirmDate: {
        label: '确认时间',
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['confirmBeginDate', 'confirmEndDate'],
      },
      writeOffDate: { label: '核销日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['writeoffBeginDate', 'writeoffEndDate'] },
      bdEmployeeId: {
        label: '销售',
        type: 'remoteSelect',
        clearable: true,
        multiple: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getEmployeeList(queryString, item)
          // this.getSellers(queryString, item, 'bd')
        },
        visibleChange: (queryString, item) => {
          this.getEmployeeList(queryString, item)
          // this.getSellers(queryString, item, 'bd')
        },
      },
      opEmployeeId: {
        label: '操作员',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getSellers(queryString, item, 'op')
        },
        visibleChange: (queryString, item) => {
          this.getSellers(queryString, item, 'op')
        },
      },
      obdEmployeeId: {
        label: '销售助理',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getSellers(queryString, item, 'obd')
        },
        visibleChange: (queryString, item) => {
          this.getSellers(queryString, item, 'obd')
        },
      },
      createdBy: {
        label: '创建人',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      ecsEmployeeId: {
        label: '海外客服',
        type: 'remoteSelect',
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      taxRate: { label: '税率', type: 'select', prop: 'taxRateInfo' },
      finGroup: { label: '费用分组', type: 'select', prop: 'feeitemFinGroup' },
      isIssueInvoice: { label: '是否开票', type: 'select', prop: 'yesNo' },
      invoiceNo: { label: '发票号', type: 'input' },
      payApplySettleNo: { label: '请款单号', type: 'input' },
      confirmBy: {
        label: '确认人',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      bkgAgentSupplierId: {
        label: '订舱代理',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getSupplierList(queryString, item)
        },
        visibleChange: (queryString, item) => {
          this.getSupplierList(queryString, item)
        },
      },
      custId: {
        label: '委托单位',
        type: 'remoteSelect',
        clearable: true,
        multiple: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getCustList(queryString, item)
        },
        visibleChange: (queryString, item) => {
          this.getCustList(queryString, item)
        },
      },
      serviceType: { label: '服务类型', type: 'select', prop: 'diyServiceType', multiple: true, },
      businessTypes: {
        label: '业务类型',
        type: 'select',
        prop: 'feeListBusinessType', // feeBusinessType
        multiple: true,
        change: () => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let polPortCode = searchInputGroup.find((item) => item.key === 'polPortCode')
          let podPortCode = searchInputGroup.find((item) => item.key === 'podPortCode')
          let sysLineCode = searchInputGroup.find((item) => item.key === 'sysLineCode')
          if (polPortCode) polPortCode.value = ''
          if (podPortCode) podPortCode.value = ''
          if (sysLineCode) sysLineCode.value = ''
        },
      },
      shipCarrierCodes: {
        label: '船/航司',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item, row) => {
          this.shipQuerySearch(queryString, item)
        },
        visibleChange: (queryString, item, row) => {
          this.shipQuerySearch(queryString, item)
        },
      },
      bdDeptCode: {
        label: '销售部门',
        prop: 'bdDeptCode',
        type: 'cascader',
        cascaderList: this.departmentList,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
          multiple: true,
        },
      },
      jointDeptCode: {
        label: '协同部门',
        prop: 'jointDeptCode',
        type: 'cascader',
        cascaderList: this.departmentList,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
          multiple: true,
        },
      },
      etdDate: { label: '大船预计开船时间（ETD）', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['etdBeginDate', 'etdEndDate'] },
      etaDate: { label: '大船预计到港时间（ETA）', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['etaBeginDate', 'etaEndDate'] },
      atdDate: { label: '大船实际开船时间（ATD）', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['atdBeginDate', 'atdEndDate'] },
      ataDate: { label: '大船实际到港时间（ATA）', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['ataBeginDate', 'ataEndDate'] },
      bargeEtdTime: { label: '驳船预计开船时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bargeEtdBeginDate', 'bargeEtdEndDate'] },
      bargeAtdTime: { label: '驳船实际开船时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bargeAtdBeginDate', 'bargeAtdEndDate'] },
      bizDate: { label: '业务日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bizBeginDate', 'bizEndDate'] },
      receivePayDates: {
        label: '收付日期',
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['receivePayBeginDates', 'receivePayEndDates'],
      },
      polPortCode: {
        label: '起运港',
        type: 'remoteSelect',
        remoteMethod: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let typeStr = ''
          let value = businessTypes?.value || ''
          let data = ''
          if (value.length > 1) {
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            return item.remoteSelectList.splice(0, 1000)
          } else if (value === 'finbill') {
            return item.remoteSelectList.splice(0, 1000)
          } else if (value.indexOf('air') > -1) {
            typeStr = 'airportList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('rail') > -1) {
            typeStr = 'baseRailPortList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('ship') > -1) {
            typeStr = 'basePortList'
            data = { queryString: val, state: 'valid', portAttribute: 'port_of_basic' }
          }
          this.portSearch(data, item, 'port_of_basic', 'portCode', typeStr)
        },
        visibleChange: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let typeStr = ''
          let data = ''
          let value = businessTypes?.value || ''
          if (value.length > 1) {
            this.$msgErrClose('只能选择单个业务类型')
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            item.remoteSelectList.splice(0, 1000)
            return this.$msgErrClose('请先选择业务类型')
          } else if (value === 'finbill') {
            item.remoteSelectList.splice(0, 1000)
            return
          } else if (value.indexOf('air') > -1) {
            typeStr = 'airportList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('rail') > -1) {
            typeStr = 'baseRailPortList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('ship') > -1) {
            typeStr = 'basePortList'
            data = { queryString: val, state: 'valid', portAttribute: 'port_of_basic' }
          }
          this.portSearch(data, item, 'port_of_basic', 'portCode', typeStr)
        },
        remoteSelectList: [],
      },
      podPortCode: {
        label: '目的地',
        type: 'remoteSelect',
        remoteMethod: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let typeStr = ''
          let data = ''
          let value = businessTypes?.value || ''
          if (value.length > 1) {
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            return item.remoteSelectList.splice(0, 1000)
          } else if (value === 'finbill') {
            return item.remoteSelectList.splice(0, 1000)
          } else if (value.indexOf('air') > -1) {
            typeStr = 'airportList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('rail') > -1) {
            typeStr = 'baseRailPortList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('ship') > -1) {
            typeStr = 'basePortList'
            data = { queryString: val, state: 'valid', portAttribute: 'port_of_destination' }
          }
          this.portSearch(data, item, 'port_of_destination', 'portCode', typeStr)
        },
        visibleChange: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let typeStr = ''
          let data = ''
          let value = businessTypes?.value || ''
          if (value.length > 1) {
            this.$msgErrClose('只能选择单个业务类型')
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            item.remoteSelectList.splice(0, 1000)
            return this.$msgErrClose('请先选择业务类型')
          } else if (value === 'finbill') {
            item.remoteSelectList.splice(0, 1000)
            return
          } else if (value.indexOf('air') > -1) {
            typeStr = 'airportList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('rail') > -1) {
            typeStr = 'baseRailPortList'
            data = { portName: val, state: 'valid' }
          } else if (value.indexOf('ship') > -1) {
            typeStr = 'basePortList'
            data = { queryString: val, state: 'valid', portAttribute: 'port_of_destination' }
          }
          this.portSearch(data, item, 'port_of_destination', 'portCode', typeStr)
        },
        remoteSelectList: [],
      },
      sysLineCode: {
        label: '航线',
        type: 'remoteSelect',
        remoteMethod: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let value = businessTypes?.value || ''
          if (value.length)
            if (!value) {
              return item.remoteSelectList.splice(0, 1000)
            } else if (value.length > 1) {
              return item.remoteSelectList.splice(0, 1000)
            } else if (value[0] === 'finbill') {
              return item.remoteSelectList.splice(0, 1000)
            }
          this.baseSystemLineList(val, item)
        },
        visibleChange: (val, item) => {
          let searchInputGroup = this.searchOption1.addFilter.searchInputGroup
          let businessTypes = searchInputGroup.find((item) => item.key === 'businessTypes')
          let value = businessTypes?.value || ''
          if (!value) {
            item.remoteSelectList.splice(0, 1000)
            return this.$msgErrClose('请先选择业务类型')
          } else if (value.length > 1) {
            this.$msgErrClose('只能选择单个业务类型')
            return item.remoteSelectList.splice(0, 1000)
          } else if (value[0] === 'finbill') {
            item.remoteSelectList.splice(0, 1000)
            return
          }
          this.baseSystemLineList(val, item)
        },
        remoteSelectList: [],
      },
      pricingEmployeeId: {
        label: '商务',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
        visibleChange: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
      },
      createdByDeptCode: {
        label: '费用创建人部门',
        prop: 'createdByDeptCode',
        type: 'cascader',
        cascaderList: this.departmentList,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
          multiple: true,
        },
      },
      negativeFollowerId: {
        label: '负数处理人',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      splitFromOrderNo: { label: '拆单原单号', type: 'input' },
      negativeType: { label: '录入负数类型', type: 'select', prop: 'negativeType' },
      custIntrustNo: { label: '客户委托号', type: 'input', placeholder: '多个用英文逗号分隔' },
      podCountryCode: {
        label: '目的国家',
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.countrySelectList(queryString, item),
        visibleChange: (queryString, item) => this.countrySelectList('', item),
      },
      // 签收时间、签收状态。
      signStatus: { label: '签收状态', type: 'select', prop: 'signStatus', multiple: true, },
      signDate: { label: '签收时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['signBeginDate', 'signEndDate'] },
      acfinDate: { label: '会计日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['acFinBeginDate', 'acFinEndDate'] },
      acfinCloseStatus: { label: '是否会计关账', type: 'select', prop: 'yesNo' },
      finBillTypes: { label: '费用单类型', type: 'select', prop: 'finBillBillType', multiple: true  },
    }
  },
  methods: {
  },
  computed: {
    // isFee() {
    //   return this.activeType === 'fee' ? true : false
    // },
    // isSettleUnit() {
    //   return this.activeType === 'fee' ? false : true
    // },
    // ...mapState({
    //   defaultColumnsSU: (state) => state.finance.columns.defaultColumnsFeeListSU,
    // })
  }
}