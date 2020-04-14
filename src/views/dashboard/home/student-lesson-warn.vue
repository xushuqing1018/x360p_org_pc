<template>
	<div class="warn-box stu-lesson-warn">
		<div class="panel-header" style="background: #D3EAFD">
            <div class="title">
                <span 
                    :class="['lesson-warn',type=='lesson'?'active':'normal']" 
                    @click="showLesson">
                    课时预警
                </span>
                <span 
                    :class="['leave-warn',type=='leave'?'active':'normal']" 
                    @click="showLeave">
                    请假预警
                </span>
                <Icon type="refresh" @click.native="refreshData"></Icon>
            </div>
            <div class="more cursor" @click="lookMore" v-show="visible">
                共{{total}}条记录
                <Icon type="chevron-right"></Icon>
            </div>
        </div>
        <div class="panel-content">
            <lesson-hours-list 
                ref="lesson_hours_list" 
                v-if="type=='lesson'" 
                @on-success="setTotal">
            </lesson-hours-list>
            <leave-list 
                ref="leave_list" 
                v-else 
                @on-success="setTotal">
            </leave-list>
        </div>
       
	</div>
</template>

<script>
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import LeaveList from './studentlessonwarn/leave-warn-list.vue'
import LessonHoursList from './studentlessonwarn/lesson-hours-warn-list.vue'


export default {
    name: 'StudentLessonWarn',
    mixins: [grid,globals],
    components: {
        LeaveList,
        LessonHoursList
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
  		return {
            type: 'lesson',
            total: 0
  		}
    },
    mounted() {
        this.pageSize = 5
  	    this.init_data()
    },
    methods: {
        lookMore() {
            if(this.type=='lesson') {
                this.$Modal.open('dashboard/home/lessonwarn/more.vue@modal',{autoShow:false})
                .then(modal=>{
                    modal.vuec.init().show('课次预警','more')
                })
            }else{
                this.$Modal.open('business/leave/info-modal.vue',{autoShow:false})
                .then(modal=>{
                    modal.tab = 'warn'
                    modal.show('请假','list')
                })
            }
        },
        setTotal(total) {
            this.total = total
        },
        showLesson() {
            this.type = 'lesson'
        },
        showLeave() {
            this.type = 'leave'
        },
        refreshData() {
            if(this.type=='lesson') {
                this.$refs.lesson_hours_list.init_data()
            }else{
                this.$refs.leave_list.init_data()
            }
        }
    }
}
</script>
<style lang="less">
    .lesson-warn,.leave-warn {
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