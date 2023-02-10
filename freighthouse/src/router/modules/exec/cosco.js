

/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const coscoRouter = {
  path: '/cosco',
  component: Layout,
  // redirect: '/cosco/', //循环重定向自己，控制台报调用栈溢出错误
  name: 'Cosco',
  meta: {
    title: 'cosco',
    icon: 'el-icon-online-rob-tank'
  },
  children: [
    {
      path: 'cosco',
      component: () => import('@/views/exec/cosco/'), // Parent router-view
      name: 'ExecCosco',
      meta: { title: 'COSCO' },
      alwaysShow: true,
      children: [
         {
            path: 'shippingLineSearch',
            component: () => import('@/views/exec/cosco/shippingLineSearch'),
            name: 'ShippingLineSearch',
            meta: { title: '航线查询', isMenu: true },
         },
         {
            path: 'orderSearch',
            component: () => import('@/views/exec/cosco/orderSearch'),
            name: 'OrderSearch',
            meta: { title: '订单查询', keepAlive: true, isMenu: true },
         },
         {
          path: 'orderDetail',
          component: () => import('@/views/exec/cosco/orderDetail'),
          name: 'CoscoOrderDetail',
          meta: { title: 'COSCO订单详情', keepAlive: true },
          hidden: true,
        },
        {
          path: 'bookDetail',
          component: () => import('@/views/exec/cosco/bookDetail'),
          name: 'CoscoBookDetail',
          meta: { title: 'COSCO订舱详情' },
          hidden: true,
        },
      ]
    },
    {
      path: 'coscoLong',
      component: () => import('@/views/exec/coscoLong/'), // Parent router-view
      name: 'ExecCoscoLong',
      meta: { title: 'COSCO' },
      alwaysShow: true,
      children: [
         {
            path: 'shippingLineSearch',
            component: () => import('@/views/exec/coscoLong/shippingLineSearch'),
            name: 'ShippingLineSearchLong',
            meta: { title: '航线查询', isMenu: true },
         },
         {
            path: 'orderSearch',
            component: () => import('@/views/exec/coscoLong/orderSearch'),
            name: 'OrderSearchLong',
            meta: { title: '订单查询', keepAlive: true, isMenu: true },
         },
         {
          path: 'orderDetail',
          component: () => import('@/views/exec/coscoLong/orderDetail'),
          name: 'CoscoOrderDetailLong',
          meta: { title: 'COSCO订单详情', keepAlive: true },
          hidden: true,
        },
        {
          path: 'bookDetail',
          component: () => import('@/views/exec/coscoLong/bookDetail'),
          name: 'CoscoBookDetailLong',
          meta: { title: 'COSCO下单' },
          hidden: true,
        },
        {
          path: 'orderBook',
          component: () => import('@/views/exec/coscoLong/orderBook'),
          name: 'CoscoOrderBookLong',
          meta: { title: 'COSCO订舱' },
          hidden: true,
        },
      ]
    },
    {
      path: 'coscoReefer',
      component: () => import('@/views/exec/reefer/'), // Parent router-view
      name: 'ExecCoscoReefer',
      meta: { title: 'COSCO' },
      alwaysShow: true,
      children: [
         {
            path: 'shippingLineSearch',
            component: () => import('@/views/exec/reefer/shippingLineSearch'),
            name: 'ShippingLineSearchReefer',
            meta: { title: '航线查询', isMenu: true },
         },
         {
            path: 'orderSearch',
            component: () => import('@/views/exec/reefer/orderSearch'),
            name: 'OrderSearchReefer',
            meta: { title: '订单查询', keepAlive: true, isMenu: true },
         },
         {
          path: 'orderDetail',
          component: () => import('@/views/exec/reefer/orderDetail'),
          name: 'CoscoOrderDetailReefer',
          meta: { title: 'COSCO订单详情', keepAlive: true },
          hidden: true,
        },
        {
          path: 'bookDetail',
          component: () => import('@/views/exec/reefer/bookDetail'),
          name: 'CoscoBookDetailReefer',
          meta: { title: 'COSCO订舱详情' },
          hidden: true,
        },
      ]
    },
    {
      path: 'bkgManage',
      component: () => import('@/views/exec/bkg/index'),
      name: 'BkgManage',
      meta: { title: '订舱管理', isMenu: true },
      alwaysShow: true,
      children: [
        {
          path: 'bookConfigure',
          component: () => import('@/views/exec/bkg/configure'),
          name: 'BookConfigure',
          meta: { title: '订舱配置' }
        },
        {
          path: 'coscoTask',
          component: () => import('@/views/exec/bkg/coscoTask'),
          name: 'CoscoTask',
          meta: { title: 'COSCO任务', isMenu: true }
        },
        {
          path: 'ooclTask',
          component: () => import('@/views/exec/bkg/ooclTask'),
          name: 'OoclTask',
          meta: { title: 'OOCL任务', isMenu: true }
        },
        {
          path: 'cmaTask',
          component: () => import('@/views/exec/bkg/cmaTask'),
          name: 'CmaTask',
          meta: { title: 'CMA任务', isMenu: true }
        },
        {
          path: 'oneTask',
          component: () => import('@/views/exec/bkg/oneTask'),
          name: 'OneTask',
          meta: { title: 'ONE任务', isMenu: true }
        },
        {
          path: 'msgNotice',
          component: () => import('@/views/exec/bkg/msgNotice'),
          name: 'MsgNotice',
          meta: { title: '消息通知', isMenu: true }
        },
      ]
    }
  ]
  // children: [
  //   {
  //     path: 'shippingLineSearch',
  //     component: () => import('@/views/exec/cosco/shippingLineSearch'),
  //     name: 'ShippingLineSearch',
  //     meta: { title: '航线查询' },
  //   },
  //   {
  //     path: 'orderSearch',
  //     component: () => import('@/views/exec/cosco/bookingSearch'),
  //     name: 'OrderSearch',
  //     meta: { title: '订单查询' },
  //   },
  // ]
}

export default coscoRouter
