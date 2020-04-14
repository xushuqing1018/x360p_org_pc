<template>
	<div>
		<div class="panel-header">
            <div class="title">
                <i class="icon-shiting"></i>
                <span 
                    :class="['trial-remind',type=='trial'?'active':'normal']" 
                    @click="showTrial">
                    试听提醒
                </span>
                <span 
                    :class="['promise-remind',type=='promise'?'active':'normal']" 
                    @click="showPromise">
                    诺到提醒
                </span>
                <Icon type="refresh" @click.native="refreshData"></Icon>
            </div>
            <div 
                class="more cursor" 
                @click="lookMore" 
                v-show="visible">
                今日共{{total}}人<span v-if="type=='trial'">试听</span><span v-else>诺到</span>
            </div>
        </div>
        <div class="panel-content">
            <trial-list 
                ref="trial_list" 
                v-if="type=='trial'" 
                @on-success="setTotal">
            </trial-list>
            <promise-list 
                ref="promise_list" 
                v-else 
                @on-success="setTotal">
            </promise-list>
        </div>
        
	</div>
</template>

<script>
import util from '@/libs/util'
import moment from 'moment'
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import common from '@/libs/common.mixin'

import TrialList from './todaytrial/trial.vue'
import PromiseList from './todaytrial/promise.vue'
export default {
    mixins: [grid,globals,common],
    components: {
        TrialList,
        PromiseList
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
  		return {
            type: 'trial',
            total: 0
  		}
    },
    methods: {
        lookMore() {
            if(this.type=='trial') {
                this.$Modal.open('dashboard/home/todaytrial/trial-more.vue@modal')
                .then(modal=>{
                    modal.show('试听提醒','more')
                })
            }else{
                this.$Modal.open('dashboard/home/todaytrial/promise-more.vue@modal',{
                    on:{
                        'on-success':()=>{
                            this.refreshTrial()
                        }
                    }
                })
                .then(modal=>{
                    modal.show('诺到提醒','more')
                })
            }
        },
        showTrial() {
            this.type = 'trial'
        },
        showPromise() {
            this.type = 'promise'
        },
        setTotal(total) {
            this.total = total
        },
        refreshData() {
            if(this.type=='trial') {
                this.$refs.trial_list.init_data()
            }else{
                this.$refs.promise_list.init_data()
            }
        },
        refreshTrial() {
            this.$refs.promise_list.init_data()
        }
    }
}
</script>
<style lang="less">
    .trial-remind,.promise-remind {
        cursor: pointer;
        &.active {
            border-bottom: 1px solid #323232;
        }
        &.normal {
            font-weight: normal;
            color: #657180;
        }
    }
</style>