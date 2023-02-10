const orderDetailRouter = [
	{
		path: '/railway/order/orderDetail/:orderNo',
		component: () => import('@/views/railway/order/orderList/detail'),
		name: 'RailwayOrderDetail',
		meta: {
			title: '订单详情'
		},
		hidden: true
	},
	{
		path: '/railway/order/blList/:orderNo',
		component: () => import('@/views/railway/order/orderList/blList'),
		name: 'RailwayBlList',
		meta: { title: '订单详情-提单' },
		hidden: true
	},

	{
		path: '/railway/order/fileList/:orderNo',
		component: () => import('@/views/railway/order/orderList/fileList'),
		name: 'RailwayFileList',
		meta: { title: '订单详情-附件' },
		hidden: true
	},
	{
		path: '/railway/order/orderFee/:orderNo',
		component: () => import('@/views/finance/orderFee/orderFee'),
		name: 'RailwayOrderFee',
		meta: { title: '订单详情-费用' },
		hidden: true
	},
	{
		path: '/railway/order/childOrderList/:orderNo',
		component: () => import('@/views/railway/order/orderList/fcl/childOrderList'),
		name: 'RailwayChildOrderList',
		meta: { title: '订单详情-关联订单' },
		hidden: true
	},
	{
		path: '/railway/order/mblPreview',
		component: () => import('@/views/railway/order/orderList/orderBook/components/mblPreview'),
		name: 'RailMblPreview',
		meta: { title: '订单详情-M单预览' },
		hidden: true
	},
	{
		path: '/railway/order/podCommClearance/:orderNo',
		component: () => import('@/views/railway/order/orderList/commissionedClearance'),
		name: 'RailPodCommClearance',
		meta: { title: '订单详情-目的港委托清关' },
		hidden: true
	},
	{
		path: '/railway/order/podFclDelivery/:orderNo',
		component: () => import('@/views/railway/order/orderList/fclDelivery'),
		name: 'RailPodFclDelivery',
		meta: { title: '订单详情-目的港拖柜派送' },
		hidden: true
	},
	{
		path: '/railway/order/podWarehouseIng/:orderNo',
		component: () => import('@/views/railway/order/orderList/warehousing'),
		name: 'RailPodWarehouseIng',
		meta: { title: '订单详情-目的港仓储', },
		hidden: true
	},
	{
		path: '/railway/order/podLtlDelivery/:orderNo',
		component: () => import('@/views/railway/order/orderList/warehousing/ltlDelivery/main.vue'),
		name: 'RailPodLtlDelivery',
		meta: { title: '订单详情-目的港散车派送', },
		hidden: true
	},
	{ 
		path: '/railway/order/fume/:orderNo',
		component: () => import('@/views/railway/order/orderList/fume'),
    name: 'RailFume',
		meta: { title: '订单详情-熏蒸', },
		hidden: true
	},
]

export default orderDetailRouter
