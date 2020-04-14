<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="800">
		<div class="mb-2">
			<Button 
				type="primary" 
				icon="plus" 
				@click="add">添加
			</Button>
			<Button 
				type="primary"
				icon="refresh"
				@click="init_data">刷新
			</Button>
			<Button 
				type="ghost" 
				size="small" 
				class="pull-right" 
				@click="show_filter=!show_filter">{{show_filter?'隐藏筛选':'显示筛选'}}
			</Button>
		</div>
		<template v-if="show_filter">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="row">
				<Form-item label="课程" prop="lid" class="col-sm-4 mb-1">
					<select-lesson 
						v-model="search_field.lid" 
						clearaable 
						@selected="search"
						@on-clear="search"
						>
					</select-lesson>
                </Form-item>
                <Form-item label="科目" prop="sj_id" class="col-sm-4 mb-1">
                	<Select 
                		v-model="search_field.sj_id" 
                		clearable 
                		@on-change="search" 
                		@on-clear="search"
                		>
						<Option :value="item.sj_id" v-for="item in subjects">{{item.subject_name}}</Option>
					</Select>
                </Form-item>
				<Form-item label="课程等级" prop="product_level_did" class="col-sm-4 mb-1">
					<Select 
						v-model="search_field.product_level_did" 
						clearable
						@on-change="search"
						@on-clear="search"
						>
						<Option :value="item.did" v-for="item in product_levels">{{item.title}}</Option>
					</Select>
				</Form-item>
			</Form>
		</template>
		<div class="content-body">
	        <Table 
		        v-loading="'lesson_price_defines'" 
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
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
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
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectLesson,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'lesson_price_defines',
				pk: 'lpd_id',
				show_filter: false,
				search_field: {
					lid: 0,
					sj_id: 0,
					product_level_did: 0
				},
				column_keys: {
					dtype: {
						title: '定价对象',
						show: true
					},
					sale_price: {
						title: '价格',
						show: true
					},
					dpt_ids: {
						title: '适用范围',
						show: true
					}
				},
				column_render: {
					dtype(h,params) {
						let name = ''
						let dtype = params.row.dtype
							
						if(dtype == 0) {
							name = this.$filter('lesson_name')(params.row.lid)
						}else if(dtype == 1) {
							name = this.$filter('subject_name')(params.row.sj_id)
						}else{
							name = this.$filter('dict_title')(params.row.product_level_did,'product_level')
						}
						return h('span',name)
					},
					dpt_ids(h,params) {
						let bids = params.row.bids
						let dpt_ids = params.row.dept_ids
						let result = []
						if(bids.length > 0 || dpt_ids.length > 0) {
							bids.forEach(b => {
								result.push(this.$filter('branch_name')(b))
							})
							dpt_ids.forEach(d => {
								result.push(this.$filter('dpt_name')(d))
							})
						}else{
							result.push('不限制')
						}
						return h('div',result.join(', '))
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash'
					}
				},
				operation_func: {
					edit(params) {
						let info = util.copy(params.row)
						info.sale_price = Number(info.sale_price)
						var type = 1;
						if(info.bids.length == 0) {
							type = 2;
						}
						this.$Modal.open('system/basic/lesson-price-define/info-modal.vue',{
							on: {
								save:() => {
									this.init_data()
								}
							},
							props: {
								type: type
							}
						})
						.then(modal => {
							modal
							.set('info',info)
							.show('编辑课程定义','edit')
						})
					},
					delete(params) {
						this.confirm('确定删除吗？')
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			add() {
				this.$Modal.open('system/basic/lesson-price-define/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加课程定义','add')
				})
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]	
					if(property&&property!=-1){
						params[o] = property
					}
				}
			},
			close() {
				this.modal$.show = false
			}
		},
		computed: {
			product_levels(){
				return this.$store.state.gvars.dicts.product_level
			},
			subjects() {
				return this.$store.state.gvars.subjects
			}
		}
	}
</script>