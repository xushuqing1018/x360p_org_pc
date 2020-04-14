<template>
	<Form ref="form" :label-width="80" class="row" :model="info">
		<Form-item label="选择学员" class="col-sm-6 mb-2 ivu-form-item-required" prop="sid" v-if="!sid">
			<select-object v-model="info.sid"></select-object>
		</Form-item>
		<Form-item label="有效性" class="col-sm-6 mb-2" prop="is_connect">
			<RadioGroup v-model="info.is_connect">
				<Radio :label="1">有效沟通</Radio>
				<Radio :label="0">无效沟通</Radio>
			</RadioGroup>
		</Form-item>
		<Form-item label="回访方式" class="col-sm-6 mb-2 ivu-form-item-required" prop="followup_did">
			<Select v-model="info.followup_did">
				<Option :value="item.did" :key="index" v-for="(item,index) in dicts('followup')">{{item.title}}</Option>
			</Select>
		</Form-item>	
		<Form-item label="回访日期" class="col-sm-6 mb-2 ivu-form-item-required" prop="int_day">
			<DatePicker 
				type="date" 
				:value="info.int_day" 
				@on-change="info.int_day=$event" 
				placeholder="选择日期" 
				style="width: 200px"
				>
			</DatePicker>
		</Form-item>
		<Form-item label="回访内容" class="col-sm-12 mb-2 ivu-form-item-required" prop="content">
			<Input v-model="info.content" type="textarea" :rows="4"></Input>
		</Form-item>
		<Form-item label="回访附件" class="col-sm-12 mb-2" prop="return_visit_attachment">
			<file-upload v-model="info.student_return_visit_attachment" :show-course-file="false">
				<span></span>
			</file-upload>
		</Form-item>
		<Form-item label="需要协助" class="col-sm-6 mb-2" prop="need_assist" v-help="'会给指定人创建服务安排'">
			<Checkbox v-model="info.need_assist" :true-value="1" :false-value="0"></Checkbox>
		</Form-item>
		<template v-if="info.need_assist">
			<Form-item label="责任人" class="col-sm-6 mb-2 ivu-form-item-required">
				<select-employee v-model="info.service_task.own_eid" clearable></select-employee>
			</Form-item>
			<Form-item label="服务类型" class="col-sm-6 mb-2 ivu-form-item-required">
				<Select v-model="info.service_task.st_did">
					<Option :value="item.did" v-for="item in dicts('student_service_type')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="截止时间" class="col-sm-6 mb-2 ivu-form-item-required">
				<DatePicker 
					:value="deadline_time"
					@on-change="timeChange"
					type="datetime" 
					format="yyyy-MM-dd HH:mm" 
					placeholder="请选择" 
					style="width: 289px;"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="备注" class="col-sm-12 mb-2 ivu-form-item-required">
				<Input type="textarea" v-model="info.service_task.remark" placeholder="请输入"></Input>
			</Form-item>
		</template>
	</Form>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'	
	import FileUpload from 'c%/reviewUpload.vue'
	import SelectObject from './object.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	const emptyObject = {
		bid: 0,
		sid: 0,					//客户ID
		is_connect: 1,			//是否有效沟通0：无效， 1：有效
		followup_did: 0,		//回访方式 字典ID（QQ、电话等）
		content: '',			//回访内容	
		int_day: '',			//实际到访日期	
		eid: 0,					//回访人
		student_return_visit_attachment: [],
		need_assist:0,
		assist_status:0,
		service_task: {
			own_eid: 0,
			st_did: 0,
			remark: '',
			int_day: '',
			int_hour: '',
			object_type: 1
		}
	}
	
	export default{
		mixins: [common,modal,globals],
		props: {
			sid: {
				type: [String,Number],
				default: ()=>{
					return 0
				}
			},
			modal: {
				type: Object,
				default(){
					return {
						show: false,
						action: 'add'
					}
				}
			}
		},
		components: { 
			FileUpload,
			SelectObject,
			SelectEmployee
		},
		data () {						
			return {
				customers: [],
				cu_id: 0,
				deadline_time: '',
				info: util.copy(emptyObject)
			}
		},	
		watch: {
			'modal.show':function(v) {
				if(v) {
					if(this.info.service_task) {
						this.deadline_time = this.$filter('int_date')(this.info.service_task.int_day) + ' ' + this.$filter('int_hour')(this.info.service_task.int_hour)
					}
				}
			}
		},
		mounted () {
			
		},
		methods: {
			//添加记录成功后刷新列表
			handleSuccess () {
				this.$emit('on-success')
			},			
			submit (token) {
				let method = 'post',
                	msg = '添加成功',
                	$rest  = this.$rest('student_return_visits')
            	if(this.modal.action=='edit') {
            		method = 'put'
            		msg = '编辑成功'
            		$rest = $rest.add_url_param(this.info.srv_id)
            	}
				this.check()
				.then(res=>{
					if(this.modal.action=='add') {
						if(this.sid) {
							this.info.sid = this.sid
						}
						this.info.bid = this.bid$
						this.info.eid = this.$store.state.user.info.employee.eid					
						this.info.int_day = this.$filter('format_int_day')(this.info.int_day)
						if(token!=='') {
							this.info.token = token
						}
					}
					$rest[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.reset()
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				})
			},
			check () {
				return new Promise((resolve,reject) => {
					if(this.sid ==0 && this.info.sid == 0) {
						this.$Message.error('请选择学员')
						reject()
						return
					}
					if(this.info.followup_did==0) {
						this.$Message.error('请选择回访方式')
						reject()
						return
					}
					if(!this.info.int_day) {
						this.$Message.error('请选择回访日期')
						reject()
						return
					}
					if(!this.info.content) {
						this.$Message.error('请填写回访内容')
						reject()
						return
					}
					if(this.info.need_assist) {
						if(!this.info.service_task.own_eid) {
							this.$Message.error('请选择责任人')
							reject()
							return
						}
						if(!this.info.service_task.remark) {
							this.$Message.error('请填写备注')
							reject()
							return
						}
						if(!this.info.service_task.st_did) {
							this.$Message.error('请选择服务类型')
							reject()
							return
						}
						if(!this.info.service_task.int_day) {
							this.$Message.error('请选择截止时间')
							reject()
							return
						}
					}
					resolve()
				})
			},
			reset () {
				this.info = util.copy(emptyObject)
			},
			timeChange (val) {
				if(val){
					this.info.service_task.int_day = util.format_int_day(val.substring(0,10))
					this.info.service_task.int_hour = util.format_int_hour(val.substring(11,16))					
				}
			}
		}
	}
</script>

<style>
</style>