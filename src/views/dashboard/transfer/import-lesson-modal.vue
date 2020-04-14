<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">    
		<div class="content-body">
	        <Table 
		        v-loading="'student_lesson_import_logs'" 
		        ref="tableExcel"
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	export default {
        mixins:[modal,globals,common,grid],
        props:{
            sid:{
                type:Number,
                default:0
            },
            item:{
                type:Array,
                default(){
                    return []
                }
            }
        },
		data() {
			return {
                rest_api: 'student_lesson_hours/get_important_hours',
                data:this.item,
                total:this.item.length,
				column_keys: {
					sj_ids:{
						title:'适用科目',
						show:true
					},
					lid:{
						title:'课程名称',
						show:true
					},
					remain_lesson_hours:{
						title:'课时数量',
						show:true
					},
					unit_lesson_hour_amount: {
						title:'课时单价',
						show:true
					},
					operation: {
						title: '操作',
						show:true
					}
				},
				column_render: {
                    operation(h,params){
                        if(params.row.remain_lesson_hours > 0){
                            return h('Button',{
							    	attrs:{
							    		title: '结转'
							    	},
							    	props:{
							    		size: 'small'
							    	},
							    	on: {
							    		'click':()=>{
							    			this.transfer(params.row)
							    		}
							    	}
							    },'结转')
                        }
                    }
				}
			}
		},
		methods: {
			hook_get_param (params) {
                params.sid = this.sid
			},
			transfer(row) {
                row.unit_lesson_hour_amount = row.unit_lesson_hour_amount * 1
                row.lesson_hours = parseFloat(row.lesson_hours)
				this.$Modal.open('dashboard/transfer/import-transfer-modal.vue',{
                    props:{
                        item:row
                    },
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('导入课时结转')
				})
            },
            close(){
                this.$emit('on-success')
                this.modal$.show = false
            }
		}
	}
</script>