import Layout from '@/layout'

const ondutyRouter = {
	path: '/duty',
	component: Layout,
	name: 'ManagementDuty',
	meta: {
		title: '值班',
		icon: 'el-icon-duty-manager'
	},
	children: [
		{
			path: 'management',
			component: () => import('@/views/onDuty/management.vue'),
			name: 'OndutyManagement',
			meta: { title: '值班管理', isMenu: true }
		},
		{
			path: 'index',
			component: () => import('@/views/onDuty/index.vue'),
			name: 'DutyList',
			meta: { title: '值班表', isMenu: true }
		}
	]
}
export default ondutyRouter