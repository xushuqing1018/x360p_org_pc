<template>
	<tbody class="week-schedule-table-body day_table_body">
		<tr v-for="(item,index) in timePointData">
			<td>{{item}}</td>
			<td class="cell-point-schedule" v-for="arranges in courseArrange(item)">
				<div class="cell-time-section" v-for="arrange in arranges" :style="tdMarginStyle(item,arranges)">
					<schedule-cell :data="arrange" @on-refresh="$emit('update')"></schedule-cell>
				</div>
			</td>
			<td class="cell-point-schedule" v-for="i in (10-courseArrange(item).length)"></td>
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
	import ScheduleCell from './day1-schedule-cell.vue'

	const DC = {}

	function initTimePoint() {
		let ret = []
		for(let i=8;i<23;i++) {
			if(i<10) {
				ret.push('0'+i+':00')
			}
			else {
				ret.push(i+':00')
			}
		}
		return ret
	}

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
				timePointData: initTimePoint()
			}
		},
		mounted() {
			
		},
		computed: {
			formatDate() {
				return moment(this.date).format('YYYY-MM-DD')
			}
		},
		watch: {
			
		},
		methods: {
			hasCourseArrange(time) {
				let has = this.courseArrange(time).find(item => {
					return item !== null
				})
				return has
			},
			courseArrange(time) {
				let rst = this.data.map(item => {
					let list = [];
					for(let key in item.course_arrange) {
						list = item.course_arrange[key];
					}
					let int_start_hour = Number(this.$filter('format_int_hour')(time))
					let int_end_hour   = int_start_hour + 100
				
					return this.orderBy(list.filter(item => item.int_start_hour >= int_start_hour && item.int_start_hour < int_end_hour),'int_end_hour')
				})
				return rst
			},
			pagenation(page){
				this.$emit('pagenation', page)
	        },
	        tdMarginStyle(item,arranges) {
	        	if(arranges.length == 1 
	        		&& arranges[0].int_start_hour > Number(this.$filter('format_int_hour')(item))) {
	        		return {
	        			marginTop:'30px',
	        			marginBottom: '30px'
	        		}
	        	}
	        	return {}
	        }
		}
	}
</script>
<style lang="less">
	.day_table_body {
		td {
			height: 100px;
			min-width: 80px;
			vertical-align: top;
			&:first-child {
				vertical-align: top;
				font-size: 14px;
				color: #000;
			}
			&:nth-child(odd) {
				background: #fff;
			}
			&:nth-child(even) {
				background: #f9f9f9;
			}
		}
	}
	.day_table_header {
		th {
			&:nth-child(even) {
				background: #fff;
			}
			&:nth-child(odd) {
				background: #f9f9f9;
			}
		}
		.ivu-btn-prev {
			position: absolute;
			left: 0;
			top: 8px;
		}
		.ivu-btn-next {
			position: absolute;
			right: 0;
			top: 8px;
		}
	}
	.cell-point-schedule {
		.cell-time-section:not(:last-child) {
			margin-bottom: 8px;
		}
	}
</style>