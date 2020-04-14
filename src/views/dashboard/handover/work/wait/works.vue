<template>
	<div class="box box-result" v-if="data.length>0">
		<Alert show-icon><p>当前有{{data.length}}笔未交款的交班记录，可选择将其合并继续交班给其他人，或进入待缴款界面进行交款操作，继续交班请打勾</p></Alert>
			<table>
				<thead>
					<tr>
	    				<th><div class="ivu-table-cell">交班人</div></th>
	    				<th><div class="ivu-table-cell">收费金额</div></th>
	    				<th><div class="ivu-table-cell">退费金额</div></th>
	    				<th><div class="ivu-table-cell">收费现金</div></th>
	    				<th><div class="ivu-table-cell">退费现金</div></th>
	    				<th><div class="ivu-table-cell">交班时间</div></th>
	    			</tr>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
						<td><div class="ivu-table-cell">{{item.money_inc_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.money_dec_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.cash_inc_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.cash_dec_amount}}</div></td>
						<td><div class="ivu-table-cell">{{getTime(item)}}</div></td>
					</tr>
					<tr>
						<td colspan="6" class="hand-again">
							<Checkbox v-model="hand_again" @on-change="handAgain">继续交班</Checkbox>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins:[common,grid,globals],
		data() {
			return {
				rest_api:'handover_works',
				hand_again:false
			}
		},
		methods: {
			getTime(item) {
				return moment(item.create_time).format('YYYY-MM-DD')
			},
			hook_get_param(param) {
				param.to_eid   = this.eid$
				param.hm_id    = 0
				param.to_hw_id = 0
				param.ack_time = '[>,0]'
			},
			handAgain(event) {
				let handObj = {
					hw_ids: [],
					amount: 0,
					cash: 0
				}
				this.data.forEach(item => {
					let income = util.sub(item.money_inc_amount,item.money_dec_amount),
						cash = util.sub(item.cash_inc_amount,item.cash_dec_amount)
					handObj.hw_ids.push(item.hw_id)
					handObj.amount = util.add(handObj.amount,income)
					handObj.cash = util.add(handObj.cash,cash)
				})
				this.$emit('on-hand-again',{event:event,handObj:handObj})
			}
		},
		mounted() {
			this.init_data()
		}
	}
</script>
<style lang="less">
	.hand-again {
		text-align: center;
		padding-top: 8px;
		label {
			margin-bottom: 0;
		}
	}
</style>