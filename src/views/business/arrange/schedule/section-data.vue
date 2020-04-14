<template>
	<tbody class="week-schedule-table-body">
		<tr>
			<td class="cell-day-schedule" v-for="(day,daykey) in formatData" :style="{verticalAlign:is_empty(day)?'middle':'top'}">
				<template v-if="!is_empty(day)">
					<div class="cell-time-section" v-for="(value,key) in day">
						<Card dis-hover class="my-2 x-cell-card">
							<div slot="title">{{key}}</div>
							<schedule-cell :data="section" :view="view" @on-refresh="init_data" v-for="section in value" class="card-body-cell"></schedule-cell>
						</Card>
					</div>
				</template>
				<template v-else>
					<div class="text-center empty">
						<Tag type="border" color="blue" v-if="isHoliday(daykey)">{{holidayReason(daykey)}}</Tag>
					</div>
				</template>
			</td>
		</tr>
		<tr v-if="formatData.length==0">
			<td colspan="10">没有数据</td>
		</tr>
	</tbody>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import ScheduleCell from './day1-schedule-cell.vue'

	const DC = {}

	export default {
		mixins: [grid,common],
		components: {
			ScheduleCell
		},
		props: {
			view: {
				type: String,
				default: ''
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
			}
		},
		data() {
			return {
				rest_api: 'course_arranges/time_course_by_week'
			}
		},
		mounted() {
			this.init_data()
		},
		watch: {
			'date':function(date) {
				this.init_schedule_data()
			},
			isOnline(val){
				this.init_schedule_data()
			}
		},
		computed: {
			formatDate() {
				return moment(this.date).format('YYYY-MM-DD')
			},
			week_list(){
				let ret = [],
					week_dates = util.week_date_array(this.year,this.week)
				week_dates.forEach((dt,index)=>{
					ret.push(util.int(moment(dt).format('YYYYMMDD')))
				})
				return ret
			},
			formatData() {
				let out_data = {}
				this.week_list.forEach(day => {
					out_data[day] = {}
					let day_value = out_data[day],
						init_data = this.orderBy(this.data.filter(i => i.int_day==day),'int_start_hour')
					init_data.forEach(d => {
						let hour_key = util.sprintf('%s~%s',this.$filter('int_hour')(d.int_start_hour),
							this.$filter('int_hour')(d.int_end_hour))
						if(!day_value[hour_key]) {
							day_value[hour_key] = []
						}
						day_value[hour_key].push(d)
					})
				})
				return out_data
			}
		},
		methods: {
		    init_schedule_data() {
		    	let k = this.cache_key()
		    	if(!_.isUndefined(DC[k])) {
		    		this.data = DC[k]
		    	}else{
		    		this.init_data()
		    	}
		    },

		    deal_data(data) {
		    	let k = this.cache_key()
		    	DC[k] = data.list
		    	return data.list
		    },
		    cache_key() {
				return util.sprintf('%s~%s~%s~%s~%s',this.bid$,this.formatDate,
					this.pageIndex,this.pageSize,this.isOnline)
			},
			hook_get_param(param) {
				param.int_day = this.formatDate
				param.with_count = 'student_leave,student_absence'
				if(!this.perCheckAllArrange) {
					param.teach_eid = this.eid$
				}
				if(this.isOnline == 1){
					param.is_online = 1
				}
			},
			is_empty(data) {
				return _.isEmpty(data)
			}
		}
	}
</script>