<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<table class="modal-table">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">签单人</div></th>
					<th><div class="ivu-table-cell">角色</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in data.order_performance">
					<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
					<td><div class="ivu-table-cell">{{labelDicts(item.sale_role_did,'sale_role')}}</div></td>
					<td><div class="ivu-table-cell">
						<Poptip
					        confirm
					        title="确定删除吗？"
					        @on-ok="delPerforamnce(item)">
					        <Button 
								type="ghost" 
								shape="circle" 
								icon="trash-a"
								size="small" 
								title="删除">
							</Button>
					    </Poptip></div>
					</td>
				</tr>
				<tr v-if="action=='add'">
					<td><div class="ivu-table-cell">{{mapLabelText(pf_info.eid,'employee')}}</div></td>
					<td><div class="ivu-table-cell">{{labelDicts(pf_info.sale_role_did,'sale_role')}}</div></td>
					<td>
						<ButtonGroup>
							<Button type="primary" @click="ok" size="small" :disabled="saving">确定</Button>
					        <Button size="small" @click="cancel" :disabled="saving">取消</Button>
						</ButtonGroup>
					</td>
				</tr>
			</tbody>
			<tfoot>
				<tr class="text-center" v-if="action!='add'">
					<td colspan="4">
						<Button 
							type="primary" 
							size="small" 
							@click="add">添加
						</Button>
					</td>
				</tr>
			</tfoot>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
		<select-employee v-show="false" ref="ref_employee" :did="1" @onChange="addSaleRole"></select-employee>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const pfInfo = {
		eid:0,
		sale_role_did:0
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee
		},
		props: {
			data: {
				type:Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {
				pf_info:util.copy(pfInfo),
				action:''
			}
		},
		methods: {
			addSaleRole(item) {
				if(this.data.order_performance.find(d=>d.eid==item.eid)){
					this.$Message.error('请不要重复添加')
					return false
				}
				this.action = 'add'
				Object.assign(this.pf_info,item)
			},
			add() {
				this.$refs.ref_employee.openModal()
			},
			delPerforamnce(item) {
				this.$http.delete('orders/'+this.data.oid+'/salesman',{params:{eid:item.eid}})
				.then(res => {
					this.$Message.success('删除成功')
					this.$emit('on-success')
				},res => {
					this.error(res.body.message)}
				)
			},
			ok() {
				let param = {},salesman=[]
				salesman.push(this.pf_info)
				param.salesman = salesman
				this.$rest('orders').add_url_param(this.data.oid,'salesman')
				.post(param)
				.success(res => {
					this.$Message.success('添加成功')
					this.$emit('on-success')
					this.cancel()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			cancel() {
				this.action = ''
				this.pf_info = util.copy(pfInfo)
			}
		}
	}
</script>