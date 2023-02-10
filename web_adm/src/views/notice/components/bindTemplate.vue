<template>
	<div class="menu">
		<el-dialog class="notice-dialog" title="事件消息模板绑定" :visible.sync="showBind" :lock-scroll="true" width="800px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item style="width:45%;display:inline-block;" label="消息类型" label-width="125px" prop="noticeType">
					<el-select style="width:90%" size="mini" v-model="createItem.noticeType">
						<el-option v-for="(o, key) in dictMap['msgNoticeType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="优先级" label-width="90px" prop="noticePriority">
					<el-select style="width:80%" size="mini" v-model="createItem.noticePriority">
						<el-option v-for="(o, key) in noticePriorityList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="所属系统" label-width="125px" prop="systemType">
					<el-select style="width:90%" size="mini" v-model="createItem.systemType">
						<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="邮箱字段名" label-width="90px" prop="emailField">
					<el-input style="width:80%" size="mini" v-model="createItem.emailField"></el-input>
				</el-form-item>
				<el-form-item label="模板编号" label-width="125px" prop="templateNo">
					<el-select filterable style="width:80%" size="mini" v-model="createItem.templateNo">
						<el-option v-for="(o, key) in noticeTemplateList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="触发消息发送事件" label-width="125px" prop="eventCode">
					<el-select filterable style="width:80%" size="mini" v-model="createItem.eventCode">
						<el-option v-for="(o, key) in noticeEventsList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="消息完结事件代码" label-width="125px" prop="eventCloseCode">
					<el-select class="muti-select-input" multiple filterable style="width:80%" size="mini" v-model="createItem.eventCloseCode">
						<el-option v-for="(o, key) in noticeEventsList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="接收人字段名" label-width="125px" prop="employeeIdField">
					<el-input style="width:80%" size="mini" v-model="createItem.employeeIdField"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')">确 认</el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { noticeTriggerList, noticeTemplateList, noticeEventsList, noticeTriggerDelete, noticeTriggerEdit, noticeTriggerAdd } from '@/api/msg'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { getDictLabel } from '@/utils/tools'
export default {
	name: 'BindTemplate',

	props: ['showBind', 'createItem'],
	data() {
		return {
			noticeTemplateList: [],
			noticeEventsList: [],
			noticePriorityList: [
				{ label: '紧急', value: 0 },
				{ label: '一般', value: 1 },
				{ label: '低', value: 2 }
			],

			// 查询条件
			tableQuery: {
				descColumns: ['createdTime'],
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 1000
			},
			//附加费模板
			rules: {
				templateNo: [{ required: true, message: '模板编号不能为空', trigger: 'blur' }],
				eventCode: [{ required: true, message: '触发消息发送事件不能为空', trigger: 'blur' }],
				// eventCloseCode: [{ required: true, message: '消息完结事件代码', trigger: 'blur' }],
				employeeIdField: [{ required: true, message: '接收人字段名', trigger: 'blur' }]
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {
		//模板下拉框
		noticeTemplateList(this.tableQuery).then(res => {
			this.noticeTemplateList = res.data.list.map(item => {
				return { label: `${item.tempNo} ( ${item.tempName} )`, value: item.tempNo }
			})
		})
		//事件下拉框
		noticeEventsList(this.tableQuery).then(res => {
			this.noticeEventsList = res.data.list.map(item => {
				return { label: item.eventCode, value: item.eventCode }
			})
		})
	},
	mounted() {},

	computed: {
		...mapGetters(['dictMap'])
	},
	methods: {
		//清空数据
		dialogClose() {
			this.$emit('close')
		},

		// 取消按钮
		cancel() {
			this.$emit('close')
		},
		//保存按钮操作
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (!valid) return false
				let copyCreateItem = JSON.parse(JSON.stringify(this.createItem))
				copyCreateItem.eventCloseCode = copyCreateItem.eventCloseCode.toString()
				if (copyCreateItem.oid) {
					noticeTriggerEdit(copyCreateItem).then(res => {
						this.$message({ message: '编辑成功', type: 'success' })
						this.$emit('submit')
					})
				} else {
					delete copyCreateItem.oid
					noticeTriggerAdd(copyCreateItem).then(res => {
						this.$message({ message: '新增成功', type: 'success' })
						this.$emit('submit')
					})
				}
			})
		}
	}
}
</script>
<style>
@import '../css/notice.css';
</style>
<style lang="scss" scoped>
.menu {
	// margin: 10px;
}
</style>
