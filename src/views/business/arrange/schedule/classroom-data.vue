<template>
	<tbody class="week-schedule-table-body">
		<tr v-for="(item,index) in data" @click="selectRow(index)" :class="current_row==index?'active':''">
			<td>{{item.room_name}}</td>
			<td class="cell-day-schedule" v-for="(arranges,daykey) in item.course_arrange">
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
			crId: {
				type: Number,
				default: 0
			},
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
			}
		},
		data() {
			return {
				current_row: -1,
				rest_api: 'course_arranges/classroom_course_by_week',
			}
		},
		mounted() {
			this.init_data()
		},
		watch: {
			'date':function(date) {
				this.init_schedule_data()
			},
			'crId':function(id) {
				this.pagenation(1)
			}
		},
		computed: {
			formatDate() {
				return moment(this.date).format('YYYY-MM-DD')
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
					this.pageIndex,this.pageSize,this.crId)
			},
			hook_get_param(param) {
				param.int_day = this.formatDate
				param.with_count = 'student_leave,student_absence'
				if(this.crId) {
					param.cr_id = this.crId
				}
				if(!this.perCheckAllArrange) {
					param.teach_eid = this.eid$
				}
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