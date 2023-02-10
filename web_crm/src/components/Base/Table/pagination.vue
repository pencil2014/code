<template>
    <div class="base-el-pagination">
        <div class="pagination-container" v-if="config.pagination.show">
            <el-pagination size="mini" background 
                @size-change="handleSizeChange" 
                @current-change="handleCurrentChange" 
                :current-page.sync="tableQuery.currPage"
                :page-size="tableQuery.pageSize"
                :total="Number(config.pagination.total)"
                :page-sizes="config.pagination.pageSizes || [10, 20, 50, 100, 200, 500, 1000]"
                :pager-count="5" 
                layout="total, prev, pager, next, jumper, sizes" >
            </el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Pagination',
    data() {
        return {

        }
    },
    props: {
        config: {
            type: Object,
            default: () => ({})
        },
        tableQuery: {
            type: Object,
            default: () => ({})
        },
        callback: {
            type: Function,
            default: () => ({})
        }
    },
    created() {

    },
    mounted() {
    },
    components: {
    },
    computed: {
    },
    methods: {
        handleSizeChange(val) {
            this.tableQuery.pageSize = val;
            this.callback('SizeChange',val);
        },
        handleCurrentChange(val) {
            this.tableQuery.currPage = val;
            this.callback('CurrentChange',val);
        },
    }
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
