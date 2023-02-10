import Layout from "@/layout"
const swCmsRouter = {
  path: '/swcms',
	component: Layout,
	redirect: '/swcms/swcustomer',
	name: 'SwCms',
	meta: {
		title: '对客平台',
		icon: 'el-icon-swcms'
	},
  alwaysShow: true,
  children: [
    {
      path: "swcustomer",
      component: () => import("@/views/swCms/customer/list/index"),
      name: "SwCustomer",
      meta: { title: "用户管理", isMenu: true, keepAlive: true, },
      children: []
    },
    {
      path: "swbusiness",
      component: () => import("@/views/swCms/business/index"),
      name: "SwBusiness",
      meta: { title: "运营管理",isMenu: true, keepAlive: true, },
      alwaysShow: true,
      children: [
        {
          path: 'special',
          component: () => import('@/views/swCms/business/list/index'),
          name: 'SwSpecial',
          meta: { title: '特价运营', isMenu: true, keepAlive: true, }
        },
        {
          path: 'advertise',
          component: () => import('@/views/swCms/business/advertise/index'),
          name: 'SwAdvertise',
          meta: { title: '广告位配置', isMenu: true, keepAlive: true, }
        },
        {
          path: 'content',
          component: () => import('@/views/swCms/business/content/index'),
          name: 'SwContent',
          meta: { title: '内容咨询', isMenu: true, keepAlive: true, }
        }
      ]
    },
    {
      path: "swcharge",
      component: () => import("@/views/swCms/charge/index"),
      name: "SwCharge",
      meta: { title: "运价维护",isMenu: true, keepAlive: true, },
      alwaysShow: true,
      children: [
        {
          path: 'list',
          component: () => import('@/views/swCms/charge/list/index'),
          name: 'SwChargeList',
          meta: { title: '运价管理', isMenu: true, keepAlive: true, }
        },
        {
          path: 'rule',
          component: () => import('@/views/swCms/charge/rule/index'),
          name: 'SwChargeRule',
          meta: { title: '加价规则', isMenu: true, keepAlive: true, }
        }
      ]
    },
    {
      path: "sworder",
      component: () => import("@/views/swCms/order/list/index"),
      name: "SwOrder",
      meta: { title: "订单管理",isMenu: true, keepAlive: true, },
    },
    {
      path: 'sworderinfo',
      component: () => import('@/views/swCms/order/list/info'),
      name: 'SwOrderInfo',
      meta: { title: '订单详情', activeMenu: "/swcms/sworder", },
      hidden: true
    },
    {
      path: 'contentInfo',
      component: () => import('@/views/swCms/business/content/detail'),
      name: 'contentInfo',
      meta: { title: '内容咨询详情', activeMenu: "/swcms/content", },
      hidden: true
    },
  ]
}
export default swCmsRouter
