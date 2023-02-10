// 报关订单

import Layout from "@/layout";

const customsDeclarationRouter = {
  path: "/customsDeclaration",
  component: Layout,
  redirect: "/customsDeclaration/order/",
  name: "CustomsDeclaration",
  meta: {
    title: "报关",
    icon: "el-icon-sea-shipping"
  },
  children: [
    {
      path: "order",
      component: () => import("@/views/customsDeclaration/order/index"), // Parent router-view
      name: "CustomsDeclarationOrder",
      meta: { title: "订单" },
      alwaysShow: true,
      children: [
        {
          path: "orderList",
          component: () => import("@/views/customsDeclaration/order/orderList"),
          name: "CustomsDeclarationOrderList",
          meta: { title: "订单列表", keepAlive: true, isMenu: true }
        }
      ]
    },
  ]
};

export default customsDeclarationRouter;
