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
.teacher-time-title {
	font-size: 15px;
	font-weight: bold;
	line-height: 50px;
}
</style>
<template>
	<div>
		<div>
			<Row>
				<Col span="24" style="position: relative;">
					<span>开始日期：</span>
					<DatePicker
						type="date"
						format="yyyy-MM-dd" 
						placement="bottom-end" 
						placeholder="选择开始日期"
						style="width:160px"
						:value="startDate"
						@on-change="setDate">
					</DatePicker>
					<Tooltip content="默认显示一周的时间范围" placement="top">
						<span style="margin-left: 10px;">结束日期：</span>
					</Tooltip>
					<DatePicker
						type="date"
						format="yyyy-MM-dd" 
						placement="bottom-end" 
						placeholder="选择结束日期" 
						style="width:160px"
						:value="endDate"
						disabled
						readonly>
					</DatePicker>
					<Button type="primary" style="margin-left: 10px;" @click="getTeacherRangeDate">设置</Button>
					<span style="position: absolute;right: 10px;">
						按老师：
						<select-employee
							v-model="conditions.eid" 
							:rid="1" 
							clearable 
							style="width: 250px;"
							:placeholder="label_choose_teacher"
							v-if="view_type=='teacher'">
						</select-employee>
					</span>
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
					:dateRange="dateRange"
					:bid="bid"
					:teacherRangeData="teacherRangeData"
					@on-week-change="weekChange"
					@on-refresh="refreshData"
					v-if="view_type=='teacher'">
			    </teacher-arrange>
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

import TeacherArrange from './teacher-arrange.vue'

import SelectEmployee from 'c%/SelectEmployee.vue'
const CACHE = {}

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
		SelectEmployee
	},
	props: ['bid'],
	data(){
		return {
			rest_api:'course_arranges',
			mode:'view',			//模式查看或编辑 view,edit
			action:'list',			//操作动作 list,add,edit
			currentDate:new Date(),
			year:getCurrentYear(),
			week:getCurrentWeek(),
			arranges:[],
			dateRange:[],
			searchData: {
				range: []
			},
			teacherRangeData: [],
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
			perScope: ''
		}
	},
	created() {
		let type = Vue.localStorage.get('__ARRANGE_VIEW_TYPE__')
		if(type) {
			this.view_type = type
		}
		this.searchData.range = [parseInt(moment().format('YYYYMMDD')),parseInt(moment().add(7,'days').format('YYYYMMDD'))]
		this.dateRange = this.searchData.range
	},
	mounted(){
		this.getTeacherRangeDate();
		this.init_season()
		this.init_arranges_data()
	},
	methods:{
		setDate(val) {
			var array = [];
			array[0] = this.format_day(val);
			array[1] = parseInt(moment(val,'YYYY-MM-DD').add(6,'days').format('YYYYMMDD'));
			this.searchData.range = array;
		},
		getTeacherRangeDate() {
			this.dateRange = this.searchData.range

			var params = {};
			var vm = this;
			if(this.dateRange.length != 0) {
				params = {
					pagesize: 1000,
					bid: vm.bid,
					int_day: util.sprintf('[between,%s,%s]',this.dateRange[0],this.dateRange[1])
				}
			}
			this.$http.get('employee_time_sections',{
				params: params
			})
			.then(res => {
				this.teacherRangeData = res.body.data.list;
			},res => {
				this.$Message.error(res.body.message)
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
			this.getTeacherRangeDate();
			this.init_arranges_data(false);
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
			param.pagesize = 1000
		}
	},
	computed:{
		startDate() {
			return this.$filter('int_date')(this.searchData.range[0]);
		},
		endDate() {
			return this.$filter('int_date')(this.searchData.range[1]);
		},
		seasons(){
	    	return this.$store.state.gvars.dicts.season
	    }
	},
	watch:{
		week(){
			this.init_arranges_data()
		},
		bid() {
			this.getTeacherRangeDate();
			this.init_season()
			this.init_arranges_data()
		}
	}
}
</script>