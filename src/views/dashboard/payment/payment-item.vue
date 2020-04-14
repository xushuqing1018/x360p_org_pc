<template>
	<div class="payment-item">
		<span class="name">{{index+1}}. {{item.name}}</span>
		<div class="pull-right">
			<span class="amount">{{item.pay_amount}}元</span>
			(<span :class="item.pay_status?'ok':'not-ok'">{{item.pay_status?'已确认':'待确认'}}</span>)
		</div>
		<template v-if="item.type==2&&item.cp_id>0&&item.pay_amount>0&&qrUri!==''&&!item.pay_status">
			<div class="text-center">
				<Button type="primary" size="small" v-printdom="'.printarea'">打印付款二维码</Button>
				<div class="printarea">
					<p class="print-show" media="print">
						请扫描下面的二维码完成缴费
					</p>
					<qrcode ref="qrcode" class="mt-2" :value="qrUri" type="img" :size="180"></qrcode>
					<div class="print-show" media="print">
						<p>金额：{{item.pay_amount}}元</p>
						<p>姓名：{{student.student_name}}</p>
					</div>
					<div class="code-pay" v-if="codePay!=0">
						<p>缴费码</p>
						<div><span class="code-item" v-for="item in code_string_arr">{{item}}</span></div>
					</div>
				</div>
				<img class="mt-2" src="http://sp1.xiao360.com/static/img/wxpay/wxpay-desc.jpg">
			</div>
		</template>
		<template v-if="item.type==2&&item.cp_id>0&&item.pay_amount>0&&item.pay_status">
			<div class="text-center mt-2">

				<img src="http://sp1.xiao360.com/static/img/wxpay/wx-logo.png" width="30" />
				<div class="pay-success">
					<div class="ok mt-2">支付成功</div>
					<div class="money mt-2">{{label_currency}}{{item.pay_amount}}</div>
				</div>
			</div>
		</template>
	</div>
</template>
<script>
	import Qrcode from 'c%/qrcode/index.vue'
	import printdom from '@/libs/printdom'
	import common from '@/libs/common.mixin'
	export default {
		name:'payItem',
		mixins: [common],
		components: {
			Qrcode
		},
		directives:{
			printdom
		},
		props: {
			codePay: {
				type: [Number,String],
				default: () => {
					return 0
				}
			}, 
			oid: {
				type: Number,
				default: () => {
					return 0
				}
			},
			qrUri: {
				type: String,
				default: () => {
					return ''
				}
			},
			item: {
				type: Object,
				default: () => {
					return {}
				}
			},
			index: {
				type: Number,
				default: () => {
					return 0
				}
			},
			student: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		computed: {
			code_string_arr() {
				return this.codePay.split('')
			}
		},
		watch: {
			'$store.state.scan_reader.code': function(code) {
				let item = this.item,
					params = {
						paid_amount: item.pay_amount,
						aa_id: item.aa_id,
						oid: this.oid,
						auth_code: code
					}
				if(item.type==2&&item.cp_id>0&&item.pay_amount>0&&this.qrUri!==''&&!item.pay_status&&this.oid>0) {
					this.$rest('/wxapi/wxpay/swipe_bar_code')
					.post(params)
					.success(res => {

					})
					.error(res => {
						this.error(res.body.message)
					})
				}
			}
		}
	}
</script>