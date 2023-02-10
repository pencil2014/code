
import Layout from '@/layout'

const ondutyRouter = {
	path: '/duty',
	component: Layout,
	name: 'Duty',
	redirect: '/duty/index',
	meta: { title: '值班表', icon: 'el-icon-duty-manager' },
	children: [
		{
			path: 'index',
			name: 'OndutyList',
			component: () => import('@/views/onDuty/index.vue'),
			meta: { title: '值班表', isMenu: true },
			hidden: true,
		},
	]
}

export default ondutyRouter
