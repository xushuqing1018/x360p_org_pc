<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<div class="ivu-table-wrapper" style="max-height:550px;overflow-y:auto;overflow-x:hidden">
			<Tabs v-model="type">
				<TabPane label="回款" name="receipt" v-if="receipt_data.length>0">
					<table class="table-list" v-loading="'employee_receipts'">
						<thead>
							<th><div class="ivu-table-cell">学员</div></th>
							<th><div class="ivu-table-cell">项目</div></th>
							<th><div class="ivu-table-cell">回款金额</div></th>
							<th><div class="ivu-table-cell">欠交金额</div></th>
							<th><div class="ivu-table-cell">回款时间</div></th>
						</thead>
						<tbody>
							<tr v-for="item in receipt_data">
								<td><div class="ivu-table-cell">{{item.order_receipt_bill.student.student_name}}</div></td>
								<td><div class="ivu-table-cell" v-html="getReceiptItems(item)"></div></td>
								<td>
									<div class="ivu-table-cell">
										电子钱包冲减金额: {{item.order_receipt_bill.balance_paid_amount}}<br/>
										现金付款金额: {{item.order_receipt_bill.money_paid_amount}}<br/>
										总计: {{item.order_receipt_bill.amount}}
									</div>
								</td>
								<td><div class="ivu-table-cell">{{item.order_receipt_bill.unpaid_amount}}</div></td>
								<td><div class="ivu-table-cell">{{getCreateTime(item)}}</div></td>
							</tr>
						</tbody>
					</table>
					
				</TabPane>
				<TabPane label="退款" name="refund" v-if="refund_data.length>0">
					<table class="table-list" v-loading="'employee_receipts'">
						<thead>
							<th><div class="ivu-table-cell">学员</div></th>
							<th><div class="ivu-table-cell">项目</div></th>
							<th><div class="ivu-table-cell">退款金额</div></th>
							<th><div class="ivu-table-cell">退款时间</div></th>
						</thead>
						<tbody>
							<tr v-for="item in refund_data">
								<td><div class="ivu-table-cell">{{item.order_refund.student.student_name}}</div></td>
								<td><div class="ivu-table-cell" v-html="getRefundItems(item)"></div></td>
								<td><div class="ivu-table-cell">{{item.amount}}</div></td>
								<td><div class="ivu-table-cell">{{getCreateTime(item)}}</div></td>
							</tr>
						</tbody>
					</table>
				</TabPane>
			</Tabs>
			<div class="clearfix">
                <Page 
                size="small"
                class="pull-right mt-3"
                :total="total" 
                :current="pageIndex" 
                :show-sizer="true" 
                :page-size="pageSize" 
                :show-total="true" 
                @on-change="pagenation" 
                @on-page-size-change="pagesize"
                >
                </Page>
            </div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import grid from '@/libs/grid.mixin'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [grid,modal,globals],
		data() {
			return {
				rest_api: '',
				info: {},
				receipt_data: [],
				refund_data: [],
				type: 'receipt'
			}
		},
		methods: {
			getReceiptItems(item) {
				let data = []
				item.order_receipt_bill.order_receipt_bill_item.forEach(i => {
					if(i.order_item.gtype == 0) {
						data.push(this.$filter('lesson_name')(i.order_item.lid))
					}else if(i.order_item.gtype == 2){
						let prefix = '储值:'
						if(i.order_item.dc_id > 0){
							prefix = '购买储值卡:'
						}
						data.push(prefix+i.order_item.subtotal+'元')
					}else if(i.order_item.gtype == 1){
						data.push(i.order_item.material.name)
					}else{
						data.push(i.order_item.item_name)
					}
				})
				return data.join('<br/>')
			},
			getRefundItems(item) {
				let data = []
				item.order_refund.order_refund_item.forEach(i => {
					if(i.order_item.gtype == 0) {
						data.push(this.$filter('lesson_name')(i.order_item.lid))
					}else{
						data.push(i.order_item.material.name)
					}
				})
				return data.join('<br/>')
			},
			getCreateTime(item) {
				return moment(item.receipt_time).format('YYYY-MM-DD')
			},
			get_data() {
				this.rest_api = 'employee_receipts'
				this.init_data()
				return this
			},
			deal_data(data) {
				this.receipt_data = data.list.filter(item => item.orb_id>0)
				this.refund_data = data.list.filter(item => item.or_id>0)
				if(this.receipt_data.length == 0) {
					this.type = 'refund'
				}
				return data.list
			},
			hook_get_param(params) {
				params['eid'] = this.info.eid
				params['sale_role_did'] = this.info.did
			}
		}
	}
</script>