<!--
 * @Author: Sivan
 * @Date: 2022-06-17 10:35:33
 * @LastEditTime: 2022-06-23 12:48:10
 * @LastEditors: Sivan
-->
<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :border="true" :searchOption="searchOption" @search="search" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" @click="handleEdit({}, 'add')" size="mini" type="primary"
              >新增费用类别</el-button
            >
          </el-button-group>
        </div>
        <div class="money-box-right"></div>
      </div>
      <FinanceTableMass :option="option1" />
    </div>
    <el-dialog
      :title="dialogOption.type === 'add' ? '新增费用类型' : '编辑费用类型'"
      :visible.sync="dialogOption.show"
      width="800px"
      :before-close="cancel"
      v-if="dialogOption.show"
    >
      <el-form ref="form" :model="dialogForm" :rules="rules" label-width="90px" size="mini">
        <el-form-item label="费用类编码:" prop="feeClassCode">
          <el-input
            v-model="dialogForm.feeClassCode"
            :disabled="dialogOption.type === 'edit'"
            placeholder="费用类编码,保存后不可编辑"
            maxlength="32"
          ></el-input>
        </el-form-item>
        <el-form-item label="中文名称:" prop="cname">
          <el-input v-model="dialogForm.cname" placeholder="请输入" maxlength="64"></el-input>
        </el-form-item>
        <el-form-item label="英文名称:" prop="ename">
          <el-input v-model="dialogForm.ename" placeholder="请输入" maxlength="64"></el-input>
        </el-form-item>
        <!-- <el-form-item label="生成转字凭证:" prop="toVoucher">
          <el-select v-model="dialogForm.toVoucher" placeholder="请选择">
            <el-option
              v-for="(o, key) in dictMap['yesNo']"
              :key="key"
              :label="o.label"
              :value="o.value"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="是否有效:" prop="state">
          <el-select v-model="dialogForm.state" placeholder="请选择">
            <el-option
              v-for="(o, key) in dictMap['state']"
              :key="key"
              :label="o.label"
              :value="o.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input
            type="textarea"
            :rows="3"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入备注"
            v-model="dialogForm.remark"
            maxlength="300"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancel" size="mini">取 消</el-button>
        <el-button type="primary" @click="submit" size="mini">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { feeClassList, feeClassSave } from '@/api/baseData'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  components: {
    FinanceTableMass,
    FinanceSearch,
  },
  mixins: [mixin],
  data() {
    return {
      searchOption: {},
      option1: {},
      lsLoading: false,
      dialogOption: {
        show: false,
        type: 'add',
      },
      dialogForm: {
        feeClassId: '',
        feeClassCode: '',
        cname: '',
        ename: '',
        // toVoucher: '',
        remark: '',
        state: 'valid',
      },
      rules: {
        feeClassCode: [{ required: true, message: ' ', trigger: 'blur' }],
        cname: [{ required: true, message: ' ', trigger: 'blur' }],
        // toVoucher: [{ required: true, message: '是否生成凭证不能为空', trigger: 'blur' }],
        // toBill: [{ required: true, message: '是否默认参与对账不能为空', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'state', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: {
          name: {
            key: 'name',
            label: '类别名称',
            type: 'input',
            searchType: 'like',
          },
          state: {
            key: 'state',
            label: '是否有效',
            type: 'select',
            propInDict: 'state',
            searchType: 'eq',
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '编辑',
          type: 'text',
          show: true,
          action: 'Edit',
        },
      ],
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'Edit') {
          this.handleEdit(row, 'edit')
        }
      },
    })
    this.option1 = {
      ...this.option,
      operationBtns,
      selection: false,
      id: 'option1',
      pagination,
      emptyText: '数据将在查询后显示',
    }
    let columns = [
      {
        prop: 'feeClassCode',
        label: '费用类编码',
        type: 'text',
      },
      {
        prop: 'cname',
        label: '中文名称',
        type: 'text',
      },
      {
        prop: 'ename',
        label: '英文名称',
        type: 'text',
      },
      // {
      //   prop: 'toVoucher',
      //   label: '输出转字凭证',
      //   type: 'select',
      //   propInDict: 'yesNo',
      // },
      {
        prop: 'remark',
        label: '备注',
        type: 'text',
      },
      {
        prop: 'state',
        label: '是否有效',
        type: 'select',
        formatter: ({ row }) => (row.state === 'valid' ? '是' : '否'),
      },
    ]
    this.option1.columns = columns
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
    // 搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      feeClassList(data)
        .then((res) => {
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    //菜单编辑
    handleEdit(row, type) {
      this.dialogOption.type = type
      if (type === 'add') {
        row = {
          feeClassId: '',
          feeClassCode: '',
          cname: '',
          ename: '',
          // toVoucher: '',
          remark: '',
          state: 'valid',
        }
      }
      Object.assign(this.dialogForm, row)
      this.dialogOption.show = true
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    cancel() {
      this.dialogOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
           feeClassSave(this.dialogForm).then(res => {
            this.cancel()
            this.getData()
            this.$msgSucClose('恭喜你，保存成功')
           }).catch(()=>{})
        }
      })
    },
  },
}
</script>