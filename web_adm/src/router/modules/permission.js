/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const permissionRouter = {
  path: '/permission',
  component: Layout,
  redirect: '/permission/',
  name: 'Permission',
  meta: {
    title: '权限配置',
    icon: 'el-icon-permission'
  },
  children: [
    {
      path: 'function',
      component: () => import('@/views/permission/function'), // Parent router-view
      name: 'Function',
      meta: { title: '功能权限' },
      alwaysShow: true,
      children: [
        {
          path: 'menu',
          component: () => import('@/views/permission/function/menu'),
          name: 'Menu',
          meta: { title: '菜单列表', isMenu: true, keepAlive: true,isUseCache: true }
        },
        {
          path: 'resource',
          component: () => import('@/views/permission/function/resource'),
          name: 'Resource',
          meta: { title: '资源列表', isMenu: true, keepAlive: true,isUseCache: true}
        }
      ]
    },
    {
      path: 'data',
      component: () => import('@/views/permission/data/index'),
      name: 'DataSet',
      meta: { title: '数据权限' },
      alwaysShow: true,
      children: [
        {
          path: 'rule',
          component: () => import('@/views/permission/data/rule/index'),
          name: 'Rule',
          meta: { title: '规则列表', isMenu: true }
        },
        {
          path: 'params',
          component: () => import('@/views/permission/data/rule/params'),
          name: 'Params',
          meta: { title: '参数列表', isMenu: true }
        },
        {
          path: 'ruleGroup',
          component: () => import('@/views/permission/data/rule/group'),
          name: 'RuleGroup',
          meta: { title: '规则分组列表', isMenu: true }
        },
        {
          path: 'roleRule',
          component: () => import('@/views/permission/data/rule/roleRule'),
          name: 'RoleRule',
          meta: { title: '角色规则列表', isMenu: true }
        },
        {
          path: 'globalPrivilege',
          component: () => import('@/views/permission/data/globalPrivilege/index'),
          name: 'GlobalPrivilege',
          meta: { title: '全局权限列表', isMenu: true }
        },
        {
          path: 'shippingLine',
          component: () => import('@/views/permission/data/shippingLine/index'),
          name: 'ShippingLine',
          meta: { title: '航线分组列表', isMenu: true }
        }
        ,
        {
          path: 'shippingLineDept',
          component: () => import('@/views/permission/data/shippingLine/dept'),
          name: 'ShippingLineDept',
          meta: { title: '部门航线分配', isMenu: true }
        } ,
        // {
        //   path: 'shippingLine  Dept',
        //   component: () => import('@/views/permission/data/shippingLine/manager'),
        //   name: 'shippingLineDept',
        //   meta: { title: '航线维护人' }
        // }
        {
          path: 'lienGroupManager',
          component: () => import('@/views/permission/data/lienGroupManager/lienGroupManager'),
          name: 'LienGroupManager',
          meta: { title: '航线区域经理', isMenu: true }
        } ,
      ]
    }
  ]
}

export default permissionRouter
