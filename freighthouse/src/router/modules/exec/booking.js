import Layout from "@/layout";
const ooclRouter = {
  path: "/booking",
  component: Layout,
  name: "Booking",
  meta: {
    title: "booking",
    icon: "el-icon-online-rob-tank",
  },
  children: [
    {
      path: "maersk",
      component: () => import("@/views/exec/booking/maersk/"),
      name: "ExecMaersk",
      meta: { title: "Maersk" },
      alwaysShow: true,
      children: [
        {
          path: "shippingLineSearch",
          component: () => import("@/views/exec/booking/maersk/shippingLineSearch"),
          name: "MaerskShippingLineSearch",
          meta: { title: "航线查询", keepAlive: true, isMenu: true },
        },
        {
          path: "orderSearch",
          component: () => import("@/views/exec/booking/maersk/orderSearch"),
          name: "MaerskOrderSearch",
          meta: { title: "订单查询", keepAlive: true, isMenu: true },
        }
      ],
    },
    {
      path: "mcc",
      component: () => import("@/views/exec/booking/mcc/"), 
      name: "ExecMcc",
      meta: { title: "Mcc" },
      alwaysShow: true,
      children: [
        {
          path: "shippingLineSearch",
          component: () => import("@/views/exec/booking/mcc/shippingLineSearch"),
          name: "MccShippingLineSearch",
          meta: { title: "航线查询", keepAlive: true, isMenu: true },
        },
        {
          path: "orderSearch",
          component: () => import("@/views/exec/booking/mcc/orderSearch"),
          name: "MccOrderSearch",
          meta: { title: "订单查询", keepAlive: true, isMenu: true },
        }
      ],
    },
  ],
};
export default ooclRouter;
