<template>
    <el-table-column v-if="radioConfig.enable || false" label="" :align="radioConfig.center || 'center'" width="80">
        <template slot-scope="scope">
            <el-radio @change="handleChange" v-model="radioConfig.value" 
                :label="scope.row[radioConfig.label]">
                {{radioConfig.text || "&nbsp;"}}
            </el-radio>
        </template>
    </el-table-column>
</template>

<script>
export default {
    name: 'RadioSelect',
    data() {
        return {
        }
    },
    props: {
        // 配置单选操作自
        radioConfig: {
            type: Object,
            default: () => ({})
        },
        callback: {
            type: Function,
            default: () => ({})
        }
    },
    mounted() {
    },
    components: {
    },
    computed: {
    },
    methods: {
        handleChange(val) {
            this.callback('Radio', val)
        }
    }
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
