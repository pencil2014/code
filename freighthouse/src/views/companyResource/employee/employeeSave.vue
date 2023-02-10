<template>
	<el-dialog class="finance-tab-page base-data" :title="title" :close-on-click-modal="false" :visible.sync="visible" width="880px" @close="dialogClose">
		<el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
			<h3 style="font-size:6px;margin-bottom:12px;">基本信息</h3>
			<el-row>
				<el-col :span="12">
					<el-form-item label="分公司/部门" label-width="100px" prop="deptCodes" :show-message="false">
						<el-cascader filterable size="mini" style="width:100%" :options="departmentList" v-model="createItem.deptCodes" @change="handleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger="click"></el-cascader>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="中文名" label-width="100px" prop="cname" :show-message="false">
						<el-input :disabled="rejoin" style="width:100%" size="mini" v-model="createItem.cname"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="英文名" label-width="100px" prop="ename" :show-message="false">
						<el-input style="width:100%" size="mini" v-model="createItem.ename"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="工号" label-width="100px" prop="employeeNo" :show-message="false">
						<el-input :disabled="rejoin" style="width:100%" size="mini" v-model="createItem.employeeNo"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="岗位" label-width="100px" prop="deptRoleList" :show-message="false">
						<el-select clearable filterable collapse-tags multiple style="width:100%" size="mini" v-model="createItem.deptRoleList">
							<el-option v-for="(o, key) in jobOptions" :key="key" :label="o.jobCname" :value="o.jobCode"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-form-item v-if="createItem.deptRoleList.includes('observer')" label="观察部门" label-width="100px" prop="observeDeptCodes" :show-message="false">
					<el-cascader
						filterable
						size="mini"
						style="width:100%"
						:options="departmentList"
						v-model="observeDeptCodes"
						@change="handleObserveChange"
						:props="observeCascaderProps"
						placeholder="请选择观察部门,可多选"
						change-on-select
						expandTrigger="click"
					></el-cascader>
					<!-- <el-input v-show="false" v-model="createItem.observeDeptCodes" size="mini"></el-input> -->
				</el-form-item>
			</el-row>
			<el-row>
				<el-form-item v-if="createItem.deptRoleList.includes('manager')" label="管理部门" label-width="100px" prop="managerDeptCodes" :show-message="false">
					<el-cascader
						filterable
						size="mini"
						style="width:100%"
						:options="departmentList"
						v-model="managerDeptCodes"
						@change="handleManagerChange"
						:props="observeCascaderProps"
						placeholder="请选择管理者部门,可多选"
						change-on-select
						expandTrigger="click"
					></el-cascader>
					<!-- <el-input v-show="false" v-model="createItem.managerDeptCodes" size="mini"></el-input> -->
				</el-form-item>
			</el-row>
			<el-row>
				<el-form-item v-if="createItem.deptRoleList.includes('sysline_manager')" label="管理航线" label-width="100px" prop="syslineGroupCodes" :show-message="false">
					<el-select clearable filterable  multiple  style="width:100%" size="mini"  v-model="createItem.syslineGroupCodes" >
						<el-option 
							placeholder="请选择管理航线,可多选"
							v-for="(o, key) in lineGroupList"
							:key="key"
							:label="o.sysLineGroupCname"
							:value="o.sysLineGroupCode">
						</el-option>
					</el-select>
				</el-form-item>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="手机号" label-width="100px" prop="mobileNo" >
						<el-input style="width:100%" size="mini" v-model="createItem.mobileNo" @change="mobileNoChange"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="邮箱" label-width="100px" prop="email" >
						<el-input style="width:100%" size="mini" v-model="createItem.email"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="入职时间" label-width="100px" prop="joinDate" :show-message="false">
						<el-date-picker size="mini" style="width:100%" v-model="createItem.joinDate" type="date" placeholder="选择入职时间"> </el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="工作状态" label-width="100px" prop="status" :show-message="false">
						<el-select style="width:100%" size="mini" v-model="createItem.status" disabled>
							<el-option v-for="(o, key) in dictMap['employeeStatus']" :key="key" :label="$t(`dict.employeeStatus.${o.value}`)" :value="o.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="财务代码" label-width="100px" prop="finCode" :show-message="false">
						<el-input style="width:100%" :disabled="rejoin && createItem.finCode != ''" size="mini" v-model="createItem.finCode"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="座机号" label-width="100px" prop="telephone" :show-message="false">
						<el-input style="width:100%" size="mini" v-model="createItem.telephone"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item label="性别" label-width="100px" prop="gender" :show-message="false">
						<el-select style="width:100%" size="mini" v-model="createItem.gender">
							<el-option v-for="(o, key) in dictMap['gender']" :key="key" :label="$t(`dict.gender.${o.value}`)" :value="o.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="是否公共员工" label-width="100px" prop="isPublic" :show-message="false">
						<el-select style="width:100%" size="mini" v-model="createItem.isPublic">
							<el-option v-for="(o, key) in dictMap['yesNo']" :key="key" :label="$t(`dict.yesNo.${o.value}`)" :value="o.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<h3 style="font-size:12px;margin:16px 0 6px;">系统账号</h3>
			<el-row>
				<el-col :span="12">
					<el-form-item label="系统登录账号" prop="" label-width="100px">
						<el-input :disabled="createItem.employeeId > 0 && loginAccount != ''" style="width:100%" size="mini" v-model="createItem.loginAccount"></el-input>
					</el-form-item>
				</el-col>
				<!-- <el-col :span="12"> 
                 <el-form-item label="登录密码" label-width="100px" prop="loginPass">
                  <el-input style="width:100%" size="mini" disabled v-model="loginPass" ></el-input>
                </el-form-item>
              </el-col> -->
			</el-row>
			<el-row>
				<el-col :span="24">
					<el-form-item label-width="100px" label="邮件签名" prop="emailSign" :show-message="false">
						<tinymce class="mail-sign-rich-text" :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.emailSign" :height="180" ref="emailSign" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" :class="createItem.employeeId ? 'update-primary-button' : ''" @click="submitForm('createItemForm')">
				{{ createItem.employeeId ? '修改' : '确定' }}
			</el-button>
			<el-button size="mini" @click="cancel">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { randomString } from '@/utils/tools'
import { departmentTreeList, employeeSave, employeeTileSelectList, employeeInfo, jobSelectList, getLineGroupList } from '@/api/companyResource'
import { sha256 } from 'js-sha256'
import Tinymce from '@/components/Tinymce'
export default {
	name: 'departSave',
	data() {
		return {
			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
			filterText: '',
			//弹框标题
			title: '',
			//重新入职
			rejoin: false,
			//弹框开关
			visible: false,
			dataFormLoading: false,
			departmentList: [],
			menuList: [],
			observeDeptCodes: [],
			managerDeptCodes: [],
			roleList: [],
			titleOptions: [], //员工职务列表
			jobOptions: [], //员工职务岗位
			lineGroupList: [], // 管理航线列表
			cascaderProps: {
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode'
			},
			observeCascaderProps: {
				multiple: true,
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode'
			},
			loginPass: '',
			createItem: {
				employeeId: '',
				cname: '',
				ename: '',
				employeeNo: '',
				finCode: '',
				deptCode: '',
				deptCodes: [],
				titleCode: '',
				mobileNo: '',
				telephone: '',
				email: '',
				deptRoleList: '',
				status: 'on',
				gender: '',
				joinDate: '',
				isPublic: 'no',
				loginAccount: '',
				loginPass: '',
				observeDeptCodes: [],
				managerDeptCodes: [],
				syslineGroupCodes: [],
				emailSign: ''
			},
			rules: {
				cname: [{ required: true, message: '中文名称不能为空', trigger: 'blur' }],

				employeeNo: [{ required: true, message: '员工工号不能为空', trigger: 'blur' }],
				mobileNo: [
					{ required: true, message: ' ', trigger: 'blur' },
					{
						required: false,
						message: '',
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value) {
								const emailrule = /^1[3-9]\d{9}$/
								if (!emailrule.test(value)) {
									callback(new Error('请输入有效手机号'))
								} else {
									callback()
								}
							} else {
								callback()
							}
						}
					}
				],
				loginAccount: [{ required: true, message: '系统登录账号不能为空', trigger: 'blur' }],
				email: [
					{ required: true, message: '员工邮箱不能为空', trigger: 'blur' },
					{
						validator: (rule, value, callback) => {
							if (/[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/i.test(value) == false) {
								callback(new Error('邮箱格式错误'))
							} else {
								callback()
							}
						},
						trigger: 'blur'
					}
				],
				deptCodes: [{ required: true, message: '在职部门不能为空', trigger: 'blur' }],
				deptRoleList: [{ required: true, message: '岗位不能为空', trigger: 'blur' }],
				joinDate: [{ required: true, message: '入职时间不能为空', trigger: 'blur' }],
				gender: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
				observeDeptCodes: [{ required: true, message: '观察部门不能为空', trigger: 'change' }],
				managerDeptCodes: [{ required: true, message: '管理部门不能为空', trigger: 'change' }],
				syslineGroupCodes: [{ required: true, message: '管理航线不能为空', trigger: 'change' }]
			},
			loading: false
		}
	},
	// table基础组件
	components: {
		Tinymce
	},
	created() {},
	mounted() {},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},

	methods: {
		//生成随机密码
		visibleOpen() {
			this.loginPass = randomString(8)
		},
		init(row, rejoin) {
			console.log('🚀 ~ row', row)
			console.log('🚀 ~ this.createItem', this.createItem)
			this.loginAccount = ''
			this.title = '新增员工'
			this.visible = true
			this.rejoin = false
			if (this.visible) {
				this.visibleOpen()
			}
			// 新增时允许编辑财务代码
			if (row) {
				if (rejoin) {
					this.title = '重新入职'
					this.rejoin = true
				} else {
					this.title = '编辑员工'
				}

				// 修改时不可以编辑财务代码
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				this.handlerParentCodes()
				//  if(this.createItem.deptRoleList.includes('observer')||this.createItem.deptRoleList.includes('manager')){
				this.getEmployeeInfo()
				//  }
				if (this.createItem.loginAccount) {
					this.loginPass = '********'
				}
			}
			this.loanBasicData()
		},
		getEmployeeInfo() {
			employeeInfo({ employeeId: this.createItem.employeeId }).then(res => {
				if (res.data) {
					let obserDeptCodes = res.data.observeDeptCodeList
					this.createItem.loginAccount = res.data.loginAccount
					this.loginAccount = res.data.loginAccount
					this.createItem.emailSign = res.data.emailSign
					this.createItem.observeDeptCodes = res.data.observeDeptCodeList
					this.createItem.syslineGroupCodes = (res.data.syslineGroupCodes || []).map(item => {
						return item.sysLineGroupCode
					})
					this.observeDeptCodes = []
					obserDeptCodes.map(item => {
						let obserCodes = []
						let codeLevel = item.length / 3
						for (var i = 0; i < codeLevel; i++) {
							obserCodes.push(item.substring(0, (i + 1) * 3))
						}
						this.observeDeptCodes.push(obserCodes)
					})
					let managerDeptCodes = res.data.managerDeptCodeList
					this.createItem.managerDeptCodes = res.data.managerDeptCodeList
					this.managerDeptCodes = []
					managerDeptCodes.map(item => {
						let obserCodes = []
						let codeLevel = item.length / 3
						for (var i = 0; i < codeLevel; i++) {
							obserCodes.push(item.substring(0, (i + 1) * 3))
						}
						this.managerDeptCodes.push(obserCodes)
					})
				}
			})
		},
		handlerParentCodes() {
			this.createItem.deptCodes = []
			let codeLevel = this.createItem.deptCode.length / 3
			for (var i = 0; i < codeLevel; i++) {
				this.createItem.deptCodes.push(this.createItem.deptCode.substring(0, (i + 1) * 3))
			}
		},
		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				employeeId: '',
				cname: '',
				ename: '',
				employeeNo: '',
				finCode: '',
				deptCode: '',
				deptCodes: [],
				observeDeptCodes: [],
				managerDeptCodes: [],
				syslineGroupCodes: [],
				titleCode: '',
				mobileNo: '',
				telephone: '',
				email: '',
				deptRoleList: [],
				status: 'on',
				gender: '',
				joinDate: '',
				isPublic: 'no',
				loginAccount: '',
				loginPass: '',
				emailSign: ''
			})

			this.loginPass = ''
			this.observeDeptCodes = []
			this.managerDeptCodes = []
			this.visible = false
			this.$emit('cancel')
		},
		loanBasicData() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList = this.getTreeData(res.data)
			})
			employeeTileSelectList({ state: 'valid' }).then(res => {
				this.titleOptions = res.data
			})
			jobSelectList().then(res => {
				this.jobOptions = res.data
			})
			getLineGroupList({pageSize:9999}).then(res=>{
				if(res.code === 0){
					if(res.data&&res.data.list){
						this.lineGroupList = res.data.list
					}
				}
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
		handleChange(value) {
			this.createItem.deptCode = value[value.length - 1]
		},
		handleObserveChange(value) {
			this.createItem.observeDeptCodes = []
			value.map(item => {
				this.createItem.observeDeptCodes.push(item[item.length - 1])
			})
		},

		handleManagerChange(value) {
			this.createItem.managerDeptCodes = []
			value.map(item => {
				this.createItem.managerDeptCodes.push(item[item.length - 1])
			})
		},
		// 取消按钮
		cancel() {
			this.visible = false
			this.$emit('cancel')
		},
		mobileNoChange(val) {
			if (this.title === '新增员工') {
				this.createItem.loginAccount = val
			}
		},
		//保存按钮操作
		submitForm(formName) {
			if (this.loginPass) {
				this.createItem.loginPassSha256 = sha256(this.loginPass)
			}
			if (this.rejoin) {
				this.createItem.status = 'on'
			}
			this.$refs[formName].validate(valid => {
				if (valid) {
					employeeSave(this.createItem).then(res => {
						this.$message({ message: '恭喜你，保存成功', type: 'success' })
						this.visible = false
						this.$emit('refreshDataList')
					})
				} else {
					return false
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
// components/Base组件
.base-data {
	/deep/.el-select .el-select__tags span {
		width: initial;
	}
	/deep/.el-select .el-select__tags span .el-tag--mini:nth-of-type(2) {
		width: initial;
	}
	/deep/.el-cascader__tags {
		left: -8px;
		.el-tag {
			margin-right: 12px;
		}
	}
}
.menu {
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
	.m-t-8 {
		margin-top: 8px;
	}
	.el-input__prefix {
		line-height: 28px;
		color: #000000;
	}
	.el-input--prefix .el-input__inner {
		padding-left: 45px;
	}
}

.el-cascader-panel .el-radio {
	z-index: 10;
	width: 99%;
	height: 99%;
	position: absolute;
	top: 10px;
	right: -12px;
}
.el-cascader-panel .el-radio__input {
	visibility: hidden;
}
.el-cascader-panel .el-cascader-node__postfix {
	top: 10px;
}

.base-data {
	.update-primary-button {
		background-color: #e9851f !important;
		border: 1px solid #e9851f;
	}
	.mail-sign-rich-text {
		/deep/.mce-btn-group:not(:first-child) {
			border: 0 !important;
		}
		/deep/.mce-container * {
			white-space: normal !important;
		}
	}
}


</style>
