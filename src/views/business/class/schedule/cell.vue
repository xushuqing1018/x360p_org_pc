<style lang="less">
@import '~@/style/mixin.less';
.class-schedule-cell{
	position:relative;
	height:90px;
	border-bottom:1px solid #eee;
	color:#000;
	background-color:#fff;
	&.full{
		background-color:#086703;
		color:#f4f4f4;
	}
	&.notfull{
		background-color:#1892D1;
		color:#fff;
	}
	&.disable{
		background-color:#cccccc;
		color:#666;
	}
	
	.cell-label{
		text-align:center;
		padding-top:15px;
		line-height:30px;
	}
	.cell-count{
		text-align:center;
		line-height:30px;
	}
	.cell-popup{
		min-width:180px;
		width:160%;
		position:absolute;
		display:none;
		z-index:11;
		background:#fff;
		top:90px;
		left:-30%;
		.rounded(5px);
		.drop-shadow(2px,4px,10px,0.6);

		.arrow-up{
			width: 0;
			height: 0;
			border-left: 10px solid transparent;
			border-right: 10px solid transparent;
			border-bottom: 10px solid #1892D1;
			position:absolute;
			top:-10px;
			left:45%;
		}
	}
	.cell-popup-title{
		background-color:#1892D1;
		color:#fff;
		line-height:30px;
		text-align:center;
	}

	&:hover,&.hover{
		.cell-popup{
			display:block;
		}
	}
	p.empty{
		text-align:center;
	}
	.cell-popup-body{
		padding-top:10px;
		color:#333;
	}
	.schedule-list{
		background:#eee;
		border-top:1px solid #eee;
	}
	.schedule-list-item{
		.clearfix();
		margin:5px;
		background:#fff;
		border-bottom:1px solid #ccc;
		.rounded(5px);
		.class-name{
			height:20px;
			text-align:center;
			line-height:20px;
			border-bottom:1px solid #eee;
		}
		.class-teacher{
			width:50%;
			height:20px;
			line-height:20px;
			text-align:center;
			border-right:1px solid #eee;
			float:left;
		}
		.class-room{
			width:49%;
			height:20px;
			line-height:20px;
			text-align:center;
			float:right;
		}
	}
	.cell-popup-btn{
		border-top:1px solid #f2f2f2;
		padding:10px 20px;
	}
}
</style>
<template>
	<div class="class-schedule-cell" :class="{'notfull':notfull,'full':isfull,'disable':isDisable}">
		<div class="cell-label">{{timeSectionLabel}}</div>
		<div class="cell-count"><Progress :percent="fullPercent" :stroke-width="10">{{total}}/{{max}}</Progress></div>
		<div class="cell-popup">
			<span class="arrow-up"></span>
			<div class="cell-popup-title">{{timeSection.int_start_hour}}~{{timeSection.int_end_hour}}</div>
			<div class="cell-popup-body">
				<p class="empty" v-if="this.total == 0">该时段在相应条件下没有排班记录</p>
				<div class="schedule-list" v-else>
					<div class="schedule-list-item" v-for="s in filterSchedules">
						<div class="class-name" @click="classClickHandle(s)">{{s.classes.class_name}}</div>
						<div class="class-teacher" @click="teacherClickHandle(s)"><Icon type="ios-person"></Icon>{{s.classes.teach_eid|employee_name}}</div>
						<div class="class-room" @click="classroomClickHandle(s)"><Icon type="ios-home"></Icon>{{s.classes.cr_id|classroom_name}}</div>
					</div>
				</div>
			</div>
			<div class="cell-popup-btn">
				<Button @click="add" :disabled="isAddDisable" type="ghost" long><Icon type="plus"></Icon></Button>
			</div>
		</div>
	</div>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import store from '@/store'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'


export default {
	name:'scheduleCell',
	mixins:[common,globals],
	props:{
		schedules:{
			type:Array,
			default:[]
		},
		disableSections:{
			type:Array,
			default:[]
		},
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
			default(){
				return {}
			}
		},
		timeSection:{
			type:Object,
			default(){
				return {}
			}
		}
	},
	data(){
		return {

		}
	},
	methods:{
		add(){
			this.$emit('on-cell-add',this.timeSection)
		},
		classClickHandle(cs){
			this.$emit('on-cell-edit',{data:cs,ts:this.timeSection,condition:'class'})
		},
		teacherClickHandle(cs){
			this.$emit('on-cell-edit',{data:cs,ts:this.timeSection,condition:'teacher'})
		},
		classroomClickHandle(cs){
			this.$emit('on-cell-edit',{data:cs,ts:this.timeSection,condition:'classroom'})
		}
	},
	computed:{
		timeSectionLabel(){
			if(this.timeSection.name){
				return this.timeSection.name
			}
			return util.sprintf('%s ~ %s',this.timeSection.int_start_hour,this.timeSection.int_end_hour)
		},
		max(){
			let conditions = this.conditions
			if(conditions.teachers.current.id != 0 || conditions.classrooms.current.id != 0){
				return 1
			}
			return Math.min(this.teachers.length,this.classrooms.length)
		},
		total(){
			return this.filterSchedules.length
		},
		fullPercent(){
			return 100*(this.total / this.max)
		},
		isfull(){
			return this.max == this.total
		},
		notfull(){
			return this.total > 0 && this.total < this.max
		},
		isempty(){
			return this.total == 0
		},
		isAddDisable(){
			return this.isfull || this.isDisable
		},
		isDisable(){
			let ts_key = [this.timeSection.week_day,this.timeSection.int_start_hour,this.timeSection.int_end_hour].join('-')
			if(this.disableSections.indexOf(ts_key) !== -1){
				return true
			}
			return false
		},
		filterSchedules(){
			let ts = this.timeSection
			return this.schedules.filter(s=>s.week_day == ts.week_day && s.int_start_hour == ts.int_start_hour && s.int_end_hour == ts.int_end_hour)
		},
		teachers(){
			let lists = this.$store.state.gvars.employees
			let bid   = this.bid
			let rid   = 1		//老师角色是1
			function filter(key,bid,rid){
				return function(item){
					return item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 
				}
				
			}
			return lists.filter(filter(this.conditions.teachers.key,bid,rid))
		},
		classrooms(){
			let lists = this.$store.state.gvars.classrooms
			let bid   = this.bid
			function filter(key,bid){
				return function(item){
					return item.bid == bid
				}	
			}
			return lists.filter(filter(this.conditions.classrooms.key,bid))
		}

	}
}
</script>