<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="750" class="integral-rules">
		<div class="mb-2">
			<Button type="primary" icon="plus" @click="addRule" v-per="'integral.ruleadd'">新增</Button>
		</div>
		<div class="content-body">
	        <Table 
		        v-loading="'credit_rules'" 
		        ref="tableExcel"
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
	    </div>
	    <div class="content-footer">
	        <div class="clearfix mt-2">
	            <Page 
	            	class="pull-right"
	            	size="small"
		            :total="total" 
		            :current="pageIndex" 
		            :show-sizer="true" 
		            :page-size="pageSize" 
		            :show-total="true" 
		            @on-change="pagenation" 
		            @on-page-size-change="pagesize">
	            </Page>
	        </div>
	    </div> 
	    <div slot="footer">
	    	<Button type="ghost" @click="close">关闭</Button>
	    </div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [grid,modal,common,globals],
		data() {
			return {
				rest_api: 'credit_rules',
				pk: 'cru_id',
				column_keys: {
					rule_name: {
						title: '规则名称',
						show: true
					},
					type: {
						title: '积分操作',
						sortable: 'custom',
						show: true
					},
					credit: {
						title: '积分规则',
						show: true
					},
					cate: {
						title: '积分类型',
						sortable: 'custom',
						show: true
					},
					enable: {
						title: '是否启用',
						show: true
					},
					operate: {
						title: '操作',
						show: true,
						width: 100
					}
				},
				column_render: {
					type(h,params) {
						const map = {1:'加分',2:'减分'}
						return h('span',map[params.row.type])
					},
					credit(h,params) {
						let hook = params.row.hook_action,
							rule = params.row.rule
						if(hook&&rule) {
							if(hook=='order_pay') {
								return h('span',`每缴费${rule.amount}元，加${rule.credit}分`)
							}else if(hook=='review'&&_.isArray(rule)) {
								let result = []
								rule.forEach(r=>{
									result.push(h('div',`${r.star}星加${r.credit}分`))
								})
								return h('div',result)
							}
						}else{
							if(params.row.credit == 0) {
								if(params.row.type == 1) {
									return h('span','加分不限制')
								}else{
									return h('span','减分不限制')
								}
							}else{
								const map = {1:'加',2:'减'}
								return h('span',map[params.row.type]+params.row.credit+'分')
							}
						}
					},
					cate(h,params) {
						const map = {1:'学习积分',2:'消费积分'}
						return h('span',map[params.row.cate])
					},
					enable(h,params) {
						return h('i-switch',{
    						props: {
    							size:'small',
    							trueValue: 1,
    							falseValue: 0,
    							value: params.row.enable
    						},
    						on: {
    							'on-change': (value) => {
    								let row = util.copy(params.row)
    								if(value) {
    									row.enable = 1
    								}else{
    									row.enable = 0
    								}
    								this.switchEnable(row)
    							}
    						}}
					    )
					},
					operate(h,params) {
						let edit_btn = h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								size: 'small',
								icon: 'edit'
							},
							'class': {
								'mr-2':true
							},
							attrs: {
								title: '编辑'
							},
							on: {
								click:() => {
									this.editInfo(params.row)
								}
							}
						})
						let del_btn = h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								size: 'small',
								icon: 'ios-trash'
							},
							attrs: {
								title: '删除'
							},
							on: {
								click:() => {
									this.delRule(params.row)
								}
							}
						})
					    let btns = []
					    btns.push(edit_btn)
					    if(params.row.is_system==0) {
					    	btns.push(del_btn)
					    }
					    return h('div',btns)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			editInfo(row) {
				if(row.hook_action) {
					this.$Modal.open('business/student/integral/builtin-info-modal.vue',{
						on: {
							'save':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						let info = util.copy(row)
						info.credit  = util.float(info.credit)
						modal.vuec
						.set('info',info)
						.show(info.rule_name,'edit')
					})
				}else{
					this.$Modal.open('business/student/integral/rule-info-modal.vue',{
						on: {
							'save':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						let info = util.copy(row)
						info.credit  = util.float(info.credit)
						modal.vuec
						.set('info',info)
						.show('编辑规则','edit')
					})
				}
			},
			delRule(row) {
				this.confirm('确定删除该积分规则吗？')
				.then(() => {
					this.delete(row)
				})
			},
			switchEnable(row) {
				this.$rest(this.rest_api).add_url_param(row.cru_id)
				.put(row)
				.success(res => {
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			addRule() {
				this.$Modal.open('business/student/integral/rule-info-modal.vue',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('新增规则','add')
				})
			}
		}
	} 
</script>