<template>
	<div class="box box-result">
		<div class="toolbar">	
			<Button type="primary" icon="refresh" @click="search">刷新</Button>
			<filter-column :keys="column_keys"></filter-column>
		</div>
		<div class="content">
			<div class="content-body">
	            <Table 		            	
	            	v-loading.like="'handover_works/bills'" 
	            	:data="data" 
	            	:stripe="true" 
	            	:page="pageIndex" 
	            	:columns="columns" 
	            	:show-header="true" 
	            	:page-size="pageSize" 
	            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
	            	@on-sort-change="sortChange"> 
	            </Table>
            </div>
            <div class="content-footer">
            	<div class="pull-left" v-if="data.length>0">
            		<span class="ml-2">收款总金额：
            			<Tag color="blue">{{label_currency}}{{summary.total_money_paid_amount - summary.total_refund_amount}}</Tag>
        			</span>
            		<span class="ml-2">欠交总金额：
            			<Tag color="red">{{label_currency}}{{summary.total_unpaid_amount}}</Tag>
        			</span>
            	</div>
	            <div class="pagenation">
	                <Page 
	                	:total="total" 
	                	:current="pageIndex" 
	                	:show-sizer="true" 
	                	:page-size="pageSize" 
	                	:show-total="true" 
	                	@on-change="pagenation" 
	                	@on-page-size-change="pagesize">
	                </Page>
	            </div>
	        </div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	export default {
		mixins:[common,grid],
		data() {
			return {
				rest_api:'',
				summary: {},
				column_keys:{
					create_time:{
						title:'交易日期',
						show:true
					},
					orb_no:{
						title:'收据编号',
						show:true
					},
					student_name:{
						title:'学员姓名',
						show:true
					},
					sno: {
						title:'学号',
						show:false
					},
					orb_type:{
						title:'收据类型',
						show:true
					},
					amount:{
						title:'付款详情',
						show:true
					},
					unpaid_amount:{
						title:'欠交金额',
						show:true
					},
					cut_amount:{
						title:'退费扣款金额',
						show:false
					},
					aa_ids:{
						title:'支付方式',
						show:true
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
						return h('span',params.row.student.student_name)
					},
					sno(h,params) {
						return h('span',params.row.student.sno)
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
		},
		methods: {
			deal_data(data) {
				this.summary = data.summary
				this.$emit('on-success',data)
				return data.list
			}
		},
		mounted() {
			this.rest_api = 'handover_works/bills?uid='+this.uid
			this.init_data()
		},
		computed: {
			uid() {
				return this.$store.state.user.info.uid
			}
		}
	}
</script>