<template>
  <div>
    <el-dialog :before-close="handleCancel" :visible.sync="options.show" class="dialog" title="新增出库辅材使用信息" :modal-append-to-body='false'
      width="1160px">
      <el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini">
        <el-form-item label="仓库名称：">
          {{ formData.warehouseName }}
        </el-form-item>
        <el-form-item label="出库号：">
          {{ formData.inOutBoundNo }}
        </el-form-item>
        <el-form-item label="出库车牌：">
          {{ formData.licensePlate }}
        </el-form-item>
        <el-form-item label="客户名称：">
          {{ formData.orderCustName }}
        </el-form-item>
      </el-form>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div class="left-title">
            <span class="panel-title">仓库辅材</span>
            <span v-if="CNYTotal > 0 || USDTotal > 0" style="margin-left: 20px">费用合计：
              <span v-if="CNYTotal > 0">CNY {{ Number(CNYTotal).toFixed(2) }}</span>
              <span v-if="USDTotal > 0" style="margin-left: 10px">USD {{ Number(USDTotal).toFixed(2) }}</span>
            </span>
          </div>
          <div class="right-title">
            <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('wareMaterialList', 'warehouseTable')">新增</el-button>
            <el-button v-if="wareShow" type="text" @click="wareShow = false">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="wareShow = true">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="wareShow" class="card-table-list">
            <vxe-table border resizable show-overflow ref="warehouseTable" size="mini" :data="wareMaterialList"
              :edit-config="{trigger: 'manual', mode: 'row', autoClear: false}" :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="materialRules">
              <vxe-column type="seq" width="80" title="序号"></vxe-column>
              <vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="150">
                <template #default="{ row }">
                  {{ row.consumableName }}
                </template>
                <template #edit="{ row, rowIndex }">
                  <el-select v-model="row.consumableId" value-key="consumableId" size="small" clearable remote filterable
                    :remote-method="(str) => getConsumableList(str, rowIndex)" @visible-change="(s) => showConsumableList(s, rowIndex)"
                    @change="(v) => changeConsumable(v, row, rowIndex)">
                    <el-option v-for="item in consumableList" :key="item.value" :label="item.label"
                      :value="item.value"></el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="inventoryQuantity" title="库存数" min-width="130"></vxe-column>
              <vxe-column field="unit" title="单位" min-width="130">
                <template #default="{ row }">
                  {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                </template>
              </vxe-column>
              <vxe-column field="unitPrice" title="单价" min-width="130"></vxe-column>
              <vxe-column field="quantity" title="使用数量" :edit-render="{}" min-width="130">
                <template #edit="{ row }">
                  <vxe-input v-model="row.quantity" type="integer" min="0" @input="changeQuantity({row})"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="totalAmount" title="费用金额" min-width="130">
                <template #default="{ row }">
                  {{ Number(row.unitPrice * row.quantity).toFixed(2)}}
                </template>
              </vxe-column>
              <vxe-column v-if="!isDisabled" title="操作" width="100" fixed="right">
                <template #default="{ row, rowIndex }">
                  <template v-if="$refs.warehouseTable.isActiveByRow(row)">
                    <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'warehouseTable')">保存</el-link>
                  </template>
                  <template v-else>
                    <el-link type="warning" :underline="false" @click="editRowEvent(row, 'warehouseTable')">修改</el-link>
                  </template>
                  <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'wareMaterialList')">删除</el-link>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card mt10">
        <div slot="header" class="clearfix">
          <div class="left-title">
            <span class="panel-title">客户自带辅材</span>
          </div>
          <div class="right-title">
            <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('materialList', 'materialTable')">新增</el-button>
            <el-button v-if="selfShow" type="text" @click="selfShow = false">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="selfShow = true">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="selfShow" class="card-table-list">
            <vxe-table border resizable show-overflow ref="materialTable" size="mini" :data="materialList"
              :edit-config="{trigger: 'manual', mode: 'row', autoClear: false}" :valid-config="{ showMessage: false }"
               align="center" empty-text=" " :edit-rules="materialRules">
              <vxe-column type="seq" width="80" title="序号"></vxe-column>
              <vxe-column field="consumableId" title="辅材名称" :edit-render="{}" min-width="150">
                <template #default="{ row }">
                  {{ row.consumableName }}
                </template>
                <template #edit="{ row }">
                  <el-select v-model="row.consumableId" value-key="consumableId" size="small" clearable remote filterable
                    :remote-method="(str) => getCustSelfList(str)" @visible-change="(s) => showCustSelfList(s)"
                    @change="(v) => changeCustSelf(v, row)">
                    <el-option v-for="item in custSelfList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="consumableNo" title="辅材编号" min-width="150">
              </vxe-column>
              <vxe-column field="inventoryQuantity" title="库存数" min-width="130"></vxe-column>
              <vxe-column field="unit" title="单位" min-width="130">
                <template #default="{ row }">
                  {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                </template>
              </vxe-column>
              <vxe-column field="quantity" title="使用数量" :edit-render="{}" min-width="130">
                <template #edit="{ row }">
                  <vxe-input v-model="row.quantity" type="integer" min="0"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column v-if="!isDisabled" title="操作" width="100" fixed="right">
                <template #default="{ row, rowIndex }">
                  <template v-if="$refs.materialTable.isActiveByRow(row)">
                    <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'materialTable')">保存</el-link>
                  </template>
                  <template v-else>
                    <el-link type="warning" :underline="false" @click="editRowEvent(row, 'materialTable')">修改</el-link>
                  </template>
                  <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'materialList')">删除</el-link>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-collapse-transition>
      </el-card>
      <div class="dialog-footer" slot="footer">
        <el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleDelete" size="mini" type="danger">删除</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMaterialstorageList } from '@/api/wms/warehouse.js'
import { updateConsumable, outBoundConsumableQuery, queryCustSelf } from '@/api/wms/outBound.js'
export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      formData: {
        warehouseName: '',
        warehouseCode: '',
        wmsWarehouseId: '',
        inOutBoundNo: '',
        licensePlate: '',
        orderCustId: '',
        orderCustName: '',
        usageType: "OUTBOUND",
        consumableList: [],
        inboundOrderIds: ''
      },
      isDisabled: false,
      isShow: true,
      rules: {
        consumableId: [{ required: true, message: '辅材名称不能为空' }],
        quantity: [{ required: true, message: '使用数量不能为空' }]
      },
      consumableList: [],
      materialList: [],
      wareMaterialList: [],
      custSelfList: [],
      CNYTotal: null,
      USDTotal: null,
      wareShow: true,
      selfShow: true,
      materialRules: {
        consumableId: [{ required: true, message: '辅材名称不能为空' }],
        quantity: [{ required: true, message: '使用数量不能为空' }],
      },
    }
  },
  created () {
    if (this.options.data) {
      this.formData.warehouseName = this.options.data.warehouseName
      this.formData.warehouseCode = this.options.data.warehouseCode
      this.formData.wmsWarehouseId = this.options.data.wmsWarehouseId
      this.formData.inOutBoundNo = this.options.data.outboundNo
      this.formData.licensePlate = this.options.data.licensePlate
      this.formData.orderCustName = this.options.data.custName
      this.formData.orderCustId = this.options.data.custId
      this.formData.inboundOrderIds = this.options.data.inboundOrderIds
      this.getOutBoundConsumable()
    }
  },
  mounted () { },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    /**
     * @description: 计算总费用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 19:12:20
     */
    changeQuantity () {
      this.USDTotal = 0
      this.CNYTotal = 0
      this.wareMaterialList.forEach(item => {
        item.totalAmount = Number(item.unitPrice) * Number(item.quantity).toFixed(2)
        if (['usd', 'USD'].includes(item.currency)) {
          this.USDTotal += item.totalAmount
        }
        if (['cny', 'CNY'].includes(item.currency)) {
          this.CNYTotal += item.totalAmount
        }
      })
    },
    /**
     * @description: 获取耗材详情
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-07 18:21:15
     */
    getOutBoundConsumable () {
      let data = {
        outBoundNo: this.options.data.outboundNo
      }
      outBoundConsumableQuery(data).then(({ code, data }) => {
        if (code === 0) {
          // 回显辅材信息
          if (data && data.length) {
            this.materialList = data.filter(item => item.orderCustId)
            this.wareMaterialList = data.filter(item => !item.orderCustId)
            this.changeQuantity()
          }
        }
      })
        .finally(() => {

        })
    },
    /**
     * @description: 新增耗材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-07 18:21:08
     */
    handleAdd (list, table) {
      this[`${list}`].push({
        consumableId: null,
        consumableNo: '',
        consumableName: '',
        unit: '',
        unitPrice: '',
        quantity: '',
        inventoryQuantity: '',
        totalAmount: '',
        currency: '',
      })
      this.editRowEvent(this[`${list}`][this[`${list}`].length - 1], table)
      // this.formData.consumableList.push(
      //   {
      //     goodsName: '',
      //     consumableId: null,
      //     consumableNo: '',
      //     consumableName: '',
      //     unit: '',
      //     unitPrice: '',
      //     quantity: null,
      //     inventoryQuantity: null,
      //     totalAmount: null
      //   }
      // )
    },
    /**
     * @description: 编辑【入库单货物明细】行数据
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:18
     */
    editRowEvent (row, table) {
      const $table = this.$refs[table]
      $table.setActiveRow(row)
    },
    /**
     * @description: 前端保存【入库单货物明细】行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:32:04
     */
    async saveRowEvent (row, table) {
      let $table = this.$refs[table]
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return false
      } else {
        $table.clearActived()
      }
    },
    /**
     * @description: 移除【入库单货物明细】行数据
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:14:47
     */
    removeRowEvent (index, list) {
      this[`${list}`].splice(index, 1)
    },
    /**
     * @description: 查询客户自带辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 17:14:24
     */
    getCustSelfList (str = '') {
      let inboundOrderIds = []
      if (this.formData.inboundOrderIds) {
        if (this.formData.inboundOrderIds.includes(',')) {
          inboundOrderIds = this.formData.inboundOrderIds.split(',')
        } else {
          inboundOrderIds.push(this.formData.inboundOrderIds)
        }
        inboundOrderIds = inboundOrderIds.map(item => Number(item))
      } else {
        inboundOrderIds = []
      }
      // inboundOrderIds = this.formData.inboundOrderIds.split(',') || []
      // let inboundOrderIdList = [...new Set(inboundOrderIds)];
      let data = {
        // inboundOrderIdList,
        orderCustId: this.formData.orderCustId,
        consumableName: str,
        wmsWarehouseId: this.formData.wmsWarehouseId
      }
      queryCustSelf(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.custSelfList = (data || []).map(item => {
              return { ...item, label: item.consumableName, value: item.consumableId }
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showCustSelfList (show) {
      show && this.getCustSelfList('')
    },
    changeCustSelf (val, row) {
      let find = this.custSelfList.find(item => item.value === val)
      row.consumableNo = find?.consumableNo
      row.inventoryQuantity = find?.inventoryQuantity
      row.unit = find?.unit
      row.consumableName = find?.consumableName
      row.inboundOrderId = find?.inboundOrderId
    },
    /**
     * @description: 获取辅材列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-24 15:23:05
     */
    getConsumableList (str = '') {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "wmsWarehouseId",
            type: "eq",
            value: this.formData.wmsWarehouseId
          }
        ]
      }
      if (str) {
        data.query.push({
          column: "consumableName",
          type: "like",
          value: str
        })
      }
      getMaterialstorageList(data)
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
    showConsumableList (show, index) {
      show && this.getConsumableList('', index)
    },
    changeConsumable (val, row, index) {
      let find = this.consumableList.find(item => item.value === val)
      row.wharfYardCode = find?.wharfYardCode
      row.unitPrice = find?.unitPrice
      row.currency = find?.currency
      row.consumableName = find?.consumableName
      row.specificationType = find?.specificationType
      row.inventoryQuantity = find?.inventoryQuantity
      row.unit = find?.unit
    },
    /**
     * @description: 提交数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 14:59:25
     */
    handleSubmit () {
      if (!this.wareMaterialList.length && !this.materialList.length) {
        // return this.$message.error("仓库辅材和客户自带辅材至少填写一条！")
        this.submitApi()
      } else {
        if (this.wareMaterialList.length) {
          this.validWareMaterialInfo()
        } else {
          if (this.materialList.length) {
            this.validMaterialInfo()
          }
        }
      }
    },
    /**
     * @description: 校验仓库辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-09 14:57:28
     */
    async validWareMaterialInfo () {
      let $table = this.$refs.warehouseTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return this.$message.error('仓库辅材信息校验不通过！');
      } else {
        // 校验预出数必须大于等于实出数
        let validate = this.wareMaterialList.every(item => item.inventoryQuantity >= item.quantity)
        if (!validate) {
          this.$message.error(`仓库辅材的使用数量不能大于库存数！`)
        } else {
          let valZero = this.wareMaterialList.every(item => Number(item.quantity) !== 0)
          if (!valZero) {
            this.$message.error(`仓库辅材的使用数量不能为0！`)
          } else {
            if (this.materialList.length) {
              this.validMaterialInfo()
            } else {
              this.submitApi()
            }
          }
        }
      }
    },
    /**
     * @description: 校验客户自带辅材
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-09 14:57:09
     */
    async validMaterialInfo () {
      let $table = this.$refs.materialTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return this.$message.error('客户自带辅材信息校验不通过！');
      } else {
        let validate = this.materialList.every(item => item.inventoryQuantity >= item.quantity)
        if (!validate) {
          this.$message.error(`客户自带辅材的使用数量不能大于库存数！`)
        } else {
          let valZero = this.materialList.every(item => Number(item.quantity) !== 0)
          if (!valZero) {
            this.$message.error(`客户自带辅材的使用数量不能为0！`)
          } else {
            this.submitApi()
          }
        }
      }
    },
    /**
     * @description: 调用提交耗材使用接口
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 15:09:10
     */
    submitApi (type) {
      let data = JSON.parse(JSON.stringify(this.formData))
      let baseData = {
        warehouseName: this.formData.warehouseName,
        wmsWarehouseId: this.formData.wmsWarehouseId,
        warehouseCode: this.formData.warehouseCode,
        inOutBoundNo: this.formData.inOutBoundNo
      }
      data.consumableOutboundList = []
      data.outboundNo = this.options.data.outboundNo
      // 客户自带辅材
      if (this.materialList.length) {
        data.consumableOutboundList.push({
          ...baseData,
          orderCustId: this.formData.orderCustId,
          usageType: 'CUST_SELF_OUTBOUND',
          consumableList: this.materialList,
        })
      }
      // 仓库辅材
      if (this.wareMaterialList.length) {
        data.consumableOutboundList.push({
          ...baseData,
          orderCustId: "",
          usageType: 'OUTBOUND',
          consumableList: this.wareMaterialList,
        })
      }
      if (type === 'delete') {
        data.consumableOutboundList = []
      }
      updateConsumable(data).then(({ code }) => {
        if (code === 0) {
          this.$message.success("操作成功！")
          this.handleCancel()
          this.$emit("getData")
        }
      }).catch(() => { })
    },
    /**
     * @description: 删除耗材使用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 15:00:19
     */
    handleDelete () {
      this.$confirm('确定删除该数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitApi('delete')
      }).catch(() => {

      });
    },
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-01 15:21:00
     */
    handleCancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
/deep/ .el-form {
  display: flex;
  .el-form-item {
    min-width: 200px;
    .el-form-item__content {
      font-size: 12px;
    }
  }
}
</style>