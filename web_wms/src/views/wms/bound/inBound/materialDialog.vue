<template>
  <div>
    <el-dialog :before-close="handleCancel" :visible.sync="options.show" class="dialog" title="客户自带辅材" :modal-append-to-body='false'
      width="1150px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div class="left-title">
            <p class="panel-title">客户自带辅材</p>
          </div>
          <div class="right-title">
            <el-button size="mini" type="primary" @click="handleAdd">新增</el-button>
            <el-button v-if="isShow" type="text" @click="isShow = false">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="isShow = true">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="isShow" class="card-table-list">
            <vxe-table border resizable show-overflow ref="xTable" size="mini" :data="formData.consumableList"
              :edit-config="{trigger: 'manual', mode: 'row', autoClear: false}" align="center" :valid-config="{ showMessage: false }" empty-text=" " :edit-rules="rules">
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
              <vxe-column field="unit" title="单位" min-width="150">
                <template #default="{ row }">
                  {{ dictMapObj['wmsGoodsUnit'][row.unit] }}
                </template>
              </vxe-column>
              <vxe-column field="quantity" title="数量" :edit-render="{}" min-width="150">
                <template #edit="{ row }">
                  <vxe-input v-model="row.quantity" type="integer"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column title="操作" width="100" fixed="right">
                <template #default="{ row, rowIndex }">
                  <template v-if="!row.disabled">
                    <template v-if="$refs.xTable.isActiveByRow(row)">
                      <el-link type="primary" :underline="false" @click="saveRowEvent(row)">保存</el-link>
                    </template>
                    <template v-else>
                      <el-link type="warning" :underline="false" @click="editRowEvent(row)">修改</el-link>
                    </template>
                    <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex)">删除</el-link>
                  </template>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-collapse-transition>
      </el-card>
      <div class="dialog-footer" slot="footer">
        <el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMaterialMaintList } from '@/api/wms/warehouse.js'
import { saveCustSelf, queryInBoundConsumable } from '@/api/wms/inBound.js'
import { mapGetters } from 'vuex'
export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      isShow: true,
      formData: {
        inboundNo: '',
        consumableList: []
      },
      consumableList: [],
      rules: {
        consumableId: [{ required: true, message: '辅材名称不能为空' }],
        quantity: [{ required: true, message: '数量不能为空' }]
      }
    }
  },
  created () {
    this.formData.inboundNo = this.options.inboundNo || ''
    this.getInBoundConsumableList()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    /**
     * @description: 客户自带辅材的查询
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 17:48:40
     */
    getInBoundConsumableList () {
      let data = {
        inboundNo: this.formData.inboundNo
      }
      queryInBoundConsumable(data).then(({ code, data }) => {
        if (code === 0) {
          this.formData.consumableList = data
          this.formData.consumableList = this.formData.consumableList.map(item => {
            return {
              ...item,
              disabled: true
            }
          })
        }
      })
      .finally(() => {
      })
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
        query: []
      }
      if (str) {
        data.query.push({
          column: "consumableName",
          type: "like",
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
        })
    },
    showConsumableList (show, index) {
      show && this.getConsumableList('', index)
    },
    changeConsumable (val, row, index) {
      let find = this.consumableList.find(item => item.value === val)
      row.wharfYardCode = find?.wharfYardCode
      row.consumableNo = find?.consumableNo
      row.consumableName = find?.consumableName
      row.specificationType = find?.specificationType
      row.unit = find?.unit
    },
    handleAdd () {
      this.formData.consumableList.push(
        {
          consumableId: null,
          consumableName: "",
          unit: "",
          quantity: null
        }
      )
      this.editRowEvent(this.formData.consumableList[this.formData.consumableList.length - 1])
    },
    /**
     * @description: 编辑【入库单货物明细】行数据
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:18
     */
    editRowEvent (row) {
      const $table = this.$refs.xTable
      $table.setActiveRow(row)
    },
    async saveRowEvent () {
      const $table = this.$refs.xTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return false
      } else {
        $table.clearActived()
      }
    },
    /**
     * @description: 删除数据行
     * @param {*} index 删除集合下标
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-22 11:24:02
     */
    removeRowEvent (index) {
      this.formData.consumableList.splice(index, 1)
    },
    handleSubmit () {
      if (!this.formData.consumableList.length) {
        return this.$message.error("请填写辅材信息！")
      } else {
        this.validInfo()
      }
    },
    /**
     * @description: xTable校验方式校验表格必填数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-24 16:06:19
     */
    async validInfo () {
      const $xTable = this.$refs.xTable
      const errMap = await $xTable.validate(true).catch(errMap => errMap)
      if (errMap) {
        this.$message.error('客户自带辅材信息校验不通过!');
      } else {
        this.submitApi()
      }
    },
    /**
     * @description: 调用保存接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-26 16:06:36
     */
    submitApi () {
      let data = JSON.parse(JSON.stringify(this.formData))
      data.consumableList = data.consumableList.filter(item => !item.disabled)
      if (data.consumableList && data.consumableList.length) {
        data.consumableList.forEach(item => {
          item.inventoryQuantity = Number(item.quantity)
          this.$delete(item, '_XID')
        })
      }
      saveCustSelf(data).then(({ code }) => {
        if (code === 0) {
          this.$message.success("操作成功！")
          this.handleCancel()
          this.$emit("getData")
        }
      }).catch(() => { })
    },
    handleCancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>