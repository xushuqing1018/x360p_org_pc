<style lang="less">
@import '../../style/mixin.less';
.season-schedule-cell{
    cursor: pointer;
    position:relative;
	height:60px;
	border-bottom:1px solid #eee;
	color:#000;
	background:#ffffff;
	&.selected{
		background-color:#086703;
		color:#fff;
	}
	.cell-label{
		text-align:center;
		padding-top:5px;
		line-height:20px;
	}
	.cell-count{
		text-align:center;
		line-height:20px;
	}
}
</style>
<template>
	<div class="season-schedule-cell" :class="{'selected':isSelected}" @click="toggleSelect"> 
		<div class="cell-label">{{timeSection.int_start_hour}}~{{timeSection.int_end_hour}}</div>
		<div class="cell-count" @click.stop="selectClassRoom">
			<Icon type="ios-home"></Icon>
			<span v-if="schedule && schedule.cr_id > 0">{{schedule.cr_id|classroom_name}}</span>
		</div>	
		<Modal v-drag-modal :mask-closable="false" v-model="classRoomModal" title="选择教室">
			<select-class-room v-model="selectCrId"></select-class-room>
            <div slot="footer">            	
	            <Button type="text" @click="classRoomModal=false">取消</Button>
	            <Button type="primary" @click="setClassRoom">确认</Button>
	        </div>
		</Modal>

	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import $rest from '@/libs/rest'
import SelectClassRoom from 'c%/SelectClassRoom.vue'

export default {
	name:'seasonScheduleCell',
	mixins:[common,globals],
	components:{
		SelectClassRoom
	},
	props:{
		schedules:{
			type:Array,
			default:[]
		},
		timeSection:Object,
		crId: {
			type:[Number,String],
			default:0 
		},
		weekDay:{
			type:Number,
			default:0
		},
		roomList:Array,
		max: Number
	},
	computed:{
		isSelected () {
			return this.schedule?true:false
		},
		schedule(){
			return this.schedules.find(item=>item.week_day == this.weekDay && item.int_start_hour == this.timeSection.int_start_hour && item.int_end_hour == this.timeSection.int_end_hour)
		}
	},
	data(){
		return {
			classRoomModal: false,
			showRoomForm: false,
			classrooms: [],
			selectCrId: this.crId,
			room: {
				bid: 0,
				room_name:'',
				seat_nums:16,
				listen_nums_limit:8
			}
		}
	},
	methods:{
		addRoom(){			
			
		},
		closeRoomModal(){
			this.showRoomForm = false
		},
		toggleSelect(){
			if(this.schedule){
				this.$emit('on-cancel',this.schedule)
			}else{
				this.$emit('on-select',{week_day:this.weekDay,int_start_hour:this.timeSection.int_start_hour,int_end_hour:this.timeSection.int_end_hour,cr_id:this.crId})
			}		
		},
		selectClassRoom(){
			if(this.schedule){
				this.classRoomModal = true
			}
		},
		setClassRoom(){
			if(this.selectCrId == 0){
				this.$Message.error('请选择教室!');
				return false;
			}
			this.$emit('on-select-room',{schedule:this.schedule,cr_id:this.selectCrId})
			this.classRoomModal = false
		}
	}
}
</script>