<style lang="less">
@import '~@/style/mixin.less';
.arrange-cell{
	position:relative;
	height:90px;
	border-bottom:1px solid #eee;
	color:#000;
	background-color:#fff;
	&.full{
		background-color:#086703;
		color:#f4f4f4;
		&.isempty{
			background:#ccc !important;
			color:#666 !important;
		}
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
	.arrange-list{
		background:#eee;
		border-top:1px solid #eee;
	}
}
.drop{
	&.allowed{
		.arrange-cell{
			border:2px solid #00f;
		}
	}
}
</style>
<template>
	<drop 
	class="drop" 
	:class="{allowed:isAllow()}"
	@dragover="handleDragOver" 
	@drop="handleDrop">
		<div 
		class="arrange-cell" 
		:class="{'notfull':notfull,'full':isfull,'disable':isDisable,'isempty':isempty}"
		>
			<div class="cell-label">{{timeSectionLabel}}</div>
			<div class="cell-count"><Progress :percent="fullPercent" :stroke-width="10">{{total}}/{{max}}</Progress></div>
			<div class="cell-popup">
				<span class="arrow-up"></span>
				<div class="cell-popup-title">{{timeSection.int_start_hour}}~{{timeSection.int_end_hour}}</div>
				<div class="cell-popup-body">
					<p class="empty" v-if="this.total == 0">该时段在相应条件下没有排课</p>
					<div class="arrange-list" v-else>
						<arrange-item
						:info="s"
						@click="arrangeClickHandle"
						v-for="s in filterArranges"
						>
						</arrange-item>
					</div>
				</div>
				<div class="cell-popup-btn" v-if="mode=='view'">
					<Button @click="add" :disabled="isAddDisable" type="ghost" long><Icon type="plus"></Icon></Button>
				</div>
			</div>
		</div>
	</drop>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import store from '@/store'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import arrangeItem from './item.vue'



export default {
	name:'arrangeCell',
	mixins:[common,globals],
	components:{
		arrangeItem
	},
	props:{
		arranges:{
			type:Array,
			default(){
				return []
			}
		},
		allArranges:{
			type:Array,
			default(){
				return []
			}
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
		timeSection:{
			type:Object,
			default(){
				return {}
			}
		},
		weekDate:{
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
		isAllow(){
			if(this.action != 'list'){
				return false
			}
			if(this.isfull){
				return false
			}
			let allow_field = ['object','eid','cr_id']
			let field = this.$store.state.drag.field
			let data  = this.$store.state.drag.data
			if(allow_field.indexOf(field) === -1){
				return false
			}
			switch(field){
				case 'eid':
					if(this.filterArranges.filter(item=>item.teach_eid == data.eid).length > 0){
						return false
					}
					break;
				case 'cr_id':
					if(this.filterArranges.filter(item=>item.cr_id == data.cr_id).length > 0){
						return false
					}
					break;
				case 'object':
					if(this.filterArranges.filter(
						item=>{
							if(item.lesson_type == 0){
								if(item.cid == data.cid){
									return true
								}
							}else{
								if(item.students.filter(s=>s.sid==data.sid && s.lid == data.lid).length > 0){
									return true
								}
							}
							return false
						}
						).length > 0){
						return false
					}
					break;
			}
			return true
		},
		add(){
			let ts = {
				int_start_hour:this.timeSection.int_start_hour,
				int_end_hour:this.timeSection.int_end_hour,
				int_day:this.weekDate.int_day,
				week_day:this.weekDate.week_day
			}
			this.$emit('on-cell-add',{ts:ts})
		},
		arrangeClickHandle(arrange){
			let ts = {
				int_start_hour:this.timeSection.int_start_hour,
				int_end_hour:this.timeSection.int_end_hour,
				int_day:this.weekDate.int_day,
				week_day:this.weekDate.week_day
			}
			this.$emit('on-cell-edit',{arrange:arrange,ts:ts})
		},
		handleDrop(data){
			let ts = {
				int_start_hour:this.timeSection.int_start_hour,
				int_end_hour:this.timeSection.int_end_hour,
				int_day:this.weekDate.int_day,
				week_day:this.weekDate.week_day
			}
			this.$emit('on-cell-add',{ts:ts,data:data})
		},
		handleDragOver(data,event){
			if(this.isfull || !this.isAllow()){
				event.dataTransfer.dropEffect = 'none';
			}
		},
		teacherArrangeNums(eid){
			
			let ts = this.timeSection
			let int_start_hour = util.int(util.format_int_hour(ts.int_start_hour))
			let int_end_hour = util.int(util.format_int_hour(ts.int_end_hour))
			let int_day = this.weekDate.int_day
			return this.allArranges.filter(
				s=>{
					return (
						s.int_day == int_day && 
						s.int_start_hour == int_start_hour && 
						s.int_end_hour == int_end_hour &&
						s.teach_eid == eid
					)
				}
			).length
		},
		classroomArrangeNums(cr_id){
			let ts = this.timeSection
			let int_start_hour = util.int(util.format_int_hour(ts.int_start_hour))
			let int_end_hour = util.int(util.format_int_hour(ts.int_end_hour))
			let int_day = this.weekDate.int_day
			return this.allArranges.filter(
				s=>{
					return (
						s.int_day == int_day && 
						s.int_start_hour == int_start_hour && 
						s.int_end_hour == int_end_hour &&
						s.cr_id == cr_id
					)
				}
			).length
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
			if(conditions.teachers.current.id != 0 && conditions.classrooms.current.id != 0){
				let n1 = this.teacherArrangeNums(conditions.teachers.current.id) > 0?1:0
				let n2 = this.classroomArrangeNums(conditions.classrooms.current.id) > 0 ?1:0
				let n = n1+n2
				if(n > 1){
					return 1
				}else if(n==1){
					return 0
				}else{
					return 1
				}
			}else{
				if(conditions.teachers.current.id != 0 || conditions.classrooms.current.id != 0){
					return 1
				}
			}
			
			return Math.min(this.teachers.length,this.classrooms.length)
		},
		total(){
			return this.filterArranges.length
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
		filterArranges(){
			let ts = this.timeSection
			let int_start_hour = util.int(util.format_int_hour(ts.int_start_hour))
			let int_end_hour = util.int(util.format_int_hour(ts.int_end_hour))
			let int_day = this.weekDate.int_day
			return this.arranges.filter(
				s=>{
					return (
						s.int_day == int_day && 
						s.int_start_hour == int_start_hour && 
						s.int_end_hour == int_end_hour
					)
				}
			)
		},
		teachers(){
			let lists = this.$store.state.gvars.employees||[]
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