<template>
	<dataReady :cache="false" :data="refund_url" @ready="dataReady">
		<table class="modal-table" style="font-size:12px;">
			<thead>
				<th><div class="ivu-table-cell">退费项目</div></th>
				<th><div class="ivu-table-cell">退费日期</div></th>
				<th><div class="ivu-table-cell">退费金额/元</div></th>
				<th><div class="ivu-table-cell">退费数量</div></th>
				<th><div class="ivu-table-cell">收款账户</div></th>
				<th><div class="ivu-table-cell">收据</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td><div class="ivu-table-cell"><Tag v-if="item.order_item.gtype == 1" color="green">物</Tag>{{getName(item)}}</div></td>
				<td><div class="ivu-table-cell">{{item.order_refund.refund_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.amount}}</div></td>
				<td><div class="ivu-table-cell">{{item.nums}}{{getUnit(item)}}</div></td>
				<td><div class="ivu-table-cell">{{getPayType(item)}}</div></td>
				<td><div class="ivu-table-cell">{{item.order_refund.bill_no}}
					<Tag color="blue" @click.native="print(2,item.or_id)">打印收据</Tag></div></td>
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
				rest_api: 'orders/'+this.oid+'/refund_item',
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
				let items = item.order_refund.order_refund_history
				let result = ''
				if(items.length>0){
					items.forEach(i=>{
						result += accounts.find(a=>a.aa_id==i.aa_id).name+','
					})
					result = result.substring(0,result.length-1)
				}
				if(item.order_refund.refund_to == 0){
					result = '退到电子钱包'
				}
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
				if(item.order_refund.employee) {
					ename = item.order_refund.employee.ename
				}
				return ename
			}
		},
		computed: {
			refund_url() {
				return ['orders/'+this.oid+'/refund_item']
			}
		}
	}
</script>
