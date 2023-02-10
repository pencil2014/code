<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="dialog">
		<div class="address-add-row">
			<el-button size="mini" type="primary" class="ml10" @click="handleAdd">新增</el-button>
		</div>
		<div class="address-table" style="min-height: 300px">
			<el-table ref="addressTable" v-loading="loading" fit highlight-current-row style="width: 100%" :data="list" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" :max-height="tableHeight">
				<el-table-column label="选择" width="55">
					<template slot-scope="scope">
						<el-radio v-model="tableRadio" :label="scope.row" :disabled="scope.row.isNewData" @change="clickChange(scope.row)"><i></i></el-radio>
					</template>
				</el-table-column>
				<el-table-column prop="contactName" label="联系人" align="center" width="80">
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.contactName" placeholder="" maxlength="32"></el-input>
						<span class="tabel-text" v-else>{{scope.row.contactName}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="contactPhone" label="联系人电话" align="center" width="120">
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.contactPhone" placeholder="" maxlength="32"></el-input>
						<span class="tabel-text" v-else>{{scope.row.contactPhone}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="cn" label="地址(到州)" align="center">
					<template slot-scope="scope">
						<el-cascader filterable style="width:100%" size="mini" :emitPath="true" v-model="scope.row.loadPlace" :options="loadPlaceData" :props="cityProps" clearable @change="(val) => handleRevChange(val, scope.row)" v-if="scope.row.isEdit" ></el-cascader>
						<span class="tabel-text" v-else>{{scope.row.addressCountry}}{{scope.row.addressProvince}}{{scope.row.addressCity}}{{scope.row.addressArea}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="addressDetail" label="详细地址" align="center">
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.addressDetail" placeholder="" maxlength="512"></el-input>
						<span class="tabel-text" v-else>{{scope.row.addressDetail}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="postCode" label="邮政编码" align="center" width="100">
					<template slot-scope="scope">
						<el-input v-if="scope.row.isEdit" type="input" v-model="scope.row.postCode" placeholder="" maxlength="32"></el-input>
						<span class="tabel-text" v-else>{{scope.row.postCode}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleSave(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit">保存</el-button>
							<el-button @click="handleEdit(scope.row)" type="text" size="mini" v-if="!scope.row.isEdit">编辑</el-button>
							<el-button @click="handleDelete(scope.row, scope.$index)" class="red" type="text" size="mini" v-if="!scope.row.isEdit || scope.row.isEdit && !scope.row.oid">删除</el-button>
							<el-button @click="handleCancel(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit && scope.row.oid">取消</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		<div class="table-footer">
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
// import Pagination from '@/components/Base/Table/pagination'
import Pagination from '@/components/Base/Table/newPagination'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import { getForeignAll } from '@/api/base'
import { orderAddressList, orderAddressAdd, orderAddressUpdate, orderAddressDel, orderAddressRegion } from '@/api/order/address'
import { truckLoadDelete } from '@/api/railway/shippingTruck'

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
        ascColumns: [],
	      descColumns: ['createdTime'],
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
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			loadPlace: [],
			loadPlaceData: [],
			saveDisabled: false
    }
  },
  props: {
  },
  created() {
		//获取省市区级联框数据
		this.getLoadPlaceData()
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
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
  },
  components: {
    BaseDialog,
    Pagination,
    tableTooltip
  },
  watch: {
  },
  methods: {
		getTableHeight() {
			console.log('dialog-height', document.body.clientHeight *0.8);
			let dialogCont = document.body.clientHeight *0.8
			this.tableHeight = dialogCont-30-34-48
		},
		//获取省市区数据
		async getLoadPlaceData() {
			let res = await getForeignAll({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		//装货地点省市区
		handleRevChange(val, row) {
			row.addressCountry = val[0] || ''
			row.addressProvince = val[1] || ''
			row.addressCity = val[2] || ''
			row.addressArea = val[3] || ''
			console.log('🚀 ~ val', val, row)
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
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    clickChange(item) {
			this.tableRadio = item
			if (item.addressCity || item.addressArea) {
				this.tableRadio.isChina = true
			} else {
				this.tableRadio.isChina = false
			}
      this.close('Confirm', item)
    },
		getList() {
			this.loading = truckLoadDelete
			let params = {...this.tableQuery}
			orderAddressList(params).then(res => {
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
				contactName: '',
				contactPhone: '',
				loadPlace: [],
				addressCountry: '',
				addressProvince: '',
				addressCity: '',
				addressArea: '',
				addressDetail: '',
				postCode: ''
			})
		},
		// 编辑
		handleEdit(row) {
			if (this.hasEditAddress()) return
			row.isEdit = true
			let arr = []
			arr.push(row.addressCountry)
			if (row.addressProvince) {
				arr.push(row.addressProvince)
			}
			if (row.addressCity) {
				arr.push(row.addressCity)
			}
			if (row.addressArea) {
				arr.push(row.addressArea)
			}
			row.loadPlace = arr
			// row.loadPlace = row.addressCity && row.addressArea ? [row.addressCountry, row.addressProvince, row.addressCity, row.addressArea] : [row.addressCountry, row.addressProvince]
		},
		handleCancel(row) {
			row.isEdit = false
			this.getList()
		},
		// 新增保存
		handleSave(row, sIndex) {
			if (this.saveDisabled) return
			this.saveDisabled = true
			let data = {
				oid: row.oid,
				contactName: row.contactName,
				contactPhone: row.contactPhone,
				addressCountry: row.addressCountry,
				addressProvince: row.addressProvince,
				addressCity: row.addressCity,
				addressArea: row.addressArea,
				addressDetail: row.addressDetail,
				postCode: row.postCode
			}
			let fun = row.oid ? orderAddressUpdate : orderAddressAdd
			fun(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功'
					})
					this.getList()
					this.saveDisabled = false
				})
				.catch(err => {
					this.saveDisabled = false
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
					orderAddressDel(data).then(res => {
						this.getList()
						this.$message({ message: '删除成功', type: 'success' })
					})
				})
				.catch(() => {})
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    validate() {
      return true
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