
let orgid = sessionStorage.getItem('crmorgid_S')
let custid = sessionStorage.getItem('crmcustid_S')
let aqcPid = sessionStorage.getItem('crmaqcPid_S')
let detailCustid = sessionStorage.getItem('detailCustid_S')
// let isEdit = sessionStorage.getItem('detailIsEdit')
const state = {
  // ...customerListState,
  /******************************* 供应商 begin *******************************/
  orgid, // 客户未提交列表进入详情orgid，custid，基本信息&联系人信息
  custid,
  baseInfo: {},
  aqcPid,// 新建客户-搜索客户详情 爱企查pid(用于保存基本信息)
  searchCustomerDetail: null,// 新建客户-搜索客户详情(用于基本信息)
  verifierInfo: {},// 新建客户-维护人审核人信息(用于成功页面)
  detailCustid,// 客户列表详情页custid，基本信息
  detailBaseInfo: {},
  isEdit: false,//是否在编辑页内保存了修改
  detailEditInfo: {},
  verifyCheckBase: {},//客户部审核详情 基本信息对比
  verifyCheckCompany: {},//客户部审核详情 公司信息对比
  searchRefresh: false,
  /******************************* 供应商 end *******************************/
}

const mutations = {
  /***************************************** 供应商 begin *******************************/
  setOrgid(state, value) {
    state.orgid = value;
    sessionStorage.setItem('crmorgid_S', value)
  },
  setCustid(state, value) {
    state.custid = value;
    sessionStorage.setItem('crmcustid_S', value)
  },
  setAqcPid(state, value) {
    state.aqcPid = value;
    sessionStorage.setItem('crmaqcPid_S', value)
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
    sessionStorage.setItem('detailCustid_S', value)
    state.detailCustid = value;
  },
  setDetailBaseInfo(state, value) {
    state.detailBaseInfo = value;
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
  /******************************* 供应商 end *******************************/
}

const actions = {
  /******************************* 供应商 begin *******************************/
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
  /******************************* 供应商 end *******************************/
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
