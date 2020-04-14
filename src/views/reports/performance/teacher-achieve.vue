<template>
	<div>
		<div style="padding-left:15px;">
			<RadioGroup v-model="page" type="button" @on-change="changePage">
		        <Radio label="1">按周+月方式汇总(统计总课时数+试听次数)</Radio>
		        <Radio label="2">按月方式汇总(统计课次+课时+总学员课时数)</Radio>
			<Radio label="4">按日期汇总(统计课次+课时长)</Radio>
		        <Radio label="3">按月+日方式汇总(每日总课时+总月课时数)</Radio>
		    </RadioGroup>
		</div>
		<teacher-performance-by-week-month v-if="page=='1'"></teacher-performance-by-week-month>
		<teacher-performance-by-month v-if="page=='2'"></teacher-performance-by-month>
		<teacher-performance-by-month-minutes v-if="page=='4'"></teacher-performance-by-month-minutes>
		<teacher-performance-by-day-month v-if="page=='3'"></teacher-performance-by-day-month>
	</div>
	
</template>
<script>
	import common from '@/libs/common.mixin'
	import Vue from 'vue'
	import TeacherPerformanceByWeekMonth from './teacher-performance-by-week-month.vue'
	import TeacherPerformanceByMonth from './teacher-performance-by-month.vue'
	import TeacherPerformanceByMonthMinutes from './teacher-performance-by-month-minutes.vue'
	import TeacherPerformanceByDayMonth from './teacher-performance-by-day-month.vue'
	export default {
		mixins:[common],
		components: {
			TeacherPerformanceByWeekMonth,
			TeacherPerformanceByMonth,
			TeacherPerformanceByMonthMinutes,
			TeacherPerformanceByDayMonth
		},
		data() {
			return {
				page:'1'
			}
		},
		created() {
			let page = Vue.localStorage.get('__tapage__')
			if(page) {
				this.page = page
			}
		},
		methods:{
			changePage (page) {
	            Vue.localStorage.set('__tapage__',page)
	        }
	    }

	}
</script>
<style lang="less">
	.performance-summary {
		.ivu-table {
			tr th {
				border: 1px solid #e3e8ee;
			}
		}
	}
</style>