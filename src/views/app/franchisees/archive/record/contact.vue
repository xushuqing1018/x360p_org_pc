<template>
	<div class="c-grid">
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" @click="addContact" icon="plus" v-per="'contact.add'">添加联系人</Button>
				<Button class="ml-2" type="primary" @click="search" icon="ios-search">刷新</Button>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        	v-loading.like="'persons'"
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :stripe="true" 
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        @on-sort-change="sortChange"
				        > 
			        </Table>
			    </div>
		    </div>
	    </div>
    </div>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs//grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common,grid],
		data() {
			return {
				rest_api: 'franchisees/'+this.$route.params.id+'/persons',
				pk:'fcp_id',
				column_keys: {
					name: {
						title: '姓名',
						show: true
					},
					mobile: {
						title: '手机号',
						show: true
					},
					email: {
						title: '邮箱',
						show: true
					},
					id_card_no: {
						title: '身份证号',
						show: true
					},
					address: {
						title: '通讯地址',
						show: true
					},
					is_partner: {
						title: '合伙人',
						show: true
					},
					is_contract_sign: {
						title: '合同签约人',
						show: true
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
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'contact.edit'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'contact.delete'
					}
                },
				operation_func: {
					edit(params) {
						this.editInfo(params.row)
					},
					del(params) {
						this.delContact(params.row)
					}
				}
			}
		},
		mounted() {
			this.getContactList()
		},
		methods: {
			getContactList() {
				this.$rest(this.rest_api)
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
						'fc-id': this.$route.params.id
					},
					on: {
						save: () => {
							this.getContactList()
						}
					}
				})
				.then(modal => {
					modal.show('添加联系人','add')
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