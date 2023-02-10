module.exports = {
	/**
	 * @type {boolean} true | false
	 * @description 是否启用菜单权限
	 */
	menuAuthEffect: false,

	/**
	 * @type {boolean} true | false
	 * @description 是否启用页面权限
	 */
	pageAuthEffect: false,

	/**
	 * @type {array}
	 * @description 启用页面权限的模块
	 */
  pageAuthEffectModules: [],

	/**
	 * @type {array}
	 * @description 放在其他模块的页面
	 */
	pagesOutofModule: ['SeaCommerceList', 'ConfirmBillDetail', 'SummaryBillDetail', 'HedgeDetail'],

	title: '鼎帆仓储管理系统',

	/**
	 * @type {boolean} true | false
	 * @description Whether fix the header
	 */
	fixedHeader: false,

	/**
	 * @type {boolean} true | false
	 * @description Whether show the logo in sidebar
	 */
	sidebarLogo: true,
}
