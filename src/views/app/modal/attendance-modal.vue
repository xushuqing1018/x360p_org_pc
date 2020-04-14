<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="950">
		<div class="schedule-grid">
			<div class="text-center schedule-grid-head mt-0">
				<div class="color-mean">
					<span class="small-grid arranged ml-1"></span>未考勤
					<span class="small-grid attended ml-1"></span>已考勤
					<span class="small-grid part-attended ml-1"></span>部分考勤
				</div>
				<Button 
					type="ghost" 
					size="small"
					@click="dayChange('prev')">
					<Icon type="chevron-left"></Icon>
				</Button>
				<span class="date-info">
					<span class="current">{{format_date}}</span>
				</span>
				<Button
					type="ghost"
					size="small"
					@click="dayChange('next')">
					<Icon type="chevron-right"></Icon>
				</Button>
				<div class="per-scope">
					<per-scope per="arrange.checkAll" @on-change="perScopeChange"></per-scope>
				</div>
			</div>
			<div class="schedule-grid-main mt-2" style="position:relative;">
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
				<div :class="['schedule-arranges',data.length==0?'empty-img':'']">
					<div class="schedule-arranges-list">
						<Row class="schedule-arranges-item" v-for="item in orderBy(data_by_condition,'int_start_hour')" @click.native="showAttendModal(item)">
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
			<attendance-modal ref="attendanceModal" @on-success="attendanceSuccess(false)"></attendance-modal>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import attendanceModal from '@/views/business/attendance/attendance/index.vue' 

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
			attendanceModal
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
				type_arrange: ''
			}
		},
		watch: {
			'currentDate':function(date) {
				this.init_data()
			},
			'view_type':function(val) {
				this.current_condition_key = ''
			},
			'type_arrange':function(val) {
				this.init_data()
			}
		},
		methods: {
			attendanceSuccess () {
				this.init_data()
				this.$emit('on-success')
				
			},
			perScopeChange(value) {
				this.type_arrange = value
			},
			viewType(val) {
				this.view_type = val
			},
			selectItem(key) {
				if(this.current_condition_key == key) {
					this.current_condition_key = ''
				}else{
					this.current_condition_key = key
				}
			},
			dayChange(action){
				let dt = this.currentDate.getDate()
				if(action == 'prev'){
					this.currentDate = new Date(this.currentDate.setDate(dt-1))
				}else{
					this.currentDate = new Date(this.currentDate.setDate(dt+1))
				}
				this.year = util.int(moment(this.currentDate).format('YYYY'))
				this.week = util.get_date_week_no(this.currentDate)
				this.format_date = moment(this.currentDate).format('YYYY - MM - DD')
			},
			hook_get_param(param) {
				param.int_day = moment(this.currentDate).format('YYYYMMDD')
				param.with = 'one_class,students,class_attendance'
				param.is_cancel = 0
				param.pagesize = 1000
				if(this.type_arrange == 'my') {
					param.teach_eid = this.eid$
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
				this.$Modal.open('app/modal/service-registration-modal.vue',{
					props: {
						arrange: item
					}
				})
				.then(modal => {
					modal.show('服务登记')
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
			}
		}
	}
</script>