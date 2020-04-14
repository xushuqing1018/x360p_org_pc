<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                <Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
				</Form-item>			
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">     
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
        mixins: [ grid, common, globals ],
        props:{
           item:{
               type:Object,
               default:{}
           },
           is_attend:{
               type:Number,
               default:-1
           },
           attend_time:{
               type:Number,
               default:0
           }
        },
		components: {
			SelectStudent
        },
		data () {
			return {
				rest_api: 'event_sign_ups/get_list_new',
				pk: 'esu_id',
				search_field: {
					sid: 0
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
					is_attend: {
						title: '是否签到',
						show: true
					},
					attend_time: {
						title: '签到时间',
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
					is_attend (h,params) {
						if(params.row.is_attend==0){
							return h('div',[
								h('span',{'class':'mr-3'},'未签到')
							])
						}else{
							return h('span',{
								'class':'text-success'
							},'已签到')
						}
					},
					attend_time (h,params) {
						let result = params.row.attend_time
						
						if(result == '1970-01-01 08:00:00'){
							result = '-'
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
                    if(property){
	                    params[o] = property    
	                }                          
                }

                params.event_id = this.item.event_id
                params.with = 'student'
                
                if(this.is_attend != -1){
                    params.is_attend = this.is_attend
                }
                if(this.attend_time != 0){
                    params.attend_time = util.sprintf('[gt,%s]',this.attend_time)
                }
			}
		}
	}
</script>

<style>
</style>