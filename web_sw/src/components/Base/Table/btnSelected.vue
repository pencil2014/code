<template>
    <div class="selected-operation" v-show="selectOperates.show">
        <el-dropdown size="mini"
            v-for="(item, index) in dropdown" :key="index"
            @command="callback">
            <el-button size="mini" plain>{{index}}<i class="el-icon-arrow-down el-icon--right"></i></el-button>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in item" :key="index" :command="item.action">
                    {{item.label}}
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>

        <el-button size="mini" plain 
            v-for="(item, index) in single" :key="index"
            @click.native.prevent="callback(item.action)">
            {{item.label}}
        </el-button>
    </div>
</template>

<script>
export default {
    name: 'BtnSelected',
    data() {
        return {
            dropdown: {},
            single: []
        }
    },
    props: {
        selectOperates: {
            type: Object,
            default: () => ({})
        },
        callback: {
            type: Function,
            default: () => ({})
        }
    },
    created() {
        this.getBtns();
    },
    mounted() {
    },
    components: {
    },
    computed: {
    },
    methods: {
        getBtns() {
            let {data = []} = this.selectOperates
            for (let i = 0; i < data.length; i++) {
                let item = data[i]
                if (Object.prototype.toString.call(item) === '[object Object]') {
                    return this.single.push(item)
                }
                let shift = item.shift();
                if (!shift.text) return;
                this.dropdown[shift.text] = item;
            }
        },
        handleCommand() {}
    }
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
