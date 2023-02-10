const orderDetailRouter = [
	{
		path: '/order/order/orderBook/:orderNo',
		component: () => import('@/views/order/order/orderList/orderBook'),
		name: 'OrderBook',
		meta: { title: '订单详情-订舱', },
		hidden: true
	},
	{
		path: '/order/order/warehouse/:orderNo',
		component: () => import('@/views/order/order/orderList/warehouse'),
		name: 'Warehouse',
		meta: { title: '订单详情-起运港仓储/堆场装箱', },
		hidden: true
	},

// 	{
//     path: '/order/order/mblPreview',
//     // component: () => import('@/views/order/order/orderList/orderBo/ok/components/mblPreview'),
//     name: 'MblPreview',
//     meta: { title: '订单详情-M单预览' },
//     hidden: true
//   }
]

export default orderDetailRouter
