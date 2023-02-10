import ColumnScn from '@/views/order/order/orderList/planorder/followItems/components/ColumnScn.vue'
import ColumnOrderNo from '@/views/order/order/orderList/planorder/followItems/components/ColumnOrderNo.vue'
import StatusColumns from '@/views/order/order/orderList/planorder/followItems/components/statusColumns.vue'
import ColumnRemark from '@/views/order/order/orderList/planorder/followItems/components/ColumnRemark.vue'
import ColumnCheckBox from '@/views/order/order/orderList/planorder/followItems/components/ColumnCheckBox.vue'
import ColumnUpload from '@/views/order/order/orderList/planorder/followItems/components/ColumnUpload.vue'
import { getDictLabel } from '@/utils/tools'
import store from '@/store'
const bulkRoBkgStatusObj = {
	'pass': '未订舱',
	'booked': '已订舱',
	'book_release': '上家已放舱',
	'release_custom': '已放舱给客户'
}
const fristBaseDefaultColumns = [
  'orderNo',
  'jointNo',
  'soNo',
]
const lastBaseDefaultColumns = [
  'remark', // 个人备注
  'poImp',
  'refNo',
  'scn', // 收发通
  'cs',// 成本&卖价&利润
  'bkgStatus',
  'custIntrustNo',
  'polPortCode',
  'podPortCode',
  'sysLineName',
  'etd',
  'eta',
  'td',
  'ta',
  'vessel',
  'bargePorPortCode',
  'bargeCyCutOff',
  'bargeEtd',
  'bargeTd',
  'bargeVessel',
  'shipCarrierCode',
  'container',
  'teu',
  'volume',
  'cargoName',
  'mblNo',
  'hblNo',
  'siCutOff',
  'vgmCutOff',
  'ccCutOff',
  'bdEmployeeName',
  'obdEmployeeName',
  'freetime',
  'bizDate',
  'custName',
  'bkgAgentSupplierName',
  'shipperOrgName',
  'isWhiteCust',
  'priceEmployeeName',
  'docEmployeeName',
  'opEmployeeName',
  'cscEmployeeName',
  'opTruckEmployeeName',
  'opCustomsEmployeeName',
  'opWhEmployeeName',
  'tcEmployeeName',
  'tcHblEmployeeName',
  'tcTradeEmployeeName',
  'rcEmployeeName',
  'eacEmployeeName',
  'epricingEmployeeName',
  'acEmployeeName',
  'assitEmployeeName',
  'ecsEmployeeName',
]
function fristInitColumnsBase(handleClickRefreshList) {
  return [
    {
      label: '工作号',
      key: 'orderNo',
      prop: 'orderNo',
      fixed: true,
      width: '150',
      disabled: false,
      sortable: 'custom',
      popoverComponent: ColumnOrderNo,
      type: 'text',
    },
    {
      label: '协同单号',
      key: 'jointNo',
      prop: 'jointNo',
      width: '150',
      disabled: false,
      sortable: 'custom',
      type: 'text',
    },
    { label: 'SO号', key: 'soNo', prop: 'soNo', disabled: false, width: '150' },
  ]
}
function lastInitColumnsBase(handleClickRefreshList) {
  return [
    {
      label: '个人备注',
      key: 'remark',
      prop: 'remark',
      disabled: false,
      popoverComponent: ColumnRemark,
      method: (row, val) => {
        handleClickRefreshList(row, val)
      },
      width: '150'
    },
    {
      label: 'PO/IMP',
      key: 'poImp',
      prop: 'poImp',
      disabled: false,
      popoverComponent: ColumnRemark,
      method: (row, val) => {
        handleClickRefreshList(row, val)
      },
      width: '80'
    },
    {
      label: 'Ref No.',
      key: 'refNo',
      prop: 'refNo',
      disabled: false,
      popoverComponent: ColumnRemark,
      method: (row, val) => {
        handleClickRefreshList(row, val)
      },
      width: '80'
    },
    {
      label: '收发通',
      key: 'scn',
      prop: 'scn',
      disabled: false,
      popoverComponent: ColumnScn,
      width: '60'
    },
    {
      label: '成本&卖价&利润',
      key: 'cs',
      prop: 'cs',
      disabled: false,
      popoverComponent: ColumnScn,
      width: '120'
    },
    {
      label: '订舱状态',
      key: 'bkgStatus',
      prop: 'bkgStatus',
      disabled: false,
      width: '80',
      formatter: (row, column) => {
        let str = ''
        str = getDictLabel('bkgStatus', row.bkgStatus)
        if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
        // 散杂滚装的订舱状态特殊处理
        if (row.businessType === 'ship_bulk_ro') {
          for (var i in bulkRoBkgStatusObj) {
            if (i === row.bkgStatus) {
              str = bulkRoBkgStatusObj[row.bkgStatus]
            }
          }
        }
        // return `<span class="bkgStatus-${row.bkgStatus}">${str}</span>`
        return `<span>${str}</span>`
      }
    },
    { 
      label: '客户委托号', 
      key: 'custIntrustNo',
      prop: 'custIntrustNo',
      disabled: false,
      width: '120'
    },
    {
      label: 'POL', // 大船起运港
      key: 'polPortCode',
      prop: 'polPortCode',
      width: '120',
      disabled: false,
      formatter: (row, column) => {
        return row.polPortName
      }
    },
    {
      label: 'POD', // 目的地
      key: 'podPortCode',
      prop: 'podPortCode',
      width: '120',
      disabled: false,
      formatter: (row, column) => {
        return row.podPortName
      }
    },
    {
      label: '系统航线',
      key: 'sysLineName',
      prop: 'sysLineName',
      width: '100',
      disabled: false,
    },
    {
      label: 'ETD', // 大船预计开船时间
      key: 'etd',
      prop: 'etd',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: 'ETA', // 预计到港时间
      key: 'eta',
      prop: 'eta',
      width: '140',
      sortable: 'custom',
      disabled: false
    },
    {
      label: 'ATD', // 大船实际开船时间
      key: 'td',
      prop: 'td',
      width: '140',
      disabled: false,
      sortable: 'custom'
    },
    { label: 'ATA', key: 'ta', prop: 'ta', width: '140', sortable: 'custom' }, // 实际到港日期
    {
      label: '大船船名/航次',
      key: 'vessel',
      prop: 'vessel',
      disabled: false,
      width: 150,
      formatter: (row, column) => {
        return mergeMethod(row.vessel, row.voyage)
      }
    },
    {
      label: '驳船收货地',
      key: 'bargePorPortCode',
      prop: 'bargePorPortCode',
      disabled: false,
      width: '150',
      formatter: (row, column) => {
        return row.bargePorPortName
      }
    },
    {
      label: '驳船截关时间',
      key: 'bargeCyCutOff',
      prop: 'bargeCyCutOff',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: '驳船预计开船时间',
      key: 'bargeEtd',
      prop: 'bargeEtd',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: '驳船实际开船时间',
      key: 'bargeTd',
      prop: 'bargeTd',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: '驳船船名/航次',
      key: 'bargeVessel',
      prop: 'bargeVessel',
      disabled: false,
      width: '120',
      formatter: (row, column) => {
        return mergeMethod(row.bargeVessel, row.bargeVoyage)
      }
    },
    {
      label: '船司',
      key: 'shipCarrierCode',
      prop: 'shipCarrierCode',
      disabled: false,
      width: '80'
    },
    { label: '箱型箱量', key: 'container', prop: 'container', disabled: false, width: '150' },
    { label: 'TEU', key: 'teu', prop: 'teu', disabled: false, width: '60' },
    {
      label: '体积',
      key: 'volume',
      prop: 'volume',
      disabled: false,
      width: 80
    },
    {
      label: '品名',
      key: 'cargoName',
      prop: 'cargoName',
      disabled: false,
      width: '100'
    },
    { label: 'MBL', key: 'mblNo', prop: 'mblNo', disabled: false, width: '150' },
    { label: 'HBL', key: 'hblNo', prop: 'hblNo', disabled: false, width: '150' },
    {
      label: '截SI',
      key: 'siCutOff',
      prop: 'siCutOff',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: '截VGM',
      key: 'vgmCutOff',
      prop: 'vgmCutOff',
      disabled: false,
      sortable: 'custom',
      width: '140'
    },
    {
      label: '截关',
      key: 'ccCutOff',
      prop: 'ccCutOff',
      disabled: false,
      sortable: 'custom',
      width: '120'
    },
    {
      label: '销售',
      key: 'bdEmployeeName',
      prop: 'bdEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '销售助理',
      key: 'obdEmployeeName',
      prop: 'obdEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: 'FREETIME',
      key: 'freetime',
      prop: 'freetime',
      disabled: false,
      width: '100'
    },
    {
      label: '业务日期',
      sortable: 'custom',
      key: 'bizDate',
      prop: 'bizDate',
      disabled: false,
      width: 100
    },
    {
      label: '委托单位',
      sortable: 'custom',
      key: 'custName',
      prop: 'custName',
      disabled: false,
      width: '150'
    },
    {
      label: '订舱代理',
      key: 'bkgAgentSupplierName',
      prop: 'bkgAgentSupplierName',
      disabled: false,
      width: '150'
    },
    {
      label: '工厂',
      key: 'shipperOrgName',
      prop: 'shipperOrgName',
      disabled: false,
      width: '150',
      formatter: (row, column) => {
        return !row.shipperOrgName || row.shipperOrgName === 'null' ? '' : row.shipperOrgName
      }
    },
    {
      label: '是否白名单',
      key: 'isWhiteCust',
      prop: 'isWhiteCust',
      disabled: false,
      width: '120',
      formatter: (row, column) => {
        return row.isWhiteCust === 'Y' ? '是' : '否'
      }
    },
    {
      label: '商务',
      key: 'priceEmployeeName',
      prop: 'priceEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '文件',
      key: 'docEmployeeName',
      prop: 'docEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '操作',
      key: 'opEmployeeName',
      prop: 'opEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '单证',
      key: 'cscEmployeeName',
      prop: 'cscEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '拖车操作',
      key: 'opTruckEmployeeName',
      prop: 'opTruckEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '关务操作',
      key: 'opCustomsEmployeeName',
      prop: 'opCustomsEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '仓储操作',
      key: 'opWhEmployeeName',
      prop: 'opWhEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: 'MBL取单人',
      key: 'tcEmployeeName',
      prop: 'tcEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: 'HBL取单人',
      key: 'tcHblEmployeeName',
      prop: 'tcHblEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '贸易单证取单人',
      key: 'tcTradeEmployeeName',
      prop: 'tcTradeEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '放货人',
      key: 'rcEmployeeName',
      prop: 'rcEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '海外应收财务',
      key: 'eacEmployeeName',
      prop: 'eacEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '海外商务',
      key: 'epricingEmployeeName',
      prop: 'epricingEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '应收财务',
      key: 'acEmployeeName',
      prop: 'acEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '下单助理',
      key: 'assitEmployeeName',
      prop: 'assitEmployeeName',
      disabled: false,
      width: '100'
    },
    {
      label: '海外客服',
      key: 'ecsEmployeeName',
      prop: 'ecsEmployeeName',
      disabled: false,
      width: '100'
    },
  ]
}
// 全部列表
const allList = {
   // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'loa',
    'release',
    'truck',
    'pol_warehouse',
    'stuffing',
    'pol_ltl',
    'vgm',
    'pol_declaration',
    'pol_inspection',
    'fume',
    'other_inspect',
    'plan_todo',
    'blConfirm',
    'si',
    'blCopy',
    'blCopyCust',
    'putApply',
    'finAudit',
    'releaseAgree',
    'take',
    'put',
    'departure',
    'sa',
    'freetimeStatus',
    'doc',
    'insurance',
    'fee',
    'bill',
    'arrival',
    'pod_change_doc',
    'pod_comm_clearance',
    'pod_warehouse',
    'delivery',
    'delivery_ltl',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  statusColumns: [
    { 
      key: 'loa', 
      mapValue: 'followLoaStatus',
      routePage: [
        {
          name: 'FileList',
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'release', 
      mapValue: 'followReleaseStatus',
      routePage: [
        {
          name: 'BookShip',
          statusList: ['to_book', 'booking', 'booked', 'book_release'],
          queryList: ['orderNo'],
        },
        {
          name: 'OrderBook',
          statusList: ['release_cust_part', 'release_cust_all'],
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'truck', 
      mapValue: 'followTruckStatus',
      routePage: [
        {
          name: 'ShippingTruck',
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'pol_warehouse', 
      mapValue: 'followPolWhStatus', 
      routePage: [
        {
          name: 'Warehouse',
          query: {
            toTab: 'Warehouse'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'stuffing', 
      mapValue: 'followStuffingStatus',
      routePage: [
        {
          name: 'Warehouse',
          query: {
            toTab: 'YardBox'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ] 
    },
    { 
      key: 'pol_ltl', 
      mapValue: 'followScatterStatus',
      routePage: [
        {
          name: 'PolLtl',
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ], 
    },
    { 
      key: 'vgm', 
      mapValue: 'followVgmStatus',
      routePage: [
        {
          name: 'ContainerList',
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'pol_declaration', 
      mapValue: 'followCustomsStatus',
      routePage: [
        {
          name: 'Clearance',
          query: {
            toTab: 'Agent'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ], 
    },
    { 
      key: 'pol_inspection', 
      mapValue: 'followInspectionStatus',
      routePage: [
        {
          name: 'Clearance',
          query: {
            toTab: 'Inspection'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ], 
    },
    { 
      key: 'fume', 
      mapValue: 'followFumeStatus', 
      routePage: [
        {
          name: 'Fume',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'other_inspect', 
      mapValue: 'followOtherInspectionStatus', 
      routePage: [
        {
          name: 'InspectionAndDetection',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'plan_todo', 
      mapValue: 'followPlanTodoStatus',
      routePage: []
    },
    { 
      key: 'blConfirm', 
      mapValue: 'followBlConfirm',
      routePage: [
        {
          name: 'BlList',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ], 
    },
    { 
      key: 'si', 
      mapValue: 'followSi',
      routePage: [
        {
          name: 'SiList',
          queryList: ['orderNo']
        }
      ],
    },
    { 
      key: 'blCopy', 
      mapValue: 'followBlCopy',
      routePage: [
        {
          name: 'SiList',
          queryList: ['orderNo']
        }
      ],
    },
    { 
      key: 'blCopyCust', 
      mapValue: 'followBlCopyCust', 
      routePage: [
        {
          name: 'BlList',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'putApply', 
      mapValue: 'followPutApply',
      routePage: [
        {
          name: 'BlFinApplyList',
          query: {
            tab: 'apply'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'finAudit', 
      mapValue: 'followFinAudit', 
      routePage: [
        {
          name: 'BlFinApplyList',
          query: {
            tab: 'audit'
          },
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'releaseAgree',
      mapValue: 'followReleaseAgree', 
      routePage: [
        {
          name: 'BlList',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'take', 
      mapValue: 'followTake',
      routePage: [
        {
          name: 'RailwayMblTakeList',
          queryList: ['orderNo'],
        }
      ]
    },
    { 
      key: 'put', 
      mapValue: 'followPut',
      routePage: [
        {
          name: 'RailwayPutList',
          queryList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'departure',
      mapValue: 'followCargoTraceStatus',
      routePage: [],
    },
    { 
      key: 'sa', 
      mapValue: 'followSaStatus',
      routePage: [
        {
          name: 'OrderDetail',
          statusList: ['to_sa'],
          queryList: ['orderNo'],
          paramsList: ['orderNo'],
        }
      ],
    },
    { 
      key: 'freetimeStatus', 
      mapValue: 'followFreetimeStatus',
      routePage: [],
    },
    { 
      key: 'doc', 
      mapValue: 'followDocumentStatus',
      routePage: [
        // 1、to_retrieve、未取单
        // 2、retrieve_part、部分取单
        // 3、retrieve_all、全部取单
        // 4、put_part、部分放单
        // 5、put_all、全部放单
        {
          name: 'RailwayTradeTakeList',
          statusList: ['to_retrieve', 'retrieve_part', 'retrieve_all'],
          queryList: ['orderNo'],
        },
        {
          name: 'RailwayPutList',
          statusList: ['put_part', 'put_all'],
          queryList: ['orderNo'],
        }
      ]
    },
    { 
      key: 'insurance', 
      mapValue: 'followInsuranceStatus',
      routePage: [
        // 1、to_retrieve、未取单
        // 2、retrieve_part、部分取单
        // 3、retrieve_all、全部取单
        // 4、put_part、部分放单
        // 5、put_all、全部放单
        {
          name: 'RailwayTradeTakeList',
          statusList: ['to_retrieve', 'retrieve_part', 'retrieve_all'],
          queryList: ['orderNo'],
        },
        {
          name: 'RailwayPutList',
          statusList: ['put_part', 'put_all'],
          queryList: ['orderNo'],
        }
      ]
    },
    { 
      key: 'fee', 
      mapValue: 'followFeeStatus', 
      routePage: [
        {
          name: 'OrderFee',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'bill', 
      mapValue: 'followBillStatus', 
      routePage: [
        {
          name: 'OrderFee',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'arrival', 
      mapValue: 'followCargoTraceStatus', 
      routePage: []
    },
    { 
      key: 'pod_change_doc', 
      mapValue: 'followPodExchangeDocStatus', 
      routePage: [
        {
          name: 'PodChangeDoc',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'pod_comm_clearance', 
      mapValue: 'followCustomsClearanceStatus',
      routePage: [
        {
          name: 'PodCommClearance',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ], 
    },
    { 
      key: 'pod_warehouse', 
      mapValue: 'followPolWhStatus', 
      routePage: [
        {
          name: 'PodWarehouseIng',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'delivery', 
      mapValue: 'followDeliveryStatus', 
      routePage: [
        {
          name: 'PodFclDelivery',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
    { 
      key: 'delivery_ltl', 
      mapValue: 'followDeliveryStatus', 
      routePage: [
        {
          name: 'PodLtlDelivery',
          queryList: ['orderNo'],
          paramsList: ['orderNo']
        }
      ],
    },
  ],
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      ...lastInitColumnsBase(handleClickRefreshList),
      {
				label: '托书',
				key: 'loa',
				prop: 'loa',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followLoaStatus')
        }
			},
      {
				label: '放舱',
				key: 'release',
				prop: 'release',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followReleaseStatus')
        }
			},
      {
				label: '拖柜',
				key: 'truck',
				prop: 'truck',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followTruckStatus')
        }
			},
      {
				label: '起运港仓储',
				key: 'pol_warehouse',
				prop: 'pol_warehouse',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPolWhStatus')
        }
			},
      {
				label: '堆场装箱',
				key: 'stuffing',
				prop: 'stuffing',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followStuffingStatus')
        }
			},
      {
				label: '散车',
				key: 'pol_ltl',
				prop: 'pol_ltl',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followScatterStatus')
        }
			},
      {
				label: 'VGM',
				key: 'vgm',
				prop: 'vgm',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followVgmStatus')
        }
			},
      {
				label: '报关',
				key: 'pol_declaration',
				prop: 'pol_declaration',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followCustomsStatus')
        }
			},
      {
				label: '报检',
				key: 'pol_inspection',
				prop: 'pol_inspection',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followInspectionStatus')
        }
			},
      {
				label: '熏蒸',
				key: 'fume',
				prop: 'fume',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followFumeStatus')
        }
			},
      {
				label: '各类检验',
				key: 'other_inspect',
				prop: 'other_inspect',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followOtherInspectionStatus')
        }
			},
      {
				label: '计划单',
				key: 'plan_todo',
				prop: 'plan_todo',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPlanTodoStatus')
        }
			},
      {
				label: '草单确认',
				key: 'blConfirm',
				prop: 'blConfirm',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followBlConfirm')
        }
			},
      {
				label: 'SI',
				key: 'si',
				prop: 'si',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followSi')
        }
			},
      {
				label: '单证核对copy',
				key: 'blCopy',
				prop: 'blCopy',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followBlCopy')
        }
			},
      {
				label: '客户核对copy',
				key: 'blCopyCust',
				prop: 'blCopyCust',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followBlCopyCust')
        }
			},
      {
				label: '放单申请',
				key: 'putApply',
				prop: 'putApply',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPutApply')
        }
			},
      {
				label: '放单财务审核',
				key: 'finAudit',
				prop: 'finAudit',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followFinAudit')
        }
			},
      {
				label: '客户同意放货',
				key: 'releaseAgree',
				prop: 'releaseAgree',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followReleaseAgree')
        }
			},
      {
				label: '取单',
				key: 'take',
				prop: 'take',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followTake')
        }
			},
      {
				label: '放单',
				key: 'put',
				prop: 'put',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPut')
        }
			},
      {
				label: '离港',
				key: 'departure',
				prop: 'departure',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followCargoTraceStatus')
        }
			},
      {
				label: 'SA',
				key: 'sa',
				prop: 'sa',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followSaStatus')
        }
			},
      {
				label: 'FREETIME',
				key: 'freetimeStatus',
				prop: 'freetimeStatus',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followFreetimeStatus')
        }
			},
      {
				label: '贸易单证',
				key: 'doc',
				prop: 'doc',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followDocumentStatus')
        }
			},
      {
				label: '保险',
				key: 'insurance',
				prop: 'insurance',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followInsuranceStatus')
        }
			},
      {
				label: '费用',
				key: 'fee',
				prop: 'fee',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followFeeStatus')
        }
			},
      {
				label: '账单',
				key: 'bill',
				prop: 'bill',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followBillStatus')
        }
			},
      {
				label: '到港',
				key: 'arrival',
				prop: 'arrival',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followCargoTraceStatus')
        }
			},
      {
				label: '目的港换单',
				key: 'pod_change_doc',
				prop: 'pod_change_doc',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPodExchangeDocStatus')
        }
			},
      {
				label: '目的港清关',
				key: 'pod_comm_clearance',
				prop: 'pod_comm_clearance',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followCustomsClearanceStatus')
        }
			},
      {
				label: '目的港仓储',
				key: 'pod_warehouse',
				prop: 'pod_warehouse',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followPolWhStatus')
        }
			},
      {
				label: '目的港派送',
				key: 'delivery',
				prop: 'delivery',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followDeliveryStatus')
        }
			},
      {
				label: '目的港散车派送',
				key: 'delivery_ltl',
				prop: 'delivery_ltl',
				disabled: false,
				width: '100',
        popoverComponent: StatusColumns,
        headerSign: {
          htmlText: getMapTipText('followDeliveryStatus')
        }
			},
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 托书列表
const loaList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'name',
    'auditStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handlePreview, handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '托书',
				key: 'name',
				prop: 'name',
				disabled: false,
				width: '120',
        formatter: (row, column) => {
          if (row.name) {
            return `<el-button type="text" class="underline">${row.name}</el-button>`
          } else {
            return ''
          }
        },
        method: (index, row) => {
					handlePreview(row)
				}
      },
      {
				label: '托书审核状态',
				key: 'auditStatus',
				prop: 'auditStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          let obj = {
            SUBMIT: '待审核',
            PASS: '通过',
            REFUSE: '拒绝',
          }
          return obj[row.auditStatus] || '未上传'
				}
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 放舱列表
const releaseList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    // 'bkgStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 拖柜列表    
const truckList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'cn',
    'sn',
    'containerType',
    'status',
    'so',
    'doTime',
    'pickEmptyTime',
    'intrustTime',
    'boxTime',
    'returnTime',
    'truckCost',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList, handleClickRefreshListAndColumn),
      { label: '柜号', key: 'cn', prop: 'cn', disabled: false, width: '150' },
			{ label: '封号', key: 'sn', prop: 'sn', disabled: false, width: '150' },
      { label: '箱型', key: 'containerType', prop: 'containerType', disabled: false, width: '150' },
      { label: '订舱号', key: 'so', prop: 'so', disabled: false, width: '150' },
      { label: '提柜状态', key: 'status', prop: 'status', disabled: false, width: '150', formatter: (row, column) => {
        return getDictLabel('containerStatus', row.status)
      }},
      { label: '做柜时间', key: 'doTime', prop: 'doTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '提柜时间', key: 'pickEmptyTime', prop: 'pickEmptyTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '委托装柜时间', key: 'intrustTime', prop: 'intrustTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '实际到场时间', key: 'boxTime', prop: 'boxTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '还重柜时间', key: 'returnTime', prop: 'returnTime', disabled: false, width: '120', sortable: 'custom' },
      {
        label: '拖车成本',
        key: 'truckCost',
        prop: 'truckCost',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 散车
const polLtlList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'intrustStatus',
    'intrustTime',
    'boxTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '派车委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      { label: '委托状态', key: 'intrustStatus', prop: 'intrustStatus', disabled: false, width: '100', formatter: (row, column) => {
        return getDictLabel('truckIntrustStatus', row.intrustStatus)
      }},
      {
				label: '委托提货时间',
				key: 'intrustTime',
				prop: 'intrustTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      { label: '实际到场时间', key: 'boxTime', prop: 'boxTime', disabled: false, width: '120', sortable: 'custom' },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 起运港仓储列表
const polWarehouseList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'inoutType',
    'status',
    'inPlanNo',
    'inBatchNo',
    'outPlanNo',
    'outBatchNo',
    'inPlanTime',
    'inRealTime',
    'outPlanTime',
    'outRealTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      { label: '进出仓类型', key: 'inoutType', prop: 'inoutType', disabled: false, width: '120', formatter: (row, column) => {
        if (row.inoutType === 'in') {
          return '进仓'
        } else if (row.inoutType === 'out') {
          return '出仓'
        } else {
          return ''
        }
      }},
      { label: '状态', key: 'status', prop: 'status', disabled: false, width: '80', formatter: (row, column) => {
        if (row.inoutType === 'in') {
          return row.inRealTime ?  '已进仓' : '未进仓'
        } else if (row.inoutType === 'out') {
          return row.outRealTime ?  '已出仓' : '未出仓'
        } else {
          return ''
        }
      }},
      {
				label: '进仓计划编号',
				key: 'inPlanNo',
				prop: 'inPlanNo',
				width: '120',
				disabled: false,
			},
      {
				label: '实际进仓编号',
				key: 'inBatchNo',
				prop: 'inBatchNo',
				width: '120',
				disabled: false,
			},
      {
				label: '出仓计划编号',
				key: 'outPlanNo',
				prop: 'outPlanNo',
				width: '120',
				disabled: false,
			},
      {
				label: '实际出仓编号',
				key: 'outBatchNo',
				prop: 'outBatchNo',
				width: '120',
				disabled: false,
			},
      { label: '预计进仓时间', key: 'inPlanTime', prop: 'inPlanTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '实际进仓时间', key: 'inRealTime', prop: 'inRealTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '预计出仓时间', key: 'outPlanTime', prop: 'outPlanTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '实际出仓时间', key: 'outRealTime', prop: 'outRealTime', disabled: false, width: '120', sortable: 'custom' },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 堆场列表
const stuffingList = {
  defaultColumns: [
    ...fristBaseDefaultColumns,
    'status',
    'boxId',
    'packTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '状态',
				key: 'status',
				prop: 'status',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('boxStatus', row.status)
				}
			},
      {
				label: '堆场委托编号',
				key: 'boxId',
				prop: 'boxId',
				disabled: false,
				width: '120',
			},
      {
				label: '装箱时间',
				key: 'packTime',
				prop: 'packTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// VGM
const vgmList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'cn',
    'sn',
    'containerType',
    'status',
    'so',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      { label: '柜号', key: 'cn', prop: 'cn', disabled: false, width: '150' },
			{ label: '封号', key: 'sn', prop: 'sn', disabled: false, width: '150' },
      { label: '箱型', key: 'containerType', prop: 'containerType', disabled: false, width: '150' },
      { label: '订舱号', key: 'so', prop: 'so', disabled: false, width: '150' },
      { label: 'VGM申报状态', key: 'status', prop: 'status', disabled: false, width: '100', formatter: (row, column) => {
        return getDictLabel('vgmStatus', row.status)
      } },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 报关列表
const polDeclarationList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'cn',
    'sn',
    'so',
    'isPayTaxes',
    'instrustStatus',
    'customsReleaseTime',
    'dockReleaseTime',
    'intrustTime',
    'releaseTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '柜号',
				key: 'cn',
				prop: 'cn',
				width: '120',
				disabled: false,
			},
      {
				label: '封号',
				key: 'sn',
				prop: 'sn',
				width: '120',
				disabled: false,
			},
      {
				label: '订舱号',
				key: 'so',
				prop: 'so',
				width: '120',
				disabled: false,
			},
      {
				label: '是否代垫税金',
				key: 'isPayTaxes',
				prop: 'isPayTaxes',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return row.isPayTaxes === 'Y' ? '是' : '否'
        }
			},
      {
				label: '报关委托状态',
				key: 'instrustStatus',
				prop: 'instrustStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('customsIntrustStatus', row.instrustStatus)
        }
			},
      {
				label: '海关放行时间',
				key: 'customsReleaseTime',
				prop: 'customsReleaseTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '码头放行时间',
				key: 'dockReleaseTime',
				prop: 'dockReleaseTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '委托报关日期',
				key: 'intrustTime',
				prop: 'intrustTime',
				width: '120',
				disabled: false,
				sortable: 'custom' 
			},
      {
				label: '报关放行时间',
				key: 'releaseTime',
				prop: 'releaseTime',
				width: '120',
				disabled: false,
				sortable: 'custom' 
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 报检列表
const polInspectionList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'intrustStatus',
    'intrustTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '报检委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '是否已委托',  // 委托状态
				key: 'intrustStatus',
				prop: 'intrustStatus',
				width: '120',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('inspectionStatus', row.intrustStatus)
        }
			},
      {
				label: '委托报检时间', // 委托日期
				key: 'intrustTime',
				prop: 'intrustTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 熏蒸列表
const fumeList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'intrustStatus',
    'intrustTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '熏蒸委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '是否已熏蒸',  // 熏蒸状态
				key: 'intrustStatus',
				prop: 'intrustStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('fumeIntrustStatus', row.intrustStatus)
        }
			},
      {
				label: '委托熏蒸时间', // 熏蒸日期
				key: 'intrustTime',
				prop: 'intrustTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 各类检验列表
const otherInspectList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'type',
    'intrustNo',
    'status',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '检验类型',
				key: 'type',
				prop: 'type',
				width: '100',
				disabled: false,
			},
      {
				label: '委托编号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '委托状态',  
				key: 'status',
				prop: 'status',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          if (row.type === 'coc') {
            return getDictLabel('cocSasoInspectionStatus', row.status)
          } else {
            return getDictLabel('inspectionStatus', row.status)
          }
        }
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 交接计划单列表
const planTodoList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'submitPlanTodo',
    'auditPlanTodo',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
        label: '交接计划单',
        key: 'submitPlanTodo',
        prop: 'submitPlanTodo',
        width: '100',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '审核计划单',
        key: 'auditPlanTodo',
        prop: 'auditPlanTodo',
        width: '100',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// MBL列表
const mblList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'blNo',
    'blMode',
    'isDraftConfirm',
    'siStatus',
    'copySiCheck',
    'isAgreeRelease',
    'auditStatus',
    'blTakeStatus',
    'putStatus',
    'putRemark',
    'auditTime',
    // 'tcEmployeeName',
    'transferStatus',
    'receiveAddress',
    'placeCompName',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '提单号',
				key: 'blNo',
				prop: 'blNo',
				width: '150',
				disabled: false,
			},
      {
				label: '出单方式',
				key: 'blMode',
				prop: 'blMode',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('blMode', row.blMode)
				}
			},
      {
				label: '草单确认',
				key: 'isDraftConfirm',
				prop: 'isDraftConfirm',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          if (!row.followItem) return ''
					return row.isDraftConfirm === 'y' ? '已确认' : '未确认'
				}
			},
      {
				label: '补料状态',
				key: 'siStatus',
				prop: 'siStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          if (!row.followItem) return ''
					return row.blType === 'hbl' ? '--' : row.siStatus
				}
			},
      {
        label: 'COPY件确认',
        key: 'copySiCheck',
        prop: 'copySiCheck',
        disabled: false,
        width: '120',
        formatter: (row, column) => {
          if (!row.followItem) return ''
          return row.copySiCheck === 'y' ? '是' : '否'
        }
      },
      {
				label: '客户同意',
				key: 'isAgreeRelease',
				prop: 'isAgreeRelease',
				disabled: false,
				width: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
          if (!row.followItem) return ''
					return getDictLabel('isAgreeRelease', row.isAgreeRelease)
				}
			},
      {
        label: '财务同意', // 财务审核状态
        key: 'auditStatus',
        prop: 'auditStatus',
        width: '100',
        disabled: false,
        formatter: (row, column) => {
          if (!row.followItem) return ''
          return getDictLabel('blFinAuditStatus', row.auditStatus)
        }
      },
      {
        label: '取单状态', // 正本取单状态
        key: 'blTakeStatus',
        prop: 'blTakeStatus',
        disabled: false,
        width: '100',
        formatter: (row, column) => {
          if (!row.followItem) return ''
          return row.blTakeStatus === 'finish' ? '已取单' : '未取单'
        }
      },
      {
				label: '放单状态',
				key: 'putStatus',
				prop: 'putStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          if (!row.followItem) return ''
					let text = ''
					if (row.putStatus === 'finish') {
						text = '已放单'
					} else {
						text = '未放单'
					}
					return text
				}
			},
      {
        label: '放单备注',
        key: 'putRemark',
        prop: 'putRemark',
        disabled: false,
        popoverComponent: ColumnRemark,
        method: (row, val) => {
          handleClickRefreshList(row, val)
        },
        width: '120'
      },
      {
				label: '客户收件地址',
				key: 'receiveAddress',
				prop: 'receiveAddress',
				width: '150',
				disabled: false,
			},
      {
				label: '财务审核时间', 
				key: 'auditTime',
				prop: 'auditTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '提单所在地',
				key: 'placeCompName',
				prop: 'placeCompName',
				width: '150',
				disabled: false,
			},
      {
				label: '提单转移状态',
				key: 'transferStatus',
				prop: 'transferStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('blTransferStatus', row.transferStatus)
				}
			},
      // {
			// 	label: 'MBL取单人',
			// 	key: 'tcEmployeeName',
			// 	prop: 'tcEmployeeName',
			// 	width: '120',
			// 	disabled: false,
			// },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// HBL列表
const hblList = {
   // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'blNo',
    'blMode',
    'isDraftConfirm',
    'isAgreeRelease',
    'auditStatus',
    'blTakeStatus',
    'putStatus',
    'putRemark',
    'receiveAddress',
    'auditTime',
    // 'tcHblEmployeeName',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '提单号',
				key: 'blNo',
				prop: 'blNo',
				width: '150',
				disabled: false,
			},
      {
				label: '出单方式',
				key: 'blMode',
				prop: 'blMode',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('blMode', row.blMode)
				}
			},
      {
				label: '草单确认',
				key: 'isDraftConfirm',
				prop: 'isDraftConfirm',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          if (!row.followItem) return ''
					return row.isDraftConfirm === 'y' ? '已确认' : '未确认'
				}
			},
      {
				label: '客户同意',
				key: 'isAgreeRelease',
				prop: 'isAgreeRelease',
				disabled: false,
				width: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
          if (!row.followItem) return ''
					return getDictLabel('isAgreeRelease', row.isAgreeRelease)
				}
			},
      {
        label: '财务同意', // 财务审核状态
        key: 'auditStatus',
        prop: 'auditStatus',
        width: '120',
        disabled: false,
        formatter: (row, column) => {
          if (!row.followItem) return ''
          return getDictLabel('blFinAuditStatus', row.auditStatus)
        }
      },
      {
        label: '取单状态', // 正本取单状态
        key: 'blTakeStatus',
        prop: 'blTakeStatus',
        disabled: false,
        width: '100',
        formatter: (row, column) => {
          if (!row.followItem) return ''
          return row.blTakeStatus === 'finish' ? '已取单' : '未取单'
        }
      },
      {
				label: '放单状态',
				key: 'putStatus',
				prop: 'putStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
          if (!row.followItem) return ''
					let text = ''
					if (row.putStatus === 'finish') {
						text = '已放单'
					} else {
						text = '未放单'
					}
					return text
				}
			},
      {
        label: '放单备注',
        key: 'putRemark',
        prop: 'putRemark',
        disabled: false,
        popoverComponent: ColumnRemark,
        method: (row, val) => {
          handleClickRefreshList(row, val)
        },
        width: '100'
      },
      {
				label: '客户收件地址',
				key: 'receiveAddress',
				prop: 'receiveAddress',
				width: '150',
				disabled: false,
			},
      {
				label: '财务审核时间', 
				key: 'auditTime',
				prop: 'auditTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      // {
			// 	label: 'HBL取单人',
			// 	key: 'tcHblEmployeeName',
			// 	prop: 'tcHblEmployeeName',
			// 	width: '120',
			// 	disabled: false,
			// },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// sa列表
const saList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'sa',
    // 'saAgent',
    'saSupplier',
    'saCust',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
        label: '发SA给海外客服',
        key: 'sa',
        prop: 'sa',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      // {
      //   label: '发SA给海外代理',
      //   key: 'saAgent',
      //   prop: 'saAgent',
      //   width: '120',
      //   disabled: false,
      //   popoverComponent: ColumnCheckBox,
      //   method: (row, val) => {
      //     handleClickRefreshListAndColumn(row, val)
      //   },
      //   type: 'text',
      // },
      {
        label: '发SA给供应商',
        key: 'saSupplier',
        prop: 'saSupplier',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '发SA给客户',
        key: 'saCust',
        prop: 'saCust',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// FREETIME列表
const freetimeList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'fl_freetime',
    'ftReplyRemark',
    'ftReplyFiles',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
        label: 'FREETIME申请',
        key: 'fl_freetime',
        prop: 'fl_freetime',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '批复说明',
        key: 'ftReplyRemark',
        prop: 'ftReplyRemark',
        disabled: false,
        popoverComponent: ColumnRemark,
        method: (row, val) => {
          handleClickRefreshList(row, val)
        },
        width: '100'
      },
      {
        label: '批复附件',
        key: 'ftReplyFiles',
        prop: 'ftReplyFiles',
        disabled: false,
        popoverComponent: ColumnUpload,
        method: (row, val) => {
          handleClickRefreshList(row, val)
        },
        width: '100'
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 贸易单证列表
const docList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'docName',
    'retrieveStatus',
    'putStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '贸易单证类别',
				key: 'docName',
				prop: 'docName',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('tradeDocName', row.docName)
				}
			},
      {
        label: '取单状态', // 正本取单状态
        key: 'retrieveStatus',
        prop: 'retrieveStatus',
        disabled: false,
        width: '100',
        formatter: (row, column) => {
          return row.retrieveStatus === 'finish' ? '已取单' : '未取单'
        }
      },
      {
				label: '放单状态',
				key: 'putStatus',
				prop: 'putStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					let text = ''
					if (row.putStatus === 'finish') {
						text = '已放单'
					} else {
						text = '未放单'
					}
					return text
				}
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 保险列表
const insuranceList = {
  // 默认表头
  defaultColumns: [
    ...fristBaseDefaultColumns,
    'invoiceNo',
    'retrieveStatus',
    'putStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '发票号',
				key: 'invoiceNo',
				prop: 'invoiceNo',
				width: '120',
				disabled: false,
			},
      {
        label: '取单状态', // 正本取单状态
        key: 'retrieveStatus',
        prop: 'retrieveStatus',
        disabled: false,
        width: '100',
        formatter: (row, column) => {
          return row.retrieveStatus === 'finish' ? '已取单' : '未取单'
        }
      },
      {
				label: '放单状态',
				key: 'putStatus',
				prop: 'putStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					let text = ''
					if (row.putStatus === 'finish') {
						text = '已放单'
					} else {
						text = '未放单'
					}
					return text
				}
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 费用列表
const feeList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'costReview',
    'signReceiable',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
        label: '成本复核',
        key: 'costReview',
        prop: 'costReview',
        width: '100',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '签应收',
        key: 'signReceiable',
        prop: 'signReceiable',
        width: '100',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 账单列表
const billList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    // 'checkFactoryBill',
    'sendCustBill',
    'sendFactoryBill',
    'sendAgentBill',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList, handleClickRefreshListAndColumn) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      // {
      //   label: '对工厂账单',
      //   key: 'checkFactoryBill',
      //   prop: 'checkFactoryBill',
      //   width: '120',
      //   disabled: false,
      //   popoverComponent: ColumnCheckBox,
      //   method: (row, val) => {
      //     handleClickRefreshListAndColumn(row, val)
      //   },
      //   type: 'text',
      // },
      {
        label: '发客户账单',
        key: 'sendCustBill',
        prop: 'sendCustBill',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '发工厂账单',
        key: 'sendFactoryBill',
        prop: 'sendFactoryBill',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      {
        label: '发代理账单',
        key: 'sendAgentBill',
        prop: 'sendAgentBill',
        width: '120',
        disabled: false,
        popoverComponent: ColumnCheckBox,
        method: (row, val) => {
          handleClickRefreshListAndColumn(row, val)
        },
        type: 'text',
      },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 换单列表
const podChangeDocList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'blNo',
    'exchangeStatus',
    'exchangeCompleteTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
        label: '提单号',
        key: 'blNo',
        prop: 'blNo',
        disabled: false,
        width: '150'
      },
      {
				label: '是否已换单', // 换单状态
				key: 'exchangeStatus',
				prop: 'exchangeStatus',
				disabled: false,
				width: '100',
			},
      {
				label: '换单完成时间', 
				key: 'exchangeCompleteTime',
				prop: 'exchangeCompleteTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 清关列表
const podCommClearanceList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'customsClearanceStatus',
    'customsClearanceTime',
    'realCustomsClearanceTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '清关委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '是否已清关',  // 清关状态
				key: 'customsClearanceStatus',
				prop: 'customsClearanceStatus',
				width: '120',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('podCommClearanceStatus', row.customsClearanceStatus)
        }
			},
      {
				label: '预计清关时间',
				key: 'customsClearanceTime',
				prop: 'customsClearanceTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '实际清关时间',
				key: 'realCustomsClearanceTime',
				prop: 'realCustomsClearanceTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 目的港仓储列表
const podWarehouseList = {
   // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'inoutType',
    'status',
    'inPlanNo',
    'inBatchNo',
    'outPlanNo',
    'outBatchNo',
    'inPlanTime',
    'inRealTime',
    'outPlanTime',
    'outRealTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      { label: '进出仓类型', key: 'inoutType', prop: 'inoutType', disabled: false, width: '100', formatter: (row, column) => {
        if (row.inoutType === 'in') {
          return '进仓'
        } else if (row.inoutType === 'out') {
          return '出仓'
        } else {
          return ''
        }
      }},
      { label: '状态', key: 'status', prop: 'status', disabled: false, width: '80', formatter: (row, column) => {
        if (row.inoutType === 'in') {
          return row.inRealTime ?  '已进仓' : '未进仓'
        } else if (row.inoutType === 'out') {
          return row.outRealTime ?  '已出仓' : '未出仓'
        } else {
          return ''
        }
      }},
      {
				label: '进仓计划编号',
				key: 'inPlanNo',
				prop: 'inPlanNo',
				width: '120',
				disabled: false,
			},
      {
				label: '实际进仓编号',
				key: 'inBatchNo',
				prop: 'inBatchNo',
				width: '120',
				disabled: false,
			},
      {
				label: '出仓计划编号',
				key: 'outPlanNo',
				prop: 'outPlanNo',
				width: '120',
				disabled: false,
			},
      {
				label: '实际出仓编号',
				key: 'outBatchNo',
				prop: 'outBatchNo',
				width: '120',
				disabled: false,
			},
      { label: '预计进仓时间', key: 'inPlanTime', prop: 'inPlanTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '实际进仓时间', key: 'inRealTime', prop: 'inRealTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '预计出仓时间', key: 'outPlanTime', prop: 'outPlanTime', disabled: false, width: '120', sortable: 'custom' },
      { label: '实际出仓时间', key: 'outRealTime', prop: 'outRealTime', disabled: false, width: '120', sortable: 'custom' },
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 整柜派送列表
const deliveryList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'status',
    'preDeliveryTime',
    'deliveryTime',
    'signTime',
    'returnEmptyBoxTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '派送委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '是否已派送',  // 委托状态
				key: 'status',
				prop: 'status',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('podDeliveryFclStatus', row.status)
        }
			},
      {
				label: '预计派送时间',
				key: 'preDeliveryTime',
				prop: 'preDeliveryTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '实际派送时间',
				key: 'deliveryTime',
				prop: 'deliveryTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '签收时间',
				key: 'signTime',
				prop: 'signTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '还空柜时间',
				key: 'returnEmptyBoxTime',
				prop: 'returnEmptyBoxTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
// 散车派送列表
const deliveryLtlList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'intrustNo',
    'status',
    'preDeliveryTime',
    'deliveryTime',
    'signTime',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '派送委托号',
				key: 'intrustNo',
				prop: 'intrustNo',
				width: '120',
				disabled: false,
			},
      {
				label: '是否已派送',  // 委托状态
				key: 'status',
				prop: 'status',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('podDeliveryFclStatus', row.status)
        }
			},
      {
				label: '预计派送时间',
				key: 'preDeliveryTime',
				prop: 'preDeliveryTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '实际派送时间',
				key: 'deliveryTime',
				prop: 'deliveryTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      {
				label: '签收时间',
				key: 'signTime',
				prop: 'signTime',
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}

// 审核请款单
const approvePayApplyOrderList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'applyNo',
    'applyStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '付款申请单号',
				key: 'applyNo',
				prop: 'applyNo',
				width: '120',
				disabled: false,
			},
      {
				label: '付款申请状态',
				key: 'applyStatus',
				prop: 'applyStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('payApplySettleStatus', row.applyStatus)
        }
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}

// 应付发票登记
const payInvoiceRegisterList = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'applyNo',
    'payOrderNo',
    'applyStatus',
    'invoiceStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '付款申请单号',
				key: 'applyNo',
				prop: 'applyNo',
				width: '120',
				disabled: false,
			},
      {
				label: this.$t('Settle.payOrderNo'),
				key: 'payOrderNo',
				prop: 'payOrderNo',
				width: '120',
				disabled: false,
			},
      {
				label: '付款申请状态',
				key: 'applyStatus',
				prop: 'applyStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('payApplySettleStatus', row.applyStatus)
        }
			},
      {
				label: '开票状态',
				key: 'invoiceStatus',
				prop: 'invoiceStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('payRelaInvoiceStatus', row.invoiceStatus)
        }
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}

// 发送银行水单
const sendPayBankReceipt = {
  // 默认表头
	defaultColumns: [
    ...fristBaseDefaultColumns,
    'applyNo',
    'payOrderNo',
    'payStatus',
    'bankseqFileSendStatus',
    ...lastBaseDefaultColumns,
  ],
  specialColumns: {},
  columnsBase(handleClickRefreshList) {
    return [
      ...fristInitColumnsBase(handleClickRefreshList),
      {
				label: '付款申请单号',
				key: 'applyNo',
				prop: 'applyNo',
				width: '120',
				disabled: false,
			},
      {
				label: this.$t('Settle.payOrderNo'),
				key: 'payOrderNo',
				prop: 'payOrderNo',
				width: '120',
				disabled: false,
			},
      {
				label: '付款状态',
				key: 'payStatus',
				prop: 'payStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return getDictLabel('payStatusType', row.payStatus)
        }
			},
      {
				label: '水单状态',
				key: 'bankseqFileSendStatus',
				prop: 'bankseqFileSendStatus',
				width: '100',
				disabled: false,
        formatter: (row, column) => {
          return row.bankseqFileSendStatus === 'yes' ? '是' : row.bankseqFileSendStatus === 'no' ? '否': ''
        }
			},
      ...lastInitColumnsBase(handleClickRefreshList),
    ].map(item => {
			return { ...item, minWidth: item.width }
		})
  }
}
const state = {
  baseDefaultColumns: [...fristBaseDefaultColumns, ...lastBaseDefaultColumns],
  allList: {
    defaultColumns: allList.defaultColumns,
		specialColumns: allList.specialColumns,
    statusColumns: allList.statusColumns,
		columnsBase: allList.columnsBase
  },
  loaList: {
		defaultColumns: loaList.defaultColumns,
		specialColumns: loaList.specialColumns,
		columnsBase: loaList.columnsBase
	},
  releaseList: {
    defaultColumns: releaseList.defaultColumns,
		specialColumns: releaseList.specialColumns,
		columnsBase: releaseList.columnsBase
  },
  truckList: {
    defaultColumns: truckList.defaultColumns,
		specialColumns: truckList.specialColumns,
		columnsBase: truckList.columnsBase
  },
  polWarehouseList: {
    defaultColumns: polWarehouseList.defaultColumns,
		specialColumns: polWarehouseList.specialColumns,
		columnsBase: polWarehouseList.columnsBase
  },
  stuffingList: {
    defaultColumns: stuffingList.defaultColumns,
		specialColumns: stuffingList.specialColumns,
		columnsBase: stuffingList.columnsBase
  },
  polLtlList: {
    defaultColumns: polLtlList.defaultColumns,
		specialColumns: polLtlList.specialColumns,
		columnsBase: polLtlList.columnsBase
  },
  vgmList: {
    defaultColumns: vgmList.defaultColumns,
		specialColumns: vgmList.specialColumns,
		columnsBase: vgmList.columnsBase
  },
  polDeclarationList: {
    defaultColumns: polDeclarationList.defaultColumns,
		specialColumns: polDeclarationList.specialColumns,
		columnsBase: polDeclarationList.columnsBase
  },
  polInspectionList: {
    defaultColumns: polInspectionList.defaultColumns,
		specialColumns: polInspectionList.specialColumns,
		columnsBase: polInspectionList.columnsBase
  },
  fumeList: {
    defaultColumns: fumeList.defaultColumns,
		specialColumns: fumeList.specialColumns,
		columnsBase: fumeList.columnsBase
  },
  otherInspectList: {
    defaultColumns: otherInspectList.defaultColumns,
		specialColumns: otherInspectList.specialColumns,
		columnsBase: otherInspectList.columnsBase
  },
  planTodoList: {
    defaultColumns: planTodoList.defaultColumns,
		specialColumns: planTodoList.specialColumns,
		columnsBase: planTodoList.columnsBase
  },
  mblList: {
    defaultColumns: mblList.defaultColumns,
		specialColumns: mblList.specialColumns,
		columnsBase: mblList.columnsBase
  },
  hblList: {
    defaultColumns: hblList.defaultColumns,
		specialColumns: hblList.specialColumns,
		columnsBase: hblList.columnsBase
  },
  saList: {
    defaultColumns: saList.defaultColumns,
		specialColumns: saList.specialColumns,
		columnsBase: saList.columnsBase
  },
  freetimeList: {
    defaultColumns: freetimeList.defaultColumns,
		specialColumns: freetimeList.specialColumns,
		columnsBase: freetimeList.columnsBase
  },
  docList: {
    defaultColumns: docList.defaultColumns,
		specialColumns: docList.specialColumns,
		columnsBase: docList.columnsBase
  },
  insuranceList: {
    defaultColumns: insuranceList.defaultColumns,
		specialColumns: insuranceList.specialColumns,
		columnsBase: insuranceList.columnsBase
  },
  feeList: {
    defaultColumns: feeList.defaultColumns,
		specialColumns: feeList.specialColumns,
		columnsBase: feeList.columnsBase
  },
  billList: {
    defaultColumns: billList.defaultColumns,
		specialColumns: billList.specialColumns,
		columnsBase: billList.columnsBase
  },
  podChangeDocList: {
    defaultColumns: podChangeDocList.defaultColumns,
		specialColumns: podChangeDocList.specialColumns,
		columnsBase: podChangeDocList.columnsBase
  },
  podCommClearanceList: {
    defaultColumns: podCommClearanceList.defaultColumns,
		specialColumns: podCommClearanceList.specialColumns,
		columnsBase: podCommClearanceList.columnsBase
  },
  podWarehouseList: {
    defaultColumns: podWarehouseList.defaultColumns,
		specialColumns: podWarehouseList.specialColumns,
		columnsBase: podWarehouseList.columnsBase
  },
  deliveryList: {
    defaultColumns: deliveryList.defaultColumns,
		specialColumns: deliveryList.specialColumns,
		columnsBase: deliveryList.columnsBase
  },
  deliveryLtlList: {
    defaultColumns: deliveryLtlList.defaultColumns,
		specialColumns: deliveryLtlList.specialColumns,
		columnsBase: deliveryLtlList.columnsBase
  },
  approvePayApplyOrderList: {
    defaultColumns: approvePayApplyOrderList.defaultColumns,
		specialColumns: approvePayApplyOrderList.specialColumns,
		columnsBase: approvePayApplyOrderList.columnsBase
  },
  payInvoiceRegisterList: {
    defaultColumns: payInvoiceRegisterList.defaultColumns,
		specialColumns: payInvoiceRegisterList.specialColumns,
		columnsBase: payInvoiceRegisterList.columnsBase
  },
  sendPayBankReceipt: {
    defaultColumns: sendPayBankReceipt.defaultColumns,
		specialColumns: sendPayBankReceipt.specialColumns,
		columnsBase: sendPayBankReceipt.columnsBase
  },
  serviceCodeVal: '',
  subStatusTypeVal: '',
  templateDataObj: {
    columnList: [],
    columnWidthList: [],
  }
}

const getters = {}

const mutations = {
  setServiceCodeVal(state, payload) {
		state.serviceCodeVal = payload
	},
  setSubStatusTypeVal(state, payload) {
		state.subStatusTypeVal = payload
	},
  setTemplateData(state, payload) {
		state.templateDataObj.columnList = payload.columnList || []
    state.templateDataObj.columnWidthList = payload.columnWidthList || []
	},
}
const actions = {
  setServiceCodeVal(context, params) {
		context.commit('setServiceCodeVal', params)
	},
  setSubStatusTypeVal(context, params) {
		context.commit('setSubStatusTypeVal', params)
	},
  setTemplateData(context, params) {
		context.commit('setTemplateData', params)
	},
}
function mergeMethod(prop1, prop2) {
  if (prop1 && prop2) {
    return prop1 + '/' + prop2
  } else {
    return prop1 || prop2 || ''
  }
}

function getMapTipText(maptxt) {
  return (store.state.dict.dictMap[maptxt] || []).map((item, index) => {
    return `${index+1}、${item.label}`
  }).join('<br/>')
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}