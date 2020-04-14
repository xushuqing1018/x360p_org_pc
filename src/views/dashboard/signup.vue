<template>
	<div class="signup-page">
		<div class="box box-info">
			<Form ref="singup_form" clearable="true" :label-width="80" :model="student" :rules="modal_validate_signup">
				<div class="row">
					<Form-item class="col-sm-6 col-md-3" prop="student_name" label="姓名">
						<Input type="text" v-model="student.student_name" @on-blur="checkStudentName">
							<Button slot="append" icon="android-person-add" title="从意向客户中选取" @click="selectCustomer"></Button>
						</Input>
						<div style="display: none;">
							<select-customer ref="customer" v-model="cu_id" :toFormal="true" @on-selected="customerToFormal"></select-customer>
						</div>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="first_tel" label="手机号">
						<Input type="text" v-model="student.first_tel" @on-blur="checkFirstTel"></Input>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="referer_sid" label="介绍人">
						<select-student v-model="student.referer_sid" clearable></select-student>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="sex" label="性别">
						<RadioGroup v-model="student.sex" type="button">
							<Radio v-for="item in sex_list" :label="item.id">{{item.name}}</Radio>	
						</RadioGroup>
					</Form-item>
				</div>
				<div class="school_info row">
					<Form-item label="出生日期" class="col-sm-6 col-md-3" prop="birth_time">
						<DatePicker 
							type="date" 
							:value="student.birth_time"
							@on-change="student.birth_time = $event" 
							format="yyyy-MM-dd"
							placeholder="选择日期" 
							style="width:100%">
						</DatePicker>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="id_card_no" label="身份证号">
						<Input type="text" v-model="student.id_card_no" v-if="isEF('id_card_no','student')"></Input>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="school_id" label="公立学校" v-if="isEF('school_id','student')">
						<select-public-school v-model="student.school_id" clearable></select-public-school>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="school_grade" label="年级" v-if="isEF('school_grade','student')">
						<Select v-model="student.school_grade" filterable placeholder="">
							<Option :value="item.name" v-for="item in grade">{{item.title}}</Option>
						</Select>
					</Form-item>
					<Form-item class="col-sm-6 col-md-3" prop="school_class" label="就读班级" v-if="isEF('school_class','student')">
						<Input type="text" v-model="student.school_class"></Input>
					</Form-item>
					<template v-for="item in option_form_items">
						<Form-item :label="item.label" class="col-sm-6 col-md-3" v-if="item.type == 'text'">
							<Input v-model="item.value" :placeholder="'请输入'+item.label"></Input>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-6 col-md-3" v-if="item.type=='date'">
							<DatePicker 
								type="date" 
								:value="item.value"
								@on-change="item.value = $event" 
								format="yyyy-MM-dd"
								placeholder="选择日期" 
								style="width:100%">
							</DatePicker>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-6 col-md-3" v-if="item.type=='number'">
							<InputNumber v-model="item.value"></InputNumber>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-6 col-md-3" v-if="item.type == 'textarea'">
							<Input v-model="item.value" type="textarea" :placeholder="'请输入'+item.label"></Input>
						</Form-item>
						<Form-item :label="item.label" class="col-sm-6 col-md-3" v-if="item.type =='select'">
							<Select v-model="item.value">
								<Option v-for="option in item.options" :value="option">{{option}}</Option>
							</Select>
						</Form-item>
					</template>	
					<Form-item class="col-sm-6 col-md-3" label="">
						<Button 
							type="primary" 
							size="small" 
							icon="bag" 
							v-per="'student.debit'" 
							v-if="enable_debit"
							:loading="saving"
							@click="buyDebitCard">储值
						</Button>
					</Form-item>
				</div>
			</Form>
		</div>

		<div class="box box-goods">
			<div class="signup-left">
				<label>报名日期：</label>
				<DatePicker
					 :value="order.paid_time"
		        	 @on-change="order.paid_time = $event"
					 placeholder="不限" 
					 style="width: 120px"
					 :clearable="false"
					 :options="date_option">
			  	</DatePicker>
				<div class="contract-no" v-if="enable_user_contract_no">
					<label>合同号：</label>
				 	<Input 
				 		v-model="order.user_contract_no" 
				 		style="width: 160px;"
				 		placeholder="请输入合同号">
			 		</Input>				 	
			 	</div>
			</div>
			<div class="signup-select">
				<ButtonGroup>
					<select-lesson 
						v-model="lids" 
						:condition="lessonCondition"
						style="width: auto" 
						@selected="addLessons"
						>
						<Button type="primary" icon="plus" style="width: 120px">选择课程</Button>
					</select-lesson>
					<select-class 
						v-model="cids" 
						disabled-temp
						style="width: auto" 
						@selected="addClasses"
						v-if="enable_lesson_type0  && !forbid_uncheck_assign"
						>
						<Button type="primary" icon="plus" style="width: 120px">选择班级</Button>
					</select-class>
				</ButtonGroup>
			</div>
			<div class="signup-right">
				<a @click="showQrcode">
					<Icon type="qr-scanner"></Icon>
					扫码录入
				</a>
				<span>|</span>
				<a @click="selectMaterial">选择物品</a>
				<select-material
					v-model="mt_ids"
					ref="ref_material"
					:clearable="true"
					style="display:none"
					placeholder="请选择物品" 
					@selected="addMaterial">
				</select-material>
				<span>|</span>
				<a @click="selectFees">选择杂项</a>
				<select-fees
					v-model="pi_ids"
					ref="ref_fees"
					style="display: none;"
					@selected="addFees"
					>
				</select-fees>
				<span>|</span>
				<Dropdown trigger="click">
			        <a href="javascript:void(0)">
			            选择模板
			            <Icon type="arrow-down-b"></Icon>
			        </a>
			        <DropdownMenu slot="list">
			            <DropdownItem v-for="(item,index) in tpl_data" :key="index">
			            	<div class="clearfix">
				            	<span class="pr-2" @click="selectTpl(item)">{{item.name}}</span>
				            	<span class="pull-right p-t" @click.stop="deleteTpl(item)"><Icon type="close" color="red"></Icon></span>
				            </div>
				        </table>
			            </DropdownItem>
			            <DropdownItem v-if="tpl_data.length == 0" class="empty">
			            	暂无模板
			            </DropdownItem>
			        </DropdownMenu>
			    </Dropdown>
			</div>
			<goods-table ref="ref_goods" :student="student" :order="order"></goods-table>
		</div>
		<div class="box clearfix">
			<div class="signup-btn">
				<Button type="primary" @click="doSignup">报名</Button>
			</div>
		</div>
		<settle-center-modal 
			ref="settleCenterModal" 
			:order="order" 
			:student="student" 
			@on-charge-confirm="confirmOrder">
		</settle-center-modal>
		<search-same-modal 
			ref="searchSameModal" 
			:items="sameNameData">
		</search-same-modal>		
		<qr-modal ref="qrcode" @on-select="toFormal"></qr-modal>
		<customer-to-formal ref="customerToFormal" @on-ok="toFormal"></customer-to-formal>
	</div>
</template>
<script>
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import moment from 'moment'
	import $rest from '@/libs/rest'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import pay from './mixin/pay.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import GoodsTable from './signup/goods-table'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SettleCenterModal from './signup/settle-center-modal'
	import SearchSameModal from './signup/search-same-modal.vue'
	import SelectMaterial from 'c%/SelectMaterial'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
	import qrModal from './signup/qr-modal.vue'
	import CustomerToFormal from './signup/customer-to-formal.vue'
	import SelectFees from 'c%/SelectFees.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	const ORDER = {
		paid_time:moment(new Date()).format('YYYY-MM-DD'),			// 支付时间
		balance_paid_amount: 0.00,		// 电子钱包余额付款金额
		money_pay_amount: 0.00,			// 现金付款金额(除电子钱包付款以外的)=应交金额=订单金额-电子冲减
		paid_amount: 0.00,				// 已付金额=现金已付金额+电子冲减金额
		money_paid_amount: 0.00,		// 现金已付金额（除了电子钱包）
		order_amount: 0.00,				// 订单金额=原金额-直减金额-折扣金额
		_lessons_amount: 0.00,			// 课程总计金额(折后)
		_article_amount: 0.00,			// 物品总计金额(折后)
		origin_amount: 0.00,			// 原金额
		_total_amount: 0.00,			// 合计金额=原金额-折扣金额
		order_discount_amount: 0.00,  	// 折扣金额
		order_reduced_amount: 0.00,		// 直减金额
		remark: '',						// 备注
		items:[],						// 商品
		payment: [],					// 付款账户
		is_demo: 0,						// 是否体验课			
		_dropdown_account: [],			// 其他付款账户
		_pre_stored_amount:0.00,		// 预存金额
		_owe_payment_amount:0.00,		// 欠交款
		_is_owe:0,						// (1:欠交，0:预存)
		is_submit:1,					// (0:暂存，1:提交),
		_submit:1,
		user_contract_no:'',			// 合同号
		user_receipt_no:''				// 收据号
	}

	export default {
		mixins: [common,globals,pay],
		components: {
			qrModal,
			GoodsTable,
			SelectClass,
			SelectPublicSchool,
			SelectLesson,
			SelectCustomer,
			SearchSameModal,
			SettleCenterModal,
			SelectMaterial,
			CustomerToFormal,
			SelectFees,
			SelectStudent
		},
		data() {
			// const validator = (rule, value, callback) => {
			//     value.forEach(function(item, index){
			// 		if(!!item.required) {
			// 			if(item.value == '') {
			// 				callback(new Error('带*为必填信息'));
			// 			}
			// 		}
			// 		callback();
			// 	});
			// };
			return {
				sameNameData:[],	// 同名数据
				sid_same: 0, 		// 同名同号码学员id
				cu_id: 0,			// 意向客户id
				id: 1,				// 订单商品id
				sex_list: [					
					{id: 1, name: '男'},
					{id: 2, name: '女'},
				],
				school_list: [],
				student: {
					sid:0,
					cid:0,
					student_name: '',
					first_tel: '',
					sex: 1,
					birth_time:'',
					school_grade: '',
					school_class: '',
					school_id: 0,
					money:0.00
				},
				option_form_items:[],
				modal_validate_signup: {
					student_name: [
						{ required: true, message: '请输入学员姓名', trigger: 'blur' }
					],
					first_tel: [
						{ required: true, message: '请输入手机号', tigger: 'blur' }
					]
				},
				order: util.copy(ORDER)     		// 订单初始化
			}
		},
		created() {
			this.getTpl()
		},
		computed:{
			date_option() {
				var params = this.branch_params;
				return {
					disabledDate: function(date) {
						if(params.student_signup.allow_modify_date == 0){
							return true
						}
						var month = params.student_signup.modify_date_months;
						var day = params.student_signup.modify_date_days;
						var now = new Date();
						if(month == 0) {
							if(day == 0){
								return false
							}else{
								var pass = now.getTime() - (day+1)*24*3600*1000;
								if(date.getTime() < pass) {
									return true;
								}
								else {
									if(now.getTime() < date.getTime()) {
										return true
									}
									return false;
								}
							}
							
						}
						else {
							if(month == 1) {
								var pass = now - now.getDate()*24*3600*1000;
								if(date.getTime() < pass) {
									return true;
								}
								else {
									if(now.getTime() < date.getTime()) {
										return true
									}
									return false;
								}
							}
							else if(month == 2) {
								if(date.getFullYear() < now.getFullYear()-1) {
									return true;
								}
								else if( (date.getFullYear() == now.getFullYear()-1)&&(date.getMonth() < 11) ) {
									return true;
								}
								else if( (date.getFullYear() == now.getFullYear())&&(date.getMonth() < now.getMonth()-1) ) {
									return true;
								}
								else {
									if(now.getTime() < date.getTime()) {
										return true
									}
									return false;
								}
							}
							else if(month == 3) {
								if(date.getFullYear() < now.getFullYear()-1) {
									return true;
								}
								else if( (date.getFullYear() == now.getFullYear()-1)&&(now.getMonth() <= 2)&&(date.getMonth() <= 11 - (3-now.getMonth())) ) {
									return true;
								}
								else if( (date.getFullYear() == now.getFullYear())&&(now.getMonth() > 2)&&(date.getMonth() < now.getMonth()-3) ) {
									return true;
								}
								else {
									if(now.getTime() < date.getTime()) {
										return true
									}
									return false;
								}
							}
						}
					}
				}
			},
			grade () {
				return this.$store.state.gvars.dicts['grade']
			},
		},
		mounted() {
			this.getQueryInfo()
			this.buildOptionFormItems();
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
				let student_option_value  = this.student.option_fields || {}
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
			buyDebitCard() {
				this.check('singup_form').then(() => {
					this.$rest('students')
					.post(this.student)
					.success(res => {
						this.$router.push({
							name:'dashboard_payment', 
							params:{sid:res.data,debit:true},
						})
					})
					.error(res => {
						this.$Message.error(res.body.message)
					})
				})
			},
			getQueryInfo() {
				let cu_id = this.$route.params.cu_id
				if(typeof cu_id !== 'undefined') {
					this.cu_id = cu_id
					
					this.$r('customerToFormal')
					.set('cu_id',cu_id)
					.show('客户报名','add')
				}
			},
			showQrcode () {				
				this.$r('qrcode')
				.show('扫码录入学员','add')
			},
			handleSearch (val) {
				this.$http.get('public_schools?name='+val)
				.then(response=>{
					this.school_list = response.body.data.list
				},response=>{
					this.$Message.error(response.body.message)
				})
			},
			checkName(name, first_tel) {
				let get_params = {
					page: 1,
					pagesize: 100,
					name: '[in,' + name + ']',
					is_reg: 0
				}
				this.$rest('customers/search')
	            .get(get_params)
	            .success(response=>{
	            	let data = response.list
	            	this.sameNameData = data
	                if(data.length > 0) {
	                	if(first_tel) {
	                		let sameItem = data.find((item) => item.first_tel== first_tel)
	                		if(sameItem && sameItem.sid!==0) {
				                this.sid_same = sameItem.sid
				                this.showConfirm()
	                		}else{
	                			this.sid_same = 0
	                			this.showSameModal()
	                		}
	                	}else{
	                		this.sid_same = 0
                			this.showSameModal()
                		}
	                }
	            })
	            .error(response=>{
	                this.$Message.error(response.body.msg)
	            })
			},
			// 打开确认同一个学员直接报名的确认框
			showConfirm() {
				this.$Modal.confirm({
                    title: '提示',
                    content: '<p>该学员已存在，要直接报名收费吗？</p>',
                    onOk: () => {
                        this.$router.push({
                        	name:'dashboard_payment',
                        	params:{sid: this.sid_same}
                        })
                    },
                    onCancel: () => {
                        // todo
                    }
                });
			},
			showSameModal() {
				this.$r('searchSameModal').show('系统存在同名学员','search')
			},
			// 检查是否有同名学员
			checkStudentName() {
				let [name,first_tel] = [this.student.student_name, this.student.first_tel]
				this.sid_same = 0
				if(name !== '') {
					this.checkName(name, first_tel)
				}
			},
			// 输入号码后再检查姓名
			checkFirstTel () {
				let [name,first_tel] = [this.student.student_name, this.student.first_tel]
				this.sid_same = 0
				if(name !== '' && first_tel !== '') {
					this.checkName(name, first_tel)					
				}
			},
			customerToFormal(selected) {
				if(selected.sid>0) {
					this.$router.push({
						name:'dashboard_payment', 
						params:{sid: selected.sid}
					})
				}else{
					this.toFormal(selected.cu_id)
				}
			},
			// 跳转到缴费
			toFormal(cu_id) {
				cu_id = cu_id||this.cu_id
				
				this.$rest('customers/do_reg')
				.post({cu_id:cu_id})
				.success(response=>{
					this.$router.push({
						name:'dashboard_payment', 
						params:{sid: response.data}
					})
				})
				.error(response=>{
					this.error(response.body.message)
				})
			},
			// 选择意向客户
			selectCustomer() {
				this.$r('customer').openModal()
			},
			doSignup() {
				if(!util.is_valid_phone_no(this.student.first_tel)){
					this.$Message.error('请输入正确的手机号码!')
					return false
				}
				this.student.option_fields = this.getOptionFieldsValue()
				this.check('singup_form').then(() => {
					this.checkOrderItems()
				}).catch(()=>{})
			},
			// 表单校验
			check(form) {
	            return new Promise((resolve,reject)=>{
	                this.$refs[form].validate(valid => {
	                    if(valid) {
	                        resolve()
	                    } else {
	                        reject()
	                    }
	                })  
	            })  
	        },
	        // 结算前金额计算
	        calculateAmount() {
	        	this.order.origin_amount = 0.00
	        	this.order._lessons_amount = 0.00
	        	this.order._article_amount = 0.00
	        	this.order._is_owe = 0
				this.order._pre_stored_amount = 0.00
				this.order._owe_payment_amount = 0.00
				this.order.order_discount_amount = 0.00

	        	this.order.items.forEach((item) => {
	        		let deal_amount = util.sub(item.origin_amount,item.discount_amount)
	        		if(item.gtype == 0) {
	        			this.order._lessons_amount = util.add(this.order._lessons_amount,deal_amount)
	        		}else{
	        			this.order._article_amount = util.add(this.order._article_amount,deal_amount)
	        		}
	        		this.order.origin_amount = util.add(this.order.origin_amount,item.origin_amount)
	        		this.order.order_discount_amount = util.add(this.order.order_discount_amount,item.discount_amount)
	        	})

	        	// 自动减去电子钱包余额
	        	let total = this.order._total_amount = this.order._lessons_amount + this.order._article_amount
				if(total >= this.student.money) {
					this.order.balance_paid_amount = this.student.money
				}else{
					this.order.balance_paid_amount = total
				}
	        	this.order.order_amount = (total - this.order.order_reduced_amount).toFixed(2) // 订单金额
	        	this.order.money_pay_amount = (this.order.order_amount - this.order.balance_paid_amount).toFixed(2) // 现金付款金额=应交金额
	        	this.order.money_paid_amount = this.order.money_pay_amount // 实交金额
	        	if(this.order.payment.length > 0) {
	        		this.order.payment[0].pay_amount = this.order.money_pay_amount // 第一个收款账户
	        	}
	        },
	        // 添加课程
			addLessons(lessons) {
				if(lessons.length > 0) {
					lessons.forEach(lesson => {
						this.addLesson(lesson,'lesson')
						this.addBindMaterial(lesson)
					})
				}
				this.lids.splice(0,this.lids.length)
			},
			// rest
			reset() {
				this.$form('singup_form').reset()
				// this.order.items.splice(0,this.order.items.length)
				// this.order._submit = 1
				this.order = util.copy(ORDER)
				this.id = 1
			},
		},
	}
</script>
<style lang="less">
@import '../../style/mixin.less';
	.signup-page {
		padding: 10px;
		.box {
			background:#fff;
			padding:10px 5px;
			margin-bottom:10px;
			.rounded(5px);
			.drop-shadow();
		}
		.box-info {
			padding-top: 14px;
			.school_info .ivu-form-item {
				margin-bottom:0 !important;
			}
		}
		.box-query {
			padding-left: 15px;
			.student-info {
				margin-top: 15px;
				>div {
					line-height: 2;
				}
			}
		}
		.box-goods {
			position: relative;
			padding-bottom: 0;
			.signup-left {
				position: absolute;
				left: 5px;
				top: 20px;
				.contract-no {
					display: inline-block;
					padding-left: 5px;
				}
			}
			.signup-right {
				position: absolute;
				right: 5px;
				top: 50px;
			}
			.signup-select {
				text-align: center;
				margin-top: 10px;
				margin-bottom: 18px;
			}
			a {
				color: #39f;
				&:hover {
					text-decoration: underline;
					color: #1f73c7;
				}
			}
		}
		.signup-btn,.settle-btn {
			float: right;
			margin: 5px 15px;
			button {
				width: 100px;
			}
		}
	}
</style>