<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="发布时间" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-Item label="学员" class="col-md-3 mb-0" prop="sid">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-Item>
				<Form-Item label="作品名" class="col-md-3 mb-0" prop="art_name">
					<Input v-model="search_field.art_name" placeholder="请输入作品名"></Input>
				</Form-Item>
				<Form-Item :label="label_teacher" class="col-md-3 mb-0" prop="eid" v-if="type_artwork=='all'">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-Item>				
			</Form>
			
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0">
	            	<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<Button type="primary" @click="exportExcel('作品列表')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
                	<div class="pull-right">
                        <per-scope per="artwork.all" @on-change="perScopeChange"></per-scope>
                   	</div>                	
	            </Col>
	        </Row>    
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
	            <Button type="primary" @click="addInfo" icon="plus" v-per="'artwork.add'">添加作品</Button>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'student_artworks'" 
		            	ref="tableExcel"
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
		                	@on-page-size-change="pagesize">
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
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectStudent,
			SelectEmployee,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'student_artworks',
				pk: 'sart_id',
				type_artwork: '',
				search_field: {
					art_name: '',
					sid: 0,
					eid: 0,
					create_time: []
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					art_name: {
						title: '作品名',
						show: true
					},
					art_desc: {
						title: '作品简介',
						show: true
					},
					eid: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					create_time: {
						title: '发布时间',
						show: true
					}
				},
				column_render: {
					sid (h,params) {
						return h('avatar-and-name',{
							props: {
								src: params.row.student.photo_url,
								name: params.row.student.student_name,
								sex: params.row.student.sex,
							}
						})
					},
					art_name (h,params) {
						return h('a',{
							'class':'x-a-link text-info',
							on:{
								click: ()=>{
									this.infoDetail(params.row)
								}
							}
						},params.row.art_name)
					},
					art_desc (h,params) {
						return h('Tooltip',{
							'class':'x-tooltip',
							props: {
								content: params.row.art_desc								
							}
						},[
							h('p',{
								'class': 'text-over-elips',
								style: {
									width: '150px'
								},
							},params.row.art_desc)
						])
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					}
				},
				operation_keys: {
					view: {
						title: '查看',
						type: 'eye'
					},
					edit: {
						title: '编辑',
						type: 'edit',						
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'artwork.delete'
					}
				},
				operation_func: {
					view (params) {
						this.infoDetail(params.row)
					},
					edit (params) {
						this.editInfo(params.row)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_artwork': function (val) {
				this.init_data()
			}
		},
		methods: {
			perScopeChange(value) {
	            this.type_artwork = value
	        },
			infoDetail (row) {
				this.$Modal.open('service/aclass/artwork/info-modal.vue',{

				})
				.then(modal => {
					modal
					.set('info',util.copy(row))
					.show('查看作品','view')
				})
			},
			editInfo (row) {
				this.$Modal.open('service/aclass/artwork/info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',util.copy(row))
					.show('编辑作品','edit')
				})
			},
			delInfo (row) {
				let tip = util.sprintf('确定删除【%s】的作品【%s】吗？',row.student.student_name,row.art_name)
				this.confirm(tip)
				.then(()=>{
					this.delete(row)
				})
			},
			addInfo () {
				this.$Modal.open('service/aclass/artwork/info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.show('添加作品','add')
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				params.with = 'student'
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_artwork=='my'){
					params.eid = this.eid$
				}				
			}
		}
	}
</script>

<style>
</style>