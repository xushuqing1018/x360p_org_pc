<template>
	<div class="c-grid row">
		<div class="col-sm-7" style="padding-right:0">
			<div class="box box-result">
                <div class="toolbar">
                	<Button type="primary" size="small" icon="plus" @click="add_role">添加权限组</Button>
                	
                </div>
                <div class="content">
                	<div class="content-body">
	                    <Table 
	                    v-loading.like="'roles'" 
	                    :pageSize="pageSize" 
	                    :page="pageIndex" 
	                    :stripe="true" 
	                    :show-header="true" 
	                    :data="data" 
	                    :highlight-row="true"
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
		<div class="col-sm-5">
			<add-employees :row-data="currentRowData"></add-employees>
		</div>
		<info-modal ref="ref_info" @save="refreshData"></info-modal>
	</div>
</template>
<script>

	const doc = 'ivu-icon ivu-icon-document'
	const folder = 'ivu-icon ivu-icon-ios-folder'

	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import InfoModal from './roles/info-modal'
	import dataReady from 'c%/DataReady.vue'
	import AddEmployees from './roles/add-employees'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			InfoModal,
			dataReady,
			AddEmployees
		},
		data() {
			return {
				rest_api: 'roles',
				res_name: '角色',
				pk: 'rid',
				action: '',
				per_action: 'pers',
				operate_rid: '',
				role_pers: [],
				currentRowData: {},
				params:{
	                search_field:'role_name',
	                search_value:'',
	                order_field:'rid',
	                order_sort:'ASC',
	                last_search_value:'',
	                bid: ''
	            },
	            pageSize: 20,
				column_keys: {
					role_name: {
						title: '权限组',
						show: true
					},
					role_desc: {
						title: '描述',
						show: true
					}
				},
				operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit',
                        per: 'roles.edit'
                    },
                    pc_per: {
                        title: '权限',
                        type: 'wrench',
                        per:'roles.per'
                    },
                    delete: {
                    	title: '删除',
                    	type: 'ios-trash',
                    	condition: 'row.is_system==0',
                    	per: 'roles.delete'
                    }
                },
                operation_func:{
                    edit(params){
                        this.$r('ref_info')
                        .set('info', util.copy(params.row))
                        .show(util.sprintf('编辑角色组[%s]',params.row.role_name),'edit')
                    },
                    pc_per(params){
                        this.per_action = 'pers'
                        this.operate_rid = params.row.rid
                        this.$Modal.open('system/staff/roles/select-pers-modal.vue',{
                        	on: {
                        		'save-pers': ({per_list,disable_per_list}) => {
                        			
                        			this.save_pers(per_list,disable_per_list)
                        		}
                        	}
                        })
                        .then(modal => {
                        	modal.vuec
							.setPers(params.row.pers,params.row.disable_pers)
							.show(util.sprintf('修改权限[%s]',params.row.role_name), 'pc_per')
                        })
                    },
                    delete(params){
                        this.confirm('您确定要删除角色组【'+params.row.role_name+'】吗?')
                        .then(()=>{
                            this.delete(params.row)
                            .then((response)=>{
                                this.$Message.success('删除成功!')
                                this.refreshData()
                            })
                        })       
                    }
                },
                column_render: {
                	role_name(h, params) {
                		return h('span', {
                			attrs: {
                				class: 'text-info cursor',
                			},
                			on: {
                				click:()=>{
                					this.currentRowData = params.row
                				}
                			}
                		},params.row.role_name)
                	}
                }
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			add_role() {
				this.$r('ref_info').show('添加权限组','add')
			},
			init_role_per(pers,per_type) {
				let pers_set = new Set()
				let per_temp = 'role_'+per_type
				this[per_temp] = []
				if(pers && pers.length > 0) {
					pers.forEach(item => {
						pers_set.add(item)
					})
				}
				this[per_type].forEach(item => {
					if(item.sub && item.sub.length > 0) {
						let children_1 = []
						item.sub.forEach(item => {
							if(item.sub && item.sub.length > 0) {
								let children_2 = []
								item.sub.forEach(item => {
									children_2.push({
										title: item.text,
										uri: item.uri,
										icon: item.sub ? folder : doc,
										selected: pers_set.has(item.uri)
									})
								})
								let len = children_2.filter(i => i.selected).length
								let opened = len > 0
								let selected_part = len < children_2.length && len > 0
								children_1.push({
									opened: opened,
									title: item.text,
									uri: item.uri,
									icon: item.sub ? folder : doc,
									selected: pers_set.has(item.uri),
									selected_part: selected_part,
									children: children_2
								})
							}else{
								children_1.push({
									opened: false,
									title: item.text,
									uri: item.uri,
									icon: item.sub ? folder : doc,
									selected: pers_set.has(item.uri)
								})
							}
						})
						let len = children_1.filter(i => i.selected).length
						let opened = len > 0
						let selected_part = len < children_1.length && len > 0
						this[per_temp].push({
							opened: opened,
							title: item.text,
							uri: item.uri,
							icon: folder,
							selected: pers_set.has(item.uri),
							selected_part: selected_part,
							children: children_1
						})
					}else{
						this[per_temp].push({
							opened: false,
							title: item.text,
							uri: item.uri,
							icon: folder,
							selected: pers_set.has(item.uri)
						})
					}
				})
			},
			save_pers(list,disable_list) {
				let per_action = this.per_action
				let put_data = {}
				put_data[per_action] = list

				if(put_data[per_action].length == 0){
					this.$Message.error('请勾选权限后再保存!')
					return false
				}

				if(typeof disable_list != 'undefined'){
					put_data['disable_'+per_action] = disable_list
				}

				this.$rest('roles')
				.add_url_param(this.operate_rid)
                .put(put_data)
                .success(response=>{
                    this.init_data()
                    this.$Message.success('权限修改成功!')
                })
                .error(response=>{
                    this.error(response.body.message)
                })
			},
			get_pers(list) {
				let pers = []
				list.forEach(item => {
					pers.push(item.value)
				})
				return pers
			},
			clickRow(row, index) {
				this.currentRowData = row
			},
			deal_data(data){
				this.currentRowData = data.list[0]
				data.list[0]._highlight = true
	        	return data.list
	        },
	        refreshData(){
	        	this.$store.dispatch('updateGlobalVar','navs')
	        	this.$store.dispatch('updateGlobalVar','words')
	        	this.$store.dispatch('updateGlobalVar','pers')
	        	this.init_data()
	        }
		}
	}
</script>
