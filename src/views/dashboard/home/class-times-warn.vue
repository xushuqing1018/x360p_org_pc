<template>
	<div class="warn-box class-times-warn">
		<div class="panel-header" style="background: #FDEAD3">
            <div class="title">
                <span 
                    :class="['lesson-warn',type=='schedule'?'active':'normal']" 
                    @click="showSchedule">
                    排课预警
                </span>
                <span 
                    :class="['leave-warn',type=='course'?'active':'normal']" 
                    @click="showCourse"
                    v-if="show_sl_expire_warn"
                    >
                    课包有效期设置预警
                </span>
                <Icon type="refresh" @click.native="refreshData"></Icon>
	        </div>
            <div class="more cursor" @click="lookMore" v-show="visible">
                共{{total}}条记录
                <Icon type="chevron-right"></Icon>
            </div>
        </div>
        <div class="panel-content">
            <schedule-warn-list 
                ref="schedule-warn-list" 
                v-if="type=='schedule'" 
                @on-success="setTotal">
            </schedule-warn-list>
            <course-warn-list 
                ref="course-warn-list" 
                v-else 
                @on-success="setTotal">
            </course-warn-list>
        </div>
        
	</div>
</template>

<script>
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import ScheduleWarnList from './classtimeswarn/schedule-warn-list'
import CourseWarnList from './classtimeswarn/course-warn-list'

export default {
    name: 'ClassTimsWarn',
    mixins: [grid,common,globals],
    components: {
        ScheduleWarnList,
        CourseWarnList
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
  		return {
            type: 'schedule'
  		}
    },
    mounted() {
          this.pageSize = 5
    },
    methods: {
        lookMore() {
            if(this.type === 'schedule'){
                this.$Modal.open('dashboard/home/timeswarn/more.vue@modal',{autoShow:false})
                .then(modal=>{
                    modal.vuec.init()
                    .show('排课预警','more')
                })
            }
        },
        setTotal(total) {
            this.total = total
        },
        showSchedule () {
            this.type = 'schedule'
        },
        showCourse () {
            this.type = 'course'
        },
        refreshData () {
            if(this.type=='schedule') {
                this.$refs.schedule-warn-list.init_data()
            }else{
                this.$refs.course-warn-list.init_data()
            }           
        }
    }
}
</script>
