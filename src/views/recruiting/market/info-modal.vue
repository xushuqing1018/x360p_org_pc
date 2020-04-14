<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="90" :model="info" :rules="rules">						
				<Row>
					<Col span="8">
						<Form-item label="姓名" prop="name">
							<Input v-model="info.name" placeholder="请输入姓名"></Input>
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="性别" prop="sex">
							<RadioGroup v-model="info.sex" type="button" size="small">
								<Radio :label="1">男</Radio>
								<Radio :label="2">女</Radio>
							</RadioGroup>
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="出生日期" prop="birth_time">
							<DatePicker 
								:value="info.birth_time||''" 
								@on-change="info.birth_time = $event" 
								format="yyyy-MM-dd" 
								type="date" 
								placeholder="请选择日期" 
								style="width: 140px">
							</DatePicker>
						</Form-item>
					</Col>	
				</Row>
				<Row>
					<Col span="8">
						<Form-item label="电话号码" prop="tel">
							<repeat-tel-student 
								ref="repeat" 
								v-model="info.tel"
								@on-checked="isCheckedTel=!$event"
								@on-repeat="info.is_repeat=$event"
								placeholder="请输入手机号码">			
							</repeat-tel-student>
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="关系" prop="family_rel">
							<Select v-model="info.family_rel">
								<Option :value="index+1" v-for="(val,key,index) in rel_list">{{val}}</Option>
							</Select>
						</Form-item>
					</Col>
					<Col span="8" v-if="isEF('email','mcl')">
						<Form-item label="email" prop="email">
							<Input v-model="info.email" placeholder="请输入邮箱"></Input>
						</Form-item>
					</Col>
					<Col span="8" v-if="isEF('school_grade','mcl')">
						<Form-item label="年级" prop="school_grade">
							<Select v-model="info.school_grade">
								<Option :value="0">未确认</Option>
								<Option :value="Number(item.name)" v-for="item in dicts('grade')">{{item.title}}</Option>
							</Select>
						</Form-item>
					</Col>
					<Col span="8" v-if="isEF('school_id','mcl')">
						<Form-item label="就读学校" prop="school_id">
						  	<select-public-school v-model="info.school_id" clearable></select-public-school>
						</Form-item>
					</Col>
					<Col span="8" v-if="isEF('id_card_no','mcl')">
						<Form-item label="身份证号" prop="id_card_no">
							<Input v-model="info.id_card_no" placeholder="请输入身份证号"></Input>
						</Form-item>
					</Col>
					
					<Col span="8" v-if="isEF('intention_level','mcl')">
						<Form-item label="意向级别" class="col-sm-12" prop="intention_level" >
							<Rate v-model="info.intention_level"></Rate>
						</Form-item>
					</Col>
				</Row>		
				<Row>
					<Col span="8">
						<Form-item label="有效性" prop="is_valid">
							<RadioGroup size="small" v-model="info.is_valid" type="button">
								<Radio :label="0">待确认</Radio>
								<Radio :label="1">有效</Radio>
								<Radio :label="2">无效</Radio>
							</RadioGroup>
						</Form-item>
					</Col>	
					<Col span="8">
						<Form-item label="招生来源" prop="from_did">
							<dictionary-from v-model="info.from_did" clearable></dictionary-from>			
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="来源渠道" prop="mc_id">
							<select-channel v-model="info.mc_id" :set-default="true" @on-selected="info.from_did = $event.from_did"></select-channel>					
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="获取时间" prop="get_time">
							<DatePicker type="date" :value="info.get_time" @on-change="dateChange" format="yyyy-MM-dd" placeholder="选择日期"></DatePicker>							
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="采单人" prop="get_eid">
							<select-employee v-model="info.get_eid" clearable></select-employee>
						</Form-item>
					</Col>
					<Col span="8">
						<Form-item label="采单地点" prop="get_address_did">
							<Select v-model="info.get_address_did" clearable>
								<Option :value="item.did" v-for="(item,index) in dicts('get_address')" :key="index">{{item.title}}</Option>
							</Select>
						</Form-item>
					</Col>
						
					<Col span="8">
						<Form-item label="校区" prop="bid">
							<select-branch v-model="info.bid" clearable></select-branch>
						</Form-item>
					</Col>
								
					<Col span="8">
						<Form-item label="市场跟进人" prop="assigned_eid">
							<select-employee :rid="8" v-model="info.assigned_eid" clearable></select-employee>	
						</Form-item>						
					</Col>	
					<Col span="8">
						<Form-item label="销售跟进人" prop="cu_assigned_eid">
							<select-employee :rid="7" v-model="info.cu_assigned_eid" clearable></select-employee>	
						</Form-item>						
					</Col>	
				</Row>
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
				<Form-item label="备注" prop="remark" v-if="isEF('remark','mcl')">
					<Input v-model="info.remark" placeholder="请输入备注"></Input>
				</Form-item>
				<Form-item label="归属项目" prop="pj_ids" v-if="enable_project">
					<Select v-model="info.pj_ids" multiple>
						<Option :value="item.pj_id" v-for="(item,key) in projects">{{item.pj_name}}</Option>
					</Select>
				</Form-item>
			</Form>
		</template>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button 
				type="primary" 
				@click="ok" 
				:loading="saving" 
				:disabled="isCheckedTel"
				>确定
			</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import RepeatTelStudent from 'c%/RepeatTelStudent.vue'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'
	
	const emptyObject = {
		bid: 0,
		pj_ids:[],
		mc_id: 0,
		from_did: 0,
		name: '',
		tel: '',
		family_rel: 2,
		email: '',
		sex: 0,
		birth_time: 0,
		get_time: moment(new Date()).format('YYYY-MM-DD'),
		school_grade: '',
		school_id: '',
		intention_level: '',
		remark: '',
		is_valid: 0,
		assigned_eid: 0,
		cu_assigned_eid: 0,
		recommend_reward_note: '',
		get_eid: 0,
		get_address_did: 0,
		option_fields:{},
		id_card_no:'',
		is_repeat:0
	}
	
	export default{
		mixins: [ common, globals, modal ],
		components: {
			SelectBranch,
			SelectChannel,
			SelectEmployee,
			RepeatTelStudent,
			DictionaryFrom,
			SelectPublicSchool
		},
		data () {
			return {
				info: util.copy(emptyObject),
				mc_id: 0,
				isCheckedTel: true,
				showMore: false,
				rules: {
					name: [
						{ required: true, type:'string',message:'请输入姓名', trigger: 'blur' },
					],
					tel: [
						{ required: true, message: '电话号码不能为空!', trigger: 'blur' },
						{ pattern: /^\d{8,11}$/, message: '手机格式错误', trigger: 'blur'}
					],
					email: [
						{ type:'email',message:'邮箱格式错误', trigger: 'blur' },
					],
					mc_id: [
						{ required: true, min: 1, type:'number', message:'请选择来源渠道', trigger: 'change' }
					],
					from_did: [
						{ required: true, min: 1, type:'number', message:'请选择招生来源', trigger: 'change' }
					],
					bid: [
						{ required: true, min:1, type:'number', message:'请选择校区', trigger: 'change' },
					]
				},
				option_form_items:[]
			}
		},
		watch: {
			mc_id: function (val) {
				if(val){
					this.info.mc_id = val
				}
			},
			'modal$.show': function (val) {
				if(this.modal$.action=='add'&&val){
					this.info = util.copy(emptyObject)
					this.info.bid = this.bid$
				}
				if(!val){
					this.$form('form').reset()
				}	
				this.buildOptionFormItems();
			}
		},
		created () {
			if(this.modal$.action=='add'){
				this.info.bid = this.bid$				
            }
            this.initRules()
		},
		methods: {
            initRules(){
                if(this.required_school_grade_from == 1){
                    this.rules.school_grade = [ { required: true, min: 1, type:'number', message:'请选择年级', trigger: 'change' } ]
                    this.rules.school_id = [ { required: true, min: 1, type:'number', message:'请选择就读学校', trigger: 'change' } ]
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
				let option_fields = this.$store.state.gvars.configs.mcl_option_fields
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
			dateChange (val) {
				this.info.get_time = val
			},
			toDecimal (val) {
				val = val||0
				return parseFloat(val)
			},
			ok () {
				setTimeout(()=>{
					if(this.isCheckedTel){
						return	
					}
					this.$form('form').check()
					.then(()=>{					
						let params = util.copy(this.info)
						let [uri,method,msg] = this.modal$.action=='add'?['market_clues','post','添加成功！']:['market_clues/'+params.mcl_id,'put','修改成功！']
						
						params.bid = this.bid$
						params.option_fields = this.getOptionFieldsValue()
						this.$rest(uri)[method](params)
						.success(data=>{
							this.$Message.success(msg)
							this.$emit('on-success')
							this.close()
						}).error(response=>{
							this.error(response.body.message||'操作失败~','error')
						})
						
					})
				},300)
			}
		}
	}
	
</script>

<style>
</style>