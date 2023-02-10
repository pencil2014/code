<template>
  <div>
    <el-form :inline="true" :model="formData" label-width="100px" class="form" ref="form" size="mini" :hide-required-asterisk="isDisabled">
      <el-form-item label="仓库名称：">
        <el-input v-model="formData.warehouseName" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item label="入库号：">
        <el-input v-model="formData.inboundOrderNo" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item label="入库车牌：">
        <el-input v-model="formData.inboundLicensePlate" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item label="客户名称：">
        <el-input v-model="formData.orderCustName" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item label="货物预到总数：">
        <el-input v-model="formData.estimatedQuantity" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item label="货物实到总数：">
        <el-input v-model="formData.workQuantity" class="normalInput" disabled></el-input>
      </el-form-item>
      <el-form-item prop="workVolume" label="体积(CBM)">
        <el-input size="mini" placeholder="" v-model="formData.workVolume" class="normalInput" disabled> </el-input>
      </el-form-item>
      <el-form-item prop="workWeight" label="重量(KGS)">
        <el-input size="mini" placeholder="" v-model="formData.workWeight" class="normalInput" disabled> </el-input>
      </el-form-item>
      <el-form-item label="是否分唛：" prop="hasMarks" :rules="changeRule">
        <el-select v-model="formData.hasMarks" class="normalInput" :disabled="isDisabled" clearable>
          <el-option value="yes" label="是"></el-option>
          <el-option value="no" label="否"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="作业班组：" prop="workTeamId" :rules="changeRule">
        <el-select filterable remote :remote-method="workTeamMethod" size="mini" v-model="formData.workTeamId" placeholder=""
          class="normalInput" @change="changeWorkTeam" clearable @visible-change="showWorkTeamMethod" :disabled="isDisabled">
          <el-option v-for="item in workTeamList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="理货员：">
        <el-select filterable size="mini" v-model="formData.tallyManId" placeholder="" class="normalInput" clearable :disabled="isDisabled"
          @visible-change="showTallyManList">
          <el-option v-for="item in tallyManList" :key="item.value" :label="item.employeeName" :value="item.employeeId"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <div class="left-title">
          <p class="panel-title">作业人员</p>
        </div>
        <div class="right-title">
          <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd">新增</el-button>
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
          <vxe-table border resizable show-overflow ref="xTable" size="mini" :data="formData.members"
            :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
            :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="rules">
            <vxe-column type="seq" width="80" title="序号"></vxe-column>
            <vxe-column field="employeeId" title="作业人员" :edit-render="{}" min-width="130">
              <template #default="{ row }">
                {{ row.employeeName }}
              </template>
              <template #edit="{ row }">
                <el-select v-model="row.employeeId" placeholder="" size="small" style="width: 100%" @change="(v) => changeMember(v, row)">
                  <el-option v-for="item in workersList" :key="item.employeeId" :label="`${item.employeeName}（${item.employeeTypeName}）`"
                    :value="item.employeeId"></el-option>
                </el-select>
              </template>
            </vxe-column>
            <vxe-column field="employeeType" title="作业人员类型" min-width="150">
              <template #default="{ row }">
                {{ dictMapObj['warehouseEmployeeJobType'][row.employeeType] || row.employeeTypeName}}
              </template>
            </vxe-column>
            <vxe-column field="feeType" title="计费方式" :edit-render="{}" min-width="150">
              <template #default="{ row }">
                {{ dictMapObj['wmsPerforBillingUnit'][row.feeType] }}
              </template>
              <template #edit="{ row }">
                <el-select size="small" v-model="row.feeType">
                  <el-option v-for="item in dictMap['wmsPerforBillingUnit']" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </template>
            </vxe-column>
            <vxe-column field="remark" title="派工备注" :edit-render="{}" min-width="250">
              <template #edit="{ row }">
                <vxe-input v-model="row.remark" type="text"></vxe-input>
              </template>
            </vxe-column>
            <vxe-column v-if="((activeName && activeName === 'dispatchInfo' && !isDisabled) || !activeName)" title="操作" width="100"
              fixed="right">
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
  </div>
</template>

<script>
import { workTeamQueryPage, workTeamDetail, workDispatchAdd } from '@/api/wms'
import { mapGetters } from 'vuex'
const changeRule = { required: true, message: '此项必选', trigger: 'change' }

export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    activeName: {
      type: String,
      default: ''
    },
    operType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      changeRule,
      formData: {
        warehouseId: '',
        warehouseCode: '',
        warehouseName: '',
        inboundOrderNo: '',
        inboundOrderId: '',
        inboundLicensePlate: '',
        orderCustName: '',
        orderCustId: '',
        estimatedQuantity: '',
        workQuantity: '',
        hasMarks: '',
        workTeamId: '',
        workOrderNo: '',
        workVolume: '',
        workWeight: '',
        members: [],
        tallyManId: null
      },
      isShow: true,
      workTeamList: [],
      workersList: [],
      rules: {
        employeeId: [{ required: true, message: '作业人员不能为空' }],
        employeeType: [{ required: true, message: '作业人员类型不能为空' }],
        feeType: [{ required: true, message: '计费方式不能为空' }]
      },
      tallyManList: [],
      count: 0
    }
  },
  mounted () {
    this.setDispatch(this.options.data, true)
    this.$nextTick(() => {
      this.$refs.form.clearValidate()
    })
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  watch: {
    activeName (val) {
      this.count++
      if (val === 'dispatchInfo') {
        this.setDispatch(this.options.data, this.count <= 1)
        this.$refs.form.clearValidate()
      }
    },
    // options: {
    //   handler (newVal) {
    //     if (newVal.data) {
    //       this.setDispatch(newVal.data)
    //     }
    //   },
    //   deep: true
    // },
    'formData.workTeamId' (val) {
      if (val) {
        this.workTeamMethod()
      }
    }
  },
  methods: {
    // 设置派工基本信息
    setDispatch (data, isFirst) {
      // 累加获取货物中的各字段总数赋值到派工信息中
      let estimatedQuantity = null
      let workQuantity = null
      let actualVolume = null
      let actualWeight = null
      let members = JSON.parse(JSON.stringify(data?.dispatchDetail?.members || []))
      if (data?.goodsDetailList?.length) {
        estimatedQuantity = data.goodsDetailList.map(item => item.estimatedQuantity ? Number(item.estimatedQuantity) : null).reduce((pre, cur) => {
          return pre + cur
        }, 0)
        workQuantity = (data.goodsDetailList.map(item => item.actualQuantity ? Number(item.actualQuantity) : null)).reduce((pre, cur) => {
          return pre + cur
        }, 0)
        actualVolume = (data.goodsDetailList.map(item => item.inventoryVolume ? Number(item.inventoryVolume) : null)).reduce((pre, cur) => {
          return pre + cur
        }, 0)
        actualWeight = (data.goodsDetailList.map(item => item.inventoryWeight ? Number(item.inventoryWeight) : null)).reduce((pre, cur) => {
          return pre + cur
        }, 0)
      }
      if (data) {
        this.formData.warehouseName = data.warehouseName
        this.formData.warehouseCode = data.warehouseCode
        this.formData.warehouseId = data.wmsWarehouseId
        this.formData.inboundOrderId = data.inboundOrderId
        this.formData.inboundOrderNo = data.inboundNo
        this.formData.inboundLicensePlate = data.inboundLicensePlate
        this.formData.orderCustId = data.orderCustId
        this.formData.orderCustName = data.orderCustName
        this.formData.estimatedQuantity = this.activeName ? estimatedQuantity : data.estimatedQuantity
        this.formData.workQuantity = this.activeName ? workQuantity : data.actualQuantity
        this.formData.workOrderNo = data.workOrderNo
        this.formData.workVolume = this.activeName ? actualVolume : data.inventoryVolume
        this.formData.workWeight = this.activeName ? actualWeight : data.inventoryWeight
        if (isFirst) {
          this.formData.members = members.length ? members.filter(item => item.employeeType !== 'tallyman') : []
          this.formData.workTeamId = data?.dispatchDetail?.workTeamId ? Number(data.dispatchDetail.workTeamId) : null
          this.formData.hasMarks = data?.dispatchDetail?.hasMarks || null
          this.getTallyManList(this.formData.workTeamId)
        }
      }
    },
    // 作业班组列表
    workTeamMethod () {
      if (this.formData.warehouseId) {
        workTeamQueryPage({
          currPage: 1,
          pageSize: 20,
          query: [
            { column: "warehouseId", type: "eq", value: this.formData.warehouseId },
            { column: "enabled", type: "eq", value: 'yes' },
          ]
        }).then(res => {
          this.workTeamList = res?.data?.list?.map(item => {
            return { ...item, label: item.workTeamName, value: item.workTeamId }
          })
        })
      }
    },
    showWorkTeamMethod (show) {
      if (show) {
        if (!this.formData.warehouseId) {
          this.$message.error("请选择仓库！")
        } else {
          this.workTeamMethod()
        }
      }
    },
    getTallyManList (val) {
      if (val) {
        workTeamDetail({ workTeamId: val }).then(res => {
          this.tallyManList = JSON.parse(JSON.stringify(res.data.members || [])).filter(item => item.employeeType === 'tallyman')
          this.formData.tallyManId = this.tallyManList.length ? this.tallyManList[0].employeeId : null
        })
      }
    },
    showTallyManList (show) {
      if (show) {
        if (!this.formData.workTeamId) {
          this.$message.error("请选择作业班组！")
        } else {
          this.getTallyManList(this.formData.workTeamId)
        }
      }
    },
    /**
     * @description: 作业班组，要把该班组下面的作业人员全部带出
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-26 10:30:36
     */
    changeWorkTeam (val) {
      this.formData.members = []
      if (val) {
        workTeamDetail({ workTeamId: val }).then(res => {
          this.workersList = JSON.parse(JSON.stringify(res.data.members || [])).filter(item => item.employeeType !== 'tallyman')
          this.formData.members = JSON.parse(JSON.stringify(res.data.members || [])).filter(item => item.employeeType !== 'tallyman')
          this.tallyManList = JSON.parse(JSON.stringify(res.data.members || [])).filter(item => item.employeeType === 'tallyman')
          this.formData.tallyManId = this.tallyManList.length ? this.tallyManList[0].employeeId : null
          if (this.formData.members.length) {
            this.editRowEvent(this.formData.members[0])
          }
        })
      }
    },
    /**
     * @description: 切换作业人员
     * @param {*} val
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-10 17:18:05
     */
    changeMember (val, row) {
      let find = this.workersList.find(item => item.employeeId === val)
      row.employeeNo = find?.employeeNo
      row.employeeName = find?.employeeName
      row.employeeType = find?.employeeType
      row.workTeamId = this.formData.workTeamId
      row.employeeTypeName = find?.employeeTypeName
    },
    /**
     * @description: 新增作业人员
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-18 11:43:16
     */
    handleAdd () {
      this.formData.members.push(
        {
          workTeamId: null,
          employeeId: "",
          employeeNo: "",
          employeeName: "",
          employeeType: "",
          mobileNo: "",
          joinDate: "",
          deptName: "",
          feeType: this.dictMap['wmsPerforBillingUnit'].length === 1 ? this.dictMap['wmsPerforBillingUnit'][0].value : ''
        })
      this.editRowEvent(this.formData.members[this.formData.members.length - 1])
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
    /**
     * @description: 前端保存【入库单货物明细】行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:32:04
     */
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
     * @description: 取消编辑【入库单货物明细】行数据
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:32:26
     */
    cancelRowEvent (row) {
      const $table = this.$refs.xTable
      $table.clearActived().then(() => {
        // 还原行数据
        $table.revertData(row)
      })
    },
    /**
     * @description: 移除【入库单货物明细】行数据
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:14:47
     */
    removeRowEvent (index) {
      this.formData.members.splice(index, 1)
    },
    /**
     * @description: 提交数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-18 10:59:45
     */
    handleSubmit () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let data = JSON.parse(JSON.stringify(this.formData))
          data.dispatchType = "inbound"
          if (!data.members.length) {
            this.confirmTallyManId(data)
          } else {
            if (!data.tallyManId) {
              this.confirmTallyManId(data)
            } else {
              this.validInfo()
            }
          }
        } else {
          return this.$message.error("请将必填内容填写完整！")
        }
      })
    },
    /**
     * @description: 确定是否继续派工
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-26 14:23:17
     */
    confirmTallyManId (data) {
      this.$confirm('当前作业无理货员或作业人员信息，确认继续派工吗？ 点击确认时提交，点击取消时不提交。', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.setTallyManId(data)
      }).catch(() => { });
    },
    /**
     * @description: 校验作业人员信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-26 10:26:23
     */
    async validInfo () {
      const $xTable = this.$refs.xTable
      const errMap = await $xTable.validate(true).catch(errMap => errMap)
      if (errMap) {
        return this.$message.error('作业人员信息校验不通过!');
      } else {
        // 校验人员重复
        let data = JSON.parse(JSON.stringify(this.formData))
        data.dispatchType = "inbound"
        let ids = data.members.map(item => item.employeeId)
        let uniqIds = [...new Set(ids)]
        if (ids.length != uniqIds.length) {
          this.$message.error('作业人员不能重复')
        } else {
          this.setTallyManId(data)
        }
      }
    },
    /**
     * @description: 把理货员对应信息放到作业人员集合里面去
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-26 10:24:25
     */
    setTallyManId (data) {
      if (this.formData.tallyManId) {
        let tallyManData = this.tallyManList.filter(item => item.employeeId === this.formData.tallyManId)
        data.members = [...data.members, ...tallyManData]
      }
      data.members = data.members.map(item => {
        return {
          ...item,
          workTeamId: this.formData.workTeamId
        }
      })
      this.$delete(data, 'tallyManId')
      if (!this.activeName) {
        this.submitApi(data)
      } else {
        this.$emit('submitApi')
      }
    },
    /**
     * @description: 调用提交接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-10 17:20:29
     */
    submitApi (data) {
      workDispatchAdd(data).then(res => {
        if (res.code === 0) {
          this.$message.success("操作成功！")
          this.$emit('cancel')
          this.$emit('getList')
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>