<template>
	<div class="item-list-cont">
		<el-table fit stripe border :data="tableData" style="width: 100%">
			<el-table-column prop="smContractNumber" label="Contract number" align="center"> 
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.smContractNumber" v-if="scope.row.isEdit && isMain" maxlength="128"></el-input>
					<span v-else>{{scope.row.smContractNumber}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="bkgParty" label="BKG PARTY" align="center"> 
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.bkgParty" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.bkgParty}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="shipper" label="SHIPPER" align="center">
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.shipper" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.shipper}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="conn" label="CNEE" align="center">
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.conn" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.conn}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="pol" label="POL" align="center" width="180">
				<template slot-scope="scope">
					<!-- <el-input type="text" size="mini" v-model="scope.row.pol" v-if="scope.row.isEdit && isMain"></el-input> -->
					<el-select
						v-if="scope.row.isEdit && isMain"
						key="pol"
						size="mini"
						v-model="scope.row.pol"
						filterable
						clearable
						style="width: 100%"
						placeholder="请输入"
						:filter-method="polPortFilterMehod"
						@visible-change="polPortVisibleChange"
						@change="(val) => handleChangePolPortCode(val, scope.row)"
					>
						<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
							<span>{{item.label}}</span>
						</el-option>
					</el-select>
					<span v-else>{{scope.row.polName}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="pod" label="POD" align="center" width="180">
				<template slot-scope="scope">
					<!-- <el-input type="text" size="mini" v-model="scope.row.pod" v-if="scope.row.isEdit && isMain"></el-input> -->
					<el-select
						v-if="scope.row.isEdit && isMain"
						key="pod"
						size="mini"
						v-model="scope.row.pod"
						filterable
						clearable
						style="width: 100%"
						placeholder="请输入"
						:filter-method="podPortFilterMehod"
						@visible-change="podPortVisibleChange"
						@change="(val) => handleChangePodPortCode(val, scope.row)"
					>
						<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
							<span>{{item.label}}</span>
						</el-option>
					</el-select>
					<span v-else>{{scope.row.podName}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="comm" label="COMM" align="center">
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.comm" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.comm}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="rate" label="RATE" align="center">
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.rate" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.rate}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="freetime" label="FREETIME" align="center"> 
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.freetime" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.freetime}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="other" label="OTHER" align="center"> 
				<template slot-scope="scope">
					<el-input type="text" size="mini" v-model="scope.row.other" v-if="scope.row.isEdit && isMain"></el-input>
					<span v-else>{{scope.row.other}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="120" fixed="right"> 
				<template slot-scope="scope">
					<div class="operate-btns">
						<template v-if="isMain">
							<el-button type="text" size="mini" v-if="scope.$index === 0" @click="handleAdd">新增</el-button>
							<el-button type="text" size="mini" v-if="!scope.row.isEdit" @click="handleEdit(scope.row)">编辑</el-button>
							<el-button type="text" size="mini" v-if="!scope.row.isEdit" @click="handleDelete(scope.row)">删除</el-button>
							<el-button type="text" size="mini" v-if="scope.row.isEdit" @click="handleSave(scope.row)">保存</el-button>
							<el-button type="text" size="mini" v-if="scope.row.isEdit" @click="handleCancel(scope.row)">取消</el-button>
						</template>
					</div>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { contractItemDelete, contractItemSave } from '@/api/order/contract'

export default {
	data() {
		return {
			state: '',
			tableData: [],
			rowObj: {
				contractId: this.$route.query.oid,
				smContractNumber: '',
				bkgParty: '',
				shipper: '',
				conn: '',
				pol: '',
				polName: '',
				pod: '',
				podName: '',
				comm: '',
				rate: '',
				freetime: '',
				other: '',
			},
			polPortList: [],
			podPortList: []
		}
	},
	props: {
		isMain: {
			type: Boolean,
			default: false
		},
		itemListQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState('user',['userId', 'name', 'compCode', 'compName']),
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	components: {},
	watch: {
		itemListQuery: {
			handler(newVal) {
				this.initData(newVal)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// pol下拉数据
		polPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.polPortList = result
			})
		},
		// pol
		polPortVisibleChange(val) {
		},
		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangePolPortCode(val, row) {
			let findItem = this.polPortList.find(item => item.portCode === val)
			row.polName = findItem ? findItem.label : ''
		},
		// pod下拉数据
		podPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.podPortList = result
			})
		},
		// pod
		podPortVisibleChange(val) {
			// this.podPortSearch(val, '', this.state)
		},
		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val, row) {
			let findItem = this.podPortList.find(item => item.portCode === val)
			row.podName = findItem ? findItem.label : ''
		},
		initData(values) {
			if (values.list && values.list.length) {
				this.tableData = values.list.map(item => {
					return {...item, isEdit: false}
				})
			} else {
				this.tableData = [{...this.rowObj, contractId: this.$route.query.oid, isEdit: true}]
			}
		},
		//存在可编辑的row，提示先保存
		isEditRow() {
			let result = true
			if (this.tableData.find(item => item.isEdit)) {
				result = false
				this.$message.error('请保存合约详细内容')
			}
			return result
		},
		// 先保存
		handleAdd() {
			let { oid } = this.$route.query
			if (!this.isEditRow()) return
			this.tableData.push({...this.rowObj, contractId: this.$route.query.oid, isEdit: true})
		},
		handleDelete(row) {
			if (!this.isEditRow()) return
			this.$confirm(`是否删除该条合约内容?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				contractItemDelete({ oid: row.oid }).then(res => {
					this.$message({type: 'success',message: '删除成功'})
					this.$emit('getInfo', true)
				})
			}).catch(err => {
				console.log('err')
			})
		},
		handleEdit(row) {
			if (!this.isEditRow()) return
			row.isEdit =  true
		},
		handleSave(row) {
			if (!row.smContractNumber) {
				return this.$message({type: 'error', message: 'Contract number为必填'})
			}
			let data = {...row}
			delete data.isEdit
			console.log('data', data);
			
			contractItemSave(data).then(res => {
				this.$message.success('保存成功')
				this.$emit('getInfo', true)
			})
		},
		handleCancel(row) {
			row.isEdit = false
			this.$emit('getInfo', true)
		}
	}
}
</script>
<style lang="scss" scoped>
.item-list-cont{
	.operate-btns{
		/deep/ .el-button--mini{
			padding: 0;
		}
	}
}

</style>
