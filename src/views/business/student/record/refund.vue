<template>
	<div>
		<table class="modal-table" style="font-size:12px;">
			<thead>
				<th><div class="ivu-table-cell">操作</div></th>
				<th><div class="ivu-table-cell">退费项目</div></th>
				<th><div class="ivu-table-cell">退费日期</div></th>
				<th><div class="ivu-table-cell">退费金额</div></th>
				<th><div class="ivu-table-cell">扣款详情</div></th>
				<th><div class="ivu-table-cell">收据</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						<Dropdown>
							<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
							<DropdownMenu slot="list">
								<DropdownItem @click.native="print(2,item.or_id)" v-per="'refund.print'">
									<Icon type="printer"></Icon> 打印收据
								</DropdownItem>
								<DropdownItem @click.native="undoRefund(item)" v-per="'refund.undo'">
									<Icon type="ios-undo"></Icon> 撤销退费
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</td>
				<td><div class="ivu-table-cell" v-html="getItems(item)"></div></td>
				<td><div class="ivu-table-cell">{{item.create_time.substring(0,10)}}</div></td>
				<td><div class="ivu-table-cell" v-html="getAmount(item)"></div></td>
				<td><div class="ivu-table-cell" v-html="getCutAmount(item)"></div></td>
				<td><div class="ivu-table-cell">{{item.bill_no}}</div></td>
				<td><div class="ivu-table-cell">{{item.employee?item.employee.ename:'-'}}</div></td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="7">
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
	import util 	 from '@/libs/util'
	import grid 	 from '@/libs/grid.mixin'
	import globals   from '@/libs/globals.mixin'
	import common 	 from '@/libs/common.mixin'
	
	export default{
		mixins: [grid,common,globals],
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'order_refunds',
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			getAmount (item) {
				return `应退金额:${this.label_currency}${item.need_refund_amount}<br>
						退电子钱包:${this.label_currency}${item.refund_balance_amount}<br>
						扣款总金额:${this.label_currency}${item.cut_amount}<br>
						实际退费:${this.label_currency}${item.refund_amount}`
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
				let [result,refund_items] = ['',item.order_refund_item]
				if(refund_items.length>0){
					refund_items.forEach(b=>{
						result += `${b.order_item.item_name} x ${util.float(b.nums)} = ${this.label_currency}${b.amount}<br>`
					})
				}
				return result
			},
			undoRefund(item) {
				this.confirm('确定要撤销退费吗？')
				.then(() => {
					this.$rest('order_refunds')
					.delete(item.or_id)
					.success(res => {
						this.$Message.success('撤销成功')
						this.dr().refreshData(this.url)
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			hook_get_param (params) {
				params.sid = this.id
			}
		}
	}
</script>
