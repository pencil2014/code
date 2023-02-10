<template>
  <el-dialog class="ship-small-route" :title="title" :close-on-click-modal="false" :visible.sync="visible" width="500px" @close="dialogClose">
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
      <el-form-item label="航线代码" label-width="100px" prop="sysLineCode">
        <el-input style="width: 100%" size="mini" disabled placeholder="由系统生成" v-model="createItem.sysLineCode"></el-input>
      </el-form-item>
      <el-form-item label="航线经理" label-width="100px" prop="managerId">
        <el-select filterable remote clearable style="width:100%" size="mini" v-model="createItem.managerId" placeholder="请选择航线经理" :remote-method="getEmployeeList" @change="managerNameChange">
          <el-option v-for="o in managerList" :key="o.employeeId" :label="o.cname+'  ('+o.employeeNo+')'" :value="o.employeeId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="中文名称" label-width="100px" prop="cname">
        <el-input style="width: 100%" size="mini" v-model="createItem.cname"></el-input>
      </el-form-item>
      <el-form-item label="英文名称" label-width="100px" prop="ename">
        <el-input style="width: 100%" size="mini" v-model="createItem.ename"></el-input>
      </el-form-item>
      <el-form-item label="所属大航线" label-width="100px" prop="sysLineGroupCode">
        <el-select size="mini" v-model="createItem.sysLineGroupCode" filterable clearable remote style="width: 100%" placeholder="请输入" :remote-method="val => majorRouteRemoteMethod(val,createItem.sysLineGroupCode)" @focus="majorRouteRemoteMethod('',createItem.sysLineGroupCode)">
          <el-option v-for="(item, index) in lineOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="航线说明" label-width="100px" prop="remark">
        <el-input type="textarea" :rows="2" style="width: 100%" size="mini" v-model="createItem.remark"></el-input>
      </el-form-item>
      <el-form-item label="航线类型" label-width="100px" prop="lineType">
        <el-radio-group v-model="createItem.lineType">
          <el-radio size="mini" v-for="(item, index) in  dictMap.lineType" :key="index" :label="item.value">{{item.label}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否启用" label-width="100px" prop="state">
        <el-radio-group v-model="createItem.state">
          <el-radio v-for="(o, key) in dictMap['state']" :key="key" :label="o.value">
            {{ $t(`dict.state.${o.value}`) }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm('createItemForm')">确定</el-button>
      <el-button size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { employeeSelectlist } from '@/api/companyResource'
import { systemLineSave } from '@/api/baseData'
import { sysLinePermissionGroupList } from '@/api/permission'
export default {
  name: 'sysLineSave',
  data() {
    return {
      lineOptions: [],
      filterText: '',
      //弹框标题
      title: '',
      //弹框开关
      visible: false,
      dataFormLoading: false,
      createItem: {
        lineId: '',
        managerId: '',
        managerName: '',
        cname: '',
        ename: '',
        state: 'valid',
        remark: '',
        lineType: '',
        sysLineCode: '',
        sysLineGroupCode: ''
      },
      action: '',
      rules: {
        cname: [
          {
            required: true,
            message: '中文名称不能为空',
            trigger: 'blur,change'
          }
        ],
        state: [
          {
            required: true,
            message: '是否启用不能为空',
            trigger: 'blur,change'
          }
        ],
        lineType: [
          {
            required: true,
            message: '航线类型不能为空',
            trigger: 'blur,change'
          }
        ],
        sysLineGroupCode: [
          {
            required: true,
            message: '所属大航线不能为空',
            trigger: 'blur,change'
          }
        ]
      },
      loading: false,
      managerList: []
    }
  },
  // table基础组件
  components: {},
  created() {},
  mounted() {},
  computed: {
    ...mapGetters(['userId', 'dictMap'])
  },

  methods: {
    majorRouteRemoteMethod(val, code) {
      let params = {
        columns: [],
        currPage: 1,
        pageSize: 50
      }
      if (code && !val) {
        // 有选中值&&搜索条件不是空
        params.query = [
          {
            column: 'sysLineGroupCode',
            type: 'eq',
            value: code
          },
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          }
        ]
      } else {
        params.query = [
          {
            column: 'name',
            type: 'like',
            value: val || ''
          },
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          }
        ]
      }
      sysLinePermissionGroupList(params).then((res) => {
        if (res.data && res.data.length) {
          this.lineOptions = res.data.map((ele) => {
            return Object.assign(ele, {
              label: ele.sysLineGroupCname,
              value: ele.sysLineGroupCode
            })
          })
        } else {
          this.lineOptions = []
        }
      })
    },
    init(row) {
      this.visible = true
      this.$nextTick(() => {
        console.log(row)
        if (row) {
          for (var p in this.createItem) {
            this.createItem[p] = row[p]
          }
          this.title = '编辑小航线'
          this.action = 'edit'
          this.getEmployeeList(row.managerName)
        } else {
          this.title = '新增小航线'
          this.getEmployeeList('')
        }
      })
    },
    //清空数据
    dialogClose() {
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        lineId: '',
        managerId: '',
        managerName: '',
        cname: '',
        ename: '',
        state: 'valid',
        remark: '',
        lineType: '',
        sysLineCode: ''
      })
      this.action = ''
    },
    // 取消按钮
    cancel() {
      this.visible = false
    },
    //保存按钮操作
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          systemLineSave(this.createItem).then((res) => {
            this.$message({ message: '恭喜你，保存成功', type: 'success' })
            this.visible = false
            this.$emit('refreshDataList')
          })
        } else {
          return false
        }
      })
    },
    getEmployeeList(queryString) {
      employeeSelectlist({ name: queryString, roleCodes: 'pricing' }).then(
        (res) => {
          this.managerList = res.data
        }
      )
    },
    managerNameChange(val) {
      console.log(val)
      if (!val) {
        this.createItem.managerName = ''
        this.getEmployeeList('')
      }else{
        let item = this.managerList.find(el=>el.employeeId === val)
        this.createItem.managerName = item?item.cname:''
      }
    }
  }
}
</script>
<style  lang="scss" scoped>
</style>