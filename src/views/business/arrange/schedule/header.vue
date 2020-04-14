<template>
		<thead class="week-schedule-table-head">
			<tr>
				<th :width="first_column_width" v-if="view!=='section'">{{first_column}}</th>
				<th v-for="item in week_list" 
				class="cell-schedule-header" 
				:class="is_current(item)?'current-day':''"
				>
					<Button 
						class="ivu-btn-prev"
						type="text" 
						title="上一周"
						icon="chevron-left"
						@click="prevWeek"
						v-if="item.week_day==1"
						>
					</Button>
					<a 
					v-if="allowDayClick == 1"
					:title="`查看${item.day_text}日视图`" 
					href="javascript:void(0)" 
					@click.prevent="showDaySchedule(item)">
					{{item.day_text}}
					</a>
					<span v-else>
						{{item.day_text}}
					</span>
					<br>
					<span>{{item.text}}</span>
					<Button 
						class="ivu-btn-next"
						type="text" 
						title="下一周"
						icon="chevron-right"
						@click="nextWeek"
						v-if="item.week_day==7"
						>
					</Button>
				</th>
			</tr>
		</thead>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [common],
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
			allowDayClick:{
				type:Number,
				default:0
			}
		},
		data() {
			return {
				first_column_list: [
					{value: 'teacher',label: this.$filter('translate')('老师')},
					{value: 'classroom',label: '教室'},
					{value: 'section',label: '时间段'},
					{value: 'student',label: '学员'},
					{value: 'class',label: '班级'},
					{value: 'one-to-one',label:'一对一'}
				]
			}
		},
		methods: {
			showDaySchedule(item) {
				this.$emit('on-day-click', item.date);
			},
			prevWeek() {
		    	this.$emit('on-week-change',{action:'prev'})
		    },
		    nextWeek() {
		    	this.$emit('on-week-change',{action:'next'})
		    },
			is_current(item) {
				return item.int_day == moment().format('YYYYMMDD')
			}
		},
		computed: {
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
						day_text:moment(dt).format('MM/DD'),
						text:'周'+wd[index]
					})
				})
				return ret
			},
			first_column() {
				return this.first_column_list.find(item=>item.value==this.view).label
			},
			first_column_width() {
				if(this.view == 'class'||this.view == 'one-to-one') {
					return 260
				}
				return 100
			}
		}
	}
</script>