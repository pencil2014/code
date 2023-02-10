<template>
	<div class="table-com-layout">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="coc-bewteen">
				<div class="">
					<span class="ft12 mr10">附件类别：</span>
					<el-input placeholder="请输入" size="mini" v-model="typeName" clearable style="width: 200px"></el-input>
					<!-- <span class="ft12 mr10">箱号：{{param.cn}}</span>
          <el-select size="mini" placeholder="请选择" v-model="typeCode" clearable>
            <el-option v-for="(item, index) in attachmentList" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
				</div>
				<div class="row-tit-operate">
					<el-button size="mini" type="default" @click="handleSearch">搜索</el-button>
					<el-button size="mini" type="primary" @click="handleReset">取消</el-button>
				</div>
			</div>
			<el-table fit style="width: 100%" ref="fileListTable" :data="tableData" @current-change="handleCurrentChange">
				<el-table-column align="center" label="" width="50">
					<template slot-scope="scope">
						<el-radio v-model="selectFile" :label="scope.row"><span></span></el-radio>
					</template>
				</el-table-column>
				<!-- <el-table-column prop="fileNo" label="附件编号" align="center"></el-table-column> -->
				<el-table-column prop="serviceName" label="业务模块" align="center"> </el-table-column>
				<el-table-column prop="typeName" label="附件类别" align="center"></el-table-column>
				<el-table-column prop="name" label="附件名称" align="center" show-overflow-tooltip>
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini">
								<span class="file-name-style">{{ scope.row.name }}</span>
							</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="size" label="附件大小(kb)" align="center"> </el-table-column>
				<el-table-column prop="createdName" label="上传人" align="center"> </el-table-column>
				<el-table-column prop="createdTime" label="上传时间" align="center" width="160px"> </el-table-column>
			</el-table>
		</BaseDialog>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { orderFileList } from '@/api/order/list'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			// fileList: [],
			typeName: '',
			tableData: [],
			multipleSelection: [],
			// typeCode: '',
			selectFile: {}, // 选中列
			tableHeight: null,
			dialogConfig: {
				title: '查看附件',
				show: true,
				size: 'medium',
				width: '1000px',
				showBtns: true
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		},
		attachmentList: {
			type: Array,
			default: () => []
		},
		typeCode: {
			type: String,
			default: ''
		}
	},
	created() {
		this.getFileList()
	},
	mounted() {
		this.$nextTick(() => {
			console.log(window.innerHeight)
			this.tableHeight = window.innerHeight - this.$refs.fileListTable.$el.offsetTop - 200
		})
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		// 附件列表
		getFileList() {
			console.log(this.typeCode)
			let data = {
				orderNo: this.oQuery.orderNo
			}
			if (this.typeName)
				Object.assign(data, {
					typeName: this.typeName
				})
			orderFileList(data).then(res => {
				// this.fileList = res.data
				this.tableData = res.data
			})
		},
		handleSearch() {
			this.getFileList()
		},
		handleReset() {
			this.typeName = ''
			// this.tableData = this.fileList
			this.getFileList()
		},
		// 当一行被点中时
		handleCurrentChange(row) {
			this.selectFile = row
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!Object.keys(this.selectFile).length) {
					return this.$message({
						type: 'error',
						message: '请选择附件',
						duration: 1000,
						onClose: () => {}
					})
				}
				this.close('Confirm', this.selectFile)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss">
.coc-bewteen {
	display: flex;
	justify-content: space-between;
	height: 32px;
	line-height: 32px;
}
</style>
