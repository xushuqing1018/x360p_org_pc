<template>
	<Modal v-drag-modal :mask-closable="false" width="800" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<table class="table-list">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">订单编号</div></th>
					<th width="120px"><div class="ivu-table-cell">下单时间</div></th>
					<th><div class="ivu-table-cell">购买项目</div></th>
					<th width="120px"><div class="ivu-table-cell">订单金额/元</div></th>
					<th width="120px"><div class="ivu-table-cell">欠交金额/元</div></th>
					<th width="120px"><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in data">
					<td><div class="ivu-table-cell">{{item.order_no}}</div></td>
					<td><div class="ivu-table-cell">{{item.paid_time|date_format}}</div></td>
					<td><div class="ivu-table-cell">{{getGoodsLabel(item.order_items)}}</div></td>
					<td><div class="ivu-table-cell">{{item.order_amount}}</div></td>
					<td><div class="ivu-table-cell">{{item.unpaid_amount}}</div></td>
					<td><div class="ivu-table-cell">
						<Button type="primary" size="small" @click="select(item)">现在补缴</Button></div>
					</td>
				</tr>
				<tr class="text-center empty" v-if="data.length==0">
					<td colspan="6"><div class="ivu-table-cell">你已经补交完所有欠交订单啦</div></td>
				</tr>
			</tbody>
		</table>
		<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>                                
        </div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [modal,globals,grid,common],
		props: {
			student: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		data() {
			return {
				data: []				
			}
		},
		methods: {
			getGoodsLabel(arr) {
				let length = arr.length
				let str = []
				if(length <= 2) {
					arr.forEach((item) => {
						str.push(item.item_name)
					})
					return str.join(',')
				}else{
					let name_0,name_1
					name_0 = arr[0].item_name
					name_1 = arr[1].item_name
					str = [name_0,name_1]
					return str.join(',') + '等' + length + '个项目'
				}
			},
			// 查询有欠交的订单
			queryOwnOrders() {
				let params = {
					sid: this.student.sid,
					pay_status: '[in,0,1]',
					is_submit: 1
				}
				this.$rest('orders')
				.get(params)
				.success(res => {
					let unpaidAmountAll = 0
					res.list.forEach(item => {
						unpaidAmountAll = util.add(unpaidAmountAll, item.unpaid_amount)
					})
					this.data = res.list
					this.$emit('on-refresh-unpay',unpaidAmountAll)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			// 计算实际的欠款金额(结转和退费对其会有影响)
			cacuRealUnpay(item) {
				let origin_unpay_amount = util.sub(item.subtotal ,item.paid_amount) 
				let back_nums = util.add(item.refund_nums, item.transfer_nums)
				if(back_nums > 0) {
					return 0
				}else{
					return origin_unpay_amount
				}
			},
			select(item) {
				let order = []
				order.push(item)
				this.$emit('on-select',order)
			},
			close() {
				this.modal$.show = false
			}
		}
	}
</script>
<style lang="less">
	.unpaid-orders-modal {
		.ivu-modal-body {
			max-height: 500px;
			overflow: auto;
		}
	}
</style>