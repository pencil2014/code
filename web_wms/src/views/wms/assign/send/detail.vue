<template>
	<div class="detail-wrap">
		<div class="detail-header">
			<div class="header-left">{{ $route.query.type === 'add' ? '新增' : $route.query.type === 'modify' ? '修改' : '' }}作业派工</div>
			<div class="header-right" v-if="!isDetail">
				<!-- <el-button @click="handleOn" size="mini" type="primary">完工</el-button> -->
				<el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button @click="handleCancel" size="mini">取消</el-button>
			</div>
      <div class="header-right" v-else>
				<el-button @click="handleCancel" size="mini">返回</el-button>
			</div>
		</div>
		<el-form ref="validForm" :show-message="false" :rules="rules" label-width="85px" :inline="true" :model="formInline">
			<div class="top-form">
				<el-form-item prop="warehouseId" label="仓库">
					<el-select filterable="" clearable="" @change="warehouseChange" :disabled="isDetail" size="mini" v-model="formInline.warehouseId" placeholder="">
						<el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="dispatchTime" label="派工时间">
					<el-date-picker size="mini" v-model="formInline.dispatchTime" type="datetime" placeholder="选择日期时间" :disabled="isDetail"> </el-date-picker>
				</el-form-item>
				<el-form-item prop="dispatchType" label="派工单类型">
					<el-select size="mini" v-model="formInline.dispatchType" placeholder="请选择" :disabled="isDetail">
						<el-option v-for="item in dictMap.wmsDispatchType" :key="item.key" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="formInline.dispatchType != 'outbound'" :rules="{ required: ['inbound'].includes(formInline.dispatchType), message: '请选择入库单', trigger: 'change' }" prop="inboundOrderNo" label="入库单">
					<el-select :disabled="isDetail" clearable="" filterable remote @change="inBoundChange" :remote-method="inBoundMethod" @visible-change="showInBound" size="mini" v-model="formInline.inboundOrderNo" placeholder="">
						<el-option v-for="item in inboundOrderList" :key="item.value" :label="item.inboundNo" :value="item.inboundNo"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="formInline.dispatchType != 'inbound'" :rules="{ required: ['outbound'].includes(formInline.dispatchType), message: '请选择出库单', trigger: 'change' }" prop="outboundOrderNo" label="出库单">
					<el-select :disabled="isDetail" clearable="" filterable remote @change="outBoundChange" :remote-method="outBoundMethod" @visible-change="showOutBound" size="mini" v-model="formInline.outboundOrderNo" placeholder="">
						<el-option v-for="item in outboundOrderList" :key="item.value" :label="item.outboundNo" :value="item.outboundNo"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="formInline.dispatchType != 'outbound'" prop="hasMarks" label="是否分唛">
					<el-select :disabled="isDetail" size="mini" v-model="formInline.hasMarks" placeholder="">
						<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="custName" label="客户名称">
					<el-input size="mini" placeholder="" v-model="formInline.custName" :disabled="true"> </el-input>
				</el-form-item>
				<el-form-item prop="workOrderNo" label="客户入仓单号">
					<el-input size="mini" placeholder="" v-model="formInline.workOrderNo" :disabled="true"> </el-input>
				</el-form-item>

				<el-form-item prop="workQuantity" label="数量">
					<el-input size="mini" placeholder="" v-model="formInline.workQuantity" :disabled="true"> </el-input>
				</el-form-item>
				<el-form-item prop="workVolume" label="体积(CBM)">
					<el-input size="mini" placeholder="" v-model="formInline.workVolume" :disabled="true"> </el-input>
				</el-form-item>
				<el-form-item prop="workWeight" label="重量(KGS)">
					<el-input size="mini" placeholder="" v-model="formInline.workWeight" :disabled="true"> </el-input>
				</el-form-item>
				<el-form-item prop="workTeamId" label="作业班组">
					<el-select @change="workTeamChange" filterable remote :remote-method="workTeamMethod" @visible-change="showWorkTeamMethod" size="mini" :disabled="isDetail" v-model="formInline.workTeamId" placeholder="">
						<el-option v-for="item in workTeamList" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="w100" prop="workRequirement" label="作业要求">
					<el-input maxlength="200" show-word-limit size="mini" type="textarea" :rows="2" placeholder="" v-model="formInline.workRequirement" :disabled="isDetail"> </el-input>
				</el-form-item>
			</div>
			<div class="table-wrap">
				<div class="table-title">
					<div class="title-left">作业人员</div>
					<div class="title-right">
						<span v-if="!isDetail" @click="handleAdd" class="add-btn">新增</span><span @click="handleFold" class="arrow-btn">{{ arrowText }} <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
					</div>
				</div>
				<div v-if="arrowDown" class="table-content">
					<el-table :header-cell-style="{ color: '#222222' }" :data="formInline.members" border="" style="width: 100%">
						<el-table-column align="center" width="320">
							<template slot="header"> <span style="color: #e63923">*</span>姓名 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'members.' + scope.$index + '.employeeId'" :rules="rules.employeeId">
									<el-select
										v-if="scope.row.isEdit"
										size="mini"
										v-model="scope.row.employeeId"
										placeholder="请输入"
                    :disabled="isDetail"
										@change="
											val => {
												memberChangeMethod(val, scope.row)
											}
										"
									>
										<el-option v-for="item in memberOptions" :key="item.value" :label="`${item.label}（${item.employeeTypeName}）`" :value="item.value"> </el-option>
									</el-select>
									<span v-else>{{ scope.row.employeeName }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" width="250">
							<template slot="header"> <span style="color: #e63923">*</span>人员类型 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'members.' + scope.$index + '.employeeType'" :rules="rules.employeeType">
									<span>{{ scope.row.employeeTypeName }}</span>
								</el-form-item>
							</template>
						</el-table-column>

						<el-table-column align="center">
							<template slot="header"> <span style="color: #e63923">*</span>计费方式</template>
							<template slot-scope="scope">
								<el-form-item :prop="'members.' + scope.$index + '.feeType'" :rules="rules.feeType">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.feeType" placeholder="选择" :disabled="isDetail">
										<el-option v-for="item in dictMap['wmsPerforBillingUnit']" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
									<span v-else>{{ dictMapObj['wmsPerforBillingUnit'][scope.row.feeType] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="remark" label="派工备注">
							<template slot-scope="scope">
								<el-input v-if="scope.row.isEdit" size="mini" placeholder="请输入" v-model="scope.row.remark" :disabled="isDetail"> </el-input>
								<span v-else>{{ scope.row.remark }}</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="操作" v-if="!isDetail">
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
import { outBoundQueryPageList, workTeamQueryPage, workDispatchAdd, workDispatchModify, workDispatchDetail, warehouseList, employeeList, workTeamDetail, queryWarehousePage, checkWorkDispatch, workDispatchComplete } from '@/api/wms'
import { queryPageList } from '@/api/wms/inBound.js'
import { mapGetters } from 'vuex'
export default {
	data() {
		return {
			memberOptions: [],
			statusOptions: [
				{ label: '是', value: 'yes' },
				{ label: '否', value: 'no' }
			],
			workTeamList: [],
			outboundOrderList: [],
			inboundOrderList: [],
			warehouseOptions: [],

			arrowText: '收起',
			arrowDown: true,
			rules: {
				warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
				dispatchTime: [{ required: true, message: '请选择派工时间', trigger: 'blur' }],
				dispatchType: [{ required: true, message: '请选择派工单类型', trigger: 'change' }],
				workTeamId: [{ required: true, message: '请选择作业班组', trigger: 'change' }],
				workRequirement: [{ required: true, message: '请输入作业要求', trigger: 'blur' }],
				hasMarks: [{ required: true, message: '请选择', trigger: 'change' }],
				feeType: [{ required: true, message: '请选择计费类型', trigger: 'change' }]
			},
			formInline: {
				warehouseId: '',
				warehouseCode: '',
				warehouseName: '',
				dispatchTime: '',
				dispatchType: '',
				inboundOrderId: '',
				inboundOrderNo: '',
				outboundOrderId: '',
				outboundOrderNo: '',
				workTeamId: '',
				workRequirement: '',
				workOrderNo: '',
				custName: '',
				workQuantity: '',
				workVolume: '',
				workWeight: '',
				hasMarks: '',
				members: []
			},
      curOutBoundObj: {}
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
		isDetail() {
			return this.$route.query.type === 'detail'
		}
	},
	watch: {},
	components: {},
	methods: {
		// 清空进出库信息
		clearInfo() {
			this.formInline.workOrderNo = ''
			this.formInline.workVolume = ''
			this.formInline.workWeight = ''
			this.formInline.workQuantity = ''
			this.formInline.custName = ''
		},
		// 选择班组
		workTeamChange(val) {
			val &&
				workTeamDetail({ workTeamId: val }).then(res => {
					this.memberOptions = res?.data?.members?.map(item => {
						item.employeeId = Number(item.employeeId)
						return { ...item, label: item.employeeName, value: item.employeeId }
					})
					this.formInline.members = res?.data?.members?.map(item => {
						item.employeeId = Number(item.employeeId)
						return { ...item, isEdit: true }
					})
				})
		},
		// 选择出库单
		outBoundChange(val) {
      if (val) {
        this.curOutBoundObj = this.outboundOrderList.find(item => item.outboundNo === val)
        this.formInline.outboundOrderId = this.curOutBoundObj?.outboundOrderId
        this.formInline.workOrderNo = this.curOutBoundObj?.workOrderNos
        this.formInline.workVolume = this.curOutBoundObj?.actualVolume
        this.formInline.workWeight = this.curOutBoundObj?.actualWeight
        this.formInline.workQuantity = this.curOutBoundObj?.actualQuantity ? this.curOutBoundObj?.actualQuantity : this.curOutBoundObj?.estimatedQuantity
        this.formInline.custName = this.curOutBoundObj?.custName
      } else {
        this.formInline.outboundOrderId = ''
        if (!this.formInline.inboundOrderId) this.clearInfo()
      }
		},
		// 选择入库单
		inBoundChange(val) {
      if (val) {
        let inBound = this.inboundOrderList.find(item => item.inboundNo === val)
        this.formInline.inboundOrderId = inBound?.inboundOrderId
        this.formInline.workOrderNo = inBound?.workOrderNo
        this.formInline.workVolume = inBound?.inventoryVolume
        this.formInline.workWeight = inBound?.inventoryWeight
        this.formInline.workQuantity = inBound?.actualQuantity ? inBound?.actualQuantity : inBound?.estimatedQuantity
        this.formInline.custName = inBound?.orderCustName
      } else {
        this.formInline.inboundOrderId = ''
        if (!this.formInline.outboundOrderId) this.clearInfo()
      }
		},
		// 作业班组列表
		workTeamMethod() {
      if (this.formInline.warehouseId) {
        workTeamQueryPage({
          currPage: 1,
          pageSize: 20,
          query: [
            {
              column: 'warehouseId',
              type: 'eq',
              value: this.formInline.warehouseId
            }
          ]
        }).then(res => {
          this.workTeamList = res?.data?.list?.map(item => {
            return { ...item, label: item.workTeamName, value: item.workTeamId }
          })
        })
      }
		},
    showWorkTeamMethod (v) {
      v && this.workTeamMethod()
    },
		// 出库单列表
		outBoundMethod(val) {
      if (this.formInline.warehouseId) {
        let query = [
          { column: 'outboundNo', type: 'like', value: val || '' },
          { column: 'inboundNo', type: 'like', value: this.formInline.inboundOrderNo || '' },
          { column: "wmsWarehouseId", type: "in", value: this.formInline.warehouseId || '' }
        ]
        if (['inbound', 'outbound'].includes(this.formInline.dispatchType)) {
          if (this.$route.query.type === 'add') {
            query.push({ column: 'outboundStatus', type: 'eq', value: 'created' })
          } else if (this.$route.query.type === 'edit') {
            query.push({ column: 'outboundStatus', type: 'in', value: "created,process" })
          }
        }
        outBoundQueryPageList({
          currPage: 1,
          pageSize: 20,
          query
        }).then(res => {
          this.outboundOrderList = res?.data?.list
        })
      }
		},
    // 出库单下拉框显示时回调
    showOutBound (show) {
      if (show && !this.formInline.warehouseId) {
        return this.$message.error("请选择仓库！")
      }
      this.outboundOrderList = []
      show && this.outBoundMethod()
    },
		// 入库单列表
		inBoundMethod(val) {
      if (this.formInline.warehouseId) {
        let query = [
          { column: 'inboundNo', type: 'like', value: val || '' },
          { column: "wmsWarehouseId", type: "in", value: this.formInline.warehouseId || '' }
        ]
        // 1. 新增派工，如果派工类型是出入库作业的，只能查询'created'的数据；如果是特殊作业和内部作业，能查所有状态单号；
        // 2. 修改派工，如果派工类型是出入库作业的，只能查询'created'、'process'状态的单号，如果是特殊作业和内部作业，能查所有状态单号；
        // 3. 派工详情，查询所有单号。
        if (['inbound', 'outbound'].includes(this.formInline.dispatchType)) {
          if (this.$route.query.type === 'add') {
            query.push({ column: 'inboundStatus', type: 'eq', value: 'created' })
          } else if (this.$route.query.type === 'edit') {
            query.push({ column: 'inboundStatus', type: 'in', value: "created,process" })
          }
        }
        queryPageList({
          currPage: 1,
          pageSize: 20,
          query
        }).then(res => {
          this.inboundOrderList = res?.data?.list
        })
      }
		},
    // 入库单下拉框显示时回调
    showInBound (show) {
      if (show && !this.formInline.warehouseId) {
        return this.$message.error("请选择仓库！")
      }
      this.inboundOrderList = []
      if (show) {
        if (!this.formInline.outboundOrderId) {
          this.inBoundMethod()
        } else {
          console.log(`this.curOutBoundObj`, this.curOutBoundObj);
          if (this.curOutBoundObj.inboundNos) {
            let inboundNoList = this.curOutBoundObj.inboundNos.split(',')
            let inboundIdList = this.curOutBoundObj.inboundOrderIds.split(',')
            inboundNoList.forEach((item, index) => {
              this.inboundOrderList.push({
                inboundNo: item,
                inboundOrderId: inboundIdList[index],
                workOrderNo: this.curOutBoundObj?.workOrderNos,
                inventoryVolume: this.curOutBoundObj?.actualVolume,
                inventoryWeight: this.curOutBoundObj?.actualWeight,
                actualQuantity: this.curOutBoundObj?.actualQuantity,
                estimatedQuantity: this.curOutBoundObj?.estimatedQuantity,
                orderCustName: this.curOutBoundObj?.custName
              })
            })
          }
        }
      }
    },
		// 选择仓库
		warehouseChange(val) {
      this.clearInfo()
      this.formInline.outboundOrderId = ''
			this.formInline.outboundOrderNo = ''
      this.formInline.inboundOrderId = ''
      this.formInline.inboundOrderNo = ''
			let house = this.warehouseOptions.find(item => item.wmsWarehouseId === val)
			this.formInline.warehouseCode = house?.warehouseCode
			this.formInline.warehouseName = house?.warehouseName
      this.formInline.workTeamId = ''
      this.formInline.members = []
      this.handleAdd()
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
		},
    // 修改
		handleModify(row) {
			row.isEdit = true
		},
		// 初始化数据
		initData() {
			//  修改
			if (['modify', 'detail'].includes(this.$route.query.type)) {
				this.getDetail()
			} else {
				// 重置校验
				this.$refs.validForm.resetFields()
				// 新增
				this.formInline = {
					warehouseId: '',
					warehouseCode: '',
					warehouseName: '',
					dispatchTime: '',
					dispatchType: '',
					inboundOrderId: '',
					inboundOrderNo: '',
					outboundOrderId: '',
					outboundOrderNo: '',
					workTeamId: '',
					workRequirement: '',
					workOrderNo: '',
					custName: '',
					workQuantity: '',
					workVolume: '',
					workWeight: '',
					hasMarks: '',
					members: [
						{
							employeeNo: '',
							employeeId: '',
							employeeType: '',
							employeeTypeName: '',
							employeeName: '',
							feeType: this.dictMap['wmsPerforBillingUnit'].length === 1 ? this.dictMap['wmsPerforBillingUnit'][0].value : '',
							remark: '',
							isEdit: true
						}
					]
				}
			}
		},
		// 提交
		handleSubmit() {
			this.$refs['validForm'].validate(valid => {
				if (valid) {
          let data = JSON.parse(JSON.stringify(this.formInline))
					if (!this.formInline.members.length) {
            this.$confirm('当前作业无理货员或其他作业人员信息，确认继续派工吗？ 点击确认时提交，点击取消时不提交。', '提示', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.submitApi(data)
            }).catch(() => { });
          } else {
            data.members = data.members.map(item => {
              return { ...item, workTeamId: this.formInline.workTeamId }
            })
            // 校验作业人员
            let ids = data.members.map(item => item.employeeId)
            let uniqIds = [...new Set(ids)]
            if (ids.length != uniqIds.length) return this.$message.error('作业人员不能重复')
            this.submitApi(data)
          }	
				} else {
					this.$message.error('请填写必填项!')
				}
			})
		},
    submitApi (data) {
      // delete data.workTeamId
      let fn = null
      if (this.$route.query.type === 'add') {
        fn = workDispatchAdd
      } else {
        fn = workDispatchModify
      }
      fn(data).then(() => {
        this.$router.push({ name: 'Send' })
        this.$message.success('提交成功!')
      })
    },
    // 完工
    handleOn () {
      let dispatchIds = [this.formInline.workDispatchId]
      checkWorkDispatch ({ dispatchIds }).then(({ code, data }) => {
        if (code === 0) {
          if (data.length) {
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              if (['tallyman_only'].includes(item.checkResult)) { //只有理货员
                return this.$confirm(`该作业派工只有理货员信息，无其他作业人员信息，确认完工吗？`, "提示", {
                  confirmButtonText: "确认",
                  cancelButtonText: "取消",
                  type: "warning"
                }).then(() => {
                  this.workDispatchCompleteApi(dispatchIds)
                }).catch((err) => {
                });
                // return this.$message.error(`当前${item.dispatchNo}的作业无理货员或无作业人员信息，请补充后再完工！`)
              }
              if (['tallyman_not_present'].includes(item.checkResult)) { //没有理货员
                return this.$message({
                  type: 'error',
                  message: `该作业派工无理货员信息，请补充后再完工！`,
                  showClose: true
                })
              }
              if (['nobody'].includes(item.checkResult)) { //没有理货员，没有作业人员
                return this.$message({
                  type: 'error',
                  message: `该作业派工既无理货员又无作业人员信息，请补充后再完工！`,
                  showClose: true
                })
              }
            }
          } else {
            this.workDispatchCompleteApi(dispatchIds)
          }
        }
      }).catch(() => {})
    },
    /**
     * @description: 调用完工接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-26 16:42:23
     */
    workDispatchCompleteApi (dispatchIds) {
      workDispatchComplete({ dispatchIds }).then(() => {
        this.$message.success('操作成功！')
        this.getDetail()
      })
    },
		// 选择成员
		memberChangeMethod(val, row) {
			let memberObj = this.memberOptions.find(item => item.employeeId === val)
			row.employeeNo = memberObj?.employeeNo
			row.employeeName = memberObj?.employeeName
			row.employeeType = memberObj?.employeeType
			row.employeeTypeName = memberObj?.employeeTypeName
		},
		// 获取详情
		getDetail() {
			workDispatchDetail({ dispatchId: this.$route.query.dispatchId }).then(res => {
				this.formInline = res?.data
        if (this.formInline.workTeamId) this.formInline.workTeamId = Number(this.formInline.workTeamId)
        workTeamDetail({ workTeamId: this.formInline.workTeamId }).then(res => {
					this.memberOptions = res?.data?.members?.map(item => {
						item.employeeId = Number(item.employeeId)
						return { ...item, label: item.employeeName, value: item.employeeId }
					})
				})
				this.formInline.members = res?.data?.members?.map(item => {
					item.employeeId = Number(item.employeeId)
					return { ...item, isEdit: false }
				})
        if (!['outbound'].includes(this.formInline.dispatchType)) {
          this.inBoundMethod(this.formInline.inboundOrderNo)
        }
        if (!['inbound'].includes(this.formInline.dispatchType)) {
          this.outBoundMethod(this.formInline.outboundOrderNo)
        }
        this.workTeamMethod()
			})
		},
		// 取消
		handleCancel() {
			this.$router.push({ name: 'Send' })
		},
		// 新增一行
		handleAdd() {
			this.formInline.members.push({
				employeeNo: '',
				employeeId: '',
				employeeType: '',
				employeeTypeName: '',
				employeeName: '',
				feeType: this.dictMap['wmsPerforBillingUnit'].length === 1 ? this.dictMap['wmsPerforBillingUnit'][0].value : '',
				remark: '',
				isEdit: true
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
  .el-button--mini {
    padding: 3px 7px;
  }
}
</style>
