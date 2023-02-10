
module.exports = {
	/**
	 * @type {boolean} true | false
	 * @description 是否启用菜单权限
	 */
	menuAuthEffect: true,

	/**
	 * @type {boolean} true | false
	 * @description 是否启用页面权限
	 */
	pageAuthEffect: true,

	/**
	 * @type {array}
	 * @description 启用页面权限的模块
	 */
  pageAuthEffectModules: ['Finance', 'CRM', 'BaseData','SeaShipping'],

	/**
	 * @type {array}
	 * @description 放在其他模块的页面
	 */
  pagesOutofModule: ['SeaCommerceList', 'SeaCommerceListAir', 'ConfirmBillDetail', 'SummaryBillDetail', 'HedgeDetail'],

	title: 'Longsail Management System',

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
