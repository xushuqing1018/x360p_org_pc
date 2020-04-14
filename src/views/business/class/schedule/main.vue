<style lang="less">
@import '~@/style/mixin.less';
.schedule-main{
	min-height:880px;
	position:relative;
	.mask{
		.alpha-background();
		position:absolute;
		left:0;
		top:0;
		width:100%;
		height:100%;
		z-index:20;
	}
}
.schedule-table{
	width:100%;
	border-collapse:collapse;
	thead{
		th{
			min-width:106px;
			border:1px solid #fff;
		}
	}
	td{
		border:1px solid #fff;
		&.schedule-cell{
			vertical-align:top;
			background:#eee;
		}
	}
	.schedule-col-header{
		height:60px;
		line-height:60px;
		text-align:center;
		color:#fff;
		background-color:#1892D1;
	}
	.schedule-cell-btn{
		background:#fff;
		padding:5px;
	}
}

</style>
<template>
<div class="schedule-main" v-loading="'class_schedules'">
	<table class="schedule-table">
		<thead>
			<tr>
				<th class="schedule-col-header" v-for="(item,index) in week_list">
					{{item.text}}
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="schedule-cell" v-for="(item,index) in week_list">
					<schedule-cell 
					:bid="bid"
					:year="year"
					:season="season"
					:time-section="ts" 
					:action="action"
					:mode="mode"
					:disable-sections="disableSections" 
					:conditions="conditions" 
					:schedules="schedules"
					@on-cell-add="cellAddHandle" 
					@on-cell-edit="cellEditHandle" 
					v-for="ts in weekDayTimeSections(item.week_day)" >
					</schedule-cell>

					<div class="schedule-cell-btn">
						<Button v-per="'time.add'" @click="timeAdd(item.week_day)" type="ghost" long><Icon type="plus"></Icon></Button>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
	<div class="mask" v-if="action != 'list'"></div>
	<slot></slot>
	<time-section-info-modal ref="tsInfo" :season="season" :week-day="current_week_day" @save="timeSectionSave"></time-section-info-modal>
</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {oneOf} from '@/libs/util'
import scheduleCell from './cell.vue'
import TimeSectionInfoModal from 'c%/TimeSectionInfoModal.vue'

export default {
	name:'scheduleMain',
	mixins:[common,globals],
	components:{
		scheduleCell,
		TimeSectionInfoModal
	},
	props:{
		bid:{
			type:Number,
			default:0
		},
		year:{
			type:Number,
			default:0
		},
		season:{
			type:String,
			default:'Q',
			validator(value){
				return oneOf(value,['C','S','Q','H','A'])
			}
		},
		action:{
			type:String,
			default:'list',
			validator(value){
				return oneOf(value,['list','add','edit'])
			}
		},
		mode:{
			type:String,
			default:'view',
			validator (value) {
                return oneOf(value, ['view','edit']);
            }
		},
		conditions:{
			type:Object,
			default:{}
		},
		schedules:{
			type:Array,
			default(){
				return []
			}
		},
		disableSections:{
			type:Array,
			default(){
				return []
			}
		}
	},
	data(){
		return {
			
			current_week_day:1,
			weekdays:[1,2,3,4,5,6,7],
			base:{
				time_sections:[],
				date:['',''],
				schedules:[],
				week_day_sections:{1:[],2:[],3:[],4:[],5:[],6:[],7:[]}
			},
		}
	},
	mounted(){
		
	},
	watch:{
		
	},
	methods:{		
		weekDayTimeSections(week_day){
			let filter1 = (item)=>{
				return item.bid == this.bid && item.season == this.season && item.week_day == week_day
			}
			let filter2 = (item)=>{
				return item.bid == 0 && item.season == this.season && item.week_day == week_day
			}
			let branch_time_sections = this.$store.state.gvars.time_sections.filter(filter1)
			if(branch_time_sections && branch_time_sections.length > 0){
				return branch_time_sections
			}
			return this.$store.state.gvars.time_sections.filter(filter2)
		},
		timeAdd(week_day){
			this.current_week_day = week_day
			this.$r('tsInfo').show('添加时间段')
		},
		timeSectionSave({action,data}){
			this.$emit('on-time-section-add')
		},
		backList(){
			this.action = 'list'
		},
		cellAddHandle(ts){
			this.$emit('on-add-schedule',ts)
		},
		cellEditHandle($event){
			this.$emit('on-edit-schedule',$event)
		}
	},
	computed:{
	    week_list(){
			let wd = ['一','二','三','四','五','六','天']
			let ret = []
			wd.forEach((key,index)=>{
				ret.push({
					week_day:index+1,
					text:'星期'+key
				})
			})
			return ret
		},
		dataParams(){
			let params = {}
			params.bid = this.bid
			params.year = this.year
			params.season = this.season
			params.pagesize = 3000
			return params
		},
		time_sections(){
			let branch_time_sections = this.$store.state.gvars.time_sections.filter(item=>{
				return (item.bid == this.bid && item.season == this.season)
			})
			if(branch_time_sections && branch_time_sections.length > 0){
				return branch_time_sections
			}
			return this.$store.state.gvars.time_sections.filter(item=>{
				return (item.bid == 0 && item.season == this.season)
			})


		}
	}
}
</script>