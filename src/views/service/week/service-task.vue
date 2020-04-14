<template>
    <div class="c-grid">
        <template>
        	<arrange-list 
                v-if="mode == 'list'" 
                @on-turn-mode="turnMode"
			>
            </arrange-list>
        	<arrange-grid 
                v-show="mode == 'grid'"
                @on-turn-mode="turnMode">
            </arrange-grid>
        </template>
    </div>
</template>

<script>
    import Vue from 'vue'
    import common from '@/libs/common.mixin'
    import arrangeList from './tab-task/task-list.vue'
    import arrangeGrid from './tab-task/task-calendar.vue'
    
    export default {
        mixins: [common],
        components: {
        	arrangeList,
            arrangeGrid
        },
        data() {
            return {
                mode:'list'
            }
        },
        methods: {
            turnMode(type) {
                this.mode = type
            }
        }
    }
</script>