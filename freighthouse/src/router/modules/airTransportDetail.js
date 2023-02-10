const orderDetailRouter = [
  {
    path: '/airTransportDetail',
    component: () => import('@/views/airTransport/order/orderList/detail'),
    name: 'AirOrderDetail',
    meta: {
      title: '订单详情',
    },
    hidden: true,
    children: [
      {
        path: '/airTransport/order/detail/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/orderDetail/index.vue'),
        name: 'AirTransportOrderDetail',
        meta: { title: '订单详情' },
        hidden: true
      },
      {
        path: '/airTransport/settlement/orderFee/:orderNo',
        name: 'AirOrderFee',
        component: () => import('@/views/finance/orderFee/orderFee'),
        meta: { title: '订单详情-费用', keepAlive: true, isUseCache: true },
        hidden: true
      },
      {
        path: '/airTransport/order/fileBook/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/fileBook'),
        name: 'AirFileBook',
        meta: { title: '订单详情-托书' },
        hidden: true
      },
      {
        path: '/airTransport/order/fileList/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/fileList'),
        name: 'AirFileList',
        meta: { title: '订单详情-附件' },
        hidden: true
      },
      {
        path: '/airTransport/order/orderBook/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/orderBook'),
        name: 'AirTransportOrderBook',
        meta: {
          title: '订单详情-订舱'
        },
        hidden: true
      },
      {
        path: '/airTransport/order/blList/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/blList'),
        name: 'AirTransportMblList',
        meta: { title: '订单详情-主单' },
        hidden: true
      },
      {
        path: '/airTransport/order/hblList/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/blList/hbl-index.vue'),
        name: 'AirTransportHblList',
        meta: { title: '订单详情-分单' },
        hidden: true
      },
      {
        path: '/airTransport/order/airPolLtl/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/polLtl/index'),
        name: 'AirPolLtl',
        meta: { title: '订单详情-提货', },
        hidden: true
      },
      {
        path: '/airTransport/order/airClearance/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/clearance'),
        name: 'AirClearance',
        meta: { title: '订单详情-报关' },
        hidden: true
      },
      {
        path: '/airTransport/order/airDocument/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/document'),
        name: 'AirDocument',
        meta: { title: '订单详情-贸易单证' },
        hidden: true
      },
      {
        path: '/airTransport/order/airChangeDocument/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/changeDocument'),
        name: 'AirChangeDocument',
        meta: { title: '订单详情-换单' },
        hidden: true
      },
      {
        path: '/airTransport/order/AirPodClearance/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/commissionedClearance'),
        name: 'AirPodClearance',
        meta: { title: '订单详情-清关', },
        hidden: true
      },
      {
        path: '/airTransport/order/podWarehouseIng/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/warehousing'),
        name: 'AirPodWarehouseIng',
        meta: { title: '订单详情-目的港仓储', },
        hidden: true
      },
      {
        path: '/airTransport/order/podLtlDelivery/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/warehousing/ltlDelivery/main.vue'),
        name: 'AirPodLtlDelivery',
        meta: { title: '订单详情-派送', },
        hidden: true
      },
      {
        path: '/airTransport/order/airInsurance/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/guarantee'),
        name: 'AirInsurance',
        meta: { title: '订单详情-保险' },
        hidden: true
      },
      {
        path: '/airTransport/order/goodsInfo/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/goodsInfo/main.vue'),
        name: 'GoodsInfo',
        meta: { title: '订单详情-货物信息' },
        hidden: true
      },
      {
        path: '/airTransport/order/relateOrder/:orderNo',
        component: () => import('@/views/airTransport/order/orderList/relateOrder'),
        name: 'AirRelateOrder',
        meta: { title: '订单详情-关联订单' },
        hidden: true
      },
    ]
  },
  {
    path: '/airTransport/order/hblPrint',
    component: () => import('@/views/airTransport/order/orderList/orderBook/components/hblPrint'),
    name: 'AirHblPrint',
    meta: { title: '订单详情-HBL打印' },
    hidden: true
  }
]

export default orderDetailRouter
