<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<div class="ivu-table-wrapper" style="max-height:400px;overflow-y:auto;overflow-x:hidden">
			<table class="table-list" v-loading.like="'customer'">
				<thead>
					<th><div class="ivu-table-cell">被介绍学员</div></th>
					<th><div class="ivu-table-cell">性别</div></th>
					<th><div class="ivu-table-cell">年龄</div></th>
					<th><div class="ivu-table-cell">介绍时间</div></th>
					<th><div class="ivu-table-cell">客户状态</div></th>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.name}}</div></td>
						<td><div class="ivu-table-cell">{{item.sex|sex}}</div></td>
						<td><div class="ivu-table-cell">{{getAge(item.birth_day)}}</div></td>
						<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
						<td><div class="ivu-table-cell">{{item.customer_status_did|dict_title('customer_status','-')}}</div></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [grid,modal,globals,common],
		data() {
			return {
				rest_api: 'customers',
				int_day: [],
				referer_sid: 0
			}
		},
		methods: {
			hook_get_param(param) {
				param.referer_sid = this.referer_sid
				if(this.int_day.length==2 && this.int_day[0]!=='') {
					param.create_time = util.sprintf('[between,%s,%s]',this.int_day[0],this.int_day[1])
				}
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.init_data()
				}
			}
		}
	}
</script>