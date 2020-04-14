<template>
	<tbody class="week-schedule-table-body">
		<tr v-for="(item,index) in timeSectionData" v-if="hasCourseArrange(item)">
			<td>
				<span style="color: #2d8cf0" v-if="timeSectionLabel(item.int_start_hour) == '上午'">上午</span>
				<span style="color: #19be6b" v-if="timeSectionLabel(item.int_start_hour) == '下午'">下午</span>
				{{item.int_start_hour}}~{{item.int_end_hour}}
			</td>
			<td></td>
			<td class="cell-day-schedule" v-for="(arrange,arrangeIndex) in courseArrange(item)">
				<template v-if="arrange">
					<div class="cell-time-section">
						<schedule-cell :data="arrange" :view="view" @on-refresh="$emit('update')"></schedule-cell>
					</div>
				</template>
				<template v-else>
					<div class="text-center empty">
						<Icon type="ios-information"></Icon>
						<span>没有排课</span><br>
					</div>
				</template>
			</td>
			<template v-if="courseArrange(item).length<10">
				<td class="cell-day-schedule" v-for="i in (10-courseArrange(item).length)">
					<div class="text-center empty">
						<Icon type="ios-information"></Icon>
						<span>没有排课</span><br>
					</div>
				</td>
			</template>
			<td></td>
		</tr>
		<tr v-if="data.length==0">
			<td colspan="13">没有数据</td>
		</tr>
		<tr>
			<td colspan="13" class="p-2 text-right">
				<Page 
                	:total="total"
                	:current="page"
                	:page-size="10" 
                	:show-total="true"
                	@on-change="pagenation"
				>
                </Page>
			</td>
		</tr>
	</tbody>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import ScheduleCell from './day-schedule-cell.vue'

	const DC = {}

	export default {
		mixins: [common],
		components: {
			LetterAvatar,
			ScheduleCell
		},
		props: {
			eid: {
				type: Number,
				default: 0
			},
			view: {
				type: String,
				default: ''
			},
			date: {
				type: String,
				default: moment().format('YYYY-MM-DD')
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
			},
			data:{
				type:Array,
				default:() => {
					return []
				}
			},
			page:{
				type:Number,
				default:1
			},
			total:{
				type:Number,
				default:0
			},
			isOnline:{
				type:Number,
				default:0
			}
		},
		data() {
			return {
				current_row: -1,
				timeSectionData: []
			}
		},
		mounted() {
			this.initTimeSection();
		},
		computed: {
			formatDate() {
				return moment(this.date).format('YYYY-MM-DD')
			}
		},
		watch: {
			'date':function(date) {
				this.init_schedule_data()
			},
			'eid':function(id) {
				this.pagenation(1)
			},
			isOnline(val){
				this.init_schedule_data()
			}
		},
		methods: {
			hasCourseArrange(timeSection) {
				let has = this.courseArrange(timeSection).find(item => {
					return item !== null
				})
				return has
			},
			courseArrange(timeSection) {
				let rst = this.data.map(item => {
					let list = [];
					for(let key in item.course_arrange) {
						list = item.course_arrange[key];
					}
					let int_start_hour = Number(this.$filter('format_int_hour')(timeSection.int_start_hour)),
						int_end_hour = Number(this.$filter('format_int_hour')(timeSection.int_end_hour));
					let course_arrange = list.find(item => {
						return (int_start_hour == item.int_start_hour)&&(int_end_hour == item.int_end_hour)
					})
					return course_arrange?course_arrange:null
				})
				return rst
			},
			timeSectionLabel(time) {
				let hour = parseInt(time.split(':')[0]);
				if(hour<12) {
					return '上午'
				}
				else {
					return '下午'
				}
			},
			initTimeSection() {
				this.$http.get('time_sections',{
					params: {
						bid: 0,
						season: 'A',
						order_field: 'time_index',
						order_sort: 'asc'
					}
				})
				.then(res => {
					var list = res.body.data.list;
					let weekIndex = moment(this.date,'YYYY-MM-DD').day();
					this.timeSectionData = list.filter(item => {
						return item.week_day == weekIndex
					})
				},res => {
					this.$Message.error(res.body.message)
				})
			},
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
					this.pageIndex,this.pageSize,this.eid,this.isOnline)
			},
			hook_get_param(param) {
				param.int_day = this.formatDate
				param.with_count = 'student_leave,student_absence'
				if(this.eid>0) {
					param.teach_eid = this.eid
				}
				if(!this.perCheckAllArrange) {
					param.teach_eid = this.eid$
				}
				if(this.isOnline == 1){
					param.is_online = 1
				}
			},
			pagenation(page){
				this.$emit('pagenation', page)
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