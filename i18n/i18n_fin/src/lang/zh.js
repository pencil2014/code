import store from '@/store'

export default {
	route: {
		dashboard: '首页',
		documentation: '文档',
		guide: '引导页',
		permission: '权限测试页',
		rolePermission: '角色权限',
		pagePermission: '页面权限',
		directivePermission: '指令权限',
		icons: '图标',
		components: '组件',
		tinymce: '富文本编辑器',
		markdown: 'Markdown',
		jsonEditor: 'JSON 编辑器',
		dndList: '列表拖拽',
		splitPane: 'Splitpane',
		avatarUpload: '头像上传',
		dropzone: 'Dropzone',
		sticky: 'Sticky',
		countTo: 'Count To',
		componentMixin: '小组件',
		backToTop: '返回顶部',
		dragDialog: '拖拽 Dialog',
		dragSelect: '拖拽 Select',
		dragKanban: '可拖拽看板',
		charts: '图表',
		keyboardChart: '键盘图表',
		lineChart: '折线图',
		mixChart: '混合图表',
		example: '综合实例',
		nested: '路由嵌套',
		menu1: '菜单1',
		'menu1-1': '菜单 1-1',
		'menu1-2': '菜单 1-2',
		'menu1-2-1': '菜单 1-2-1',
		'menu1-2-2': '菜单 1-2-2',
		'menu1-3': '菜单 1-3',
		menu2: '菜单 2',
		Table: 'Table',
		dynamicTable: '动态 Table',
		dragTable: '拖拽 Table',
		inlineEditTable: 'Table 内编辑',
		complexTable: '综合 Table',
		tab: 'Tab',
		form: '表单',
		createArticle: '创建文章',
		editArticle: '编辑文章',
		articleList: '文章列表',
		errorPages: '错误页面',
		page401: '401',
		page404: '404',
		errorLog: '错误日志',
		excel: 'Excel',
		exportExcel: '导出 Excel',
		selectExcel: '导出 已选择项',
		mergeHeader: '导出 多级表头',
		uploadExcel: '上传 Excel',
		zip: 'Zip',
		pdf: 'PDF',
		exportZip: 'Export Zip',
		theme: '换肤',
		clipboardDemo: 'Clipboard',
		i18n: '国际化',
		externalLink: '外链',
		profile: '个人中心'
	},
	navbar: {
		dashboard: '首页',
		github: '项目地址',
		logOut: '退出登录',
		profile: '个人中心',
		theme: '换肤',
		size: '布局大小'
	},
	login: {
		title: '系统登录',
		logIn: '登录',
		username: '账号',
		password: '密码',
		any: '随便填',
		thirdparty: '第三方登录',
		thirdpartyTips: '本地不能模拟，请结合自己业务进行模拟！！！'
	},
	permission: {
		addRole: '新增角色',
		editPermission: '编辑权限',
		roles: '你的权限',
		switchRoles: '切换权限',
		tips: '在某些情况下，不适合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它动态渲染 dom 的场景。你只能通过手动设置 v-if 来实现。',
		delete: '删除',
		confirm: '确定',
		cancel: '取消'
	},
	tagsView: {
		refresh: '刷新',
		close: '关闭',
		closeOthers: '关闭其它',
		closeAll: '关闭所有'
	},
	settings: {
		title: '系统布局配置',
		theme: '主题色',
		tagsView: '开启 Tags-View',
		fixedHeader: '固定 Header',
		sidebarLogo: '侧边栏 Logo'
	},
	// 运价
	charge: {
		polCname: '大船起运港',
		podCname: '目的地',
		shipCarrier: '船司',
		add: '新建',
		export: '导出'
	},

	// 字典
	dict: {
		routeType: {
			main: '大船',
			feeder: '驳船'
		},
		state: {
			valid: '是',
			invalid: '否'
		},
		publishStatus: {
			unpublished: '未发布',
			published: '已发布',
			invalid: '已失效'
		},
		payMode: {
			freight_prepaid: '预付',
			freight_collect: '到付',
			all: '预付或到付'
		},
		rateUnit: {
			container_type: '箱型',
			unit: '箱',
			bill: '票'
		},
		currency: {
			CNY: 'CNY',
			USD: 'USD',
			HKD: 'HKD',
			EUR: 'EUR',
			GBP: 'GBP'
		},
		effectiveType: {
			sailing_day: '开船时间',
			entry_time: '进关时间',
			cutoff_time: '截关时间',
			return_time: '还重柜时间'
		},
		feederMatchMode: {
			auto: '自动匹配',
			must: '必须匹配',
			none: '不匹配'
		},

		issueWay: {
			original: '正本',
			telex_release: '电放',
			seaway_bill: '海运单',
			standby: '等待通知',
			standby_tr: '等通知电放',
			jthdlzb: '借同行代理, HBL正本',
			jthdldf: '借同行代理, HBL电放',
			thzb: '同行借我司代理,HBL正本',
			bill_at_destination: '目的港放单',
			tdcg: '提单草稿',
			ibl: '云提单',
			free_telex_release: '事前免电放'
		},
		blType: {
			mbl: 'MBL',
			hbl: 'HBL',
			master_or_house: 'MBL OR HBL'
		},
		transferMode: {
			international_transfer: '国转',
			internal_transfer: '内转'
		},
		weightLimitType: {
			net_weight: '纯货重',
			gross_weight: '连柜重'
		},
		extraContainerRateUnit: {
			per_container: '每箱',
			per_teu: 'TEU'
		},
		limitType: {
			heavy_fee: '重柜费',
			selection_fee: '选柜费'
		},
		mainRouteTransferMode: {
			not_sure: 'Not Sure',
			truck: 'Truck',
			rail: 'Rail',
			truck_rail: 'Truck & Rail'
		},
		allin: {
			allin: '是',
			not_allin: '否'
		},
		chargeStructure: {
			basic_price: '基价',
			transfer_price: '中转价',
			total_price: '合计'
		},
		recommendLevel: {
			Y: '是',
			N: '否'
		},
		resourceType: {
			page: '页面',
			menu: '菜单',
			module: '页面模块'
		},
		yesNo: {
			yes: '是',
			no: '否'
		},
		sysCode: {
			charge: '运价系统',
			order: '订单系统',
			fin: '财务系统',
			crm: '客商管理系统'
		},
		deptType: {
			// company:'公司',  //组织架构不需要公司选项
			branch_company: '分公司',
			department: '部门'
		},
		deptRole: {
			manager: '管理者',
			observer: '观察者',
			staff: '员工'
		},
		employeeStatus: {
			on: '在职',
			leave: '离职'
		},
		gender: {
			male: '男',
			female: '女'
		},
		jobAssignMode: {
			person: '指定到人',
			sys_line: '按航线',
			spe_rule: '按特殊规则'
		},
		receipayGroup: {
			receive: '应收',
			pay: '应付'
		},
		feeitemReceipayGroup: {
			receivepay: '应收应付',
			receive: '应收',
			pay: '应付'
		},
		feeUnit: {
			unit: '箱',
			bill: '票',
			count: '数量',
			m: '体积-立方米',
			rt: '重量-每吨'
		},
		exchangeRateType: {
			settle: '结算汇率',
			acct: '记账汇率'
		},
		portCategory: {
			port: '港口',
			wharf: '码头'
		},
		portAttribute: {
			port_of_feeder: '驳船收货地',
			port_of_basic: '基本港',
			port_of_discharge: '卸货港',
			port_of_destination: '目的地'
		},
		airPortAttribute: {
			port_of_basic: '起运港',
			port_of_destination: '目的地'
		},
		railPortAttribute: {
			port_of_basic: '起运站',
			port_of_destination: '目的站',
			port_of_feeder: '收货地'
		},
		iata: {
			TC1: 'TC1',
			TC2: 'TC2',
			TC3: 'TC3'
		},
		settleUnitType: {
			customer: '客户',
			supplier: '供应商',
			company: '分公司',
			temporary: '临时客商'
		},
		settleCycle: {
			ticket: '票结',
			monthly: '月结',
			weekly: '周结',
			two_month: '2月结',
			half_month: '半月结'
		},
		orderStatus: {
			draft: '草稿状态',
			submit: '已提交待审核',
			pass: '审核通过',
			refuse: '审核拒绝',
			complete: '完成',
			cancel: '取消',
			break: '终止'
		},
		cargoSource: {
			customer: '客户自订',
			fba: 'FBA',
			assign: '指定货',
			company: '公司货',
			delivery: '快递',
			peer: '同行货',
			self_pick: '自揽货'
		},
		businessType: {
			ship_export_fcl: '海运出口整箱'
		},
		transferFeeType: {
			inter_cut: '内扣',
			exter_cut: '外扣'
		},
		payWay: {
			telegraphic_transfers: '电汇',
			cash: '现金',
			check: '支票',
			prepay: '预充支付'
		},
		otherPayablesType: {
			refund_transfer_fee: '退款手续费',
			fin_profit_loss: '财务盈亏'
		},
		refundType: {
			overpayment: '溢缴款',
			mistake: '转错款'
		},
		witeoffType: {
			gedging_writeoff: '对冲核销',
			bad_debt_writeoff: '坏账核销',
			pay_writeoff: '付款核销',
			receive_writeoff: '收款核销'
		},
		witeoffSubType: {
			money_pay_writeoff: '结算付款核销',
			money_receive_writeoff: '结算收款核销',
			prepay_refund_writeoff: '预付退款核销',
			prepayment_deduction_writeoff: '预付抵账核销',
			prepay_refund_deduct_writeoff: '预付退款抵账',
			prereceive_refund_writeoff: '预收退款核销',
			prereceive_transfer_writeoff: '预收转移核销',
			prereceive_deduction_writeoff: '预收抵账核销'
		},
		confirmStatus: {
			pass: '审批通过',
			refuse: '审批拒绝',
			pending: '待审批'
		},
		lessPayDealway: {
			refund_transfer_fee: '退款手续费',
			fin_profit_loss: '财务盈亏'
		},
		writeoffStatus: {
			nofinish: '未核销',
			part_finish: '部分核销',
			finish: '已核销'
		},
		payStatus: {
			pay_done: '已支付',
			paying: '支付中',
			no_pay: '未支付'
		},
		finLockStatus: {
			lock: '锁定',
			unlock: '未锁定'
		},
		invoiceType: {
			special: '增值税专用发票',
			ordinary: '增值税普通发票',
			electronic: '增值税普通电子发票	'
		},
		inOutType: {
			in: '进账',
			out: '出账'
		},
		workType: {
			rest: '放假',
			work: '工作'
		},
		bkgTaskName: {
			price: '查询价格',
			book: '订舱'
		},
		bkgNoticeType: {
			email: '邮箱',
			ding: '钉钉'
		}
	}
}
