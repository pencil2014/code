/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const planRouter = {
	path: '/plan',
	name: 'Plan',
	component: Layout,
	redirect: '/plan/planOrderList',
	meta: {
    title: '个人工作台',
		icon: 'el-icon-plan'
  },
	children: [
		{
			path: 'planOrderList',
			component: () => import('@/views/order/order/orderList/planorder/index'),
			name: 'PlanOrderList',
			hidden: true,
			meta: { 
				title: '个人工作台', 
				icon: 'el-icon-document', 
				keepAlive: true, 
				isMenu: true 
			}
		}
	]
}

export default planRouter
