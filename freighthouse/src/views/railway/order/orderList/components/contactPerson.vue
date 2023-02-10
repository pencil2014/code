<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="form" :model="form" label-width="62px" size="mini" inline>
			<el-form-item label="列表信息">
				<el-input v-model="form.keywords" style="width:428px" placeholder="请输入需要搜索的关键词"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="contactList">查询</el-button>
			</el-form-item>
			<el-form-item style="float:right">
				<el-button type="primary" @click="handleAdd">新增</el-button>
			</el-form-item>
		</el-form>

		<el-table class="so-tableinfo" style="width: 100%;" :data="list" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
			<el-table-column label="选择" width="55">
				<template slot-scope="scope">
					<el-radio v-model="tableRadio" :label="scope.row" :disabled="scope.row.isNewData" @change="clickChange(scope.row)"><i></i></el-radio>
				</template>
			</el-table-column>
			<el-table-column prop="companyName" align="center" width="200px">
				<template slot="header">
					<span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
					<span>公司英文名称</span>
				</template>
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.companyName" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.companyName }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="contactAddress" align="center" width="200px">
				<template slot="header">
					<span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
					<span>联系人英文地址</span>
				</template>
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.contactAddress" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.contactAddress }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="contactName" label="联系人英文名字" align="center">
				<template slot="header">
					<span>联系人英文名字</span>
				</template>
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.contactName" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.contactName }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="contactPhone" label="联系人电话" align="center">
				<template slot="header">
					<span>联系人电话</span>
				</template>
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.contactPhone" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.contactPhone }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="contactFax" label="联系人传真" align="center">
				<template slot="header">
					<span>联系人传真</span>
				</template>
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.contactFax" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.contactFax }}</span>
				</template>
			</el-table-column>
			 <!-- 发货人才展示税号 -->
      <el-table-column v-if="showTaxCode"  prop="taxCode" label="税号" align="center">
        <template slot="header">
          <!-- <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span> -->
          <span>税号</span>
        </template>
        <template slot-scope="scope">
          <el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.taxCode" placeholder=""></el-input>
          <span v-else class="tabel-text">{{scope.row.taxCode}}</span>
        </template>
      </el-table-column>
			<el-table-column prop="remark" label="备注" align="center" width="160px">
				<template slot-scope="scope">
					<el-input v-if="scope.row.isNewData" type="textarea" v-model="scope.row.remark" placeholder=""></el-input>
					<span v-else class="tabel-text">{{ scope.row.remark }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="remark" label="操作" align="center" width="160px">
				<template slot-scope="scope">
					<el-button type="text" size="mini" v-if="!scope.row.isNewData" :disabled="scope.row.custid==0" @click="handleEdit(scope.$index)">编辑</el-button>
					<el-button type="text" size="mini" v-if="scope.row.isNewData" @click="handleSave(scope.row, scope.$index)">保存</el-button>
					<el-button type="text" size="mini" class="red" :disabled="scope.row.custid==0" @click="handleDel(scope.row.oid, scope.$index)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		<div class="table-footer">
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { contactList, contactSave, contactDelete } from '@/api/railway/list'
import Pagination from '@/components/Base/Table/pagination'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	data() {
		return {
			dialogConfig: {
				title: '选择发货人',
				show: true,
				size: 'medium',
				width: '1200px',
				showBtns: false
			},
			form: {
				keywords: ''
			},
			list: [],
			tableRadio: '',
			tableConfig: {
				pagination: {
					show: true,
					total: 0
				}
			},
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			csnType: ''
		}
	},
	props: {
		config: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	created() {
		this.dialogConfig.title = this.config.type + this.config.num
		this.contactList()
	},
	mounted() {},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		showTaxCode() {
      // crm上线时间与订单不一致，兼容一下
      return this.csnType === 'shipper' && this.list && this.list.length && this.list.some(item => !!item.taxCode)
    }
	},
	watch: {},
	components: {
		BaseDialog,
		Pagination,
		tableTooltip
	},
	methods: {
		handleDel(oid, index) {
			if (!oid) {
				this.list.splice(index, 1)
				return
			}
			contactDelete({ oid: oid }).then(res => {
				this.contactList()
				this.$message({
					message: '删除成功',
					type: 'success'
				})
			})
		},
		contactSave(data, index) {
			let custid = JSON.parse(sessionStorage.custStr).custid || 0
			let obj = {}
      if (this.showTaxCode) {
        obj = {
          taxCode: data.taxCode
        }
      }
			let params = {
				companyName: data.companyName,
				contactAddress: data.contactAddress,
				contactFax: data.contactFax,
				contactPhone: data.contactPhone,
				contactName: data.contactName,
				remark: data.remark,
				csnType: this.csnType,
				custid: custid,
				...obj
			}
			if (data.oid) {
				params.oid = data.oid
			}
			contactSave(params).then(res => {
				this.$message({
					message: '新增成功',
					type: 'success'
				})
				this.contactList()
			})
		},
		handleSave(item, index) {
			if (item.companyName && item.contactAddress) {
				this.contactSave(item, index)
			} else {
				this.$message.error('公司英文名称,联系人英文地址不能为空')
			}
		},
		handleEdit(index) {
			this.$set(this.list[index], 'isNewData', true)
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.contactList()
		},
		handleCurrentChange() {
			this.contactList()
		},
		clickChange(item) {
			this.tableRadio = item
			this.close('Confirm', item, this.config.type, this.config.num)
		},
		handleAdd() {
			for (let i = 0; i < this.list.length; i++) {
				if (this.list[i].isNewData) {
					this.$message.error('请先保存当前数据')
					return
				}
			}
			this.list.push({
				oid: '',
				companyName: '',
				contactAddress: '',
				contactFax: '',
				contactPhone: '',
				contactName: '',
				remark: '',
				isNewData: true
			})
		},
		contactList() {
			if (this.config.type === '发货人') {
				this.csnType = 'shipper'
			} else if (this.config.type === '代理人') {
				this.csnType = 'forwardAgent'
			} else if (this.config.type === '收货人') {
				this.csnType = 'consignee'
			} else if (this.config.type === '通知人') {
				this.csnType = 'notifier'
			}
			let custid = JSON.parse(sessionStorage.custStr).custid || 0
			let params = {
				currPage: this.tableQuery.currPage,
				pageSize: this.tableQuery.pageSize,
				custid: custid,
				csnType: this.csnType,
				keywords: this.form.keywords
			}
			contactList(params).then(res => {
				this.list = res.data.list
				this.tableConfig.pagination.total = res.data.totalCount
			})
		},
		close(action, value, type, num) {
			this.$emit('close', action, value, type, num)
		},

		validate() {
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createOrderForm.validate(valid => {
					if (valid) {
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.table-footer {
	margin-top: 10px;
	text-align: right;
}
.tabel-text {
	width: 100%;
	display: inline-block;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.is-disabled {
  color: #c0c4cc !important;
}
</style>
