<template>
	<div class="week-schedule">
		<Row>
			<Col span="24">
				<span>搜索：</span>
				<select-employee 
					v-model="eid" 
					:rid="1" 
					clearable 
					style="width:250px;"
					:placeholder="label_choose_teacher"
					:disabled="!perCheckAllArrange">
				</select-employee>
				<Button type="primary" icon="ios-download" class="ml-2" @click="exportExcel('老师课表','delLast')" v-per="'arrange.export'">导出</Button>
			</Col>
		</Row>
    <div class="ivu-table-wrapper" v-loading.like="'course_by'">
			<table ref="tableExcel" class="week-schedule-table mt-3" v-if="mode=='week'">
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
					:lid="lid"
					:view="view"
					:date="date" 
					:year="year"
					:week="week"
					:is-online="isOnline">
				</table-body>
			</table>
			<table ref="tableExcel" class="week-schedule-table mt-3" v-if="mode=='day'">
				<!-- <day-table-header
					:view="view"
					:date="date"
					:year="year"
					:week="week"
					:eid="eid"
					@on-prev="prevPage"
					@on-next="nextPage"
					:data="dayArrangeData"
					:page="dayArrangePage"
					:total="dayArrangeTotal"
					:update="getTeacherDayData"
				>
				</day-table-header>
				<day-table-body
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
				</day-table-body> -->
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
			</table>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import TableHeader from './header.vue'
	import DayTableHeader from './day-header.vue'
	import TableBody from './teacher-data.vue' 
	import DayTableBody from './day-teacher-data.vue' 
	import Day1Header from './day1-header.vue'
	import Day1Body from './day1-body.vue'

	export default {
		mixins: [common],
		components: {
			SelectEmployee,
			TableHeader,
			TableBody,
			DayTableHeader,
			DayTableBody,
			Day1Header,
			Day1Body
		},
		props: {
			view: {
				type: String,
			},
			date: {
				type: Date
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
			},
			isOnline:{
				type:Number,
				default:0
			},
			mode:{
				type:String,
				default:'week'
			}
		},
		data() {
			return {
				eid: 0,
				lid: -1,
				dayArrangeData: [],
				allData: [],
				dayArrangePage: 1,
				dayArrangeTotal: 0,
				selectDate: moment().format('YYYY-MM-DD')
			}
		},
		watch: {
			mode(val) {
				if(val == 'day') {
					this.getTeacherDayData();
				}
			},
			eid(val) {
				if(val == 'day') {
					this.getTeacherDayData();
				}
			}
		},
		mounted() {
			this.lid = 0
		},
		computed: {
			
		},
		methods: {
			showDaySchedule(date) {
				this.selectDate = moment(date).format('YYYY-MM-DD');
				this.$emit('changeMode', 'day', date)
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
				this.$emit('on-week-change',{action:action})
			},
			getTeacherDayData() {
				let params = {
						int_day: this.selectDate,
						pagesize: 1000
				}
				if(this.eid != 0) {
					params.teach_eid = this.eid
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