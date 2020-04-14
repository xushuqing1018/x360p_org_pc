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
		background-color: #F5F5F5 !important;
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
		background-color: #FFFFFF !important;
	}
	.icon-item-del{
		position: absolute;
		right: 15px;
		top: 15px;
		z-index: 100;
	}
</style>

<template>
	<Modal v-model="modal$.show" :title="modal$.title" width="1000" :mask-closable="false" v-drag-modal @on-cancel="cancel">
		<template v-if="modal$.show&&ready">
			<Card dis-hover :bordered="false">
				<div class="row">
					<div class="col-sm-3">
						<div class="pull-left mt-2">
							<letterAvatar 
								v-if="post.teach_eid>0"
	            				:title="post.teach_eid|employee_name"
	            				size='55' 
	            				:src="avatar" 
	            				:name="post.teach_eid|employee_name" 
	            				:rounded=true>
	            			</letterAvatar>							
						</div>
						<div class="pull-left ml-2 mt-2">
							<p class="mb-2">{{post.teach_eid|employee_name}}</p>
							<!--添加考勤且可考勤人数大于0时显示-->
							<Button v-if="modal$.action=='add'&&attendStudents.length>0" type="primary" size="small" @click="changeTeacher">更换{{'老师'|translate}}</Button>
						</div>					
					</div>
					<div class="col-sm-4">
						<template v-if="mode=='arrange'">
							<p class="mb-2">考勤对象：{{getAttendanceName}}</p>
							<p class="mb-2">上课日期：{{course_arrange.int_day|int_date}}</p>
							<p>上课时间：{{course_arrange.int_start_hour|int_hour}} ~ {{course_arrange.int_end_hour|int_hour}}</p>
						</template>						
					</div>
					<div class="col-sm-5">
						<template v-if="modal$.action=='add'">
							<Input 
								v-if="course_arrange.is_attendance===0"
								:rows="3" 
								type="textarea" 
								v-model="post.lesson_remark"
								class="x-ivu-textarea" 
								placeholder="备注：可以对本节课的内容或者下一次课的内容做简要说明">
							</Input>
							<p v-else>备注:{{course_arrange.lesson_remark||'未填写备注'}}</p>
						</template>
						<p v-else>
							备注:
							{{class_attendance.lesson_remark}}
						</p>
					</div>
				</div>
				<Alert v-if="not_arrived_int_day" type="error" show-icon>当前日期未达到排课日期,无法对未来的排课提前登记考勤!</Alert>
			</Card>			
			<div class="row bg-darker-gray" style="padding: 0 15px">
				<div class="mt-3 br-5 col-sm-12 bg-white pt-2 pb-2">
					<div class="pull-left">
						<h5 style="line-height: 32px;">
							<!--从考勤列表查看考勤记录-->
							<template v-if="modal$.action=='record'">
								<span>应到：{{class_attendance.need_nums}}人</span>　
								<span>实到：{{class_attendance.in_nums}}人</span>　
								<span>请假：{{class_attendance.leave_nums}}人</span>　
								<span>补课：{{class_attendance.makeup_nums}}人</span>
								<span>缺勤：{{class_attendance.need_nums-class_attendance.in_nums-class_attendance.leave_nums}}人</span>		
							</template>
							<template v-else>
								<!--部分考勤-->
								<div v-if="course_arrange.is_attendance>0&&course_arrange.class_attendance">
									<span>应到：{{course_arrange.class_attendance.need_nums}}人</span>　
									<span>实到：{{course_arrange.class_attendance.in_nums}}人</span>　
									<span>请假：{{course_arrange.class_attendance.leave_nums}}人</span>　
									<span>补课：{{course_arrange.class_attendance.makeup_nums}}人</span>
									<span>缺勤：{{course_arrange.class_attendance.need_nums-course_arrange.class_attendance.in_nums-course_arrange.class_attendance.leave_nums}}人</span>
								</div>
								<!--未考勤-->
								<div v-else>
									<span>应到：{{totalText('all')}}人</span>　
									<span>实到：{{totalText('attend')}}人</span>　
									<span>请假：{{totalText('leave')}}人</span>　
									<span>缺勤：{{totalText('absent')}}人</span>
								</div>
							</template>
						</h5>
					</div>
					<div class="pull-right" v-if="course_arrange.is_attendance<2">
						<!--可考勤人数大于0时显示-->
						<template v-if="attendStudents.length>0">
							<Checkbox v-model="consume_all" @on-change="consumeAll">扣课时</Checkbox>
							<!-- <span class="mr-1">扣课时数</span>
							<InputNumber 
								v-model="post.consume_lesson_hours"
								:min="0" 
								class="mr-2"
								size="small" 
								style="width:50px">
							</InputNumber> -->
							<Button type="primary" @click="checkAll">全到</Button>
						</template>
						<Button type="warning" class="ml-3" @click="filterData('attend')" v-if="filter_type==''">查看已考勤</Button>
						<Button type="primary" class="ml-3" @click="filterData('')" v-else>返回</Button>
						
						<Tooltip content="添加补课学员" v-if="course_arrange.lesson_type==0&&course_arrange.is_attendance===0">
							<Button type="primary" icon="plus" class="ml-3" @click="showAbsenceModal"></Button>
						</Tooltip>
					</div>
				</div>
			</div>
			
			<div class="bg-darker-gray" style="height: 500px;overflow-y: auto;margin-left: -15px;margin-right: -15px;padding:0 15px">
				<div 
					class="row pt-3 pb-3 pl-2 pr-2" 
					v-loading.like="'course_arranges'">
					<div v-if="!filter_data.length||no_data_text!=''" class="text-center col-sm-12">
						{{no_data_text||'暂无待考勤学员~'}}
					</div>
					<div class="col-sm-4 mb-3" v-for="(item,index) in filter_data" 
						:key="index"
						style="padding:0 5px;"
						v-if="vShow(item.is_attendance)">
						<Card dis-hover :class="{['bg-darker-white']:isAttendance(item)}">
							<!--补课学员允许删除-->
							<Button class="icon-item-del" type="ghost" icon="ios-trash" v-if="item.sa_id&&!item.attendance" size="small" shape="circle" @click="delStudent(item)"></Button>
							
							<div class="row">
								<div class="col-sm-3">
									<letterAvatar 
			            				title=""
			            				size='55' 
			            				:src="setStudentInfo(item,'photo_url')" 
			            				:name="setStudentInfo(item,'student_name')" 
			            				:rounded=true>
			            			</letterAvatar>								
								</div>
								<div class="col-sm-9">
									<h5 class="mb-2"
										:title="setStudentInfo(item,'student_name')+'--'+(item.sex=='1'?'男':'女')+'--'+getAge(setStudentInfo(item,'birth_time'))"
										style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
										<span class="font-weight-bold">{{setStudentInfo(item,'student_name')}}</span>　
										<small>{{item.sex=='1'?'男':'女'}}·{{getAge(setStudentInfo(item,'birth_time'))}}</small>
									</h5>								
									<div>
										<Tag :color="setStudentTag(item).color" class="mr-2">
											{{setStudentTag(item).label}}
										</Tag>
										<Tag v-if="item.student_type!='trial_students'&&item.student_lesson!=null">剩余课时{{item.student_lesson.remain_lesson_hours}}</Tag>
									</div>
								</div>
							</div>						
							<div class="b-t-1 clearfloatblock pt-3 mt-2">
								<!--处理已考勤学员-->
								<div v-if="item.attendance||item.is_attendance">	
									
									<!--试听学员-->
									<div v-if="item.student_type=='trial_students'">
										<div v-if="item.attendance_status===1">
											<Button type="primary" size="small">正常</Button>
											<div class="pull-right text-right" style="height:26px;line-height: 13px;font-size: 12px;">
												<span class="text-success" style="font-size:11px;-webkit-transform: scale(1);">
													已考勤
												</span><br>
											</div>
										</div>
										<div v-else>
											<Button type="error" size="small">缺勤</Button>
										</div>
									</div>
									<!--补课学员、排课学员-->
									<template v-else>
										<div v-if="item.attendance.is_leave==1">
											<Button type="error" size="small">请假</Button>
											<div class="notwrap pull-right text-right" style="width:calc(100% - 40px);height:26px;">
												{{item.attendance.remark||'未填写请假原因'}}
											</div>
										</div>
										<div v-else-if="item.attendance.is_in===1">
											<Button type="primary" size="small">正常</Button>
											<div class="pull-right text-right" style="height:26px;line-height: 13px;font-size: 12px;">
												<span class="text-success" style="font-size:11px;-webkit-transform: scale(1);">{{attendance_way[item.attendance.att_way]}}</span><br>
												<!--考勤时间应取 attendance.in_time-->
												<span style="font-size:9px;-webkit-transform: scale(1);">{{getAttendTime(item)}}</span>
											</div>
										</div>
										<div v-else>
											<Button type="error" size="small">缺勤</Button>
											<div class="notwrap pull-right text-right" style="width:calc(100% - 40px);height:26px;">
												{{item.attendance.remark||'未填写缺勤原因'}}
											</div>
										</div>
									</template>
								</div>
								<!--未考勤-->
								<div v-else>
									<div  v-if="item.is_leave">
										<Button type="error" size="small">请假</Button>
										<div class="notwrap pull-right text-right" style="width:calc(100% - 40px);height:26px;">
											{{item.leave_record.reason||'未填写请假原因'}}
										</div>
									</div>
									<template v-else>
										<div v-if="item.student_type=='trial_students'">
											<!--试听学员只有正常缺勤两种状态，无备注，无扣课时-->
											<RadioGroup v-model="item.attendance_status" type="button" class="x-ivu-radio-group" @on-change="attendanceChange($event,item)">
												<Radio :label="1">正常</Radio>
												<Radio :label="3">缺勤</Radio>
											</RadioGroup>											
											<Input :placeholder="'请输入'+(item.attendance_status>2?'缺勤':'请假')+'原因'" 
												v-if="item.attendance_status==3&&item.student_type!='trial_students'" 
												class="x-ivu-input" 
												v-model="item.remark"
												style="width:calc(100% - 130px);height:26px;">
											</Input>											
										</div>
										<!--排课学员-->
										<div v-else-if="item.student_type=='arrange_students'">
											<div v-if="item.student_lesson!=null">
												<div v-if="item.status===1">
													<Tag color="red" v-if="item.pivot.status===3||item.pivot.is_end===1">结课</Tag>
													<Tag color="red" v-else-if="item.pivot.status===2">已转出</Tag>
													<Tag color="red" v-else-if="item.pivot.status===0">已停课</Tag>
													<div v-else>
														<div v-if="item.student_lesson.remain_lesson_hours>0">													
															<RadioGroup v-model="item.attendance_status" type="button" class="x-ivu-radio-group" @on-change="attendanceChange($event,item)">
																<Radio :label="1">正常</Radio>
																<Radio :label="2">请假</Radio>
																<Radio :label="3">缺勤</Radio>
															</RadioGroup>
															<Select 
																class="x-ivu-select"
																v-model="item.remark" 
																v-if="item.attendance_status==2" 
																style="width:calc(100% - 130px);height:26px;">
																<Option v-for="leave in dicts('leave_reason')" :value="leave.desc">{{leave.title}}</Option>
															</Select>
															<Input :placeholder="'请输入'+(item.attendance_status>2?'缺勤':'请假')+'原因'" 
																v-if="item.attendance_status==3" 
																class="x-ivu-input" 
																v-model="item.remark"
																style="width:calc(100% - 130px);height:26px;">
															</Input>
															<div class="mt-1">
																是否扣课时：<i-switch v-model="item.is_consume" size="small" @on-change="consumeChange"></i-switch>
															</div>
														</div>
														<Tag color="red" type="border" v-else>课时已消耗完</Tag>
													</div>
												</div>
												<Tag :color="ss_map[item.status].color" v-else>{{ss_map[item.status].text}}</Tag>
											</div>
										</div>
										<div v-else>
											<div v-if="item.student_lesson!=null">
												<div v-if="item.status===1">
													<template v-if="item.pivot">
														<Tag color="red" v-if="item.pivot.status===3||item.pivot.is_end===1">结课</Tag>
														<Tag color="red" v-else-if="item.pivot.status===2">已转出</Tag>
														<Tag color="red" v-else-if="item.pivot.status===0">已停课</Tag>
													</template>
													<div v-else>
														<div v-if="item.student_lesson.remain_lesson_hours>0">													
															<RadioGroup v-model="item.attendance_status" type="button" class="x-ivu-radio-group" @on-change="attendanceChange($event,item)">
																<Radio :label="1">正常</Radio>
																<Radio :label="2">请假</Radio>
																<Radio :label="3">缺勤</Radio>
															</RadioGroup>
															<Select 
																class="x-ivu-select"
																v-model="item.remark" 
																v-if="item.attendance_status==2" 
																style="width:calc(100% - 130px);height:26px;">
																<Option v-for="leave in dicts('leave_reason')" :value="leave.desc">{{leave.title}}</Option>
															</Select>
															<Input :placeholder="'请输入'+(item.attendance_status>2?'缺勤':'请假')+'原因'" 
																v-if="item.attendance_status==3" 
																class="x-ivu-input" 
																v-model="item.remark"
																style="width:calc(100% - 130px);height:26px;">
															</Input>
															<div class="mt-1">
																是否扣课时：<i-switch v-model="item.is_consume" size="small" @on-change="consumeChange"></i-switch>
															</div>
														</div>
														<Tag color="red" type="border" v-else>课时已消耗完</Tag>
													</div>
												</div>
												<Tag :color="ss_map[item.status].color" v-else>{{ss_map[item.status].text}}</Tag>
											</div>
										</div>
									</template>
								</div>								
																				
							</div>						
						</Card>
					</div>
				</div>		
			</div>
		</template>
		
		<div slot="footer">
			<!--可考勤人数大于0时显示-->
			<div v-if="ready&&course_arrange.is_attendance<2&&attendStudents.length>0">
				<div class="pull-left text-info">
					<Checkbox v-model="post.is_push"></Checkbox>以微信形式给家长发送上课签到信息(家长需关注公众号)
				</div>
				<Button type="ghost" @click="cancel">取消</Button>				
				<Button type="primary" @click="ok" :disabled="disabledOK" :loading="saving" v-if="">登记考勤</Button>
			</div>
			<div v-else>
				<Button type="ghost" @click="cancel">关闭</Button>
			</div>
		</div>
		
		<select-employee ref="employee" v-model="post.teach_eid" :rid="1" style="display: none;"></select-employee>
		
		<absence-modal ref="absence" :lid="lid$" v-model="sa_ids" @on-selected="makeupStudentsChange"></absence-modal>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dataReady from 'c%/DataReady.vue'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import absenceModal from '../makeup/absence-modal.vue'
	
	const info = {
		lesson_type: 0,
		teach_eid: 0,
		lesson_remark: '',					
		students: [],
		is_push: true,
		// consume_lesson_hours: 0
	}
	
	export default{
		mixins: [grid,modal,common,globals],
		components: {
			dataReady,
			absenceModal,
			letterAvatar,
			selectEmployee
		},
		data () {
			return {
				pk: 'cas_id',	
				filter_type: '',
				mode: 'arrange',				
				ca_id: {},
				class_attendance: {},
				course_arrange: {},
				ready: false,
				filter_data: [],
				sa_ids: [],
				no_data_text: '',
				consume_all: false,
				post: util.copy(info),
				attendance_way: {0:'已考勤',1:'已刷卡',2:'已考勤'}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {				
					this.init_info(this.ca_id)		
					if(!_.isEmpty(this.class_attendance)){
						//上课老师以考勤记录为准
						this.post.teach_eid = this.class_attendance.eid						
					}
					// this.post.consume_lesson_hours = this.getConsumeLessonHours()
				}
			},
		},
		methods: {
			getConsumeLessonHours() {
				let lesson_hours = 0
				let lesson = this.getLessonObj(this.course_arrange.lid)
				if(lesson) {
					lesson_hours = util.int(lesson.unit_lesson_hours)
				}
				return lesson_hours
			},
			getAttendTime (row) {
				if(row.in_time!=null){
					return row.attendance.in_time.substring(11,16)					
				}
				return ''
			},
			delStudent (row) {
				let index = this.filter_data.indexOf(row)
				let idindex = this.sa_ids.indexOf(row.sa_id)
				
				if(idindex>-1){
					this.sa_ids.splice(index,1)
				}
				
				if(index>-1){
					this.filter_data.splice(index,1)
				}
			},
			makeupStudentsChange (ids) {				
				if(ids.length>0){
					let list = this.filter_data
					
					ids.forEach(i=>{
						let index = list.findIndex(l=>l.sid==i.sid)
						
						if(index===-1){
							let obj = {
								sid: i.sid,
								student: i.student,
								student_lesson: i.student_lesson,
								student_type: 'makeup_students',	
								attendance_status: 0,
								status: i.student.status,
								remark: '',
								sa_id: i.sa_id
							}
							this.filter_data.push(obj)
						}						
					})
				}
			},
			showAbsenceModal () {
				this.$r('absence')
				.set('search_field',{int_day:util.today_range()})
				.refresh()
				.show('选择缺课学员','add')
			},
			isAttendance (row) {
				//排课学员根据 attendance来判断是否考勤
				if(row.student_type == 'arrange_students') {
					return !_.isEmpty(row.attendance)
				}else if(row.student_type == 'trial_students'){
				//试听学员根据 is_attendance 来判断是否考勤
					return row.is_attendance===1
				}else{
				//补课学员暂不处理
					return !_.isEmpty(null)//row.attendance
				}
			},
			init_info (ca_id) {				
				this.$rest('course_arranges?with=one_class,lesson,class_attendance&ca_id='+ca_id)
				.get()
				.success(data=>{
					this.course_arrange = data.list[0]
					this.init_students()
				}).error(response=>{					
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'获取排课记录失败！'
					})
				})
			},
			init_students () {
				this.rest_api = 'course_arranges/'+this.ca_id+'/students'
				if(_.isEmpty(this.class_attendance)){
					this.post.teach_eid = this.course_arrange.teach_eid					
				}
				
				this.post.lesson_type = this.course_arrange.lesson_type
				this.ready = true
				this.init_data()		
				
			},
			attendanceChange (val,item) {
				Vue.set(item,'is_consume',(val===1))
				let cosume_student = this.attendStudents.filter(s=>s.is_consume===true)
				
				this.consume_all = false
				
				if(val===1){
					this.consume_all = (this.attendStudents.length===cosume_student.length)
				}
			},
			consumeChange (val) {
				let cosume_student = this.attendStudents.filter(s=>s.is_consume===true)
				if(!val) {
					this.consume_all = false
				}
				if(val&&this.attendStudents.length===cosume_student.length){
					this.consume_all = true
				}
			},
			vShow (is_attendance) {
				if(this.filter_type!=''){
					return is_attendance
				}else{
					return true
				}
			},
			changeTeacher () {
				this.$r('employee').openModal()
			},
			filterData (type) {					
				this.filter_type = type
				if(type!=''&&!this.filter_data.filter(f=>f.is_attendance).length){
					this.no_data_text = '没有已考勤学员~'
				}else{
					this.no_data_text = ''
				}
			},
			setStudentInfo (item,field) {
				let result = ''
				//排课学员
				if(item.student_type=='arrange_students'){					
					result = field?item[field]:item
				//试听学员
				}else if(item.student_type=='trial_students'){
					
					if(item.is_student){
						result = field?item.student[field]:item.student
					}else{
						result = field?item.customer[field]:item.customer
						
						if(field=='student_name'){
							result = item.customer.name
						}
						if(field=='photo_url'){
							result = ''
						}
					}
				//补课学员
				}else{					
					result = field?item.student[field]:item.student
				}
				
				return result
			},
			setStudentTag (item) {
				let map_tag = {
						'arrange_students':1,
						'trial_students':2,
						'makeup_students':3
					},
					tag = {
						1:{color:'blue',label:'班'},
						2:{color:'yellow',label:'试'},
						3:{color:'green',label:'补'}
					},
					mapType = {
						0:'班',
						1:'一',
						2:'多'
					},
					result = tag[map_tag[item.student_type]]
				
//				if(!_.isEmpty(item.student_lesson)){
//					if(map_tag[item.student_type]===1||item.student_lesson.lesson_type>0){
//						result.label = mapType[item.student_lesson.lesson_type]
//					}
//				}
				
				return result
			},			
			deal_data (data) {
				let list = ['arrange_students','makeup_students','trial_students']				
				list.forEach(l=>{
					if(data[l].length>0){
						data[l].forEach(d=>{					
							Vue.set(d,'student_type',l)
							Vue.set(d,'remark','')	
							this.filter_data.push(d)
						})
					}
				})
				return data
			},
			totalText (type) {
				let result = 0
				let map_type = {'attend':1,'leave':2,'absent':3},
					filter = (f) => {return true}
				switch (type) {
					//应到学员：is_attendance=0,is_leave=0
					//未请假，未缺勤，未考勤的学员
					case 'all':
						filter = (f) => {
							if(!_.isEmpty(f.pivot)&&f.pivot.cid){
								return f.status===1&&f.pivot.status===1&&f.pivot.is_end===0
							}else{
								return f=>f.status===1
							}
						}
						result = this.filter_data.filter(filter).length
						break
					case 'attend':
					case 'leave':
					case 'absent':
						filter = (f) => {
							if(!_.isEmpty(f.pivot)&&f.pivot.cid){
								return f.status===1&&f.attendance_status===map_type[type]&&f.pivot.status===1&&f.pivot.is_end===0
							}else{
								return f.status===1&&f.attendance_status===map_type[type]
							}
						}
						
						result = this.filter_data.filter(filter).length
						break
				}
				return result
			},
			consumeAll (val) {	
				if(this.attendStudents.length>0){					
					this.attendStudents.forEach(d=>{						
						Vue.set(d,'is_consume',val)
					})
					
				}
			},
			checkAll () {
				if(this.attendStudents.length>0){
					this.post.students = []
					this.consume_all = true
					this.attendStudents.forEach(d=>{
						Vue.set(d,'attendance_status',1)
						
						//正式学员才有课时
						if(d.student_type!='trial_students'){
							Vue.set(d,'is_consume',true)							
						}
						
					})
					
				}
              	
			},
			init_post_data () {				
				let filter_condition = (item) => {
						if(item.student_type=='trial_students'){
							return true
						}else{
							if(!_.isEmpty(item.pivot)&&item.pivot.cid){
								return !item.is_attendance && !item.is_leave && !item.is_suspend && !item.is_lost && item.status===1 && item.pivot.status===1 &&item.pivot.is_end===0						
							}else{
								return !item.is_attendance && !item.is_leave && !item.is_suspend && !item.is_lost && item.status===1
							}
						}						
					},
					filter_condition2 = (item) => {
						return item.student_lesson&&item.student_lesson.remain_lesson_hours==0
					}
				
				let data = this.filter_data.filter(filter_condition)
				let noLessonHourStudents = data.filter(filter_condition2)
				
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
							if(d.student_type=='trial_students'){
								obj.is_trial = true
								
								if(d.is_student===0){
									Vue.delete(obj,'sid')
									obj.cu_id = d.cu_id
								}
							}else if(d.student_type=='makeup_students'){
								if(d.sa_id){
									obj.sa_id = d.sa_id
								}
								obj.is_makeup = true
							}
							
							this.post.students.push(obj)
						}
					})
					if(this.post.students.length===0){
						this.$Message.error('您还没有对任何学员的出勤状态进行选择!')
						return false
					}
					
					if(this.post.students.length<(data.length - noLessonHourStudents.length)){						
						this.$Message.error('还有学员的出勤状态没有选择!')
						return false
					}
					
					return true
				}				
			},
			cancel () {
				this.post = util.copy(info)
				this.lesson_type = 0
				this.lesson_remark = ''
				this.teach_eid = 0
				this.filter_data = []
				
				this.close()				
			},
			ok () {
				if(this.init_post_data()){
					this.$rest('course_arranges/'+this.ca_id+'/attendances').post(this.post)
					.success(data=>{
						this.$Message.success('考勤登记成功')
						this.cancel()
						this.$emit('on-success')
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'登记考勤失败'
						})
					})
				}
			}
		},
		computed: {
			not_arrived_int_day(){
				let int_day = util.today_int_day()
				if(this.course_arrange.int_day > int_day){
					return true
				}
				return false
			},
			attendStudents () {
				let filter_condition = (item) => {
					if(item.student_type=='arrange_students'){
						return !item.is_attendance && !item.is_leave && !item.is_suspend && !item.is_lost && (item.student_lesson!=null && item.student_lesson.remain_lesson_hours>0)					
					}else if(item.student_type=='trial_students'){
						return true
					}else{
						return true	
					}
				}
				return this.filter_data.filter(filter_condition)
			},
			disabledOK () {
				if(this.filter_type!=''||this.filter_data.length===0||this.not_arrived_int_day){
					return true
				}
				
				return false
			},
			avatar () {
				let src = ''
				if(this.course_arrange.teach_eid>0){					
					let temp_obj = this.$store.state.gvars.employees.find(e=>e.eid===this.post.teach_eid)
					if(temp_obj){
						src = temp_obj.photo_url
					}					
				}
				return src
			},
			lid$ () {
				if(this.course_arrange){
					return this.course_arrange.lid					
				}
				return 0
			},
			getAttendanceName () {
				let course_arrange = this.course_arrange,
					mapTitle = {1:'一对一',2:'一对多'},
					result = ''
				if(course_arrange.lesson_type===0){					
					result = course_arrange.one_class!=null?course_arrange.one_class.class_name:course_arrange.name					
				}else{					
					result = mapTitle[course_arrange.lesson_type]										
				}
				
				return result
			}
		}
	}
</script>
