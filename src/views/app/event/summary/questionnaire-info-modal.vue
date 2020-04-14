<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div class="c-grid">
	    	<div class="box box-query">
	    		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                    <Form-item label="学员" prop="sid" class="col-md-5 col-sm-6">
	    				<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
	    			</Form-item>			
	    		</Form>
	    		<Row class="basic">
                    <Col span="24" class="mt-2" style="margin-left:0px;">     
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                        <CheckboxGroup class="ml-3" style="display: inline-block;" v-model="search_field.is_questionnaire" prop="is_questionnaire">
                	    	<Checkbox class="mb-0" :label="1">已提交</Checkbox>
                	    	<Checkbox class="mb-0" :label="0">未提交</Checkbox>
                	    </CheckboxGroup>    
                    </Col>
               </Row>
	    	</div>
    
	    	<div class="box box-result">
	    		<div class="content">
	    			<div class="content-body">
	    	            <Table 
	    	            	v-loading="'event_sign_ups'" 
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
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
    import util from '@/libs/util'
    import modal from '@/libs/modal.mixin'
    import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'

	export default {
        mixins:[modal,grid,common],
        components: {
			SelectStudent
        },
        props:{
            item:{
                type:Object,
                default:{}
            }
        },
		data () {
			return {
				rest_api: 'event_sign_ups/get_list_new',
				pk: 'esu_id',
				search_field: {
                    sid: 0,
                    is_questionnaire:[0,1]
				},
				column_keys: {
					name: {
						title: '学员',
						show: true
					},
					tel: {
						title: '联系电话',
						show: true
                    },
                    type: {
						title: '报名类型',
						show: false
                    },
                    is_submit: {
						title: '是否提交',
						show: true
					},
					create_time: {
						title: '问卷提交时间',
						show: true
					}
				},
				column_render: {
					name (h,params) {
						return h('span',params.row.student.student_name)
					},
					tel (h,params) {
						return h('span',params.row.student.first_tel)
                    },
                    type (h,params) {
						let map_status = { 1:'主题交流',2:'旁听' },
							map_class = {1:'text-success',2:'text-primary'}
						return h('span',{
							'class': map_class[params.row.type]
						},map_status[params.row.type])
                    },
                    is_submit (h,params) {
						if(!params.row.questionnaire_answer){
							return h('div',[
								h('span',{'class':'mr-3'},'未提交')
							])
						}else{
							return h('span',{
								'class':'text-success'
							},'已提交')
						}
                    },
					create_time (h,params) {
						let result = '-'
						
						if(params.row.questionnaire_answer){
							result = params.row.questionnaire_answer.create_time
						}
						
						return h('span',result)
					}
				},
			}
        },
        created(){
            if(this.item.event_type_did == 185){
                this.column_keys.type.show = true
            }
        },
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if (o=='is_questionnaire'){
                        if(property.length == 1){
                            params[o] = property[0]
                        }else{
                            params[o] = 2
                        }
                    }else if(property){
	                    params[o] = property
	                }                          
                }

                params.event_id = this.item.event_id
                params.with = 'student'
			}
		}
	}
</script>
