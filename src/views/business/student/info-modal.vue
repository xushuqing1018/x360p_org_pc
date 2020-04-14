<template>
	<Modal class="x-ivu-modal" v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="850">
		<Form ref="form" :label-width="100" :model="info" :rules="rules"  class="x-ivu-form row">
			<Form-item label="姓名" class="col-sm-4" prop="student_name">
				<Input v-model="info.student_name" placeholder="请输入学员姓名"></Input>
			</Form-item>
			<Form-item label="性别" class="col-sm-4" prop="sex">
				<RadioGroup v-model="info.sex" type="button" size="small">
					<Radio :label="1">男</Radio>	
					<Radio :label="2">女</Radio>	
				</RadioGroup>
			</Form-item>
			<Form-item label="出生日期" class="col-sm-4" prop="birth_time">
				<DatePicker 
					type="date" 
					:value="info.birth_time"
					@on-change="info.birth_time = $event" 
					format="yyyy-MM-dd"
					placeholder="选择日期" 
					style="width:100%">
				</DatePicker>
			</Form-item>
			<Form-item label="首选手机号" class="col-sm-4" prop="first_tel" v-help="'如修改首选手机号请在联系人处编辑'">				
				<repeat-tel-student 
					ref="repeat" 
					:readonly="readonly1"
					v-model="info.first_tel"
					@on-repeat="info.is_repeat=$event"
					placeholder="请输入手机号码">			
				</repeat-tel-student>
			</Form-item>
			<Form-item label="关系" class="col-sm-4" prop="first_family_rel">
				<Select v-model="info.first_family_rel">
					<Option :value="index+1" v-for="(val,key,index) in rel_list">{{val}}</Option>
				</Select>
			</Form-item>					
			<Form-item label="亲属姓名" class="col-sm-4" prop="first_family_name" v-if="info.first_family_rel!=1">
				<Input v-model="info.first_family_name" placeholder="请输入亲属姓名"></Input>
			</Form-item>	
			<div class="col-sm-4" v-if="info.first_family_rel==1"></div>	
			<Form-item label="昵称/英文名" class="col-sm-4" prop="nick_name">
				<Input v-model="info.nick_name" placeholder="请输入昵称/英文名"></Input>
			</Form-item>
			<Form-item label="卡号" class="col-sm-4 mb-2" prop="card_no">
				<Input v-model="info.card_no" placeholder="请输入考勤卡号"></Input>
			</Form-item>
			<Form-item label="学号" class="col-sm-4 mb-2" prop="sno" v-if="isEF('sno','student')">
				<Input v-model="info.sno" placeholder="请输入学号"></Input>
			</Form-item>
			<Form-item label="年级" class="col-sm-4" prop="school_grade" v-if="isEF('school_grade','student')">

				<Select v-model="info.school_grade">
					<Option value="0">请选择</Option>
					<Option :value="Number(item.name)" v-for="(item,index) in dicts('grade')" :key="index">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="班级" class="col-sm-4 mb-2" prop="school_class" v-if="isEF('school_class','student')">
				<Input v-model="info.school_class" placeholder="请输入班级名称"></Input>
			</Form-item>		
			<p class="text-center col-sm-12 mb-3">
				<a class="text-info" @click="show_all=!show_all">
					{{show_all?'收起':'展开更多'}}
					<Icon :type="show_all?'chevron-up':'chevron-down'"></Icon>
				</a>
			</p>
			<div class="row m-0" v-show="show_all">
				<Form-item label="身份证号" class="col-sm-4 mb-2" prop="id_card_no" v-if="isEF('id_card_no','student')">
					<Input v-model="info.id_card_no" placeholder="请输入身份证号"></Input>
				</Form-item>
				<Form-item label="入学日期" class="col-sm-4" prop="in_time">
					<DatePicker 
						type="date" 
						:value="info.in_time"
						@on-change="info.in_time = $event" 
						format="yyyy-MM-dd"
						placeholder="选择日期" 
						style="width:100%">
					</DatePicker>
				</Form-item>
				<Form-item label="第二电话" class="col-sm-4" prop="second_tel">
					<Input v-model="info.second_tel" placeholder="请输入手机号码" :readonly="readonly2"></Input>
				</Form-item>
				<Form-item label="关系" class="col-sm-4" prop="second_family_rel">
					<Select v-model="info.second_family_rel">
						<Option :value="index+1" v-for="(val,key,index) in rel_list">{{val}}</Option>
					</Select>
				</Form-item>
				<div class="col-sm-4" v-if="info.second_family_rel==1"></div>
				<Form-item label="亲属姓名" class="col-sm-4" prop="second_family_name" v-if="info.second_family_rel!=1">
					<Input v-model="info.second_family_name" placeholder="请输入亲属姓名"></Input>
				</Form-item>
				<Form-item label="公立学校" class="col-sm-4 mb-2" prop="school_id" v-if="isEF('school_id','student')">
			      	<select-public-school v-model="info.school_id" clearable></select-public-school>
				</Form-item>
				
				<Form-item label="介绍人" class="col-sm-4 mb-2" prop="referer_sid">
					<select-student v-model="info.referer_sid" clearable></select-student>
				</Form-item>
				<Form-item label="市场渠道" class="col-sm-4 mb-2" prop="mc_id">
					<select-channel v-model="info.mc_id" :show-add="false"></select-channel>
				</Form-item>
				<Form-item label="招生来源" class="col-sm-4 mb-2" prop="from_did">
					<Select v-model="info.from_did">
                   		<Option :value="item.did" v-for="item in dicts('from')">{{item.title}}</Option>
                   </Select>
				</Form-item>
				<Form-item label="会员等级" class="col-sm-4" prop="vip_level" v-if="enable_vip">
					<Select v-model="info.vip_level">
						<Option :value="-1">非会员</Option>
						<Option :value="index" v-for="(item,index) in vip_level_config">{{item.name}}</Option>
					</Select>
				</Form-item>
				<Form-item label="服务星级" class="col-sm-4" prop="service_level" v-if="enable_service_level">
					<Select v-model="info.service_level">
						<Option :value="item" v-for="item in service_level_config">{{item}}</Option>
					</Select>
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
				<Form-item label="归属项目" class="col-sm-12" prop="pj_ids" v-if="enable_project">
					<Select v-model="info.pj_ids" multiple>
						<Option :value="item.pj_id" v-for="(item,key) in projects">{{item.pj_name}}</Option>
					</Select>
				</Form-item>
			
			</div>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel" :loading="saving">取消</Button>
			<Button 
				type="primary" 
				@click="ok" 
				:loading="saving" 
				:disabled="isCheckedTel" 
				:title="isCheckedTel&&info.first_tel?'请点击空白处自动校验手机号':''"
				>确定
			</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import RepeatTelStudent from 'c%/RepeatTelStudent.vue'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	
	const emptyObj = {
		sid: 0,
		sex: 0,
		bid: 0,
		student_name: '',
		nick_name: '',
		birth_time: '',
		school_id_text: '',
		school_id: 0,
		school_grade: 0,
		school_class: '',
		first_tel: '',
		first_family_rel: '',
		first_family_name: '',
		second_tel: '',
		second_family_rel: '',
		second_family_name: '',
		card_no: '',
		sno:'',
		mc_id:0,
		from_did:0,
		in_time: '',
		is_repeat:0,
		pj_ids:[]
	}

	export default{
		mixins: [common,globals,modal],
		components: {
			SelectPublicSchool,
			RepeatTelStudent,
			SelectStudent,
			SelectChannel
		},
		data () {
			return {
				schools: [],
				show_all: false,
				readonly1: false,
				readonly2: false,
				info: util.copy(emptyObj),
				rules: {
					student_name: [
						{ required: true, message: '姓名不能为空', trigger: 'blur' }
					],
					first_tel: [
						{ required: true, message: '请输入手机号', trigger: 'blur' },
						{ pattern: /^\d{8,11}$/, message: '手机格式错误', trigger: 'blur'}
					]
				},
				option_form_items:[]
			}
		},
		created() {
			if(this.isMustFrom) {
				this.rules.from_did = [ { required: true,type:'number', min:1, message: '招生来源不能为空',trigger:'change'} ]
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {					
					this.readonly1 = this.info.first_tel.length>0 
					this.readonly2 = this.info.second_tel.length>0
					this.show_all = false
					if(this.modal$.action == 'add') {
						this.info = util.copy(emptyObj)	
					}
					this.buildOptionFormItems();
				}
			}
		},
		computed: {
			isMustFrom() {
				var config_val = this.$store.state.gvars.configs.params.student_signup.must_from_did;
				return config_val;
			},
			isCheckedTel () {
				if(this.modal$.action=='add'){
					if(this.$refs.repeat){
						return !this.$refs.repeat.isChecked					
					}
					return true
				}
				return false
			},
		},
		methods: {
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
				let student_option_fields = this.$store.state.gvars.configs.student_option_fields
				let student_option_value  = this.info.option_fields || {}
				for(let i=0;i<student_option_fields.length;i++){
					let item = student_option_fields[i]
					if(item.enable == 1){
						this.option_form_items.push({
							label:item.label,
							type:item.type,
							field:item.name,
							value:student_option_value[item.name]||default_value(item.type),
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
			cancel () {
				this.close()
			},
			ok () {
				// if(!util.is_valid_phone_no(this.info.first_tel)){
				// 	this.$Message.error('手机号格式不正确')
				// 	return false
				// }
				if(this.isMustFrom&&this.info.from_did==0) {
					this.$Message.error('招生来源不能为空')
					this.show_all = true
					return false
				}
				let [method,uri,msg] = ['post','students','添加成功']
				if(this.modal$.action=='edit'){
					[method,uri,msg] = ['put','students/'+this.info.sid,'修改成功']
				}
				this.info.bid = this.bid$
				this.info.option_fields = this.getOptionFieldsValue()
				this.$form('form').check()
				.then(response=>{
					this.$rest(uri)[method](this.info)
					.success(response=>{
						this.$Message.success(msg)
						this.$emit('on-save-success')
						this.cancel()
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				})
			},
			handleSearch (val) {
				this.$rest('public_schools?name='+val).get()
				.success(data=>{
					this.schools = data.list
				}).error(response=>{
					this.$Message.error(response.body.message||'搜索失败！')
				})
			}
		}
	}
</script>
