<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="70">
				<Form-item label="类别" class="mb-0">
					<Select v-model="search_field.type" style="width:150px;">
						<Option value="all">不限</Option>
						<Option value="client">往来单位</Option>
						<Option value="item">项目</Option>
						<Option value="employee">人员</Option>
					</Select>
				</Form-item>
			</Form>
		</div>
		
		<div class="box box-result">
			<Button type="primary" icon="plus" @click="addInfo" class="mb-3" v-per="'help.add'">
				添加
				<help-info ref="info" @on-success="init_data"></help-info>
			</Button>
			<div class="content">
				 <div class="content-body">
	                <Table 
	                    v-loading="'tally_helps'" 
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
		                <div class="pagenation">
		                    <Page :total="total" 
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
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import helpInfo from './help-info.vue'
	
	export default{
		mixins: [grid,common],
		components: {
			helpInfo
		},
		data () {
			return {
				rest_api: 'tally_helps',
				pk: 'th_id',
				map_type: {'client':'往来单位','employee':'人员','item':'项目'},
				search_field: {
					type: 'all'
				},
				column_keys: {
					type: {
						title: '类别',
						show: true
					},
					name: {
						title: '名称',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					}					
				},
				column_render:{
					type (h,params) {
						return h('span',this.map_type[params.row.type])
					}					
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: ''
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: ''
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					del (params) {
						let tip = util.sprintf('确认删除%s【%s】吗？',
									this.map_type[params.row.type],
									params.row.name)
						
						this.confirm(tip)
						.then(()=>{
							this.delete(params.row)
						})
					}
				}
			}
		},
		watch: {
			'search_field.type': function (val) {
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				if(this.search_field.type!='all'){
					params.type = this.search_field.type					
				}
			},
			editInfo (row) {
				let obj = util.copy(row)
				Vue.delete(obj,'_index')
				Vue.delete(obj,'_rowKey')
				
				this.$r('info')
				.set('type',obj.type)
				.set('info',obj)
				.show('修改类别【'+this.map_type[obj.type]+'】','edit')
			},
			addInfo () {
				this.$r('info')
				.set('type','')
				.show('添加类别','add')
			}
		}
	}
</script>
