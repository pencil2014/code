<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="add-employee-form">    
      <el-form-item label="跟进人" prop="followEmployeeId" :show-message="false">
        <el-select
          size="mini" 
          :filterable='true'
          v-model="createItem.followEmployeeName"
          style="width: 100%"  
          placeholder="请选择"
          @visible-change="(val) => {visibleChange(val)}"
          :filter-method="(val) => {filterMehod(val)}"
          @change="(val) => {handleChangeEmployee(val)}">
          <el-option v-for="ele in employeeOptions"
            :key="ele.employeeId"
            :label="ele.cname"
            :value="ele.employeeId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="跟进项名称" prop="name" :show-message="false">
        <el-input size="mini" v-model="createItem.name" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="跟进项内容" prop="content">
        <el-input size="mini" v-model="createItem.content" placeholder="请输入"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {baseEmployeeListName} from '@/api/base'
import {workExceptionSaveItem} from '@/api/order/workException'

const defaultCreate = {
  excpId: undefined,
  followEmployeeId: "",
  followEmployeeName: '',
  followDeptCode: '',
  name: '',
  content: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '新增跟进人',
        show: true,
        size: 'medium',
        width: '400px'
      },

      createItem: Object.assign({}, defaultCreate),
      canSubmit: true,
      
      rules: {
        followEmployeeId: [{required: true, message: '请选择跟进人', trigger: 'change'}],
        name: [{required: true, message: '请输入', trigger: 'blur'}]
      },
      employeeOptions: []

    }
  },
  props: {
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    // 下拉搜索自定义查询
    filterMehod(val) {
      this.getEmployeeName(val)
    },

    // 下拉展开
    visibleChange(val) {
      if (val) {
        this.getEmployeeName()
      }
    },

    // 下拉选中负责人
    handleChangeEmployee(val) {
      let item = this.employeeOptions.find(i => i.employeeId === val)
      Object.assign(this.createItem, {
        followEmployeeId: val,
        followEmployeeName: item.cname,
        followDeptCode: item.deptCode
      })
    },

    // 获取姓名
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then(res => {  
        this.employeeOptions = res.data.filter(item => item.status === 'on')
      })
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.canSubmit && this.handleSave(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    close(action) {
      this.$emit('close', action)
    },

    // 保存
    handleSave(done) {
      this.createItem.excpId = this.$route.query.excpId
      this.canSubmit = false
      workExceptionSaveItem(this.createItem).then(res => {
        this.$message({
          type: 'success',
          message: '保存成功',
          duration: 1000,
          onClose: () => {
            this.canSubmit = true
            this.close('Confirm')
          }
        })
      }).catch(err => {
        this.canSubmit = true
      })
    }
  }
};
</script>

<style lang="scss">
.add-employee-form{
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
