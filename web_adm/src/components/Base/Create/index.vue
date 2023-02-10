<template>
    <div class="filter-container create-layout">
        <div class="filter">
            <CreateFilter v-for="(item, index) in config" 
                :key="index" :item="item" :tableQuery.sync="createItem"
                :callback="handleBtn">
            </CreateFilter>

            <slot/>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import Config from '@/components/Base/config';
import CreateFilter from '../Search/filter';

export default {
    name: 'Create',
    data() {
        return {
            Config: Config
        }
    },
    components: {
        CreateFilter
    },
    props: {
        // 搜索参数
        config: {
            type: Array,
            default: () => ([])
        },

        // 接口传参
        createItem: {
            type: Object,
            default: () => ({})
        },

        // 事件回调{一系列的操作动作}
        callback: {
            type: Function,
            default: () => ({})
        },
    },
    created() {
    },
    mounted() {
    },
    computed: {
    },
    watch: {
    },
    methods: {
        callbackAction(param) {
            if (typeof this.callback !== 'function') return;
            this.callback(param);
        },

        // btn分发, 优先调用内部回调处理, 再通知props传入接收动作的回调
        handleBtn(action) {
            let fn = this[`handle${action}`];
            (typeof fn === 'function') && fn(action);
            this.callbackAction(action);
        }
    }
}
</script>

<style lang="scss">
@import '../less/create_layout.scss';
</style>
