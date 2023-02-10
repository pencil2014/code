<template>
	<el-dialog class="notice-sys-update" title="修改通知" :visible="true" :lock-scroll="true" :show-close="false" width="780px">
		<div class="notice-edit-message components-container">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<!-- <el-form-item :show-message="false" style="width:25%;display:inline-block;" label="消息类型" label-width="80px" prop="noticeType">
				<el-select @change="handleTypeChange" size="mini" v-model="createItem.noticeType">
					<el-option v-for="(o, key) in noticeTypeList" :key="key" :label="o.label" :value="o.value"> </el-option>
				</el-select>
			</el-form-item>
				<el-form-item :show-message="false" style="width:50%;display:inline-block;" label="所属系统" label-width="80px" prop="systemType">
					<el-select  style="width:100%;" size="mini" v-model="createItem.systemType">
						<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item :show-message="false" style="width:34%;display:inline-block;" label="通知部门选择" label-width="100px" prop="deptCodes">
				<el-cascader
					:disabled="createItem.noticeType === 'MSG_UPGRADE'"
					filterable
					size="mini"
					:options="departmentList"
					v-model="createItem.deptCodes"
					@change="handleChange"
					:props="cascaderProps"
					placeholder="请选择部门"
					change-on-select
					expandTrigger="click"
				></el-cascader>
			</el-form-item>

				<el-form-item style="width:50%;display:inline-block;" label="优先级" label-width="63px" prop="noticePriority">
					<el-select style="width:100%;" size="mini" v-model="createItem.noticePriority">
						<el-option v-for="(o, key) in noticePriorityList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item> -->

				<el-form-item :show-message="false" class="notice-title-wrap" prop="noticeTitle">
					<div class="notice-title"><span>*</span>消息标题</div>
					<el-input type="textarea" size="mini" v-model="createItem.noticeTitle"></el-input>
				</el-form-item>
				<el-form-item :show-message="false" class="msg-edior-form" prop="noticeContent">
					<div class="notice-title"><span>*</span>消息内容</div>
					<quill-editor class="msg-quill-edior" v-model="createItem.noticeContent" ref="myQuillEditor"> </quill-editor>
					<input type="file" hidden accept=".jpg,.png" ref="fileInput" @change="handleImage" />
				</el-form-item>
			</el-form>
			<div class="send-title-wrap">
				<div class="send-msg-btn">
					<el-button size="mini" type="primary" @click="submitForm"> 确 认 </el-button>
					<el-button size="mini" @click="cancel">取 消</el-button>
				</div>
			</div>
		</div>
	</el-dialog>
</template>
<script>
import { noticeWebsiteUpdate } from '@/api/msg'
import { employeeSelectlist } from '@/api/companyResource'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { departmentTreeList } from '@/api/companyResource'
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
	name: 'NoticeParams',
	props: {
		detail: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			employeeOptions: [],
			noticeTypeList: [
				{ label: '系统通知', value: 'MSG_SYS' },
				{ label: '业务通知', value: 'MSG' },
				{ label: '业务待办', value: 'TODO' },
				{ label: '系统更新', value: 'MSG_UPGRADE' }
			],
			noticePriorityList: [
				{ label: '紧急', value: 0 },
				{ label: '一般', value: 1 },
				{ label: '低', value: 2 }
			],
			cascaderProps: {
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode'
			},
			departmentList: [],
			// 查询条件
			tableQuery: {
				descColumns: ['createdTime'],
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},

			createItem: {
				oid: '',
				noticeType: '',
				noticeTitle: '',
				noticeContent: '',
				deptCode: '',
				deptCodes: [],
				noticeEmployeeId: '',
				noticePriority: '',
				systemType: ''
			},
			//附加费模板
			rules: {
				noticeTitle: [{ required: true, message: '消息标题不能为空', trigger: 'blur' }],
				noticeContent: [{ required: true, message: '消息内容不能为空', trigger: 'blur' }],
				noticeType: [{ required: true, message: '消息类型不能为空', trigger: 'change' }],
				deptCodes: [{ required: true, message: '通知部门不能为空', trigger: 'change' }],
				systemType: [{ required: true, message: '所属系统不能为空', trigger: 'change' }]
			}
		}
	},
	// table基础组件
	components: {
		Pagination,
		quillEditor
	},
	created() {
		this.createItem = JSON.parse(JSON.stringify(this.detail))
		this.createItem.systemType && (this.createItem.systemType = this.createItem.systemType.toLowerCase())
	},

	mounted() {
		this.loadBasicData()
		if (this.$refs.myQuillEditor) {
			this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', this.imgHandler)
		}
	},
	computed: {
		...mapGetters(['dictMap'])
	},
	methods: {
		handleTypeChange(val) {
			console.log('🚀 ~ val', val)
			if (val === 'MSG_UPGRADE') {
				this.createItem.deptCodes = ['000']
				this.createItem.deptCode = '000'
				this.createItem.systemType = 'sys'
			}
		},
		imgHandler(state) {
			if (state) {
				//触发input的单击
				this.$refs.fileInput.click()
			}
		},
		handleImage(e) {
			const files = Array.prototype.slice.call(e.target.files)
			if (!files) {
				return
			}
			let form = new FormData()
			form.append('file', files[0])
			this.$store
				.dispatch('user/import', {
					uri: '/base/webapi/file/upload',
					params: form
				})
				.then(res => {
					//这里设置为空是为了连续上传同张图可以触发change事件
					this.$refs.fileInput.value = ''
					if (res.status === 200) {
						let selection = this.$refs.myQuillEditor.quill.getSelection()
						//这里就是返回的图片地址，如果接口返回的不是可以访问的地址，要自己拼接
						let imgUrl = res.data.data.filePath
						//获取quill的光标，插入图片
						this.$refs.myQuillEditor.quill.insertEmbed(selection != null ? selection.index : 0, 'image', location.origin + imgUrl)
						//插入完成后，光标往后移动一位
						this.$refs.myQuillEditor.quill.setSelection(selection.index + 1)
					}
				})
		},

		getEmployeeList(queryString) {
			//  let addSysUserFlag=this.action==='edit'?"":"true"
			employeeSelectlist({ name: queryString, addSysUserFlag: true }).then(res => {
				this.employeeOptions = res.data
			})
		},
		handleChange(value) {
			console.log('🚀 ~ value', value)
			this.createItem.deptCode = value[value.length - 1]
		},
		loadBasicData() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList = this.getTreeData(res.data)
			})
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			for (let i = 0; i < data.length; i++) {
				if (!data[i].childList.length) {
					// children若为空数组，则将children设为undefined
					data[i].childList = undefined
				} else {
					this.getTreeData(data[i].childList)
				}
			}
			return data
		},
		// 取消按钮
		cancel() {
			Object.assign(this.createItem, {
				deptCode: '',
				deptCodes: []
			})
			this.$emit('cancel')
		},
		//保存按钮操作
		submitForm() {
			this.$refs.createItemForm.validate(valid => {
				if (valid) {
					noticeWebsiteUpdate(this.createItem).then(res => {
						this.$message.success('修改成功!')
						this.$emit('cancel')
						// this.$refs.createItemForm.resetFields()
					})
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.notice-edit-message {
	padding: 0;
	/deep/ .el-form-item__label {
		color: #222;
	}
	.notice-title {
		padding: 0 10px;
		color: #222;
		font-size: 12px;
		background: #e9e9e9;
		span {
			color: #f00;
		}
	}
	.send-title-wrap {
		display: flex;
		flex-direction: row-reverse;
		padding: 10px 10px 0;
	}
	/deep/.el-textarea__inner {
		border-radius: 0px;
	}

	/deep/ .el-form-item {
		margin-bottom: 4px;
	}
	.notice-title-wrap {
		margin-bottom: 0px;
	}
	/deep/ .el-form-item__content,
	/deep/ .el-form-item__label {
		line-height: 30px !important;
	}
	.msg-edior-form {
		height: 400px;

		.msg-quill-edior {
			height: 300px;
			/deep/ .ql-toolbar,
			/deep/ .ql-container {
				border-color: #dcdfe6;
			}
		}
	}

	.send-msg-title {
		color: #222222;
		height: 24px;
		font-size: 14px;
		font-weight: 700;
	}
	/deep/ .el-form {
		padding: 10px;
	}
	.send-msg-btn {
		.el-button--mini {
			padding: 3px 6px;
		}
	}
}
</style>
