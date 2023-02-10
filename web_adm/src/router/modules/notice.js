/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const noticeRouter = {
	path: '/notice',
	component: Layout,
	redirect: '/notice/',
	name: 'Notice',
	meta: {
		title: '消息管理',
		icon: 'el-icon-news'
	},
	alwaysShow: true,
	children: [
		{
			path: 'params',
			component: () => import('@/views/notice/params/index'),
			name: 'NoticeParams',
			meta: { title: '参数列表', isMenu: true }
		},
		{
			path: 'template',
			component: () => import('@/views/notice/template/index'),
			name: 'NoticeTemplate',
			meta: { title: '消息模板', isMenu: true }
		},
		{
			path: 'events',
			component: () => import('@/views/notice/events/index'),
			name: 'NoticeEvents',
			meta: { title: '事件配置', isMenu: true }
		},
		{
			path: 'trigger',
			component: () => import('@/views/notice/trigger/index'),
			name: 'NoticeTrigger',
			meta: { title: '事件触发', isMenu: true }
		},
		{
			path: 'delay',
			component: () => import('@/views/notice/delay/index'),
			name: 'NoticeDelay',
			meta: { title: '定时触发', isMenu: true }
		},
		{
			path: 'send',
			component: () => import('@/views/notice/send/index'),
			name: 'NoticeSend',
			meta: { title: '发送消息', isMenu: true }
		},
		{
			path: 'update',
			component: () => import('@/views/notice/update/index'),
			name: 'UpdateLogs',
			meta: { title: '更新日志', isMenu: true }
		}
	]
}
export default noticeRouter
