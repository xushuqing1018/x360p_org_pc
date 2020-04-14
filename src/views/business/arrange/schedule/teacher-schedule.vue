<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="1300" class="schedule__modal">
		<div class="week-schedule" style="max-height: 680px;overflow: auto;">
			<Row>
				<Col span="3">
					<span>模式：</span>
					<Select v-model="mode" style="width: 70px;">
						<Option value="day">日</Option>
						<Option value="week">周</Option>
					</Select>
				</Col>
				<Col span="5">
					<span>日期：</span>
					<DatePicker v-model="date" style="width: 190px" @on-change="dateChange"></DatePicker>
				</Col>
				<Col span="5">
					<span>教师：</span>
					<select-employee 
						v-model="eid" 
						:rid="1" 
						clearable 
						style="width:190px;"
						:placeholder="label_choose_teacher"
						:disabled="!perCheckAllArrange">
					</select-employee>
				</Col>
				<Col span="5">
					<span>课程：</span>
					<select-lesson 
						v-model="innerLid" 
						clearable 
						style="width:190px;"
						placeholder="请选择课程"
						>
					</select-lesson>
				</Col>
			</Row>
			<div class="ivu-table-wrapper" v-loading.like="'course_by'">
				<table ref="tableExcel" class="week-schedule-table mt-3">
					<template v-if="mode=='week'">
						<table-header
							:view="view"
							:date="date" 
							:year="year"
							:week="week"
							:allow-day-click="1"
							@on-week-change="weekChange"
							@on-day-click="showDaySchedule"
							>
						</table-header>
						<table-body
							:eid="eid"
							:lid="innerLid"
							:view="view"
							:date="date" 
							:year="year"
							:week="week"
							:is-online="isOnline">
						</table-body>
					</template>
					<template v-else>
						<day1-header
							:view="view"
							:date="selectDate"
							:year="year"
							:week="week"
							:eid="eid"
							:data="dayArrangeData"
							:page="dayArrangePage"
							:total="dayArrangeTotal"
							:update="getTeacherDayData"
							@on-prev="prevPage"
							@on-next="nextPage"
							@on-prev-date="prevDate"
							@on-next-date="nextDate"
							@on-change-date="changeDate"
							>
						</day1-header>
						<day1-body
							:eid="eid"
							:view="view"
							:date="selectDate"
							:year="year"
							:week="week"
							:data="dayArrangeData"
							:page="dayArrangePage"
							:total="dayArrangeTotal"
							@pagenation="pagenation"
							:is-online="isOnline">
						</day1-body>
					</template>
				</table>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import TableHeader from './header.vue'
	import DayTableHeader from './day-header.vue'
	import TableBody from './teacher-data.vue' 
	import DayTableBody from './day-teacher-data.vue' 
	import Day1Header from './day1-header.vue'
	import Day1Body from './day1-body.vue'

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee,
			TableHeader,
			TableBody,
			DayTableHeader,
			DayTableBody,
			Day1Header,
			Day1Body,
			SelectLesson
		},
		props: {
			view: {
				type: String,
				default: 'teacher'
			},
			isOnline:{
				type:Number,
				default:0
			},
			lid: Number
		},
		data() {
			return {
				eid: 0,
				year: util.int(moment().format('YYYY')),
				week: util.int(util.get_date_week_no(new Date())),
				date: new Date(),
				mode: 'week',
				dayArrangeData: [],
				allData: [],
				dayArrangePage: 1,
				dayArrangeTotal: 0,
				selectDate: moment().format('YYYY-MM-DD'),
				innerLid: 0
			}
		},
		watch: {
			mode(val) {
				if(val == 'day') {
					this.getTeacherDayData();
				}
			},
			eid(val) {
				if(this.mode == 'day') {
					this.getTeacherDayData();
				}
			},
			innerLid(val) {
				if(this.mode == 'day') {
					this.getTeacherDayData()
				}
			},
			lid(v) {
				this.innerLid = v
			}
		},
		mounted() {
			
		},
		methods: {
			onModalOpen() {
				this.innerLid = this.lid
			},
			showDaySchedule(date) {
				this.selectDate = moment(date).format('YYYY-MM-DD');
				this.mode = 'day'
			},
			pagenation(page) {
				this.dayArrangePage = page;
				this.dayArrangeData = this.getPageData();
			},
			prevPage() {
				this.dayArrangePage -= 1;
				this.dayArrangeData = this.getPageData();
			},
			nextPage() {
				this.dayArrangePage += 1;
				this.dayArrangeData = this.getPageData();
			},
			prevDate() {
				this.selectDate = moment(new Date(this.selectDate)).subtract(1,'days').format('YYYY-MM-DD')
				this.getTeacherDayData()
			},
			nextDate() {
				this.selectDate = moment(new Date(this.selectDate)).add(1,'days').format('YYYY-MM-DD')
				this.getTeacherDayData()
			},
			changeDate(date) {
				this.selectDate = moment(date).format('YYYY-MM-DD')
				this.getTeacherDayData()
			},
			getPageData() {
				return this.allData.slice((this.dayArrangePage-1)*10, (this.dayArrangePage-1)*10 + 10)
			},
	    	weekChange({action}) {
				let dt = this.date.getDate()
				if(action == 'prev'){
					this.date = new Date(this.date.setDate(dt-7))
				}else{
					this.date = new Date(this.date.setDate(dt+7))
				}
				this.year = util.int(moment(this.date).format('YYYY'))
				this.week = util.get_date_week_no(this.date)
			},
			dateChange(v) {
				this.selectDate = v
				this.year = util.int(moment(this.date).format('YYYY'))
				this.week = util.get_date_week_no(this.date)
				if(this.mode == 'day') {
					this.getTeacherDayData()
				}
			},
			getTeacherDayData() {
				let params = {
						int_day: this.selectDate,
						pagesize: 1000
				}
				if(this.eid != 0) {
					params.teach_eid = this.eid
				}
				if(this.innerLid != 0) {
					params.lid = this.innerLid
				}
				this.$http.get('course_arranges/employee_course_by_day',{
						params: params
				})
				.then(res => {
						var list = res.body.data.list;
						this.allData = list;
						this.dayArrangeTotal = res.body.data.total
						this.dayArrangeData = this.getPageData();
				},res => {
						this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>
<style type="text/css">
	.schedule__modal .ivu-modal {
		top: 60px;
	}
</style>