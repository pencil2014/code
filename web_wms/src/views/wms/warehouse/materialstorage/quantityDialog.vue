<template>
	<div>
		<el-dialog :before-close="handleCancel" v-loading="loading" :visible.sync="options.show" class="dialog" :title="options.title" :modal-append-to-body="false" width="1160px">
			<FinanceTable :option="tableOption" @getData="getData" />
			<div class="dialog-footer" slot="footer">
				<el-button @click="handleCancel" size="mini">关闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { inventoryQuantityData, damageQuantityData, custInventoryQuantityData } from '@/views/wms/warehouse/data/materialstorage.js'
import { mixin } from '@/views/finance/mixins/mixin'
import { purchaseHistoryList, damageHistoryList, queryInventoryHistoryList } from '@/api/wms/warehouse.js'

export default {
	components: {
		FinanceTable
	},
	props: {
		options: {
			type: Object,
			default: () => {}
		}
	},
	mixins: [mixin],
	data() {
		return {
			loading: false,
			tableOption: {} //表格参数
		}
	},
	created() {
		this.setTableOption()
		this.getData()
	},
	mounted() {},
	methods: {
		/**
		 * @description: 设置表格参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:14:47
		 */
		setTableOption() {
			// 整合列表配置参数
			this.tableOption = {
				...this.option,
				selection: {
					show: false
				},
				id: 'tableOption',
				operationBtns: {
					show: false
				},
        index: {
          show: true
        },
				columns: [],
				sortable: false,
				data: []
			}
			if (this.options.type === 'inventory') {
        let selfColumnsBase = inventoryQuantityData.map(item => {
          let target = { ...item }
          if (target.callback) {
            if (target.prop === 'inOutBoundNo') {
              target.callback = row => this.outboundDetail(row.outboundOrderId)
            }
          }
          return target
        })
				this.tableOption.columns = [...selfColumnsBase]
			} else if (this.options.type === 'custInventory') {
        this.tableOption.columns = [...custInventoryQuantityData]
      } else {
				this.tableOption.columns = [...damageQuantityData]
			}
		},
    // 出库明细
		outboundDetail(outboundOrderId) {
      let query = {
        type: 'detail',
        title: '出库信息详情',
        id: outboundOrderId,
        activeName: 'materialInfo'
      }
			this.$router.push({ path: '/wms/bound/outBoundDetail', query })
		},
  /**
   * @description: 获取列表数据
   * @return {*}
   * @author: yinjunying
   * @Date: 2022-09-20 10:09:30
   */
		getData() {
      let data = {}
      if (this.options.type === 'custInventory') {
        data = {
          inboundOrderIds: this.options.data.inboundOrderIds,
          consumableId: this.options.data.consumableId
        }
      } else {
        data = {
          wmsConsumableInventoryId: this.options.data.wmsConsumableInventoryId
        }
      }
			let method = ''
			if (this.options.type === 'inventory') {
        method = purchaseHistoryList
			} else if (this.options.type === 'custInventory') {
        method = queryInventoryHistoryList
      } else {
        method = damageHistoryList
			}
      method(data)
				.then(({ code, data }) => {
					if (code === 0) {
						this.tableOption.data = data || []
            if (this.options.type === 'custInventory') {
              this.tableOption.data = this.tableOption.data.map(item => {
                return {
                  ...item,
                  orderCustName: this.options.data.orderCustName
                }
              })
            }
					}
				})
				.finally(() => {
				})
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
}</style>
