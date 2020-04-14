
<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="950">
		<div class="row">
			<div class="col-sm-4">
				<div class="text-center">
					<letterAvatar 
	    				:title="teacher.name"
	    				size='55' 
	    				:src="teacher.avatar" 
	    				:name="teacher.name" 
	    				:rounded=true>
	    			</letterAvatar>
	    		</div>
				<Form :label-width="90">
					<FormItem label="授课老师" prop="teach_eid" class="mb-1" style="margin-top: 33px;">
						<select-employee :rid="1" v-model="info.teach_eid"/>
					</FormItem>
				</Form>
			</div>
			<Form ref="form" :model="info" :label-width="90" class="col-sm-4">
				<FormItem label="授课对象" class="mb-1">
					<select-object
						ref="object"
						mode="arrange"
						clearable
						@on-selected="setTeachObject"
						@on-clear="clearSelected">
					</select-object>
				</FormItem>
				<FormItem label="授课日期" prop="date" class="mb-1">
					<DatePicker :value="info.int_day" @on-change="info.int_day=$event" placeholder="选择授课日期" style="width: 100%"></DatePicker>
				</FormItem>
				<FormItem label="授课时间" prop="time" class="mb-1">
					<select-time-section 
                        clearable
                        :value="ts_array" 
                        @on-change="changeTimeSection"
                        placeholder="请选择上课时间段">
                    </select-time-section>
				</FormItem>
			</Form>
			<div class="col-sm-4">
				<Input 
					:rows="3"
					type="textarea"
					v-model="info.lesson_remark"
					placeholder="备注：可以对本节课的内容或者下一次课的内容做简要说明">
				</Input>
				<div style="margin-top: 28px">
					<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
					<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
				</div>
			</div>
		</div>
		<student-table class="student-view" :table-data="tableData" :add-data="addData" />
		<div slot="footer">
				<div class="pull-left text-info">
					<Checkbox v-model="info.is_push">
						以微信形式给家长发送上课签到信息(家长需关注公众号)
					</Checkbox>
				</div>
				<Button type="ghost" @click="close" :loading="saving">关闭</Button>
				<Button type="primary" @click="handleSubmit" :loading="saving" :disabled="disabledOK">确定</Button>
			</div>
		
	</Modal>
</template>

<script>
import moment from 'moment'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import SelectEmployee from 'c%/SelectEmployee'
import SelectClass from 'c%/SelectClass'
import SelectStudent from 'c%/SelectStudent'
import StudentTable from './free-attendance/student-table.vue'
import SelectObject from 'c%/review/review-object.vue'
import letterAvatar from 'c%/LetterAvatar.vue'
import SelectTimeSection from 'c%/SelectTimeSection'

export default {
	mixins: [modal, common],
	components: {
		StudentTable,
		SelectStudent,
		SelectClass,
		SelectEmployee,
		letterAvatar,
		SelectObject,
		SelectTimeSection
	},
	data () {
		const vm = this;
		
		const validateDateNonEmpty = (rule, value, callback) => {
			if(value !== "") {
				callback();
			}
			else {
				let message = vm.rules[rule.field][0].message;
				callback(new Error(message));
			}
		}

		const validateTimeNonEmpty = (rule, value, callback) => {
			if(value[0] != ''&&value[1] != '') {
				callback();
			}
			else {
				let message = vm.rules[rule.field][0].message;
				callback(new Error(message));
			}
		}

		return {
			ts_array: [],
			filterName: '',
			tableData: [],
			addData: {
				sids: [],
				cu_ids: [],
				sl_ids: [],
				sa_ids: [],
				payType: 1,
				payNum: 0
			},
			info: {
				teach_eid: 0,
				lesson_type: 0,
				cid: 0,
				lid: 0,
				// sid: 0,
				// sids: [],
				int_day: '',
				int_start_hour: '',
				int_end_hour: '',
				lesson_remark: '',
				is_push: 0,
				ignore_student_cc:0,
				ignore_class_ec:0
			},
			rules: {
				date: [
					{ required: true, validator: validateDateNonEmpty, message: '授课日期不能为空', trigger: 'blur' },
				],
				time: [
					{ required: true, validator: validateTimeNonEmpty, message: '授课时间不能为空', trigger: 'blur' },
				],
				eid: [
					{ required: true, type: 'number', min: 1, message: '授课老师不能为空', trigger: 'blur' },
				],
				lesson_type: [
					{ required: true, type: 'number', min: 0, message: '授课类型不能为空', trigger: 'blur' },
				],
				cid: [
					{ required: true, type: 'number', min: 1, message: '授课班级不能为空', trigger: 'blur' },
				],
				// sid: [
				// 	{ required: true, type: 'number', min: 1, message: '上课学员不能为空', trigger: 'blur' },
				// ],
				// sids: [
				// 	{ required: true, type: 'array', min: 1, message: '上课学员不能为空', trigger: 'blur' },
				// ]
			}
		}
	},
	watch: {
		'modal$.show': function(val) {
			if(val) {
			}
		}
	},
	computed:{
		disabledOK(){
			return false
		},
		teacher () {
			let teacher = {
				avatar: 'http://s1.xiao360.com/common_img/avatar.jpg',
				name: '请选择'
			}
			
			if(this.info.teach_eid > 0){					
				let temp_obj = this.$store.state.gvars.employees.find(e=>e.eid===this.info.teach_eid)					
				if(temp_obj){
					teacher.avatar = temp_obj.photo_url			
					teacher.name = temp_obj.ename
				}					
			}
			return teacher
		}
	},
	methods: {
		changeTimeSection(event) {
            if(event.length) {
                this.info.int_start_hour = this.$filter('format_int_hour')(event[0])
                this.info.int_end_hour   = this.$filter('format_int_hour')(event[1])
                this.getConsumeHour()
            }else{
                this.info.int_start_hour = ''
                this.info.int_end_hour   = ''
            }
        },
		setTeachObject(selected) {
			this.info.lesson_type = selected.type

			if(selected.type == 0) {
				this.info.cid = selected.info.cid
				this.info.lid = selected.info.lid
				this.info.teach_eid = selected.info.teach_eid
				this.selectClass(selected.info)
			}
			else if(selected.type == 1||2) {
				let list = [];
				for(let key in selected.map_ids) {
					list.push(selected.map_ids[key])
				}
				this.info.cid = 0
				this.info.lid = list[0].lid
				this.addStudent(list.map(item => {
					return Object.assign({},item,item.student)
				}), false)
			}
		},
		clearSelected() {
			this.info.cid = 0;
			this.info.lid = 0;
		},
		selectClass(data) {
			this.$http.get(`classes/${data.cid}/students`,{
				params: {
					pagesize: 100,
					with: 'student_lesson'
				}
			})
			.then(res => {
				let list = res.body.data.list;
				this.addStudent(list)
			},res => {
				this.$Message.error(res.body.message)
			})
		},
		addStudent(data, inner = true) {
			this.tableData = [];
			if(data.length > 0) {
				let startIndex = this.tableData.length;
				data.forEach(item => {
					this.tableData.push({
						index: startIndex,
						type: 1,
						is_attend: -1,
						is_leave: false,
						is_pay: false,
						data: inner ? Object.assign({},item.student,item.student_lesson) : item
					})
					startIndex++;
				})
			}
			else {
				this.$Message.warning('该班级无学员');
			}
		},
		handleSubmit() {
			this.$refs.form.validate((valid) => {
				if(valid) {
					if(this.tableData.length == 0) {
						this.$Message.warning('暂无考勤学员');
						return
					}
					if(this.info.teach_eid==0) {
						this.$Message.warning('请选择授课老师');
						return
					}
					if(this.info.int_day=='') {
						this.$Message.warning('请选择授课日期');
						return
					}
					if(this.info.int_start_hour=='') {
						this.$Message.warning('请选择授课时间');
						return
					}
					let attend = this.tableData.find(item => {
						return item.is_attend !== -1
					})
					if(!attend) {
						this.$Message.warning('请至少选择一个学员的出勤状态');
						return
					}
					let beyondStudent = '';
					this.tableData.forEach(item => {
						if(item.type < 4&&item.is_pay) {
							let data = item.data,
								num = this.addData.payType == 1 ? data.remain_lesson_hours : data.money;
							if(num < this.addData.payNum) {
								beyondStudent += data.student_name + '，'
							}
						}
					})
					if(beyondStudent) {
						let text = beyondStudent.substr(0, beyondStudent.length - 1),
							payTypeLabel = this.addData.payType == 1 ? '课时' : '金额';
						this.$Modal.confirm({
							content: `学员【${text}】的剩余${payTypeLabel}不足，是否继续考勤`,
							onOk: () => {
								this.ok();
							}
						})
					}
					else {
						this.ok();
					}
				}
			})
		},
		getConsumeHour () {
			let params = {
				cid: this.info.cid,
				int_start_hour: this.info.int_start_hour,
				int_end_hour: this.info.int_end_hour
			}
			
			if(this.info.cid==0){
				delete params.cid
				params.lid = this.info.lid
			}
			
			this.$rest('course_arranges/consume_lesson_hour').get(params)
			.success(data=>{
				this.addData.payNum = data.consume_lesson_hour
			}).error(response=>{
				this.$Message.error(response.body.message||'获取扣课时数失败~')
			})
		},
		ok() {
			let info = this.info,
				addData = this.addData,
				post = {},
				students = [];
			this.tableData.forEach(item => {
				students.push({
					sid: item.data.sid,
					is_in: item.is_attend,
					is_leave: item.is_leave ? 1 : 0,
					is_consume: item.is_pay ? 1 : 0,
					remark: item.remark
				})
			})

			post = {
				teach_eid: info.teach_eid,
				int_day: this.$filter('format_int_day')(info.int_day),
				int_start_hour: info.int_start_hour,
				int_end_hour: info.int_end_hour,
				lesson_type: info.lesson_type,
				cid: info.cid,
				lid: info.lid,
				lesson_remark: info.lesson_remark,
				consume_source_type: addData.payType,
				consume_lesson_hour: addData.payType == 1 ? addData.payNum : 0,
				consume_lesson_amount: addData.payType == 2 ? addData.payNum : 0,
				students: students,
				is_push: info.is_push,
				att_way: 3,
				create_from: 1,
				ignore_student_cc: info.ignore_student_cc,
				ignore_class_ec: info.ignore_class_ec
			}

			this.$rest('class_attendances')
			.post(post)
			.success(res=>{
				this.$Message.success('考勤登记成功！')
				this.$emit('update',res.data.catt_id)
				this.close()
			}).error(response=>{
				this.error(response.body.message||'考勤失败~')
			})
		}
	}
	
}
</script>