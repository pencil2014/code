<template>
    <div
      class="appendix-table"
      v-loading="loading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    > 
        <FinanceTableMass :option="option1" />
    </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { fileList } from '@/api/swcms/index'
export default {
    mixins: [mixin],
    props: {
        memOrderNo: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            loading: false,
            option1: {}
        }
    },
    components: {
        FinanceTableMass
    },
    created() {
        this.getList()
        let operationBtns = Object.assign({}, this.option.operationBtns, {
            data: [
            {
                label: '下载',
                show: true,
                action: 'downLoad'
            }
            ],
            width: 140,
            fixed: 'right',
            callback: (action, $index, row, option) => {
                if (action === 'downLoad') {
                    this.handleDownload(row)
                }
            }
        })
        this.option1 = Object.assign({}, this.option, {
            id: 'option1',
            data: [],
            columns: [
                {
                    prop: 'name',
                    label: '附件名称',
                    type: 'text',
                    type: 'button',
                    operationBtns: {
                        show: true,
                        callback: (action, index, row) => {
                            this.handleView(row)
                        },
                    },
                },
                {
                    prop: 'typeName',
                    label: '附件类别',
                    type: 'select'
                },
                {
                    prop: 'createdDisplay',
                    label: '创建人',
                    type: 'select'
                },
                {
                    prop: 'createdTime',
                    label: '创建时间',
                    type: 'select'
                },
            ],
            tips: {
                text: '',
                show: false,
            },
            selection: false,
            operationBtns,
            pagination: false,
        })
    },
    methods: {
        getList() {
            this.loading = true
            let data = {
                memOrderNo: this.memOrderNo
            }
            fileList(data).then((res) => {
                this.option1.data = res.data
            })
            .catch(() => {})
            .finally(() => {
                this.loading = false
            })
        },
        handleDownload(row) {
			this.$store
				.dispatch('swCms/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.name
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('swCms/previewFile', { fileNo: row.fileNo, fileName: row.name})
		}
    }
}
</script>

<style lang="scss" scoped>
.appendix-table {
    padding: 8px 0;
}
</style>