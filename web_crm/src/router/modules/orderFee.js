const orderFeeRouter = [
	{
    path: '/finance/settlement/orderFee/:orderNo',
		name: 'OrderFee',
		component: () => import('@/views/finance/orderFee/orderFee'),
    meta: { title: '订单详情-费用', keepAlive: true, isUseCache: true },
		hidden: true
  },
]

export default orderFeeRouter