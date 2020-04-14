<style lang="less">
	.year-week-info {
		float: right;
		line-height: 35px;
		font-size: 14px;
		.small-grid {
			display: inline-block;
			height: 14px;
			width: 14px;
			overflow: hidden;
			vertical-align: middle;
			margin-bottom: 2px;
		}
		.arranged {
			background: #50a8ff;
		}
		.part-attendanced {
			background: #ff9900;
		}
		.attendanced {
			background: #19be6b;
		}
		.cancel {
			background: #c3cbd6;
		}
		strong {
			font-size: 18px;
		}
	}
	.week-schedule {
		.loading-wrap {
			top: 52px;
		}
		&-table {
			width: 100%;
			border-collapse: collapse;
			&-head {
				th {
					position: relative;
					color: #333;
    				background-color: #f4f5f9;
    				text-align: center;
					line-height: 20px;
					padding: 6px 0;
					border-right: 1px solid #e7e7eb;
					.ivu-btn {
						padding: 4px 10px !important;
					}
					&:first-child {
						border-left: 1px solid #e7e7eb;
					}
				}
				.current-day {
					background: #c3cbd6;
				}
				.ivu-btn-prev {
					position: absolute;
					left: 10px;
					top: 14px;
				}
				.ivu-btn-next {
					position: absolute;
					right: 10px;
					top: 14px;
				}
			}
			&-body {
				td:first-child {
					text-align: center;
					vertical-align: middle;
				}
				td {
					border: 1px solid #eee;
					padding: 4px 3px;
					min-width: 80px;
				}
				.cell-day-schedule {
					height: 80px;
					min-width: 80px;
					font-size: 12px;
					i,span {
						vertical-align: middle;
					}
					.cell-time-section:not(:last-child) {
						margin-bottom: 8px;
					}
				}
				.active {
					border: 2px solid red;
				}
				.cell-wrap {
					.ivu-tag {
						height: 18px;
						line-height: 16px;
						padding: 0 6px;
					}
				}
				td .x-cell-card {
					.ivu-card-head, .ivu-card-body {
						padding: 8px;
						.card-body-cell:not(:last-child) {
							margin-bottom: 6px;
						}
					}
					.ivu-card-head {
						font-weight: 600;
						color: #29363d;
						line-height: 18px;
					}
					.cell-wrap {
						border-bottom: 1px solid #fff;
					}
					.class-info {
						line-height: 24px;
						.ivu-progress {
							.ivu-progress-text{
								margin-left: 0 !important;
							}
							.ivu-progress-outer{
								width: 90%;
							}
						}
					}
				}
			}
		} 
	}
</style>
<template>
	<div class="c-grid">
		<div class="clearfix">
			<RadioGroup v-model="view_type" type="button" @on-change="changeGroup">
				<Radio v-for="item in view_types" :label="item.value">{{item.label}}</Radio>
			</RadioGroup>
			<template v-if="showOnlineOption">
				<RadioGroup v-model="is_online" type="button">
					<Radio :label="0">线下课</Radio>
					<Radio :label="1">线上课</Radio>
				</RadioGroup>
			</template>
			<div class="year-week-info">
				<a href="javascript:void(0)" @click.prevent="scheduleType='day'" v-if="scheduleType=='week'&&view_type=='teacher'" class="mr-2">切换到日排课表</a>
				<a href="javascript:void(0)" @click.prevent="scheduleType='week'" v-if="scheduleType=='day'&&view_type=='teacher'" class="mr-2">切换到周排课表</a>
				<span>{{year}}</span>年
				<span class="ml-1" v-if="scheduleType=='week'">第&nbsp;&nbsp;<strong>{{week}}</strong>&nbsp;&nbsp;周</span>
				<span class="ml-1" v-if="scheduleType=='day'"><strong>{{dateLabel}}</strong></span>
				<span class="small-grid arranged ml-1"></span>未考勤
				<span class="small-grid attendanced ml-1"></span>已考勤
				<span class="small-grid part-attendanced ml-1"></span>部分考勤
				<span class="small-grid cancel ml-1"></span>已取消
			</div>
		</div>
		<div class="box mt-3">
			<teacher-schedule 
				ref="teacher_schedule"
				:view="view_type"
				:date="date"
				:year="year"
				:week="week"
				:mode="scheduleType"
				:is-online="is_online"
				@on-week-change="weekChange"
				@changeMode="changeMode"
				v-if="view_type=='teacher'">
			</teacher-schedule>
			<classroom-schedule
				ref="classroom_schedule"
				:view="view_type"
				:date="date"
				:year="year"
				:week="week"
				:is-online="is_online"
				@on-week-change="weekChange"
				v-if="view_type=='classroom'">
			</classroom-schedule>
			<student-schedule
				ref="student-schedule"
				:view="view_type"
				:date="date"
				:year="year"
				:week="week"
				:is-online="is_online"
				@on-week-change="weekChange"
				v-if="view_type=='student'">
			</student-schedule>
			<time-section-schedule
				ref="time_section_schedule"
				:view="view_type"
				:date="date"
				:year="year"
				:week="week"
				:is-online="is_online"
				@on-week-change="weekChange"
				v-if="view_type=='section'">
			</time-section-schedule>
			<class-schedule
				ref="class_schedule"
				:view="view_type"
				:date="date"
				:year="year"
				:week="week"
				:is-online="is_online"
				@on-week-change="weekChange"
				v-if="view_type=='class'">
			</class-schedule>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import TeacherSchedule from './schedule/by-teacher.vue'
	import ClassroomSchedule from './schedule/by-classroom.vue'
	import StudentSchedule from './schedule/by-student.vue'
	import TimeSectionSchedule from './schedule/by-section'
	import ClassSchedule from './schedule/by-class.vue'

	function getCurrentYear(){
		return util.int(moment().format('YYYY'))
	}

	function getCurrentWeek(){
		return util.int(util.get_date_week_no(new Date()))
	}

	export default {
		mixins:[common],
		components: {
			TeacherSchedule,
			ClassroomSchedule,
			StudentSchedule,
			TimeSectionSchedule,
			ClassSchedule
		},
		data() {
			return {
				view_type: 'teacher',
				view_types: [
					{label:'按'+this.$filter('translate')('老师'),value:'teacher'},
					{label:'按教室',value:'classroom'},
					{label:'按学员',value:'student'},
					{label:'按时段',value:'section'},
					{label:'按班级',value:'class'}
				],
				date: new Date(),
				year: getCurrentYear(),
				week: getCurrentWeek(),
				is_online:0,
				scheduleType: 'week'
			}
		},
		created() {
			let type = Vue.localStorage.get('__SCHEDULE_VIEW_TYPE')
			if(type) {
				this.view_type = type
			}
		},
		computed:{
			showOnlineOption(){
				return this.enable_online_lesson && (this.view_type == 'teacher' || this.view_type == 'section' || this.view_type == 'class' || this.view_type == 'student')
			},
			dateLabel() {
				return moment(this.date).format('MM月DD日')
			}
		},
		methods: {
			changeMode(mode, date) {
				this.date = date;
				this.scheduleType = mode;
			},
			weekChange({action}){
				let dt = this.date.getDate()
				if(action == 'prev'){
					this.date = new Date(this.date.setDate(dt-7))
				}else{
					this.date = new Date(this.date.setDate(dt+7))
				}
				this.year = util.int(moment(this.date).format('YYYY'))
				this.week = util.get_date_week_no(this.date)
			},
			changeGroup(type) {
				this.scheduleType = 'week'
				Vue.localStorage.set('__SCHEDULE_VIEW_TYPE',type)
			}
		}
	}
</script>