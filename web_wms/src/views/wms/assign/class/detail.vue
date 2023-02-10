<template>
	<div class="detail-wrap">
		<div class="detail-header">
			<div class="header-left">{{ $route.query.type === 'add' ? '新增' : $route.query.type === 'modify' ? '修改' : '' }}作业班组</div>
			<div class="header-right">
				<el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button @click="handleCancel" size="mini">取消</el-button>
			</div>
		</div>
		<el-form ref="validForm" :show-message="false" :rules="rules" label-width="85px" :inline="true" :model="formInline">
			<div class="top-form">
				<el-form-item prop="warehouseId" label="仓库">
					<el-select filterable="" clearable="" size="mini" v-model="formInline.warehouseId" placeholder="请选择">
						<el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="workTeamName" label="班组名称">
					<el-input maxlength="30" size="mini" placeholder="请输入" v-model="formInline.workTeamName"> </el-input>
				</el-form-item>
				<el-form-item prop="enabled" label="状态">
					<el-select size="mini" v-model="formInline.enabled" placeholder="请选择">
						<el-option v-for="item in dictMap.openOrClose" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
			</div>
			<div class="table-wrap">
				<div class="table-title">
					<div class="title-left">作业人员明细</div>
					<div class="title-right">
						<span @click="handleAdd" class="add-btn">新增</span><span @click="handleFold" class="arrow-btn">{{ arrowText }} <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
					</div>
				</div>
				<div v-if="arrowDown" class="table-content">
					<el-table :header-cell-style="{ color: '#222222' }" :data="formInline.members" border="" style="width: 100%">
						<el-table-column align="center" width="200">
							<template slot="header"> <span style="color: #e63923">*</span>姓名 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'members.' + scope.$index + '.employeeId'" :rules="rules.employeeId">
									<el-select
										v-if="scope.row.isEdit"
										size="mini"
										v-model="scope.row.employeeId"
										filterable
										remote
										reserve-keyword
										placeholder="请输入"
										@change="
											val => {
												memberChangeMethod(val, scope.row)
											}
										"
										:remote-method="
											val => {
												memberMethod(val, scope.row)
											}
										"
                    @visible-change="show => show && memberMethod('', scope.row)"
									>
										<el-option v-for="item in scope.row.memberOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
									<span v-else>{{ scope.row.employeeName }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" width="150">
							<template slot="header"> 人员类型 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'members.' + scope.$index + '.employeeType'" :rules="rules.employeeType">
									<!-- <el-select
										@change="
											val => {
												employeeTypeChange(val, scope.row)
											}
										"
										v-if="scope.row.isEdit"
										size="mini"
										v-model="scope.row.employeeType"
										placeholder="请输入"
									>
										<el-option v-for="item in scope.row.typeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select> -->
									<span>{{ dictMapObj['warehouseEmployeeJobType'][scope.row.employeeType] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="mobileNo" label="手机号"> </el-table-column>
						<el-table-column align="center" prop="joinDate" label="入职日期"> </el-table-column>
						<el-table-column align="center" prop="deptName" label="部门"> </el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope"
								><span v-if="scope.row.isEdit" @click="scope.row.isEdit = !scope.row.isEdit" class="save-btn">保存</span><span v-else @click="handleModify(scope.row)" class="modify-btn">修改</span
								><span @click="handleDelete(scope.$index)" class="delete-btn">删除</span>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</el-form>
	</div>
</template>
<script>
import { workTeamDetail, workTeamModify, workTeamAdd, warehouseList, warehouseEmployee, queryWarehousePage } from '@/api/wms'
import { mapGetters, mapState } from 'vuex'
export default {
	data() {
		return {
			warehouseOptions: [],
			arrowText: '收起',
			arrowDown: true,
			rules: {
				warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
				workTeamName: [{ required: true, message: '请输入班组名称', trigger: 'blur' }],
				enabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
				employeeId: [{ required: true, message: '请选择姓名', trigger: 'change' }],
				// employeeType: [{ required: true, message: '请选择人员类型', trigger: 'change' }]
			},
			formInline: {
				warehouseId: '',
				workTeamName: '',
				enabled: 'yes',
				members: []
			}
		}
	},
	created() {
		this.getWarehouseOptions()
	},
	activated() {
		this.initData()
	},
	mounted() {},
	computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
  },
	watch: {},
	components: {},
	methods: {
		handleModify(row) {
			row.isEdit = true
			this.memberMethod(row.employeeName, row)
		},
		// 选择员工类型
		employeeTypeChange(val, row) {
			let type = row.typeOptions.find(item => item.value === val)
			row.employeeTypeName = type?.label
		},
		// 初始化数据
		initData() {
			//  修改
			if (['modify'].includes(this.$route.query.type)) {
				this.getDetail()
			} else {
				// 重置校验
				this.$refs.validForm.resetFields()
				// 新增
				this.formInline = {
					warehouseId: '',
					workTeamName: '',
					enabled: 'yes',
					members: [
						{
							employeeNo: '',
							employeeId: '',
							employeeType: '',
							employeeTypeName: '',
							joinDate: '',
							employeeName: '',
							mobileNo: '',
							deptName: '',
							isEdit: true,
							memberOptions: [],
							typeOptions: []
						}
					]
				}
			}
		},
		// 提交
		handleSubmit() {
			this.$refs['validForm'].validate(valid => {
				if (valid) {
					// 清除下拉数据源
					this.formInline.members.map(item => {
						delete item.memberOptions
						delete item.typeOptions
					})
					let data = JSON.parse(JSON.stringify(this.formInline))
					let fn = null
					if (this.$route.query.type === 'add') {
						fn = workTeamAdd
					} else {
						fn = workTeamModify
					}
					fn(data).then(() => {
						this.$router.push({ name: 'Class' })
						this.$message.success('提交成功!')
					})
				} else {
					this.$message.error('请填写必填项!')
				}
			})
		},
		// 选择成员
		memberChangeMethod(val, row) {
			let memberObj = row.memberOptions.find(item => item.employeeId === val)
			row.employeeNo = memberObj?.employeeNo
			row.mobileNo = memberObj?.mobilePhone
			row.employeeName = memberObj?.employeeName
			row.deptName = memberObj?.deptName
			row.joinDate = memberObj?.entryDate
			row.employeeType = memberObj?.jobType
      row.employeeTypeName = memberObj?.jobTypeName
			// row.typeOptions = memberObj?.jobDefineList.map(item => {
			// 	return { ...item, label: item.jobCname, value: item.jobCode }
			// })
			// // 如果只有一个 默认选中
			// if (row.typeOptions.length === 1) {
			// 	row.employeeType = row.typeOptions[0].value
			// 	row.employeeTypeName = row.typeOptions[0].label
			// }
		},
		// 员工信息
		memberMethod(str, row) {
      if (this.formInline.warehouseId)  {
        let query = [
          { column: 'employeeName', type: 'in', value: str || '' },
          { column: 'warehouseId', type: 'eq', value: this.formInline.warehouseId || '' }
        ]
        let data = {
          currPage: 1,
          pageSize: 20,
          query
        }
        warehouseEmployee(data).then(res => {
          row.memberOptions = (res.data.list || []).map(item => {
            return { ...item, label: item.employeeName, value: item.employeeId }
          })
        })
      }
		},
		// 仓库列表
		getWarehouseOptions() {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "employeeId",
            type: "eq",
            value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
          },
          {
            column: "warehouseName",
            type: "like",
            value: ''
          }
        ]
      }
      queryWarehousePage(data)
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
			// 	this.warehouseOptions = res.data.map(item => {
			// 		return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
			// 	})
			// })
		},
		// 获取详情
		getDetail() {
			workTeamDetail({ workTeamId: this.$route.query.workTeamId }).then(res => {
				console.log('🚀 ~ res', res)
				this.formInline = res?.data
				this.formInline.members = res?.data?.members?.map(item => {
					item.employeeId = Number(item.employeeId)
					return { ...item, isEdit: false, memberOptions: [{ label: item.employeeName, value: item.employeeId }], typeOptions: [{ label: item.employeeTypeName, value: item.employeeType }] }
				})
			})
		},
		// 取消
		handleCancel() {
			this.$router.push({ name: 'Class' })
		},
		// 新增一行
		handleAdd() {
			this.formInline.members.push({
				employeeNo: '',
				employeeId: '',
				employeeType: '',
				employeeTypeName: '',
				joinDate: '',
				employeeName: '',
				mobileNo: '',
				deptName: '',
				isEdit: true,
				memberOptions: [],
				typeOptions: []
			})
		},
		// 删除一行
		handleDelete(index) {
			console.log('🚀 ~ index', index)
			this.formInline.members.splice(index, 1)
		},
		// 点击收起
		handleFold() {
			this.arrowDown = !this.arrowDown
			this.arrowText = this.arrowDown ? '收起' : '展开'
		}
	}
}
</script>
<style lang="scss">
.detail-wrap {
	min-height: calc(100vh - 62px);
	background: #ffffff;
	.table-wrap {
		margin: 0 16px;
		border: 1px solid #d9d9d9;
		.table-content {
			padding: 16px;
			span {
				font-size: 12px;
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
	.top-form {
		padding: 24px 0;
		.el-form-item {
			&.w100 {
				width: calc(100% - 20px);
			}
			width: calc((100% - 40px) / 3);
			.el-form-item__content {
				width: calc(100% - 85px);
				.el-select,
				.el-date-editor--datetime {
					width: 100%;
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
