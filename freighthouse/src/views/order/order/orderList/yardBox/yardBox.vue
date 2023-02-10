<template>
	<div class="edit-container order-book yardBox fullWrap">
    <div class="edit-row">
			<!-- 报关信息  -->
      <DefaultTableComp ref="defaultTableComp" class="agent-table mt10" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" id="tableCont">
        <template>
          <span>装箱状态：</span>
          <el-select v-model="yardBoxStatus" @change="changeStatus" placeholder="请选择装箱状态" size="mini" style="width: 120px;" :disabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit">
            <el-option v-for="(item, index) in yardBoxStatusOptions" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
          <!-- <el-button class="ml10" type="default" size="mini" :disabled="isBd"> 输出 </el-button> -->
        </template>
      </DefaultTableComp>
      <!-- 报关详情 -->
      <YardDetail v-if="showDetail" :detailData="detailData" :isDisabledEdit="isDisabledEdit" :saveBarFixed="saveBarFixed" :isOpTruckAndOpTip="isOpTruckAndOpTip" :isFinishTip="isFinishTip" :statusTip="statusTip" @callBack="detailCallBack" />
    </div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { handleData } from '../../js/handleData'
import { yardBoxList, yardBoxDetail, yardBoxSave, deleteYardBox, updateStatusYardBox } from '@/api/order/list'
import { deleteAlert, getDictLabel, getDictMap, getServiceCode } from '@/utils/tools'
import DefaultTableComp from '../../components/defaultTableComp'
import YardDetail from './components/yardDetail'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			tableInfo: {
				title: '堆场信息',
				titleBtnList: [{ label: '新增堆场', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ boxId }) {
						return boxId ? true : false
					}
				},
				columns: handleData.yardBoxColumn, //  表格显示的表头
				list: [],
				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row)
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},
						{
							label: '删除',
							type: 'text',
							btnClassName: 'red',
							show:true,
							disabled: (item, row) => {
								console.log(row)
								if (this.isBd || isDisabledEdit) {
									return true
								} else {
									return false
								}
							},
							action: 'Delete'
						}
					]
				},

				// 操作提示
				tips: {
					text: '',
					show: false
				},

				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			showDetail: false,
			detailData: {},
			yardBoxStatus: '',
			selectedCheckbox: '', // 表格选中列
			yardBoxStatusOptions: getDictMap('yardBoxStatus') || [],
			routeName: 'Warehouse',
			activityKey: '',
			serviceCode: 'pol_warehouse',
			detailInfo: {}
		}
	},
	created() {
		this.init()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL);
			window.addEventListener('popstate', this.browserBack, false);
		}
	},
	destroyed(){
  	window.removeEventListener('popstate', this.browserBack, false);
	},
	computed: {
	 	...mapState({
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac'
			this.$set(this.tableConfig.operationBtns.data[1], 'disabled', false)
			// if(isBd || this.isJoint || this.isFinish) {
			// 	this.$set(this.tableInfo.titleBtnList[0], 'hide', true)
			// 	this.$set(this.tableConfig.operationBtns.data[1], 'disabled', true)
			// } else {
			// 	this.$set(this.tableInfo.titleBtnList[0], 'hide', false)
			// 	this.$set(this.tableConfig.operationBtns.data[1], 'disabled', false)
			// }
			return isBd || this.isJoint || this.isFinish
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isFinish() {
      let { serviceInfoList } = this.detailInfo
			let findItem = serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isJoint() {
			let { serviceInfoList } = this.detailInfo
      let serviceInfo = serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let isJoint = serviceInfo && serviceInfo.isJoint === 'y' ? true : false
			return isJoint
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		statusTip() {
			// 放开已关账、已完成的限制
			// ['complete','cancel'].includes(this.detailInfo.orderStatus) || this.detailInfo.finCloseStatus === 'yes'
			if (['cancel'].includes(this.detailInfo.orderStatus) || this.detailInfo.finCloseStatus === 'yes') {
				return '订单状态为已取消、已完成，或是已关账，不允许操作'
			}
		},
		isOpTruckAndOpTip() {
			if (!(this.isOpTruck || this.isOp)) {
				return '非该单拖报操作人员、仓储操作或是操作人员，不允许操作'
			}
		}
	},
	props: {
    tabMenus: {
			type: Array,
			default: () => []
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		}
  },
	components: {
		DefaultTableComp,
		YardDetail
	},
	watch: {
		orderInfo: {
			handler(newVal, oldVal) {
				this.detailInfo = newVal
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// 获取so列表
		init() {
			this.getList()
			this.tableConfig.operationBtns.data.map(item => {
				item.action === 'Delete' && Object.assign(item, {
					disabled: this.isBd || this.isDisabledEdit ? true : false,
					tipContent: this.isOpTruckAndOpTip || this.isFinishTip || this.statusTip || this.isJointTip
				})
			})
			this.tableInfo.titleBtnList = this.tableInfo.titleBtnList.map(item => {
				return Object.assign(item, {
					disabled: this.isBd || this.isDisabledEdit ? true : false,
					tipContent: this.isOpTruckAndOpTip || this.isFinishTip || this.statusTip || this.isJointTip
				})
			})
		},
		getList() {
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			yardBoxList(data).then(res => {
				res.data.map(item => {
					Object.assign(item, item.chargeEmployee, { status_cn: getDictLabel('yardBoxStatus', item.status) })
				})
				this.tableConfig.list = [...res.data]
			})
		},
		// 修改堆场信息状态
		changeStatus(value) {
			if (this.$refs.defaultTableComp.selectedCheckbox.length > 0) {
				this.$confirm('是否确认修改状态?', '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						let boxIds = this.$refs.defaultTableComp.selectedCheckbox.map(res => res.boxId)
						return updateStatusYardBox({
							boxIds: boxIds,
							status: value,
							orderNo: this.oQuery.orderNo,
							jointNo: this.oQuery.jointNo
						})
					})
					.then(response => {
						this.$message({
							type: 'success',
							message: '状态修改成功！',
							duration: 1000,
							onClose: () => {
								this.yardBoxStatus = ''
								this.getList()
							}
						})
					})
					.catch(err => {
						this.yardBoxStatus = ''
					})
			} else {
				this.yardBoxStatus = ''
				this.$message.error('请选择堆场信息！')
			}
		},
		// 堆场详情
		handleInfo(data) {
			yardBoxDetail({ boxId: data.boxId, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.detailData = res.data
				this.showDetail = true
			})
		},
		// 堆场删除
		handleDelete(data) {
			deleteAlert(this, deleteYardBox, { boxId: data.boxId, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			this.showDetail = false
			this.getList()
		},
		// table 回调函数 新增委托、委托完成
		tableClick(type) {
			if (type == 'add') {
				this.detailData = {}
				this.showDetail = true
			}
		},

		// 堆场信息详情回调函数
		detailCallBack(data) {
			if (data.type == 'cancel') {
				this.showDetail = false
			} else if (data.type == 'save') {
				this.handleSave(data)
			}
		},

		// 保存
		handleSave(data) {
			if (data.type == 'save') {
				data.jointNo = this.oQuery.jointNo
				data.orderNo = this.oQuery.orderNo
				yardBoxSave(data).then(res => {
					this.showDetail = false
					this.getList()
					this.$message({
						type: 'success',
						message: '保存成功',
						onClose: () => {}
					})
				})
			} else {
				this.showDetail = false
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
.yardBox {
	.small-tit .icon {
		vertical-align: text-top;
		margin-right: 5px;
		width: 14px;
	}
	.agent {
		margin-top: 0;
		// padding-top: 15px;
	}
	.agent{
		.tips-abs{
			top: -34px;
		}
	}
  #tableCont {
    margin-top: 15px !important;
    .row-tit {
      margin-top: 3px !important;
    }
		.operateBtn-tip{
			padding: 0; 
			display: inline-block;
		}
  }
}
</style>
