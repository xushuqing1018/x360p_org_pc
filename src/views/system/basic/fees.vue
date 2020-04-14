<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="杂费名称" prop="name" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.name" placeholder="请输入杂费名"></Input>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                	<Button-group>
                        <Button type="primary" icon="ios-search" v-tooltip="'查询'" @click="search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
            </Row>           
        </div>
        <div class="box box-result">
        	<div class="toolbar">
        		<Button type="primary" @click="add" icon="plus" v-per="'fees.add'">添加杂费</Button>
				<filter-column :keys="column_keys"></filter-column>
        	</div>
        	<div class="content">
				<div class="content-body">
                    <Table 
                    v-loading="'pay_items'" 
                    :page="pageIndex" 
                    :page-size="pageSize" 
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
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    export default {
    	mixins:[common,grid,globals],
    	data () {
			return {
				rest_api:'pay_items',
				pk: 'pi_id',
				search_field: {
					name: ''
				},
				column_keys: {
					name: {
						title: '杂费名称',
						show: true
					},
					unit_price: {
						title: '价格',
						show: true
					},
					is_performance: {
						title: '是否算业绩',
						show: true
					},
					desc: {
						title: '描述',
						show: true
					}
				},
				column_render: {
					unit_price(h,params) {
						let spans = []
						spans.push(this.label_currency)
						spans.push(params.row.unit_price)
						if(params.row.is_flex_price) {
							spans.push(h('span',{
								class: 'text-info',
								style: {
									marginLeft: '6px'
								}
							},'弹性'))
						}
						return h('span',spans)
					},
					is_performance(h,params) {
						return h('span',params.row.is_performance==1?'是':'否')
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'fees.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'fees.delete'
					}
				},
				operation_func: {
					edit(params) {
						this.edit(params.row)
					},
					delete(params) {
						this.confirm(util.sprintf('确定删除杂费【%s】',params.row.name))
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
			add() {
				this.$Modal.open('system/basic/fees/info-modal.vue',{
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加杂费','add')
				})
			},
			edit(row) {
				this.$Modal.open('system/basic/fees/info-modal.vue',{
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = util.copy(row)
					info.unit_price = Number(info.unit_price)
					modal
					.set('info',info)
					.show(util.sprintf('编辑杂费【%s】',row.name),'edit')
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
						params[o] = property	
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
    }
</script>