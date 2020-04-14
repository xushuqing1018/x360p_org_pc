<style lang="less">
@import '~@/style/mixin.less';
.arrange-wrapper{
	padding:10px;
	.rounded(5px);
	background:#fff;
	position:relative;
	min-height:540px;
	.ivu-table-wrapper .loading-wrap {
		top: 52px;
	}

}
</style>
<template>
	<div>
		<div class="clearfix">
			<label>排课对象：</label>
			<RadioGroup v-model="view_type" type="button" @on-change="changeGroup">
				<Radio v-for="item in view_types" :label="item.value">{{item.label}}</Radio>
			</RadioGroup>
			<label class="ml-4">期段：</label>
			<Select v-model="conditions.season" style="width:70px">
				<Option v-for="item in seasons" :value="item.name">{{item.title}}</Option>
			</Select>
			<template v-if="enable_online_lesson">
				<RadioGroup v-model="is_online" type="button" @on-change="init_arranges_data(false)">
					<Radio :label="0">线下课</Radio>
					<Radio :label="1">线上课</Radio>
				</RadioGroup>
			</template>
			<template v-if="view_type == 'one-to-one'">
				<RadioGroup v-model="dateMode" type="button">
					<Radio label="week">周</Radio>
					<Radio label="day">日</Radio>
				</RadioGroup>
			</template>
			<Button type="primary" class="ml-3" @click="lessonProgress">排课进度</Button>
			<div class="year-week-info" v-if="dateMode == 'week'">
				<span>{{year}}</span>年
				<span class="ml-1">第&nbsp;&nbsp;<strong>{{week}}</strong>&nbsp;&nbsp;周</span>
				<span class="small-grid arranged ml-1"></span>未考勤
				<span class="small-grid attendanced ml-1"></span>已考勤
				<span class="small-grid part-attendanced ml-1"></span>部分考勤
				<span class="small-grid cancel ml-1"></span>已取消
			</div>
			<div class="year-week-info" v-if="dateMode == 'day'">
				<Button icon="ios-copy" size="small" @click="copyDayArrange">复制排课</Button>
				<Button icon="ios-arrow-left" size="small" @click="prevDay"></Button>
				<span @click="setDay">{{currentDateText}}</span>
				<Button icon="ios-arrow-right" size="small" @click="nextDay"></Button>
				<span class="small-grid attendanced ml-1"></span>已考勤
				<span class="small-grid arranged ml-1"></span>待考勤
			</div>
		</div>
		<div class="arrange-wrapper mt-3">
			<Row>
				<Col span="24">
					<template v-if="dateMode == 'week'">
					<span>搜索：</span>
					<select-class-room-two 
						v-model="conditions.cr_id" 
						clearable 
						style="width:250px;"
						placeholder="请选择教室"
						v-if="view_type=='classroom'">
					</select-class-room-two>
					<select-employee 
						v-model="conditions.eid" 
						:rid="1" 
						clearable 
						style="width:250px;"
						:placeholder="label_choose_teacher"
						v-if="view_type=='teacher'">
					</select-employee>
					<select-class 
						v-model="conditions.cid" 
						clearable 
						style="width:250px;"
						placeholder="请选择班级"
						v-if="view_type=='class'">
					</select-class>
					<select-student
						v-model="conditions.sid"
						clearable 
						style="width:250px;"
						placeholder="请选择学员"
						v-if="view_type=='one-to-one'">
					</select-student>
					</template>
					<div class="pull-right ml-4" v-if="view_type=='one-to-one'">
	                    <per-scope per="student.checkAll" @on-change="perScopeChange"></per-scope>
	                </div>
					<div class="pull-right">
			            <label>当前模式：</label>
			            <ButtonGroup>
			                <Button type="ghost" icon="ios-list-outline" @click="turnListArrange" style="padding:2px 5px">列表</Button>
			                <Button type="primary" icon="grid" style="padding:2px 5px">表格</Button>
			                <Button type="ghost" icon="eye" @click="turnVisualArrange" style="padding:2px 5px">可视化</Button>
			            </ButtonGroup>
			        </div>
				</Col>
			</Row>
			<div class="ivu-table-wrapper" v-loading="'course_arranges'">
			    <teacher-arrange
			    	ref="teacher_arrange"
			    	:arranges="data"
			    	:view="view_type"
					:date="currentDate"
					:conditions="conditions"
					:year="year"
					:week="week"
					@on-week-change="weekChange"
					@on-refresh="refreshData"
					v-if="view_type=='teacher'">
			    </teacher-arrange>
			    <classroom-arrange
			    	ref="classroom_arrange"
			    	:arranges="data"
			    	:view="view_type"
					:date="currentDate"
					:conditions="conditions"
					:year="year"
					:week="week"
					@on-week-change="weekChange"
					@on-refresh="refreshData"
					v-if="view_type=='classroom'">
			    </classroom-arrange>
			    <class-arrange
			    	ref="class_arrange"
			    	:arranges="data"
			    	:view="view_type"
					:date="currentDate"
					:conditions="conditions"
					:year="year"
					:week="week"
					@on-week-change="weekChange"
					@on-refresh="refreshData"
					v-if="view_type=='class'">
			    </class-arrange>
			     <one-to-one-arrange
			    	ref="one-to-one_arrange"
			    	:arranges="data"
			    	:view="view_type"
					:date="currentDate"
					:conditions="conditions"
					:year="year"
					:week="week"
					:per-scope="perScope"
					:date-mode="dateMode"
					@on-week-change="weekChange"
					@on-refresh="refreshData"
					@on-date-mode-change="dateModeChange"
					v-if="view_type=='one-to-one'">
			    </one-to-one-arrange>
			</div>
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import moment from 'moment'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import grid from '@/libs/grid.mixin'
import util,{_} from '@/libs/util'

import TeacherArrange from './grid/by-teacher.vue'
import ClassroomArrange from './grid/by-classroom.vue'
import ClassArrange from './grid/by-class.vue'
import OneToOneArrange from './grid/by-one-to-one.vue'

import SelectClass from 'c%/SelectClass.vue'
import SelectClassRoomTwo from 'c%/SelectClassRoomTwo.vue'
import SelectEmployee from 'c%/SelectEmployee.vue'
import SelectStudent from 'c%/SelectStudent.vue'
const CACHE = {}
const CACHE_KEY = '__ARRANGE_GRID_DATE_MODE_'

function clearCache(){
	for(let o in CACHE){
		delete CACHE[o]
	}
}

function getCurrentYear(){
	return util.int(moment().format('YYYY'))
}

function getCurrentWeek(){
	return util.int(util.get_date_week_no(new Date()))
}

function getCurrentDate(){
	return (new Date())
}


export default{
	name:'arrangeGrid',
	mixins:[grid,common,globals],
	components:{
		TeacherArrange,
		ClassroomArrange,
		ClassArrange,
		OneToOneArrange,
		SelectClass,
		SelectEmployee,
		SelectClassRoomTwo,
		SelectStudent
	},
	data(){
		return {
			rest_api:'course_arranges',
			mode:'view',			//模式查看或编辑 view,edit
			action:'list',			//操作动作 list,add,edit
			dateMode:'week',		//日期模式 week,day
			currentDate:new Date(),
			year:getCurrentYear(),
			week:getCurrentWeek(),
			arranges:[],
			conditions:{
				season: 'A',
				cid: 0,
				eid: 0,
				cr_id: 0,
				sid: 0
			},
			view_type: 'teacher',
			view_types: [
				{label:'按'+this.$filter('translate')('老师'),value:'teacher'},
				{label:'按教室',value:'classroom'},
				{label:'按班级',value:'class'},
				{label:'一对一',value:'one-to-one'}
			],
			perScope: '',
			is_online:0
		}
	},
	created() {
		let type = Vue.localStorage.get('__ARRANGE_VIEW_TYPE__')
		if(type) {
			this.view_type = type
		}
		let dateMode = this.getCache(CACHE_KEY)
		if(dateMode){
			this.dateMode = dateMode
		}
	},
	mounted(){
		this.init_season()
		this.init_arranges_data()
	},
	methods:{
		lessonProgress () {
			this.$Modal.open('business/arrange/grid/lesson-progress.vue@modal',{

			})
			.then(modal => {
				modal.show('排课进度')
			})
		},
		turnListArrange () {
            this.$emit('on-turn-mode','list')
        },
        turnVisualArrange () {
        	this.$emit('on-turn-mode','visual')
        },
        perScopeChange(value) {
            this.perScope = value
        },
        changeGroup(type) {
        	this.conditions.eid = 0
        	this.conditions.cid = 0
        	this.conditions.cr_id = 0
        	this.conditions.sid = 0
			Vue.localStorage.set('__ARRANGE_VIEW_TYPE__',type)
		},
		refreshData() {
			this.$emit('on-refresh')
			this.init_arranges_data(false)
		},
		init_season(){
			this.conditions.season = this.get_season_by_date(this.currentDate)
		},
		weekChange({action}){
			let dt = this.currentDate.getDate()
			if(action == 'prev'){
				this.currentDate = new Date(this.currentDate.setDate(dt-7))
			}else{
				this.currentDate = new Date(this.currentDate.setDate(dt+7))
			}
			this.year = util.int(moment(this.currentDate).format('YYYY'))
			this.week = util.get_date_week_no(this.currentDate)
			this.conditions.season = this.get_season_by_date(this.currentDate)
			
		},
		//初始化排课数据
		init_arranges_data(cache){
			cache = _.isUndefined(cache)?true:cache
			let ck = ['arranges',this.bid$,this.year,this.week].join('-')

			if(CACHE[ck]&&cache){
				this.data = CACHE[ck]
			}else{
				this.init_data()
			}
		},
		deal_data(data) {
	    	let ck = ['arranges',this.bid$,this.year,this.week].join('-')
	    	CACHE[ck] = data.list
	    	return data.list
	    },
		hook_get_param(param){
			let week_date = util.weekdate(this.year,this.week)
			let start_int_day = moment(week_date.start).format('YYYYMMDD')
			let end_int_day   = moment(week_date.end).format('YYYYMMDD')
			param.int_day 	= util.sprintf('[between,%s,%s]',start_int_day,end_int_day)
			param.pagesize = 5000
			param.with = 'one_class,students'
			param.bid = -1
			if(this.is_online == 1){
				param.is_online = 1
			}
		},
		dateModeChange(e){
			this.currentDate = e.date
			this.dateMode = e.mode 
		},
		copyDayArrange(){
			this.$Modal.open('business/arrange/grid/day-copy-modal.vue',{
					props: {
						date: this.currentDate
					},
					on: {
						'on-success':(int_day)=>{
							this.setCurrentDate(int_day)
						}
					}
				})
				.then(modal => {
					modal.vuec.show('复制当前校区整日排课','add')
				})
		},
		prevDay(){
			this.currentDate = moment(this.currentDate).subtract(1,'days').toDate()
		},
		nextDay(){
			this.currentDate = moment(this.currentDate).add(1,'days').toDate()
		},
		setCurrentDate(int_day){
			this.currentDate = moment(int_day).toDate()
		},
		dayChange(date){
			this.currentDate = date
		},
		setDay() {
			this.$Modal.open('business/attendance/set-day-modal.vue',{
				props: {
				},
				on: {
					'on-ok': (date)=>{
						this.dayChange(date)
					}
				}
			})
			.then(modal=>{
				modal.show('设置排课日期')
			})
		}
	},
	computed:{
		seasons(){
	    	return this.$store.state.gvars.dicts.season
	    },
	    currentDateText(){
	    	return moment(this.currentDate).format('YYYY年MM月DD日')
	    }
	},
	watch:{
		week(){
			this.init_arranges_data()
		},
		dateMode(){
			this.setCache(CACHE_KEY,this.dateMode)
		}
	}
}
</script>