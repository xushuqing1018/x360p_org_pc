<template>
	<div>
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">订单编号</div></th>
				<th><div class="ivu-table-cell">校区</div></th>
                <th><div class="ivu-table-cell">项目</div></th>
				<th><div class="ivu-table-cell">订单金额</div></th>
				<th><div class="ivu-table-cell">实缴金额</div></th>
				<th><div class="ivu-table-cell">支付方式</div></th>
				<th><div class="ivu-table-cell">订单状态</div></th>
				<th><div class="ivu-table-cell">报名时间</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						<span class="cursor text-info" @click="orderDetail(item.oid)">{{item.order_no}}</span>				
					</div>
				</td>
                <td>
					<div class="ivu-table-cell">
						{{item.bid | branch_name}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<div v-for="i in item.order_items">
							<p>
								<span>{{i.item_name}}</span>
								<span v-if="i.present_lesson_hours > 0" class="pull-right text-info">(+{{i.present_lesson_hours}})</span>
								<span class="pull-right">x {{int(i.nums)}}</span>
							</p>
						</div>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.order_amount}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.paid_amount}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{getPayType(item)}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell" :class="order_status[item.order_status].color">
						<span>{{order_status[item.order_status].label}}</span>
						<span v-if="item.order_status===11&&item.refund_amount>0">{{label_currency}}{{item.refund_amount}}</span>
					</div>
				</td>
				<td>					
					<div class="ivu-table-cell">
						{{item.paid_time}}
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="8">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
		<div class="mt-3 text-right">
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
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'	
	import dataReady from 'c%/DataReady.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default{
		mixins: [common,globals,grid],
		components: {
			dataReady,
			SelectStudent,
			dateRangePicker,
			ExportButton
		},
		props: {
			sid: {
				type: [Number,String],
				default:0
			}			
		},
		data () {
			return {
				rest_api: 'orders',
				status_list: [
					{value:0,label:'待付款'},
					{value:1,label:'已付款'},
					{value:10,label:'已申请退款'},
					{value:11,label:'已退款'},
				],
				pay_status_map: [
					{value:0,label:'未缴清',color:'text-danger'},
					{value:1,label:'部分缴清',color:'text-info'},
					{value:2,label:'已缴清',color:'text-success'}
				],
				ac_status_map: [
					{value:0,label:'未分班',color:'text-danger'},
					{value:1,label:'部分分班',color:'text-info'},
					{value:2,label:'已分班',color:'text-success'}
				],
				id: this.sid > 0?this.sid:this.$route.params.id,
				order_status: {
					0:{label:'待付款',color:'text-info'},
					1:{label:'已付款',color:'text-success'},
					10:{label:'已申请退款',color:'text-danger'},
					11:{label:'已退款',color:'text-danger'}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			orderDetail (oid) {
				this.$router.push({path: '/business/order/'+oid})
			},
			hook_get_param (params) {
				params.sid = this.id
			},
			getPayType (item) {
				let accounts = this.$store.state.gvars.accounts
				let items = item.order_items,
							result = []
				if(items.length>0){
					let bills = items[0].receipt_bill_item
					if(bills.length>0){
						bills.forEach(b => {
							let payment = b.order_payment_history
							if(payment.length>0){
								payment.forEach(p => {
									if(p.amount>0) {
										result.push(accounts.find(a=>a.aa_id==p.aa_id).name+'：'+p.amount+'元')
									}
								})
							}
						})
					}
				}
				if(item.balance_paid_amount > 0){
					result.push('余额付款:'+item.balance_paid_amount+'元')
				}
				result = result.join(',')
				return result
			},		
			int(num) {
				return util.float(num)
			}				
		}
	}
</script>
