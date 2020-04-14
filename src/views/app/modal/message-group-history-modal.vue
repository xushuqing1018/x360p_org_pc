<template>
	<Modal v-drag-modal :mask-closable="false" width="800" v-model="modal$.show" :title="modal$.title">
		<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
				<Form-item label="发送日期" prop="int_day" class="col-md-4 col-sm-6">
    				<date-range-picker v-model="search_field.create_time" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="发送人" prop="create_uid" mode="user" class="col-md-4 col-sm-6">
					<select-employee v-model="search_field.create_uid" clearable></select-employee>
				</Form-item>   
    			
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                    <Button type="primary" @click="search" icon="ios-search">查询</Button>           	
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button> 
                </Col>
           </Row>	
    	</div>
    	<div class="box box-result">  
			<Table 
				v-loading="'message_group_historys'" 
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
			<div class="text-right mt-4">
				<Page 
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

	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	export default {
        mixins: [grid,modal,common],
        props:{
            msgType: {
                type: Number,
                default: 1
            }
		},
		components: {
			selectEmployee,
			dateRangePicker
		},
		data() {
			return {
				rest_api: 'message_group_historys',
				search_field: {
					create_time: [],
					create_uid: -1
				},
				column_keys: {
					content: {
						title: '内容',
						width: 300
					},
					create_employee_name: {
						title: '发送人'
					},
					create_time: {
						title: '发送时间',
						sortable: 'custom'
                    },
                    num:{
                        title:'总人数'
                    },
					success_num:{
						title:'已发送'
					}
				},
				column_render: {
					content(h,params) {
						let content = params.row.content
						if(content.length > 120) {
							return h('Tooltip',{
								props: {
									placement: 'bottom',
									content: content
								}
							},content.substring(0,120)+'...')
						}
						return h('span',content)	
                    },
                    success_num(h,params) {
                        return h('a',{
                            attrs:{
                                class:'x-a-link text-info'
                            },
                            on:{
                                click:() => {
                                    this.showSmsHistory(params.row.mgh_id)
                                }
                            }
                        },params.row.success_num)
					},
				}
			}
		},
		mounted() {
			this.init_data()
        },
        methods:{
            hook_get_param (params) {
				params.type = this.msgType
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
            },
            showSmsHistory(mgh_id){
                this.$Modal.open("app/modal/sms-record-modal.vue",{
                    props:{
                        'mgh-id':mgh_id
                    }
                })
                .then(modal => {
                    modal.show("短信发送明细")
                });
            }
        }
	}
</script>