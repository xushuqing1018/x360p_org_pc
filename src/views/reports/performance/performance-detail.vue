<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div class="ivu-table-wrapper" style="max-height:550px;overflow-y:auto;overflow-x:hidden">
			<table class="table-list" v-loading="'order_performances'">
				<thead>
					<th><div class="ivu-table-cell">学员</div></th>
					<th><div class="ivu-table-cell">项目</div></th>
					<th><div class="ivu-table-cell">订单金额</div></th>
					<th><div class="ivu-table-cell">已付金额</div></th>
					<th><div class="ivu-table-cell">签单日期</div></th>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.one_order.student.student_name}}</div></td>
						<td><div class="ivu-table-cell" v-html="getItems(item)"></div></td>
						<td><div class="ivu-table-cell">{{item.one_order.order_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.one_order.paid_amount}}</div></td>
						<td><div class="ivu-table-cell">{{getCreateTime(item)}}</div></td>
					</tr>
				</tbody>
			</table>
			<div class="clearfix">
                <Page 
                size="small"
                class="pull-right"
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
			}
		},
		methods: {
			getItems(item) {
				let data = []
				item.one_order.order_items.forEach(i => {
					if(i.gtype == 0) {
						data.push(this.$filter('lesson_name')(i.lid))
					}else if(i.gtype == 2){
						let prefix = '储值:'
						if(i.dc_id > 0){
							prefix:'购买储值卡:'
						}
						data.push(prefix+i.subtotal+'元')
					}else if(i.gtype == 1){
						data.push(i.material.name)
					}else{
						data.push(i.item_name)
					}
				})
				return data.join('<br/>')
			},
			getCreateTime(item) {
				return moment(item.create_time).format('YYYY-MM-DD')
			},
			get_data() {
				this.rest_api = 'order_performances'
				this.init_data()
				return this
			},
			hook_get_param(params) {
				params['eid'] = this.info.eid
				params['sale_role_did'] = this.info.did
			}
		}
	}
</script>