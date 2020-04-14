<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600" :mask-closable="false">
		<Form v-if="modal$.show" :model="info" :rules="rules" :label-width="80" ref="form">
			<Form-item label="服务类型" class="mb-2">
				<RadioGroup v-model="info.object_type" type="button" @on-change="onTypeChange" size="small" v-if="modal$.action=='add'">
					<Radio :label="k" v-for="(v,k) in ot_map">{{v}}</Radio>
				</RadioGroup>
				<span v-else>{{ot_map[info.object_type]}}</span>
			</Form-item>
			<Form-item label="服务对象" class="mb-2" v-if="modal$.action=='add'">
				<select-class v-model="info.cid" v-if="info.object_type==2"></select-class>
				<select-student v-model="info.sid" v-else-if="info.object_type==1"></select-student>
				<select-branch v-model="info.bid" v-else-if="info.object_type==3"></select-branch>
			</Form-item>
			<Form-item label="回访来源" class="mb-2" v-if="modal$.action=='edit'&&info.student_return_visit">
				<span>回访人,{{info.student_return_visit.eid|ename}},</span>
				<span>回访内容,{{info.student_return_visit.content}}</span>
			</Form-item>
			<Form-item label="服务类型" class="mb-2" prop="st_did">
				<template v-if="modal$.action=='add'">
					<Select v-model="info.st_did" clearable v-if="info.object_type==1">
						<Option	:value="0">请选择</Option>
						<Option :value="item.did" v-for="item in student_service_type">{{item.title}}</Option>
					</Select>
					<Select v-model="info.st_did" clearable v-if="info.object_type==2">
						<Option	:value="0">请选择</Option>
						<Option :value="item.did" v-for="item in class_service_type">{{item.title}}</Option>
					</Select>
					<Select v-model="info.st_did" clearable v-if="info.object_type==3">
						<Option	:value="0">请选择</Option>
						<Option :value="item.did" v-for="item in branch_service_type">{{item.title}}</Option>
					</Select>
				</template>
				<template v-else>
					<span v-if="info.cid > 0">{{info.st_did|dict_title('class_service_type')}}</span>
					<span v-else>{{info.st_did|dict_title('student_service_type')}}</span>
				</template>
			</Form-item>
			<Form-item label="完成日期" class="mb-2" prop="int_day">
				<DatePicker 
				v-if="modal$.action=='add'" 
				:value="now_time"
				:options="disabledDateOptions" 
				@on-change="timeChange" 
				type="datetime" 
				format="yyyy-MM-dd HH:mm" 
				placeholder="请选择" 
				style="width: 200px">
					
				</DatePicker>
				<span v-else>{{info.int_day|int_date}} {{info.int_hour|int_hour}}</span>
			</Form-item>
			<Form-item label="备注" class="mb-2" prop="remark">
				<Input type="textarea" v-model="info.remark" placeholder="请输入备注" :autosize="{minRows: 3,maxRows: 4}"></Input>
			</Form-item>
			<Form-item label="责任人" class="mb-2" prop="own_eid">
				<select-employee v-if="modal$.action=='add'" v-model="info.own_eid"></select-employee>
				<span v-else>{{info.own_eid|ename}}</span>
			</Form-item>
			<template v-if="modal$.action=='edit'">
				<Form-item label="服务已完成" class="mb-2">
					<Checkbox v-model="is_complete" :true-value="1" :false-value="0"></Checkbox>
				</Form-item>
				<Form-item label="相关附件" prop="service_record_file" v-if="is_complete">
					<file-upload v-model="info.service_record_file">
						<span></span>
					</file-upload>
				</Form-item>
			</template>
			<Form-item label="对家长可见" class="mb-2" prop="is_student_view" v-if="info.object_type==1">
				<Checkbox v-model="info.is_student_view" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" v-if="modal$.action=='add'">确定</Button>
			<template v-else>
				<Button type="primary" @click="ok(true)" :loading="saving" v-if="is_complete">完成安排</Button>
				<Button type="primary" @click="ok" :loading="saving" v-else>编辑安排</Button>
			</template>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass'
	import SelectStudent from 'c%/SelectStudent'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import FileUpload from 'c%/ReviewUpload.vue'
	
	const emptyObject = {
		sid: 0,
		cu_id: 0,
		cid: 0,
		object_type: 2,
		st_did: 0,
		int_day: '',
		int_hour: '',
		own_eid: 0,
		remark: '',
		status: 0,
		bid:0,
		is_student_view:1,
		service_record_file:[]		//状态：0:待办，1:完成，-1:取消
	}
	
	export default{
		mixins: [ common, modal, globals ],
		props: {
			sid: {
				type: [Number,String],
				default: 0
			},
			cid: {
				type: [Number,String],
				default: 0
			},
			type: {
				type: [Number],
				default: 0
			},
			intDay: {
				type: [Number,String],
				default: ''
			}
		},
		components: {
			SelectClass,
			SelectStudent,
			SelectEmployee,
			SelectBranch,
			FileUpload
		},
		data () {
			return {
				name: '',
				now_time:'',
				is_complete: 1,
				info: util.copy(emptyObject),		
				rules: {
					int_day: [
						{ required:true, message: '请选择完成时间', trigger:'change' }
					],
					st_did: [
						{ required:true, type:'number', min:1, message: '请选择服务类型', trigger:'change' }
					]
				},
				disabledDateOptions: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
                ot_map: {
                	1: '个性服务',
                	2: '班级服务',
                	3: '校区服务'
                }
			}
		},
		mounted(){
			this.info.bid = this.bid$
		},
		watch: {
			'modal$.show':function(v) {
				if(v&&this.modal$.action=='add') {
					this.info.own_eid = this.eid$
					this.info.sid = this.sid
					this.info.cid = this.cid
					this.info.object_type = String(this.type)
					if(this.intDay) {
						let hs = moment().format('HH:mm')
						this.now_time = this.intDay + ' '+hs
						this.format_time(this.now_time)
					}else{
						this.lazy_init_day()
					}
				}
				if(v&&this.modal$.action=='edit') {
					this.info.service_record_file = []
				}
			},
			'info.object_type':(v)=>{
				this.info.st_did = 0
			}
		},
		computed:{
			student_service_type(){
				return this.dicts('student_service_type')
			},
			class_service_type(){
				return this.dicts('class_service_type')
			},
			branch_service_type(){
				return this.dicts('branch_service_type')
			}
		},
		methods: {
			lazy_init_day(){
				setTimeout(()=>{
					if(this.modal$.action == 'add'){
						this.now_time = moment().add(1,'days').format('YYYY-MM-DD HH:mm')
						this.format_time(this.now_time)						
					}
				},1000)
			},
			onTypeChange(val) {
				if(val == 1) {
					this.info.cid = 0
				}else if(val == 2) {
					this.info.sid = 0
				}else if(val == 2) {
					this.info.cid = 0
					this.info.sid = 0
				}
			},
			timeChange (val) {
				if(val){
					this.format_time(val)				
				}
			},
			format_time(val) {
				this.info.int_day = util.format_int_day(val.substring(0,10))
				this.info.int_hour = util.format_int_hour(val.substring(11,16))
			},	
			ok (complete) {
				let [uri,method] = this.modal$.action=='add'?['service_tasks','post']:['service_tasks/'+this.info.st_id,'put'],
					$this = this
				if(this.modal$.action=='edit'&&complete==true){
					this.info.status = 1
				}else{
					this.info.status = 0
				}
				if(this.modal$.action=='add'){
					this.$form('form').check()
					.then(()=>{					
						post()
					})
				}else{
					post()
				}
				function post () {
					$this.$rest(uri)[method]($this.info)
					.success(data=>{
						$this.$Message.success('操作成功！')
						$this.$emit('on-success')
						$this.close()
					}).error(response=>{
						$this.error(response.body.message||'添加失败~')
					})
				}
			}
		}
	}
</script>

<style>
</style>