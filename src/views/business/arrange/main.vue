<style lang="less">
@import '~@/style/mixin.less';
.arrange-main{
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
.arrange-table{
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
		&.arrange-day{
			vertical-align:top;
			background:#eee;
		}
	}
	.arrange-col-header{
		line-height:30px;
		text-align:center;
		color:#fff;
		background-color:#1892D1;
	}
	.arrange-cell-btn{
		background:#fff;
		padding:5px;
	}
}
.arrange-holiday{
	background:#eee;
	padding-top:100px;
	padding-bottom:100px;
	text-align:center;
}

</style>
<template>
<div class="arrange-main" v-loading="'course_arranges'">
	<table class="arrange-table">
		<thead>
			<tr>
				<th class="arrange-col-header" v-for="(item,index) in week_list">
					{{item.day_text}}<br>
					{{item.text}}
					
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<arrange-day
				v-for="(item,index) in week_list"
				:bid="bid"
				:year="year"
				:week="week"
				:week-date="item"
				:action="action"
				:mode="mode"
				:disable-sections="disableSections"
				:conditions="conditions"
				:arranges="filterArranges"
				:all-arranges="arranges"
				@on-ts-add="timeAdd"
				@on-cell-add="cellAddHandle"
				@on-cell-edit="cellEditHandle"
				>
				</arrange-day>
			</tr>
		</tbody>
	</table>
	<div class="mask" @click="backList" v-if="action != 'list'"></div>
	<slot></slot>
	<time-section-info-modal ref="tsInfo" :season="season" :week-day="current_week_day" @save="timeSectionSave"></time-section-info-modal>
</div>
</template>
<script>
import moment from 'moment'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {oneOf} from '@/libs/util'
import util   from '@/libs/util'
import arrangeCell from './cell.vue'
import arrangeDay from './day.vue'
import TimeSectionInfoModal from 'c%/TimeSectionInfoModal.vue'

export default {
	name:'arrangeMain',
	mixins:[common,globals],
	components:{
		arrangeCell,
		arrangeDay,
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
		week:{
			type:Number,
			default:1
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
                return oneOf(value, ['view','edit','list']);
            }
		},
		conditions:{
			type:Object,
			default(){
				return {}
			}
		},
		arranges:{
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
			current_week_day:0,
			season:'Q'
		}
	},
	methods:{
		dateTimeSections(dt){
			let week_day = util.get_week_day(dt)
			let season   = this.conditions.season.value
			return this.get_time_sections(week_day,season)
		},
		timeAdd(week_obj){
			let season = this.conditions.season.value
			this.current_week_day = week_obj.week_day
			this.season = season
			this.$r('tsInfo').show('添加时间段')
		},
		timeSectionSave({action,data}){
			this.$emit('on-time-section-add')
		},
		backList(){
			this.action = 'list'
		},
		cellAddHandle(ts){
			this.$emit('on-add-arrange',ts)
		},
		cellEditHandle($event){
			this.$emit('on-edit-arrange',$event)
		}
	},
	computed:{
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
		dataParams(){
			let params = {}
			params.bid = this.bid
			params.year = this.year
			params.pagesize = 3000
			return params
		},
		time_sections(){
			let branch_time_sections = this.$store.state.gvars.time_sections.filter(item=>{
				return (item.bid == this.bid )
			})
			if(branch_time_sections && branch_time_sections.length > 0){
				return branch_time_sections
			}
			return this.$store.state.gvars.time_sections.filter(item=>{
				return (item.bid == 0 )
			})
		},
		filterArranges(){
			let conditions = this.conditions

			return this.arranges.filter(item=>{
				
				if(conditions.lessons.current.id > 0 && conditions.lessons.current.id != item.lid){
					return false
				}
				if(conditions.teachers.current.id > 0 && conditions.teachers.current.id != item.teach_eid){
					return false
				}
				if(conditions.classrooms.current.id > 0 && conditions.classrooms.current.id != item.cr_id){
					return false
				}
				if(conditions.subjects.current.id > 0 && conditions.subjects.current.id != item.sj_id){
					return false
				}
				if(conditions.object.id > 0){
					if(conditions.object.lesson_type != item.lesson_type){
						return false
					}
					if(conditions.object.lesson_type == 0 ){
						if( item.cid != conditions.object.id){
							return false
						}
						
					}else{
						if(item.students.filter(s=>s.sid==conditions.object.id && item.lid == conditions.object.lid).length == 0){
							return false
						}

					}
				}
				return true
			})
		}
	}
}
</script>