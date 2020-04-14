<style lang="less">
	.recruiting-follow-form {
		margin: 15px auto;
	    padding-top: 15px;
    	border: 1px solid #999;
    	width: 800px;
	}
</style>
<template>
	<div class="recruiting-follow-info">
		<template v-if="perAdd">
			<div class="cursor text-center pt-2" style="color:#39f;font-size:14px" @click="showAddForm=!showAddForm">
				<Icon type="plus" size="14" class="align-middle mr-1"></Icon>添加跟进
				<Icon type="chevron-down" size="14" class="align-middle" v-if="!showAddForm"></Icon>
				<Icon type="chevron-up" size="14" class="align-middle" v-else></Icon>
			</div>
		</template v-else>
		<template>
			<div class="text-center">
				<Tag color="red" v-if="!perAdd">您不是该客户的责任人，无法跟进</Tag>
			</div>
		</template>
		<template v-if="showAddForm">
			<Form ref="form" :label-width="120" class="row recruiting-follow-form" :model="info">
				<Form-item label="选择客户" class="col-sm-6" prop="cu_id" v-if="!cuId">
					<select-customer v-model="info.cu_id" clearable></select-customer>
				</Form-item>
				<Form-item label="有效性" class="col-sm-6" prop="is_connect">
					<RadioGroup v-model="info.is_connect" @on-change="connectTypeChange">
						<Radio :label="1">有效沟通</Radio>
						<Radio :label="0">无效沟通</Radio>
					</RadioGroup>
					<a style="margin-left:5px;" href="javascript:;" @click="quickSetInfo"><Icon type="link"></Icon>未接听</a>
				</Form-item>
				<Form-item label="意向级别" class="col-sm-6" prop="intention_level">
					<Rate v-model="info.intention_level" :disabled="modal$.action=='edit'"></Rate>
				</Form-item>
				<Form-item label="沟通类型" class="col-sm-6" v-show="!invalidFollowup" prop="followup_did">
					<Select v-model="info.followup_did" :disabled="modal$.action=='edit'">
						<Option :value="item.did" :key="index" v-for="(item,index) in dicts('followup')">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="无效沟通类型" class="col-sm-6" v-show="invalidFollowup" prop="invalid_followup_did">
					<Select v-model="info.invalid_followup_did" :disabled="modal$.action=='edit'">
						<Option :value="item.did" :key="index" v-for="(item,index) in dicts('invalid_followup')">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="市场名单同步无效" class="col-sm-6" prop="is_sync_mc" v-if="invalidFollowup&&info.mcl_id">
					<Checkbox v-model="info.is_sync_mc" :true-value="1" :false-value="0"></Checkbox>
				</Form-item>
				<Form-item label="客户状态" class="col-sm-6" prop="customer_status_did">
					<Select v-model="info.customer_status_did" :disabled="modal$.action=='edit'">
						<Option :value="item.did" :key="index" v-for="(item,index) in dicts('customer_status')">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="下次跟进日期" class="col-sm-6" prop="next_follow_time">
					<DatePicker :disabled="next_follow_status==1" type="date" v-model="info.next_follow_time" placeholder="选择日期"></DatePicker>
					<Checkbox v-model="next_follow_status" class="ml-2" :true-value="1">
						待定
					</Checkbox>
				</Form-item>
				<Form-item label="承诺到访" class="col-sm-6" prop="is_promise">
					<Checkbox v-model="info.is_promise" :true-value="1"></Checkbox>
				</Form-item>
				<Form-item label="诺到访类型" class="col-sm-6" prop="promise_did">
					<Select v-model="info.promise_did">
						<Option :value="item.did" :key="index" v-for="(item,index) in dicts('promise')">{{item.title}}</Option>	
					</Select>					
				</Form-item>
				<Form-item label="诺到访日" class="col-sm-6" prop="promise_int_day" v-if="info.is_promise">
					<DatePicker type="date" v-model="info.promise_int_day" placeholder="选择日期" style="width: 100%"></DatePicker>
				</Form-item>
				<Form-item label="沟通内容" class="col-sm-12" prop="content">
					<Input v-model="info.content" type="textarea" row="3"></Input>
				</Form-item>
				<Form-item label="" class="col-sm-12">
					<Button type="primary" size="large" @click="submit">提交</Button>
					<Checkbox v-model="autoNext" class="ml-2">自动跳转到下一个</Checkbox>
				</Form-item>
			</Form>
		</template>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'	
	import SelectCustomer from 'c%/SelectCustomer.vue'
	
	const emptyObject = {
		bid: 0,
		cu_id: 0,				//客户ID
		is_connect: 1,			//是否有效沟通0：无效， 1：有效
		followup_did: 0,		//跟进方式 字典ID（QQ、电话等）
		content: '',			//跟进内容
		is_promise: 0,			//是否承诺到访
		promise_did: 0,			//承诺到访类型 字典ID
		promise_int_day: '', 	//承诺到访日期
		is_visit: 0,			//是否到访
		visit_int_day: '',		//实际到访日期
		next_follow_time: '', 	//下次跟进日期  0为待定
		intention_level: 0,		//意向级别
		customer_status_did: 0, //客户状态字典ID	
		is_sync_mc: 1,
		mcl_id:0
	}
	
	export default{
		mixins: [common,modal,globals],
		props: {
			cuId: {
				type: [String,Number],
				default: ()=>{
					return 0
				}
			},
			data: {
				type: Object,
				default:() => {
					return {}
				}
			},
			perAdd: {
				type: Boolean,
				default: true
			}
		},
		components: { 
			SelectCustomer
		},
		data () {
			const rule_time = (rule, value, callback) =>{
				if(value == ''&&!this.next_follow_status){
					callback(new Error('请选择日期'))
				}else if(this.isBeforeNow(value)){
					callback(new Error('所选日期不能小于当前日期'))
				}else{
					callback()
				}
			}
			
			return {
				customers: [],
				next_follow_status: false,
				invalidFollowup: false,
				cu_id: 0,
				info: util.copy(emptyObject),
				rules: {
					content: [
						{ required: true, message: '请输入沟通内容', trigger: 'blur' }
					],
					followup_did: [
						{ required: true, type: 'number', message: '请选择跟进方式', trigger: 'change' }
					],
					customer_status_did: [
						{ required: true, type: 'number', message: '请选择客户状态', trigger: 'change' }
					],
					promise_int_day: [
						{ validator: rule_time, trigger: 'change' }
					]
				},
				showAddForm: true,
				autoNext: true
			}
		},
		watch: {
			'next_follow_status': function (val) {
				if(val){
					this.info.next_follow_time = ''
				}
			},
			'cuId': function (val) {
				this.info.cu_id = val
			},
			'perAdd': function (val) {
				if(val) {
					this.showAddForm = true
				}else{
					this.showAddForm = false
				}
			},
			data() {
				this.initialize()
			}
		},
		
		mounted () {
			
		},
		methods: {
			//添加记录成功后刷新列表
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
			handleSuccess () {
				this.$emit('on-success')
			},			
			isBeforeNow (val) {
				if(val!=0&&moment(val).add(1,'days').isBefore(moment(new Date()))){
					this.$Message.error('所选时间不能小于当前时间')
					return true
				}
				return false
			},
			initialize () {
				this.info.cu_id = this.cuId
				this.info.followup_did = 122
				this.info.mcl_id = this.data.mcl_id
				this.info.intention_level = this.data.intention_level
				this.info.customer_status_did = this.data.customer_status_did
			},
			submit () {
				if(this.perAdd) {
					this.initialize()
					this.ok()
				}else{
					this.$Message.error('您不是该客户的责任人，无法跟进，请您重新选择')
				}
			},
			ok () {
				let [method,uri,msg] = ['post','customers/'+this.info.cu_id+'/followup','添加成功']
				if(this.modal$.action=='edit'){
					[method,uri,msg] = ['put','customer_follow_up/'+this.info.cfu_id,'修改成功']
				}
				
				if(this.isBeforeNow(this.info.next_follow_time)||this.isBeforeNow(this.info.promise_int_day)){
					return false
				}
				
				this.info.eid = this.eid$
				this.info.bid = this.bid$
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
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('添加成功')
					this.reset()
					if(this.autoNext) {
						this.$emit('on-next')
					}else{
						this.$emit('on-success')
					}
				}).error(response=>{
					this.error(response.body.message||'添加失败')
				})
			},
			check () {
				return this.$form('form').check()
			},
			reset () {
				this.info = util.copy(emptyObject)
				this.$form('form').reset()
			}
		}
	}
</script>

<style>
</style>