<template>
<div class="c-grid">
	<div class="box box-query">
		<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
			<Form-Item label="学员姓名" class="col-md-3 mb-0" prop="sid">
				<select-student v-model="search_field.sid" clearable></select-student>
			</Form-Item>
			<Form-Item label="班级" class="col-md-3 mb-0" prop="cid">
				<select-class v-model="search_field.cid" clearable></select-class>
			</Form-Item>
		</Form>
		<Row class="basic">
	    <Col span="24" class="mt-2" style="margin-left: 0">
	      <Button-group>
          <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
        </Button-group>
				<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
				<div class="pull-right">
          <per-scope per="edugrowup.all" @on-change="perScopeChange"></per-scope>
        </div>    				          	
	    </Col>
	  </Row>
	</div>
  <div class="box box-result">
	        <div class="content">
						<div class="toolbar">
	      			<Button type="primary" icon="plus" v-per="'edugrowup.add'" @click="addInfo">创建成长对比</Button>
	      			<filter-column :keys="column_keys"></filter-column>
	      		</div>
	        	<div class="content-body">
		            <Table 
                  v-loading="'edu_growups'"
		            	ref="table"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
		            	:stripe="true" 
		            	:show-header="true" 
		            	:data="data" 
		            	:columns="columns" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
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
	import ExportButton from 'c%/ExportButton.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectClass from 'c%/SelectClass.vue'
  
  export default {
    name: "edugrowup",
    mixins:[ grid,common,globals],
		components: {
			ExportButton,
			SelectStudent,
			SelectClass,
		},
		data () {
			return {
				rest_api: "edu_growups",
				pk: "eg_id",
				type_edugrowup: '',
				search_field: {
					cid: 0,
					sid: 0
				},
        column_keys: {
					students_name: {
						title: '学生姓名',
						show: true,
					},
					students_class: {
						title: '学生班级',
						show: true,
          },
          title: {
						title: '对比标题',
						show: true,
          },
        },
        operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'edugrowup.delete'
					}
        },
        column_render: {
          students_name(h, param) {
						return h('a',{
							attrs: {
								class: 'x-a-link text-info'
							},
							on: {
								click: ()=>{
									this.edugrowupDetail(param.row.eg_id)									
								}}
							},param.row.student.student_name)
          },
          students_class(h, param) {
						let name = h('span',param.row.one_class.class_name)
						return h('div',[name])
          }
				},
				operation_func:{
					edit(param) {
						this.editInfo(param.row.eg_id)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
      }
		},
		watch: {
			'type_edugrowup': function (val) {
				this.init_data()
			}
		},
    methods: {
      resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			perScopeChange(value) {
	      this.type_edugrowup = value
			},
			edugrowupDetail (eg_id) {
				this.setStateSearchInfo()
				this.$router.push({path: '/service/edugrowup/'+eg_id})
			},
			delInfo (row) {
				this.confirm('确定删除本次成长对比吗？').then(()=>{
					this.delete(row)
				})
			},
			editInfo (row) {
				this.edugrowupDetail(row)
			},
			addInfo () {
				 this.$Modal.open('service/aclass/edugrowup/add-modal.vue',{
					on: {
						'on-success': () => {
							this.init_data();
						}
					}
				})
				.then(modal => {
					modal.show('添加成长对比')
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				params.with = 'student,one_class'				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
							params[o] = property	
					}
				}
				if(this.type_edugrowup=='my'){
					params.eid = this.eid$
				}
			},
    },
    mounted () {
      this.init_data()
    }
  }
</script> 

<style lang="less">
</style>