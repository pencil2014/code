/** When your routing table is too long, you can split it into small modules**/

import Layout from "@/layout";

const chargeRouter = {
  path: "/order",
  component: Layout, 
  redirect: "/order/order/",
  name: "SeaShipping",
  meta: {
    title: "海运",
    icon: "el-icon-sea-shipping"
  },
  children: [
    {
      path: "order",
      component: () => import("@/views/order/order/index"), // Parent router-view
      name: "Order",
      meta: { title: "订单" },
      alwaysShow: true,
      children: [
        {
          path: "orderList",
          component: () => import("@/views/order/order/orderList"),
          name: "OrderList",
          meta: { title: "订单列表", keepAlive: true, isMenu: true }
        },
      ]
    },
    {
      path: "book",
      component: () => import("@/views/order/order/bookShip"), // Parent router-view
      name: "Book",
      meta: { title: "订舱" },
      alwaysShow: true,
      children: [
      ]
    },
  ]
};

export default chargeRouter;
