<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div style="height: 400px;overflow: auto">
			<table class="modal-table">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">姓名</div></th>
						<th><div class="ivu-table-cell">类型</div></th>
						<th><div class="ivu-table-cell">责任人</div></th>
						<th><div class="ivu-table-cell">手机号</div></th>
						<th><div class="ivu-table-cell">所属校区</div></th>
						<th><div class="ivu-table-cell">录入时间</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<template v-if="item.type == 'market'">
							<td>
								<div class="ivu-table-cell">
									<a style="color: #39f" @click="viewObjInfo('market')">{{item.name}}</a>
								</div>
							</td>
							<td><div class="ivu-table-cell"><Tag color="yellow">市场名单</Tag></div></td>
							<td><div class="ivu-table-cell">{{item.cu_assigned_eid|ename('-')}}</div></td>
							<td><div class="ivu-table-cell">{{item.tel}}</div></td>
						</template>
						<template v-else-if="item.type == 'customer'">
							<td>
								<div class="ivu-table-cell">
									<a style="color: #39f" @click="viewObjInfo('customer',item)">{{item.name}}</a>
								</div>
							</td>
							<td><div class="ivu-table-cell"><Tag color="green">客户</Tag></div></td>
							<td><div class="ivu-table-cell">{{item.follow_eid|ename('-')}}</div></td>
							<td><div class="ivu-table-cell">{{item.first_tel}}</div></td>
						</template>
						<template v-else-if="item.type == 'student'">
							<td>
								<div class="ivu-table-cell">
									<avatar-and-name :name="item.student_name" :showAvatar="false" :detailAction="2" :sid="item.sid" />
								</div>
							</td>
							<td><div class="ivu-table-cell"><Tag color="blue">正式学员</Tag></div></td>
							<td><div class="ivu-table-cell">{{item.eid|ename('-')}}</div></td>
							<td><div class="ivu-table-cell">{{item.first_tel}}</div></td>
						</template>
						<template v-else-if="item.type == 'employee'">
							<td>
								<div class="ivu-table-cell">
									<employee-name :name="item.ename" :showAvatar="false" :detailAction="1" :sid="item.eid" />
								</div>
							</td>
							<td><div class="ivu-table-cell"><Tag color="#2db7f5">员工</Tag></div></td>
							<td><div class="ivu-table-cell">-</div></td>
							<td><div class="ivu-table-cell">{{item.mobile}}</div></td>
						</template>
						<td><div class="ivu-table-cell">{{item.bid|branch_name}}</div></td>
						<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
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
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import EmployeeName from 'c%/EmployeeName'
	import AvatarAndName from 'c%/AvatarAndName'

	export default {
		mixins: [modal,common,globals],
		components: {
			EmployeeName,
			AvatarAndName
		},
		props: {
			data: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {

			}
		},
		methods: {
			viewObjInfo(type, item) {
				if(type == 'market') {
					this.$router.push('/recruiting/market/clue');
				}
				else if(type == 'customer') {
					this.$router.push('/recruiting/list/'+ item.cu_id);
				}
			}
		}
	}
</script>