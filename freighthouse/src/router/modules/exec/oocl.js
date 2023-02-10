import Layout from "@/layout";
const ooclRouter = {
  path: "/oocl",
  component: Layout,
  name: "Oocl",
  meta: {
    title: "oocl",
    icon: "el-icon-online-rob-tank",
  },
  children: [
    {
      path: "oocl",
      component: () => import("@/views/exec/oocl/"), // Parent router-view
      name: "ExecOocl",
      meta: { title: "OOCL" },
      alwaysShow: true,
      children: [
        {
          path: "shippingLineSearch",
          component: () => import("@/views/exec/oocl/shippingLineSearch"),
          name: "OoclShippingLineSearch",
          meta: { title: "航线查询", isMenu: true },
        },
        {
          path: "orderSearch",
          component: () => import("@/views/exec/oocl/orderSearch"),
          name: "OoclOrderSearch",
          meta: { title: "订单查询", keepAlive: true, isMenu: true },
        },
        {
          path: "orderDetail",
          component: () => import("@/views/exec/oocl/orderDetail"),
          name: "OoclOrderDetail",
          meta: { title: "OOCL订单详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "bookDetail",
          component: () => import("@/views/exec/oocl/bookDetail"),
          name: "OoclBookDetail",
          meta: { title: "OOCL订舱详情" },
          hidden: true,
        },
      ],
    },
  ],
};
export default ooclRouter;
