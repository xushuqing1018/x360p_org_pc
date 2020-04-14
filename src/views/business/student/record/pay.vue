<template>
	<div>
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">缴费日期</div></th>
				<th><div class="ivu-table-cell">缴费金额</div></th>
				<th><div class="ivu-table-cell">缴费项目</div></th>
				<th><div class="ivu-table-cell">支付方式</div></th>
				<th><div class="ivu-table-cell">收据</div></th>
				<th><div class="ivu-table-cell">录入日期</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td><div class="ivu-table-cell">{{item.paid_time}}</div></td>
				<td><div class="ivu-table-cell">{{item.amount}}</div></td>
				<td><div class="ivu-table-cell">{{getItems(item)}}</div></td>
				<td><div class="ivu-table-cell">{{getPayType(item)}}</div></td>
				<td>
					<div class="ivu-table-cell">
						{{item.orb_no}}
						<Dropdown transfer>
							<Button type="primary" size="small" icon="printer">打印</Button>
							<DropdownMenu slot="list">
								<DropdownItem @click.native="print(1,item.orb_id,1)">收据</DropdownItem>
								<DropdownItem @click.native="print(1,item.orb_id,2)">合同</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</td>
				<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
				<td><div class="ivu-table-cell">{{item.employee?item.employee.ename:'-'}}</div></td>
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
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,globals],
		props: {
			sid:{
				type: [Number,String],
				default:0
			}
		},
		data () {
			return {
				rest_api: 'order_receipt_bills',
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			map_bill_status (status) {
				let map = {0:'未申请',1:'已申请',2:'已开'}
				return map[status]
			},
			getItems (items) {
				let [result,bill_items] = ['',items.order_receipt_bill_item]
				let ret = []
				if(bill_items.length>0){
					bill_items.forEach(b=>{
						ret.push(b.order_item.item_name)
					})
					result = ret.join(',')
				}
				return result
			},
			getPayType (item) {
				let accounts = this.$store.state.gvars.accounts
				let items = item.order_payment_history
				let result = []
				if(items.length>0){
					items.forEach(i=>{
						if(i.amount>0) {
							result.push( accounts.find(a=>a.aa_id==i.aa_id).name+':'+i.amount+'元')
						}
					})
				}
				if(item.balance_paid_amount > 0){
					result.push('余额付款:'+item.balance_paid_amount+'元')
				}
				result = result.join(',')
				return result
			},		
			hook_get_param (params) {
				params.sid = this.id
			}
		}
	}
</script>
