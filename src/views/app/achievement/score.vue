<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="考试名称" prop="exam_name" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.exam_name" placeholder="请输入课程名"></Input>
    			</Form-item>
    			<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="考试类别" prop="exam_type_did" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.exam_type_did" :clearable="true" size="small">
    					<Option :value="-1">不限</Option>
                        <Option v-for="item in dicts('exam_type')" :value="item.did">{{item.title}}</Option>
                    </Select>
    			</Form-item>
    			<Form-item label="考试科目" prop="exam_subject_dids" class="col-md-3 col-sm-6">
        			<Select v-model="search_field.exam_subject_dids">
        				<Option :value="-1">不限</Option>
                        <Option v-for="item in dicts('exam_subject')" :value="String(item.did)">{{item.title}}</Option>
                    </Select>
        		</Form-item>
    			
    			<template v-if="searchExpand">
    				<Form-item label="考试日期" prop="exam_int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker 
		    				v-model="search_field.exam_int_day" 
		    				@on-change="search" 
		    				label="选择日期" 
		    				placement="bottom"
		    				style="width:100%">
						</date-range-picker>
	    			</Form-item>
    			</template>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>                  
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                

		            <export-button res="student_exams" :params="params" v-per="'score.export'"></export-button> 

                	<Button type="primary" @click="searchByStudent">按学员查成绩</Button> 
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
                    v-loading.like="'query_exam'" 
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
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
                </div>
			</div>
        </div>
        <class-score ref="class_score" @on-success="init_data"></class-score>
        <score-by-student ref="student_score"></score-by-student>
    </div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectClass from 'c%/SelectClass.vue'
    import ClassScore from './score/class-score.vue'
    import ScoreByStudent from './score/score-by-student.vue'
    import ExportButton from 'c%/ExportButton.vue'
    export default {
    	mixins:[common,grid,globals],
    	components: {
    		DateRangePicker,
    		SelectClass,
    		ClassScore,
    		ScoreByStudent,
    		ExportButton
    	},
    	data () {
			return {
				search_field: {
					exam_name: '',
	                exam_type_did: -1,
	                exam_int_day: [],
	                exam_subject_dids: -1,
	                cid: 0
	            },
				rest_api:'student_exam_scores/query_exam',
				pk: 'ses_id',
				datakey: 'student_exam_score',
				column_keys: {
					exam_name: {
						title: '名称',
						show: true
					},
					exam_type_did: {
						title: '类别',
						show: true,
						sortable: 'custom'
					},
					exam_int_day: {
						title: '考试日期',
						show: true,
						sortable: true
					},
					exam_subject_dids:{
						title:'考试科目',
						show: true
					},
					class_num: {
						title: '班级数',
						show: true
					},
					student_num: {
						title: '考试人数',
						show: true
					},
					max_score: {
						title: '最高分',
						show: true
					},
					min_score: {
						title: '最低分',
						show: true
					},
					avg_score: {
						title: '平均分',
						show: true
					}
				},
				column_render: {
					exam_name(h,params) {
						return h('span',{
							attrs: {
								class:'text-info cursor'
							},
							on: {
								click:() => {
									this.$r('class_score')
									.set('info',params.row)
									.show(util.sprintf('考试成绩查询【%s】',params.row.exam_name))
								}
							}
						},params.row.exam_name)
					},
					exam_int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.exam_int_day))
					},
					exam_type_did(h,params) {
						let title = '-',
							obj = this.dicts('exam_type').find(item=>item.did==params.row.exam_type_did)
						if(obj) {
							title = obj.title
						}
						return h('span',title)
					},
					exam_subject_dids(h,params) {
						let dids = params.row.exam_subject_dids,
							subjects = this.dicts('exam_subject'),
							result = []
						dids.forEach(did=>{
							let subject = subjects.find(item=>item.did==did)
							if(subject) {
								result.push(subject.title)
							}
						})
						return h('span',result.join(','))
					},
					avg_score(h,params) {
						return h('span',params.row.avg_score.toFixed(2))
					}
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
			searchByStudent() {
				this.$r('student_score').show('学员成绩查询')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]	
					if(o=='exam_int_day'){
						if(property.length>0){
							params[o] = util.sprintf('[between,%s]',property.join(','))			
						}
					}else{
						 if(property!=''&&property!=-1){
							params[o] = property
						}
					}					
				}				
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
    }
</script>