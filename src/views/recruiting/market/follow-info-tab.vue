<template>
	<Form ref="form" :label-width="120" class="row" :model="info">
		<Form-item label="选择客户" class="col-sm-6" prop="mc_id" v-if="!cuId">
			<select-customer v-model="info.mc_id" clearable @on-selected="selectCustomer"></select-customer>
		</Form-item>
		<Form-item label="有效性" class="col-sm-6" prop="is_connect">
			<RadioGroup v-model="info.is_connect" type="button" @on-change="connectTypeChange">
				<Radio :label="1">有效沟通</Radio>
				<Radio :label="0">无效沟通</Radio>
			</RadioGroup>
		</Form-item>
		<Form-item label="意向级别" class="col-sm-6 ivu-form-item-required" prop="intention_level">
			<Rate v-model="info.intention_level"></Rate>
		</Form-item>
		<Form-item label="下次跟进日期" class="col-sm-6" prop="next_follow_time">
			<DatePicker 
				:disabled="next_follow_status==1" 
				:options="disabledOptions"
				type="date" 
				:value="info.next_follow_time"
				@on-change="info.next_follow_time=$event"
				placeholder="选择日期" style="width: 200px">
			</DatePicker>
			<Checkbox v-model="next_follow_status" class="ml-3" :true-value="1" :false-value="0">
				待定
			</Checkbox>
		</Form-item>
		<Form-item label="沟通内容" class="col-sm-12 ivu-form-item-required" prop="content">
			<Input v-model="info.content" type="textarea" row="3"></Input>
		</Form-item>
		
		<Form-item label="分配销售" class="col-sm-12" prop="is_assign">
			<Checkbox v-model="is_assign" :true-value="1" :false-value="0"></Checkbox>
		</Form-item>
		<template v-if="is_assign == 1">
			<Form-item label="分配范围" class="col-sm-6">
			<RadioGroup type="button" v-model="assign.assign_scope">
				<Radio :label="0">只分配到校区</Radio>
				<Radio :label="1">明确到跟进人</Radio>
			</RadioGroup>	
			</Form-item>
			<Form-item label="选择校区" v-if="assign.assign_scope == 0" class="col-sm-6">
				<select-branch v-model="assign.to_bid" :limit-per="false"></select-branch>
			</Form-item>
			<Form-item label="选择跟进人" v-if="assign.assign_scope == 1" class="col-sm-6">
				<select-employee :rid="7" v-model="assign.eid"></select-employee>
			</Form-item>
			<Form-item label="有效性确认" v-if="assign.assign_scope==1" class="col-sm-6">
				<RadioGroup type="button" v-model="assign.valid_status">
					<Radio :label="1">有效</Radio>
					<Radio :label="0">待销售确认有效</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="承诺到访" class="col-sm-12" prop="is_promise">
				<Checkbox v-model="followup.is_promise" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
			<template v-if="followup.is_promise">	
			<Form-item label="诺到访日" class="col-sm-6" prop="promise_int_day" >
				<DatePicker 
					type="date" 
					:value="followup.promise_int_day" 
					:options="disabledOptions"
					@on-change="followup.promise_int_day=$event" 
					placeholder="选择日期" 
					style="width: 200px"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="诺到访类型" class="col-sm-6" prop="promise_did">
				<Select v-model="followup.promise_did">
					<Option :value="item.did" :key="index" v-for="(item,index) in dicts('promise')">{{item.title}}</Option>	
				</Select>
			</Form-item>
			</template>
			<Form-item label="安排试听"  prop="is_audition" v-if="followup.is_promise" class="col-sm-12">
				<Checkbox v-model="is_audition" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
			<Form-item label="试听课" v-if="followup.is_promise && is_audition" class="col-sm-12">
				<div class="x-multiple-select-container">
					<div class="x-multiple-select">
						<p>授课对象：{{teachObject}}</p>
						<p>上课日期：{{course_arrange.int_day|int_date}}</p>
						<p>上课时段：{{course_arrange.int_start_hour|int_hour}}--{{course_arrange.int_end_hour|int_hour}}</p>
						<p>教室：{{course_arrange.cr_id|classroom_name('未知')}}</p>
						<i style="top:0" class="ivu-icon ivu-icon-ios-close ivu-input-icon ivu-input-icon-clear ivu-input-icon-normal" @click="clearClass"></i>
					</div>
					<div class="x-multiple-select-after">
						<Dropdown class="x-drop-menu">
							<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
					        <DropdownMenu slot="list">
					            <DropdownItem @click.native="showArrange(0)">跟班试听</DropdownItem>
					            <DropdownItem @click.native="addTrialArrange">新开试听课</DropdownItem>
					            <DropdownItem @click.native="showArrange(1)">已有试听课</DropdownItem>
					        </DropdownMenu>
					    </Dropdown>
					</div>
				</div>
			</Form-item>
			<Form-item label="忽略冲突" v-if="teachObject && (is_audition && followup.is_promise)" class="col-sm-12">
				<template v-if="!course_arrange.ca_id">
					<Checkbox v-model="ignore.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="ignore.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				</template>
				<Checkbox v-model="ignore.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
		</template>
	</Form>
</template>

<script>
	import util,{_} from '@/libs/util'
	import moment from 'moment'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'	
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	
	export default{
		mixins: [common,globals],
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			modal: {
				type: Object,
				default: ()=>{
					return {
						action: 'add'
					}
				}
			},
			cuId: {
				type: [String,Number],
				default: ()=>{
					return 0
				}
			}
		},
		components: { 
			SelectCustomer,
			SelectEmployee,
			SelectBranch
		},
		data () {
			return {
				customers: [],
				next_follow_status: false,
				mc_id: 0,
				disabledOptions: {
					disabledDate (date) {
             			return date && date.valueOf() < Date.now() - 86400000;
        			}
				},
				is_assign:0,
				assign:{
					eid:0,
					assign_type: 2,
					to_bid:0,
					assign_scope:1,
					mcl_ids: [],
					valid_status: 0
				},
				followup:{
					is_connect: 1,
					intention_level: 0,
					followup_did: 122,
					is_promise: 0,
					promise_did: 0,
					promise_int_day: '',
					content: '',
				},
				course_arrange: {},
				ignore: {
					ignore_student_cc:0,
					ignore_class_cc:0,
					ignore_class_ec:0
				},
				is_audition: 0
			}
		},
		watch: {
			'next_follow_status': function (val) {
				if(val){
					this.info.next_follow_time = ''
				}
			}
		},
		computed:{
			teachObject() {
				let ca = this.course_arrange
				let result = '-'
				if(!_.isEmpty(ca)){
					if(ca.cid){
						result = ca.one_class.class_name
					}else if(ca.name){
						result = ca.name
					}else{
						let ret = []
						ca.students.forEach(s=>{
							if(s.student){
								ret.push(s.student.student_name)
							}else if(s.customer){
								ret.push(s.customer.name)
							}
						})

						result = ret.join(',')

						if(ca.lesson_type == 1){
							result = '1对1:'+result
						}else if(ca.lesson_type == 2){
							result = '1对多:'+result
						}
					}
				}				
				return result
			}
		},
		methods: {
			clearClass () {
				this.course_arrange = {}
			},
			showArrange(t) {
				this.$Modal.open('recruiting/audition/select-arrange.vue@modal',{
					props: {
						'is-trial':t
					},
					on: {
						'on-select':(row) => {
							this.chooseArrange(row)
						}
					}
				})
				.then(modal => {
					modal.show(t?'选择已有试听课':'选择已有排课')
				})
			},
			addTrialArrange() {
				this.$Modal.open('recruiting/audition/trial-info-modal',{
					on: {
						'on-save-success':(data) => {
							this.chooseArrange(data)
						}
					}
				})
				.then(modal =>{
					modal.show('添加试听课','select')
				})
			},
			chooseArrange (ca) {
				this.course_arrange = ca
			},
			selectCustomer(select) {
				this.info.mc_id = select.mc_id
				this.info.intention_level = select.intention_level
			},
			connectTypeChange(val) {
				if(val == 0) {
					this.info.intention_level = 1
				}
			},
			//添加记录成功后刷新列表
			handleSuccess () {
				this.$emit('on-success')
			},		
			init_param () {
				let params = {
					course: {}
				}
				let course_arrange = this.course_arrange

				
				params.course = {
					lid: course_arrange.lid,
					sj_id: course_arrange.sj_id,
					cr_id: course_arrange.cr_id,
					int_day: course_arrange.int_day,
					int_start_hour: course_arrange.int_start_hour,
					int_end_hour: course_arrange.int_end_hour,
					second_eid: course_arrange.second_eid,
					second_eids: course_arrange.second_eids
				}

				if(course_arrange.ca_id){
					params.course.ca_id = course_arrange.ca_id
					params.course.eid = course_arrange.teach_eid
					if(course_arrange.cid){
						params.course.cid = course_arrange.cid
					}
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}else{
					params.course.teach_eid = course_arrange.teach_eid
					params.course.name = course_arrange.name
					params.course.is_trial = 1
					params.course.ignore_class_cc = this.ignore.ignore_class_cc
					params.course.ignore_class_ec = this.ignore.ignore_class_ec
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}

				if(course_arrange.start_day){
					params.course.start_day = course_arrange.start_day
					params.course.end_day = course_arrange.end_day
				}
				if(course_arrange.student_limit){
					params.course.student_limit = course_arrange.student_limit
				}
				
				return params
			},	
			submit (token) {
				let [method,uri,msg] = ['post','mc_follow_ups','添加成功']
				if(this.modal.action=='edit'){
					[method,uri,msg] = ['put','mc_follow_ups/'+this.info.mcfu_id,'修改成功']
				}
				if(this.info.intention_level == undefined) {
					this.$Message.error('请选择意向级别')
					return
				}
				if(this.info.content==='') {
					this.$Message.error('请输入沟通内容')
					return
				}
				if(this.is_assign == 1){
					if(this.followup.is_promise){
						if(this.followup.is_promise==1&&this.followup.promise_int_day==''){
							this.$Message.error('请选择诺到日期')
							return
						}
						this.assign.followup = this.followup
					}
					let params = this.init_param()
					if((this.is_audition && params)&& this.followup.is_promise){
						if(_.isEmpty(this.course_arrange)){
							this.$Message.error('请先选择试听班级')
							return false
						}	
						this.assign.trial_listen_arrange = params
					}
					if(this.assign.assign_scope == 1){
						if(this.assign.eid==0){
							this.$Message.error('请选择跟进人')
							return
						}
					}else{
						if(this.assign.to_bid == 0){
							this.$Message.error('请选择分配校区');
							return
						}
					}
					this.info.assign = this.assign
				}

				this.info.eid = this.eid$				
				this.info.bid = this.bid$
				if(token!=='') {
					this.info.token = token
				}
				this.check()
				.then(()=>{
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success('添加成功')
						this.reset()
						this.$emit('on-success')
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				})
			},
			check () {
				return this.$form('form').check()
			},
			reset () {
				this.$form('form').reset()
				if(this.is_assign == 1){
					this.is_assign = 0
					this.assign = {
						eid:0,
						assign_type: 2,
						to_bid:0,
						assign_scope:1,
						mcl_ids: [],
						valid_status: 0
					}
					this.followup = {
						is_connect: 1,
						intention_level: 0,
						followup_did: 122,
						is_promise: 0,
						promise_did: 0,
						promise_int_day: '',
						content: '',
					}
					this.course_arrange = {}
					this.ignore = {
						ignore_student_cc:0,
						ignore_class_cc:0,
						ignore_class_ec:0
					}
					this.is_audition =  0
				}
			}
		}
	}
</script>
<style>
</style>