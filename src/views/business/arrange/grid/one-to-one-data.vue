<template>
	<tbody class="week-schedule-table-body">
		<tr v-for="(item,index) in data" @click="selectRow(index)" :class="current_row==index?'active':''">
			<td>
				<Card dis-hover class="m-2 x-cell-card" style="font-size:12px">
					<div slot="title">
						<Row type="flex" align="middle">
							<Col span="6" offset="6">
								<letter-avatar
									size="32"
									:src="item.student.photo_url"
									:name="item.student.student_name"
									:rounded="true">
								</letter-avatar>
							</Col>
							<Col span="12" class="text-left">
								<span style="width:70%">{{item.student.student_name}}</span>
							</Col>
						</Row>
					</div>
					<div class="class-info">
						<Row>
							<Col span="8" class="text-right">
								<span>课程：</span><br/>
								<span>排课情况：</span><br/>
								<span>授课情况：</span>
							</Col>
							<Col span="16" class="text-left">
								<span>{{item.lid|lesson_name}}</span><br/>
								<Progress 
									:percent="100*((item.lesson_hours-item.remain_arrange_hours)/item.lesson_hours)" 
									:storkeWidth="5">{{item.lesson_hours-item.remain_arrange_hours}}/{{item.lesson_hours}}
								</Progress>
								<Progress 
									:percent="100*(item.use_lesson_hours/item.lesson_hours)" 
									:storkeWidth="5">{{item.use_lesson_hours}}/{{item.lesson_hours}}
								</Progress>
							</Col>
						</Row>
					</div>
				</Card>
			</td>
			<td v-for="day in week_list" style="vertical-align:top">
				<arrange-day
					:view="view"
					:date="day.date" 
					:year="year"
					:week="week"
					:arranges="arranges"
					:teach-object="item"
					:conditions="conditions"
					@on-refresh="refreshData">
				</arrange-day>
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
	import globals from '@/libs/globals.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import ArrangeDay  from './day.vue'

	const DC = {}

	export default {
		mixins: [grid,common,globals],
		components: {
			LetterAvatar,
			ArrangeDay
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
			arranges:{
				type:Array,
				default(){
					return []
				}
			},
			conditions:{
				type:Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				current_row: -1,
				rest_api: 'student_lessons'
			}
		},
		computed: {
			formatDate() {
				return moment(this.date).format('YYYY-MM-DD')
			},
			week_list(){
				let wd = ['一','二','三','四','五','六','日']
				let ret = []
				let week_dates = util.week_date_array(this.year,this.week)
				week_dates.forEach((dt,index)=>{
					ret.push({
						date:dt,
						week_day:index+1,
						season:this.get_season_by_date(dt),
						int_day:util.int(moment(dt).format('YYYYMMDD')),
						day_text:moment(dt).format('YYYY-MM-DD'),
						text:'周'+wd[index]
					})
				})
				return ret
			},
		},
		mounted() {
			this.init_data()
		},
		watch: {
			'perScope':function(val) {
				this.pagenation(1)
			},
			'conditions.sid':function(id) {
				this.pagenation(1)
			}
		},
		methods: {
			hook_get_param(param) {
				if(this.perScope == 'my') {
					param.my = true
				}
				if(this.conditions.sid>0) {
					param.sid = this.conditions.sid
				}
				param.lesson_type = 1
				param.with = 'student'
			},
	        selectRow(index) {
	        	if(this.current_row==index) {
	        		this.current_row = -1
	        	}else{
	        		this.current_row = index
	        	}
	        },
	        refreshData() {
	        	this.init_data()
				this.$emit('on-refresh')
			}
		}
	}
</script>