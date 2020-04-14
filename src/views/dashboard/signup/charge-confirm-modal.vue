<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" class="charge-confirm-modal" :title="modal$.title" width="600" @on-cancel="close">
		<div class="money-wrapper">
			<div class="payment-details" v-if="account_details.length>0&&order.is_submit == 1">
				<payment-item 
					:item="item" 
					:index="index" 
					:student="student" 
					:qr-uri="qr_uri" 
					:code-pay="code_pay"
					:oid="order.oid"
					v-for="(item,index) in account_details">
				</payment-item>
			</div>
			<div class="paid-amount common">
				<template v-if="order.is_submit == 1">
					<div class="money-paid-amount">
						<span class="pay-title">实交金额：</span>
						<span class="pay-amount">{{order.money_paid_amount}}&nbsp;元</span>
						<span class="pay-status">
							(<span v-if="charge_disabled&&onlinePay" class="not-ok">待确认{{onlinePay.pay_amount}}元</span>
							<span v-else class="ok">已确认</span>)
						</span>
					</div>
					<div class="balance-paid-amount" v-if="order.balance_paid_amount>0">
						<span class="pay-title">钱包余额：</span>
						<span class="pay-amount">{{order.balance_paid_amount}}&nbsp;元</span>
						<span class="pay-status">
							(<span class="ok">已确认</span>)
						</span>
					</div>
					<div class="balance-paid-amount" v-if="order.balance_present_amount>0">
						<span class="pay-title">赠送余额：</span>
						<span class="pay-amount">{{order.balance_present_amount}}&nbsp;元</span>
						<span class="pay-status">
							(<span class="ok">已确认</span>)
						</span>
					</div>
				</template>
				<template v-else>
					<span class="pay-title">订单金额：</span>
					<span class="pay-amount">{{order.order_amount}}&nbsp;元</span>
				</template>
			</div>

			<div class="dashed"></div>
			
			<template v-if="order.is_submit == 1">
				<div class="unpay-amount common" v-if="order._is_owe == 1">
					<span class="pay-title">欠交金额：</span>
					<span class="pay-amount">{{order._owe_payment_amount}}&nbsp;元</span>
				</div>
				<div class="precharge-amount common" v-if="order._is_owe == 0 && order._pre_stored_amount > 0">
					<span class="pay-title">预存金额：</span>
					<span class="ok pay-amount">{{order._pre_stored_amount}}&nbsp;元</span>
				</div>
			</template>
			<template v-else>
				<div class="unpay-amount common">
					<span class="pay-title">下单人：</span>
					<span class="pay-amount" style="padding-left:62px;">{{student.student_name}}</span>
				</div>
			</template>	
		</div>
		<div v-if="order._is_owe == 1 && order.is_submit == 1" class="share-overdraft-wrapper clearfix">
			<p>为了准确计算课程和物品的收入，请将欠交金额分解到每个收费项目:</p>
			<ButtonGroup style="float:right;margin-bottom:5px;">
				<Button :type="active_btn == 1? 'primary': 'ghost'" size="small" @click="cacuShareOwnAmount">按比例</Button>
				<Button :type="active_btn == 2? 'primary': 'ghost'" size="small" @click="cacuMaxFirst">最小优先</Button>
				<Button :type="active_btn == 3? 'primary': 'ghost'" size="small" @click="cacuMinFirst">最大优先</Button>
			</ButtonGroup>
			<table class="goods-table">
				<thead>
					<tr>
						<th>项目名称</th>
						<th>应交金额/元</th>
						<th>欠交金额/元</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in order.items">
						<td>{{item.item_name}}</td>
						<td style="width:120px;">{{item.subtotal}}</td>
						<td style="width:120px;"><Input v-keeptwo v-model="item._share_own_amount" size="small" @on-change="customize"></Input></td>
					</tr>
				</tbody>
			</table>
			<div class="total-share-own-amount">
				<span>合计：</span>
				<span :class="isWrong">{{total_share_own_amount}}</span>
				元
			</div>
		</div>
		<div slot="footer">
			<div style="float:left;padding:6px 0 0 5px" v-if="order.is_submit == 1">
				<Checkbox v-model="info.push_to_parent">将订单推送给家长</Checkbox>
			</div>
            <Button type="ghost" @click="close">取消</Button>                                
            <Button type="primary" :loading="saving" @click="chargeConfirm" :disabled="charge_disabled">确定</Button>                
        </div>
	</Modal>
</template>
<script>
	import Vue from 'vue'
	import modalMixin from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'
	import PaymentItem from '../payment/payment-item.vue'

	export default {
		name: 'ChargeConfirmModal',
		mixins: [modalMixin,common,globals],
		components: {
			PaymentItem
		},
		props: {
			info: {
				type: Object,
				default(){
					return {}
				}
			},
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
		},
		data() {
			return {
				total_share_own_amount: 0.00, // 分解的金额总计
				active_btn: 0,
				oid: 0,
				has_online_pay:false,
				qr_uri: '',
				code_pay: 0
			}
		},
		created() {

		},
		methods: {
			// 按比例计算分解的欠款金额
			cacuShareOwnAmount() {
				this.active_btn = 1
				this.order.items.forEach((item) => {
					let unpay_item = (item.subtotal) / (this.order._total_amount - this.order.order_reduced_amount) * this.order._owe_payment_amount
					item._share_own_amount = unpay_item.toFixed(2)
				})
				this.cacuTotalShareOwnAmount()
			},
			// 按金额最大的优先分解
			cacuMaxFirst() {
				this.active_btn = 2
				this.order.items.forEach((item) => {
					item._share_own_amount = 0.00
				})
				let restItems = util.copy(this.order.items)
				let rest_unpay = this.order._owe_payment_amount
				this.cacuMaxFirstChild(restItems, rest_unpay)
			},
			// 金额最大优先分解
			cacuMaxFirstChild(restItems, rest_unpay) {
				let max = 0
				let id_max = 0
				let maxIndex = 0
				restItems.forEach((item, index) => {
					if(item.subtotal > max) {
						max = item.subtotal
						id_max = item.id
						maxIndex = index
					}
				})
				let maxItem = this.order.items.find((item) => item.id == id_max)
				if(rest_unpay <= max) {
					this.order.items.find((item) => item.id == id_max)._share_own_amount = rest_unpay.toFixed(2)
				}else{
					this.order.items.find((item) => item.id == id_max)._share_own_amount = max.toFixed(2)
					rest_unpay = rest_unpay - max
					restItems.splice(maxIndex, 1)
					this.cacuMaxFirstChild(restItems, rest_unpay)
				}
				this.cacuTotalShareOwnAmount()
			},
			// 按金额最小的优先分解
			cacuMinFirst() {
				this.active_btn = 3
				this.order.items.forEach((item) => {
					item._share_own_amount = 0.00
				})
				let restItems = util.copy(this.order.items)
				let rest_unpay = this.order._owe_payment_amount
				this.cacuMinFirstChild(restItems, rest_unpay)
			},
			// 金额最小优先分解
			cacuMinFirstChild(restItems, rest_unpay) {
				let firstItem = restItems[0]
				let min = firstItem.subtotal
				let id_min = firstItem.id
				let minIndex = 0
				restItems.forEach((item, index) => {
					if(item.subtotal < min) {
						min = item.subtotal
						id_min = item.id
						minIndex = index
					}
				})
				let minItem = this.order.items.find((item) => item.id == id_min)
				if(rest_unpay <= min) {
					this.order.items.find((item) => item.id == id_min)._share_own_amount = rest_unpay.toFixed(2)
				}else{
					this.order.items.find((item) => item.id == id_min)._share_own_amount = min.toFixed(2)
					rest_unpay = rest_unpay - min
					restItems.splice(minIndex, 1)
					this.cacuMinFirstChild(restItems, rest_unpay)
				}
				this.cacuTotalShareOwnAmount()
			},
			// 自定义输入分解的欠款金额事件
			customize() {
				this.active_btn = 0
				this.cacuTotalShareOwnAmount()
			},
			// 计算分解后的合计金额
			cacuTotalShareOwnAmount() {
				let total = 0
				this.order.items.forEach((item) => {
					if(item._share_own_amount == '') {
						item._share_own_amount = 0.00
					}
					total += parseFloat(item._share_own_amount)
					//计算paid_amount已付金额(小计金额减去分解的欠款金额)
					item.paid_amount = item.subtotal - item._share_own_amount
				})
				this.total_share_own_amount = total.toFixed(2)
				// 处理保留两位差0.01的情况
				let minus = (this.order._owe_payment_amount - this.total_share_own_amount).toFixed(2)
				if(Math.abs(minus) == 0.01) {
					// 分配给第一项
					this.order.items[0]._share_own_amount = parseFloat(this.order.items[0]._share_own_amount) + Math.round(minus*100)/100
					this.order.items[0].paid_amount = this.order.items[0].subtotal - this.order.items[0]._share_own_amount
					this.total_share_own_amount = this.order._owe_payment_amount.toFixed(2)
				}
			},
			chargeConfirm() {
				if(this.isWrong == 'wrong'&&this.order.is_submit==1) {
					this.$Message.error('分解金额总额与欠交金额不等')
					return
				}
				this.$emit('on-charge-confirm')
			},
			checkHasOnlinePay() {
				this.has_online_pay = false
				for(let i=0,l=this.order.payment.length;i<l;i++) {
					let item = this.order.payment[i]
					if(item.type==2&&item.cp_id>0&&item.pay_amount>0&&!item.pay_status) {
						this.has_online_pay = true
						let params = {}
						params.paid_amount = item.pay_amount
						params.aa_id =	item.aa_id
						params.oid = this.oid
						this.$rest('config_pays').add_url_param(item.cp_id)
						.get()
						.success(res => {
							let type = res.type
							if(type == 1) {
								this.get_wx_qr(params)
							}
							else if(type == 3) {
								params.payway = 3
								this.get_sqb_qr(params)
							}
						})
						.error(res => {
							this.$Message.error(res.body.message)
						})
						break;
					}
				}
				return this
			},
			get_sqb_qr(params) {
				this.$rest('/wxapi/sqb_pay/swipe')
				.get(params)
				.success(res => {
					this.qr_uri = res.qr_code
					this.code_pay = res.code
					this.checkOnlinePayStatus()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			get_wx_qr(params) {
				this.$rest('/wxapi/wxpay/swipe')
				.get(params)
				.success(res => {
					this.qr_uri = res.code_url
					this.code_pay = res.code
					this.checkOnlinePayStatus()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			checkOnlinePayStatus() {
				let params = {
					oid: this.oid,
					paid_amount: this.onlinePay.pay_amount
				}
				this.$rest('orders/online_payment_status')
				.get(params)
				.success(res => {
					if(res.status) {
						let wxAccont = this.order.payment.find(item => item.aa_id == this.onlinePay.aa_id)
						Vue.set(wxAccont,'opo_id',res.opo_id) 
						Vue.set(wxAccont,'pay_status',true)
					}else{
						if(this.modal$.show) {
							setTimeout(() => {
								this.checkOnlinePayStatus()
							},2000)
						}
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
					this.checkOnlinePayStatus()
				})
			}
		},
		computed: {
			account_details() {
				let details = []
				this.order.payment.forEach((item) => {
					if(item.pay_amount != 0) {
						details.push(item)
					}
				})
				return details
			},
			isWrong() {
				let minus = util.sub(this.total_share_own_amount , this.order._owe_payment_amount)
				return minus == 0 ? '' : 'wrong'
			},
			onlinePay() {
				return this.order.payment.find(item=>item.type==2&&item.cp_id>0&&item.pay_amount>0)
			},
			charge_disabled() {
				let wxAccount = this.order.payment.find(item=>item.type==2&&item.cp_id>0&&item.pay_amount>0)
				if(this.order.is_submit == 1) {
					if(wxAccount) {
						if(wxAccount.pay_status) {
							return false
						}else{
							return true
						}
					}else{
						return false
					}
				}else{
					return false
				}
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(!val) {
					this.qr_uri = ''
					this.code_pay = 0
				} 
			}
		}
	}
</script>
<style lang="less">
.charge-confirm-modal {
	.ivu-modal-body {
	    max-height: 500px;
    	overflow: auto;
	}
	.money-wrapper {
		.common {
			line-height: 50px;
			font-size: 20px;
			padding-left: 20px;
			.pay-amount {
				padding-left: 40px;
			}
		}
		.payment-details {
			font-size: 12px;
			padding: 0 20px;
			border: 1px solid #d7dde4;
			.payment-item {
				padding: 5px 0;
				border-bottom: 1px solid #ddd;
				.name {
					padding-right: 20px;
				}
				.wx-desc {
					padding-left: 22px;
    				padding-top: 6px;
				}
				&:last-child {
					border-bottom: none;
				}
				.pay-success {
					.money {
						color: #000;
						font-size: 18px;
						font-weight: 700;
					}
				}
				.printarea {
					position: relative;
					.code-pay {
						position: absolute;
						top: 50px;
						right: 2px;
						>p {
							margin-bottom: 5px;
						}
						.code-item {
							color: #152127;
							font-size: 28px;
							font-weight: 700;
							padding: 2px 10px;
							border: 1px solid #5b6a71;
							margin-left: -1px;
						}
					}
				}
			}
		}
		.paid-amount {
			.pay-amount {
				color: #2db7f5;
			}
			.pay-status {
				color: #657180;
			}
		}
		.unpay-amount {
			.pay-amount {
				color: #ed3f14;
			}
		}
		.ok {
			color: #19be6b;
		}
		.not-ok {
			color: #ff3300;
		}
	}
	.share-overdraft-wrapper {
		padding: 10px;
		p {
			font-size: 10px;
			color: #737373;
		}
		.table {
			margin-top: 5px;
			margin-bottom: 5px !important;
			th {
				padding: 8px;
			}
		}
		.total-share-own-amount {
			float: right;
			margin-right: 12px;
			.wrong {
				color: #ed3f14;
			}
		}
	}
}
</style>