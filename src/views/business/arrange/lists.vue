<template>
    <div class="c-grid">
        <template v-if="checkAll">
        	<arrange-list 
                v-if="mode == 'list'" 
                @on-turn-mode="turnMode" 
                @on-check="checkArrange">
            </arrange-list>
        	<arrange-grid 
                v-show="mode == 'grid'" 
                ref="grid" 
                @on-turn-mode="turnMode">
            </arrange-grid>
            <arrange-visual
                v-show="mode == 'visual'"
                ref="visual"
                @on-turn-mode="turnMode">
            </arrange-visual>
        </template>
        <template v-if="checkMy">
            <my-list @on-check="checkArrange"></my-list>
        </template>
    </div>
</template>

<script>
    import Vue from 'vue'
    import common from '@/libs/common.mixin'
    import arrangeList from './list.vue'
    import arrangeGrid from './grid.vue'
    import arrangeVisual from './visual.vue'
    import MyList from './my-list.vue'
    
    export default {
        mixins: [common],
        components: {
        	arrangeList,
            arrangeGrid,
            arrangeVisual,
            MyList
        },
        data() {
            return {
                mode:'list',
                type:'all'
            }
        },
        computed: {
            checkAll() {
                if(this.perCheckAllArrange) {
                    if(this.type=='all') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            },
            checkMy() {
                if(this.perCheckAllArrange) {
                    if(this.type=='my') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return true
                }
            }
        },
        mounted() {
            const classMode= Vue.localStorage.get('__arrange_mode__')
            if(classMode) {
                this.mode = classMode
            }
        },
        methods: {
        	clearCache () {
        		this.$refs['visual'].refreshArrange()
                this.$refs['grid'].refreshData()
        	},
            refreshVisualData() {
                this.$refs['visual'].refreshArrange()
            },
            turnMode(type) {
                this.mode = type
                if(type == 'grid') {
                    this.$refs['grid'].init_data()
                }else if(type == 'visual') {
                    this.$refs['visual'].refreshArrange()
                }
                Vue.localStorage.set('__arrange_mode__',type)
            },
            checkArrange(type) {
                this.type = type
            }
        }
    }
</script>