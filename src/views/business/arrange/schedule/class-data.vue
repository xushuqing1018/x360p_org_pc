<template>
	<tbody class="week-schedule-table-body section">
		<tr v-for="(item,index) in data" @click="selectRow(index)" :class="current_row==index?'active':''">
			<td>
				<Card dis-hover class="m-2 x-cell-card" style="font-size:12px">
					<div slot="title">{{item.class_name}}</div>
					<div class="class-info">
						<Row>
							<Col span="8" class="text-right">
								<span>招生情况：</span><br/>
								<span>排课情况：</span><br/>
								<span>授课情况：</span>
							</Col>
							<Col span="16" class="text-left">
								<Progress
									:percent="100*(item.student_nums/item.plan_student_nums)" 
									:storkeWidth="5">{{item.student_nums}}/{{item.plan_student_nums}}
								</Progress>
								<Progress 
									:percent="100*(item.arrange_times/item.lesson_times)" 
									:storkeWidth="5">{{item.arrange_times}}/{{item.lesson_times}}
								</Progress>
								<Progress 
									:percent="100*(item.attendance_times/item.lesson_times)" 
									:storkeWidth="5">{{item.attendance_times}}/{{item.lesson_times}}
								</Progress>
							</Col>
						</Row>
					</div>
				</Card>
			</td>
			<td class="cell-day-schedule" v-for="(arranges,daykey) in item.course_arrange" :style="{verticalAlign:arranges.length==0?'middle':'top'}">
				<template v-if="arranges.length>0">
					<div class="cell-time-section" v-for="section in orderBy(arranges,'int_start_hour')">
						<schedule-cell :data="section" :view="view" @on-refresh="init_data"></schedule-cell>
					</div>
				</template>
				<template v-else>
					<div class="text-center empty">
						<Tag type="border" color="blue" v-if="isHoliday(daykey)">{{holidayReason(daykey)}}</Tag>
					</div>
				</template>
			</td>
		</tr>
		<tr v-if="data.length==0">
			<td colspan="10">没有数据</td>
		</tr>
		<tr>
			<td colspan="10" class="p-2 text-right">
				<Page 
                	:total="total" 
                	:current="pageIndex" 
                	:show-sizer="true" 
                	:page-size="pageSize" 
                	:show-total="true" 
                	@on-change="pagenation" 
                	@on-page-size-change="pagesize">
                </Page>
			</td>
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
			perScope: {
				type: String,
				default: ''
			},
			view: {
				type: String,
				default: ''
			},
			cid: {
				type: Number,
				default: 0
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
				current_row: -1,
				rest_api: 'course_arranges/class_course_by_week'
			}
		},
		watch: {
			'date':function(date) {
				this.init_schedule_data()
			},
			'cid':function(id) {
				this.pagenation(1)
			},
			'perScope':function(val) {
				this.pagenation(1)
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
				return util.sprintf('%s~%s~%s~%s~%s~%s',this.bid$,this.formatDate,
					this.pageIndex,this.pageSize,this.cid,this.isOnline)
			},
			hook_get_param(param) {
				param.int_day = this.formatDate
				param.with_count = 'student_leave,student_absence'
				if(this.cid > 0) {
					param.cid = this.cid
				}
				if(this.perScope == 'my') {
					param.my = true
				}
				if(!this.perCheckAllArrange) {
					param.teach_eid = this.eid$
				}
				param.status = '[in,0,1]'
				if(this.isOnline == 1){
					param.is_online = 1
				}
			},
			is_empty(data) {
				return _.isEmpty(data)
			},
			pagenation(page){
	            this.pageIndex = page            
	            this.init_data()           
	        },
	        pagesize(pagesize){
	            this.pageSize = pagesize
	            this.init_data()
	        },
	        selectRow(index) {
	        	if(this.current_row==index) {
	        		this.current_row = -1
	        	}else{
	        		this.current_row = index
	        	}
	        }
		}
	}
</script>