<template>
	<tbody class="week-schedule-table-body">
		<tr v-for="(item,index) in data" @click="selectRow(index)" :class="current_row==index?'active':''">
			<td>
				<span>{{item.room_name}}</span>
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
				rest_api: 'classrooms'
			}
		},
		mounted() {
			this.init_data()
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
		watch: {
			'conditions.cr_id':function(id) {
				this.pagenation(1)
			}
		},
		methods: {
			hook_get_param(param) {
				if(this.conditions.cr_id>0) {
					param.cr_id = this.conditions.cr_id
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
	        },
	        refreshData() {
				this.$emit('on-refresh')
			}
		}
	}
</script>