<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1000" class="bills-info-modal">
        <Table         	
        	:data="data" 
        	:stripe="true" 
        	:columns="columns" 
        	:show-header="true"> 
        </Table>
        <div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
    </Modal>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal  from '@/libs/modal.mixin'
	import grid  from '@/libs/grid.mixin'
	export default {
		mixins:[common,modal,grid],
		data() {
			return {
				data: [],
				showIndex:false,
				column_keys:{
					create_time:{
						title:'交易日期',
					},
					orb_no:{
						title:'收据编号',
						width:180,
					},
					student_name:{
						title:'学员&学号',
					},
					orb_type:{
						title:'收据类型',
					},
					amount:{
						title:'付款详情',
						width:200,
					},
					unpaid_amount:{
						title:'欠交金额',
					},
					aa_ids:{
						title:'支付方式',
						width:180,
					}
				},
				column_render:{
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
					orb_no(h,params) {
						let row = params.row
						if(row.bill_no) {
							return h('span',row.bill_no)
						}else{
							return h('span',row.orb_no)
						} 
					},
					student_name(h,params) {
						let c = []
						c.push(h('p',params.row.student.student_name))
						c.push(h('p',params.row.student.sno||'-'))
						return h('div',c)
					},
					orb_type(h,params) {
						if(params.row.bill_no) {
							return h('Tag',{
								props:{
									type: 'border',
									color: 'yellow'
								}
							},'退费')
						}else{
							return h('span','收费')
						}
					},
					amount(h,params) {
						let row = params.row, c = []
						if(params.row.bill_no) {
							c.push(h('p',util.sprintf('付款金额：%s-%s',this.label_currency,row.need_refund_amount)))
							c.push(h('p',util.sprintf('非余额付款金额：%s-%s',this.label_currency,row.refund_amount)))
							c.push(h('p',util.sprintf('余额付款金额：%s-%s',this.label_currency,row.refund_balance_amount)))
						}else{
							c.push(h('p','付款金额：'+this.label_currency+row.amount))
							c.push(h('p','非余额付款金额：'+this.label_currency+row.money_paid_amount))
							c.push(h('p','余额付款金额：'+this.label_currency+row.balance_paid_amount))
						}
						return h('div',{attrs:{class:'wait-detail'}},c)
					},
					money_paid_amount(h,params) {
						let row = params.row
						if(row.bill_no) {
							return h('span',util.sprintf('%s-%s',this.label_currency,params.row.refund_amount))
						}else{
							return h('span',this.label_currency+row.money_paid_amount)
						} 
					},
					balance_paid_amount(h,params) {
						let row = params.row
						if(row.bill_no) {
							return h('span',util.sprintf('%s-%s',this.label_currency,params.row.refund_balance_amount))
						}else{
							return h('span',this.label_currency+row.balance_paid_amount)
						} 
					},
					cut_amount(h,params) {
						let row = params.row
						if(row.bill_no) {
							return h('span',this.label_currency+row.cut_amount)
						}else{
							return h('span','-')
						}
					},
					unpaid_amount(h,params) {
						let row = params.row
						if(row.bill_no) {
							return '-'
						}else{
							return h('span',this.label_currency+row.unpaid_amount)
						} 
					},
					aa_ids(h,params) {
						let row = params.row,c = []
						if(row.bill_no) {
							row.order_refund_history.forEach(item => {
								let account = this.accounts$.find(a => a.aa_id==item.aa_id).name
								c.push(h('p',util.sprintf('%s:%s-%s',account,this.label_currency,item.amount)))
							})
						}else{
							row.order_payment_history.forEach(item => {
								let account = this.accounts$.find(a => a.aa_id==item.aa_id).name
								c.push(h('p',util.sprintf('%s:%s%s',account,this.label_currency,item.amount)))
							})
						}
						return h('div',c)
					}
				}
			}
		}
	}
</script>
<style>
	.bills-info-modal .ivu-table {
		font-size: 12px;
	}
</style>