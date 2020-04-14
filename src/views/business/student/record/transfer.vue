<template>
	<div>
		<table class="modal-table" style="font-size:12px;">
			<thead>
				<th><div class="ivu-table-cell">结转项目</div></th>
				<th><div class="ivu-table-cell">结转日期</div></th>
				<th><div class="ivu-table-cell">结转金额</div></th>
				<th><div class="ivu-table-cell">扣款详情</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td><div class="ivu-table-cell" v-html="getItems(item)"></div></td>
				<td><div class="ivu-table-cell">{{item.create_time.substring(0,10)}}</div></td>
				<td><div class="ivu-table-cell" v-html="getTransferAmount(item)"></div></td>
				<td><div class="ivu-table-cell" v-html="getCutAmount(item)"></div></td>
				<td><div class="ivu-table-cell">{{item.employee?item.employee.ename:'-'}}</div></td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="5">
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
	import util		 from '@/libs/util'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals   from '@/libs/globals.mixin'
	
	export default{
		mixins: [common,globals,grid],
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'order_transfers',
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			getTransferAmount (item) {
				let cut = item.order_cut_amount,
					cut_amount = 0
				cut.forEach(item => {
					cut_amount = util.add(cut_amount,item.amount)
				})
				return `结转金额:${this.label_currency}${item.transfer_amount}<br>
						扣款总金额:${this.label_currency}${cut_amount}<br>
						实际结转:${this.label_currency}${item.transfer_amount-cut_amount}`
			},
			getCutAmount (item) {
				let result = ''
				if(item.order_cut_amount.length>0) {
					item.order_cut_amount.forEach(item => {
						result += `${this.labelDicts(item.cutamount_did,'cutamount')}:${this.label_currency}${item.amount}<br>`
					})
				}else{
					result = '-'
				}
				return result
			},
			getItems (item) {
				let [result,refund_items] = ['',item.order_transfer_item]
				if(refund_items.length>0){
					refund_items.forEach(b=>{
						result += `${b.order_item.item_name} x ${util.float(b.nums)} = ${this.label_currency}${b.amount}<br>`
					})
				}
				return result
			},
			hook_get_param (params) {
				params.sid = this.id
			}
		}
	}
</script>
