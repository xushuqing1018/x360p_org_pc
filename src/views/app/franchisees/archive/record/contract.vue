<template>
	<div class="c-grid">
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" @click="add" icon="plus" v-per="'francharchive.contract'">创建合同</Button>
				<Button class="ml-2" type="primary" @click="search" icon="ios-search">刷新</Button>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        	v-loading.like="'franchisee_contracts'"
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
			    <div class="content-footer">
			        <div class="pagenation">
			            <Page 
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
		    </div>
	    </div>
    </div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,globals],
		data () {
			return {
				id: this.$route.params.id,
				rest_api: 'franchisee_contracts',
				pk: 'fcc_id',
				search_field: {
					fc_id: '',
					contract_end_int_day: [],
					sign_eid: 0
				},
				column_keys: {
					fc_id: {
						title: '加盟商',
						fixed: 'left',
						width: 150,
						show: true
					},
					contract_no: {
						title: '合同号',
						width: 150,
						show: true
					},
					contract_start_int_day: {
						title: '合同开始日期',
						width: 150,
						sortable: 'custom',
						show: true
					},
					contract_end_int_day: {
						title: '合同结束日期',
						width: 150,
						sortable: 'custom',
						show: true
					},
					open_int_day: {
						title: '开业日期',
						sortable: 'custom',
						width: 150,
						show: true
					},
					region_level: {
						title: '区域性质',
						width: 120,
						show: true
					},
					join_fee1: {
						title: '特许经营费',
						width: 120,
						show: true
					},
					join_fee2: {
						title: '履约保证金',
						width: 120,
						show: true
					},
					join_fee3: {
						title: '年度使用费',
						width: 120,
						show: true
					},
					join_fee4: {
						title: '教育商品款',
						width: 120,
						show: true
					},
					contract_amount: {
						title: '合同总金额',
						width: 120,
						sortable: 'custom',
						show:true
					},
					all_pay_int_day: {
						title: '全款到账日期',
						width: 150,
						sortable: 'custom',
						show: true
					},
					content: {
						title: '特殊约定',
						width: 500,
						show: true
					},
					sign_eid: {
						title: '签约员工',
						width: 120,
						show: true
					}
				},
				column_render: {
					fc_id(h,params) {
						return h('span',params.row.franchisee.org_name)
					},
					join_fee1(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.join_fee1])
					},
					join_fee2(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.join_fee2])
					},
					join_fee3(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.join_fee3])
					},
					join_fee4(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.join_fee4])
					},
					join_fee1(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.join_fee1])
					},
					contract_amount(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.contract_amount])
					},
					region_level(h,params) {
						let result = '-'
						if(params.row.region_level) {
							let map = ['一','二','三','四','五']
							result = map[params.row.region_level-1]+'类'
						}
						return h('span',result)
					},
					sign_eid(h,params) {
						return h('span',this.$filter('ename')(params.row.sign_eid))
					},
					open_int_day (h,params) {
						return h('span',params.row.open_int_day || '-')
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'franchcontract.edit'
					},
					view: {
						title: '附件',
						type: 'document',
						condition: 'row.franchisee_contract_file.length>0'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'franchcontract.delete'
					}
                },
				operation_func: {
					edit(params) {
						this.editInfo(params.row)
					},
					view(params) {
						this.viewFiles(params.row)
					},
					del(params) {
						this.delContract(params.row)
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			add() {
				this.$Modal.open('app/franchisees/contract/info-modal.vue',{
					props: {
						'fc-id': this.id
					},
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('创建合同')
				})
			},
			editInfo(row) {
				this.$Modal.open('app/franchisees/contract/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					},
					props: {
						franchisee: row.franchisee
					}
				})
				.then(modal => {
					modal
					.set('info',row)
					.show(util.sprintf('编辑合同【%s】',row.franchisee.org_name),'edit')
				})
			},
			delContract(row) {
				this.confirm(util.sprintf('确定删除加盟商【%s】的合同吗？',row.franchisee.org_name))
				.then(() => {
					this.delete(row)
				})
			},
			viewFiles(row) {
				this.$Modal.open('components/PreviewFile.vue@modal',{
					props: {
						list: row.franchisee_contract_file
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('查看合同附件【%s】',row.contract_no))
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='contract_end_int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property!=''&&property!==-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'franchisee_contract_file,franchisee'
				params.fc_id = this.id
			}
		}
	}
</script>
