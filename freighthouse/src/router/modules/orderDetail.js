const orderDetailRouter = [
	{
    path: '/order/redirect',
		name: 'OrderRedirect',
		component: () => import('@/views/order/order/redirect/index'),
    hidden: true,
    meta: {title: '订单详情'},
	},
	{
    path: '/order/fileList/redirect',
		name: 'FileListRedirect',
		component: () => import('@/views/order/order/redirect/fileList'),
    hidden: true,
    meta: {title: '附件详情'},
	},
	{
    path: '/order/podService/redirect',
		name: 'PodServiceRedirect',
		component: () => import('@/views/order/order/redirect/podService'),
    hidden: true,
    meta: {title: '目的港服务项详情'},
  },
	{
    path: '/order/order/orderDetail/:orderNo',
		name: 'OrderDetail',
		component: () => import('@/views/order/order/orderList/detail'),
    hidden: true,
    meta: {title: '订单详情'},
  },
	{
		path: '/order/order/polLtl/:orderNo',
		component: () => import('@/views/order/order/orderList/polLtl/index'),
		name: 'PolLtl',
		meta: { title: '订单详情-散车' },
		hidden: true
	},
	{
		path: '/order/order/podLtl/:orderNo',
		component: () => import('@/views/order/order/orderList/podLtl/index'),
		name: 'PodLtl',
		meta: { title: '订单详情-目的港散车', },
		hidden: true
	},
	{
		path: '/order/order/fileBook/:orderNo',
		component: () => import('@/views/order/order/orderList/fileBook'),
		name: 'FileBook',
		meta: { title: '订单详情-托书', },
		hidden: true
	},
	{
		path: '/order/order/fileList/:orderNo',
		component: () => import('@/views/order/order/orderList/fileList'),
		name: 'FileList',
		meta: { title: '订单详情-附件', },
		hidden: true
	},
	{
		path: '/order/order/containerList/:orderNo',
		component: () => import('@/views/order/order/orderList/containerList'),
		name: 'ContainerList',
		meta: { title: '订单详情-集装箱', },
		hidden: true
	},
	{
		path: '/order/order/blList/:orderNo',
		component: () => import('@/views/order/order/orderList/blList'),
		name: 'BlList',
		meta: { title: '订单详情-提单', },
		hidden: true
	},
	{
		path: '/order/order/sowoll/blList',
		component: () => import('@/views/order/order/orderList/blList/sowoll/index'),
		name: 'SowollBlList',
		meta: { title: 'sowoll平台-提单', },
		hidden: true
	},
	{
		path: '/order/order/sowoll/custBlCopyPush',
		component: () => import('@/views/order/order/orderList/blList/sowoll/copyPushMsg/index'),
		name: 'CustBlCopyPush',
		meta: { title: '推送客户核对copy件', },
		hidden: true
	},
	{
		path: '/order/order/TrackList/:orderNo',
		component: () => import('@/views/order/order/orderList/trackList'),
		name: 'TrackList',
		meta: { title: '订单详情-航程跟踪', },
		hidden: true
	},
	{
		path: '/order/order/dropCabinet/:orderNo',
		component: () => import('@/views/order/order/orderList/dropCabinet'),
		name: 'DropCabinet',
		meta: { title: '订单详情-甩柜', },
		hidden: true
	},
	{
		path: '/order/order/score/:orderNo',
		component: () => import('@/views/order/order/orderList/score'),
		name: 'Score',
		meta: { title: '订单详情-评分&异常', },
		hidden: true
	},
	{
		path: '/order/order/orderBook/:orderNo',
		component: () => import('@/views/order/order/orderList/orderBook'),
		name: 'OrderBook',
		meta: { title: '订单详情-订舱', },
		hidden: true
	},
	{
		path: '/order/order/soCheck/:orderNo',
		component: () => import('@/views/order/order/orderList/orderBook/components/soCheck'),
		name: 'SoCheck',
		meta: { title: '订单详情-SO核对', },
		hidden: true
	},
	{
		path: '/order/order/shippingTruck/:orderNo',
		component: () => import('@/views/order/order/orderList/shippingTruck/index'),
		name: 'ShippingTruck',
		meta: { title: '订单详情-拖柜', },
		hidden: true
	},
	{
		path: '/order/order/shippingTruckDetail',
		component: () => import('@/views/order/order/orderList/shippingTruck/truckLoad'),
		name: 'ShippingTruckDetail',
		meta: { title: '订单详情-派车详情', },
		hidden: true
	},
	{
		path: '/order/order/clearance/:orderNo',
		component: () => import('@/views/order/order/orderList/clearance'),
		name: 'Clearance',
		meta: { title: '订单详情-起运港报关/报检', },
		hidden: true
	},
	{
		path: '/order/order/warehouse/:orderNo',
		component: () => import('@/views/order/order/orderList/warehouse'),
		name: 'Warehouse',
		meta: { title: '订单详情-起运港仓储/堆场装箱', },
		hidden: true
	},
	{
		path: '/order/order/yardBox/:orderNo',
		component: () => import('@/views/order/order/orderList/yardBox'),
		name: 'YardBox',
		meta: { title: '订单详情-堆场装箱', },
		hidden: true
	},
	// {
	// 	path: '/order/order/guarantee/:orderNo',
	// 	component: () => import('@/views/order/order/orderList/guarantee'),
	// 	name: 'Guarantee',
	// 	meta: { title: '订单详情-保函', },
	// 	hidden: true
	// },
	{
		path: '/order/order/document/:orderNo',
		component: () => import('@/views/order/order/orderList/document'),
		name: 'Document',
		meta: { title: '订单详情-贸易单证', },
		hidden: true
	},
	{
		path: '/order/order/inspectionAndDetection/:orderNo',
		component: () => import('@/views/order/order/orderList/inspectionAndDetection'),
		name: 'InspectionAndDetection',
		meta: { title: '订单详情-各类检验', },
		hidden: true
	},
	{ 
		path: '/order/order/fume/:orderNo',
		component: () => import('@/views/order/order/orderList/fume'),
    name: 'Fume',
		meta: { title: '订单详情-熏蒸', },
		hidden: true
	},
	{
		path: '/order/order/insurance/:orderNo',
		component: () => import('@/views/order/order/orderList/guarantee'),
		name: 'Insurance',
		meta: { title: '订单详情-保险', },
		hidden: true
	},
	{
		path: '/order/order/podChangeDoc/:orderNo',
		component: () => import('@/views/order/order/orderList/podService/changeDocument'),
		name: 'PodChangeDoc',
		meta: { title: '订单详情-目的港换单', },
		hidden: true
	},
	{
		path: '/order/order/podCommClearance/:orderNo',
		component: () => import('@/views/order/order/orderList/podService/commissionedClearance'),
		name: 'PodCommClearance',
		meta: { title: '订单详情-目的港委托清关', },
		hidden: true
	},
	{
		path: '/order/order/podFclDelivery/:orderNo',
		component: () => import('@/views/order/order/orderList/podService/fclDelivery'),
		name: 'PodFclDelivery',
		meta: { title: '订单详情-目的港拖柜派送', },
		hidden: true
	},
	{
		path: '/order/order/shippingFclDetail',
		component: () => import('@/views/order/order/orderList/podService/fclDelivery/components/truckLoad'),
		name: 'ShippingFclDetail',
		meta: { title: '订单详情-目的港拖柜派车详情', },
		hidden: true
	},
	{
		path: '/order/order/podWarehouseIng/:orderNo',
		component: () => import('@/views/order/order/orderList/podService/warehousing'),
		name: 'PodWarehouseIng',
		meta: { title: '订单详情-目的港仓储', },
		hidden: true
	},
	{
		path: '/order/order/podLtlDelivery/:orderNo',
		component: () => import('@/views/order/order/orderList/podService/warehousing/ltlDelivery/main.vue'),
		name: 'PodLtlDelivery',
		meta: { title: '订单详情-目的港散车派送', },
		hidden: true
	},
	// {
	// 	path: 'orderForm',
	// 	component: () => import('@/views/order/order/orderList/orderForm'),
	// 	name: 'orderForm',
	// 	meta: { title: '打印委托单' },
	// 	hidden: true
	// },
	// {
	// 	path: '/order/order/docPdf',
	// 	component: () => import('@/views/order/print/docPdf/index'),
	// 	name: 'DocPdf',
	// 	meta: { title: '订单详情-单证输出单' },
	// 	hidden: true
	// },
	{
		path: '/order/order/hblPrint',
		component: () => import('@/views/order/order/orderList/orderBook/components/hblPrint'),
		name: 'HblPrint',
		meta: { title: '订单详情-HBL打印' },
		hidden: true
	},
	{
		path: '/opPlanDetail/:orderNo',
		component: () => import('@/views/opPlan'),
		name: 'opPlanDetail',
		meta: { title: '货物跟踪' },
		hidden: true
	},
	{
		path: '/order/order/jointOrderDetail/:orderNo',
		component: () => import('@/views/order/order/orderList/detail'),
		name: 'JointOrderDetail',
		meta: { title: '订单详情' },
		hidden: true
	},
	{
		path: '/order/order/childOrderList/:orderNo',
		component: () => import('@/views/order/order/orderList/fcl/childOrderList'),
		name: 'ChildOrderList',
		meta: { title: '订单详情-关联订单', },
		hidden: true
	},
	{
		path: '/order/order/behalfRecordManifest/:orderNo',
		component: () => import('@/views/order/order/orderList/behalfRecordManifest/index'),
		name: 'BehalfRecordManifest',
		meta: { title: '订单详情-代录舱单', },
		hidden: true
	},
	{
		path: '/order/order/dischargeRelease/:orderNo',
		component: () => import('@/views/order/order/orderList/dischargeRelease/index'),
		name: 'DischargeRelease',
		meta: { title: '订单详情-排载', },
		hidden: true
	},
	{
		path: '/order/order/MakePackingList/:orderNo',
		component: () => import('@/views/order/order/orderList/makePackingList/index'),
		name: 'MakePackingList',
		meta: { title: '订单详情-打单/箱单', },
		hidden: true
	},
	{
		path: '/order/order/internalTradeBarge/:orderNo',
		component: () => import('@/views/order/order/orderList/internalTradeBarge/index'),
		name: 'InternalTradeBarge',
		meta: { title: '订单详情-内贸驳船', },
		hidden: true
	},
	{
		path: '/order/order/groundService/:orderNo',
		component: () => import('@/views/order/order/orderList/groundService/index'),
		name: 'GroundService',
		meta: { title: '订单详情-地面服务', },
		hidden: true
	},
	{
		path: '/order/order/lclOrderDetail/:orderNo',
		component: () => import('@/views/order/order/orderList/lcl/orderList/detail/index'),
		name: 'LclOrderDetail',
		meta: { title: '订单详情', },
		hidden: true
	},
	{
		path: '/order/order/lclWhBook/:orderNo',
		component: () => import('@/views/order/order/orderList/lcl/whBook/index'),
		name: 'LclWhBook',
		meta: { title: '订单详情-订仓', },
		hidden: true
	},
	{
		path: '/order/book/bookDetail',
		component: () => import('@/views/order/order/bookShip/detail'),
		name: 'BookDetail',
		meta: {title: '订舱详情'},
		hidden: true
	},
	{
		path: '/order/book/newOccupyDetail',
		component: () => import('@/views/order/order/bookShip/newOccupyDetail'),
		name: 'NewOccupyDetail',
		meta: {title: '占舱详情'},
		hidden: true
	},
	{
    path: '/order/order/planPrint',
    component: () => import('@/views/order/order/orderList/components/planPrint'),
    name: 'PlanPrint',
    meta: { title: '订单详情-输出计划单' },
    hidden: true
	},
	{
    path: '/order/order/mblPreview',
    component: () => import('@/views/order/order/orderList/orderBook/components/mblPreview'),
    name: 'MblPreview',
    meta: { title: '订单详情-M单预览' },
    hidden: true
  }
]

export default orderDetailRouter
