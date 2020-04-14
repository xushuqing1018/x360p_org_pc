<template>
		<thead class="week-schedule-table-head">
			<tr>
				<th width="150" v-if="view!=='section'">时间段</th>
				<th width="36">
					<Button
						type="ghost"
						title="上一页"
						icon="chevron-left"
						@click="prevPage"
						:disabled="page==1">
					</Button>
				</th>
				<th v-for="item in data" class="cell-schedule-header">
					<letter-avatar
						size="30"
						:src="item.photo_url"
						:name="item.ename"
						:rounded="true"
						style="display: inline-block">
					</letter-avatar>
					<span>{{item.ename}}</span>
				</th>
				<th v-for="i in (10-data.length)" v-if="data.length<10" class="cell-schedule-header">
				</th>
				<th width="36">
					<Button 
						type="ghost" 
						title="下一页"
						icon="chevron-right"
						@click="nextPage"
						:disabled="isLastPage">
					</Button>
				</th>
			</tr>
		</thead>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'

	export default {
		mixins: [common],
		components: {
			LetterAvatar
		},
		props: {
			eid: {
				type: Number,
				default: 0
			},
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
			prevPage() {
				this.$emit('on-prev')
			},
			nextPage() {
				this.$emit('on-next')
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
			isLastPage() {
				return (Math.floor(this.total/10) + 1) == this.page
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
				if(this.view == 'classroom') {
					return 100
				}
				if(this.view == 'class'||this.view == 'one-to-one') {
					return 280
				}
				return 150
			}
		}
	}
</script>