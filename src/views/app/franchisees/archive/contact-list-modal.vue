<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="750">
		<div class="mb-2">
			<Button type="primary" icon="plus" @click="addContact">添加联系人</Button>
			<Button type="primary" icon="refresh" @click="getContactList"></Button>
		</div>
		<Table
			v-loading.like="'persons'"
			:stripe="true"
			:data="data"
			:columns="columns"
			no-data-text="没有数据">
		</Table>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs//grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common,grid],
		props: {
			franchisee: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				rest_api: 'franchisees',
				pk:'fcp_id',
				column_keys: {
					name: {
						title: '姓名',
						fixed: 'left',
						width: 120,
						show: true
					},
					mobile: {
						title: '手机号',
						width: 120,
						show: true
					},
					email: {
						title: '邮箱',
						width: 160,
						show: true
					},
					id_card_no: {
						title: '身份证号',
						width: 180,
						show: true
					},
					address: {
						title: '通讯地址',
						width: 180,
						show: true
					},
					is_partner: {
						title: '合伙人',
						width: 180,
						show: true
					},
					is_contract_sign: {
						title: '合同签约人',
						width: 120,
						show: true
					},
					operation: {
						title: '操作',
						fixed:'right',
						width: 100,
						show:true
					}
				},
				column_render: {
					name(h,params) {
						let map = {1:'male',2:'female'}
						let icon = h('Icon',{
							props: {
								type: map[params.row.sex]
							}
						})
						return h('span',[params.row.name,' ',icon])
					},
					is_partner(h,params) {
						if(params.row.is_partner) {
							return h('span',`是，股权比例：${params.row.partner_percent}%`)
						}else{
							return h('span','否')
						}
					},
					is_contract_sign(h,params) {
						return h('span',params.row.is_contract_sign?'是':'否')
					},
					operation(h,params) {
						let edit_btn = h('Button',{
							props:{
								type:'ghost',
								size:'small',
								icon:'edit'
							},
							directives:[{
								name:'per',
								value:'contact.edit'
							}],
							on:{
								click:()=>{
									this.editInfo(params.row)
								}
							}
						})
						let del_btn = h('Button',{
							props:{
								type:'ghost',
								size:'small',
								icon:'ios-trash'
							},
							directives:[{
								name:'per',
								value:'contact.delete'
							}],
							on:{
								click:()=>{
									this.delContact(params.row)
								}
							}
						})
						return h('ButtonGroup',[edit_btn,del_btn])
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.getContactList()
			},
			getContactList() {
				this.$rest(this.rest_api).add_url_param(this.franchisee.fc_id,'persons')
				.get()
				.success(res => {
					this.data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			addContact() {
				this.$Modal.open('app/franchisees/archive/contact-info-modal.vue',{
					props: {
						'fc-id': this.franchisee.fc_id
					},
					on: {
						save: () => {
							this.getContactList()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('添加联系人【%s】',this.franchisee.org_name),'add')
				})
			},
			editInfo(row) {
				this.$Modal.open('app/franchisees/archive/contact-info-modal.vue',{
					on: {
						save: () => {
							this.getContactList()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',row)
					.show(util.sprintf('编辑联系人【%s】',row.name),'edit')
				})
			},
			delContact(row) {
				this.confirm(util.sprintf('确定删除联系人【%s】吗？',row.name))
				.then(() => {
					this.$rest('franchisee_persons')
					.delete(row.fcp_id)
					.success(res => {
						this.$Message.error('删除成功')
						this.getContactList()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		},
		computed: {

		}
	}
</script>