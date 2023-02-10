<template>
  <div class="detail-wrap">
    <div class="detail-header">
      <div class="header-left">{{ $route.query.type === 'modify' ? `修改企业员工` : $route.query.type === 'add' ? `新增企业员工` : `企业员工详情` }}</div>
      <div class="header-right">
        <el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
        <!-- <el-button v-if="isDetail" @click="handleCancel" size="mini">返回</el-button> -->
      </div>
    </div>
    <el-form ref="validForm" :show-message="false" :rules="rules" label-width="85px" :inline="true" :model="formInline">
      <div class="top-form">
        <el-form-item prop="employeeId" label="姓名：">
          <el-select v-model="formInline.employeeId" value-key="employeeId" size="mini" clearable remote filterable
            :remote-method="queryEmployeeList"
            @visible-change="(show) => show && queryEmployeeList('')" @change="changeEmployee"
            :disabled="isDetail">
            <el-option v-for="item in employeeList" :key="item.employeeId" :label="item.cname || item.ename"
              :value="item.employeeId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="jobType" label="岗位：">
          <el-select size="mini" v-model="formInline.jobType" placeholder="请选择">
            <el-option v-for="item in dictMap['warehouseEmployeeJobType']" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="warehouseId" label="仓库名称">
          <el-select filterable="" clearable="" :disabled="isDetail" size="mini" v-model="formInline.warehouseId" multiple :multiple-limit='limit' placeholder="请选择" class="mulSelect">
            <el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="entryDate" label="入职日期：">
          <el-input maxlength="64" :disabled="true" size="mini" placeholder="请输入" v-model="formInline.entryDate"> </el-input>
        </el-form-item>
        <el-form-item prop="mobilePhone" label="电话号码：">
          <el-input maxlength="64" :disabled="true" size="mini" placeholder="请输入" v-model="formInline.mobilePhone"> </el-input>
        </el-form-item>
      </div>
      <div class="table-wrap">
        <div class="table-title">
          <div class="title-left">绩效定义列表</div>
          <div class="title-right">
            <span @click="handleAdd" class="add-btn">新增</span><span @click="handleFold" class="arrow-btn">{{ arrowText }}
              <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
          </div>
        </div>
        <div v-if="arrowDown" class="table-content">
          <el-table :header-cell-style="{ color: '#222222' }" :data="formInline.performances" border>
            <el-table-column align="center" prop="billingUnit" label="绩效计算单位" min-width="150">
              <template slot="header"> <span style="color: #e63923">*</span>绩效计算单位 </template>
              <template slot-scope="scope">
                <el-form-item :prop="'performances.' + scope.$index + '.billingUnit'" :rules="rules.billingUnit">
                  <el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.billingUnit" placeholder="请选择">
                    <el-option v-for="item in dictMap['wmsPerforBillingUnit']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                  <span v-else>{{ dictMapObj['wmsPerforBillingUnit'][scope.row.billingUnit] }}</span>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="billingPrice" label="绩效单价" min-width="150">
              <template slot="header"> <span style="color: #e63923">*</span>绩效单价 </template>
              <template slot-scope="scope">
                <el-form-item :prop="'performances.' + scope.$index + '.billingPrice'" :rules="rules.billingPrice">
                  <el-input v-if="scope.row.isEdit" maxlength="11" size="mini" placeholder="请输入"
                    v-model="scope.row.billingPrice"> </el-input>
                  <span v-else>{{ scope.row.billingPrice }}</span>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="billingStartTime" label="绩效生效开始时间" min-width="150">
              <template slot="header"> <span style="color: #e63923">*</span>绩效生效开始时间 </template>
              <template slot-scope="scope">
                <el-form-item :prop="'performances.' + scope.$index + '.billingStartTime'" :rules="rules.billingStartTime">
                  <el-date-picker v-if="scope.row.isEdit" v-model="scope.row.billingStartTime" size="mini" type="datetime"
                    format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" default-time="00:00:00" style="width: 100%" @change="(v) => changeBillingTime(v, scope.$index, 'start')"> </el-date-picker>
                  <span v-else>{{ scope.row.billingStartTime }}</span>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" label="绩效生效结束时间" min-width="150">
              <template slot="header">绩效生效结束时间 </template>
              <template slot-scope="scope">
                <el-form-item :prop="'performances.' + scope.$index + '.billingEndTime'">
                  <el-date-picker v-if="scope.row.isEdit" v-model="scope.row.billingEndTime" size="mini" type="datetime" default-time="23:59:59"
                    value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%"> </el-date-picker>
                  <span v-else>{{ scope.row.billingEndTime }}</span>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <span v-if="scope.row.isEdit" @click="handleSave(scope.row)" class="save-btn">保存</span>
                <span v-if="!scope.row.isEdit && !scope.row.isDisabled" @click="scope.row.isEdit = true" class="modify-btn">修改</span>
                <span @click="handleDelete(scope.$index)" class="delete-btn" :style="scope.row.isDisabled ? 'marginLeft: 0' : 'marginLeft: 16px'">删除</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { queryWarehouseList, addWarehouseEmployee, updateWarehouseEmployee, warehouseEmployeeDetail } from '@/api/wms'
import { getEmployeeList } from '@/api/wms/warehouse.js'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      formInline: {
        employeeName: '',
        employeeId: null,
        warehouseId: [],
        jobType: '',
        jobTypeName: '',
        entryDate: '',
        mobilePhone: '',
        performances: [{
          billingUnit: 'volume_cubic',
          billingPrice: '',
          billingStartTime: '',
          billingEndTime: '',
          isEdit: true
        }]
      },
      arrowText: '收起',
      arrowDown: true,
      rules: {
        employeeId: [{ required: true, message: '请输入姓名', trigger: 'change' }],
        warehouseId: [{ required: true, message: '请选择仓库名称', trigger: 'change' }],
        jobType: [{ required: true, message: '请选择岗位', trigger: 'change' }],
        billingUnit: [{ required: true, message: '请选择绩效计算单位', trigger: 'change' }],
        billingPrice: [{ required: true, message: '请选择绩效单价', trigger: 'change' }],
        billingStartTime: [{ required: true, message: '请选择绩效生效开始时间', trigger: 'change' }],
      },
      warehouseOptions: [],
      employeeList: [],
      limit: 1
    }
  },
  created () {},
  activated () {
    if (['detail', 'modify'].includes(this.$route.query.type)) {
      this.getDetail()
    } else {
      // 重置校验
      this.$refs.validForm.resetFields()
      // 初始化表单
      this.formInline = this.$options.data().formInline
    }
    this.getWarehouseOptions()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isDetail () {
      return this.$route.query.type === 'modify'
    }
  },
  watch: {
    'formInline.jobType' (val) {
      this.formInline.jobTypeName = this.dictMapObj['warehouseEmployeeJobType'][val]
      // 限制仓库可选数
      if (val === 'company_manager') {
        this.limit = 0
      } else {
        this.limit = 1
        if (this.formInline.warehouseId.length > 1) {
          this.formInline.warehouseId = this.formInline.warehouseId.slice(0, 1)
        }
      }
    }
  },
  methods: {
    // 仓库列表
    getWarehouseOptions (name) {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "authority",
            type: "eq",
            value: 'no'
          },
          {
            column: "warehouseName",
            type: "like",
            value: name
          }
        ]
      }
      queryWarehouseList(data)
        .then(({ data: { list } }) => {
          this.warehouseOptions.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: v.warehouseName,
              value: v.wmsWarehouseId
            }))
          )
        })
      // warehouseList({ warehouseName: '' }).then(res => {
      //   this.warehouseOptions = res.data.map(item => {
      //     return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
      //   })
      // })
    },
    // 获取员工信息
    queryEmployeeList (str = '') {
      let data = {
        name: str
      }
      getEmployeeList(data)
        .then(({ code, data }) => {
          if (code === 0) {
            this.employeeList = (data || []).map(item => {
              return { ...item, label: item.cname || item.ename, value: item.code }
            })
          }
        })
        .catch(() => { })
    },
    // 切换姓名时回调
    changeEmployee (val) {
      let find = this.employeeList.find(item => item.employeeId === val)
      this.formInline.employeeName = find?.label
      this.formInline.entryDate = find?.joinDate
      this.formInline.mobilePhone = find ? find.mobileNo || find.telephone : ''
      this.formInline.jobType = find?.jobDefineList?.length ? find.jobDefineList[0].jobCode : ''
      this.formInline.jobTypeName = find?.jobDefineList?.length ? find.jobDefineList[0].jobCname : ''
    },
    
    // 表格收起展开切换
    handleFold () {
      this.arrowDown = !this.arrowDown
      this.arrowText = this.arrowDown ? '收起' : '展开'
    },
    /**
     * @description: 获取指定时间前一秒的时间
     * @param {*} time
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-14 14:13:29
     */
    getBeforeSecond (time) {
      let start = new Date(time).getTime()
      let endTime = new Date(start- 1000)
      let Y = endTime.getFullYear() + '-';
      let M = (endTime.getMonth() + 1 < 10 ? '0' + (endTime.getMonth() + 1) : endTime.getMonth() + 1) + '-';
      let D = endTime.getDate() < 10 ? ('0' + endTime.getDate() + ' ') : endTime.getDate() + ' ';
      let h = endTime.getHours() < 10 ? ('0' + endTime.getHours() + ':') : endTime.getHours() + ':';
      let m = endTime.getMinutes() < 10 ? ('0' + endTime.getMinutes() + ':') : endTime.getMinutes() + ':';
      let s = endTime.getSeconds() < 10 ? ('0' + endTime.getSeconds()) : endTime.getSeconds(); 
      return Y + M + D + h + m + s
    },
    /**
     * @description: 切换理货员绩效时间时回调
     * @param {*} val
     * @param {*} rowIndex
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 11:17:37
     */
    changeBillingTime (val, rowIndex, type) {
      // 当上一条结束时间为空时，自动将上一条结束时间置为当前开始时间的前一秒
      if (rowIndex > 0 && type ==='start') {
        this.formInline.performances[rowIndex-1].billingEndTime = this.getBeforeSecond(val)
      }
    },
    // 新增表格数据
    handleAdd () {
      this.formInline.performances.push({
        billingUnit: 'volume_cubic',
        billingPrice: '',
        billingStartTime: '',
        billingEndTime: '',
        isEdit: true
      })
    },
    // 删除一行表格数据
    handleDelete (index) {
      this.formInline.performances.splice(index, 1)
    },
    // 表格保存
    handleSave (row) {
      this.$refs['validForm'].validate((valid, obj) => {
				// 非空 验证
				if (Object.keys(obj).some(item => item.includes('performances'))) return false
				// 单价 验证
				if (!/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(row.billingPrice)) return this.$message.error('绩效单价只能填写最多包含两位小数的数字!')
				row.isEdit = false
			})
    },
    // 提交
    handleSubmit () {
      this.$refs['validForm'].validate(valid => {
				if (valid) {
          let data = JSON.parse(JSON.stringify(this.formInline))
          for (let i = 0; i < data.performances.length; i++) {
            const item = data.performances[i];
            // 校验绩效单价
            if (!/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(item.billingPrice)) {
              return this.$message.error(`第${i+1}条信息的绩效单价只能填写最多包含两位小数的数字！`) 
            }
            // 校验开始时间不能大于结束时间
            if (item.billingEndTime && (new Date(item.billingStartTime) - new Date(item.billingEndTime) > 0)) {
              return this.$message.error(`第${i+1}条信息的绩效计费单价开始日期不能晚于结束日期！`)
            }
            if (i > 0  && item.billingStartTime && item.billingEndTime && (new Date(item.billingStartTime) - new Date(data.performances[i-1].billingEndTime) < 0)) {
              return this.$message({
                showClose: true,
                message: `第${i+1}条信息的绩效计费单价开始日期不能早于上一条绩效计费单价结束日期！`,
                type: 'error',
                duration: 5000
              });
            }
            item.billingPrice = Number(item.billingPrice)
            this.$delete(item, 'isEdit')
          }
          // 单价 验证
					// if (this.formInline.performances.some(item => !/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(item.billingPrice))) return this.$message.error('绩效单价只能填写最多包含两位小数的数字!')
          
          
          // data.performances.forEach(item => {
          //   item.billingPrice = Number(item.billingPrice)
          //   this.$delete(item, 'isEdit')
          // })
					let fn = null
					if (this.$route.query.type === 'add') {
						fn = addWarehouseEmployee
					} else {
						fn = updateWarehouseEmployee
					}
          fn(data).then(() => {
						this.$router.push({ name: 'WarehouseStaff' })
						this.$message.success('提交成功！')
					})
        } else {
          this.$message.error('请填写必填项！')
        }
      })
    },
    // 获取详情
    getDetail () {
      warehouseEmployeeDetail({ groupCode: this.$route.query.groupCode }).then(res => {
        this.formInline = res?.data
        this.formInline.groupCode = this.$route.query.groupCode
				this.formInline.performances = res?.data?.performances?.map(item => {
					return { ...item, isEdit: false, isDisabled: true }
				})
        this.queryEmployeeList(this.formInline.employeeName)
      })
    },
    // 取消
    handleCancel () {
      this.$router.push({ name: 'WarehouseStaff' })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.detail-wrap {
  min-height: calc(100vh - 62px);
  background: #ffffff;
  .table-wrap {
    margin: 0 16px;
    border: 1px solid #d9d9d9;
    .table-content {
      .el-table td {
        border-right: 1px solid #dfe6ec !important;
      }
      padding: 16px;
      span {
        font-size: 12px;
      }
      .el-form-item,
      .el-form-item__content,
      .el-select {
        display: block;
      }
      .el-form-item {
        margin: 0;
      }
      .el-table--border th,
      .el-table--border td {
        border-right: 1px solid #dfe6ec !important;
        height: 30px;
        padding: 0;
      }
      .delete-btn {
        color: #cd4130;
        cursor: pointer;
        margin-left: 16px;
      }
      .modify-btn {
        color: #e9851f;
        cursor: pointer;
      }
      .save-btn {
        color: #3e80f5;
        cursor: pointer;
      }
      
    }
    .table-title {
      background: #ebeef3;
      height: 40px;
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      .title-left {
        font-size: 12px;
        font-weight: bold;
        color: #222222;
      }
      .title-right {
        display: flex;
        align-items: center;
        .add-btn {
          display: inline-block;
          width: 56px;
          height: 28px;
          line-height: 28px;
          background: #3e80f5;
          border-radius: 2px;
          margin-right: 40px;
          color: #ffffff;
          text-align: center;
          cursor: pointer;
        }
        .arrow-btn {
          cursor: pointer;
        }
      }
    }
  }
  /deep/ .el-select .el-select__tags {
    max-width: 98% !important;
    span {
      width: auto !important;
    }
  }
  .top-form {
    padding: 24px 0;
    .el-form-item {
      &.w100 {
        width: calc(100% - 20px);
      }
      width: calc((100% - 40px) / 3);
      /deep/ .el-form-item__content {
        width: calc(100% - 85px);
        .el-select,
        .el-date-editor--datetime {
          width: 100%;
        }
      }
    }
    .mulSelect {
      /deep/ .el-select__tags {
        span {
          padding: 0 2px;
          .el-tag--mini:first-of-type {
            flex: none !important;
            -webkit-box-flex: none !important;
          }
        } 
      }
    }
  }
  .detail-header {
    padding: 10px 16px;
    height: 40px;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-left {
      font-size: 14px;
      font-weight: bold;
      color: #222222;
    }
  }
}
</style>