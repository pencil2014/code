<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="dialog">
		<div class="address-add-row">
			<el-button size="mini" type="primary" class="ml10" @click="handleAdd">新增</el-button>
		</div>
		<div class="address-table">
			<el-table ref="addressTable" v-loading="loading" fit highlight-current-row style="width: 100%" :data="list" :max-height="tableHeight">
				<el-table-column label="选择" width="55">
					<template slot-scope="scope">
						<el-radio v-model="tableRadio" :label="scope.row" :disabled="scope.row.isNewData" @change="clickChange(scope.row)"><i></i></el-radio>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="收件人" align="center" width="120" show-overflow-tooltip>
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.name" placeholder="" maxlength="128"></el-input>
						<span class="tabel-text" v-else>{{scope.row.name}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="phone" label="收件人电话" align="center" width="150" show-overflow-tooltip>
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.phone" placeholder="" maxlength="128"></el-input>
						<span class="tabel-text" v-else>{{scope.row.phone}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="address" label="收件方地址" align="center" show-overflow-tooltip>
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.address" placeholder="" maxlength="512"></el-input>
						<span class="tabel-text" v-else>{{scope.row.address}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleSave(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit">保存</el-button>
							<el-button @click="handleEdit(scope.row)" type="text" size="mini" v-if="!scope.row.isEdit">编辑</el-button>
							<el-button class="red" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" v-if="!scope.row.isEdit || scope.row.isEdit && !scope.row.oid">删除</el-button>
							<el-button @click="handleCancel(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit && scope.row.oid">取消</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="table-footer">
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import Pagination from '@/components/Base/Table/newPagination'
import { getCustAddressList, custAddressSave, custAddressDelete } from '@/api/order/bl.js'

export default {
  data() {
    return {
			oQuery: this.$route.query,
			loading: false,
      list: [], // table渲染需要的数据
			resList: [], // 接口返回的列表数据
			tableHeight: null,
      // addList: [], // 新增的列表数据
      dialogConfig: {
        title: '地址模板',
        show: true,
        size: 'medium',
        width: "1120px",
        showBtns: false
      },
      tableRadio: '',
      tableConfig: {
         // 分页
				pagination: {
					pageSize: 10,
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
      },
      tableQuery: {
        currPage: 1,
        pageSize: 10
      }
    }
  },
  props: {
  },
  created() {
    this.getList()
  },
  mounted() {
		window.addEventListener('resize', this.getTableHeight)
    this.$nextTick(() => {
			this.getTableHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getTableHeight)
	},
  computed: {
    ...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj,
    }),
  },
  components: {
    BaseDialog,
    Pagination,
  },
  watch: {
  },
  methods: {
		getTableHeight() {
			console.log('dialog-height', document.body.clientHeight *0.8);
			let dialogCont = document.body.clientHeight *0.8
			this.tableHeight = dialogCont-30-34-48
		},
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleSizeChange() {
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    clickChange(item) {
      this.close('Confirm', item)
    },
		getList() {
			this.loading = true
			let params = {...this.tableQuery, custid: this.orderInfoDataObj.custid}
			getCustAddressList(params).then(res => {
				this.loading = false
				let { list, totalCount } = res.data
				this.list = list.map(item => {
					return Object.assign(item, {
						isEdit: false
					})
				})
				this.tableConfig.pagination.total = totalCount
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
				this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
			}).catch(err => {
				this.loading = false
			})
		},
		hasEditAddress() {
			let hasEdit = this.list.some(item => item.isEdit)
			if (hasEdit) {
				this.$message({ type: 'warning', message: '请先保存地址' })
			}
			return hasEdit
		},
		// 新增
		handleAdd() {
			if (this.hasEditAddress()) return
			this.list.unshift({
				isEdit: true,
				name: '',
				phone: '',
				address: '',
			})
		},
		// 编辑
		handleEdit(row) {
			if (this.hasEditAddress()) return
			row.isEdit = true
    },
		handleCancel(row) {
			row.isEdit = false
			this.getList()
		},
		// 新增保存
		handleSave(row, sIndex) {
      if (!this.validate(row)) return
			let data = {
				name: row.name,
				phone: row.phone,
				address: row.address,
				custid: this.orderInfoDataObj.custid,
			}
			let message = ''
			if (row.oid) {
				data['oid'] = row.oid
				message = '保存成功'
			} else {
				message = '新增成功'
			}
			custAddressSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message,
					})
					this.getList()
				})
				.catch(err => {
				})
		},
		// 删除
		handleDelete(row, sIndex) {
			if (!row.oid) {
				this.list.splice(sIndex, 1)
        return
			}
			if (this.hasEditAddress()) return
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid
					}
					custAddressDelete(data).then(res => {
						if (this.list.length === 1 && this.tableQuery.currPage !== 1) {
							this.tableQuery.currPage-=1
						}
						this.getList()
						this.$message({ message: '删除成功', type: 'success' })
					})
				})
				.catch(() => {})
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate(row) {
      if (!row.name) {
        this.$message.error('收件人不能为空')
        return false
      } else if (!row.phone) {
        this.$message.error('收件人电话不能为空')
        return false
      } else if (!row.address) {
        this.$message.error('收件方地址不能为空')
        return false
      } else {
         return true
      }
     
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
      } else {
        this.close('Cancel')
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.address-add-row{
	text-align: right;
	margin-bottom: 8px;
}
.table-footer {
	// position: fixed;
	// bottom: 0;
	// right: 0;
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
.address-table {
	/deep/ .el-input{
		font-size: 12px;
	}
}
</style>