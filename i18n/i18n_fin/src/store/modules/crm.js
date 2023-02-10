
import supplier from './crmSupplier'
let orgid = sessionStorage.getItem('crmorgid')
let custid = sessionStorage.getItem('crmcustid')
let aqcPid = sessionStorage.getItem('crmaqcPid')
let detailCustid = sessionStorage.getItem('detailCustid')
// let isEdit = sessionStorage.getItem('detailIsEdit')
const state = {
  // ...customerListState,
  /******************************* 客户 begin *******************************/
  orgid, // 客户未提交列表进入详情orgid，custid，基本信息&联系人信息
  custid,
  baseInfo: {},
  aqcPid,// 新建客户-搜索客户详情 爱企查pid(用于保存基本信息)
  searchCustomerDetail: null,// 新建客户-搜索客户详情(用于基本信息)
  verifierInfo: {},// 新建客户-维护人审核人信息(用于成功页面)
  detailCustid,// 客户列表详情页custid，基本信息
  detailBaseInfo: {},
  allBaseInfo: {}, //客户所有基本信息
  allBaseInfoReview: {}, //客户审核所有信息
  isEdit: false,//是否在编辑页内保存了修改
  detailEditInfo: {},
  verifyCheckBase: {},//客户部审核详情 基本信息对比
  verifyCheckCompany: {},//客户部审核详情 公司信息对比
  searchRefresh: false,
  visitPlanOperType: "" //拜访计划操作类型 有新增，编辑，审核
  /******************************* 客户 end *******************************/
}

const mutations = {
  /***************************************** 客户 begin *******************************/
  setOrgid(state, value) {
    state.orgid = value;
    sessionStorage.setItem('crmorgid', value)
  },
  setCustid(state, value) {
    state.custid = value;
    sessionStorage.setItem('crmcustid', value)
  },
  setAqcPid(state, value) {
    state.aqcPid = value;
    sessionStorage.setItem('crmaqcPid', value)
  },
  setBaseInfo(state, value) {
    state.baseInfo = value;
  },
  setVerifierInfo(state, value) {
    state.verifierInfo = value;
  },
  setSearchCustomerDetail(state, value) {
    state.searchCustomerDetail = value;
  },
  setDetailCustid(state, value) {
    sessionStorage.setItem('detailCustid', value)
    state.detailCustid = value;
  },
  setDetailBaseInfo(state, value) {
    state.detailBaseInfo = value;
  },
  setAllBaseInfo(state, value) {
    state.allBaseInfo = value;
  },
  setAllBaseInfoReview(state, value) {
    state.allBaseInfoReview = value;
  },
  setsearchRefresh(state, value) {
    state.searchRefresh = value;
  },
  setDetailIsEdit(state, value) {
    state.isEdit = value;
  },
  setDetailEditInfo(state, value) {
    state.detailEditInfo = value;
  },
  setVerifyCheckBase(state, value) {
    state.verifyCheckBase = value;
  },
  setVerifyCheckCompany(state, value) {
    state.verifyCheckCompany = value;
  },
  setVisitPlanOperType(state, value) {
    state.visitPlanOperType = value
  }
  /******************************* 客户 end *******************************/
}

const actions = {
  /******************************* 客户 begin *******************************/
  setCustid(context) {
    context.commit('setCustid', '')
  },
  addCustomer(context) {
    context.commit('setOrgid', '')
    context.commit('setCustid', '')
    context.commit('setAqcPid', '')
    context.commit('setsearchRefresh', true)
    context.commit('setBaseInfo', null)
  },
  /******************************* 客户 end *******************************/
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  modules:{
    supplier
  }
}
