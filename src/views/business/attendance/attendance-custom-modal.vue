<style lang="less">
	.x-avatar{
		width: 55px !important;
		height: 55px !important;
		border-radius: 100% !important;
	}
	.x-ivu-textarea{
		textarea{
			resize: none !important;
			height: 100% !important;
		}
	}
	.bg-darker-gray{
		background-color: #e6e6e6;
	}
	.bg-darker-white{
		background-color: #F5F5F5;
	}
	.clearfloatblock{
		&:after{
			content:'';
			clear: both;
			display: block;	
		}		
	}
	.x-ivu-radio-group{
		.ivu-radio-wrapper{
			height: 26px !important;
			line-height: 26px !important;
			padding: 0 7px !important;
		}
	}
	.br-5{
		border-radius: 5px;
	}
	.bg-white{
		background-color: #FFFFFF;
	}
</style>

<template>
	<Modal v-model="modal$.show" width="900" :mask-closable="false" v-drag-modal @on-cancel="cancel">
		<div slot="header" style="line-height: 26px;">
			<span>{{modal$.title}}</span>
			<Button class="ml-3" type="primary" @click="attendArrange" v-if="modal$.action=='add'">排课考勤</Button>
		</div>
		<template v-if="modal$.show">
			<Card dis-hover :bordered="false">
				<div class="row">
					<div class="col-sm-3">
						<div class="pull-left mt-2">
							<letterAvatar 
	            				:title="''"
	            				size='55' 
	            				:src="teacher.photo_url" 
	            				:name="teacher.employee_name" 
	            				:rounded=true>
	            			</letterAvatar>							
						</div>
						<div class="pull-left ml-2 mt-2">
							<p class="mb-2">{{teacher.employee_name}}</p>
							<Button type="primary" size="small" @click="changeTeacher" v-if="modal$.action=='add'">更换{{'老师'|translate}}</Button>
						</div>					
					</div>
					<div class="col-sm-4">
						<template v-if="mode=='arrange'">
							<p class="mb-2">
								考勤对象：{{lessonTypeName}}
								<Button class="ml-3" type="primary" @click="selectStudent" size="small" v-if="modal$.action=='add'">请选择</Button>
							</p>
							<p class="mb-2">
								上课日期：
								<span v-if="modal$.action=='record'">
									{{class_attendance.int_day|int_date}}
								</span>
								<DatePicker 
									v-else
									v-model="post.int_day" 
									type="date" 
									placeholder="选择日期" 
									style="width: 170px;display: inline-block;" 
									:options="{disabledDate:disabledDate}"
									size="small">
								</DatePicker>
							</p>
							<p>
								上课时段：
								<span v-if="modal$.action=='record'">{{class_attendance.int_start_hour|int_hour}}~{{class_attendance.int_end_hour|int_hour}}</span>
								<template  v-else>
									<Select v-model="post.lesson_period" style="width: 142px;display: inline-block;" class="x-ivu-select">
										<Option v-for="item in timeSections" :value="item.int_start_hour+','+item.int_end_hour">{{item.int_start_hour}}--{{item.int_end_hour}}</Option>
									</Select>
									<Button v-per="'time.add'" @click="timeAdd" type="ghost" icon="plus" size="small"></Button>
								</template>
							</p>
						</template>						
					</div>
					<div class="col-sm-5">
						<div class="mb-2" v-if="subjects.length>1">
							科目：
							<Select v-model="post.sj_id" style="width: 170px;display: inline-block;" class="x-ivu-select">
								<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
							</Select>
						</div>
						<div>
							<p v-if="modal$.action=='record'">备注：{{class_attendance.lesson_remark}}</p>
							<Input 
								v-else
								:rows="subjects.length>0?2:4" 
								type="textarea" 
								v-model="post.lesson_remark"
								class="x-ivu-textarea" 
								placeholder="备注：可以对本节课的内容或者下一次课的内容做简要说明">
							</Input>
						</div>						
					</div>
					
				</div>
			</Card>			
			<div class="row bg-darker-gray" style="padding: 0 15px">
				<div class="mt-3 br-5 col-sm-12 bg-white pt-2 pb-2">
					<div class="pull-left">						
						<h5 style="line-height: 32px;">
							<template v-if="modal$.action=='record'">
								<span>应到：{{class_attendance.need_nums}}人</span>　
								<span>实到：{{class_attendance.in_nums}}人</span>　
								<span>请假：{{class_attendance.leave_nums}}人</span>　
								<span>补课：{{class_attendance.makeup_nums}}人</span>
								<span>缺勤：{{class_attendance.need_nums-class_attendance.in_nums-class_attendance.leave_nums}}人</span>		
							</template>
							<template v-else>
								<span>应到：{{totalText('all')}}人</span>　
								<span>实到：{{totalText('attend')}}人</span>　
								<span>请假：{{totalText('leave')}}人</span>　
								<span>缺勤：{{totalText('absent')}}人</span>
							</template>
						</h5>
					</div>
					<div class="pull-right" v-if="modal$.action=='add'">
						<Button type="primary" @click="checkAll">全到</Button>
					</div>
				</div>
			</div>
			
			<div 
				class="bg-darker-gray row pt-3 pb-3" 
				v-loading.like="'course_arranges'" 
				style="max-height: 500px;overflow-y: auto;">
				<div v-if="!data.length" class="text-center col-sm-12">
					{{'请选择学员~'}}
				</div>
				<div class="col-sm-4 padder-sm mb-3" v-for="(item,index) in data" 
					:key="index">
					<Card dis-hover :class="item.is_attendance?'bg-darker-white':''">
						<div class="row">
							<div class="col-sm-3">
								<letterAvatar 
		            				title=""
		            				size='55' 
		            				:src="item.student.photo_url" 
		            				:name="item.student.student_name" 
		            				:rounded=true>
		            			</letterAvatar>	
							</div>
							<div class="col-sm-9">
								<h5 class="mb-2"
									style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
									<span class="font-weight-bold">{{item.student.student_name}}</span>　
									<small>{{getAge(item.student.birth_time)}}</small>
								</h5>								
								<div>
									<Tag color="blue" class="mr-2">{{getLessonType(item)===0?'班':(getLessonType(item)===1?'一':'多')}}</Tag>
									<Tag>
										剩余课时{{getRemainHour(item)}} 
									</Tag>
								</div>
							</div>
						</div>						
						<div class="b-t-1 clearfloatblock pt-3 mt-2">
							<!--登记考勤时-->
							<template v-if="modal$.action=='add'">
								<div v-if="item.student.status===1">
									<div v-if="getRemainHour(item)>0">
										<RadioGroup v-model="item.attendance_status" type="button" class="x-ivu-radio-group" @on-change="attendanceChange($event,item)">
											<Radio :label="1">正常</Radio>
											<Radio :label="2">请假</Radio>
											<Radio :label="3">缺勤</Radio>
										</RadioGroup>
										<Select 
											class="x-ivu-select"
											v-model="item.remark" 
											v-if="item.attendance_status==2" 
											style="width:calc(100% - 130px)">
											<Option v-for="leave in dicts('leave_reason')" :value="leave.desc">{{leave.title}}</Option>
										</Select>
										<Input :placeholder="'请输入'+(item.attendance_status>2?'缺勤':'请假')+'原因'" 
											v-if="item.attendance_status==3" 
											class="x-ivu-input" 
											v-model="item.remark"
											style="width:calc(100% - 130px);height:26px;"></Input>	
										<div class="mt-1">
											是否扣课时：<i-switch v-model="item.is_consume" size="small"></i-switch>
										</div>	
									</div>
									<Tag color="red" type="border" v-else>课时已消耗完</Tag>
								</div>
								<Tag :color="ss_map[item.student.status].color" v-else>{{ss_map[item.student.status].text}}</Tag>
							</template>
							<!--考勤记录-->
							<template v-else>
								<div v-if="item.is_leave==1">
									<Button type="error" size="small">请假</Button>
									<div class="notwrap pull-right text-right" style="width:calc(100% - 40px);height:26px;">
										{{item.remark||'未填写请假原因'}}
									</div>
								</div>
								<div v-else-if="item.is_in===1">
									<Button type="primary" size="small">正常</Button>
									<div class="pull-right text-right" style="height:26px;line-height: 13px;font-size: 12px;">
										<span class="text-success" style="font-size:11px;-webkit-transform: scale(1);">{{attendance_way[item.att_way]}}</span><br>
										<!--考勤时间应取 in_time-->
										<span style="font-size:9px;-webkit-transform: scale(1);">{{item.student_lesson.last_attendance_time.substring(11,16)}}</span>
									</div>
								</div>
								<div v-else>
									<Button type="error" size="small">缺勤</Button>
									<div class="notwrap pull-right text-right" style="width:calc(100% - 40px);height:26px;">
										{{item.remark||'未填写缺勤原因'}}
									</div>
								</div>
							</template>
						</div>
					</Card>
				</div>
			</div>
		</template>
		
		<div slot="footer">
			<div v-if="modal$.action=='add'">
				<div class="pull-left text-info">				
					<Checkbox v-model="post.is_push"></Checkbox>以微信形式给家长发送上课签到信息(家长需关注公众号)
				</div>
				<Button type="ghost" @click="cancel">取消</Button>
				<Button type="primary" @click="ok" :disabled="disabledOK" :loading="saving">登记考勤</Button>
			</div>
			<div v-else>
				<Button type="ghost" @click="cancel">关闭</Button>
			</div>
		</div>
		
		<select-employee ref="employee" v-model="post.teach_eid" :rid="1" style="display: none;"></select-employee>
		<teaching-object ref="object" @on-selected="initInfo"></teaching-object>
		<time-section-info-modal ref="tsInfo" :season="season$" :week-day="weekDay$"></time-section-info-modal>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import teachingObject from './teaching-object.vue'
	import TimeSectionInfoModal from 'c%/TimeSectionInfoModal.vue'
	
	const info = {
		lesson_type: -1,
		teach_eid: 0,
		lesson_remark: '',		
		int_day: moment(new Date()).format('YYYY-MM-DD'),
		lesson_period: '',
		sj_id: 0,
		is_push: true,
		students: []
	}
	
	export default{
		mixins: [grid,modal,common,globals],
		components: {
			letterAvatar,
			teachingObject,
			selectEmployee,
			TimeSectionInfoModal
		},
		data () {
			return {	
				mode: 'arrange',
				info: {},
				class_attendance: {},
				data: [],
				no_data_text: '',
				post: util.copy(info),	
				attendance_way: {0:'已考勤',1:'已刷卡',2:'已考勤',3:'自由登记考勤'},
				subjects: [],			//如果是1对1学员报读了多科目的课时包则需要选择科目
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					if(!_.isEmpty(this.class_attendance)){
						//上课老师以考勤记录为准
						this.post.teach_eid = this.class_attendance.eid
						this.initAttendStudents(this.class_attendance.catt_id)
					}
				}
			}
		},
		methods: {
			disabledDate(dt){
				let int_day = util.int(moment(dt).format('YYYYMMDD'))
				if(int_day > util.today_int_day()){
					return true
				}
				return false
			},
			getLessonType (row) {
				if(this.modal$.action=='record'){
					return row.lesson_type
				}else{
					return this.post.lesson_type
				}
			},
			getRemainHour (row) {
				if(this.post.lesson_type===0||this.modal$.action=='record'){
					return row.student_lesson.remain_lesson_hours
				}else{
					return row.remain_lesson_hours
				}
			},
			timeAdd () {
				this.$r('tsInfo').show('添加时间段')
			},			
			initAttendStudents (id) {
				let params = {
					catt_id: id,
					with: 'student,student_lesson'
				}
				this.$rest('student_attendances')
				.get(params)
				.success(data=>{
					this.data = data.list
				}).error(response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'获取学员失败'
					})
				})
			},
			attendArrange () {
				this.$store.state.layout.$refs['attendanceArrange']
				.set('tabs','list')
				.show('按排课登记考勤','add')
				this.cancel()
			},
			attendanceChange (val,item) {
				Vue.set(item,'is_consume',(val===1))			
			},
			totalText (type) {
				let result = 0
				let map_type = {'attend':1,'leave':2,'absent':3}
				switch (type) {
					case 'all':
						result = this.data.filter(d=>d.student.status===1).length
						break
					case 'attend':
					case 'leave':
					case 'absent':
						result = this.data.filter(d=>d.student.status===1&&d.attendance_status===map_type[type]).length						
						break
				}
				return result
			},
			changeTeacher () {
				this.$r('employee').openModal()
			},
			selectStudent () {
				this.$r('object').show('选择考勤对象','add')
			},
			initInfo (selected) {
				let ids = selected.ids
				this.post.lesson_type = selected.type
				this.info = selected
				if(selected.type===0){					
					this.post.teach_eid = selected.map_ids[ids[0]].teach_eid
					this.$rest('classes/'+selected.info.cid+'/students').get()
					.success(response=>{
						this.initStudent(response.list)
					})
				}else{
					this.initStudent(selected)
				}			
			},
			initStudent (list) {
				let type = this.post.lesson_type				
				if(type===0){
					this.data = list.filter(l=>l.student!==null)
				}else{
					let ids = list.ids,
						data = list.map_ids
						
					if(ids.length>0){
						this.data = []
						ids.forEach(i=>{
							this.data.push(data[i])
						})
					}
					if(type>0){
						this.init_subjects(list.info.lid)
					}
				}
				
			},
			init_subjects (lid) {
				let lessons = this.$store.state.gvars.lessons,
					subjects = this.$store.state.gvars.subjects,
					lesson = lessons.find(l=>l.lid===lid),
					sj_ids = []
					
				this.subjects = []				
				if(lesson) {					
					this.post.sj_id = lesson.sj_id
					sj_ids = lesson.sj_ids
				}
				if(sj_ids.length>1){
					this.subjects = subjects.filter(s=>sj_ids.indexOf(s.sj_id)>-1)
				}
			},
			checkAll () {
				let filter_condition = (item) => {
						return !item.is_attendance && !item.is_leave && !item.is_suspend && !item.is_lost&&this.getRemainHour(item)>0
					}, 
					data = this.data.filter(filter_condition)
				
				if(data.length>0){
					this.post.students = []
					data.forEach(d=>{
						Vue.set(d,'attendance_status',1)
						Vue.set(d,'is_consume',true)
						this.post.students.push(d)
					})					
				}
              	
			},
			init_post_data () {
				let data = this.data.filter(d=>d.student.status===1)
				
				if(data.length>0){
					this.post.students = []
					data.forEach(d=>{	
						if(d.attendance_status){
							let obj = {
								sid: d.sid,
								is_consume: d.is_consume,
								attendance_status: d.attendance_status,
								remark: d.attendance_status===1?'':d.remark
							}
							if(this.post.lesson_type===0){
								if(!this.post.cid){
									this.post.cid = d.cid
								}
								
								obj.cid = d.cid
							}else{
								obj.sl_id = d.sl_id
							}
							if(d.student_type=='trial_students'){
								obj.is_trial = true
								
								if(d.is_student===0){
									Vue.delete(obj,'sid')
									obj.cu_id = d.cu_id
								}
							}else if(d.student_type=='makeup_students'){
								obj.is_makeup = true
							}
							
							this.post.students.push(obj)
						}
					})					
					if(this.post.teach_eid===0){
						this.$Message.error('请选择上课老师')
						return false
					}
					
					if(this.post.int_day===''){
						this.$Message.error('请选择上课日期')
						return false
					}else{
						this.post.int_day = moment(this.post.int_day).format('YYYY-MM-DD')

						if(util.int(util.format_int_day(this.post.int_day)) > util.today_int_day()){
							this.$Message.error('上课日期超出了今天的日期，无法为未来的日期登记考勤!')
							return false
						}
					}
					
					if(!this.post.lesson_period.length){
						this.$Message.error('请选择时间考勤时段')
						return false
					}else{
						if(this.post.lesson_period.indexOf(',')>-1){
							this.post.lesson_period = this.post.lesson_period.split(',')
						}
					}
					
					if(this.post.students.length<data.length){						
						this.$Message.error('必须给每个学员标记状态才可考勤')
						return false
					}
					return true
				}				
			},
			cancel () {
				this.post = util.copy(info)
				this.data = []
				
				this.close()			
			},
			ok () {
				if(this.init_post_data()){					
					this.$rest('student_attendances/free').post(this.post)
					.success(data=>{
						this.$Message.success('考勤成功！')
						this.$emit('on-success')
						this.$r('object').refreshAll()
						this.cancel()
					}).error(response=>{
						this.$Notice.error({
							title: '考勤失败',
							desc: response.body.message||'登记考勤失败'
						})
					})
				}
			}
		},
		computed: {
			lessonTypeName () {
				let map_lesson_type = {0:'班组课',1:'一对一',2:'一对多'},
					lesson_type = this.post.lesson_type,
					action = this.modal$.action
				if(action=='record'){
					lesson_type = this.class_attendance.lesson_type
				}
				
				if(lesson_type===0){					
					map_lesson_type[0] = action=='record'?this.class_attendance.cls.class_name:this.info.info.class_name					
				}
				
				return map_lesson_type[lesson_type] || '请选择'
			},
			disabledOK () {
				if(this.data.length===0){
					return true
				}
				return false
			},
			teacher () {
				let teacher = {
					employee_name: '无',
					photo_url: '',
				},
				employee = this.$store.getters.getMapObject(this.post.teach_eid,'employee')
				
				if(typeof employee !== 'undefined'&&!_.isEmpty(employee)){
					teacher.photo_url = employee.photo_url
					teacher.employee_name = employee.ename
				}
				return teacher
			},
			season$ () {
				let time = moment(this.post.int_day).format('YYYY-MM-DD')
				return this.get_season_by_date(util.new_date(time))
			},
			weekDay$ () {
				let time = moment(this.post.int_day).format('YYYY-MM-DD')
				return moment(time).isoWeekday()
			},
			timeSections () {				
				return this.get_time_sections(this.weekDay$,this.season$)
			}
		}
	}
</script>