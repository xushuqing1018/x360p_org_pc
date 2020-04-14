<style lang="less">
@import '~@/style/mixin.less';
.schedule-condition{
	position:absolute;
	width:300px;
	left:10px;
	top:70px;
	z-index:9001;
	background:#fff;
	.drop-shadow(2px,4px,10px,0.6);
	.schedule-condition-header{
		height:30px;
		line-height:30px;
		position:relative;
		border-bottom:1px solid #ccc;
		padding-left:5px;
		color:#000;
		font-weight:bold;
		.switch{
			position:absolute;
			display:block;
			top:0;
			right:5px;
			height:20px;
			width:80px;
			text-align:right;
			cursor:pointer;
		}
	}
	.schedule-condition-tab{
		padding:5px;
		border-bottom:1px solid #ccc;
	}
	.schedule-condition-body{
		padding:5px;
		min-height:400px;
		.list-wrap{
			margin-top:5px;
			overflow-y:auto;
			.list-item{
				border-bottom:1px solid #f2f2f2;
				padding-top:5px;
				padding-bottom:5px;
			}
		}
	}
}
.condition-filter{
	padding:5px 0;
	margin-right:5px;
}

.condition-list{
  margin-top:10px;
  margin-bottom:10px;
  max-height:400px;
  overflow-y:auto;
  p.empty{color:#999;}
  .item{
    >a{
      display:block;
      line-height:26px;
      padding-left:10px;
      padding-right:10px;
      color:#000;
      display:block;
      &.disabled{
      	color:#ccc;
      	cursor:not-allowed;
      }

      &:hover{
        background:#eee;
      }
      &.selected{
        background:#2D8CF0;
        color:#fff;

      }
    }
  }
}
</style>
<template>
<div class="schedule-condition" v-drag="'.schedule-condition-header'">
	<div class="schedule-condition-header" @dblclick="toggleExpand">
		<Icon type="android-options"></Icon> 排班条件
		<span class="switch" @click.stop="toggleExpand">
			<Icon type="chevron-down" v-if="expand"></Icon>
			<Icon type="chevron-right" v-else></Icon>
		</span>
	</div>
	<div class="schedule-condition-tab" v-show="expand">
		<ButtonGroup size="small">
	        <Button @click="select_condition(item)" v-for="item in conditions" :type="selected_condition_tab == item.name?'primary':'ghost'">{{item.text}}
	        {{condition_item_count(item.name)}}
	        </Button>
	    </ButtonGroup>
	    <Button 
		    type="ghost" 
		    icon="plus" 
		    size="small" 
		    class="pull-right"
		    v-for="item in add_btns"
		    v-show="item.tab == selected_condition_tab"
		    :title="item.title"
		    v-per="item.per"
		    @click="addConditionObj">
	    </Button>
	</div>
	<div class="schedule-condition-body" v-show="expand">
		<div class="condition-content" v-if="selected_condition_tab == 'lessons'">
			<div class="condition-filter">
            	<Input size="small" v-model="conditions.lessons.key" icon="search" placeholder="输入课程名称过滤"></Input>
            </div>
            <div class="condition-list">
            	<div class="item" v-for="item in filterLessons">
		          <a :class="{'selected':conditions.lessons.current.id == item.lid}" @click="selCondition(item,'lessons')">
		          {{item.lesson_name}}

		          <Icon type="ios-arrow-right" v-show="conditions.lessons.current.id == item.lid"></Icon>
		          </a>
		        </div>
		        <p class="empty" v-if="filterLessons.length == 0">没有搜索到匹配的课程</p>
            </div>
        </div>
        <div class="condition-content" v-if="selected_condition_tab == 'teachers'">
			<div class="condition-filter">
            	<Input size="small" v-model="conditions.teachers.key" icon="search" :placeholder="label_filter_teacher"></Input>
            </div>
            <div class="condition-list">
            	<div class="item" v-for="item in filterTeachers">
		          <a :class="{'selected':conditions.teachers.current.id == item.eid,'disabled':isTeacherDisabled(item)}" @click="selCondition(item,'teachers')">
		          {{item.ename}}

		          <Icon type="ios-arrow-right" v-show="conditions.teachers.current.id == item.eid"></Icon>
		          </a>
		        </div>
		        <p class="empty" v-if="filterTeachers.length == 0">没有搜索到匹配的{{'老师'|translate}}</p>
            </div>
        </div>
        <div class="condition-content" v-if="selected_condition_tab == 'classrooms'">
			<div class="condition-filter">
            	<Input size="small" v-model="conditions.classrooms.key" icon="search" placeholder="输入教室名称过滤"></Input>
            </div>
            <div class="condition-list">
            	<div class="item" v-for="item in filterClassrooms">
		          <a :class="{'selected':conditions.classrooms.current.id == item.cr_id,'disabled':isClassRoomDisabled(item)}" @click="selCondition(item,'classrooms')">
		          {{item.room_name}}

		          <Icon type="ios-arrow-right" v-show="conditions.classrooms.current.id == item.cr_id"></Icon>
		          </a>
		        </div>
		        <p class="empty" v-if="filterClassrooms.length == 0">没有搜索到匹配的教室</p>
            </div>
        </div>
        <div class="condition-content" v-if="selected_condition_tab == 'subjects'">
			<div class="condition-filter">
            	<Input size="small" v-model="conditions.subjects.key" icon="search" placeholder="输入科目名称过滤"></Input>
            </div>
            <div class="condition-list">
            	<div class="item" v-for="item in filterSubjects">
		          <a :class="{'selected':conditions.subjects.current.id == item.sj_id,'disabled':isSubjectDisabled(item)}" @click="selCondition(item,'subjects')">
		          {{item.subject_name}}

		          <Icon type="ios-arrow-right" v-show="conditions.subjects.current.id == item.eid"></Icon>
		          </a>
		        </div>
		        <p class="empty" v-if="filterSubjects.length == 0">没有搜索到匹配的科目</p>
            </div>
        </div>
	</div>
	<lesson-info-modal ref="lesson_info"></lesson-info-modal>
	<subject-info-modal ref="subject_info"></subject-info-modal>
	<class-room-info-modal ref="classroom_info"></class-room-info-modal>
	<teacher-info-modal ref="teacher_info"></teacher-info-modal>
</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import LessonInfoModal from '@/views/system/basic/lesson/info-modal.vue'
import SubjectInfoModal from '@/views/system/basic/subject/info-modal.vue'
import ClassRoomInfoModal from 'c%/ClassRoomInfoModal.vue'
import TeacherInfoModal from '@/views/system/staff/employee/info-modal.vue'

export default{
	name:'scheduleCondition',
	mixins:[common,globals],
	components: {
		LessonInfoModal,
		SubjectInfoModal,
		TeacherInfoModal,
		ClassRoomInfoModal
	},
	props:{
		bid:{
			type:Number,
			default:0
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
		currentTimeSection:{
			type:Object,
			default(){
				return {
					week_day:0,
					int_start_hour:'',
					int_end_hour:''
				}
			}
		},
		editLid:{
			type:Number,
			default:0
		},
		schedules:{
			type:Array,
			default(){
				return []
			}
		}
	},
	data(){
		return {
			expand:true,
			selected_condition_tab:'lessons',
			add_btns: [
				{
					tab: 'lessons',
					title: '添加课程',
					per: 'lesson.new'
				},
				{
					tab: 'teachers',
					title: '添加'+this.$filter('translate')('老师'),
					per: 'teachers.add'
				},
				{
					tab: 'classrooms',
					title: '添加教室',
					per: 'classrooms.add'
				},
				{
					tab: 'subjects',
					title: '添加科目',
					per: 'subject.add'
				}
			]
		}
	},
	methods:{
		toggleExpand(){
			this.expand = !this.expand
		},
		select_condition(tab){
			this.selected_condition_tab = tab.name
		},
		condition_item_count(name){
			let func = 'filter'+name.substr(0,1).toUpperCase()+name.substr(1)
			return this[func].length
		},
		selCondition(item,c){
			if(['teachers','classrooms','subjects'].indexOf(c) !== -1){
				if(c == 'teachers'){
					if(this.isTeacherDisabled(item)){
						return false
					}
				}else if(c == 'classrooms'){
					if(this.isClassRoomDisabled(item)){
						return false
					}
				}else{
					if(this.isSubjectDisabled(item)){
						return false
					}
				}
			}
			this.$emit('on-select-condition',{item,c})
		},
		isTeacherDisabled(item){
			if(this.action == 'list'){
				return false
			}
			let ts = this.currentTimeSection
			
			let hasSchedule = this.schedules.find(s=>{
				return s.eid == item.eid && s.week_day == ts.week_day && s.int_start_hour == ts.int_start_hour && s.int_end_hour == ts.int_end_hour
			})
	
			if(hasSchedule){
				return true
			}
			return false
		},
		isClassRoomDisabled(item){
			if(this.action == 'list'){
				return false
			}
			let ts = this.currentTimeSection
			let hasSchedule = this.schedules.find(s=>{
				return s.cr_id == item.cr_id && s.week_day == ts.week_day && s.int_start_hour == ts.int_start_hour && s.int_end_hour == ts.int_end_hour
			})
			if(hasSchedule){
				return true
			}
			return false
		},
		isSubjectDisabled(item){
			let sj_ids = [],
				lesson = null
			if(this.action == 'list'){
				if(this.conditions.lessons.current.id != 0){
					lesson = this.getLessonObj(this.conditions.lessons.current.id)
				}
			}else{
				if(this.editLid != 0){
					lesson = this.getLessonObj(this.editLid)
				}
			}

			if(!lesson){
				return false
			}

			if(lesson.sj_id != 0){
				sj_ids.push(lesson.sj_id)
			}else{
				for(let i =0,l=lesson.sj_ids.length;i<l;i++){
					sj_ids.push(util.int(lesson.sj_ids[i]))
				}
			}

			if(sj_ids.indexOf(item.sj_id) !== -1){
				return false
			}

			return true
		},
		addConditionObj() {
			switch(this.selected_condition_tab) {
				case 'lessons':
					this.$r('lesson_info').show('添加课程')
					break;
				case 'teachers':
					this.$r('teacher_info').show('添加'+this.$filter('translate')('老师'))
					break;
				case 'classrooms':
					this.$r('classroom_info').show('添加教室')
					break;
				case 'subjects':
					this.$r('subject_info').show('添加科目')
					break;
			}
		}
	},
	computed:{
	
		filterLessons(){
			let lists = this.$store.state.gvars.lessons
			let bid   = this.bid
			function filter(key,bid){
				if(!/^\s*$/.test(key)){
					return function(item){
						return (
							item.lesson_type === 0 && 
							item.bids.indexOf(bid) !== -1 && 
							item.lesson_name.indexOf(key) !== -1
							)
					}
				}else{
					return function(item){
						return (item.lesson_type === 0 && item.bids.indexOf(bid) !== -1)
					}
				}
			}
			return lists.filter(filter(this.conditions.lessons.key,bid))
		},
		filterSubjects(){
			if(!/^\s*$/.test(this.conditions.subjects.key)){
		        return this.$store.state.gvars.subjects.filter(b=>b.subject_name.indexOf(this.conditions.subjects.key) !== -1)
		    }
		    return this.$store.state.gvars.subjects
		},
		filterTeachers(){
			let lists = this.$store.state.gvars.employees
			let bid   = this.bid
			let rid   = 1		//老师角色是1
			function filter(key,bid,rid){
				if(!/^\s*$/.test(key)){
					return function(item){
						return item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 && item.ename.indexOf(key) !== -1
					}
				}else{
					return function(item){
						return item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 
					}
				}
			}
			return lists.filter(filter(this.conditions.teachers.key,bid,rid))
		},
		filterClassrooms(){
			let lists = this.$store.state.gvars.classrooms
			let bid   = this.bid
			function filter(key,bid){
				if(!/^\s*$/.test(key)){
					return function(item){
						return item.bid == bid && item.room_name.indexOf(key) !== -1
					}
				}else{
					return function(item){
						return item.bid == bid
					}
				}
			}
			return lists.filter(filter(this.conditions.classrooms.key,bid))
		}
	}

}
</script>