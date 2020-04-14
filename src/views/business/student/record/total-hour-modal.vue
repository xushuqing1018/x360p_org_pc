<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="900" :mask-closable="false">
		<div class="total-lesson">
			<item-list :list="insData.items" @on-success="rrefreshData" v-show="insData.items.length"></item-list>
			<import-list :list="insData.import" @on-success="rrefreshData" v-show="insData.import.length"></import-list>
			<present-list :list="insData.present" @on-success="rrefreshData" v-show="insData.present.length"></present-list>
			<transin-list :list="insData.transIn" @on-success="rrefreshData" v-show="insData.transIn.length"></transin-list>
			<transout-list :list="insData.transOut" @on-success="rrefreshData" v-show="insData.transOut.length"></transout-list>
			<transfer-list :list="insData.transfer" @on-success="rrefreshData" v-show="insData.transfer.length"></transfer-list>
			<refund-list :list="insData.refund" @on-success="rrefreshData" v-show="insData.refund.length"></refund-list>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import ItemList from './total/items.vue'
	import ImportList from './total/import.vue'
	import PresentList from './total/present.vue'
	import TransinList from './total/transin.vue'
	import TransoutList from './total/transout.vue'
	import TransferList from './total/transfer.vue'
	import RefundList from './total/refund.vue'
	
	export default{
		mixins: [ grid,common,modal ],
		props: {
			slId: {
				type:Number,
				default:0	
			}
		},
		components: {
			ItemList,
			ImportList,
			PresentList,
			TransinList,
			TransoutList,
			TransferList,
			RefundList
		},
		data () {
			return {
				rest_api: '',
				pk: 'slh_id',
				insData: {
					import: [],
					items: [],
					present: [],
					refund: [],
					transfer: [],
					transIn: [],
					transOut: []
				}
			}
		},
		mounted() {
			this.rest_api = `student_lessons/${this.slId}/ins`
			this.init_data()
		},
		methods: {
			rrefreshData() {
				this.init_data()
				this.$emit('on-success')
			},
			deal_data(data) {
				this.insData.import = data.import_list
				this.insData.items = data.oi_list
				this.insData.present = data.present_list
				this.insData.refund = data.refund_list
				this.insData.transIn = data.trans_in_list
				this.insData.transOut = data.trans_out_list
				this.insData.transfer = data.transfer_list
				return data.list
			}
		}
	}
	
</script>

<style>
	.total-lesson {
		text-align: center;
	}
	.total-lesson .table-title {
		margin-top: 15px;
		margin-bottom: 6px;
	}
	.total-lesson .ivu-table-wrapper {
		min-height: 0;
	}
</style>