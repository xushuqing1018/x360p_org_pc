<template>
	<dataReady :cache="false" :data="pay_url" @ready="dataReady">
		<table class="modal-table" style="font-size:12px;">
			<thead>
				<th><div class="ivu-table-cell">缴费项目</div></th>
				<th><div class="ivu-table-cell">缴费日期</div></th>
				<th><div class="ivu-table-cell">缴费金额/元</div></th>
				<th><div class="ivu-table-cell">收款账户</div></th>
				<th><div class="ivu-table-cell">收据</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td><div class="ivu-table-cell"><Tag v-if="item.order_item.gtype == 1" color="green">物</Tag>{{getName(item)}}</div></td>
				<td><div class="ivu-table-cell">{{item.order_receipt_bill.paid_time}}</div></td>
				<td><div class="ivu-table-cell">{{item.paid_amount}}</div></td>
				<td><div class="ivu-table-cell">{{getPayType(item)}}</div></td>
				<td>
					<div class="ivu-table-cell">{{item.order_receipt_bill.orb_no}}
						<Dropdown transfer>
							<Button type="primary" size="small" icon="printer">打印</Button>
							<DropdownMenu slot="list">
								<DropdownItem @click.native="print(1,item.orb_id,1)">收据</DropdownItem>
								<DropdownItem @click.native="print(1,item.orb_id,2)" v-if="enable_contract_print">合同</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</td>
				<td><div class="ivu-table-cell">{{getEname(item)}}</div></td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="7">
					<div class="ivu-table-cell text-center">暂无数据~</div>
				</td>
			</tr>
		</table>
	</dataReady>
</template>

<script>
	import grid 	 from '@/libs/grid.mixin'
	import globals   from '@/libs/globals.mixin'
	import common 	 from '@/libs/common.mixin'
	import dataReady from 'c%/DataReady.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dataReady
		},
		props: {
			oid:{
				type: [Number,String],
				required: true
			}
		},
		data () {
			return {
				rest_api: 'orders/'+this.oid+'/receipt_bill_item',
				pk: 'orb_id'
			}
		},
		mounted () {
			
		},
		methods: {
			dataReady (rs) {
				if(rs[0]!=''){
					this.data = rs[0].list
				}
			},
			deal_data(data) {
				return data.list
			},
			map_bill_status (status) {
				let map = {0:'未申请',1:'已申请',2:'已开'}
				return map[status]
			},
			getPayType (item) {
				let accounts = this.$store.state.gvars.accounts
				let items = item.order_receipt_bill.order_payment_history
				let result = []
				if(items.length>0){
					items.forEach(i=>{
						result.push( `${accounts.find(a=>a.aa_id==i.aa_id).name}:${i.amount}元`)
					})
					
				}
				if(item.order_receipt_bill.balance_paid_amount > 0){
					result.push('余额支付:'+item.order_receipt_bill.balance_paid_amount+'元')
				}
				result = result.join(',')
				return result
			},		
			getName(item) {
				return item.order_item.item_name
			},
			getUnit(item) {
				if(item.order_item.gtype == 1) {
					return item.order_item.material.unit
				}else if(item.order_item.gtype == 2){
					return '元'
				}else{
					return this.$filter('nums_unit')(item.order_item.nums_unit)
				}
			},
			getEname(item) {
				let ename = ''
				if(item.order_receipt_bill.employee) {
					ename = item.order_receipt_bill.employee.ename
				}
				return ename
			}
		},
		computed: {
			pay_url() {
				return ['orders/'+this.oid+'/receipt_bill_item']
			}
		}
	}
</script>
