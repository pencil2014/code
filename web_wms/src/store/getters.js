const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  role: state => state.user.role,
  roles: state => state.user.roles,
  userId: state => state.user.userId,
  dictMap: state => state.dict.dictMap,
  dictMapObj: state => state.dict.dictMapObj,
  menuRoutes: state => state.permission.menuRoutes,
  allPageModuleAuth: state => state.permission.allPageModuleAuth,
  pagesForAuthHistory: state => state.permission.pagesForAuthHistory,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  userInfo: state => state.user.userInfo,
}
export default getters
