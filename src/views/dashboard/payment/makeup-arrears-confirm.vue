<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" class="charge-confirm-modal" :title="modal$.title" width="600" @on-cancel="close">
		<div class="money-wrapper">
			<div class="payment-details" v-if="account_details.length>0">
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
				<span class="pay-title">补交金额：</span>
				<span class="pay-amount">{{order.money_paid_amount}}&nbsp;元</span>
				<span class="pay-status">
					(<span v-if="charge_disabled&&wxPay" class="not-ok">待确认{{wxPay.pay_amount}}元</span>
					<span v-else class="ok">已确认</span>)
				</span>
			</div>

			<div class="dashed"></div>
			
			<div class="unpay-amount common">
				<span class="pay-title">剩余欠交：</span>
				<span class="pay-amount">{{order.remain_own_amount}}&nbsp;元</span>
			</div>
		</div>
		<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>                                
            <Button type="primary" :loading="saving" @click="chargeConfirm" :disabled="charge_disabled">确定</Button>                
        </div>
	</Modal>
</template>
<script>
	import Vue from 'vue'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'
	import PaymentItem from '../payment/payment-item.vue'

	export default {
		name: 'makeupChargeConfirmModal',
		mixins: [modal,common,globals],
		components: {
			PaymentItem
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
				default: () => {
					return {}
				}
			}
		},
		data() {
			return {
				oid: 0,
				qr_uri: '',
				code_pay: 0
			}
		},
		methods: {
			chargeConfirm() {
				this.close()
				this.$emit('on-makeup-confirm')
			},
			checkHasWXPay() {
				for(let i=0,l=this.order.payment.length;i<l;i++) {
					let item = this.order.payment[i]
					if(item.type==2&&item.cp_id>0&&item.pay_amount>0&&!item.pay_status) {
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
					paid_amount: this.wxPay.pay_amount
				}
				this.$rest('orders/online_payment_status')
				.get(params)
				.success(res => {
					if(res.status) {
						let wxAccont = this.order.payment.find(item => item.aa_id == this.wxPay.aa_id)
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
			wxPay() {
				return this.order.payment.find(item=>item.type==2&&item.cp_id>0&&item.pay_amount>0)
			},
			charge_disabled() {
				let wxAccount = this.order.payment.find(item=>item.type==2&&item.cp_id>0&&item.pay_amount>0)
				if(wxAccount) {
					if(wxAccount.pay_status) {
						return false
					}else{
						return true
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