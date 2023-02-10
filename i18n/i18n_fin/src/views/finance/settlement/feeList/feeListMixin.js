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
      allNo: { label: this.$t('FeeList.allNo'), type: 'input', placeholder: this.$t('FeeList.placeholder') },
      sourceBizNos: { label: this.$t('FeeList.sourceBizNo'), type: 'input', placeholder: this.$t('FeeList.placeholder') },
      exportOrderNo: { label: this.$t('FeeList.exportOrderNo'), type: 'input' },
      hbl: { label: this.$t('FeeList.hbl'), type: 'input' },
      mbl: { label: this.$t('FeeList.mbl'), type: 'input' },
      soNo: { label: this.$t('FeeList.soNo'), type: 'input' },
      billNo: { label: this.$t('FeeList.billNo'), type: 'input' },
      dnNo: { label: this.$t('FeeList.dnNo'), type: 'input' },
      containerNo: { label: this.$t('FeeList.containerNo'), type: 'input', showType: '1' },
      shipCarrierOrderNo: { label: this.$t('FeeList.shipCarrierOrderNo'), type: 'input', showType: '1' },
      whPoNo: { label: this.$t('FeeList.whPoNo'), type: 'input', showType: '1' },
      settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input' },
      payOrderNo: { label: this.$t('FeeList.payOrderNo'), type: 'input' },
      writeoffNo: { label: this.$t('FeeList.writeoffNo'), type: 'input' },
      acctVoucherNos: { label: this.$t('FeeList.acctVoucherNos'), type: 'input' },
      transferAcctVoucherNos: { label: this.$t('FeeList.transferAcctVoucherNos'), type: 'input' },
      hasTransferAcctVoucherNos: { label: this.$t('FeeList.hasTransferAcctVoucherNos'), type: 'select', prop: 'yesNo' },
      confirmStatus: { label: this.$t('FeeList.confirmStatus'), type: 'select', prop: 'yesNo' },
      reviseStatus: { label: this.$t('FeeList.reviseStatus'), type: 'select', prop: 'feeReviseStatus', multiple: true },
      settleLock: { label: this.$t('FeeList.settleLock'), type: 'select', prop: 'finLockStatus' },
      intraStatus: { label: this.$t('FeeList.intraStatus'), type: 'select', prop: 'yesNo' },
      jointStatus: { label: this.$t('FeeList.jointStatus'), type: 'select', prop: 'yesNo' },
      jointDeptName: { label: this.$t('FeeList.jointDeptName'), type: 'input' },
      jointToOrderNo: { label: this.$t('FeeList.jointToOrderNo'), type: 'input' },
      settleStatuss: { label: this.$t('FeeList.settleStatuss'), type: 'select', multiple: true, prop: 'feeSettleStatus' },
      settleOrderStatus: { label: this.$t('FeeList.settleOrderStatus'), type: 'select', prop: 'finFeeSettleOrderStatus', multiple: true },
      // invoiceStatuss: { label: this.$t('FeeList.invoiceStatuss'), type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
      gedgingStatus: { label: this.$t('FeeList.gedgingStatus'), type: 'select', prop: 'yesNo' },
      writeoffStatuss: { label: this.$t('FeeList.writeoffStatuss'), type: 'select', multiple: true, prop: 'writeoffStatus' },
      precloseStatus: { label: this.$t('FeeList.precloseStatus'), type: 'select', prop: 'yesNo' },
      closeStatus: { label: this.$t('FeeList.closeStatus'), type: 'select', prop: 'yesNo' },
      serviceCodes: { label: this.$t('FeeList.serviceCodes'), type: 'select', multiple: true, prop: 'allServiceCode', filterable: false },
      // feeName: {
      //   label: this.$t('FeeList.feeEname'),
      //   type: 'remoteSelect',
      //   reqKey: 'feeCode',
      //   multiple: true,
      //   remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
      //   visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
      //   remoteSelectList: [],
      //   scope: true,
      // },
      feeEname: {
        label: this.$t('FeeList.feeEname'),
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
      feeUnit: { label: this.$t('FeeList.feeUnit'), type: 'select', prop: 'feeUnit' },
      currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
      receipayType: { label: this.$t('FeeList.receipayType'), type: 'select', prop: 'receipayGroup' },
      settleCycles: { label: this.$t('FeeList.settleCycles'), type: 'select', multiple: true, prop: 'settleCycle' },
      feeAmt: { label: this.$t('FeeList.feeAmt'), type: 'range' },
      // taxAmt: { label: this.$t('FeeList.taxAmt'), type: 'range' },
      // feeAmtWithoutTax: { label: this.$t('FeeList.feeAmtWithoutTax'), type: 'range' },
      canSettleApplyAmt: { label: this.$t('FeeList.canSettleApplyAmt'), type: 'range' },
      settleCorpCodes: {
        label: this.$t('FeeList.settleCorp'),
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
        label: this.$t('FeeList.settleComp'),
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
        label: this.$t('FeeList.agentCompCodes'),
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
      settleCorpType: { prop: 'unitType', label: this.$t('FeeList.settleCorpType'), type: 'select' },
      settleCorpSubType: { prop: 'settleUnitSubType', label: this.$t('FeeList.settleCorpSubType'), type: 'select' },
      preCloseDate: {
        label: this.$t('FeeList.preCloseDate'),
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['preCloseBeginDate', 'preCloseEndDate'],
      },
      closeDate: { label: this.$t('FeeList.closeDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['closeBeginDate', 'closeEndDate'] },
      finDate: { label: this.$t('FeeList.finDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['finBeginDate', 'finEndDate'] },
      createdDate: { label: this.$t('FeeList.createdDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
      confirmDate: {
        label: this.$t('FeeList.confirmDate'),
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['confirmBeginDate', 'confirmEndDate'],
      },
      writeOffDate: { label: this.$t('FeeList.writeOffDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['writeoffBeginDate', 'writeoffEndDate'] },
      bdEmployeeId: {
        label: this.$t('FeeList.bdEmployeeId'),
        type: 'remoteSelect',
        clearable: true,
        multiple: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.getSellers(queryString, item, 'bd')
        },
        visibleChange: (queryString, item) => {
          this.getSellers(queryString, item, 'bd')
        },
      },
      opEmployeeId: {
        label: this.$t('FeeList.opEmployeeId'),
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
        label: this.$t('FeeList.obdEmployeeId'),
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
        label: this.$t('FeeList.createdBy'),
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      // taxRate: { label: this.$t('FeeList.taxRate'), type: 'select', prop: 'taxRateInfo' },
      finGroup: { label: this.$t('FeeList.finGroup'), type: 'select', prop: 'feeitemFinGroup' },
      // isIssueInvoice: { label: this.$t('FeeList.isIssueInvoice'), type: 'select', prop: 'yesNo' },
      // invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input' },
      payApplySettleNo: { label: this.$t('FeeList.payApplySettleNo'), type: 'input' },
      confirmBy: {
        label: this.$t('FeeList.confirmBy'),
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      bkgAgentSupplierId: {
        label: this.$t('FeeList.bkgAgentSupplierId'),
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
        label: this.$t('FeeList.custId'),
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
      serviceType: { label: this.$t('FeeList.serviceType'), type: 'select', prop: 'diyServiceType', multiple: true, },
      businessTypes: {
        label: this.$t('FeeList.businessTypes'),
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
        label: this.$t('FeeList.shipCarrierCodes'),
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
        label: this.$t('FeeList.bdDeptCode'),
        prop: 'bdDeptCode',
        type: 'diyCascader',
        cascaderList: this.departmentList,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
        },
      },
      etdDate: { label: this.$t('FeeList.etdDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['etdBeginDate', 'etdEndDate'] },
      etaDate: { label: this.$t('FeeList.etaDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['etaBeginDate', 'etaEndDate'] },
      atdDate: { label: this.$t('FeeList.atdDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['atdBeginDate', 'atdEndDate'] },
      ataDate: { label: this.$t('FeeList.ataDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['ataBeginDate', 'ataEndDate'] },
      bargeEtdTime: { label: this.$t('FeeList.bargeEtdTime'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bargeEtdBeginDate', 'bargeEtdEndDate'] },
      bargeAtdTime: { label: this.$t('FeeList.bargeAtdTime'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bargeAtdBeginDate', 'bargeAtdEndDate'] },
      bizDate: { label: this.$t('FeeList.bizDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bizBeginDate', 'bizEndDate'] },
      receivePayDates: {
        label: this.$t('FeeList.receivePayDates'),
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['receivePayBeginDates', 'receivePayEndDates'],
      },
      polPortCode: {
        label: this.$t('FeeList.polPortCode'),
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
            this.$msgErrClose(this.$t('FeeList.singleTips'))
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            item.remoteSelectList.splice(0, 1000)
            return this.$msgErrClose(this.$t('FeeList.firstTips'))
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
        label: this.$t('FeeList.podPortCode'),
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
            this.$msgErrClose(this.$t('FeeList.singleTips'))
            return item.remoteSelectList.splice(0, 1000)
          }
          value = value[0]
          if (!value) {
            item.remoteSelectList.splice(0, 1000)
            return this.$msgErrClose(this.$t('FeeList.firstTips'))
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
        label: this.$t('FeeList.sysLineCode'),
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
            return this.$msgErrClose(this.$t('FeeList.firstTips'))
          } else if (value.length > 1) {
            this.$msgErrClose(this.$t('FeeList.singleTips'))
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
        label: this.$t('FeeList.pricingEmployeeId'),
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
        visibleChange: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
      },
      createdByDeptCode: {
        label: this.$t('FeeList.createdByDeptCode'),
        prop: 'createdByDeptCode',
        type: 'diyCascader',
        cascaderList: this.departmentList,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
        },
      },
      negativeFollowerId: {
        label:  this.$t('FeeList.negativeFollowerId'),
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
        visibleChange: (queryString, item) => this.getEmployeeList('', item),
      },
      splitFromOrderNo: { label:  this.$t('FeeList.splitFromOrderNo'), type: 'input' },
      negativeType: { label:  this.$t('FeeList.negativeType'), type: 'select', prop: 'negativeType' },
      custIntrustNo: { label: this.$t('FeeList.custIntrustNo'), type: 'input', placeholder: this.$t('FeeList.placeholder') },
      podCountryCode: {
        label:  this.$t('FeeList.podCountryCode'),
        type: 'remoteSelect',
        clearable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.countrySelectList(queryString, item),
        visibleChange: (queryString, item) => this.countrySelectList('', item),
      },
      // 签收时间、签收状态。
      signStatus: { label: this.$t('FeeList.signStatus'), type: 'select', prop: 'signStatus', multiple: true, },
      signDate: { label:  this.$t('FeeList.signDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['signBeginDate', 'signEndDate'] },
      acfinDate: { label:  this.$t('FeeList.acfinDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['acFinBeginDate', 'acFinEndDate'] },
      acfinCloseStatus: { label:  this.$t('FeeList.acfinCloseStatus'), type: 'select', prop: 'yesNo' },
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