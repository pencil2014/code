import { baseEmployeeListName, companyPageList } from '@/api/base'
import FileColumn from '@/views/companyResource/contract/components/fileColumn.vue'

const state = {
	polPortList: ['深圳','上海','宁波','天津','青岛','厦门','南京','武汉','重庆','珠三角','长三角','华南','华中','华北','江苏','异国'],
	titleList: {
		defaultColumns: ['ename','cname','description','createdName','identNumber','contact','contactTel','contactPhone','contactEmail','webUrl','contactAddress','remark','fileList','titleStatus'],
		specialColumns: {},
		// 表头库
		columnsBase() {
			return [
				{ label: '英文名称', key: 'ename', prop: 'ename', width: '100' },
				{ label: '中文名称', key: 'cname', prop: 'cname', width: '100' },
				{ label: '抬头简介', key: 'description', prop: 'description', width: '200' },
				{ label: '抬头创建人', key: 'createdName', prop: 'createdName', width: '90' },
				{ label: '纳税人识别号', key: 'identNumber', prop: 'identNumber', width: '150' },
				{ label: '联系人', key: 'contact', prop: 'contact', width: '80' },
				{ label: 'TEL', key: 'contactTel', prop: 'contactTel', width: '120' },
				{ label: '手机', key: 'contactPhone', prop: 'contactPhone', width: '120' },
				{ label: '邮箱', key: 'contactEmail', prop: 'contactEmail', width: '120' },
				{ label: '网址', key: 'webUrl', prop: 'webUrl', width: '150' },
				{ label: '中英文地址', key: 'contactAddress', prop: 'contactAddress', width: '150' },
				{ label: '备注信息', key: 'remark', prop: 'remark', width: '200' },
				{ 
					label: '附件', 
					key: 'fileList', 
					prop: 'fileList', 
					width: '200', 
					type: 'text',
					disabled: false,
					popoverComponent: FileColumn
				},
				{ label: '状态', key: 'titleStatus', prop: 'titleStatus', width: '80',
					formatter: (row, column) => {
						return row.titleStatus === 'INVALID' ? '无效' : '有效'
					}
				}
			]
		},
	},
	contractList: {
		defaultColumns: ['ename','cname','description','titleCreatedName','applyEmployeeName','applyReason','createdTime','applyStatus','auditRemark','contractBegin','contractTypeNameStr','syslineNameStr','polPortNameStr','shipCarrierCode','createSyslineName','asLongsailingTitle'],
		specialColumns: {},
		// 表头库
		columnsBase() {
			return [
				{ label: '英文名称', key: 'ename', prop: 'ename', width: '100' },
				{ label: '中文名称', key: 'cname', prop: 'cname', width: '100' },
				{ label: '抬头简介', key: 'description', prop: 'description', width: '150' },
				{ label: '抬头创建人', key: 'titleCreatedName', prop: 'titleCreatedName', width: '100' },
				{ label: '申请人', key: 'applyEmployeeName', prop: 'applyEmployeeName', width: '100' },
				{ label: '申请理由', key: 'applyReason', prop: 'applyReason', width: '150' },
				{ label: '申请时间', key: 'createdTime', prop: 'createdTime', width: '140' },
				{ label: '状态', key: 'applyStatus', prop: 'applyStatus', width: '100',
					formatter: (row, column) => {
						let color = ''
						// 待审核
						if (row.applyStatus === 'SUBMIT') {
							color = 'yellow'
						}
						// 待维护
						if (row.applyStatus === 'PASS' && !row.contractNumber) {
							color = 'orange'
						}
						// 已维护
						if (row.applyStatus === 'PASS' && row.contractNumber) {
							color = 'green'
						}
						// 已拒绝
						if (row.applyStatus === 'REFUSE') {
							color = 'red'
						}
						return `<span class="${color}">${row.applyStatusCn || ''}</span>`
					}
				},
				{ label: '拒绝原因', key: 'auditRemark', prop: 'auditRemark', width: '150' },
				{ label: '合约有效期', key: 'contractBegin', prop: 'contractBegin', width: '160',
					formatter: (row, column) => {
						let result = row.contractBegin || row.contractEnd ? `${row.contractBegin} - ${row.contractEnd}` : ''
						return result
					}
				},
				{ label: '合约类型', key: 'contractTypeNameStr', prop: 'contractTypeNameStr', width: '100' },
				{ label: '合约覆盖航线', key: 'syslineNameStr', prop: 'syslineNameStr', width: '120' },
				{ label: '合约覆盖起运港', key: 'polPortNameStr', prop: 'polPortNameStr', width: '120' },
				{ label: '签约船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: '120' },
				{ label: '创建人所属航线', key: 'createSyslineName', prop: 'createSyslineName', width: '120' },
				{ label: '是否为长帆抬头操作', key: 'asLongsailingTitle', prop: 'asLongsailingTitle', width: '120', 
					formatter: (row, column) => {
						return row.asLongsailingTitle === 'Y' ? '是' : row.asLongsailingTitle === 'N' ? '否' : ''
					}
				}
			]
		},
	}
}

const mutations = {
}

const actions = {
  // 分公司
	getCompanyList({ commit }) {
		return new Promise((resolve, reject) => {
			let data = {
        query: [
          { column: 'companyName', type: 'like', value: '' },
          { column: 'state', type: 'eq', value: 'valid' }
        ],
        pageSize: 1000
      }
			companyPageList(data).then(res => {
				let {list} = res.data
				list = list.map(item => {
					return Object.assign({}, item, {
						label: item.name,
						value: item.companyCode
					})
				})
				resolve(list)
			})
			.catch(error => {
				reject(error)
			})
		})
	},
	getEmployeeList({ commit }) {
		return new Promise((resolve, reject) => {
			let data = {name: ''}
			baseEmployeeListName(data).then(res => {
				let {data} = res
				data = data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				resolve(data)
			}).catch(error => {
				reject(error)
			})
		})
	},
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
