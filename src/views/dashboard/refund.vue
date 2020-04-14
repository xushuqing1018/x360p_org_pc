<template>
	<div class="c-grid">
		<div class="box box-info-query filter-form">
			<div class="row">
				<div class="col-sm-12">
					<label>学员姓名</label>
					<select-student 
						v-model="student.sid" 
						:clearable="true" 
						style="max-width: 250px" 
						placeholder="请选择学员" 
						@select="selectCustomer" 
						@on-clear-all="reset">
					</select-student>
					<Checkbox class="pl-4" v-model="is_contain_good">包含物品</Checkbox>
					<div class="pull-right" v-if="enable_empty_refund">
						<RadioGroup v-model="refund_mode" type="button">
					        <Radio :label="0">剩余课时退费</Radio>
					        <Radio :label="1">满课耗返优惠</Radio>
					    </RadioGroup>
					</div>
				</div>
			</div>
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
				<div class="col-lg-2 col-md-3 col-sm-6" v-if="student.unpay_all > 0">
					<span>欠交金额：</span>
					<span>{{student.unpay_all.toFixed(2)}}</span>
				</div>
			</div>
		</div>
		<div class="box clearfix" v-if="refund_mode == 1">
			<div class="settle-btn">
				<label>课消月份：</label>
				<DatePicker 
					type="month"
					format="yyyyMM"
					:value="refund_int_month"
					@on-change="refund_int_month=$event"
					placeholder="课消月份"
					>
				</DatePicker>
				
			</div>
		</div>
		<div class="box box-goods">
			<orders-refund-table 
			:items="orders_items" 
			:loading="loading" 
			:showTag="is_contain_good" 
			:refund-int-month="refund_int_month"
			:refund-mode="refund_mode">				
			</orders-refund-table>
		</div>
		<div class="box">
			<div class="card-refund row m-0">
				<div class="col-sm-12 col-md-4">
					<div class="title" style="background-color: #D3EAFD;">
						其他
					</div>
					<div class="remark filter-form">
						<Form ref="other_info" :label-width="120">
							<Form-item label="备注：">
								<Input type="text" v-model="remark"></Input>
							</Form-item>
							<Form-item label="退费业绩归属人：">
								<template>
									<Tag closable @on-close="del_sale_role(item)" v-for="(item,index) in salesman" :key="index">
										{{item.eid|ename}}
										 - {{labelDicts(item['sale_role_did'],'sale_role')}}								
									</Tag>
									<select-employee style="width:auto;line-height: inherit;" :did="1" :limit-per="false" @onChange="add_sale_role">
										<span class="text-info" style="cursor:pointer" title="添加"><Icon type="plus"></Icon></span>
									</select-employee>
								</template>
							</Form-item>
						</Form>
					</div>
				</div>
				<div class="col-sm-12 col-md-4">
					<div class="title" style="background-color: #FDEAD3">
						退费
					</div>
					<div class="refund-cacu row">
						<div class="col-sm-2 col-md-2"></div>
						<div class="col-sm-8 col-md-8">
							<div class="row">
								<div class="col-sm-8 col-md-8 m-t-15">
									<label>退费金额：</label>
								</div>
								<div class="col-sm-4 col-md-4 m-t-15">
									<span>{{refund_amount}}</span>
								</div>
								<div class="col-sm-8 col-md-8 m-t-5">
									<label>减欠交金额：</label>
								</div>
								<div class="col-sm-4 col-md-4 m-t-5">
									<span>{{unpay_amount}}</span>
								</div>
								<template v-if="refund_mode == 0">
									<div class="col-sm-8 col-md-8 m-t-5">
										<label>应退电子钱包金额：</label>
									</div>
									<div class="col-sm-4 col-md-4 m-t-5">
										<Input v-keeptwo size="small" v-model="refund_balance_amount" style="width: 80px;"></Input>
									</div>
									<div class="col-sm-8 col-md-8 m-t-5">
										<label>扣款金额：</label>
									</div>
									<div class="col-sm-4 col-md-4 m-t-5 drop-cut">
										<Dropdown trigger="custom" :visible="visible">
									        <a href="javascript:void(0)" @click="handleTrigger">
									            {{cut_amount}}
									            <Icon type="arrow-down-b"></Icon>
									        </a>
									        <DropdownMenu slot="list">
									        	<table class="cut-table">
									        		<thead>
									        			<tr>
															<th>扣款项目</th>
															<th>金额</th>
									        			</tr>
									        		</thead>
									        		<tbody>
									        			<tr v-for="item in cut_items">
									        				<td>{{item.title}}</td>
									        				<td><Input v-keeptwo.minus v-model="item.amount" size="small" style="width:50px;"></Input></td>
									        			</tr>
									        			<tr v-if="cut_items.length == 0">
															<td colspan="2" style="text-align: center"><p class="empty">暂无扣款项目</p></td>
									        			</tr>
									        		</tbody>
									        	</table>
									        </DropdownMenu>
									    </Dropdown>
									</div>
								</template>
								<div class="col-sm-12 col-md-12">
									<div class="dashed"></div>
								</div>
								<div class="col-sm-8 col-md-8 m-t-5">
									<label>实际退费金额：</label>
								</div>
								<div class="col-sm-4 col-md-4 m-t-5">
									<span>{{cash_refund}}</span>
								</div>
							</div>
						</div>
						<div class="col-sm-2 col-md-2"></div>
					</div>
				</div>
				<div class="col-sm-12 col-md-4">
					<div class="title" style="background-color: #FDD3DB">
						退款账户
					</div>
					<div class="m-t-10 clearfix">
						<RadioGroup v-model="refund_to" v-if="refund_mode == 1">
					        <Radio :label="0">退到电子钱包</Radio>
					        <Radio :label="1">退现金</Radio>
					    </RadioGroup>
					    <template v-if="refund_mode == 0 || (refund_mode == 1 && refund_to == 1)">
							<Form ref="model_account" clearable="true" :label-width="120" >
								<div class="account" v-for="(item,index) in accounts">
									<Form-item :label="item.name+'：'">
										<Input v-keeptwo v-model="item.amount" style="width:100px;" size="small"></Input>
										<Button 
											type="ghost" 
											shape="circle" 
											icon="ios-trash" 
											size="small" 
											v-if="item.mode!==0" 
											@click="hideAccount(item,index)">
										</Button>
									</Form-item>
								</div>
							</Form>
							<div v-if="accounts.length == 0">您没有设置默认现金账户!</div>
							<div class="float-right pr-2">
								<Dropdown>
									<a href="javascript:void(0)">
										其他收款账户
										<Icon type="chevron-down"></Icon>
									</a>
									<Dropdown-menu slot="list">
										<Dropdown-item v-for="(item,index) in dropdown_account">
											<div @click="showAcconut(item,index)">
												{{item.name}}
												<Tag color="blue" type="border" v-if="item.is_public == 1">公</Tag>
											</div>
										</Dropdown-item>
										<Dropdown-item v-if="dropdown_account.length == 0" style="color:#c3cbd6;">已显示全部账户</Dropdown-item>
									</Dropdown-menu>
								</Dropdown>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
		<div class="box clearfix">
			<div class="settle-btn">
				<label>退费日期：</label>
				<DatePicker 
					:value="refund_int_day"
					:options="date_option"
					@on-change="refund_int_day=$event"
					placeholder="退费日期"
					>
				</DatePicker>
				<Button type="primary" class="ml-4" @click="doRefund">确认退费</Button>
			</div>
		</div>
	</div>
</template>
<script>
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import pay from './mixin/pay.mixin'
	import moment from 'moment'
	import $rest from '@/libs/rest'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import SelectStudent from 'c%/SelectStudent.vue'
	import OrdersRefundTable from './refund/orders-refund-table.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

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
		money:'0.00',
		unpay_all:0.00
	}

	export default {
		name: 'Refund',
		mixins: [common,globals,grid,pay],
		components: {
			SelectStudent,
			OrdersRefundTable,
			SelectEmployee
		},
		data() {
			return {
				refund_mode:0,			//退款模式:0退课时1满课耗退费
				refund_to:0,			//退款到:0钱包余额1现金
				student: util.copy(studentObj),		// 学员信息
				orders_items: [],					// 所有提交的订单中的item
				remark: '',
				accounts: [],
				dropdown_account: [],
				refund_balance_amount: '0.00',
				cache: [],
				loading: false,
				salesman: [],						// 退费业绩归属人
				refund_int_day: moment().format('YYYY-MM-DD'),
				refund_int_month:moment().subtract(1,'months').format('YYYYMM')
			}
		},
		mounted() {
			this.getQueryInfo()
			this.dealRefundAccounts(this.accounts$)
			this.dealCutItems(this.cut$)
		},
		methods: {
			// 根据路由参数获取学员信息
			getQueryInfo() {
				let sid = this.$route.params.sid
				if(typeof sid !== 'undefined') {
					this.getStudentInfo(sid)
				}
			},
			getStudentInfo(sid) {
				this.loading = true
				this.$rest('students/' + sid)
	            .get()
	            .success(response=>{
	            	Object.assign(this.student, response)

	            	if(this.student.money >=0) {
	            		this.refund_balance_amount = this.student.money
	            		this.setAccountAmount(this.student.money)
	            	}
	            	
	            	this.getSalesman(sid,'refund')
	            	this.getOrdersRefund(sid)
	            })
	            .error(response=>{
	                this.error(response.body.message)
	                this.loading = false
	            })
			},
			// 选择学员自动补全信息
			selectCustomer(sid) {
				this.getStudentInfo(sid)
			},
			// 退费查询所有订单的item
			getOrdersRefund(sid) {
				let oid = this.$route.params.oid
				let filter1 = function(item) {
					if(typeof oid !== 'undefined') {
						return item.is_submit == 1 && item.oid == oid
					}else{
						return item.is_submit == 1
					}
				}
				let filter2 = function(item) {
					return item.is_submit == 1 && (item.pay_status == 0 || item.pay_status == 1)
				}
				this.$rest('orders')
				.get({
					refund_mode:this.refund_mode,
					sid: sid,
					int_month:this.refund_int_month,
					bid: -1,
					pagesize: 1000
				})
				.success(response => {
					// 计算学员欠费总金额
					this.student.unpay_all = 0
					response.list.filter(filter2).forEach((item) => {
            			this.student.unpay_all =util.add(this.student.unpay_all, item.unpaid_amount)
            		})
					// 构造退费item数据
					this.cache = response.list.filter(filter1)
					this.getItems(this.cache)
					this.loading = false
				})
				.error(response =>{
					this.$Message.error(response.body.message)
					this.loading = false
				})
			},
			getItems(orders) {
			
				this.orders_items.splice(0,this.orders_items.length)
				if(orders.length > 0) {
					orders.forEach((order,order_index) => {

						let condition = (item) => {
							if(this.refund_mode == 1){
								if(item.gtype == 0 && util.float(item.used_nums) > 0 && util.float(item.subtotal) > 0){
									return true
								}
								return false
							}
							let remain_present = item.present_lesson_hours - item.deduct_present_lesson_hours
							let result = item.remain_nums > 0 || remain_present > 0
							if(!this.is_contain_good) {
								return result && item.gtype !== 1
							}
							return result
						}
						let firstIndex = order.order_items.findIndex(condition)

						if(firstIndex != -1) {
							order.order_items.filter(condition).forEach((item,item_index) => {
								if(firstIndex == item_index) {
									this.orders_items.push(this.createRefundItems(order,order_index,item,'first'))
								}else{
									this.orders_items.push(this.createRefundItems(order,order_index,item,'other'))
								}
							})
						}
					})
				}
			},
			// 构造item数据
			createRefundItems(order,order_index,item,mode) {
				let obj = {}

				obj.order_no = order.order_no							 	 // 订单编号
				obj.paid_time = order.paid_time							 	 // 交易日期
				obj.oid = item.oid											 // oid
				obj.oi_id = item.oi_id										 // oi_id
				obj.nums = util.float(item.nums)						     // 购买数量(不含赠送)
				obj.gtype = item.gtype										 // 商品类型
				obj.nums_unit = item.nums_unit								 // 单位
				obj.unit_price = this.calcDealPrice(item)	 				 // 购买单价
				obj.remain_nums = item.remain_nums							 // 剩余数量(不含赠送)
				obj.bill_unit_price = this.calcDealPrice(item) 				 // 计费单价(课消)
				obj.refund_amount = this.cacuRefundAmount(item) 		 	 // 可退费金额
				obj.refund_num = 0										 	 // 退费数量
				obj.amount = '0.00',										 // 实际退费金额(可编辑)
				obj._amount = '0.00',										 // 原始退费金额
				obj.refund_over_amount = '0.00'							     // 退费溢价
				obj.unpay_amount = this.cacuRealUnpay(item)			 		 // 欠交金额
				obj.is_standard_price = false								 // 是否按原始单价计算课消
				obj.use_nums = Number(item.used_nums)						 // 课消数量
				obj.refund_price = 0.00									 	 // 退费单价
				obj.subtotal = item.subtotal								 // 小计，不用nums*unit_price计算item总额
				obj.origin_price = item.origin_price						 // 原始单价
				obj.present_lesson_hours = item.present_lesson_hours         // 赠送数量
				obj._has_present = false									 // 是否有赠送
				obj.refund_present_nums = 0.00						         // 扣除赠送数量
				obj.refunded = item.refund_nums								 // 已退费数量
				obj.transfered = item.transfer_nums 						 // 已结转数量
				obj.used_present_hour = item.used_present_hour				 // 赠送已消耗的数量
				obj.total_refund_amount = util.float(item.total_refund_amount)	//累计退费金额

				if(this.refund_mode == 1){
					obj.month_use_hours = item.month_use_hours
				}
				obj._sl_id = item.sl_id



				if(item.cid > 0 && item.one_class) {
					obj._class_name = item.one_class.class_name
				}

				if(item.gtype == 1) {
					obj.gid = item.gid 										 // 物品gid
					obj._name = item.material.name 							 // 物品名称
					obj._unit = item.material.unit 						     // 物品单位
				}else if(item.gtype == 0) {
					obj.lid = item.lid					     				 // 课程
					let remain = item.present_lesson_hours - item.deduct_present_lesson_hours - item.used_present_hour
					if(remain > 0){
						obj._has_present = true
						obj.remain_present_nums = remain
					}
				}else if(item.gtype == 3) {
					obj._name = item.item_name
					obj._unit = ''
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

				if(obj.bill_unit_price == obj.origin_price) {
					obj.is_standard_price = true
				}

				return obj
			},
			// 计算成交单价
			calcDealPrice(item) {
				if(item.nums == 0) {
					return Number(item.origin_price)
				}
				return util.float(util.div(item.subtotal, item.nums).toFixed(6))
			},
			cacuUnitPrice(item) {
				return util.div(item.subtotal, item.nums).toFixed(2)
			},
			// 计算可退金额
			cacuRefundAmount(item) {
				let unit_price, use_nums, use
				unit_price = this.calcDealPrice(item)
				use_nums = this.cacuUseNums(item)
				use = util.mul(use_nums, unit_price)
				return util.float(util.sub(item.subtotal, use).toFixed(6))
			},
			// 计算课消数量
			cacuUseNums(item) {
				return util.sub(item.nums, item.remain_nums)
			},
			// 计算欠交金额
			cacuRealUnpay(item) {
				// 欠交金额后台不更新
				let origin_unpay_amount = util.sub(item.subtotal ,item.paid_amount) 
				let back_nums = util.add(item.refund_nums, item.transfer_nums)
				if(back_nums > 0) {
					return 0
				}else{
					return origin_unpay_amount
				}
			},
			doRefund(){
				if(this.refund_mode == 0){
					this.doRefundHour()
				}else{
					this.doRefundAmount()
				}
			},
			doRefundAmount(){
				if(this.student.sid == 0) {
					this.$Message.error('请先选择要退费的学员')
					return false
				}
				if(this.cash_refund == 0){
					return false
				}
				let str = `本次实际退费金额为${this.cash_refund}元，确定退费吗？`
				if(this.refund_to == 0){
					str = `本次实际退费金额为${this.cash_refund}元，将退到学员的电子钱包,确定退费吗？`
				}
				this.$Modal.confirm({
                    title: '提示',
                    content: `<p>${str}</p>`,
                    onOk: () => {
                        this.refund()
                    },
                    onCancel: () => {
                    	// todo
                    }
                });
			},
			// 退费按钮
			doRefundHour() {
				let money = Number(this.student.money)
				if(this.student.sid == 0) {
					this.$Message.error('请先选择要退费的学员')
					return false
				}
				if(this.cash_refund < 0) {
					this.$Message.error('退费金额不能小于0')
					return false
				}
				if(!this.checkRefundAndUnpay()){
					return false
				}
				if(money >= 0) {
					if(Number(this.refund_balance_amount) > money) {
						this.$Message.error('应退电子钱包金额不能大于实际的金额')
						return false
					}
				}else{
					if(Number(this.refund_balance_amount) > 0) {
						this.$Message.error('学员的电子钱包余额为负数')
						return false
					}
				}
				
				if(!this.checkCashAndAccounts()) {
					this.$Message.error('退款账户合计金额与实际退费金额不等')
					return false
				}
				if(this.refund_balance_amount ==0 && this.cash_refund == 0){
					this.$Message.error('退费金额不能为0')
					return false
				}
				let minus_unpay = util.sub(this.unpay_amount_all, this.unpay_amount).toFixed(2)
				let str_1 = parseFloat(minus_unpay) > 0 ? `${this.student.student_name}在别的课程或物品上还有欠交${minus_unpay}，` : ''
				let str_2 = `本次实际退费金额为${this.cash_refund}元，确定退费吗？`
				this.$Modal.confirm({
                    title: '提示',
                    content: `<p>${str_1}${str_2}</p>`,
                    onOk: () => {
                        this.refund()
                    },
                    onCancel: () => {
                    	// todo
                    }
                });
			},
			// 判断是否存在欠交金额大于等于结转金额,有则提示不能进行下一步操作
			checkRefundAndUnpay() {
				let str = ''
				this.orders_items.forEach((item) => {
					if(item.refund_num > 0) {
						if(item.amount > 0 && item.amount <= item.unpay_amount) {
							let name = item.gtype == 1 ? item._name : this.$filter('lesson_name')(item.lid)
							str += `<p>订单号：${item.order_no}，${name}</p>`
						}
					}
				})
				if(str != '') {
					this.$Modal.confirm({
	                    title: '提示',
	                    content: `<p>${this.student.student_name}在以下课程或物品上的欠交金额大于等于退费金额，请先通过收费操作将费用补齐：</p>${str}`,
	                    onOk: () => {
	                        // todo
	                        this.$router.push({
	                        	name:'dashboard_payment',
	                        	params:{sid:this.student.sid}
	                        })
	                    },
	                    onCancel: () => {
	                    	// todo
	                    }
	                });
	                return false
				}else{
					return true
				}
			},
			// 检查退款账户总金额与实际退费金额是否相等
			checkCashAndAccounts() {
				let accounts_amount = 0
				this.accounts.forEach((item) => {
					accounts_amount += parseFloat(item.amount)
				})
				if(this.cash_refund != accounts_amount) {
					return false
				}
				return true
			},
			refund() {
				let params = {
					refund_mode:this.refund_mode,
					refund_to:this.refund_to,
					student: {sid:this.student.sid},
					
					accounts: this.accounts,
					refund_balance_amount: this.refund_balance_amount,
					remark: this.remark,
					cut_items: this.filterCut(),
					salesman: this.salesman,
					refund_int_day: this.refund_int_day
				}
				if(this.refund_mode == 1){
					params.refund_balance_amount = 0
					params.items = this.orders_items.filter(item => item.amount > 0)
					if(this.refund_to == 0){
						params.accounts = [];
					}
				}else{
					params.refund_to = 1
					params.items = this.orders_items.filter(item => item.refund_num > 0||item.refund_present_nums > 0)
				}

				this.$Spin.show()
				this.$rest('orders/do_refund')
				.post(params)
				.success(response => {
					this.$Spin.hide()
					
					//confirm的destroy有300ms延时，所以在confirm中调用confirm时需要在上一个confirm消失后再调用新的，否则会两个同时关闭掉
					if(this.refund_mode == 0){
						this.reset()
						setTimeout(()=>{
							this.$Modal.confirm({
								titel: '提示',
								content: '退费成功，确定打印收据吗？',
								onOk: () => {
									this.print(2,response.data.or_id)
									// this.clearQuery()
								},
								onCancel: () => {
									// this.clearQuery()
								}
							})
						},400)
					}else{
						this.$Message.success('满课耗返优惠-退费操作成功!')
						this.getOrdersRefund(this.student.sid)
					}	
				})
				.error(response => {
					this.$Spin.hide()
					this.error(response.body.message)
				})
			},
			// reset
			reset() {
				this.student = util.copy(studentObj)
				this.orders_items.splice(0,this.orders_items.length)
				this.resetCut()
				this.refund_balance_amount = '0.00'
				this.remark = ''
				this.salesman = []
				this.dealRefundAccounts(this.accounts$)
				this.refund_int_day = moment().format('YYYY-MM-DD')
			},
			// 创建收款账户数据结构
			create_account_item(account,type) {
				let item = {}

				item.aa_id  = account.aa_id
				item.name   = account.name
				item.is_public    = account.is_public
				item.amount = '0.00'
				if(type == 'default') {
					item.mode = 0
				}else{
					item.mode = 1
				}
				return item
			},
			dealRefundAccounts(accounts) {
				let bid = this.bid$
				this.accounts = []
				this.dropdown_account = []
				accounts.forEach(item => {
					if(!_.isEmpty(item.bids) && item.bids.indexOf(bid) > -1 && item.is_front == 1) {
						if(item.type == 0 && item.is_default == 1) {
							this.accounts.push(this.create_account_item(item,'default'))
						}else{
							this.dropdown_account.push(this.create_account_item(item,'others'))
						}
					}
					if(_.isEmpty(item.bids) && item.is_public == 1 && item.is_front == 1) {
						this.dropdown_account.push(this.create_account_item(item,'others'))
					}
				})
			},
			hideAccount(item,index) {
				item.amount = 0

				this.dropdown_account.push(item)
				this.accounts.splice(index, 1)

				let len =  this.accounts.length
				if(len==1) {
					this.accounts[0].amount = this.cash_refund
				}
				if(len==2) {
					this.accounts[0].amount = 0
					this.accounts[1].amount = this.cash_refund
				}
			},
			showAcconut(item,index) {
				let len =  this.accounts.length
				
				if(len==0){
					item.amount = this.cash_refund
				}
				if(len==1) {
					this.accounts[0].amount = 0
					item.amount = this.cash_refund
				}

				this.dropdown_account.splice(index, 1)
				this.accounts.push(item)
			},
			setAccountAmount(amount) {
				if(this.accounts.length == 1) {
					this.accounts[0].amount = amount
				}
			},
	        clearQuery() {
				let sid = this.$route.params.sid
				if(typeof sid !== undefined) {
					this.$router.replace({path: './refund'})
				}
			},
			add_sale_role (item) {
				if(this.salesman.find(d=>d.eid==item.eid)){
					this.$Message.error('请不要重复添加')
					return false
				}
				let obj = util.copy(item)
				this.salesman.push({
					eid: obj.eid,
					sale_role_did: obj.sale_role_did
				})
			},
			del_sale_role (item) {
				let sale_role = this.salesman
				let index = sale_role.indexOf(item)
				if(index>-1){
					sale_role.splice(index,1)
				}
			},
			hook_default_salesman() {
				this.salesman = this.defaultSalesman
			}
		},
		computed: {
			// 退费总金额
			date_option() {
				var params = this.branch_params;
				return {
					disabledDate: function(date) {
						var month = params.student_refund.modify_date_months;
						var day = params.student_refund.modify_date_days;
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
			refund_amount() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						if(this.refund_mode == 0){
							if(item.refund_num > 0) {
								total = util.add(total, item.amount)
							}
						}else{
							total = util.add(total,item.amount)
						}
					})
					return util.float(total.toFixed(6))
				}else{
					return '0.00'
				}
			},
			// 退费总数量
			refund_nums() {
				let total  = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						total = util.add(total, item.refund_num)
					})
					return total
				}else{
					return 0
				}
			},
			// 总的欠交金额
			unpay_amount_all() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						total = util.add(total, item.unpay_amount)
					})
				}
				return util.float(total.toFixed(6))
			},
			// 退费的欠交金额
			unpay_amount() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						if(item.refund_num > 0) {
							total = util.add(total, item.unpay_amount)
						}
					})
					return util.float(total.toFixed(6))
				}else{
					return '0.00'
				}
			},
			// 实际退费
			cash_refund() {
				let money          = this.refund_balance_amount
				let refund_amount  = this.refund_amount
				let unpay_amount   = this.unpay_amount
				let cut_amount 	   = this.cut_amount
				let cash_amount    = 0
				if(this.orders_items.length > 0) {
					let a = util.sub(refund_amount, unpay_amount)
					let b = util.sub(a, cut_amount)
					if(this.refund_mode == 1){
						cash_amount = b
					}else{
						cash_amount = util.float(util.add(b, money).toFixed(6))
					}
					
				}else{
					cash_amount = util.float(util.sub(money, cut_amount).toFixed(6))
				}
				return cash_amount
			},
			// 扣款金额
			cut_amount() {
				let total = 0
				this.cut_items.forEach((item) => {
					total = util.add(total, item.amount)
				})
				return util.float(total.toFixed(6))
			}
		},
		watch: {
			cash_refund(val) {
				this.setAccountAmount(val)
			},
			'is_contain_good': {
				handler: function() {
					this.getItems(this.cache)
				},
				deep:true
			},
			refund_mode(val){
				this.getOrdersRefund(this.student.sid)
			},
			refund_int_month(val){
				this.getOrdersRefund(this.student.sid)
			}
		}
	}
</script>
<style lang="less">
	.box-info-query {
		padding-left: 15px !important;
		.student-info {
			margin-top: 20px;
		}
	}
	.box-goods {
		padding-bottom: 0;
		margin-bottom: 10px;
		.ivu-table-wrapper {
			min-height: 120px;
			border: 0;
		}
	}
	.box {
		.card-refund {
			min-height: 200px;
			.col-md-4, .col-sm-12 {
				padding: 0
			}
			.title {
				line-height: 30px;
				font-weight: bold;
				padding-left: 10px;
				color: #737373;
			}
			.ivu-form-item {
				margin-bottom: 0;
			}
			.ivu-dropdown .ivu-select-dropdown {
				width: 200px;
			}
			.drop-cut {
				padding-right: 0;
			}
		}
		.settle-btn {
			float: right;
			margin: 5px 15px;
			button {
				width: 100px;
				padding: 6px 15px !important;
			}
		}
	}
	.money-input {
		padding: 0;
		border: none;
		outline: none;
		border-bottom: 1px solid #ccc;
		color: #657180;
	}
	.cut-table {
		width: 100%;
		th, td {
			padding: .5rem;
   			vertical-align: middle;
   			text-align: center;
		}
		thead th {
			border-bottom: 1px solid #cfd8dc;
    	}
	}
</style>