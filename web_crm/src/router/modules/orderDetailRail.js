const orderDetailRouter = [

	{
		path: '/railway/order/orderFee/:orderNo',
		component: () => import('@/views/finance/orderFee/orderFee'),
		name: 'RailwayOrderFee',
		meta: { title: '订单详情-费用' },
		hidden: true
	},

	// {
	// 	path: '/railway/order/podFclDelivery/:orderNo',
	// 	component: () => import('@/views/railway/order/orderList/fclDelivery'),
	// 	name: 'RailPodFclDelivery',
	// 	meta: { title: '订单详情-目的港拖柜派送' },
	// 	hidden: true
	// },
	{
		path: '/railway/order/podWarehouseIng/:orderNo',
		component: () => import('@/views/railway/order/orderList/warehousing'),
		name: 'RailPodWarehouseIng',
		meta: { title: '订单详情-目的港仓储', },
		hidden: true
	},
]

export default orderDetailRouter
