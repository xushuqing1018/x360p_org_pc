<template>
	<div class="signup-page">
		<div class="box box-query filter-form">
			<label>学员姓名</label>
			<select-student 
				v-model="student.sid" 
				:clearable="true" 
				style="max-width: 250px" 
				placeholder="请选择学员" 
				@select="selectCustomer" 
				@on-clear-all="clearStu">
			</select-student>
			<template v-if="student_debit_cards.length > 0">
				<label class="ml-4">储值卡</label>
				<Select 
					v-model="order.sdc_id" 
					style="width: 250px;"
					clearable
					@on-clear="clearStudentDebitCard"
					@on-change="studentDebitCardChange">
					<Option 
						v-for="item in student_debit_cards" 
						:value="item.sdc_id"
						>
						{{item.debit_card.card_name}} (剩余{{item.remain_amount}})
					</Option>
				</Select>
			</template>
			<template v-if="student.sid > 0">
				<span><Button icon="clock" type="default" @click="showHistoryOrderModal">历史缴费</Button></span>
			</template>
			<div class="row student-info">
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>姓名：</span>
					<span v-if="student.student_name">
						<Icon :type="getSexIconType()"></Icon>&nbsp;{{student.student_name}}
					</span>
					<Tag color="blue" v-if="enable_vip&&student.vip_level>-2">
						{{student.vip_level===-1?'非会员':vip_level_config[student.vip_level].name}}
					</Tag>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>校区：</span>
					<span>{{student.bid|branch_name}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>手机：</span>
					<span>{{student.first_tel}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>电子钱包余额：</span>
					<span>{{student.money}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>赠送余额：</span>
					<span>{{student.present_money}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6" v-if="student.unpay_all > 0">
					<span>欠交金额：</span>
					<span style="color:#5cadff">
						<a @click="makeup(orders_unfinished)">{{student.unpay_all.toFixed(2)}}</a>
					</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<Button 
						type="text" 
						icon="bag" 
						size="small"
						:disabled="student.sid==0"
						v-per="'student.debit'" 
						v-if="enable_debit"
						@click="buyDebitCard">储值
					</Button>
					<Button 
						type="text" 
						icon="loop" 
						size="small"
						v-per="'student.changedc'" 
						v-if="show_exchange&&enable_debit_card"
						@click="exchangeDebitCard">兑换储值卡
					</Button>
				</div>
			</div>
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
				 		:readonly="order.is_submit==0"
				 		placeholder="请输入合同号">
			 		</Input>				 	
			 	</div>
			</div>
			<div class="signup-select">
				<select-lesson 
					v-model="lids" 
					:condition="lessonCondition"
					style="width: auto" 
					@selected="addLessons"
					>
					<ButtonGroup>
						<Button type="primary" icon="plus" style="width: 120px">选择课程</Button>
						<Button type="primary" icon="arrow-up-c" title="课程升级" @click.stop="lessonUp" style="padding: 6px 8px;"></Button>
					</ButtonGroup>
				</select-lesson>
				<select-class 
					v-model="cids" 
					disabled-temp
					style="width: auto" 
					@selected="addClasses"
					v-if="enable_lesson_type0 && !forbid_uncheck_assign"
					>
					<Button type="primary" icon="plus" style="width: 120px">选择班级</Button>
				</select-class>
			</div>
			<div class="signup-right">
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
				<Dropdown trigger="click" placement="bottom-end">
			        <a href="javascript:void(0)">
			            选择模板
			            <Icon type="arrow-down-b"></Icon>
			        </a>
			        <DropdownMenu slot="list">
			            <DropdownItem v-for="item in tpl_data">
			            	<div class="clearfix">
				            	<span class="pr-2" @click="selectTpl(item)">{{item.name}}</span>
				            	<span class="pull-right p-t" @click.stop="deleteTpl(item)">
				            		<Icon type="close" color="red"></Icon>
				            	</span>
				            </div>
			            </DropdownItem>
			            <DropdownItem v-if="tpl_data.length == 0" class="empty">
			            	暂无模板
			            </DropdownItem>
			        </DropdownMenu>
			    </Dropdown>
			    <template v-if="student.sid">
				    <span>|</span>
				    <Dropdown trigger="click" placement="bottom-end">
				    	<a href="javascript:void(0)">
				    		学习方案
				    		<Icon type="arrow-down-b"></Icon>
				    	</a>
				    	<DropdownMenu slot="list">
				    		<DropdownItem v-for="item in lbs_data" @click.native="selectLbs(item)">{{item.title}}</DropdownItem>
				    		<DropdownItem v-if="lbs_data.length == 0" class="empty">
				    			暂无方案
				    		</DropdownItem>
				    	</DropdownMenu>
				    </Dropdown>
				</template>
			</div>
			<goods-table ref="ref_goods" :student="student" :order="order"></goods-table>
		</div>
		<div class="box clearfix">
			<div class="settle-btn">
				<Button type="primary" @click="doSettle">结算</Button>
			</div>
		</div>
		<makeup-arrears-list
			ref="makeupArrearsList"
			:student="student"
			@on-select="makeupNow"
			@on-refresh-unpay="refreshUnpayAll">
		</makeup-arrears-list>
		<settle-center-modal 
			ref="settleCenterModal" 
			:order="order" 
			:student="student" 
			:salesman="defaultSalesman"
			@on-charge-confirm="confirmOrder">
		</settle-center-modal>
		<makeup-arrears-modal 
			ref="makeupArrearsModal" 
			:items="orders_items" 
			:student="student"
			@on-makeup-success="makeupSuccess"
			>
		</makeup-arrears-modal>
		<unpaid-orders-modal 
			ref="unpaidOrdersModal" 
			:items="orders_waiting" 
			@on-select="chargeNow">
		</unpaid-orders-modal>
	</div>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import moment from 'moment'
	import $rest from '@/libs/rest'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import pay from './mixin/pay.mixin'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SettleCenterModal from './signup/settle-center-modal'
	import GoodsTable from './signup/goods-table'
	import MakeupArrearsModal from './payment/makeup-arrears-modal'
	import UnpaidOrdersModal from './payment/unpaid-orders-modal'
	import MakeupArrearsList from './payment/makeup-arrears-list'
	import SelectMaterial from 'c%/SelectMaterial'
	import SelectFees from 'c%/SelectFees.vue'

	const studentObj = {
		sid:0,
		sno:'',
		cid:0,
		student_name: '',
		first_tel: '',
		sex: '',
		school_grade: '',
		school_class:'',
		school_id: '',
		money:0.00,
		present_money:0.00,
		unpay_all:0.00
	}

	const ORDER = {
		paid_time:moment(new Date()).format('YYYY-MM-DD'),			// 支付时间
		balance_paid_amount: 0.00,		// 电子钱包余额付款金额
		balance_present_amount: 0.00,   // 赠送余额付款金额
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
		sdc_id: 0,						// 学员储值卡Id
		_dropdown_account: [],			// 其他付款账户
		_pre_stored_amount:0.00,		// 预存金额
		_owe_payment_amount:0.00,		// 欠交款
		_is_owe:0,						// (1:欠交，0:预存)
		is_submit:1,					// (0:暂存，1:提交)
		_submit:1,
		user_contract_no:'',			// 合同号
		user_receipt_no:''				// 收据号
	}

	export default {
		name: 'Payment',
		mixins: [modalMixin,common,globals,grid,pay],
		components: {
			SelectStudent,
			SelectLesson,
			SettleCenterModal,
			GoodsTable,
			MakeupArrearsModal,
			UnpaidOrdersModal,
			SelectClass,
			SelectMaterial,
			MakeupArrearsList,
			SelectFees
		},
		props: {
			
		},
		data() {
			return {
				id: 1,								// 订单商品id
				student: util.copy(studentObj),		// 学员信息
				orders_unfinished: [],				// 未完成付款的订单
				orders_waiting: [],					// 待支付的订单
				orders_items: [],					// 补交欠费所有订单的item
				order: util.copy(ORDER),     		// 订单初始化\
				studentOrderItems: [],				// 学员以往订单记录
				lbs_data: [],						// 学员的学习方案
				student_debit_cards: [],			// 学员储值卡列表
				current_debit_card_define: [],		// 当前选中储值卡的优惠定义
				show_exchange: false,
			}
		},
		computed: {
			empty_oi_consume_type(){
				return this.$store.state.gvars.configs.params.student_signup.empty_oi_consume_type
			},
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
			}
		},
		created() {
			this.getTpl()
		},
		mounted() {
			this.getQueryInfo()
		},
		methods: {
			lessonUp() {
				if(this.student.sid == 0) {
					this.$Modal.error({
						title: '提示',
						content: '课程升级请先选择学员'
					})
					return
				}
				this.$Modal.open('dashboard/payment/lessonup/student-lesson.vue@modal',{
					props: {
						sid: this.student.sid
					},
					on: {
						'on-ok':(data) => {
							this.addLessonUp(data)
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('课程升级【%s】',this.student.student_name))
				})
			},
			addLessonUp({from,to}) {
				let lesson = util.copy(to)
				lesson.from_lid = from.lid
				lesson.from_sl_id = from.sl_id
				
				if(from.lesson.is_term == 1 && to.is_term == 1) {
					if(util.float(from.lesson.lesson_nums) < util.float(to.lesson_nums)) {
						lesson.lesson_nums = util.sub(util.float(to.lesson_nums),util.float(from.lesson.lesson_nums))
					}
					if(from.lesson.lesson_nums == to.lesson_nums) {
						lesson.unit_price = util.sub(to.unit_price,from.lesson.unit_price)
					}
				}
				this.addLesson(lesson,'lessonup')
			},
			exchangeDebitCard() {
				this.$Modal.open('dashboard/payment/exchange-debit-modal.vue',{
					props: {
						student: this.student
					},
					on: {
						'success':() => {
							this.refreshMoney(this.student.sid)
						}
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('兑换储值卡【%s】',this.student.student_name))
				})
			},
			// 取消使用学员储值卡
			clearStudentDebitCard() {
				if(this.order.sdc_id > 0) {
					this.order.sdc_id = 0
					this.current_debit_card_define = []
					this.order.items.forEach(item => {
						this.setDiscountByStudentDebitCard(item)
					})
				}
			},
			// 选择学员储值卡更新当前选中的储值卡
			studentDebitCardChange(v) {
				let debit = this.student_debit_cards.find(item => item.sdc_id === v)
				if(debit) {
					this.current_debit_card_define = debit.debit_card.discount_define
				}
				this.order.items.forEach(item => {
					this.setDiscountByStudentDebitCard(item)
				})
			},
			// 获取学员的储值卡
			getDebitCardBySid(sid) {
				this.$rest('student_debit_cards')
				.get({
					sid: sid,
					with: 'student,debit_card',
					pagesize: 1000,
					expire_day: moment().format('YYYYMMDD'),
					is_used: '[In,0,1]'
				})
				.success(res => {
					this.student_debit_cards = res.list
					if(res.list.length > 0) {
						this.order.sdc_id = res.list[0].sdc_id
						this.current_debit_card_define = res.list[0].debit_card.discount_define
						
						this.studentDebitCardChange(this.order.sdc_id)
					}else{
						this.clearStudentDebitCard()
					}
					if(this.student.money>0) {
						this.show_exchange = true
					}else{
						this.show_exchange = false
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			// 购买储值卡
			buyDebitCard() {
				let sid = this.student.sid
				this.$Modal.open('dashboard/payment/buy-debit-modal.vue',{
					on: {
						success:(res) => {
							this.refreshMoney(sid)
							this.printContract(res.data)
						}
					}
				})
				.then(modal => {
					modal
					.set('sid',sid)
					.set('student',this.student)
					.set('salesman',this.defaultSalesman)
					.show(util.sprintf('学员储值【%s】',this.student.student_name))
				})
			},
			// 购买储值卡后刷新
			refreshMoney(sid) {
				this.$rest('students').add_url_param(sid)
	            .get()
	            .success(res=>{
	            	this.student.money = res.money
	            	this.student.vip_level = res.vip_level
	            	this.getDebitCardBySid(sid)
	            	
	            })
	            .error(res=>{
	                this.$Message.error(res.body.message)
	            })
			},
			printContract(res) {

				this.$Modal.confirm({
	                title: '提示',
	                content: '<p>购买成功，是否打印预储值协议</p>',
	                onOk: () => {
	                
	                    this.print_smh(res.smh_id)
	                }
	            });
			},
			print_smh (id,preview) {
				
				this.showPageSpin('正在获取打印模板...')
				this.$rest('student_money_historys/print?smh_id='+id)
				.get()
				.success(data=>{
					this.printer.printBill(4,data,1,'0 0 0 0',true)
					this.hidePageSpin()
				}).error(body=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: body.message||'获取打印数据错误'
					})
				})
			},
			// 根据路由参数获取学员信息
			getQueryInfo() {
				let sid = this.$route.params.sid
				if(typeof sid !== 'undefined') {
					this.getStudentInfo(sid)
				}
			},
			getStudentInfo(sid) {
				this.$rest('students/' + sid)
	            .get()
	            .success(response=>{
	            	Object.assign(this.student, response)
	            	if(this.$route.params.debit) {
						this.buyDebitCard()
						return;
					}
	            	this.getDebitCardBySid(sid)
	            	this.cacuUnpayAmount(sid)
	            	this.getSalesman(sid,'is_first_order')
	            	this.getLessonBuySuits(sid)
	            })
	            .error(response=>{
	                this.$Message.error(response.body.message)
	            })
			},
			getLessonBuySuits(sid) {
				this.lbs_data.splice(0)
				this.$rest('lesson_buy_suits')
				.get({
					sid:sid,
					pagesize:1000
				})
				.success(res => {
					this.lbs_data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectLbs(item) {
				item.define.forEach(d => {
					d.lessons.forEach(l => {
						let lesson = this.getLesson(l.lid)
						if(lesson) {
							let order_item = this.order.items.find(it=>it.lid == lesson.lid && it.cid == 0)
							if(order_item){
								this.addOrderItemNum(order_item,l.nums)
							}else{
								this.addOrderItem(lesson,l.nums)
							}
						}
					})
				})
			},
			getStudentOrder(data) {
				this.studentOrderItems.splice(0)
				let submit_data = data.list.filter(item=>item.is_submit==1)
				submit_data.forEach(order => {
					order.order_items.forEach(item=>{
						this.studentOrderItems.push(item)
					})
				})
				this.setOrderConsumeType()
			},
			setOrderConsumeType() {
				if(this.order.items.length > 0) {
					this.order.items.forEach(item => {
						this.setItemConsumeType(item)
					})
				}
			},
			// 设置每一个item的consume type
			setItemConsumeType(item) {
				let orderItem
				if(item.consume_type == 0){
					if(item.gtype==0) {
						orderItem = this.studentOrderItems.find(i=>i.lid==item.lid)
					}else{
						orderItem = this.studentOrderItems.find(i=>i.gid==item.gid)
					}
					if(orderItem) {
						this.$set(item,'consume_type',2)
					}else{
						
						this.$set(item,'consume_type',this.empty_oi_consume_type)
					}
				}
				// 如果使用储值卡的优惠则忽略vip的优惠
				if(this.order.sdc_id > 0) {
					this.setDiscountByStudentDebitCard(item)
					return;
				}
				if(this.enable_vip) {
					this.setDiscountByVip(item)
				}
			},
			// 根据vip等级设置对应的折扣
			setDiscountByVip(item) {
				let level = this.student.vip_level
				if(level > 0 && item.gtype == 0) {
					let discount = this.vip_level_config[level].discount
					if(discount > 0 && discount < 100) {
						this.$set(item,'_discount_rate',util.float(discount))
						this.$refs['ref_goods'].discountRateChange(item)
					}
				}
			},
			// 根据学员储值卡自动对课程设置相应的折扣
			setDiscountByStudentDebitCard(item) {
				// 根据课程的等级在当前的选中储值卡中找到优惠方案
				let lesson_discount = this.current_debit_card_define.find(d => d.did === item.product_level_did)
				this.$set(item,'nums',item._data.nums)
				if(item.lid > 0) {
					if(lesson_discount) {
						let discount_type = lesson_discount.discount_type
						let discount_reduced = lesson_discount.reduced_amount
						let discount_rate = lesson_discount.discount_rate

						if(discount_type === 1) { // 储值卡折扣
							this.$set(item,'_discount_rate',util.float(discount_rate))
							this.$set(item,'_debit_discount',util.float(discount_rate))
							this.$set(item,'origin_price',item._data.origin_price)
							this.$refs['ref_goods'].discountRateChange(item)
							this.$set(item,'_apply_debit_type',1)

						}else if(discount_type === 2 && item._data.origin_price != 0) { // 如果是直减的优惠，则计算折扣率
							// 直减后item的origin_amount
							this.$set(item,'origin_price',item._data.origin_price)
							this.$set(item,'origin_amount',item._data.origin_amount)

							let amount_after_reduced = util.sub(item.origin_amount,discount_reduced)
							let price = util.div(amount_after_reduced,item.nums).toFixed(6)
							let discount_rate = util.float((util.div(price,item.origin_price)*100).toFixed(2))

							this.$set(item,'price',util.float(price))
							this.$set(item,'_discount_rate',util.float(discount_rate))
							this.$set(item,'_amount_by_discount',util.float(amount_after_reduced))
							this.$set(item,'_debit_reduced',util.float(discount_reduced))
							this.$set(item,'discount_amount',util.float(discount_reduced))
							this.$set(item,'_apply_debit_type',2)
						}else if(discount_type === 3){ // 直接定价

							let origin = util.float(lesson_discount.origin)
							let current = util.float(lesson_discount.current)
							let reduced = util.sub(origin,current)
							let price = util.float(util.div(current,item.nums).toFixed(6))
							let origin_price = util.float(util.div(origin,item.nums).toFixed(6))
							let rate = util.float((util.div(price,origin_price)*100).toFixed(2))
							
							this.$set(item,'origin_amount',origin)
							this.$set(item,'_amount_by_discount',current)
							this.$set(item,'discount_amount',reduced)
							this.$set(item,'price',price)
							this.$set(item,'origin_price',origin_price)
							this.$set(item,'_discount_rate',rate)
							this.$set(item,'_apply_debit_type',3)
							this.$set(item,'_debit_origin',origin)
							this.$set(item,'_debit_current',current)
						}
						this.$set(item,'sdc_id',this.order.sdc_id)

					}else{

						this.$set(item,'_discount_rate',100)
						this.$set(item,'_apply_debit_type',0)
						this.$set(item,'discount_amount',0)
						this.$set(item,'price',item._data.origin_price)
						this.$set(item,'origin_price',item._data.origin_price)
						this.$set(item,'_amount_by_discount',item._data.origin_amount)
						this.$set(item,'origin_amount',item._data.origin_amount)
						this.$set(item,'sdc_id',0)
					}
				}
			},
			// 选择学员自动补全信息
			selectCustomer(sid) {
				this.getStudentInfo(sid)
			},
			// 删除学员删除学员信息
			clearStu() {
				this.show_exchange = false
				this.student = util.copy(studentObj)
			},
			// 结算按钮
			doSettle() {
				if(this.student.sid == 0) {
					this.$Message.error('请选择学员')
					return false
				}
				this.checkOrderItems()
			},
			// 计算学员欠费总金额
			cacuUnpayAmount(sid) {
				let params = {
					sid: sid,
					pagesize: 10000,
					order_from: 0
				}
				let status = [0,1]
				this.student.unpay_all = 0.00
				this.$rest('orders')
	            .get(params)
	            .success(response=>{
	            	this.getStudentOrder(response)
	            	let data = response.list.filter(item=>item.is_submit==1&&status.indexOf(item.pay_status)>-1)
	            	data.forEach((item) => {
            			this.student.unpay_all = util.add(this.student.unpay_all, item.unpaid_amount)
            		})
	            	let oid = this.$route.params.oid
					if(typeof oid !== 'undefined') {
						let dataByOid = response.list.filter(item => item.oid == oid)
						if(dataByOid[0].is_submit == 1) {
							this.makeup(dataByOid)
						}else{
							this.chargeNow(dataByOid[0])
						}
					}else{
						if(this.student.unpay_all > 0) {
	            			this.orders_unfinished = data
		            		this.$Modal.confirm({
			                    title: '提示',
			                    content: `<p>${this.student.student_name}有欠交费用${this.student.unpay_all}元，是否先补交欠费？</p>`,
			                    onOk: () => {
			                        // this.makeup(data)
			                        this.$r('makeupArrearsList')
			                        .set('data',data)
			                        .show(util.sprintf('欠交订单列表【%s】',this.student.student_name),'list')
			                    },
			                    onCancel: () => {
			                        this.searchUnpaidOrders(response)
			                    }
			                });
		            	}else{
		            		this.searchUnpaidOrders(response)
		            	}
					}
	            })
	            .error(response=>{
	                this.$Message.error(response.body.message)
	            })
			},
			// 补交欠费
			makeup(orders) {
				this.orders_items = []
				
				orders.forEach((order,order_index) => {
					//bug fix
					if(
						order.order_items.length == 1 && 
						order.unpaid_amount > 0 && 
						order.order_items[0].paid_amount != order.paid_amount
					){
						order.order_items[0].paid_amount = order.paid_amount
					}
					let firstIndex = order.order_items.findIndex(item => this.cacuRealUnpay(item) > 0)
					if(firstIndex > -1) {
						order.order_items.forEach((item,item_index) => {
							if(this.cacuRealUnpay(item) > 0) {
								if(firstIndex == item_index) {
									this.orders_items.push(this.createMakeupItems(order,order_index,item,'first'))	
								}else{
									this.orders_items.push(this.createMakeupItems(order,order_index,item,'other'))
								}
							}
						})
					}
				})
				this.$r('makeupArrearsModal').show(util.sprintf('补交费用[%s]',this.student.student_name), 'makeup')
				setTimeout(() => {
					this.$r('makeupArrearsModal').cacuData()
					this.$r('makeupArrearsModal').checkPaymentOnline(this.orders_items[0].oid)
				},100)
			},
			// 构造补交欠费items
			createMakeupItems(order,order_index,item,mode) {
				let obj = {}
				obj.item_name  = item.item_name
				obj.oi_id      = item.oi_id
				obj.sdc_id 	   = item.sdc_id
				obj.oid 	   = item.oid
				obj.order_no   = order.order_no
				obj.paid_time  = order.paid_time
				obj.gtype      = item.gtype
				obj.subtotal   = item.subtotal // 应交金额
				obj._own_share_amount  = this.cacuRealUnpay(item) // 欠交金额
				obj.paid_amount        = this.cacuRealUnpay(item) // 补交金额
				obj.balance_paid_amount = 0.00 // 电子钱包冲减金额
				obj.money_paid_amount   = 0.00 // 现金已付金额

				if(item.gtype == 0) {
					obj.cid = item.cid
					if(item.cid > 0 && _.isObject(item.one_class)) {
						obj._class_name = item.one_class.class_name
					}
					if(item.lid > 0){
						if(typeof item['lesson_type'] != 'undefined'){
							obj.lesson_type = item.lesson_type
						}else{
							let lesson = this.getLesson(item.lid)
							obj.lesson_type = item.lesson_type
						}
					}
				}

				if(mode == 'first') {
					obj.first = true
				}else{
					obj.first = false
				}

				if(order_index % 2 == 0) {
					obj.line = 'odd'
				}else{
					obj.line = 'even'
				}

				return obj
			},
			// 计算实际的欠款金额(结转和退费对其会有影响)
			cacuRealUnpay(item) {
				let origin_unpay_amount = util.sub(item.subtotal ,item.paid_amount) 
				return origin_unpay_amount
			},
			// 查询待支付订单
			searchUnpaidOrders(response) {
				this.orders_waiting = []
				let data = response.list.filter(item => item.is_submit==0)
				if(data.length > 0) {
					this.$Modal.confirm({
						title: '提示',
						content: `<p>${this.student.student_name}有待支付订单，是否继续支付？</p>`,
						onOk: () => {
							this.orders_waiting = data
							this.$r('unpaidOrdersModal').show(util.sprintf('待支付订单【%s】',this.student.student_name), 'chargenow')
						},
						onCancel: () => {
							// todo
						}
					});
				}
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
	        	let total = this.order._total_amount = this.order._lessons_amount + this.order._article_amount
	        	// 自动减去电子钱包余额
	        	if(this.order.is_submit == 1 && this.student.money >= 0) {
	        		if(total >= this.student.money) {
						this.order.balance_paid_amount = this.student.money
					}else{
						this.order.balance_paid_amount = total
					}
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
				if(!this.enable_modify_saved_order&&this.order.oid) {
					this.$Message.error('不能修改已保存订单的内容')
					this.lids.splice(0,this.lids.length)
					return
				}
				if(lessons.length > 0) {
					lessons.forEach(lesson => {
						this.addLesson(lesson,'lesson')
						this.addBindMaterial(lesson)
					})
				}
				this.lids.splice(0,this.lids.length)
			},
			// 待支付订单现在收费
			chargeNow(order) {
				this.order.items.splice(0,this.order.items.length)
				this.order.oid = order.oid
				this.order.sdc_id = order.sdc_id
				this.order._oid = order.oid
				this.order.paid_time = order.paid_time
				this.order.balance_paid_amount = order.balance_paid_amount
				this.order.order_reduced_amount = order.order_reduced_amount
				this.order.remark = order.remark
				this.order.is_submit = order.is_submit
				this.order.user_contract_no = order.user_contract_no||order.order_no
				order.order_items.forEach((item) => {
					this.order.items.push(this.createContinuePayItem(item))
				})
				if(this.enable_modify_saved_order) {
					this.order._submit = 1
				}else{
					this.order._submit = 0
				}
			},
			// 未支付订单重新确认设置在线支付账户(如果有,理论上只有一个)
			setOnlineAccount(data) {
				let	onlineAccount = this.order._dropdown_account.find(a=>a.aa_id==data.aa_id),
					onlineIndex   = this.order._dropdown_account.findIndex(a=>a.aa_id==data.aa_id)
				onlineAccount.pay_amount 	= data.paid_amount
				onlineAccount.opo_id 		= data.opo_id
				onlineAccount.pay_status 	= true
				this.order._dropdown_account.splice(onlineIndex,1)
				this.order.payment.push(onlineAccount)
			},
			// 去补缴单个订单
			makeupNow(order) {
				this.makeup(order)
			},
			// 补交成功
			makeupSuccess() {
				this.$r('makeupArrearsList').queryOwnOrders()
			},
			// 刷新学员欠交总额
			refreshUnpayAll(data) {
				this.student.unpay_all = data
			},
			// reset
			reset() {
				this.clearStu()
				this.id = 1
				this.student_debit_cards = []
				this.current_debit_card_define = []
				this.show_exchange = false
				this.order = util.copy(ORDER)
			},
			showHistoryOrderModal() {
				this.$Modal.open('components/SelectOrderItemModal.vue@modal',{
					props:{
						sid:this.student.id
					},
					on:{
						'select':(row)=>{
							this.addOrderItemByHistory(row)
						}
					}
				}).then(modal=>{
					modal
					.vuec.getStudentOrderItems(this.student.sid)
					modal.show('从历史缴费记录选取项目')
				})
			},
			addOrderItemByHistory(row){
				this.addLesson(row,'order_item')
			}
		}
	}
</script>