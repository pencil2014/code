/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const companyResourceRouter = {
  path: '/companyResource',
  component: Layout,
  redirect: '/companyResource/department',
  name: 'CompanyResource',
  meta: {
    title: '公司管理',
    icon: 'el-icon-company-source'
  },
  children: [
        {
          path: 'department',
          component: () => import('@/views/companyResource/department/index'),
          name: 'Department',
          meta: { title: '部门列表', isMenu: true,  keepAlive: true, },
        },
        {
          path: 'branchCompany',
          component: () => import('@/views/companyResource/branchCompany/index'),
          name: 'BranchCompany',
          meta: { title: '分公司列表', isMenu: true,  keepAlive: true, },
        },
        {
          path: 'employeeTitle',
          component: () => import('@/views/companyResource/employeeTitle/index'),
          name: 'EmployeeTitle',
          meta: { title: '员工职务列表', isMenu: true,  keepAlive: true, },
        },
        {
          path: 'employee',
          component: () => import('@/views/companyResource/employee/index'),
          name: 'Employee',
          meta: { title: '员工列表', isMenu: true, keepAlive: true, },
        },
        {
          path: 'employeeDetail',
          component: () => import('@/views/companyResource/employee/detail'),
          name: 'EmployeeDetail',
          meta: { title: '员工详情', keepAlive: true, },hidden: true
        },
        {
          path: 'role',  
          component: () => import('@/views/permission/role'),
          name: 'Role',
          meta: { title: '角色列表', isMenu: true,  keepAlive: true, dialFullWidth: true },
        },
        {
          path: 'sysUser',
          component: () => import('@/views/companyResource/sysUser/index'),
          name: 'SysUser',
          meta: { title: '系统用户列表',  isMenu: true, keepAlive: true, dialFullWidth: true },
        },
        {
          path: 'jobAssign',
          component: () => import('@/views/permission/jobAssign/index'),
          name: 'JobAssign',
          meta: { title: '业务岗位配置', isMenu: true, keepAlive: true,}
        },
        {
          path: 'jointAssign',
          component: () => import('@/views/permission/jointAssign/index'),
          name: 'JointAssign',
          meta: { title: '协同参与配置', isMenu: true, keepAlive: true,}
        },
        {
          path: 'companyBankAcct',
          component: () => import('@/views/baseData/commonData/companyBankAcct'),
          name: 'CompanyBankAcct',
          meta: { title: '银行信息', isMenu: true, keepAlive: true, },
        },
        {
          path: 'contractTitle',
          component: () => import('@/views/companyResource/contract/title/index'),
          name: 'ContractTitle',
          meta: { title: '抬头列表', isMenu: true, keepAlive: true, },
        },
        // {
        //   path: 'contractTitleDetail',
        //   component: () => import('@/views/companyResource/contract/title/detail'),
        //   name: 'ContractTitleDetail',
        //   meta: { title: '抬头详情', isMenu: true, keepAlive: true, },
        // },
        {
          path: 'contract',
          component: () => import('@/views/companyResource/contract/index'),
          name: 'Contract',
          meta: { title: '合约号列表', isMenu: true, keepAlive: true, },
        },
        {
          path: "contractDetail",
          component: () => import("@/views/companyResource/contract/detail"),
          name: "ContractDetail",
          meta: {
            title: "合约号列表-详情",
            activeMenu: "/companyResource/contract",
            keepAlive: true,
            isUseCache: true
          },
          hidden: true
        },
        {
          path: 'approval',
          component: () => import('@/views/companyResource/contract/approval/index'),
          name: 'Approval',
          meta: { title: '审批人列表', isMenu: true, keepAlive: true, },
        },
        {
          path: 'staffDuty',
          component: () => import('@/views/permission/data/staffDuty/staffDuty'),
          name: 'StaffDuty',
          meta: { title: '员工代班列表', isMenu: true }
        },
    ]
}


export default companyResourceRouter
