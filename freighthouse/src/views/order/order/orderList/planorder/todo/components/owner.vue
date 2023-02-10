<template>
  <el-table fit class="plan-table" style="width: 100%;" :data="tableData">
    <el-table-column prop="orderNo" label="工作号" align="left" width="200">
      <template slot-scope="scope">
        <el-button v-if="!scope.row.isAdd" type="text" size="mini" class="underline" @click="handleInfo(scope.row)">{{scope.row.orderNo}}</el-button> 
        <el-input v-else type="text" size="mini" clearable placeholder="请输入" v-model="scope.row.orderNo" @blur="handleValidateOrderNo(scope.row)"></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="matterName" label="待办事项" align="left" width="180">
       <template slot-scope="scope">
        <span v-if="!scope.row.isAdd">{{scope.row.matterName}}</span>
        <el-input v-else type="text" size="mini" clearable placeholder="请输入" v-model="scope.row.matterName" @blur="handleValidateMtterName(scope.row)"></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" align="left">
      <template slot-scope="scope">
        <span v-if="!scope.row.isEdit && !scope.row.isAdd">{{scope.row.remark}}</span>
        <el-input v-else type="text" size="mini" clearable placeholder="请输入" v-model="scope.row.remark" maxlength="512" show-word-limit></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="beginTime" label="处理时间" align="left" width="200">
      <template slot-scope="scope">
        <span v-if="!scope.row.isAdd">{{scope.row.beginTime}}</span>
        <elDatePickerLimit
          v-else
          size="mini"
          v-model="scope.row.beginTime"
          type="datetime"
          style="width: 100%"
          clearable
          placeholder="请选择"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </template>
    </el-table-column>
    <el-table-column prop="matterStatus" label="进度" width="120" align="left"> 
      <template slot-scope="scope">
        <span v-if="!scope.row.isEdit && !scope.row.isAdd">
          {{getStatus(scope.row.matterStatus)}}
        </span>
        <el-select v-else size="mini" v-model="scope.row.matterStatus" placeholder="请选择" clearable @change="handleChangeStatus(scope.row)">
          <el-option v-for="(item, index) in matterStatusOptions" :key="index" :label="item.label" :value="item.value" :disabled="matterStatusDisabled(scope.row, item)"></el-option>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="100" align="left">
      <template slot-scope="scope">
        <div class="operate-group">
          <el-button type="text" size="mini" @click="handleCancel(scope.row, scope.$index)" v-if="scope.row.isEdit">取消</el-button>
          <el-button type="text" size="mini" @click="handleSave(scope.row, scope.$index)" v-if="scope.row.isEdit || scope.row.isAdd">保存</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row, scope.$index)" v-if="scope.row.isAdd" class="red">取消</el-button>
          <el-button type="text" size="mini" @click="handleEdit(scope.row, scope.$index)" v-if="!scope.row.isEdit && !scope.row.isAdd">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row, scope.$index)" v-if="!scope.row.isEdit && !scope.row.isAdd" class="red">删除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import {getDictLabel} from '@/utils/tools'
import {routerMixin} from '@/views/order/order/mixins/routerMixin'
import { todoCreate } from '@/api/order/plan'

const defaultPage = {
  pageSize: -1,
  currPage: 1,
  totalCount: null
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['startTime'],
  query: [],     // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  handleStatus: 'all', // 订单状态，默认展示未处理
}

export default {
  mixins: [routerMixin],
  data() {
    return {
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      matterStatusOptions: [
        {label: '未完成', value: 'todo'},
        {label: '处理中', value: 'processing'},
        {label: '已完成', value: 'done'},
      ],
      isEdit: false
    }
  },
  created() {
  },
  mounted() {
    
  },
  destroyed(){
  },
  computed: {
  },
  props: {
    tableData: {
      type: Array,
      default: () => ([])
    },
    callback: {
      type: Function,
      default: () => ({})
    },
    action: {
      type: String,
      default: ''
    }
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    getStatus(status) {
      status = status.toLowerCase()
      let findItem = this.matterStatusOptions.find(item => item.value === status) 
      let result = findItem ? findItem.label : ''
      return result
    },
    // 创建待办，进度只能选未完成
    matterStatusDisabled(row, item) {
      return row.isAdd && item.value !== 'todo'
    },
    // 待办事项不超过64个字符
    handleValidateMtterName(row) {
      if (row.matterName && row.matterName.length > 64) {
        row.matterName = row.matterName.slice(0, 64)
        this.$message.error('待办事项不能超过64个字符')
      }
    },
    // 工作号不超过16个字符
    handleValidateOrderNo(row) {
      if (row.orderNo && row.orderNo.length > 16) {
        row.orderNo = row.orderNo.slice(0, 16)
        this.$message.error('工作号不能超过16个字符')
      }
    },
    handleInfo(row) {
      this.isJumpRouteFromPage = true
			this.handleToOrderDetail(row)
    },
    // 删除订单
    handleDelete(row, index) {
      this.callback('DeleteTodo', row, index)
    },
    handleEdit(row, index) {
      this.callback('Edit', row, index)
    },
    handleSave(row, index) {
      if (row.isAdd) this.callback('Create', row, index)
      if (row.isEdit) this.callback('EditSave', row, index)
    },
    handleCancel(row, index) {
      // 取消编辑
      this.callback('CancelEdit', row, index)
    },
    handleChangeStatus(val) {

    }
  }
}
</script>
<style lang="scss">
</style>
