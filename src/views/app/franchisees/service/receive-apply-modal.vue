<template>
	<Modal v-drag-modal :mask-closable="false" width="700" v-model="modal$.show" :title="modal$.title">
		<Button type="primary" icon="refresh" class="mb-2" @click="init_data">刷新</Button>
		<div class="pull-right">
            <per-scope per="franchisee.allService" @on-change="perScopeChange"></per-scope>
       	</div>
		<Table 
            v-loading.like="'franchisee_service_applys'" 
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [grid,modal,common,globals],
		data() {
			return {
				rest_api: 'franchisee_service_applys/get_all_applys',
				pk: 'fsa_id',
				type_service: '',
				column_keys: {
					franchisee: {
						title: '加盟商',
						fixed: 'left',
						width: 130
					},
					title: {
						title: '标题',
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
						width: 140
					},
					finish_time: {
						title: '完成时间',
						width: 140
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
					franchisee(h,params) {
						return h('span',params.row.franchisee.org_name)
					},
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
					status(h,params) {
						let	status = params.row.status
						let map = {0:['待服务','text-danger'],1:['已接受','text-info'],2:['已完成','text-success']}
						return h('span',{
							class:map[status][1]
						},map[status][0])
					},
					operation(h,params) {
						let btn = '-'
						let	status = params.row.status
						if(status == 0) {
							btn = h('Button',{
								props:{
									size: 'small',
									type: 'primary'
								},
								on: {
									click:() => {
										this.receiveApply(params.row)
									}
								}
							},'接受')
						}else if(status == 1) {
							btn = h('Button',{
								props:{
									size: 'small',
									type: 'primary'
								},
								on: {
									click:() => {
										this.completeApply(params.row)
									}
								}
							},'添加记录')
						}
						return h('div',[btn])
					}
				}
			}
		},
		watch: {
			'type_service': function (val) {
				this.init_data()
			}
		},
		methods: {
			perScopeChange(v) {
				this.type_service = v
			},
			receiveApply(row) {
				this.$rest('franchisee_service_applys').add_url_param(row.fsa_id,'doreceive')
				.post()
				.success(res => {
					this.$Message.success('接受成功')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			completeApply(row) {
				this.$Modal.open('app/franchisees/service/info-modal.vue',{
					props: {
						apply: row
					},
					on: {
						save:() => {
							this.init_data()
							this.$emit('save')
						}
					}
				})
				.then(modal => {
					modal
					.show('添加服务记录','add')
				})
			},
			hook_get_param(params) {
				params.with = 'franchisee'
				if(this.type_service=='my') {
					params.service_eid = this.eid$
				}
			}
		}
	}
</script>