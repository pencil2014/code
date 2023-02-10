<template>
	<div class="menu-template">
		<div class="components-container notice-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt">
								模板说明:
							</span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.tempName" placeholder="请输入模板说明"></el-input>
							<span class="filter-txt">
								所属系统：
							</span>
							<el-select @change="handleChange" clearable size="mini" v-model="queryForm.systemType">
								<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
							</el-select>
						</div>
					</div>
				</div>
				<div class="operation-btns-box">
					<el-button size="mini" @click="handleSearch" type="primary"> 搜索 </el-button>
					<el-button size="mini" @click="handleReset" plain>
						重置
					</el-button>
				</div>
			</div>
		</div>
		<div class="components-container notice-container ">
			<div class="filter-containe search-layout add-filter">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> 新增</el-button>
				</div>
			</div>
			<el-table header-row-class-name="notice-tb-header" class="notice-params-table" v-loading="loading" :data="paramsList" style="margin:16px 0px">
				<el-table-column align="center" prop="tempNo" label="模板编号"></el-table-column>
				<el-table-column align="center" prop="tempName" min-width="150px" label="模板说明" show-overflow-tooltip> </el-table-column>
				<el-table-column align="center" prop="msgTitle" show-overflow-tooltip="" label="模板标题"> </el-table-column>
				<el-table-column align="center" prop="systemType" min-width="100px" label="所属系统" show-overflow-tooltip="">
					<template slot-scope="scope">
						{{ scope.row.systemType | systemTypeFilter }}
					</template>
				</el-table-column>

				<el-table-column align="center" prop="row" label="操作" width="130">
					<template slot-scope="scope">
						<el-button @click="handleEdit(scope.row)" type="text" size="mini">编辑</el-button>
						<el-button class="delete-btn" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog class="notice-dialog" :title="title" :visible.sync="open" :lock-scroll="true" width="800px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item style="width:46%;display:inline-block;" v-if="title === '编辑消息模板'" label="模板编号" label-width="100px" prop="tempNo">
					<el-input disabled style="width:100%" size="mini" v-model="createItem.tempNo"></el-input>
				</el-form-item>
				<el-form-item style="width:46%;display:inline-block;" label="所属系统" label-width="100px" prop="systemType">
					<el-select style="width:100%" size="mini" v-model="createItem.systemType">
						<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模板名称" label-width="100px" prop="tempName">
					<el-input style="width:90%" size="mini" v-model="createItem.tempName"></el-input>
				</el-form-item>
				<el-form-item label="消息标题模板" label-width="100px" prop="msgTitle">
					<el-input id="msgTitle" @focus="setActiveTemplate('msgTitle')" type="textarea" rows="4" style="width:90%" size="mini" v-model="createItem.msgTitle"></el-input>
				</el-form-item>
				<el-form-item label="消息内容模板" label-width="100px" prop="msgContent">
					<el-input id="msgContent" @focus="setActiveTemplate('msgContent')" type="textarea" rows="4" style="width:90%" size="mini" v-model="createItem.msgContent"></el-input>
				</el-form-item>
				<el-form-item label="钉钉内容模板" label-width="100px" prop="msgContentDingTalk">
					<el-input id="msgContentDingTalk" @focus="setActiveTemplate('msgContentDingTalk')" type="textarea" rows="4" style="width:90%" size="mini" v-model="createItem.msgContentDingTalk"></el-input>
				</el-form-item>
				<el-form-item label="邮件内容模板" label-width="100px" prop="msgContentMail">
					<el-input id="msgContentMail" @focus="setActiveTemplate('msgContentMail')" type="textarea" rows="4" style="width:90%" size="mini" v-model="createItem.msgContentMail"></el-input>
				</el-form-item>
				<el-form-item label="短信内容模板" label-width="100px" prop="msgContentPhone">
					<el-input id="msgContentPhone" @focus="setActiveTemplate('msgContentPhone')" type="textarea" rows="4" style="width:90%" size="mini" v-model="createItem.msgContentPhone"></el-input>
				</el-form-item>
			</el-form>
			<div class="template-params">
				<div v-for="(params, key) in groupParams" :key="key" class="template-params-item">
					<div class="template-params-title">{{ key | systemTypeFilter }} (双击添加)</div>
					<div class="template-params-content">
						<span v-for="(item, index) in params" :key="index" @dblclick="addParams(item.paramKey)">{{ item.paramDesc }}</span>
					</div>
				</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')">确 认</el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { noticeTemplateList, noticeTemplateDelete, noticeTemplateEdit, noticeTemplateAdd, noticeParamGroups } from '@/api/msg'
import { getDictLabel } from '@/utils/tools'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
export default {
	name: 'NoticeParams',
	filters: {
		systemTypeFilter(val) {
			return getDictLabel('systemType', val.toLowerCase())
		}
	},
	data() {
		return {
			activeTemplate: '',
			groupParams: {},
			//弹框标题
			title: '',
			//弹框开关
			open: false,
			// 查询条件
			tableQuery: {
				descColumns: ['createdTime'],
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				paramCode: '',
				state: ''
			},
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0
				}
			},
			paramsList: [],
			sysGenCodeChecked: true,
			createItem: {
				tempNo: '',
				tempName: ' ',
				msgTitle: '',
				msgContent: '',
				msgContentMail: '',
				msgContentPhone: '',
				systemType: '',
				msgContentDingTalk: ''
			},
			loading: false,
			//附加费模板
			rules: {
				tempNo: [{ required: true, message: '模板编号不能为空', trigger: 'blur' }],
				tempName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
				msgTitle: [{ required: true, message: '消息标题模板不能为空', trigger: 'blur' }]
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.getGroupParams()
	},
	mounted() {
		this.getList()
	},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},
	methods: {
		handleChange() {
			this.$nextTick(() => {
				document.activeElement.blur()
			})
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				//触发的事件
				this.handleSearch()
			}
		},

		//获取分组参数
		getGroupParams() {
			noticeParamGroups(this.tableQuery).then(res => {
				this.groupParams = res.data
			})
		},
		//在光标处插入字符串
		insertInputTxt(id, insertTxt) {
			let elInput = document.getElementById(id)
			let startPos = elInput.selectionStart
			let endPos = elInput.selectionEnd
			if (startPos === undefined || endPos === undefined) return
			let txt = elInput.value
			// elInput.value = `${txt.substring(0, startPos)}{${insertTxt}}${txt.substring(endPos)}`
			this.createItem[this.activeTemplate] = `${txt.substring(0, startPos)}{${insertTxt}}${txt.substring(endPos)}`
			elInput.focus()
			elInput.selectionStart = startPos + insertTxt.length + 2
			elInput.selectionEnd = startPos + insertTxt.length + 2
		},
		setActiveTemplate(prop) {
			this.activeTemplate = prop
		},
		addParams(item) {
			this.insertInputTxt(this.activeTemplate, item)
		},
		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.paramCode = undefined
			this.queryForm.state = undefined
			this.handleSearch()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange() {
			this.getList()
		},
		handleChangeSystemGenCode(val) {
			this.createItem.sysGenCode = 'no'
			if (this.sysGenCodeChecked) {
				this.createItem.sysGenCode = 'yes'
				this.createItem.roleCode = ''
			}
		},
		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				tempNo: '',
				tempName: ' ',
				msgTitle: '',
				msgContent: '',
				msgContentMail: '',
				msgContentPhone: '',
				systemType: '',
				msgContentDingTalk: ''
			})
		},
		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增消息模板'
		},
		//菜单编辑
		handleEdit(row) {
			this.title = '编辑消息模板'
			for (var p in this.createItem) {
				this.createItem[p] = row[p]
			}

			if (this.createItem.systemType) {
				this.createItem.systemType = this.createItem.systemType.toLowerCase()
			}
			console.log('🚀 ~ this.createItem', this.createItem)
			this.open = true
		},

		//删除列表
		handleDelete(row) {
			this.$confirm('确定删除吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					noticeTemplateDelete({ tempNo: row.tempNo }).then(res => {
						this.$message.success('删除成功!')
						this.getList()
					})
				})
				.catch(() => {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			noticeTemplateList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.paramsList = res.data.list
				this.loading = false
			})
		},
		initQueryForm(isSearch) {
			let obj = this.queryForm
			let query = []

			Object.keys(obj).forEach(function(key) {
				if (obj[key]) {
					//默认的查询条件组装tableQuery参数
					let tempQuery = {}
					Object.assign(tempQuery, {
						column: key,
						type: 'like',
						value: obj[key]
					})
					query.push(tempQuery)
				}
			})
			if (isSearch) {
				this.searchBackup = query
			}
			this.tableQuery.query = this.searchBackup || []
		},
		// 取消按钮
		cancel() {
			this.open = false
		},
		//保存按钮操作
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (!valid) return false
				if (this.createItem.tempNo) {
					noticeTemplateEdit(this.createItem).then(res => {
						this.$message({ message: '编辑成功', type: 'success' })
						this.open = false
						this.getList()
					})
				} else {
					noticeTemplateAdd(this.createItem).then(res => {
						this.$message({ message: '新增成功', type: 'success' })
						this.open = false
						this.getList()
					})
				}
			})
		}
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	}
}
</script>
<style>
@import '../css/notice.css';
</style>
<style lang="scss" scoped>
.menu-template {
	margin: 10px;
	/deep/ .el-dialog__body {
		display: flex;
		.el-form {
			flex: 1;
		}
		.template-params {
			font-size: 12px;
			width: 220px;
			height: 550px;
			overflow-y: auto;
			.template-params-item {
				margin-bottom: 14px;
				.template-params-title {
					height: 28px;
				}
				.template-params-content {
					padding: 4px;
					height: 232px;
					width: 200px;
					border: 1px solid #ddd;
					border-radius: 4px;
					overflow: auto;
					span {
						display: inline-block;
						padding: 4px 8px;
						text-decoration: underline;
						cursor: pointer;
					}
				}
			}
		}
	}

	.notice-params-table {
		/deep/ .cell.el-tooltip {
			overflow: hidden;
		}
	}
	.filter-containe {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		font-size: 12px;
		color: #333;
		align-items: baseline;
		flex-wrap: wrap;
		.filter {
			display: flex;
			// flex: 1;
			flex-direction: row;
			justify-content: flex-start;
			flex-wrap: wrap;
		}

		.filter-item {
			display: inline-block;
			vertical-align: middle;
		}
	}

	.input-container-dialog {
		float: left;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		margin: 10px 0 20px;
		margin-right: 25px;

		span.filter-txt {
			min-width: 80px;
			text-align: right;
		}
	}
	.el-table th > .cell {
		color: #222222;
	}
	.el-tag {
		background-color: #fff;
		color: #4a4a4a;
		border-style: none;
	}
	.dialog-add {
		margin-top: 16px;
		.el-button {
			border: 1px dashed #dcdfe6;
		}
	}
	.input-width {
		width: 150px;
	}

	.el-input__prefix {
		line-height: 28px;
		color: #000000;
	}
	.el-input--prefix .el-input__inner {
		padding-left: 45px;
	}
}
.payment-advance {
	color: #fff;
	padding: 6px 16px;
	line-height: 150%;
}

.operation-btns-box {
	padding-left: 10px;
	margin-left: auto;
}
.parentWrap {
	margin-left: 12px;
	padding-bottom: 10px;
	.text {
		font-size: 14px;
	}
}
</style>
