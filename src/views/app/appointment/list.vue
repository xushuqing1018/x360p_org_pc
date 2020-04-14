<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="主题标题" prop="title" class="col-md-3 col-sm-6">
					<Input v-model="search_field.title" placeholder="请输入..."></Input>
				</Form-item>
				<Form-item label="创建时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						label="创建时间" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
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
				<Button class="ml-2" type="primary" icon="plus" @click="addItem">添加预约主题</Button>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
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
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import DateRangePicker from 'c%/DateRangePicker.vue'
		
	export default{
		mixins: [ grid, common, globals ],
		components: {
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'appointment_subjects',		
				search_field: {
                    title: '',
                    create_time:[]
                },
                column_keys: {
					title: {
						title: '标题',
                        show: true
                    },
                    desc: {
						title: '备注说明',
                        show: true
                    },
                    create_time: {
						title: '创建时间',
                        show: true
					}
                },
                operation_keys: {
					show: {
						title: '查看预约时段',
						type: 'eye'
					},
					edit: {
						title: '编辑',
						type: 'edit'
					},
					del: {
						title: '删除',
						type: 'ios-trash'
					}
				},
				operation_func: {
                    show (params) {
						this.showItem(params.row)
					},
					edit (params) {
						this.editItem(params.row)
					},
					del (params) {
						this.delItem(params.row)
					}
				}
			}
		},		
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
                this.$form('ref_search').reset()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
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
			},
			addItem () {
				this.$Modal.open('app/appointment/appointment-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加预约主题','add')
				})
            },
            showItem(item){
                this.$Modal.open('app/appointment/show-timesection-modal.vue',{
                    props:{
                        qid: item.questionnaire_bind ? item.questionnaire_bind.qid : 0,
                        as_id: item.as_id,
                        title: item.title
                    }
				})
				.then(modal=>{
					modal.show(`查看【${item.title}】预约时段信息`)
				})
            },
            editItem(item){
                if(!item.questionnaire_bind){
					item.questionnaire_bind = {
						qid:0,
						bind_table:'appointment'
					}
				}
                this.$Modal.open('app/appointment/appointment-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',item).show('编辑预约主题','edit')
				})
            },
            delItem(item){
                this.$Modal.confirm({
					content: `确认要删除该预约主题吗？`,
					onOk: ()=> {
						this.$http.delete('appointment_subjects/' + item.as_id)
						.then(res => {
                            this.$Message.success('删除成功')
                            this.init_data()
						},res => {
							this.error(res.body.message)
						})
					}
				})
            }
		}
	}
</script>

<style>
</style>