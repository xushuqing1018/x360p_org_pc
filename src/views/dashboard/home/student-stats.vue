<template>
	<div>
		<div class="panel-header">
            <div class="title">
                <i class="icon-xueyuan"></i>
                <span>学员统计情况</span>
            </div>
            <div class="more" v-show="visible">
                <span 
                    v-for="(value,key) in tabs" 
                    :style="cacuStyle(key)" 
                    class="stats-chart-tab" 
                    @click="chartChange(key)">{{value}}
                </span>
            </div>
        </div>
        <div class="panel-chart">
            <student-trend-chart v-if="current_chart == 1" :xData="attendXData" :yData="studentYData"/>
            <attendance-trend-chart v-if="current_chart == 2" :xData="attendXData" :yData="attendYData"/>
            <lesson-expend-trend-chart v-if="current_chart == 3" :xData="attendXData" :yData="lessonYData"/>
        </div>
	</div>
</template>

<script>
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import common from '@/libs/common.mixin'
import AttendanceTrendChart from '../charts/AttendanceTrendChart.vue'
import StudentTrendChart from '../charts/StudentTrendChart.vue'
import LessonExpendTrendChart from '../charts/LessonExpendTrendChart.vue'
export default {
	name: 'StudentStats',
    mixins: [grid,globals,common],
    components: {
    	AttendanceTrendChart,
        StudentTrendChart,
        LessonExpendTrendChart
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
        this.tabs = {
            1: '学员报名情况',
            2: '学员出勤情况',
            3: '课消统计情况'
        }
  		return {
  			rest_api: 'dashboard/student_stats',
  			current_chart: 1,
            attendXData:[],
            attendYData:[],
            lessonYData:[],
            studentYData:[]
  		}
    },
    mounted() {
        this.init_data()
    },
    methods: {
        deal_data(data) {
        	let attendance_stats = data.attendance_stats,
                consume_stats    = data.consume_stats,
                lesson_stats     = data.lesson_stats
            attendance_stats.forEach(item => {
                this.attendXData.push(this.formatMD(item.day))
                this.attendYData.push(item.rate*100)
            })
            lesson_stats.forEach(item => {
                this.studentYData.push(item.lesson_num)
            })
            consume_stats.forEach(item => {
                this.lessonYData.push(item.num)
            })
            return data
        },
        chartChange(v) {
            this.current_chart = v
        },
        formatMD(date) {
            let s = date.toString(),
                t = []
            t.push(s.substr(4, 2))
            t.push(s.substr(6, 2))
            return t.join('-')
        },
        cacuStyle(key) {
            let is_current = key==this.current_chart
            return {
                background: is_current?this.theme_color:'#fff',
                color: is_current?'#fff':'#515a6e',
                border: 0
            }
        }
    }
}
</script>
<style lang="less">
    .stats-chart-tab {
        display: inline-block;
        height: 26px;
        line-height: 26px;
        margin: 2px 4px 2px 0;
        padding: 0 8px;
        border-radius: 3px;
        background: #f7f7f7;
        font-size: 12px;
        vertical-align: middle;
        opacity: 1;
        overflow: hidden;
        cursor: pointer;
    }
</style>