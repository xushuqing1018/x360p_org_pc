<style lang="less">
	.schedule-grid {
		&-head {
			position: relative;
			margin-top: 15px;
			margin-bottom: 15px;
			padding-top: 6px;
			padding-bottom: 6px;
			border-radius: 6px;
			border: 1px solid #ededed;
			box-shadow: 1px 0 2px #e3e8ee;
			.date-info {
				font-size: 14px;
				vertical-align: middle;
				.current {
					color: #3091F2;
					margin-right: 4px;
					margin-left: 4px;
					vertical-align: middle;
				}
			}
			.color-mean {
				position: absolute;
				left: 15px;
				top: 10px;
				.small-grid  {
					display: inline-block;
					height: 12px;
					width: 12px;
					overflow: hidden;
					vertical-align: middle;
					margin-bottom: 2px;
				}
				.arranged {
					background: #50A8FF;
				}
				.part-attended {
					background: #ff9900;
				}
				.attended {
					background: #19be6b;
				}
			}
			.per-scope {
				position: absolute;
				right: 15px;
				top: 6px;
			}
			.filter-student {
				position: absolute;
				top: 10px;
				left: 550px;
				.ivu-icon {
					cursor: pointer;
				}
			}
		}
		&-main {
			position: relative;
			.schedule-condition {
				position: absolute;
				left: 0;
				top: 0;
				height: 450px;
				width: 240px;
				border: 1px solid #ededed;
				border-radius: 6px 0 0 6px;
				box-shadow: 1px 0 2px #e3e8ee;
				&-head {
					width: 100%;
					.teacher,.classroom,.section{
						padding: 10px;
						cursor: pointer;
						border-bottom: 1px solid #ededed;
						text-align: center;
						&.current {
							color: #fff;
							background: #3091F2;
						}
					}
					.teacher {
						border-radius: 6px 0 0 0;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
					.section.remind {
						border-right: 1px solid #ededed; 
					}
					.classroom {
						border-right: 1px solid #ededed;
						border-left: 1px solid #ededed;
					}
				}
				&-list {
					max-height: 410px;
					overflow-y: auto;
					overflow-x: hidden;
					&::-webkit-scrollbar {
						display: none;
					}
				}
				&-item {
					position: relative;
					height: 40px;
					font-size: 0px;
					margin-top: 10px;
					padding-top: 4px;
					padding-bottom: 4px;
					cursor: pointer;
					background: #f5f5f5;
					&:first-child {
						margin-top: 18px;
					}
					&.current {
						background: #50A8FF;
						.item-name,.ivu-icon {
							color: #fff;
						}
						.arrange-nums {
							background: #ffa650;
						}
					}
					.section-wrap {
						text-align: center;
						font-size: 12px;
						line-height: 32px;
					}
					.item-name {
						color: #9EB1CA;
						font-size: 12px;
						margin-left: 6px;
						vertical-align: middle;
					}
					.arrange-nums {
						position: absolute;
						top: 11px;
						right: 16px;
						color: #fff;
						font-size: 12px;
						border-radius: 10px;
						padding: 0 6px;
						background: #C4C4C4;
					}
				}
			}
			.schedule-arranges {
				height: 450px;
				overflow: auto;
				margin-left: 240px;
				padding: 15px 20px;
				border: 1px solid #ededed;
				border-left: 0;
				border-radius: 0 6px 6px 0;
				box-shadow: 1px 0 2px #e3e8ee;
				background: #f5f5f5;
				&.empty-img {
					background: url('http://s1.xiao360.com/nothing-notice.png') no-repeat center;
					background-color: #f5f5f5;
				}
				&-item {
					margin-bottom: 15px;
					background: #fff;
					border-radius: 6px 0 0 0;
					cursor: pointer;
					.info {
						box-shadow: 1px 0 2px #e3e8ee;
						text-align: center;
						color: #50A8FF;
						line-height: 36px;
						&.is-attended {
							color: #19be6b;
							.info-section.current {
								background: #19be6b;
								color: #fff;
							} 
						}
						&.part-attended {
							color: #ff9900;
							.info-section.current {
								background: #ff9900;
								color: #fff;
							}
						}
						.info-section {
							position: relative;
							border-radius: 6px 0 0 0;
							&.current {
								background: #50A8FF;
								color: #fff;
								&:after {display: none;}
							}
						}
						.info-ename {
							position: relative;
							.ivu-icon-person {
								vertical-align: middle;
							}
						}
						.info-section,.info-ename {
							&:after {
								content: '';
								width: 70%;
								height: 1px;
								background: #eee;
								position: absolute;
								bottom: 0;
								left: 0;
								right: 0;
								margin: 0 auto;
							}
						}
					}
					.students {
						padding: 8px 10px;
						height: 108px;
						overflow:auto;
						line-height: 26px;
						&::-webkit-scrollbar {
							display: none;
						}
						.lesson-type {
							position: absolute;
							right: 0;
							top: 0;
							width: 22px;
							height: 22px;
							border-radius: 0 0 0 20px;
							padding: 5px;
							color: #fff;
							background: #3091f2;
							line-height: 13px;
							display: block;
						}
						.class-name {
							text-align: center;
							line-height: 14px;
							&.remind {
								text-align: left;
							    margin-left: 10px;
							    line-height: 26px;
							    border-bottom: 1px solid #ededed;
							    label {
							    	margin-bottom: 0;
							    }
							}
						}
						
						.student-box {
							display: inline-block;
							margin-left: 10px;
						}
					}
				}
			}
		}
	}
	.set-day {
		cursor: pointer;
		text-decoration: underline;
	}
</style>
<template>
	<div class="schedule-grid">
		<div class="text-center schedule-grid-head">
			<div class="color-mean">
				<span class="small-grid arranged ml-1"></span>未考勤
				<span class="small-grid attended ml-1"></span>已考勤
				<span class="small-grid part-attended ml-1"></span>部分考勤
			</div>
			<Button 
				type="text" 
				size="small"
				:loading="loading"
				@click="dayChange('prev')">
				<Icon type="chevron-left"></Icon>
			</Button>
			<span class="date-info">
				<span class="current set-day" @click="setDay">{{format_date}}</span>
			</span>
			<Button
				type="text"
				size="small"
				:loading="loading"
				@click="dayChange('next')">
				<Icon type="chevron-right"></Icon>
			</Button>
			<div class="filter-student">
				<template v-if="student.sid">
					<span>{{student.name}}</span>
					<Icon type="close" @click.native="clearBySid"></Icon>
				</template>
				<Icon type="search" @click.native="filterBySid" v-else></Icon>
				<select-student ref="ref_student" v-model="student.sid" style="display: none" @on-selected="selectStudent"></select-student>
			</div>
			<div class="per-scope">
				<per-scope per="arrange.checkAll" @on-change="perScopeChange"></per-scope>
			</div>
		</div>
		<div class="schedule-grid-main mt-2" style="position: relative;">
			<Spin fix v-if="loading">
            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            	<div>正在加载数据...</div>
            </Spin>
			<div class="schedule-condition">
				<Row class="schedule-condition-head">
					<Col 
						span="8" 
						class="teacher" 
						:class="view_type==1?'current':''"
						@click.native="viewType(1)">
						上课{{'老师'|translate}}
					</Col>
					<Col 
						span="8" 
						class="classroom" 
						:class="view_type==2?'current':''"
						@click.native="viewType(2)">
						上课教室
					</Col>
					<Col 
						span="8" 
						class="section" 
						:class="view_type==3?'current':''"
						@click.native="viewType(3)">
						上课时段
					</Col>
				</Row>
				<div class="schedule-condition-list">
					<div 
						:class="[current_condition_key==key?'current':'','schedule-condition-item']" 
						v-for="(value,key) in format_data"
						@click="selectItem(key)">
						<template v-if="view_type==1">
							<Row type="flex" justify="center" align="middle">
								<Col span="12" class="text-right">
									<letter-avatar
										size="32"
										:src="getPhotoUrl(key)"
										:name="$filter('ename')(key)"
										:rounded="true"
										style="width:auto;">
									</letter-avatar>
								</Col>
								<Col span="12">
									<span class="item-name">{{key|ename}}</span>
								</Col>
							</Row>
						</template>
						<template v-if="view_type==2">
							<Row type="flex" justify="center" align="middle" style="height:100%;">
								<Col span="10" class="text-right">
									<Icon type="ios-home" size="16"></Icon>
								</Col>
								<Col span="14" style="padding-top:2px;">
									<span class="item-name">{{key|classroom_name('未知')}}</span>
								</Col>
							</Row>
						</template>
						<template v-if="view_type==3">
							<div class="section-wrap">
								<span class="item-name">{{key}}</span>
							</div>
						</template>
						<span class="arrange-nums">{{value.length}}</span>
					</div>
					<div v-if="data.length==0" class="text-center empty mt-4"><Icon type="ios-information"></Icon> 没有排课</div>
				</div>
			</div>
			<div :class="['schedule-arranges',data_by_sid.length==0?'empty-img':'']">
				<div class="schedule-arranges-list">
					<Row class="schedule-arranges-item" v-for="item in orderBy(data_by_sid,'int_start_hour')" @click.native="showAttendModal(item)">
						<Col span="6" :class="['info',item.is_attendance==1?'part-attended':item.is_attendance==2?'is-attended':'']">
							<div :class="['info-section',is_current_section(item)]">{{getFormatSection(item)}}</div>
							<div class="info-ename">
								<Icon type="person" size="14"></Icon>
								{{item.teach_eid|ename}}
							</div>
							<div class="info-room">
								<Icon type="ios-home" size="14"></Icon>
								{{item.cr_id|classroom_name('未知')}}
							</div>
						</Col>
						<Col span="18" class="students">
							<div class="class-name">
								<span v-if="item.is_trial">{{item.name}}</span>
								<span v-else>{{item.course_name}}</span>
							</div>
							<div class="student-box" v-for="student in item.students">
								<span v-if="student.sid > 0">{{student.student.student_name}}</span>
								<span v-else-if="student.sid == 0 && student.cu_id > 0">{{student.customer.name}}</span>
							</div>
							<div class="lesson-type">{{getLessonType(item)}}</div>
						</Col>
					</Row>
				</div>
			</div>
		</div>
		
		<batch-attendance ref="batchModal" :date="currentDate" @on-success="attendanceSuccess"></batch-attendance>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import BatchAttendance from './batch-attendance.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	function getCurrentYear(){
		return util.int(moment().format('YYYY'))
	}
	function getFormatDate() {
		return moment().format('YYYY - MM - DD')
	}
	function getCurrentWeek(){
		return util.int(util.get_date_week_no(new Date()))
	}
	
	function getCurrentDate(){
		return (new Date())
	}

	const DC = {}

	export default {
		mixins: [common,globals,modal,grid],
		components: {
			LetterAvatar,
			BatchAttendance,
			SelectStudent
		},
		props: {
			modalShow: {
				type: Boolean,
				default: false
			},
			searchParams: {
				type: Object,
				default: () => {
					return null
				}
			},
			isOnline:{
				type: Number,
				default : 0
			}
		},
		data() {
			return {
				rest_api: 'course_arranges',
				currentDate:new Date(),
				year:getCurrentYear(),
				week:getCurrentWeek(),
				format_date:getFormatDate(),
				data:[],
				view_type: 1,
				current_condition_key: '',
				type_arrange: '',
				student: {
					sid: 0,
					name: ''
				}
			}
		},
		watch: {
			'view_type':function(val) {
				this.current_condition_key = ''
			},
			'type_arrange':function(val) {
				if(this.modalShow) {
					this.init_data()
				}
			},
			'currentDate':function(val) {
				this.$emit('date-change',this.currentDate)
				this.init_data()
			},
			'modalShow':function(val) {
				if(val) {
					this.init_data()
				}
			},
			isOnline(val){
				this.init_data()
			}
		},
		methods: {
			filterBySid() {
				this.$refs.ref_student.openModal()
			},
			clearBySid() {
				this.student.sid = 0
			},
			selectStudent(selected) {
				this.student.name = selected.student_name
			},
			attendanceSuccess () {
				this.init_data()
				this.$emit('on-success')
			},
			perScopeChange(value) {
				this.type_arrange = value
			},
			batchAttend() {
				this.$r('batchModal').getAlreadyLeave().show()
			},
			viewType(val) {
				this.view_type = val
				this.$emit('on-clear-condition')
			},
			selectItem(key) {
				if(this.current_condition_key == key) {
					this.current_condition_key = ''
				}else{
					this.current_condition_key = key
				}
				this.$emit('on-condition-change',{view_type:this.view_type,key:this.current_condition_key})
			},
			setDay() {
				this.$Modal.open('business/attendance/set-day-modal.vue',{
					props: {
					},
					on: {
						'on-ok': (date)=>{
							this.dayChange('set',date)
						}
					}
				})
				.then(modal=>{
					modal.show('设置考勤日期')
				})
			},
			dayChange(action,date){
				let dt = this.currentDate.getDate()
				if(action == 'prev'){
					this.currentDate = new Date(this.currentDate.setDate(dt-1))
				}else if(action == 'next'){
					this.currentDate = new Date(this.currentDate.setDate(dt+1))
				}
				else {
					this.currentDate = date;
				}
				this.year = util.int(moment(this.currentDate).format('YYYY'))
				this.week = util.get_date_week_no(this.currentDate)
				this.format_date = moment(this.currentDate).format('YYYY - MM - DD')
			},
			hook_get_param(param) {
				if(this.searchParams !== null) {
					Object.assign(param, this.searchParams);
				}
				param.int_day = moment(this.currentDate).format('YYYYMMDD')
				param.with = 'one_class,students,class_attendance,textbook,textbook_section'
				param.is_cancel = 0
				param.pagesize = 1000
				if(this.type_arrange == 'my') {
					param.teach_eid = this.eid$
				}
				if(this.isOnline == 1){
					param.is_online = 1
				}
			},
			getPhotoUrl(eid) {
				let teacher = this.$store.state.gvars['employees'].find(item=>item.eid == eid)
				if(teacher) {
					return teacher.photo_url
				}else{
					return 'http://s1.xiao360.com/common_img/avatar.jpg'
				}
			},
			getEname(eid) {
				return this.$filter('ename')(eid)
			},
			formatSection(data) {
				return util.sprintf('%s~%s',this.$filter('int_hour')(data.int_start_hour),
					this.$filter('int_hour')(data.int_end_hour))
			},
			getLessonType(data) {
				let result = ''
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.is_trial===1?'试':'补'
					}else{
						if(data.one_class!=null){
							result = '班'
						}	
					}	
				}else{
					if(data.lesson_type===1) {
						result = '一'
					}
					if(data.lesson_type===2) {
						result = '多'
					}
					if(data.lesson_type===3) {
						result = '研学'
					}
				}
				return result
			},
			teachObject(data) {
				let result = ''
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.name
					}else{
						if(data.one_class!=null){
							result = data.one_class.class_name
						}	
					}	
				}else{
					let students = data.students
					if(data.students.length>0){
						data.students.forEach((s,i)=>{
							if(i<3){
								result += s.student_name+','
							}
						})
					}
					result = result.substring(0,result.length-1)
					if(data.students.length>3){
						result += '等'
					}
				}
				return result
			},
			getFormatSection(item) {
				return util.sprintf('%s -- %s',this.$filter('int_hour')(item.int_start_hour),
							this.$filter('int_hour')(item.int_end_hour))
			},
			is_current_section(item) {
				let date = new Date(),
					hour = date.getHours(),
					minute = date.getMinutes(),
					int_hour = hour*100+minute
				if(item.int_start_hour<=int_hour
					&&item.int_end_hour>=int_hour
					&&date.toLocaleDateString()==this.currentDate.toLocaleDateString()) return 'current'
				return ''
			},
			showAttendModal (item) {	
				let class_name = this.setTitle(item),				
				title = util.sprintf('登记考勤【%s】',class_name)
				
				if(item.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				if(item.class_attendance){
					item.lesson_remark = item.class_attendance.lesson_remark 
				}
				
				this.$Modal.open('business/attendance/attendance/index.vue@modal',{
					on:{
						'on-success':()=>{
							this.attendanceSuccess()
						}
					}
				})
				.then(modal=>{
					modal.set('arrange',item)
					.set('ca_id',item.ca_id)
					.show(title)
				})
			},
			setTitle (item) {
				let result = '',
					mapTitle = {1:'一对一',2:'一对多'}
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					result = mapTitle[item.lesson_type]
				}
							
				return result
			}
		},
		computed: {
			is_current() {
				return moment(this.currentDate).format('YYYY - MM - DD') == getFormatDate()
			},
			format_data() {
				let arranges = {}
				if(this.data.length > 0) {
					switch(this.view_type) {
						case 1:
							this.data.forEach(d=>{
								if(!arranges[d.teach_eid]) {
									arranges[d.teach_eid] = []
								}
								arranges[d.teach_eid].push(d)
							})
							break;
						case 2:
							this.data.forEach(d=>{
								if(!arranges[d.cr_id]) {
									arranges[d.cr_id] = []
								}
								arranges[d.cr_id].push(d)
							})
							break;
						case 3:
							this.orderBy(this.data,'int_start_hour').forEach(d=>{
								const section = this.getFormatSection(d)
								if(!arranges[section]) {
									arranges[section] = []
								}
								arranges[section].push(d)
							})
							break;
					}
				}
				return arranges
			},
			data_by_condition() {
				if(this.current_condition_key=='') {
					return this.data
				}else{
					return this.format_data[this.current_condition_key]
				}
			},
			data_by_sid() {
				let data = this.data_by_condition
				if(this.student.sid) {
					return data.filter(d=>d.students.findIndex(s => s.sid == this.student.sid) > -1)
				}
				return data
			}
		}
	}
</script>