<style lang="less" scoped>
	.student-hours-wrap {
		table {
			width: 100%;
		}
		.student-hours-body {
			max-height: 250px;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" width="550">
		<div slot="header">
			<strong>{{modal$.title}}</strong>
			<Button size="small" class="ml-3" type="default" @click="addByStudent">按学员登记</Button>
		</div>
		<Form ref="form" :label-width="100" :model="info">
			<Form-item label="班级" prop="cid" class="custom-form-item-required">
				<select-class 
					v-model="info.cid" 
					placeholder="请选择班级" 
					@selected="selectClass">
				</select-class>
			</Form-item>
			<Form-item label="学员扣课时" prop="students" class="custom-form-item-required">
				<span v-if="!info.students.length">{{info.cid==0?'请先选择班级':'该班级暂无学员'}}</span>
				<div class="student-hours-wrap" v-else>
					<div class="student-hours-body">
						<table class="modal-table">
							<thead>
								<tr>
									<th><div class="ivu-table-cell">学员</div></th>
									<th><div class="ivu-table-cell">剩余课时</div></th>
									<th width="60px"><div class="ivu-table-cell">扣课时</div></th>
									<th width="80px"><div class="ivu-table-cell">备注</div></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in info.students">
									<td><div class="ivu-table-cell">{{item.student_name}}</div></td>
									<td><div class="ivu-table-cell">{{item.remain}}</div></td>
									<td><div class="ivu-table-cell">
										<InputNumber 
											v-model="item.lesson_hours" 
											size="small" 
											:min="0" 
											:max="item.remain"
											:disabled="item.remain<=0"
											style="width:50px"
											>
										</InputNumber>
									</div></td>
									<td><div class="ivu-table-cell">
										<Input v-model="item.remark" size="small"></Input>
									</div></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</Form-item>
			<p class="text-center col-sm-12 mb-3">
				<a class="text-info" @click="show_extra=!show_extra">
					{{show_extra?'收起':'高级'}}
					<Icon :type="show_extra?'chevron-up':'chevron-down'"></Icon>
				</a>
			</p>
			<div v-show="show_extra">
				<Alert show-icon>
					<span>选择{{'老师'|translate}}以后，对应会产生老师的产出记录</span>
					<span style="color:#f30" v-if="diff_lesson_hours">(学员扣课时不一样)</span>
				</Alert>
				<Form-item prop="int_day" label="课消日期">
		            <Date-picker 
		            type="date"
		            :value="format_day(info.int_day)"
		            @on-change="info.int_day = $event"
		            format="yyyy-MM-dd"
		            placeholder="选择日期">		            
		            </Date-picker>
				</Form-item>
				<Form-item prop="ts_array" label="课消时段">
					<select-time-section 
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择时间段">
					</select-time-section>
				</Form-item>
				<Form-item prop="eid" :label="label_teacher">
					<select-employee v-model="info.eid" clearable :rid="1" placeholder="请选择老师"></select-employee>
				</Form-item>
			</div>
			
		</Form>
		<div slot="footer">
			<Button type="ghost" :loading="saving" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'

	const emptyObject = {
		cid: 0,
		students: [],
		remark: '',
		date: '',
		eid: 0,
		int_start_hour: '',
		int_end_hour: '',
		int_day: ''
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectClass,
			SelectEmployee,
			SelectTimeSection
		},
		data() {
			return {
				info: util.copy(emptyObject),
				ts_array: [],
				show_extra:false
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
            		this.info = util.copy(emptyObject)
            		this.ts_array.splice(0,this.ts_array.length)
				}	            
	        }
        },
        computed: {
        	diff_lesson_hours() {
        		let hours = [],hours_set,result = false
        		this.info.students.forEach(item => {
        			hours.push(item.lesson_hours)
        		})
        		hours_set = new Set(hours)
        		if([...hours_set].length > 1) {
        			result = true
        		}
        		return result
        	}
        },
		methods: {
			changeTimeSection(event) {
				if(event.length) {
					this.info.int_start_hour = event[0]
					this.info.int_end_hour   = event[1]
				}else{
					this.info.int_start_hour = ''
					this.info.int_end_hour   = ''
				}
			},
			selectClass(data) {
				this.$rest('classes').add_url_param(data.cid,'students')
				.get()
				.success(res => {
					let data = res.list
					if(data.length == 0) {
						this.$Message.error('该班级暂无学员')
					}else{
						this.info.students.splice(0)
						data.forEach(item => {
							this.info.students.push({
								student_name:item.student.student_name,
								sid:item.sid,
								sl_id:item.sl_id,
								remain:util.float(item.student_lesson.remain_lesson_hours),
								lesson_hours:0,
								remark:''
							})
						})
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok () {
				if(!this.info.cid) {
					this.$Message.error('请选择班级')
					return false
				}
				if(!this.info.students.length) {
					this.$Message.error('该班级暂无学员')
					return false
				}
				let copy_info = util.copy(this.info),
					post_data = []
				copy_info.students.forEach(item => {
					post_data.push({
						sid:item.sid,
						sl_id:item.sl_id,
						lesson_hours:item.lesson_hours,
						remark:item.remark,
						eid:copy_info.eid,
						int_day:this.$filter('format_int_day')(copy_info.int_day),
						int_start_hour:copy_info.int_start_hour,
						int_end_hour:copy_info.int_end_hour
					})
				})
				this.$rest('student_lesson_hours')
				.post(post_data)
				.success(res => {
					this.$Message.success('登记成功')
					this.close()
					this.$emit('on-success')
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			addByStudent() {
				this.$emit('on-student')
				this.close()
			}
		}
	}
</script>