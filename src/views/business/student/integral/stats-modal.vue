<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="false" width="600">
		<div class="mb-2">
			<label>时间范围：</label>
			<date-range-picker v-model="date_range"></date-range-picker>
			<Button type="primary" @click="init_data">查询</Button>
		</div>
		<table class="modal-table">
			<thead>
				<tr>
					<th rowspan="2" class="stats-border"><div class="ivu-table-cell">规则名称</div></th>
					<th colspan="2" class="text-center stats-border"><div class="ivu-table-cell">加分合计</div></th>
					<th colspan="2" class="text-center"><div class="ivu-table-cell">减分合计</div></th>
				</tr>
				<tr>
					<th><div class="ivu-table-cell">学习积分</div></th>
					<th class="stats-border"><div class="ivu-table-cell">消费积分</div></th>
					<th><div class="ivu-table-cell">学习积分</div></th>
					<th><div class="ivu-table-cell">消费积分</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in data.list">
					<td><div class="ivu-table-cell">{{item.credit_rule?item.credit_rule.rule_name:'未知'}}</div></td>
					<td><div class="ivu-table-cell text-success">{{item.add_study_credit>0?'+ ':''}}{{item.add_study_credit}}</div></td>
					<td><div class="ivu-table-cell text-success">{{item.add_consume_credit>0?'+ ':''}}{{item.add_consume_credit}}</div></td>
					<td><div class="ivu-table-cell text-danger">{{item.reduce_study_credit>0?'- ':''}}{{item.reduce_study_credit}}</div></td>
					<td><div class="ivu-table-cell text-danger">{{item.reduce_consume_credit>0?'- ':''}}{{item.reduce_consume_credit}}</div></td>
				</tr>
				<tr v-if="data.list.length==0"><td colspan="5"><div class="ivu-table-cell text-center">没有数据</div></td></tr>
			</tbody>
			<tfoot>
				<tr>
					<td><div class="ivu-table-cell">合计</div></td>
					<td><div class="ivu-table-cell text-success">+ {{data.total_add_study_credit}}</div></td>
					<td><div class="ivu-table-cell text-success">+ {{data.total_add_consume_credit}}</div></td>
					<td><div class="ivu-table-cell text-danger">- {{data.total_reduce_study_credit}}</div></td>
					<td><div class="ivu-table-cell text-danger">- {{data.total_reduce_consume_credit}}</div></td>
				</tr>
			</tfoot>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [modal],
		components: {
			DateRangePicker
		},
		data() {
			return {
				data: {
					list: []
				},
				date_range: []
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			init_data() {
				let params = {}
				params.group = 'cru_id'
				if(this.date_range.length == 2) {
					params.create_time = util.sprintf('[between,%s]',this.date_range.join(','))
				}
				this.$rest('student_credit_historys').add_url_param('report')
				.get(params)
				.success(res => {
					this.data = res
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>
<style lang="less" scoped>
	.stats-border {
		border-right: 1px solid #e9eaec;
	}
</style>