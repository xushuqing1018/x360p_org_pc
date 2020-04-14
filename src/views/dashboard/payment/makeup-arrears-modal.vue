<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900" @on-cancel="close">
		<div class="content">
			<div class="field-goods clearfix">
				<table class="goods-table">
					<thead>
						<tr>
							<th width="150px">订单编号</th>
							<th width="120px">缴费日期</th>
							<th>欠交项目</th>
							<th width="120px">应交金额/元</th>
							<th width="120px">欠交金额/元</th>
							<th width="120px">补交金额/元</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in items" :class="item.line == 'even' ? 'table-tr-even': 'table-tr-odd'">
							<td>
								<template v-if="item.first">{{item.order_no}}</template>
							</td>
							<td>
								<template v-if="item.first">{{item.paid_time}}</template>
							</td>
							<td>
								{{item.item_name}}
								
							</td>
							<td>{{item.subtotal}}</td>
							<td>{{item._own_share_amount}}</td>
							<td>
								<Input 
									v-keeptwo
									v-model="item.paid_amount" 
									size="small" 
									style="width: 70px;"
									@on-change="paidAmountChange"
									@on-blur="checkPaidAmount">
								</Input>
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td colspan="3" class="text-right">合计</td>
							<td>{{label_currency}}{{total_amonut.toFixed(2)}}</td>
							<td>{{label_currency}}{{total_own_amount.toFixed(2)}}</td>
							<td>{{label_currency}}{{total_re_amount.toFixed(2)}}</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div class="field-settle">
				<div class="field-title">结算</div>
				<div class="field-content clearfix">
					<Form ref="modal_settle" clearable="true" :label-width="120" :modal="order">
						<Form-item prop="money" label="冲减电子钱包：">
							<Input
								v-keeptwo
								v-model="order.balance_paid_amount" 
								size="small" 
								style="width: 250px;" 
								@on-blur="checkMoneyBalance"
								@on-change="balancePaidAmountChange">
							</Input>
							<span>余额：{{label_currency}}{{student.money}}</span>
						</Form-item>
						<Form-item prop="" label="实交金额：">
							<Input 
								v-keeptwo
								v-model="order.money_paid_amount" 
								size="small" 
								readonly
								style="width: 250px;">
							</Input>
						</Form-item>
					</Form>
				</div>
			</div>
			<div class="field-account">
				<div class="field-title">收款账户
					<span v-if="is_over == 2" style="color:#2db7f5;padding:15px;">
						<Icon type="checkmark"></Icon>
						&nbsp;还差
						{{label_currency}}
						{{diff_pay_amount.toFixed(2)}}
					</span>
					<span v-else-if="is_over == 1" style="color:#f90;padding:15px;">
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
									:disabled="!!item.opo_id">
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
					<div v-if="order.payment.length == 0">暂无默认现金账户，请选择其他账户</div>
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
			<div class="field-other">
				<div class="field-title">其他信息</div>
				<div class="field-content">
					<Form ref="modal_other" clearable="true" :label-width="120" :modal="order">
						<Form-item prop="paid_time" label="日期：">
							<DatePicker
								 :value="order.paid_time"
					        	 @on-change="order.paid_time = $event"
								 placeholder="不限" 
								 style="width: 120px"
								 >
						  	</DatePicker>
						</Form-item>
						<Form-item prop="remark" label="备注：">
							<Input v-model="order.remark" size="small" style="width: 500px;"></Input>
						</Form-item>
					</Form>
				</div>
			</div>
		</div>
		<div slot="footer" class="clearfix">
            <Button type="ghost" @click="close">取消</Button>                                
            <Button type="primary" @click="chargeMakeup">确定</Button>                
        </div>
        <makeup-arrears-confirm
        	ref="makeupArrearsConfirm"
        	:order="order"
        	:student="student"
        	@on-makeup-confirm="makeupConfirm"
        	>
        </makeup-arrears-confirm>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import pay from '../mixin/pay.mixin'
	import util,{_} from '@/libs/util'
	import MakeupArrearsConfirm from './makeup-arrears-confirm.vue'

	export default {
		name: 'SettleCenterModal',
		mixins: [modal,common,globals,pay],
		components: {
			MakeupArrearsConfirm
		},
		props: {
			items: {
				type: Array,
				default(){
					return []
				}
			},
			student: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				diff_pay_amount: 0.00, 		   // 订单结算时收款账户与实交金额的差值
				order: {
					remark: '',				   // 备注
					payment: [],			   // 收款账户
					_dropdown_account: [],
					balance_paid_amount: 0.00, // 所有订单的电子冲减
					money_paid_amount: 0.00,   // 所有订单的现金支付金额
					remain_own_amount: 0.00,   // 剩余欠交金额
					paid_time: moment().format('YYYY-MM-DD')		//补交日期
				},
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
			// 弹出前计算
			cacuData() {
				this.dealAccounts(this.accounts$)
				if(this.total_re_amount >= this.student.money) {
					this.order.balance_paid_amount = this.student.money
				}else{
					this.order.balance_paid_amount = this.total_re_amount
				}
				this.order.money_paid_amount = (this.total_re_amount - this.order.balance_paid_amount).toFixed(2)
				if(this.order.payment.length == 1) {
					this.order.payment[0].pay_amount = this.order.money_paid_amount
				}
			},
			// 补交金额改变
			paidAmountChange() {
				if(this.student.money > 0 && this.student.money > this.total_re_amount) {
					this.order.balance_paid_amount = this.total_re_amount
					this.order.money_paid_amount = 0
				}else{
					this.order.balance_paid_amount = this.student.money
					this.order.money_paid_amount = (this.total_re_amount - this.student.money).toFixed(2)
				}
				if(this.order.payment.length == 1) {
					this.order.payment[0].pay_amount = this.order.money_paid_amount
				}
			},
			// 校验补交金额与欠交金额
			checkPaidAmount() {
				if(this.total_re_amount == 0) {
					this.$Message.error("补交金额不能为0")
					return false
				}
				if(this.total_re_amount > this.total_own_amount) {
					this.$Message.error("补交金额不能大于欠交金额")
					return false
				}
				return true
			},
			// 检查收款账户
			checkPayment() {
				if(this.order.payment.length == 0) {
					this.$Message.error('请添加收款账户')
					return false
				}
				return true
			},
			// 校验电子钱包余额
			checkMoneyBalance() {
				if(this.order.balance_paid_amount - this.student.money > 0) {
					this.$Message.error("冲减金额不能大于学员的电子钱包余额")
					return false
				}
				if(this.order.balance_paid_amount > this.total_re_amount) {
					this.$Message.error("冲减金额不能大于补交金额")
					return false
				}
				return true
			},
			// 校验收款账户总金额与实交金额不等
			checkDiffPayAmount() {
				if(this.diff_pay_amount !== 0) {
					this.$Message.error('收款账户总金额与实交金额不等')
					return false
				}
				return true
			},
			// 冲减电子钱包金额改变
			balancePaidAmountChange() {
				if(this.order.balance_paid_amount >= this.total_re_amount) {
					this.order.money_paid_amount = 0
				}else{
					this.order.money_paid_amount = this.total_re_amount - this.order.balance_paid_amount
				}
				if(this.order.payment.length == 1) {
					this.order.payment[0].pay_amount = this.order.money_paid_amount
				}
			},
			chargeMakeup() {
				if(!this.checkPaidAmount()) {
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
				// 计算item的钱包余额付款金额和现金付款金额
				let balance_total = 0, minus = 0,remain_own_amount = 0.00
				this.items.forEach((item) => {
					item.balance_paid_amount = Math.round((item.paid_amount / this.total_re_amount) * this.order.balance_paid_amount*100) / 100
					balance_total = util.add(balance_total, item.balance_paid_amount)
				})
				// 处理item的balance保留两位四舍五入相差0.01的情况
				minus = util.sub(this.order.balance_paid_amount, balance_total).toFixed(2)
				if(Math.abs(minus) == 0.01) {
					// 0.01分配给第一项
					this.items[0].balance_paid_amount = this.items[0].balance_paid_amount + parseFloat(minus)
				}
				this.items.forEach((item) => {
					item.money_paid_amount = Math.round((item.paid_amount - item.balance_paid_amount)*100) / 100
					remain_own_amount += util.sub(item._own_share_amount,item.paid_amount)
				})
				// 计算剩余欠交金额
				this.order.remain_own_amount = remain_own_amount
				this.$r('makeupArrearsConfirm').set('oid',this.items[0].oid)
				.checkHasWXPay().show('补交确认','makeupConfirm')
			},
			// 未支付订单重新确认设置在线支付账户(如果有,理论上只有一个)
			setOnlineAccount(data) {
				let	onlineAccount = this.order._dropdown_account.find(a=>a.aa_id==data.aa_id),
					onlineIndex   = this.order._dropdown_account.findIndex(a=>a.aa_id==data.aa_id)
				onlineAccount.pay_amount 	= data.paid_amount
				onlineAccount.opo_id 		= data.opo_id
				onlineAccount.pay_status 	= true
				console.log(this.order._dropdown_account)
				this.order._dropdown_account.splice(onlineIndex,1)
				this.order.payment.push(onlineAccount)
			},
			// 确认补交欠款
			makeupConfirm() {
				let copy_payment,params
				copy_payment = this.order.payment.filter(item => item.pay_amount>0)
				params = {
					sid: this.student.sid,
					items: this.items,
					remark: this.order.remark,
					payment: copy_payment,
					paid_time: this.order.paid_time
				}
				this.$rest('orders/do_supplement')
				.post(params)
				.success(response => {
					this.close()
					this.$emit('on-makeup-success')
					this.$Modal.confirm({
	                    title: '提示',
	                    content: '<p>补交成功，是否打印收据？</p>',
	                    onOk: () => {
	                    	this.dr().refreshData('orders/'+this.items[0].oid)
							this.print(1,response.data.orb_id)
	                    },
	                    onCancel: () => {
	                        // todo
	                    }
	                });
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			dealAccounts(accounts) {
				let bid = this.bid$
				let items = []
				this.order.payment = []
				this.order._dropdown_account = []
				accounts.forEach(item => {
					if(!_.isEmpty(item.bids) && item.bids.indexOf(bid) > -1 && item.is_front == 1) {
						if(item.type == 0 && item.is_default == 1) {
							this.order.payment.push(this.create_account_item(item,'default'))
						}else{
							this.order._dropdown_account.push(this.create_account_item(item,'others'))
						}
					}
					if(_.isEmpty(item.bids) && item.is_public == 1 && item.is_front == 1) {
						this.order._dropdown_account.push(this.create_account_item(item,'others'))
					}
				})
			}
		},
		computed: {
			is_over() {
				let total_payment_amount = 0
				this.order.payment.forEach((item) => {
					total_payment_amount += Number(item.pay_amount)
				})
				let minus = total_payment_amount - this.order.money_paid_amount
				this.diff_pay_amount = Math.abs(minus)
				if(minus < 0) {
					return 2
				}else if(minus > 0) {
					return 1
				}
			},
			// 合计应交金额
			total_amonut() {
				let total = 0
				this.items.forEach((item) => {
					total += Number(item.subtotal)
				})
				return Math.round(total*100)/100
			},
			// 合计欠交金额
			total_own_amount() {
				let total = 0
				this.items.forEach((item) => {
					total += Number(item._own_share_amount)
				})
				return Math.round(total*100)/100
			},
			// 合计补交金额
			total_re_amount() {
				let total = 0
				this.items.forEach((item) => {
					total += Number(item.paid_amount)
				})
				return Math.round(total*100)/100
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
	.field-account .field-content {
		padding-bottom: 8px;
	}
	.active{
		color: #39f;
	}
</style>