<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="init_data"
						label="请选择时间段" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
    			</Form-item>
                <Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable placeholder="请选择学员"></select-student>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_student_details" :params="params"></export-button>      	               	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
                <div class="content-body">
                    <Table 
	                    v-loading.like="'report_student_details'" 
	                    height="530"
	                    :stripe="true" 
	                    :show-header="true" 
	                    :data="data" 
	                    :columns="columns" 
	                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
	                    @on-sort-change="sortChange"
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
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
    import ExportButton from 'c%/ExportButton.vue'
    import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
    import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
            ExportButton,
            SelectStudent
		},
		data() {
			return {
				rest_api: 'report_student_details',
				isRefresh: false,
				autoRefresh: false,
				search_field: {
                    int_day: [],
                    sid: 0
				},
				column_keys: {
					student_name: {
						title: '学员',
						show: true,
					},
					bid: {
                        title: '所属校区',
                        show: true
					},
					first_tel: {
						title: '联系电话',
						show: true,
					},
					sex: {
						title: '性别',
						show: true,
					},
					age: {
						title: '年龄',
						show: true,
                    },
                    school_id: {
                        title: '公立学校',
                        show: true
                    },
                    school_grade: {
                        title: '年级',
                        show: true
                    },
					status: {
						title: '状态',
						show: true
					},
					lesson_rate: {
						title: '剩余课时/总课时',
						show: true
					},
					in_time: {
						title: '报名时间',
						show: true
					},
					last_attendance_time: {
						title: '最后一次考勤时间',
						show: true
					}
				},
				column_render: {
					lesson_rate (h,params) {						
						let row = params.row,
							percent = 0,
							label = util.sprintf('%s/%s',row.student_lesson_remain_hours,row.student_lesson_hours)
						if(row.student_lesson_hours>0){
							percent = parseFloat(row.student_lesson_remain_hours/row.student_lesson_hours).toFixed(2)*100
						}						
						
						return h('Progress',{
							props: {
								percent: percent
							}
						},label)
					},
					sex (h,params) {
						let map_sex = {0:'-',1:'男',2:'女'}
						return h('span',map_sex[params.row.sex])
					},
					age (h,params) {
						return h('span',util.age(params.row.birth_time))
                    },
                    school_id (h,params) {
						return h('span',this.school_name(params.row.school_id) || '-')
					},
                    school_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade') || '-')
					},
					status(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.status].color
								}
							},
							this.ss_map[params.row.status].text
						)
						let result = [tag]
						if(params.row.status === 30) {
							let reason = params.row.stop_reason || '-'
							result.push(h('p','原因:'+reason))
						}
						return h('div',result)
					}
				}
			}
		},
		watch:{
			
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.isRefresh){
					params['refresh'] = 1
				}

				this.isRefresh = false 
			},
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
			}
		}
	}
</script>
