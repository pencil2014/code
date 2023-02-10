import i18n from '@/lang'
const orderFeeRouter = [
	{
    path: '/finance/settlement/orderFee/:orderNo',
		name: 'OrderFee',
		component: () => import('@/views/finance/orderFee/orderFee'),
    meta: { title: i18n.t('Finance.orderDelFee'), keepAlive: true, isUseCache: true }, // 订单详情-费用
		hidden: true
  },
]

export default orderFeeRouter