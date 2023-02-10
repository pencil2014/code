/** When your routing table is too long, you can split it into small modules**/

import Layout from "@/layout";

const chargeRouter = {
  path: "/crm",
  component: Layout,
  redirect: "/crm/merchantManagement/",
  name: "CRM",
  meta: {
    title: "CRM",
    icon: "el-icon-crm",
  },
  children: [
    {
      path: "customerManage",
      component: () => import("@/views/crm/merchantManagement/index"),
      name: "CustomerManage",
      meta: { title: "客户管理" },
      alwaysShow: true,
      children: [
        {
          path: "financeCustomerList",
          component: () =>
            import("@/views/crm/merchantManagement/financeCustomer/index"),
          name: "FinanceCustomerList",
          meta: { title: "财务客户列表", keepAlive: true, isMenu: true },
        },
        {
          path: "customerList",
          component: () =>
            import("@/views/crm/merchantManagement/customerManage/index"),
          name: "CustomerList",
          meta: { title: "客户列表", keepAlive: true, isMenu: true },
        },
        // {
        //   path: 'customerList',
        //   component: () => import('@/views/crm/merchantManagement/customerList'),
        //   name: 'CustomerList',
        //   meta: { title: '我的客户', keepAlive: true, isMenu: true },
        // },
        {
          path: "addCustomer",
          component: () => import("@/views/crm/merchantManagement/addCustomer"),
          name: "AddCustomer",
          meta: { title: "新建客户", keepAlive: true },
          hidden: true,
        },
        {
          path: "customerDetail",
          component: () =>
            import("@/views/crm/merchantManagement/customerList/detail"),
          name: "CustomerDetail",
          // meta: { title: '客户详情', },
          meta: { title: "客户详情", keepAlive: true },
          hidden: true,
          // meta: { title: '客户详情', },CustomerReviewDetail
        },
        {
          path: "finCustomerDetail",
          component: () =>
            import("@/views/crm/merchantManagement/customerReviewList/detailPass"),
          name: "FinCustomerDetail",
          // meta: { title: '客户详情', },
          meta: { title: "客户详情", keepAlive: true },
          hidden: true,
          // meta: { title: '客户详情', },CustomerReviewDetail
        },
        {
          path: "customerReviewList",
          component: () =>
            import("@/views/crm/merchantManagement/customerReviewList"),
          name: "CustomerReviewList",
          meta: { title: "客户审核列表", keepAlive: true, isMenu: true },
        },
        {
          path: "customerReviewDetail",
          component: () =>
            import("@/views/crm/merchantManagement/customerReviewList/detail"),
          name: "CustomerReviewDetail",
          meta: { title: "客户审核详情", keepAlive: true,},
          hidden: true,
        },
        {
          path: "customerRelationshipAudit",
          component: () =>
            import("@/views/crm/merchantManagement/customerReviewList/customerRelationshipAudit"),
          name: "customerRelationshipAudit",
          meta: { title: "客户关系审核详情", keepAlive: true,},
          hidden: true,
        },
        {
          path: "custLevelAppro",
          component: () =>
            import("@/views/crm/merchantManagement/customerReviewList/custLevelAppro"),
          name: "CustLevelAppro",
          meta: { title: "客户等级审核详情", keepAlive: true,},
          hidden: true,
        },
        {
          path: "customerReviewDetailPass",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/detailPass"
            ),
          name: "CustomerReviewDetailPass",
          meta: { title: "客户详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "customerReviewCheckBase",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/checkBase"
            ),
          name: "CustomerReviewCheckBase",
          meta: { title: "客户信息联网对比", keepAlive: true },
          hidden: true,
        },
        {
          path: "customerReviewCheckCompany",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/checkCompany"
            ),
          name: "CustomerReviewCheckCompany",
          meta: { title: "公司对比" },
          hidden: true,
        },
        // 取消页面
        // {
        //   path: 'customerDetailBaseEdit',
        //   component: () => import('@/views/crm/merchantManagement/customerList/detailTabs/baseEdit'),
        //   name: 'CustomerDetailBaseEdit',
        //   meta: { title: '客户资料修改', },
        //   hidden: true
        // },
        // {
        //   path: 'supplierList',
        //   component: () => import('@/views/crm/merchantManagement/supplierList'),
        //   name: 'SupplierList',
        //   meta: { title: '我的供应商', keepAlive: true, isMenu: true },
        //   // hidden: true
        // },
        // {
        //   path: 'addSupplier',
        //   component: () => import('@/views/crm/merchantManagement/addCustomer'),
        //   name: 'AddSupplier',
        //   meta: { title: '新建供应商', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierDetail',
        //   component: () => import('@/views/crm/merchantManagement/supplierList/detail'),
        //   name: 'SupplierDetail',
        //   meta: { title: '供应商详情', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierReviewList',
        //   component: () => import('@/views/crm/merchantManagement/supplierReviewList'),
        //   name: 'SupplierReviewList',
        //   meta: { title: '供应商审核列表', keepAlive: true, isMenu: true },
        // },
        // {
        //   path: 'supplierReviewDetail',
        //   component: () => import('@/views/crm/merchantManagement/supplierReviewList/detail'),
        //   name: 'SupplierReviewDetail',
        //   meta: { title: '供应商审核详情', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierReviewDetailPass',
        //   component: () => import('@/views/crm/merchantManagement/supplierReviewList/detailPass'),
        //   name: 'SupplierReviewDetailPass',
        //   meta: { title: '供应商审核通过详情', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierDetail2',
        //   component: () => import('@/views/crm/merchantManagement/supplierReviewList/detailPass'),
        //   name: 'SupplierDetail2',
        //   meta: { title: '供应商详情', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierReviewCheckBase',
        //   component: () => import('@/views/crm/merchantManagement/customerReviewList/checkBase'),
        //   name: 'SupplierReviewCheckBase',
        //   meta: { title: '供应商信息联网对比', keepAlive: true },
        //   hidden: true
        // },
        // {
        //   path: 'supplierDetailBaseEdit',
        //   component: () => import('@/views/crm/merchantManagement/customerList/detailTabs/baseEdit'),
        //   name: 'SupplierDetailBaseEdit',
        //   meta: { title: '供应商资料修改', },
        //   hidden: true
        // },
        // {
        //   path: 'potentialList',
        //   component: () => import('@/views/crm/merchantManagement/potentialList'),
        //   name: 'PotentialList',
        //   meta: { title: '客户列表', keepAlive: true, isMenu: true },
        // },
        // {
        //   path: 'supplierManage',
        //   component: () => import('@/views/crm/merchantManagement/supplierList/supplier'),
        //   name: 'SupplierManage',
        //   meta: { title: '供应商列表', keepAlive: true, isMenu: true },
        //   // hidden: true
        // },
        {
          path: "potentialDetail",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/detailPass"
            ),
          name: "PotentialDetail",
          meta: { title: "客户详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "bdRemoveLog",
          component: () => import("@/views/crm/merchantManagement/bdRemoveLog"),
          name: "BdRemoveLog",
          meta: { title: "客户回收记录", keepAlive: true, isMenu: true },
        },
        {
          path: "visitPlan",
          component: () => import("@/views/crm/merchantManagement/visitPlan"),
          name: "VisitPlan",
          meta: { title: "拜访管理", keepAlive: true, isMenu: true },
        },
        {
          path: "visitPlanCheck",
          component: () =>
            import("@/views/crm/merchantManagement/visitPlan/detail"),
          name: "VisitPlanCheck",
          meta: { title: "审核拜访计划" },
          hidden: true
        },
        {
          path: "visitPlanDetail",
          component: () =>
            import("@/views/crm/merchantManagement/visitPlan/detail"),
          name: "VisitPlanDetail",
          meta: { title: "拜访计划详情" },
          hidden: true
        },
        
        // {
        //   path: 'blackList',
        //   component: () => import('@/views/crm/merchantManagement/blackList'),
        //   name: 'BlackList',
        //   meta: { title: '黑名单', keepAlive: true, isMenu: true },
        // },
        // {
        //   path: 'blackListDetailCustomer',
        //   component: () => import('@/views/crm/merchantManagement/customerReviewList/detailPass'),
        //   name: 'BlackListDetailCustomer',
        //   meta: { title: '黑名单详情-客户', keepAlive: true },
        //   hidden: true,
        // },
        // {
        //   path: 'blackListDetailSupplier',
        //   component: () => import('@/views/crm/merchantManagement/supplierReviewList/detailPass'),
        //   name: 'BlackListDetailSupplier',
        //   meta: { title: '黑名单详情-供应商', keepAlive: true },
        //   hidden: true,
        // },
        {
          path: "recycleList",
          component: () => import("@/views/crm/merchantManagement/recycleList"),
          name: "RecycleList",
          meta: { title: "公海列表", keepAlive: true, isMenu: true },
        },
        {
          path: "recycleDetail",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/detailPass"
            ),
          name: "RecycleDetail",
          meta: { title: "公海详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "followLog",
          component: () => import("@/views/crm/merchantManagement/followLog"),
          name: "FollowLog",
          meta: { title: "跟进记录", keepAlive: true, isMenu: true },
        },
        {
          path: "followCustLog",
          component: () =>
            import("@/views/crm/merchantManagement/followLog/list"),
          name: "FollowCustLog",
          meta: { title: "跟进记录", keepAlive: true, isMenu: true },
        },
        {
          path: "followLogDetailCustomer",
          component: () =>
            import("@/views/crm/merchantManagement/customerList/detail"),
          name: "FollowLogDetailCustomer",
          meta: { title: "跟进详情-客户", keepAlive: true },
          hidden: true,
        },
        {
          path: "followLogDetailSupplier",
          component: () =>
            import("@/views/crm/merchantManagement/supplierList/detail"),
          name: "FollowLogDetailSupplier",
          meta: { title: "跟进详情-供应商", keepAlive: true },
          hidden: true,
        },
        {
          path: "annualPlanList",
          component: () => import("@/views/crm/merchantManagement/annualPlanList"),
          name: "AnnualPlanList",
          meta: { title: "年度计划列表", keepAlive: true, isMenu: true },
        },
        {
          path: "dimissionApply",
          component: () => import("@/views/crm/merchantManagement/dimission"),
          name: "DimissionApply",
          meta: { title: "离职申请", keepAlive: true, isMenu: true },
        },
        {
          path: "dimissionList",
          component: () => import("@/views/crm/merchantManagement/dimission/connect"),
          name: "DimissionList",
          meta: { title: "客户交接管理", keepAlive: true, isMenu: true },
        },
      ],
    },
    {
      path: "merchantManage",
      component: () => import("@/views/crm/merchantManagement/index"),
      name: "MerchantManage",
      meta: { title: "供应商管理" },
      alwaysShow: true,
      children: [
        {
          path: "supplierList",
          component: () =>
            import("@/views/crm/merchantManagement/supplierList"),
          name: "SupplierList",
          meta: { title: "供应商列表", keepAlive: true, isMenu: true },
        },
        // {
        //   path: 'supplierList',
        //   component: () => import('@/views/crm/merchantManagement/supplierList'),
        //   name: 'SupplierList',
        //   meta: { title: '我的供应商', keepAlive: true, isMenu: true },
        // },
        // {
        //   path: 'supplierManage',
        //   component: () => import('@/views/crm/merchantManagement/supplierList/supplier'),
        //   name: 'SupplierManage',
        //   meta: { title: '供应商列表', keepAlive: true, isMenu: true },
        // },
        {
          path: "supplierReviewList",
          component: () =>
            import("@/views/crm/merchantManagement/supplierReviewList"),
          name: "SupplierReviewList",
          meta: { title: "供应商审核列表", keepAlive: true, isMenu: true },
        },
        {
          path: "supplierBankReviewList",
          component: () =>
            import("@/views/crm/merchantManagement/supplierReviewList/bankReviewList"),
          name: "SupplierBankReviewList",
          meta: { title: "供应商银行账户审核", keepAlive: true, isMenu: true },
        },
        {
          path: "addSupplier",
          component: () => import("@/views/crm/merchantManagement/addCustomer"),
          name: "AddSupplier",
          meta: { title: "新建供应商", keepAlive: true },
          hidden: true,
        },
        {
          path: "supplierDetail",
          component: () =>
            import("@/views/crm/merchantManagement/supplierList/detail"),
          name: "SupplierDetail",
          meta: { title: "供应商详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "supplierReviewDetail",
          component: () =>
            import("@/views/crm/merchantManagement/supplierReviewList/detail"),
          name: "SupplierReviewDetail",
          meta: { title: "供应商审核详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "supplierReviewDetailPass",
          component: () =>
            import(
              "@/views/crm/merchantManagement/supplierReviewList/detailPass"
            ),
          name: "SupplierReviewDetailPass",
          meta: { title: "供应商审核通过详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "supplierDetail2",
          component: () =>
            import(
              "@/views/crm/merchantManagement/supplierReviewList/detailPass"
            ),
          name: "SupplierDetail2",
          meta: { title: "供应商详情", keepAlive: true },
          hidden: true,
        },
        {
          path: "supplierReviewCheckBase",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/checkBase"
            ),
          name: "SupplierReviewCheckBase",
          meta: { title: "供应商信息联网对比", keepAlive: true },
          hidden: true,
        },
        // {
        //   path: 'supplierDetailBaseEdit',
        //   component: () => import('@/views/crm/merchantManagement/customerList/detailTabs/baseEdit'),
        //   name: 'SupplierDetailBaseEdit',
        //   meta: { title: '供应商资料修改', },
        //   hidden: true
        // },
      ],
    },
    {
      path: "blackList",
      component: () => import("@/views/crm/merchantManagement/blackList"),
      name: "BlackList",
      meta: { title: "黑名单", keepAlive: true, isMenu: true },
      children: [
        {
          path: "blackListDetailCustomer",
          component: () =>
            import(
              "@/views/crm/merchantManagement/customerReviewList/detailPass"
            ),
          name: "BlackListDetailCustomer",
          meta: { title: "黑名单详情-客户", keepAlive: true },
          hidden: true,
        },
        {
          path: "blackListDetailSupplier",
          component: () =>
            import(
              "@/views/crm/merchantManagement/supplierReviewList/detailPass"
            ),
          name: "BlackListDetailSupplier",
          meta: { title: "黑名单详情-供应商", keepAlive: true },
          hidden: true,
        },
      ],
    },
    // {
    //   path: "contractList",
    //   component: () => import("@/views/crm/merchantManagement/contractList"),
    //   name: "ContractList",
    //   meta: { title: "合同管理", keepAlive: true },
    // },   
      {
        path: "shippingCarrierList",
        component: () => import("@/views/crm/merchantManagement/index"),
        name: "ShippingCarrierList",
        meta: { title: "船司管理列表" },
        alwaysShow: true,
        children: [
          {
            path: "shippingCarrierManage",
            component: () =>
              import("@/views/crm/merchantManagement/shippingCarrier"),
            name: "ShippingCarrierManage",
            meta: { title: "船司管理", keepAlive: true, isMenu: true },
          },
          {
            path: "shippingCarrierDetail",
            component: () =>
              import("@/views/crm/merchantManagement/shippingCarrier/detail"),
            name: "ShippingCarrierDetail",
            meta: { title: "船司详情", keepAlive: true },
            hidden: true,
          }, 
          {
            path: "shippingCarrierAnnualPlan",
            component: () =>
              import("@/views/crm/merchantManagement/shippingCarrier/annualPlan"),
            name: "ShippingCarrierAnnualPlan",
            meta: { title: "船司年度计划", keepAlive: true, isMenu: true },
          }, 
        ] 
      },
      {
        path: "contractManage",
        component: () => import("@/views/crm/merchantManagement/index"),
        name: "ContractManage",
        meta: { title: "合同管理" },
        alwaysShow: true,
        children: [
          {
            path: "contractList",
            component: () =>
              import("@/views/crm/merchantManagement/contractList/index"),
            name: "ContractList",
            meta: { title: "合同列表", keepAlive: true, isMenu: true },
          },
          {
            path: "contractDetail",
            component: () =>
              import("@/views/crm/merchantManagement/contractList/detail"),
            name: "contractDetail",
            meta: { title: "合同详情", keepAlive: true, isMenu: true },
          },
          {
            path: "contractVerifyList",
            component: () =>
              import("@/views/crm/merchantManagement/contractList/verifyList"),
            name: "ContractVerifyList",
            meta: { title: "合同审批列表", keepAlive: true, isMenu: true },
          }, 
          {
            path: "approveDetail",
            component: () =>
              import("@/views/crm/merchantManagement/contractList/detail"),
            name: "ApproveDetail",
            meta: { title: "合同审批详情", keepAlive: true, isMenu: true },
          },
        ] 
      },
  ],
};

export default chargeRouter;
