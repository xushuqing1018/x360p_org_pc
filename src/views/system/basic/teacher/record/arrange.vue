<template>
	<div class="c-grid" style="padding:0">
		<div class="box box-result" style="box-shadow:none;padding:0">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
	    	</div>
			<div class="content">
		        <div class="content-body">
		            <Table 
		            v-loading.like="'course_arranges'" 
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
                    <div class="pagenation">
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
		    </div>
		</div>
	</div>
</template>

<script>
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	
	export default{
		mixins: [common,globals,grid],
		props: {
			eid: {
				type: Number,
				default: 0
			}
		},
		watch: {
			eid(id) {
				this.rest_api = 'course_arranges?teach_eid='+id
				this.init_data()
			}
		},
		data () {
			return {
				rest_api: 'course_arranges?teach_eid='+this.eid,
				column_keys:{            	
	                bid:{
	                    title:'校区',
	                    sortable:'custom',
	                    show:true,
	                },
	                int_day:{
	                	title:'日期',
	                	sortable:'custom',
	                	show:true
	                },				
	                time_section:{
	                	title:'时段',
	               		show:true
	                },
	                second_eid:{
	                    title:'助教',
	                    sortable:'custom',
	                    show:false,
	                },
	                teach_object:{
	                    title:'授课对象',
	                    show:true
	                },
	                cr_id:{
	                    title:'教室',
	                    sortable:'custom',
	                    show:true
	                },
	                is_attendance:{
	                	title:'考勤',
	                	sortable:'custom',
	                	show:true
	                }
	            },
	            column_render: {
	                is_attendance(h,params){
	                	let map_tag =  {
		                		0:{color:'default',label: '未考勤'},
		            			1:{color:'yellow',label: '部分考勤'},
		        				2:{color:'green',label: '已考勤'}
		                	},
		                	tag = map_tag[params.row.is_attendance]
	                   
		                return h('Tag',{
		                    props:{
		                        color: tag.color
		                    }
		                },tag.label)
	                }                 
	            },
            }
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				params.with = 'students,one_class'
			}
		}
	}
</script>
