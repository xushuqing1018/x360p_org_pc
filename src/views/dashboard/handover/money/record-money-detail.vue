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
	import globals from '@/libs/globals.mixin'
	import modal  from '@/libs/modal.mixin'
	import grid  from '@/libs/grid.mixin'
	export default {
		mixins:[globals,modal,grid],
		data() {
			return {
				data: [],
				showIndex:false,
				column_keys:{
					eid:{
						title:'交班人',
						show:true
					},
					money_inc_amount:{
						title:'收费金额',
						show:true
					},
					money_dec_amount: {
						title:'退费金额',
						show:true
					},
					cash_inc_amount:{
						title:'收费现金',
						show:true
					},
					cash_dec_amount: {
						title:'退费现金',
						show:true
					},
					submit_time:{
						title:'交班时间',
						width:200,
						show:true
					},
					ack_time:{
						title:'交班确认时间',
						width:200,
						show:true
					},
				},
				column_render:{
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					money_inc_amount(h,params) {
						return h('span',this.label_currency+params.row.money_inc_amount)
					},
					money_dec_amount(h,params) {
						return h('span',this.label_currency+params.row.money_dec_amount)
					},
					cash_inc_amount(h,params) {
						return h('span',this.label_currency+params.row.cash_inc_amount)
					},
					cash_dec_amount(h,params) {
						return h('span',this.label_currency+params.row.cash_dec_amount)
					},
					handover_cash(h,params) {
						return h('span',this.label_currency+params.row.handover_cash)
					},
					submit_time(h,params) {
						let time = params.row.submit_time
						if(!time) {
							return h('span','-')
						}else{
							return h('span',time)
						}
					},
					ack_time(h,params) {
						let time = params.row.ack_time
						if(!time) {
							return h('span','-')
						}else{
							return h('span',time)
						}
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