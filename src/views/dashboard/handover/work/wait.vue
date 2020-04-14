<template>
	<div class="c-grid">
		<works ref="ref_work" @on-hand-again="handAgain"></works>
		<bills ref="ref_bill" @on-success="getBillData"></bills>
    	<div class="box text-center">
    		<Button type="primary" size="large" style="width:100px;padding:6px 15px" @click="handoverWork">交班</Button>
    	</div>
    	<hand-info ref="hand_info" @on-success="handSuccess"></hand-info>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import {_}	  from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import HandInfo from './hand-info.vue'
	import Bills  from './wait/bills.vue'
	import Works  from './wait/works.vue'
	export default {
		mixins:[common,grid],
		components: {
			HandInfo,
			Bills,
			Works
		},
		data() {
			return {
				bill_data: {},
				hand_data: {
					event:false,
					handObj:{}
				}
			}
		},
		methods: {
			handoverWork() {
				let amount = 0, cash_total = 0, param = {}, summary = this.bill_data.summary
				amount = util.sub(summary.total_money_paid_amount,summary.total_refund_amount)
				cash_total = util.sub(summary.total_cash_paid_amount,summary.total_cash_refund_amount)
				if(this.hand_data.event) {
					amount = util.add(amount,this.hand_data.handObj.amount)
					cash_total = util.add(cash_total,this.hand_data.handObj.cash)
					param.hw_ids = this.hand_data.handObj.hw_ids
				}
				if(!this.bill_data.list.length&&_.isEmpty(this.hand_data.handObj)) {
					this.$Message.error('暂时没有交班数据')
					return false
				}
				param.amount = amount
				param.to_eid = 0
				param.cash_total = cash_total
				param.non_cash = util.sub(amount,cash_total)
				this.$refs.hand_info
				.set('info',param)
				.show(util.sprintf('交班【%s】',this.uname))
			},
			getBillData(data) {
				this.bill_data = data
			},
			handAgain(data) {
				this.hand_data = data
			},
			handSuccess() {
				this.$refs.ref_work.init_data()
				this.$refs.ref_bill.init_data()
			}
		},
		computed: {
			uname() {
				return this.$store.state.user.info.name
			}
		}
	}
</script>
<style lang="less">
	.wait-detail {
	    color: #999;
	    line-height: 24px;
	}
</style>