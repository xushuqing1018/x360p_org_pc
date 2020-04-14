<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
    	<div class="c-grid">
		    <div class="box box-query">
		    	<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
		    		<Form-item label="预约日期" prop="int_day" class="col-md-6 col-sm-6">
		    			<date-range-picker 
		    				v-model="search_field.int_day"
		    				label="预约日期" 
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
		    		<Button class="ml-2" type="primary" icon="plus" @click="addTimesection">添加预约时段</Button>
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
        <div slot="footer">
            <Button type="default" @click="cancle">关闭</Button>
        </div>
    </Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
    import common from '@/libs/common.mixin'
    import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin' 

    import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
        mixins: [common,grid,modal],
        components:{
            DateRangePicker
        },
        props:{
            as_id:{
                type:Number,
                default:0
            },
            qid:{
                type:Number,
                default:0
            },
            title:{
                type:String,
                default:''
            }
        },
		data() {
			return {
                rest_api: 'appointment_time_sections',		
				search_field: {
                    int_day:[]
                },
                column_keys: {
					int_day: {
						title: '预约日期',
                        show: true
                    },
                    int_hour: {
						title: '预约时段',
                        show: true
                    },
                    limit_nums: {
						title: '限制预约人数',
                        show: true
					}
                },
                column_render: {
                    int_day (h,params) {
						return h('span',params.row.int_day)
					},
					int_hour (h,params) {
                        let start_hour = this.$filter('int_hour')(params.row.int_start_hour)
                        let end_hour = this.$filter('int_hour')(params.row.int_end_hour)
						return h('span',start_hour + ' - ' + end_hour)
					}
				},
                operation_keys: {
                    summary: {
						title: '预约统计',
                        type: 'ios-paper'
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
                    summary (params) {
						this.summaryInfo(params.row)
					},
					edit (params) {
						this.editTimesection(params.row)
					},
					del (params) {
						this.deleteTimesection(params.row)
					}
				}
			}
		},	
		mounted () {
			this.init_data()
		},
		methods: {
            summaryInfo(row){
                let int_start_hour = this.$filter('int_hour')(row.int_start_hour)
                let int_end_hour = this.$filter('int_hour')(row.int_end_hour)
                let date = row.int_day + ' ' + int_start_hour + ' - ' + int_end_hour

                this.$Modal.open('app/appointment/summary-info-modal.vue',{
                    props:{
                        item:row
                    }
				})
				.then(modal=>{
					modal.show(`【${this.title}】【${date}】统计`,'show')
				})
            },
            resetSearch () {
                this.$form('ref_search').reset()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='int_day'){
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

                params.as_id = this.as_id
			},
			deleteTimesection(item) {
                this.$Modal.confirm({
					content: `确认要删除该时段吗？`,
					onOk: ()=> {
						this.$http.delete('appointment_time_sections/' + item.ats_id)
						.then(res => {
                            this.$Message.success('删除成功')
                            this.init_data()
						},res => {
							this.error(res.body.message)
						})
					}
				})
            },
            editTimesection(item){
                item.int_hour = [this.$filter('int_hour')(item.int_start_hour),this.$filter('int_hour')(item.int_end_hour)]

                this.$Modal.open('app/appointment/edit-timesection-modal',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',item).show('编辑预约时段','edit')
				})
            },
			addTimesection (){
                this.$Modal.open('app/appointment/add-timesection-modal',{
                    props:{
                        as_id: this.as_id
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加预约时段','add')
				})
            },
            cancle(){
                this.close()
            }
		}
	}
</script>