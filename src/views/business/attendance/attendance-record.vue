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
						</div>					
					</div>
					<div class="col-sm-4">					
						<p class="mb-2">考勤对象：{{getAttendanceName}}</p>
						<p class="mb-2">上课日期：{{course_arrange.int_day|int_date}}</p>
						<p>上课时间：{{course_arrange.int_start_hour|int_hour}} ~ {{course_arrange.int_end_hour|int_hour}}</p>									
					</div>
					<div class="col-sm-5">					
						<p>
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
				</div>
				
				<div class="mt-3 mb-3 p-0 bg-white col-md-12">
					<table class="modal-table">
						<thead>
							<th>
								<div class="ivu-table-cell">
									学员
								</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									年龄
								</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									考勤状态
								</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									课时
								</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									考勤时间
								</div>
							</th>
						</thead>
						<tr v-for="item in filter_data">
							<td>
								<div class="ivu-table-cell">
									<avatar-and-name :src="setStudentInfo(item,'photo_url')" :name="setStudentInfo(item,'student_name')" :sex="item.sex"></avatar-and-name>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									{{getAge(setStudentInfo(item,'birth_time'))||'-'}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell" :class="getConsumeStatus(item).class">
									{{getAttendStatus(item).label}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell" :class="getConsumeStatus(item).class">
									{{getConsumeStatus(item).label}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									{{getAttendTime(item)}}
								</div>
							</td>
						</tr>
					</table>
				</div>
			</div>
			
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import dataReady from 'c%/DataReady.vue'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import absenceModal from '../makeup/absence-modal.vue'
	
	const info = {
		lesson_type: 0,
		teach_eid: 0,
		lesson_remark: '',					
		students: [],
		is_push: true
	}
	
	export default{
		mixins: [grid,modal,common,globals],
		components: {
			dataReady,
			absenceModal,
			letterAvatar
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
				}
			},
		},
		methods: {
			getConsumeStatus (row) {
				let result = {
					class: '',
					label: ''
				}
				if(row.attendance&&row.attendance.is_consume){
					result.label = '已扣'
					result.class = 'text-success'
				}else{
					result.label = '未扣' 
				}
				 
				return result
			},
			getAttendStatus (row) {
				let result = {
					class: '',
					label: ''
				}
				//已考勤学员
				if(row.attendance){
					if(row.student_type=='trial_students'){
						if(row.attendance_status===1){
							result.label = '已考勤'
							result.class = 'text-success'
						}else{							
							result.label = '缺勤'
							result.class = 'text-error'
						}
					}else{
						result.class = 'text-error'
						
						if(row.attendance.is_leave==1){
							result.label = '请假'							
						}else if(row.attendance.is_in===1){
							result.label = '已考勤'
							result.class = 'text-success'
						}else{
							result.label = '缺勤'
						}
					}
				}else{
					result.class = 'text-error'
					if(row.is_leave){
						result.label = '请假'
					}else{
						result.label = '未考勤'						
//						if(row.student_lesson!=null){
//							if(row.status == 1){								
//								
//							}else if(row.status == 20){
//								result = '停课'
//							}else if(row.status == 30){
//								result = '休学'
//							}else if(row.status == 90){
//								result = '退学'
//							}
//						}
					}
				}
				return result
			},
			getAttendTime (row) {
				if(row.attendance&&row.attendance.in_time){
					return row.attendance.in_time					
				}
				return '-'
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
				this.$rest('course_arranges?with=one_class,class_attendance&ca_id='+ca_id)
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
			vShow (is_attendance) {
				if(this.filter_type!=''){
					return is_attendance
				}else{
					return true
				}
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
				
				if(!_.isEmpty(item.student_lesson)){
					if(map_tag[item.student_type]===1||item.student_lesson.lesson_type>0){
						result.label = mapType[item.student_lesson.lesson_type]
					}
				}
				
				return result
			},			
			deal_data (data) {
				let list = ['arrange_students','makeup_students','trial_students']
				this.filter_data = []
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
			cancel () {
				this.post = util.copy(info)
				this.lesson_type = 0
				this.lesson_remark = ''
				this.teach_eid = 0
				this.filter_data = []
				
				this.close()				
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
