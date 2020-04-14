<style lang="less">
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
	<div>
		<table class="schedule-table">
			<thead>
				<tr>
					<th class="schedule-col-header" v-for="(item,index) in week_list">
						{{item.text}}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="ready">
					<td class="schedule-cell" v-for="(item,index) in week_list">
						<!--v-for="ts in base.week_day_sections[item.week_day]"-->
						<season-schedule-cell						
						v-for="ts in weekDayTimeSections(item.week_day)"
						@on-select="addSchedule" 
						@on-cancel="cancelSchedule" 
						@on-select-room="changeScheduleRoom"
						@on-room-add="roomAdd"
						:cr-id="crId" 
						:room-list="roomList" 
						:week-day="item.week_day"
						:time-section="ts" 
						:schedules="base.schedules" 
						:max="max"
						>
						</season-schedule-cell>
						<div class="schedule-cell-btn">
							<Button v-per="'time.add'" @click="timeAdd(item.week_day)" type="ghost" long><Icon type="plus"></Icon></Button>
						</div>
					</td>
				</tr>
				<tr v-else>
					<td colspan="7">
						<div class="spin-container">
							<Spin fix>正在加载时间段数据...</Spin>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<time-section-info-modal ref="tsInfo" :season="season" :week-day="current_week_day" @save="timeSectionSave"></time-section-info-modal>
	</div>
</template>

<script>
	import Vue from 'vue'
	import store from '@/store'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import seasonScheduleCell from 'c%/SeasonScheduleCell.vue'
	import TimeSectionInfoModal from 'c%/TimeSectionInfoModal.vue'
	const CACHE = {}
	export default{
		name:'SeasonSchedule',
		mixins:[common,globals],
		components: {
			seasonScheduleCell,
			TimeSectionInfoModal
		},
		props: {
			value: {
				type:Array,
				default:[]
			},
			season: String,
			crId: {
				type:[Number,String],
				default:0 
			},
			roomList: Array,
			max: Number,
			eid: Number,
		},
		data () {
			return {
				ready: false,
				action:'list',
				current_week_day:1,
				year:(new Date()).getFullYear(),
				weekdays:[1,2,3,4,5,6,7],
				cache:{

				},
				base:{
					time_sections:[],
					date:['',''],
					schedules: this.value,
					week_day_sections:{1:[],2:[],3:[],4:[],5:[],6:[],7:[]}
				}
			}
		},
		watch: {
			season: function (val){
				this.refresh_base_data()
			},
			value: function (val){
				this.base.schedules = val
			}
		},
		mounted(){
			this.init()
		},
		computed: {
			branch(){
		      return this.$store.state.branch
		    },
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
			time_sections(){
				let branch_time_sections = this.$store.state.gvars.time_sections.filter(item=>{
					return (item.bid == this.bid$ && item.season == this.season)
				})
				if(branch_time_sections && branch_time_sections.length > 0){
					return branch_time_sections
				}
				return this.$store.state.gvars.time_sections.filter(item=>{
					return (item.bid == 0 && item.season == this.season)
				})	
	
			}
		},
		methods: {
			weekDayTimeSections(week_day){
				let filter1 = (item)=>{
					return item.bid == this.bid$ && item.season == this.season && item.week_day == week_day
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
			init(){
				this.ready = false
				this.buildIdMap(this.roomList,'classrooms')
				this.init_base_data().then(()=>{
					this.ready = true
				})
			},
			init_base_data(refresh){
				return new Promise((resolve,reject)=>{
					refresh = refresh || false
					let ck = ['ts',this.branch.id,this.year,this.season].join('-')
					let ck_date = ck+'-date'
					if(!refresh){
						if(CACHE[ck]){
							this.$set(this.base,'time_sections',CACHE[ck])
							this.$set(this.base,'date',CACHE[ck_date])
							this.refresh_time_sections()
							resolve(CACHE[ck])
							return
						}
					}
					
					this.$rest('branches').add_url_param(this.branch.id,'time_sections')
					.get({year:this.year,season:this.season})
					.success(response=>{
							CACHE[ck] = response.list
							CACHE[ck_date] = response.date
							this.$set(this.base,'time_sections',response.list)
							this.$set(this.base,'date',response.date)
							this.refresh_time_sections()
							resolve(response.list)
					})
					.error(response=>{
						reject(response)
					})
				})
			},
			refresh_base_data(){
				this.ready = false
				this.init_base_data().then(()=>{
					this.ready = true
				})
			},
			refresh_time_sections(){
				this.weekdays.forEach(week_day=>{
					this.$set(this.base.week_day_sections,week_day,this.base.time_sections.filter(ts=>ts.week_day==week_day)||[])
				})
			},
			addSchedule(s){
				if(this.max > 0 && this.base.schedules.length >= this.max){
					return false
				}
				this.base.schedules.push(s)
				this.$emit('input',this.base.schedules)
			},
			cancelSchedule(s){
				let index = this.base.schedules.indexOf(s)
				this.base.schedules.splice(index,1)
				this.$emit('input',this.base.schedules)
			},
			changeScheduleRoom({schedule,cr_id}){
				let index = this.base.schedules.indexOf(schedule)
				this.base.schedules[index].cr_id = cr_id
				this.$emit('input',this.base.schedules)
			},
			roomAdd(){
				this.$emit('on-room-add')
			},
			timeAdd(week_day){
				this.current_week_day = week_day
				this.$r('tsInfo').show('添加时间段')
			},
			timeSectionSave({action,data}){
				this.ready = false
				this.init_base_data(true).then(()=>{
					this.ready = true
				})
				this.$emit('on-time-section-add')
			}
			
		}
	}
</script>
