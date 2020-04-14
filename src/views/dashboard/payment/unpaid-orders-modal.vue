<template>
	<Modal v-drag-modal :mask-closable="false" width="700" v-model="modal$.show" :title="modal$.title" @on-cancel="close" class="unpaid-orders-modal">
		<table class="table-list">
			<thead>
				<tr>
					<th width="120px"><div class="ivu-table-cell">下单时间</div></th>
					<th><div class="ivu-table-cell">项目</div></th>
					<th width="120px"><div class="ivu-table-cell">金额/元</div></th>
					<th width="120px"><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in items">
					<td><div class="ivu-table-cell">{{item.paid_time|date_format}}</div></td>
					<td><div class="ivu-table-cell">{{getGoodsLabel(item.order_items)}}</div></td>
					<td><div class="ivu-table-cell">{{item.order_amount}}</div></td>
					<td><div class="ivu-table-cell">
						<Button type="primary" size="small" @click="select(item)">现在收费</Button></div>
					</td>
				</tr>
			</tbody>
		</table>
		<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>                                
        </div>
	</Modal>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'

	export default {
		name: 'search',
		mixins: [modalMixin,globals,grid,common],
		props: {
			items: {
				type: Array,
				default(){
					return []
				}
			}
		},
		data() {
			return {
				
			}
		},
		mounted() {

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
			select(item) {
				this.close()
				this.$emit('on-select', item)
			},
			close() {
				this.modal$.show = false
			}
		},
		computed: {

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