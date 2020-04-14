<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="套餐名称" prop="name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.name" clearable placeholder="请输入套餐名"></Input>
				</Form-item>
				<Form-item label="创建日期" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						placement="right-start" 
						style="width: 100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="创建人" prop="create_uid" class="col-md-3 col-sm-6">
    				<select-employee mode="user" v-model="search_field.create_uid" :clearable="true"></select-employee>
    			</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			 <div class="toolbar">
	        	<Button type="primary" icon="plus" @click="addLessonSuit" v-per="'lesson_suit_define.add'">学习套餐</Button>
	        	<filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'lesson_suit_defines'" 
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
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
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
	        </div>
		</div>
		<info-modal ref="info" @save="init_data"></info-modal>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import InfoModal from './lesson-suit/info-modal.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee  from 'c%/SelectEmployee.vue' 
	export default {
		mixins: [common,globals,grid],
		components: {
			InfoModal,
			DateRangePicker,
			SelectEmployee
		},
		data() {
			return {
				rest_api: 'lesson_suit_defines',
				pk: 'lsd_id',
				search_field: {
					name: '',
					create_time: [],
					create_uid: 0
				},
				column_keys: {
					name: {
						title: '套餐名称',
						show: true
					},
					content: {
						title: '套餐内容',
						show: true
					},
					bid: {
						title: '适用校区',
						show: true
					},
					create_time: {
						title: '创建日期',
						show: true,
						sortable: 'custom'
					},
					create_employee_name: {
						title: '创建人',
						show: true
					}
				},
				column_render: {
					content(h,params) {
						let result = []
						params.row.define.forEach(item => {
							result.push(h('p',`${this.labelDicts(item.product_level_did,'product_level')},
								${item.must?'必报':'非必报'},
								课程数${item.nums}`
							))
						})
						return h('div',{
							style: {fontSize:'12px',lineHeight:'22px'}
						}, result)
					},
					bid(h,params) {
						let name = '',
							bid = params.row.bid
						if(bid > 0) {
							name = this.$filter('branch_name')(bid)
						}else{
							name = '所有校区'
						}
						return h('span',name)
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'lesson_suit_define.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'lesson_suit_define.delete'
					}
				},
				operation_func: {
					edit(params) {
						let info = util.copy(params.row)
						this.$r('info')
						.set('info',info)
						.show(util.sprintf('编辑学习套餐【%s】',info.name),'edit')
					},
					delete(params) {
						this.confirm(util.sprintf('确定删除学习套餐【%s】吗？',params.row.name))
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
			addLessonSuit() {
				this.$r('info').show('添加学习套餐','add')
			},
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				params.bid = util.sprintf('[in,0,%s]',this.bid$)
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>