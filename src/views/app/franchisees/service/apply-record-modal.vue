<template>
	<Modal v-drag-modal :mask-closable="false" width="700" v-model="modal$.show" :title="modal$.title">
		<Button type="primary" icon="refresh" class="mb-2" @click="init_data">刷新</Button>
		<Table 
            v-loading="'franchisee_service_applys'" 
            :page-size="pageSize" 
            :page="pageIndex" 
            :stripe="true" 
            :show-header="true" 
            :data="data" 
            :columns="columns" 
            :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
            :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
            @on-sort-change="sortChange"> 
        </Table>
        <div class="text-right mt-4">
            <Page 
            	size="small"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [grid,modal,common,globals],
		data() {
			return {
				rest_api: 'franchisee_service_applys',
				pk: 'fsa_id',
				column_keys: {
					title: {
						title: '标题',
						fixed: 'left',
						width: 150
					},
					status: {
						title: '状态',
						width: 80
					},
					fc_service_did: {
						title: '服务类型',
						width: 100
					},
					apply_eid: {
						title: '申请人',
						width: 100
					},
					service_fee: {
						title: '服务费用',
						width: 100
					},
					receive_time: {
						title: '接受时间',
						width: 150
					},
					finish_time: {
						title: '完成时间',
						width: 150
					},
					remark: {
						title: '备注',
						width: 180
					},
					operation: {
						title: '操作',
						fixed: 'right',
						width: 100
					}
				},
				column_render: {
					apply_eid(h,params) {
						return h('span',this.$filter('ename')(params.row.apply_eid))
					},
					fc_service_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.fc_service_did,'fc_service'))
					},
					service_fee(h,params) {
						let icon = h('Icon',{
							props: {
								type: 'social-yen'
							}
						})
						return h('span',[icon,params.row.service_fee])
					},
					status(h,params) {
						let map = {0:['待服务','text-danger'],1:['已接受','text-info'],2:['已完成','text-success']}
						return h('span',{
							class:map[params.row.status][1]
						},map[params.row.status][0])
					},
					receive_time(h,params) {
						if(params.row.receive_time!=0) {
							return h('span',params.row.receive_time)
						}
						return h('span','-')
					},
					finish_time(h,params) {
						let result = '-'
						if(params.row.int_day!=0) {
							result = params.row.int_day
							if(params.row.int_hour!=0) {
								result = result+' '+params.row.int_hour
							}
						}
						return h('span',result)
					},
					operation(h,params) {
						let edit_btn = h('Button',{
							props:{
								type:'ghost',
								size:'small',
								icon:'edit'
							},
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
							on:{
								click:()=>{
									this.delInfo(params.row)
								}
							}
						})
						return h('ButtonGroup',[edit_btn,del_btn])
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			editInfo(row) {
				this.$Modal.open('app/franchisees/service/apply-modal.vue')
				.then(modal => {
					modal
					.set('info',row)
					.show('编辑服务申请','edit')
				})
			},
			delInfo(row) {
				this.confirm()
				.then(() => {
					this.delete(row)
				})
			}
		}
	}
</script>