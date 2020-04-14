<style lang="less">
.filter-form-input{
    border: none;
    border-color: #ccc !important;
    border-radius: 0;
    box-shadow: none !important;
    border-bottom: 1px solid #ccc;
}
.x-ivu-modal{
	.x-ivu-form{
		.ivu-input-wrapper{
			outline: none;
			.ivu-input{
				.filter-form-input;				
			}			
			textarea.ivu-input{
				border: 1px solid #ccc;
				border-radius: 3px;
			}
		} 	
		.ivu-select {
			.ivu-select-selection{
			    .filter-form-input;
			}
		}	
	}
}	
.x-ivu-select{
	outline: none;
	box-shadow: none;
	.ivu-select-selection{
		.filter-form-input;
	}	
}
.x-ivu-input{	
	outline: none;
	box-shadow: none;
	.ivu-input{
		.filter-form-input;
	}	
}
.text-over-elips{
	text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.clearfloat{
	&:after{
		content: '';
		clear:both;
		display: inline-block;
	}
}
.recruiting-info-form {
	.ivu-form-item {
		margin-bottom: 14px;
	}
}
</style>

<template>		
	<Modal v-drag-modal class="x-ivu-modal" v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850" @on-cancel="cancel">	
		<Form v-if="modal$.show" ref="form_recruiting" class="x-ivu-form recruiting-info-form" :model="recruiting.customer" :rules="rules_customer" :label-width="100">
			<div class="row">
				<Form-item label="姓名" class="col-sm-4" prop="name">
					<span v-if="recruiting.customer.sid>0">{{recruiting.customer.name}}</span>
					<Input v-model="recruiting.customer.name" placeholder="请输入姓名" v-else></Input>					
				</Form-item>
				<Form-item label="性别" class="col-sm-4" prop="sex">
					<RadioGroup v-model="recruiting.customer.sex" type="button" size="small">
				        <Radio :label="1">男</Radio>
				        <Radio :label="2">女</Radio>
				    </RadioGroup>
				</Form-item>
				<Form-item label="出生日期" class="col-sm-4" prop="birth_time">
					<DatePicker 
						:value="recruiting.customer.birth_time" 
						@on-change="recruiting.customer.birth_time = $event" 
						type="date" 
						format="yyyy-MM-dd" 
						:options="option"
						placeholder="选择日期">
					</DatePicker>
				</Form-item>
				<Form-item label="首选电话" class="col-sm-4" prop="first_tel">
					<span v-if="recruiting.customer.sid>0">{{recruiting.customer.first_tel}}</span>
					<repeat-tel-student 
						ref="repeat" 
						id-field="cu_id"
						:id-number="info.cu_id"
						v-model="recruiting.customer.first_tel"
						@on-checked="isCheckedTel=!$event"
						@on-repeat="recruiting.customer.is_repeat = $event"
						placeholder="请输入手机号码"
						v-else>
					</repeat-tel-student>
					<!--<Input v-model="recruiting.customer.first_tel" placeholder="请输入手机号码" @on-blur="get_students('first_tel')" v-else></Input>-->						
				</Form-item>
				<Form-item label="关系" class="col-sm-4" prop="first_family_rel">
					<Select v-model="recruiting.customer.first_family_rel">
						<Option :value="index+1" v-for="(val,key,index) in rel_list">{{val}}</Option>
					</Select>
				</Form-item>					
				<Form-item label="亲属姓名" class="col-sm-4" prop="first_family_name" v-if="recruiting.customer.first_family_rel!=1">
					<Input v-model="recruiting.customer.first_family_name" placeholder="请输入亲属姓名"></Input>
				</Form-item>
				<Form-item label="昵称/英文名" class="col-sm-4" prop="nick_name">
					<Input v-model="recruiting.customer.nick_name" placeholder="请输入昵称或英文名"></Input>
				</Form-item>
				<Form-item label="身份证号" class="col-sm-4" prop="id_card_no" v-if="isEF('id_card_no','customer')">
					<Input v-model="recruiting.customer.id_card_no" clearable placeholder="请输入身份证号"></Input>
				</Form-item>
				<Form-item label="家庭住址" class="col-sm-4" prop="home_address" v-if="isEF('home_address','customer')">
					<Input v-model="recruiting.customer.home_address" clearable placeholder="请输入家庭住址"></Input>
				</Form-item>
				<Form-item 
				label="公立学校" 
				class="col-sm-4" 
				prop="school_id" 
				v-if="isEF('school_id','customer')"
				>
			      	<select-public-school v-model="recruiting.customer.school_id" clearable></select-public-school>			
				</Form-item>
				<Form-item 
				label="年级" 
				class="col-sm-4" 
				prop="school_grade"
				v-if="isEF('school_grade','customer')"
				>
					<Select v-model="recruiting.customer.school_grade">
						<Option :value="Number(item.name)" v-for="(item,index) in dicts('grade')" :key="index">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item 
				label="班级" 
				class="col-sm-4" 
				prop="school_class"
				v-if="isEF('school_class','customer')"
				>
					<Input v-model="recruiting.customer.school_class" placeholder="请输入班级名称"></Input>
				</Form-item>
				
				
				<div class="col-sm-4" v-else></div>
				<p class="text-center col-sm-12 mb-3">
					<a class="text-info" @click="show_all=!show_all">
						{{show_all?'收起':'展开更多'}}
						<Icon :type="show_all?'chevron-up':'chevron-down'"></Icon>
					</a>
				</p>
				<template v-if="show_all">
					<Form-item label="第二电话" class="col-sm-4" prop="second_tel">
						<Input v-model="recruiting.customer.second_tel" placeholder="请输入手机号码"></Input>
					</Form-item>
					<Form-item label="关系" class="col-sm-4" prop="second_family_rel">
						<Select v-model="recruiting.customer.second_family_rel">
							<Option :value="index+1" v-for="(val,key,index) in rel_list" :key="index">{{val}}</Option>
						</Select>
					</Form-item>
					<Form-item label="亲属姓名" class="col-sm-4" prop="second_family_name" v-if="recruiting.customer.second_family_rel!=1">
						<Input v-model="recruiting.customer.second_family_name" placeholder="请输入亲属姓名"></Input>
					</Form-item>	
					<div class="col-sm-4" v-else></div>
					<Form-item label="招生来源" class="col-sm-4" prop="from_did">
						<dictionary-from v-model="recruiting.customer.from_did" clearable></dictionary-from>
					</Form-item>
					<Form-item label="市场渠道" class="col-sm-4" prop="mc_id">
						<select-channel 
							v-model="recruiting.customer.mc_id" 
							:set-default="true" 
							@on-selected="recruiting.customer.from_did = $event.from_did"
							>
						</select-channel>					
					</Form-item>
					
					<Form-item label="意向级别" class="col-sm-4" prop="intention_level">
						<Rate v-model="recruiting.customer.intention_level"></Rate>
					</Form-item>
					<Form-item label="客户状态" class="col-sm-4" prop="customer_status_did">
						<Select v-model="recruiting.customer.customer_status_did">
							<Option :value="item.did" v-for="(item,index) in dicts('customer_status')" :key="index">{{item.title}}</Option>
						</Select>
					</Form-item>
					<Form-item label="所属校区" class="col-sm-4" prop="bid">
						<select-branch v-model="recruiting.customer.bid" :limit-per="false" :clearable="true" />
					</Form-item>		
					<Form-item label="介绍人" class="col-sm-4" prop="referer_sid">
						<select-student v-model="recruiting.customer.referer_sid" clearable></select-student>						
					</Form-item>
					<Form-item label="主责任人" class="col-sm-4" prop="follow_eid">
						<select-employee v-model="recruiting.customer.follow_eid" clearable :disabled="!hasPer('customer.distribution')"></select-employee>						
					</Form-item>
					<Form-item label="副责任人" class="col-sm-8">				
						<div class="b-a-1 pl-2 pr-2">
							<Tag @on-close="del_deputy(item)" v-for="(item,index) in recruiting.deputy" :key="index" :closable="hasPer('recruiting.distribution')">
								{{item.eid|employee_name}}
								 - {{labelDicts(item['sale_role_did'],'sale_role')}}								
							</Tag>
							<select-employee class="ml-2" style="width:auto;line-height: inherit;" :did="1" @onChange="add_deputy" v-per="'customer.distribution'">
								<a class="text-info"><Icon type="plus">添加</Icon></a>
							</select-employee>
						</div>
					</Form-item>	
					<Form-item label="方便试听时间" class="col-sm-8" v-if="isEF('trial_time','customer')">
						<Select v-model="recruiting.customer.trial_time" multiple>
							<Option v-for="item in trial_times" :value="item.value">{{item.label}}</Option>
						</Select>
					</Form-item>
					<Form-item label="获取时间" class="col-sm-4" prop="get_time">
						<DatePicker 
							type="date" 
							:value="recruiting.customer.get_time" 
							@on-change="recruiting.customer.get_time=$event" 
							format="yyyy-MM-dd" 
							placeholder="选择日期">							
						</DatePicker>
					</Form-item>
					<template v-for="item in option_form_items">
						<Form-item :label="item.label" class="col-sm-4" v-if="item.type == 'text'">
							<Input v-model="item.value" :placeholder="'请输入'+item.label"></Input>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-4" v-if="item.type=='date'">
							<DatePicker 
								type="date" 
								:value="item.value"
								@on-change="item.value = $event" 
								format="yyyy-MM-dd"
								placeholder="选择日期" 
								style="width:100%">
							</DatePicker>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-4" v-if="item.type=='number'">
							<InputNumber v-model="item.value"></InputNumber>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-12" v-if="item.type == 'textarea'">
							<Input v-model="item.value" type="textarea" :placeholder="'请输入'+item.label"></Input>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-4" v-if="item.type =='select'">
							<Select v-model="item.value">
								<Option v-for="option in item.options" :value="option">{{option}}</Option>
							</Select>
						</Form-item>
					</template>	
					
				</template>				
			</div>
			<template v-if="show_all">
				<table class="modal-table mb-2">
					<thead>
						<th><div class="ivu-table-cell">意向课程</div></th>
						<th><div class="ivu-table-cell">意向{{'老师'|translate}}</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</thead>
					<tr v-for="(item,index) in recruiting.intention" :key="index">
						<td class="border-0"><div class="ivu-table-cell"><select-lesson v-model="item.lid" clearable></select-lesson></div></td>
						<td class="border-0"><div class="ivu-table-cell"><select-employee v-model="item.eid" clearable></select-employee></div></td>
						<td class="border-0"><div class="ivu-table-cell"><Button type="error" icon="ios-trash" @click="del_intention(item)" size="small">删除</Button></div></td>
					</tr>
				</table>
				<div class="text-info mt-2 mb-2">
					<a @click="add_intention"><Icon type="plus"></Icon> 添加..</a>
				</div>				
				<div class="row">
					<Form-item label="备注" class="col-sm-12" prop="remark">
						<Input type="textarea" :rows="3" v-model="recruiting.customer.remark" placeholder="请输入备注..."></Input>
					</Form-item>
				</div>
				<div class="row" v-if="enable_project">
					<Form-item label="归属项目" class="col-sm-12" prop="pj_ids">
						<Select v-model="recruiting.customer.pj_ids" multiple>
							<Option :value="item.pj_id" v-for="(item,key) in projects">{{item.pj_name}}</Option>
						</Select>
					</Form-item>
				</div>
			</template>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel" v-if="tabs=='follow_record'">关闭</Button>
			<template v-else>
				<Checkbox v-model="continuous" class="pull-left pt-2" v-if="modal$.action=='add'&&tabs=='basic_information'">连续登记</Checkbox>
				<Button type="ghost" @click="cancel">取消</Button>
				<Button type="primary" @click="save" :loading="saving" :disabled="isCheckedTel">确认</Button>
			</template>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import StudentCheckInput from 'c%/StudentCheckInput.vue' 
	import followUpRecord from './following/follow-record.vue'
	import followInfoTab from './following/follow-info-tab.vue'
	import RepeatTelStudent from 'c%/RepeatTelStudent.vue'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	
	const emptyObject = {
		customer:{
			name: '',
			nick_name: '',
			sex: 0,
			birth_time: '',
			get_time: moment(new Date()).format('YYYY-MM-DD'),
			school_id: 0,
			school_id_text: '',
			school_grade: 0,
			school_class: '',
			first_tel: '',
			first_family_rel: '',
			first_family_name: '',
			second_tel: '',
			second_family_rel: '',
			second_family_name: '',
			mc_id: 0,
			from_did: 0,
			intention_level: 0,
			customer_status_did: '',
			bid: 0,
			referer_sid: 0,
			follow_eid: 0,
			remark: '',
			trial_time:[],
			home_address:'',
			id_card_no:'',
			is_repeat: 0,
			pj_ids:[]
		},
		deputy: [],
		intention: []
	}
	
	export default{
		mixins: [grid,modal,common,globals],
		components: {
			SelectLesson,
			SelectBranch,
			SelectStudent,
			followInfoTab,
			followUpRecord,
			SelectEmployee,
			DictionaryFrom,
			StudentCheckInput,
			RepeatTelStudent,
			SelectPublicSchool,
			SelectChannel
		},
		data () {
			return {
				show_all: false,
				tabs: 'basic_information',
				datakey: 'recruiting',
				schools: [],
				students: [],
				action: 'add',
				isCheckedTel: true,
				cu_id: 0,
				info: {},
				recruiting: util.copy(emptyObject),
				rules_customer: {
					name: [
						{ required: true, message: '姓名不能为空', trigger: 'blur' }
					],
					first_tel: [
						{ required: true, message: '请输入手机号', trigger: 'blur' },
						{ pattern: /^\d{8,11}$/, message: '手机格式错误', trigger: 'blur'}
					],
					first_family_rel: [
						{ required: true, type:'number', message: '请输入首选亲属关系', trigger: 'change' }
					]
				},
				option: {
					disabledDate (date) {
						return date && date.valueOf() > Date.now()
					}
				},
				continuous: false,
				option_form_items:[]
			}
		},
		watch: {
			'tabs': function(val) {
				let name = this.recruiting.customer.name
				if(val == 'basic_information') {
					this.modal$.title = util.sprintf('修改意向客户信息【%s】',name)
				}else if(val == 'follow_record') {
					this.modal$.title = util.sprintf('沟通记录【%s】',name)
				}else if(val == 'add_follow_up') {
					this.modal$.title = util.sprintf('添加沟通【%s】',name)
				}
			},
			'modal$.show': function (val) {
				if(val) {					
					this.show_all = false
					if(this.modal$.action=='add'){
						this.recruiting = util.copy(emptyObject)
						this.recruiting.customer.follow_eid = this.eid$
					}
					this.buildOptionFormItems()
				}
			}
		},
		computed: {
			branchs () {
				return this.$store.state.gvars.branchs
			},
			isMustMarket() {
				var config_val = this.$store.state.gvars.configs.params.customer.must_mc_id;
				return config_val;
			},
			isMustFrom() {
				var config_val = this.$store.state.gvars.configs.params.customer.must_from_did;
				return config_val;
			},
			isMustIntention() {
				var config_val = this.$store.state.gvars.configs.params.customer.must_intention_level;
				return config_val;
			},
			isMustStatus() {
				var config_val = this.$store.state.gvars.configs.params.customer.must_customer_status_did;
				return config_val;
			},
		},
		created () {
			this.initRules();
		},
		methods: {
			initRules() {
				if(this.isMustMarket) {
					this.rules_customer.mc_id = [ { required: true,type:'number',min:1, message: '市场渠道不能为空',trigger:'change'} ]
				}
				if(this.isMustFrom) {
					this.rules_customer.from_did = [ { required: true,type:'number',min:1, message: '招生来源不能为空',trigger:'change'} ]
				}
				if(this.isMustIntention) {
					this.rules_customer.intention_level = [ { required: true,type:'number',min:1, message: '意向级别不能为空',trigger:'change'} ]
				}
				if(this.isMustStatus) {
					this.rules_customer.customer_status_did = [ { required: true,type:'number',min:1, message: '客户状态不能为空',trigger:'change'} ]
                }
                if(this.required_school_grade_from == 1){
                    this.rules_customer.school_grade = [ { required: true, min: 1, type:'number', message:'请选择年级', trigger: 'change' } ]
                    this.rules_customer.school_id = [ { required: true, min: 1, type:'number', message:'请选择就读学校', trigger: 'change' } ]
                    this.rules_customer.from_did = [ { required: true,type:'number',min:1, message: '招生来源不能为空',trigger:'change'} ]
                }
			},
			hasPer (per) {
				let pers = this.$store.state.user.info.pers				
				return pers.indexOf(per)>-1
			},
			checkCustomer () {
				if(!_.isEmpty(this.info)){
					let eid = this.eid$,
						employees = this.info.employees||[]
									
					return this.info.follow_eid == eid||employees.filter(e=>e.eid==eid).length>0					
				}
				return false
			},
			//添加记录成功后刷新列表
			handleSuccess () {
				this.$emit('on-success')
			},
			handleSearch (val) {
				this.$http.get('public_schools?name='+val)
				.then(response=>{
					this.schools = response.body.data.list
				},response=>{
					this.$Message.error(response.body.message||'搜索失败！')
				})
			},
			edit (cu_id,tabs) {
				this.cu_id = cu_id
				this.tabs = tabs||'basic_information'
				
				this.$http.get('customers/'+cu_id)
				.then(response=>{
					this.recruiting = response.body.data
					this.recruiting.customer.birth_time = this.recruiting.customer.birth_time.toString()
                    let name = response.body.data.customer.name
                    if(this.recruiting.customer.sid > 0){
                        this.isCheckedTel = false
                    }
					this.show('修改意向客户信息【'+name+'】','edit')
				},response=>{
					this.error(response.body.message||'编辑失败')
				})
			},
			cancel () {
				this.reset()	
				this.close()
							
			},
			reset () {
				this.tabs = 'basic_information'
				this.$form('form_recruiting').reset()
				this.recruiting = util.copy(emptyObject)
			},
			save () {
				setTimeout(()=>{
					if(this.isCheckedTel){
						return	
					}
					
					if(this.tabs=='add_follow_up'){
						this.$r('ref_follow_up').submit()
					}else{
						if(this.recruiting.customer.sex == 0 ){
							this.$Message.error('请选择性别！')
							return false
						}
						let [method,uri,msg] = this.modal$.action=='add'?['post','customers','添加成功']:['put','customers/'+this.cu_id,'修改成功']	
							
						if(!this.recruiting.customer.bid) {
							this.recruiting.customer.bid = this.bid$
						}
						this.recruiting.intention = this.recruiting.intention.filter(a=>a.eid>0||a.lid>0)
						
						if(this.modal$.action=='edit'){
							delete this.recruiting.customer.create_time
						}

						this.recruiting.customer.option_fields = this.getOptionFieldsValue()
						
						this.check().then(()=>{
							this.$http[method](uri,this.recruiting)
							.then(response=>{
								this.$Message.success(msg)
								this.$emit('on-success')
								
								if(this.continuous&&this.modal$.action=='add') {
									this.reset()
								}else{
									this.cancel()
								}
	
								if(this.modal$.action=='edit'){
									this.dr().refreshData('customers/'+this.cu_id)
								}							
							},response=>{
								this.error(response.body.message||'添加失败')
							})
						})
					}
				},300)
			},
			add_intention () {
				this.recruiting.intention.push({
					eid: 0,
					lid: 0
				})
			},
			del_intention (item) {
				let intention = this.recruiting.intention
				let index = intention.indexOf(item)
				if(index>-1){
					intention.splice(index,1)
				}
			},
			add_deputy (item) {
				if(this.recruiting.deputy.find(d=>d.eid==item.eid)){
					this.$Message.error('已添加该责任人！')
					return false
				}
				let obj = util.copy(item)
				this.recruiting.deputy.push({
					eid: obj.eid,
					sale_role_did: obj.sale_role_did
				})
			},
			del_deputy (item) {
				let deputy = this.recruiting.deputy
				let index = deputy.indexOf(item)
				if(index>-1){
					deputy.splice(index,1)
				}
			},
			buildOptionFormItems(){
				
				this.option_form_items = []
				let default_value = function(type){
					if(type == 'number'){
						return 0
					}else if(type == 'date'){
						return new Date()
					}
					return ''
				}
				let option_fields = this.$store.state.gvars.configs.customer_option_fields
				let option_value  = this.info.option_fields || {}
				for(let i=0;i<option_fields.length;i++){
					let item = option_fields[i]
					if(item.enable == 1){
						this.option_form_items.push({
							label:item.label,
							type:item.type,
							field:item.name,
							value:option_value[item.name]||default_value(item.type),
							options:item.option_values
						})
					}
				}
				
			},
			getOptionFieldsValue(){
				let obj = {}
				this.option_form_items.forEach(item=>{
					obj[item.field] = item.value
				})
				return obj
			},
		}
	}
</script>
