<template>
	<Form ref="form" :label-width="120" class="row" :model="info">
		<Form-item label="选择客户" class="col-sm-6" prop="cu_id" v-if="!cuId">
			<select-customer v-model="info.cu_id" clearable @on-selected="selectCustomer"></select-customer>
		</Form-item>
		<Form-item label="有效性" class="col-sm-6" prop="is_connect">
			<RadioGroup v-model="info.is_connect" type="button" @on-change="connectTypeChange">
				<Radio :label="1">有效沟通</Radio>
				<Radio :label="0">无效沟通</Radio>
			</RadioGroup>
			<a style="margin-left:5px;" href="javascript:;" @click="quickSetInfo"><Icon type="link"></Icon>未接听</a>
		</Form-item>
		<Form-item label="意向级别" class="col-sm-6 ivu-form-item-required" prop="intention_level">
			<Rate v-model="info.intention_level"></Rate>
		</Form-item>
		<Form-item label="沟通类型" class="col-sm-6 ivu-form-item-required" prop="followup_did" v-show="!invalidFollowup">
			<Select v-model="info.followup_did">
				<Option :value="item.did" :key="index" v-for="(item,index) in dicts('followup')">{{item.title}}</Option>
			</Select>
		</Form-item>
		<Form-item label="无效沟通类型" class="col-sm-6 ivu-form-item-required" prop="invalid_followup_did" v-show="invalidFollowup">
			<Select v-model="info.invalid_followup_did">
				<Option :value="item.did" :key="index" v-for="(item,index) in dicts('invalid_followup')">{{item.title}}</Option>
			</Select>
		</Form-item>
		<Form-item label="" :label-width="40" class="col-sm-6" prop="is_sync_mc" v-if="info.mcl_id">
			<span>同步更新市场名单有效性</span>
			<Checkbox v-model="info.is_sync_mc" :true-value="1" :false-value="0"></Checkbox>
		</Form-item>
		<Form-item label="客户状态" class="col-sm-6 ivu-form-item-required" prop="customer_status_did">			
			<Select v-model="info.customer_status_did">
				<Option :value="item.did" :key="index" v-for="(item,index) in dicts('customer_status')">{{item.title}}</Option>
			</Select>
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
		<Form-item label="承诺到访" class="col-sm-6" prop="is_promise">
			<Checkbox v-model="info.is_promise" :true-value="1" :false-value="0"></Checkbox>
		</Form-item>
		<template v-if="info.is_promise">
			<Form-item label="诺到访类型" class="col-sm-6" prop="promise_did">
				<Select v-model="info.promise_did">
					<Option :value="item.did" :key="index" v-for="(item,index) in dicts('promise')">{{item.title}}</Option>	
				</Select>
			</Form-item>
			<Form-item label="诺到访日" class="col-sm-6 ivu-form-item-required" prop="promise_int_day">
				<DatePicker 
					type="date" 
					:value="info.promise_int_day" 
					:options="disabledOptions"
					@on-change="info.promise_int_day=$event" 
					placeholder="选择日期" 
					style="width: 200px"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="安排试听" class="col-sm-8" prop="is_audition">
				<Checkbox v-model="is_audition" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
			<Form-item label="试听课" class="col-sm-8" v-if="is_audition">
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
			<Form-item label="忽略冲突" class="col-sm-8" v-if="is_audition">
				<template v-if="!course_arrange.ca_id">
					<Checkbox v-model="ignore.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="ignore.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				</template>
				<Checkbox v-model="ignore.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
		</template>
		<Form-item label="沟通内容" class="col-sm-12 ivu-form-item-required" prop="content">
			<Input v-model="info.content" type="textarea" row="3"></Input>
		</Form-item>
	</Form>
</template>

<script>
	import util,{_} from '@/libs/util'
	import moment from 'moment'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'	
	import SelectCustomer from 'c%/SelectCustomer.vue'
	
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
			SelectCustomer
		},
		data () {
			return {
				customers: [],
				next_follow_status: false,
				cu_id: 0,
				disabledOptions: {
					disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
				},
				invalidFollowup: false,
				is_audition: 0,
				ignore: {
					ignore_student_cc:0,
					ignore_class_cc:0,
					ignore_class_ec:0
				},
				course_arrange: {}
			}
		},
		watch: {
			'next_follow_status': function (val) {
				if(val){
					this.info.next_follow_time = ''
				}
			},
			'info.is_promise': function(val) {
				if(!val) {
					this.info.promise_did = 0
					this.info.promise_int_day = ''
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
		mounted () {
			if(this.info.is_connect==0) {
				this.invalidFollowup = true
			}
		},
		methods: {
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
			chooseArrange (ca) {
				this.course_arrange = ca
			},
			clearClass () {
				this.course_arrange = {}
			},
			init_param () {
				let params = {
					is_push: this.is_push,
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
			selectCustomer(select) {
				this.info.followup_did = 122
				this.info.cu_id = select.cu_id
				this.info.intention_level = select.intention_level
				this.info.customer_status_did = select.customer_status_did
			},
			quickSetInfo(){
				this.invalidFollowup = true
				this.info.intention_level = 1
				this.$set(this.info,'is_connect',0)
				this.$set(this.info,'invalid_followup_did',533)
				this.$set(this.info,'content','未接听')
			},
			connectTypeChange(val) {
				if(val == 0) {
					this.invalidFollowup = true
					this.info.intention_level = 1
					if(this.info.invalid_followup_did == 0) {
						this.info.invalid_followup_did = 533
					}
				}
				else {
					this.invalidFollowup = false
				}
			},
			//添加记录成功后刷新列表
			handleSuccess () {
				this.$emit('on-success')
			},			
			submit (token) {
				let [method,uri,msg] = ['post','customers/'+this.info.cu_id+'/followup','添加成功']
				if(this.modal.action=='edit'){
					[method,uri,msg] = ['put','customer_follow_up/'+this.info.cfu_id,'修改成功']
				}
				
				if(this.info.intention_level==0) {
					this.$Message.error('请选择意向级别')
					return
				}
				if(this.info.customer_status_did==0) {
					this.$Message.error('请选择客户状态')
					return
				}
				if(this.info.is_connect==1&&!this.info.followup_did) {
					this.$Message.error('沟通类型不能为空')
					return
				}
				if(this.info.is_connect==0&&!this.info.invalid_followup_did) {
					this.$Message.error('无效沟通类型不能为空')
					return
				}
				if(this.info.is_promise==1&&this.info.promise_int_day==''){
					this.$Message.error('请选择诺到日期')
					return false
				}
				if(this.info.content==='') {
					this.$Message.error('请输入沟通内容')
					return
				}

				let params = this.init_param()
				if((this.is_audition&&params) && this.info.is_promise){
					if(_.isEmpty(this.course_arrange)){
						this.$Message.error('请先选择试听班级')
						return false
					}	
					this.info.trial_listen_arrange = params
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
				this.invalidFollowup = false
				this.$form('form').reset()
			}
		}
	}
</script>

<style>
</style>