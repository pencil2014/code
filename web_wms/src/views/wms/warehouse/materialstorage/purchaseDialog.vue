<template>
	<div>
		<el-dialog :before-close="handleCancel" v-loading="loading" :visible.sync="options.show" class="dialog" title="辅材采购" :modal-append-to-body="false" width="1160px">
			<el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini">
				<el-form-item label="仓库名称：" prop="wmsWarehouseId" :rules="blurRule">
					<el-select
						v-model="formData.wmsWarehouseId"
						value-key="wmsWarehouseId"
						size="mini"
						clearable
						remote
						filterable
						:remote-method="getWarehouseList"
						@visible-change="showWarehouseList"
						@change="changeWarehouse"
						:disabled="isDisabled"
						class="normalInput"
					>
						<el-option v-for="(item, index) in warehouseList" :key="item.value + `${index}`" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="仓库代码：" prop="warehouseCode" :rules="blurRule">
					<el-input v-model="formData.warehouseCode" class="normalInput" :disabled="isDisabled" maxlength="64"></el-input>
				</el-form-item>
				<el-card class="box-card mt10">
					<div slot="header" class="clearfix">
						<div class="left-title">
							<p class="panel-title">入库辅材信息</p>
						</div>
						<div class="right-title">
							<el-button size="mini" type="primary" @click="handleAdd">新增</el-button>
							<el-button v-if="isShow" type="text" @click="isShow = false"
								>收起
								<i class="el-icon-arrow-up el-icon--right"></i>
							</el-button>
							<el-button v-else type="text" @click="isShow = true"
								>展开
								<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
						</div>
					</div>
					<el-collapse-transition>
						<div v-show="isShow" class="card-table-list">
							<vxe-table border resizable show-overflow ref="xTable" size="mini" :data="formData.purchaseList"
                :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }"
                :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="rules">
								<vxe-column type="seq" width="80" title="序号"></vxe-column>
								<vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="150">
									<template #default="{ row }">
										{{ row.consumableName }}
									</template>
									<template #edit="{ row, rowIndex }">
										<el-select
											v-model="row.consumableId"
											value-key="consumableId"
											size="small"
											clearable
											remote
											filterable
											:remote-method="str => getConsumableList(str, rowIndex)"
											@visible-change="s => showConsumableList(s, rowIndex)"
											@change="v => changeConsumable(v, row, rowIndex)"
											:disabled="isDisabled"
										>
											<el-option v-for="item in consumableList" :key="item.value" :label="item.label" :value="item.value"></el-option>
										</el-select>
									</template>
								</vxe-column>
								<vxe-column field="consumableNo" title="辅材编号" min-width="150"> </vxe-column>
								<vxe-column field="specificationType" title="规格型号" min-width="150"> </vxe-column>
								<vxe-column field="unit" title="单位" min-width="150">
									<template #default="{ row }">
										{{ dictMapObj['wmsGoodsUnit'][row.unit] }}
									</template>
								</vxe-column>
								<vxe-column field="currency" title="币种" :edit-render="{}" min-width="150">
									<template #default="{ row }">
										{{ dictMapObj['wmsCurrency'][row.currency] }}
									</template>
									<template #edit="{ row }">
										<el-select size="small" v-model="row.currency">
											<template v-for="item in dictMap['wmsCurrency']">
												<el-option :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</template>
										</el-select>
									</template>
								</vxe-column>
								<vxe-column field="purchaseType" title="采购方式" :edit-render="{}" min-width="150">
									<template #default="{ row }">
										{{ dictMapObj['wmsPurchaseType'][row.purchaseType] }}
									</template>
									<template #edit="{ row }">
										<el-select size="small" v-model="row.purchaseType">
											<template v-for="item in dictMap['wmsPurchaseType']">
												<el-option :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</template>
										</el-select>
									</template>
								</vxe-column>
								<vxe-column field="supplierName" title="采购供应商" :edit-render="{}" min-width="150">
									<template #edit="{ row }">
										<vxe-input v-model="row.supplierName" :placeholder="row.purchaseType === 'ON_LINE' ? `网店地址`: `门店地址`" type="text"></vxe-input>
									</template>
								</vxe-column>
								<vxe-column field="unitPrice" title="采购单价" :edit-render="{}" min-width="150">
									<template #edit="{ row }">
										<vxe-input v-model="row.unitPrice" type="float"></vxe-input>
									</template>
								</vxe-column>
								<vxe-column field="inventoryQuantity" title="入库数量" :edit-render="{}" min-width="150">
									<template #edit="{ row }">
										<vxe-input v-model="row.inventoryQuantity" type="integer"></vxe-input>
									</template>
								</vxe-column>
								<vxe-column field="inventoryAlert" title="库存预警值" :edit-render="{}" min-width="150">
									<template #edit="{ row }">
										<vxe-input v-model="row.inventoryAlert" type="integer"></vxe-input>
									</template>
								</vxe-column>
								<vxe-column field="remark" title="备注" :edit-render="{}" min-width="150">
									<template #edit="{ row }">
										<vxe-input v-model="row.remark" type="text"></vxe-input>
									</template>
								</vxe-column>
								<vxe-column field="fileNo" type="html" title="图片" min-width="150">
									<template #default="{ row }">
										<template v-if="row.fileNo">
											<el-link type="primary" :underline="false" @click="showPic(row.fileNo)">查看</el-link>
										</template>
										<span v-else>--</span>
									</template>
								</vxe-column>
								<vxe-column title="操作" width="100" fixed="right">
									<template #default="{ row, rowIndex }">
										<template v-if="$refs.xTable.isActiveByRow(row)">
											<el-link type="primary" :underline="false" @click="saveRowEvent(row)">保存</el-link>
										</template>
										<template v-else>
											<el-link type="warning" :underline="false" @click="editRowEvent(row)">修改</el-link>
										</template>
										<el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex)">删除</el-link>
									</template>
								</vxe-column>
							</vxe-table>
						</div>
					</el-collapse-transition>
				</el-card>
			</el-form>
			<div class="dialog-footer" slot="footer">
				<el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button @click="handleCancel" size="mini">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMaterialMaintList, savePurchase } from '@/api/wms/warehouse.js'
import { queryWarehousePage } from '@/api/wms'
const blurRule = { required: true, message: '此项必填', trigger: 'blur' }
export default {
	props: {
		options: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			blurRule,
			loading: false,
			formData: {
				warehouseName: '',
				warehouseCode: '',
				wmsWarehouseId: '',
				purchaseList: []
			},
			consumableList: [],
			isDisabled: false,
			rules: {
				consumableId: [{ required: true, message: '辅材名称不能为空' }],
				currency: [{ required: true, message: '币种不能为空' }],
				unitPrice: [{ required: true, message: '采购单价不能为空' }],
				supplierName: [{ required: true, message: '采购供应商不能为空' }],
				purchaseType: [{ required: true, message: '采购方式不能为空' }],
				inventoryQuantity: [{ required: true, message: '入库数量不能为空' }]
			},
			isShow: true,
			warehouseList: []
		}
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	methods: {
		getWarehouseList(str = '') {
			let data = {
				currPage: 1,
				pageSize: 30,
				query: [
          {
            column: "employeeId",
            type: "eq",
            value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
          }
        ]
			}
			if (str) {
				data.query.push({
					column: 'consumableName',
					type: 'like',
					value: str
				})
			}
			queryWarehousePage(data)
				.then(({ code, data }) => {
					if (code === 0) {
						this.warehouseList = (data.list || []).map(item => {
							return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
						})
					}
				})
				.finally(() => {})
		},
		showWarehouseList(show) {
			show && this.getWarehouseList('')
		},
		changeWarehouse(val) {
			let find = this.warehouseList.find(item => item.value === val)
			this.formData.warehouseCode = find?.warehouseCode
			this.formData.warehouseName = find?.warehouseName
		},
		showPic(fileNo) {
			if (fileNo) {
				window.open(`/base/fileView/preview/${fileNo}/sowoll`)
			} else {
				this.$message.error('该图片信息缺失，不能查看！')
			}
		},
		/**
		 * @description: 编辑【入库单货物明细】行数据
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 17:31:18
		 */
		editRowEvent(row) {
			const $table = this.$refs.xTable
			$table.setActiveRow(row)
		},
		/**
		 * @description: 删除数据行
		 * @param {*} index 删除集合下标
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 11:24:02
		 */
		removeRowEvent(index) {
			this.formData.purchaseList.splice(index, 1)
		},
		/**
		 * @description: 前端保存【入库单货物明细】行数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 17:32:04
		 */
		async saveRowEvent() {
			const $table = this.$refs.xTable
			const errMap = await $table.validate(true).catch(errMap => errMap)
			if (errMap) {
				return false
			} else {
				$table.clearActived()
			}
		},
		/**
		 * @description: 获取辅材列表
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 15:23:05
		 */
		getConsumableList(str = '', index) {
			let data = {
				currPage: 1,
				pageSize: 30,
				query: []
			}
			if (str) {
				data.query.push({
					column: 'consumableName',
					type: 'like',
					value: str
				})
			}
			getMaterialMaintList(data)
				.then(({ code, data }) => {
					if (code === 0) {
						this.consumableList = (data.list || []).map(item => {
							return { ...item, label: item.consumableName, value: item.consumableId }
						})
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		showConsumableList(show, index) {
			show && this.getConsumableList('', index)
		},
		changeConsumable(val, row, index) {
			let find = this.consumableList.find(item => item.value === val)
			row.wharfYardCode = find?.wharfYardCode
			row.consumableNo = find?.consumableNo
			row.consumableName = find?.consumableName
			row.specificationType = find?.specificationType
			row.unit = find?.unit
			row.fileNo = find?.fileNo
			row.fileName = find?.fileName
      row.unitPrice = find?.unitPrice
			row.currency = ''
		},
		handleSubmit() {
			// 做数据校验
			this.$refs['form'].validate(valid => {
				if (valid) {
					if (!this.formData.purchaseList.length) {
						return this.$message.error('请填写入库辅材信息！')
					} else {
						this.validInfo()
					}
				}
			})
		},
		/**
		 * @description: xTable校验方式校验表格必填数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 16:06:19
		 */
		async validInfo() {
			const $xTable = this.$refs.xTable
			const errMap = await $xTable.validate(true).catch(errMap => errMap)
			if (errMap) {
				this.$message.error('入库辅材信息校验不通过!')
			} else {
				this.submitApi()
			}
		},
		/**
		 * @description: 调用保存接口
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 16:06:41
		 */
		submitApi() {
			let data = JSON.parse(JSON.stringify(this.formData))
			if (data.purchaseList && data.purchaseList.length) {
				data.purchaseList.forEach(item => {
					item.inventoryQuantity = Number(item.inventoryQuantity)
          if (['', null, undefined].includes(item.inventoryAlert)) {
            this.$delete(item, 'inventoryAlert')
          } else {
            item.inventoryAlert = Number(item.inventoryAlert)
          }
					item.unitPrice = Number(item.unitPrice)
					this.$delete(item, '_XID')
				})
			}
			if (data.purchaseList.some(item => item.unitPrice > 999999)) return this.$message.error('单价最大不能超过999999')
			if (data.purchaseList.some(item => item.inventoryQuantity > 999999)) return this.$message.error('入库数量最大不能超过999999')
			if (data.purchaseList.some(item => item.inventoryAlert > 999999)) return this.$message.error('预警值最大不能超过999999')
			if (data.purchaseList.some(item => item.unitPrice < 0)) return this.$message.error('单价不能小于0')
			if (data.purchaseList.some(item => item.inventoryQuantity < 0)) return this.$message.error('入库数量不能小于0')
			if (data.purchaseList.some(item => item.inventoryAlert < 0)) return this.$message.error('预警值不能小于0')
			savePurchase(data)
				.then(({ code }) => {
					if (code === 0) {
						this.$message.success('操作成功！')
						this.handleCancel()
						this.$emit('getData')
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 新增行数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 15:22:52
		 */
		handleAdd () {
			this.formData.purchaseList.push({
				inventoryQuantity: null,
				inventoryAlert: null,
				consumableId: null,
				consumableNo: '',
				consumableName: '',
				specificationType: '',
				unit: '',
				fileNo: '',
				fileName: '',
				currency: 'CNY',
				purchaseType: '',
				supplierName: '',
				unitPrice: null,
				remark: ''
			})
			// 设置新增行为当前编辑行
			this.editRowEvent(this.formData.purchaseList[this.formData.purchaseList.length - 1])
		},
		/**
		 * @description: 关闭弹框
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 17:13:44
		 */
		handleCancel() {
			this.options.show = false
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
/deep/ .el-dialog {
  margin: 5vh auto 0 !important;
  .el-dialog__body {
    height: 515px;
    padding: 10px;
    .normalInput {
      width: 210px;
    }
    .longInput {
      width: 560px;
    }
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-card__body {
      padding: 10px;
    }
  }
}
</style>
