<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<DefaultTableComp ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick"></DefaultTableComp>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import DefaultTableComp from '../../../../components/defaultTableComp'
import { handleData } from '../../../../js/handleData'
import { containerList } from '@/api/order/list'
export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '集装箱列表',
				show: true,
				size: 'medium',
				width: '80%'
			},
			tableInfo: {},
			// 表格配置项
			tableConfig: {
				style: {
					height: '100%'
				},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ containerId, checkable }) {
						// return containerId ? true : false
						return true
					}
				},
				columns: handleData.containerColumn, //  表格显示的表头
				list: [],
				// 操作按钮组
				operationBtns: { show: false },
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
			}
		}
	},
	props: {
		declarationId: '',
		defaultSelectIds: {
			type: Array,
			default: () => {
				;[]
			}
		},
		disabledContainers: {
			type: Array,
			default: () => {
				;[]
			}
		}
	},
	created() {
		this.getContainerList()
	},
	mounted() {},

	computed: {},
	watch: {},
	components: {
		BaseDialog,
		DefaultTableComp
	},
	methods: {
		getContainerList() {
			let self = this
			containerList({ declarationId: this.declarationId || '', orderNo: this.oQuery.orderNo, pageSize: 200 }).then(res => {
				console.log('🚀 ~ this.disabledContainers', this.disabledContainers)
				console.log('🚀 ~ res.data.list', res.data.list)
				self.tableConfig.list =
					res.data &&
					[...res.data.list].map(item => {
						if (self.defaultSelectIds.includes(item.containerId)) {
							item.selected = 'Y'
						} else {
							item.selected = 'N'
						}
						//设置禁用多选框

						if (this.disabledContainers.includes(item.containerId.toString())) {
							item.checkable = false
						} else {
							item.checkable = true
						}
						return item
					})
			})
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$emit('addContainerFun', { list: this.$refs.defaultTableComp.selectedCheckbox, type: 'Container' })
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		},
		tableClick() {},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		}
	}
}
</script>

<style lang="scss"></style>
