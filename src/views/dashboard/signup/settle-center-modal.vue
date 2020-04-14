<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900" @on-cancel="close">
			<div class="content">
				<div class="field-goods clearfix">
					<table class="goods-table">
						<thead>
							<tr>
								<th>项目名称</th>
								<th>原单价</th>
								<th>折扣%</th>
								<th>折后单价</th>
								<th>金额</th>
								<th>总数</th>
								<th>直减分摊</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in order.items">
								<td>
									{{item.item_name}}
									<span v-if="item.cid&&item.lid">
										({{item._class_name}})
									</span>
								</td>
								<td>{{label_currency}}{{item.origin_price}}</td>
								<td>{{item._discount_rate}}</td>
								<td>{{label_currency}}{{item.price}}</td>
								<td>{{label_currency}}{{(item.origin_amount - item.discount_amount).toFixed(2)}}</td>
								<td>{{item.nums+item.present_lesson_hours}}</td>
								<td style="width:80px;"><Checkbox v-model="item._is_average"></Checkbox></td>
							</tr>
						</tbody>
					</table>
					<div class="summation">
						<span>课程：{{label_currency}}{{order._lessons_amount.toFixed(2)}}</span>
						<span>物品：{{label_currency}}{{order._article_amount.toFixed(2)}}</span>
						<span>合计：{{label_currency}}{{order._total_amount.toFixed(2)}}</span>
					</div>
				</div>
				<div class="field-settle">
					<div class="field-title">结算</div>
					<div class="field-content clearfix">
						<Form ref="modal_settle" clearable="true" :label-width="120" :modal="order">
							<Form-item prop="order_discount_amount" label="直减金额：">
								<Input 
									v-keeptwo
									v-model="order.order_reduced_amount" 
									style="width:250px;" 
									size="small" 
									@on-blur="checkOrderDiscountAmount"
									@on-change="orderDiscountAmoutChange">
								</Input>
							</Form-item>
							<Form-item prop="money" label="冲减电子钱包：">
								<Input
									v-keeptwo
									v-model="order.balance_paid_amount" 
									size="small" 
									style="width: 250px;" 
									@on-blur="checkMoneyBalance"
									@on-change="balancePayAmountChange">
								</Input>
								<span>余额：{{label_currency}}{{student.money}}</span>
							</Form-item>

							<Form-item prop="present_money" label="冲减赠送金额：">
								<Input
									v-keeptwo
									v-model="order.balance_present_amount" 
									size="small" 
									style="width: 250px;" 
									@on-blur="checkPresentMoneyBalance"
									@on-change="balancePayAmountChange">
								</Input>
								<span>余额：{{label_currency}}{{student.present_money}}</span>
							</Form-item>

						</Form>
						<div class="payment">
							<span>
								应交金额：
								{{label_currency}}
								{{order.money_pay_amount}}
							</span>
							<span>
								实交金额：
								<Input 
									v-keeptwo
									v-model="money_paid_amount" 
									:min="0" 
									size="small" 
									style="width: 60px;" 
									@on-change="moneyPaidChange">
								</Input>
							</span>
							<span v-if="order._is_owe == 0" style="color:#19be6b;">
								预存：
								{{label_currency}}
								{{order._pre_stored_amount.toFixed(2)}}
							</span>
							<span v-else style="color:#ed3f14;">
								欠交：
								{{label_currency}}
								{{order._owe_payment_amount.toFixed(2)}}
							</span>
						</div>
					</div>
				</div>
				<div class="field-account">
					<div class="field-title">收款账户
						<span v-if="diff_pay_amount < 0" style="color:#2db7f5;padding:15px;">
							<Icon type="checkmark"></Icon>
							&nbsp;还差
							{{label_currency}}
							{{Math.abs(diff_pay_amount).toFixed(2)}}
						</span>
						<span v-else-if="diff_pay_amount > 0" style="color:#f90;padding:15px;">
							<Icon type="alert"></Icon>
							&nbsp;超额
							{{label_currency}}
							{{diff_pay_amount.toFixed(2)}}
						</span>
					</div>
					<div class="field-content clearfix">
						<Form ref="model_account" clearable="true" :label-width="120">
							<div class="account" v-for="(item,index) in order.payment">
								<Form-item :label="item.name+'：'">
									<Input 
										v-keeptwo 
										v-model="item.pay_amount" 
										style="width:250px;" 
										size="small"
										:disabled="!!item.opo_id"
										>
									</Input>
									<Button 
										type="ghost" 
										shape="circle" 
										icon="ios-trash" 
										size="small" 
										v-if="item.mode!==0"
										:disabled="!!item.opo_id" 
										@click="hideAccount(item,index)">
									</Button>
								</Form-item>
							</div>
						</Form>
						<div v-if="order.payment.length == 0">请选择收款账户</div>
						<div class="filter-account">
							<Dropdown>
								<a href="javascript:void(0)">
									其他收款账户
									<Icon type="chevron-down"></Icon>
								</a>
								<DropdownMenu slot="list">
									<DropdownItem v-for="(item,index) in order._dropdown_account">
										<div @click="showAcconut(item,index)">
											{{item.name}}
											<Tag color="blue" type="border" v-if="item.is_public == 1">公</Tag>
										</div>
									</DropdownItem>
									<DropdownItem v-if="order._dropdown_account.length == 0" style="color:#c3cbd6;">已显示全部账户</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
					</div>
				</div>
				<Row style="background: #f5f5f5;padding-bottom: 10px">
					<Col span="12">
						<div class="field-per">
							<div class="field-title">业绩归属</div>
							<table-performance 
								:saleman="info.saleman" 
								:lesson-amount="Number(order.money_paid_amount)"
								:lesson-hour="total_lesson_hours"
								>
							</table-performance>
						</div>
					</Col>
					<Col span="12">
						<div class="field-other">
							<div class="field-title">其他信息</div>
							<div class="field-content">
								<Form ref="modal_other" clearable="true" :label-width="80">
									<Form-item label="收据号：" v-if="enable_user_receipt_no">
										<Input v-model="order.user_receipt_no" size="small" style="width: 320px;"></Input>
									</Form-item>
									<Form-item prop="paid_time" label="缴费日期：">
										<DatePicker
											:value="order.pay_time"
											@on-change="order.pay_time = $event"
											placeholder="不限" 
											style="width: 120px"
											>
										</DatePicker>
									</Form-item>
									<Form-item label="备注：" class="mb-0">
										<Input v-model="order.remark" size="small" style="width: 320px;"></Input>
									</Form-item>
								</Form>
							</div>
						</div>
					</Col>
				</Row>
			</div>
			<div slot="footer" class="clearfix">
				<div style="float:left;padding:6px 0 0 5px">
					<Checkbox v-model="info.save_template" @on-change="saveTplChange">存为模板</Checkbox>
					<div style="display:inline-block" v-if="info.save_template">
						<span>模板名称：</span>
						<Input type="text" v-model="info.template_name" size="small" style="width:150px;"></Input>
					</div>
				</div>
                <Button 
                	type="info" 
                	@click="saveOrder" 
                	style="width:100px;" 
                	:disabled="oid>0&&!enable_modify_saved_order" 
                	v-if="order._submit == 1"
                	v-per="'order.save'"
                	>
	                {{save_order_text}}
	            </Button>
                <Button 
                	type="primary" 
                	id="save_btn" 
                	@click="signupConfirm" 
                	style="width:100px;" 
                	:loading="saving"
                	v-per="'order.submit'"
                	>
	                {{confirm_order_text}}
	            </Button>                
            </div>
            <charge-confirm-modal 
            	ref="chargeConfirmModal" 
            	:order="order" 
            	:student="student" 
            	:info="info"
            	@on-charge-confirm="chargeConfirm" 
            	@on-close="closeChargeModal">
        	</charge-confirm-modal>
		</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import ChargeConfirmModal from './charge-confirm-modal.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import TablePerformance from './table-performance.vue'

	const emptyInfo = {
		save_template:false,
		template_name:'',
		push_to_parent:false,
		saleman: []
	}

	export default {
		name: 'SettleCenterModal',
		mixins: [modal,common,globals],
		components: {
			ChargeConfirmModal,
			SelectEmployee,
			TablePerformance
		},
		props: {
			order: {
				type: Object,
				default(){
					return {}
				}
			},
			student: {
				type: Object,
				default() {
					return {}
				}
			},
			salesman: {
				type: Array,
				default() {
					return []
				}
			}
		},
		data() {
			return {
				info: util.copy(emptyInfo),
				dropdown_account: [],
				oid: 0,
				money_paid_amount:''				
			}
		},
		methods: {
			hideAccount(item,index) {
				item.pay_amount = 0

				this.order._dropdown_account.push(item)
				this.order.payment.splice(index, 1)

				let len =  this.order.payment.length
				if(len==1) {
					this.order.payment[0].pay_amount = this.order.money_paid_amount
				}
				if(len==2) {
					this.order.payment[0].pay_amount = 0
					this.order.payment[1].pay_amount = this.order.money_paid_amount
				}
			},
			showAcconut(item,index) {
				let len =  this.order.payment.length
				
				if(item.type==2&&item.cp_id>0) {
					let cp_account = this.order.payment.find(i=>i.type==2&&i.cp_id>0)
					if(cp_account) {
						this.$Message.error('只能选择一种在线支付方式')
						return false
					}
					item.pay_status = false
				}

				if(len==0){
					item.pay_amount = this.order.money_paid_amount
				}
				if(len==1) {
					this.order.payment[0].pay_amount = 0
					item.pay_amount = this.order.money_paid_amount
				}

				this.order._dropdown_account.splice(index, 1)
				this.order.payment.push(item)
			},
			// 校验直减金额
			checkOrderDiscountAmount() {
				if(this.order._total_amount - this.order.order_reduced_amount < 0) {
					this.$Message.error('直减金额不能大于合计金额')
					return false
				}
				return true
			},


			// 直减金额改变
			orderDiscountAmoutChange() {
				let minus = this.order._total_amount - this.order.order_reduced_amount
				let a = this.order._total_amount

				if(this.student.money >= 0) {
					a = util.sub(a,this.student.money)
				}

				if(a < this.order.order_reduced_amount) { // 冲减金额变动的零界点
					if(minus < 0) { // 如果直减优惠大于合计金额
						this.order.balance_paid_amount = 0.00
						this.order.balance_present_amount = 0.00
					}else{
						this.order.balance_paid_amount = (this.order._total_amount - this.order.order_reduced_amount).toFixed(2)
						this.order.balance_present_amount = (this.order._total_amount - this.order.balance_paid_amount - this.order.order_reduced_amount).toFixed(2)
					}
					this.order.money_pay_amount = this.order.money_paid_amount = 0.00
					this.money_paid_amount = 0.00
					if(this.order.payment.length == 1) {
						this.order.payment[0].pay_amount = 0.00
					}
				}else{
					
					if(this.student.money >= 0) {
						this.order.balance_paid_amount = this.student.money
					}
					
		        	this.order.money_pay_amount = (this.order._total_amount - this.order.order_reduced_amount - this.order.balance_paid_amount - this.order.balance_present_amount).toFixed(2) // 现金付款金额=应交金额
		        	this.money_paid_amount = this.order.money_pay_amount // 实交金额
					if(this.order.payment.length == 1) {
						this.order.payment[0].pay_amount = this.order.money_pay_amount
					}
				}
				this.order._is_owe = 0
				this.order._pre_stored_amount = 0
				this.order._owe_payment_amount = 0
				this.moneyPaidChange()
			},
			// 校验电子钱包余额
			checkPresentMoneyBalance() {
				if(this.student.money > this.order.balance_paid_amount){
					this.$Message.error('优先使用电子钱包余额')
					return false
				}
				if(this.student.present_money >= 0) {
					if(this.order.balance_present_amount - this.student.present_money > 0) {
						this.$Message.error('冲减金额不能大于学员的赠送余额')
						return false
					}
				}else{
					if(this.order.balance_present_amount > 0) {
						this.$Message.error('学员的赠送余额为负数')
						return false
					}
				}
				return true
			},
			checkMoneyBalance() {
				if(this.student.money >= 0) {
					if(this.order.balance_paid_amount - this.student.money > 0) {
						this.$Message.error('冲减金额不能大于学员的电子钱包余额')
						return false
					}
				}else{
					if(this.order.balance_paid_amount > 0) {
						this.$Message.error('学员的电子钱包余额为负数')
						return false
					}
				}
				return true
			},
			// 检查收款账户
			checkPayment() {
				if(/^\s*$/.test(this.money_paid_amount)){
					this.$Message.error('请输入收款金额')
					return false
				}
				if(this.order.payment.length == 0) {
					this.$Message.error('请添加收款账户')
					return false
				}
				return true
			},
			// 校验收款账户总金额与实交金额不等
			checkDiffPayAmount() {
				if(parseFloat(this.diff_pay_amount) !== 0) {
					this.$Message.error('收款账户总金额与实交金额不等')
					return false
				}
				return true
			},
			// 校验实交金额与应交金额不一致，不能保存订单
			checkMoneyPayAmount() {
				if(this.order.money_paid_amount != this.order.money_pay_amount) {
					this.$Message.error('实交金额与应交金额不一致，不能保存订单')
					return false
				}
				return true
			},
			// 校验模板名
			checkTplName() {
				if(this.info.save_template&&this.info.template_name ==='') {
					this.$Message.error('模板名称不能为空')
					return false
				}
				return true
			},
			// 冲减电子钱包金额改变
			balancePayAmountChange() {
				let b = parseFloat(this.order.balance_paid_amount) + parseFloat(this.order.balance_present_amount) + parseFloat(this.order.order_reduced_amount) - parseFloat(this.order._total_amount)
				if(b > 0) {
					this.order.money_pay_amount = this.order.money_paid_amount = 0.00
					if(this.order.payment.length == 1) {
						this.order.payment[0].pay_amount = 0.00
					}
				}else{
					this.order.money_pay_amount = (this.order._total_amount - this.order.order_reduced_amount - this.order.balance_paid_amount - this.order.balance_present_amount).toFixed(2) // 现金付款金额=应交金额
		        	this.order.money_paid_amount = this.order.money_pay_amount // 实交金额
		        	if(this.order.payment.length == 1) {
						this.order.payment[0].pay_amount = this.order.money_pay_amount
					}
				}
				this.order._is_owe = 0
				this.order._pre_stored_amount = 0
				this.order._owe_payment_amount = 0
			},
			moneyPaidChange() {
				if(this.money_paid_amount == '' || !/^[\d.]+$/.test(this.money_paid_amount)){
					this.order.money_paid_amount = 0
				}else{
					this.order.money_paid_amount = util.float(this.money_paid_amount)
				}
				this.moneyChange()
			},
			// 实交金额改变
			moneyChange() {
				let minus = util.sub(this.order.money_paid_amount, this.order.money_pay_amount)
				if(minus >= 0) {
					this.order._is_owe = 0
					this.order._pre_stored_amount = minus
					this.order._owe_payment_amount = 0
				}else{
					this.order._is_owe = 1
					this.order._pre_stored_amount = 0
					this.order._owe_payment_amount = -minus
				}
				if(this.order.payment.length == 1) {
					this.order.payment[0].pay_amount = this.order.money_paid_amount
				}
			},
			saveOrder() {
				if(!this.checkOrderDiscountAmount()) {
					return
				}
				if(!this.checkMoneyBalance()) {
					return
				}
				if(!this.checkPresentMoneyBalance()) {
					return
				}
				if(!this.checkPayment()) {
					return
				}
				if(!this.checkDiffPayAmount()) {
					return
				}
				// if(!this.checkMoneyPayAmount()) {
				// 	return
				// }
				if(!this.cacuShareDiscountMount()) {
					return
				}
				if(!this.checkTplName()) {
					return
				}
				this.order.is_submit = 0
				this.order.paid_amount = 0
				// this.order.balance_paid_amount = 0
				// this.order.money_paid_amount = 0
				this.order.order_amount = util.sub(this.order._total_amount, this.order.order_reduced_amount)
				// this.setAmount()
				this.$r('chargeConfirmModal').show('订单确认', 'save')
			},
			signupConfirm() {
				if(!this.checkOrderDiscountAmount()) {
					return
				}
				if(!this.checkMoneyBalance()) {
					return
				}
				if(!this.checkPayment()) {
					return
				}
				if(!this.checkDiffPayAmount()) {
					return
				}
				if(!this.cacuShareDiscountMount()) {
					return
				}
				if(!this.checkTplName()) {
					return
				}
				this.order.is_submit = 1
				this.order.order_amount = util.sub(this.order._total_amount, this.order.order_reduced_amount)
				this.order.paid_amount = parseFloat(this.order.money_paid_amount) + parseFloat(this.order.balance_paid_amount)  + parseFloat(this.order.balance_present_amount)
				// if(this.order.paid_amount == 0 && this.order.money_pay_amount > 0) {
				// 	this.$Message.error('应交金额大于0时实交金额不能为0')
				// 	return
				// }
				// this.setAmount()
				if(this.order._is_owe == 1) {
					this.$r('chargeConfirmModal').cacuShareOwnAmount()
				}else{
					this.order.items.forEach((item) => {
						//计算paid_amount已付金额(没有欠交就等于小计金额)
						item.paid_amount = item.subtotal
					})
				}

				// 重复保存订单
				if(this.oid > 0) {
					if(this.order._submit == 0) {
						this.$Notice.info({title: '订单已保存',desc: '请确认支付'})
						this.$r('chargeConfirmModal').set('oid',this.oid).checkHasOnlinePay().show('收费确认', 'charge')
					}else{
						this.saveBeforeCharge(this.info,'edit')
					} 
				}else{
					this.saveBeforeCharge(this.info,'add')
				}
				document.getElementById('save_btn').blur()
			},
			// 支付订单前保存订单
			saveBeforeCharge(info,action) {
				let orderSave = util.copy(this.order),
					params = {}
				orderSave.is_submit = 0
				orderSave.paid_amount = 0
				orderSave.balance_paid_amount = 0
				orderSave.balance_present_amount = 0
				orderSave.money_paid_amount = 0

				orderSave.items.forEach(item => {
					item.paid_amount = 0
				})

				params.order = orderSave
				params.salesman = this.info.saleman
				
				if(this.student.sid>0) {
					params.student = {sid: this.student.sid}
				}else{
					params.student = this.student
				}

				this.$rest('orders').post(params)
				.success(res => {
					this.oid = parseInt(res.data.oid)
					this.order.oid = parseInt(res.data.oid)
					for(let i=0,len=res.data.items.length;i<len;i++) {
						this.order.items[i].oi_id = res.data.items[i].oi_id
					}
					this.$Notice.success({title: '订单保存成功',desc: '请确认支付'})
					this.$r('chargeConfirmModal').set('oid',res.data.oid).checkHasOnlinePay().show('收费确认', 'charge')
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			// 计算每一项的直减分摊金额
			cacuShareDiscountMount() {
				// 参与分摊的总计金额
				let reduced = this.order.order_reduced_amount
				if(reduced != 0) {
					let total = 0
					this.order.items.forEach((item) => {
						if(item._is_average) {
							total += item.origin_amount - item.discount_amount
						}
					})
					let minus = reduced - total
					if(minus > 0) {
						this.$Message.error('直减优惠还有' + minus + '元未分摊到购买项目')
						return false
					}
					let total_reduced = 0
					this.order.items.forEach((item) => {
						if(item._is_average) {
							// 计算分摊的优惠金额
							item.reduced_amount = ((item.origin_amount - item.discount_amount) / total * reduced).toFixed(2)
						}else{
							item.reduced_amount = 0
						}
						// 计算orderItem小计金额subtotal
						item.subtotal = item.origin_amount - item.discount_amount - item.reduced_amount
						total_reduced += Number(item.reduced_amount)
					})
					/*// 处理保留两位差0.01的情况
					let a = this.order.order_reduced_amount - total_reduced
					if(a > 0) {
						// 分配给分摊中的第一项
						let firstAverageItem = this.order.items.find((item)=>item._is_average==true)
						this.order.items.find((item)=>item._is_average==true).reduced_amount = Number(firstAverageItem.reduced_amount) + Number(a.toFixed(2))
						this.order.items.find((item)=>item._is_average==true).subtotal = firstAverageItem.origin_amount - firstAverageItem.discount_amount - firstAverageItem.reduced_amount
					}*/
				}else{
					this.order.items.forEach((item) => {
						item.reduced_amount = 0.00
						// 计算orderItem小计金额subtotal
						item.subtotal = item.origin_amount - item.discount_amount
					})
				}
				return true
			},
			// 不存为模板时模板名置为空
			saveTplChange(value) {
				if(!value) {
					this.template_name = ''
				}
			},
			chargeConfirm() {
				this.$emit('on-charge-confirm', this.info)
				this.info = util.copy(emptyInfo)
			},
			closeChargeModal() {
				this.$r('chargeConfirmModal').active_btn = 0
			},
			add_sale_role (item) {
				if(this.info.saleman.find(d=>d.eid==item.eid)){
					this.$Message.error('请不要重复添加')
					return false
				}
				let obj = util.copy(item)
				this.info.saleman.push({
					eid: obj.eid,
					sale_role_did: obj.sale_role_did
				})
			},
			del_sale_role (item) {
				let sale_role = this.info.saleman
				let index = sale_role.indexOf(item)
				if(index>-1){
					sale_role.splice(index,1)
				}
			},
			setAmount() {
				this.info.saleman.forEach((item) => {
					item.amount = this.order.order_amount
				})
			},
			closeModal() {
				this.$r('chargeConfirmModal').close()
				this.close()
			},
			dealSalesman() {
				this.info.saleman.forEach(s => {
					s.amount = Number(this.order.money_paid_amount)
					if(this.enable_er_lesson_hour) {
						s.lesson_hour = this.total_lesson_hours
					}
				})
			},
			init_default_pay_amount() {
				if(this.default_pay_amount == 1){
					this.money_paid_amount = this.order.money_paid_amount
				}else{
					this.money_paid_amount = ''
				}
				this.moneyPaidChange()
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(!val) {
					this.oid = 0
					this.info.saleman.splice(0)
					delete this.order.oid
				}else{
					if(this.salesman.length>0) {
						this.info.saleman = this.info.saleman.concat(this.salesman)
					}
					this.dealSalesman()
					this.init_default_pay_amount()
				}

			}
		},
		computed: {
			diff_pay_amount() {
				let total_payment_amount = 0
				this.order.payment.forEach((item) => {
					total_payment_amount = util.add(total_payment_amount,item.pay_amount)
				})
				return util.sub(total_payment_amount,this.order.money_paid_amount)
			},
			total_lesson_hours() {
				let total = 0
				this.order.items.forEach(item => {
					if(item.gtype===0 && item.nums_unit===2) {
						total += item.nums
					}
				})
				return total
			},
			default_pay_amount() {
				let dpa = this.$store.state.gvars.configs.params.student_signup.default_pay_amount || 0
				return dpa
			},
			save_order_text() {
				return this.$store.state.gvars.configs.params.student_signup.save_order_text || '保存订单'
			},
			confirm_order_text() {
				return this.$store.state.gvars.configs.params.student_signup.confirm_order_text || '确认'
			}
		}
	}
</script>
<style lang="less" scoped>
	.summation,.payment,.filter-account {
		float: right;
		padding-bottom: 15px;
		padding-right: 10px;
		span {
			margin-left: 20px;
		}
	}
	.field-title {
		line-height: 30px;
		font-weight: bold;
		padding-left: 10px;
		background-color: #c7e3ff;
		color: #356fbe;
	}
	.field-content {
		background-color: #f7f7f7;
		padding-top: 15px;
		padding-left: 20px;
	}
	.field-settle {
		.ivu-form-item {
			margin-bottom: 0;
		}
		span {
			vertical-align: middle;
		}
	}
	.account,.field-other {
		.ivu-form-item {
			margin-bottom: 0 !important;
		}
	}
</style>