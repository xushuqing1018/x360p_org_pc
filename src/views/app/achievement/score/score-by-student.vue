<template>
	<Modal v-drag-modal :mask-closable="false" width="850" v-model="modal$.show" :title="modal$.title">
		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
			<Form-item label="学员姓名" prop="sid" class="col-sm-4">
				<select-student 
					ref="ref_student" 
					v-model="search_field.sid" 
					placeholder="请选择学员" 
					@on-selected="selectStudent"
					@select="init_data"
					clearable>
				</select-student>
			</Form-item>
			<Form-item label="考试名称" prop="exam_name" class="col-sm-4">
				<Input v-model="search_field.exam_name" placeholder="请输入课程名"></Input>
			</Form-item>
			<Form-item label="考试科目" prop="exam_subject_dids" class="col-sm-4">
    			<Select v-model="search_field.exam_subject_dids">
    				<Option :value="-1">不限</Option>
                    <Option v-for="item in dicts('exam_subject')" :value="String(item.did)">{{item.title}}</Option>
                </Select>
    		</Form-item>
			<template v-if="searchExpand">
				<Form-item label="班级名称" prop="cid" class="col-sm-4">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-item>
				<Form-item label="考试日期" prop="exam_int_day" class="col-sm-4">
    				<date-range-picker 
	    				v-model="search_field.exam_int_day" 
	    				@on-change="query_student_score" 
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
                    <Button class="ml-2" size="small" type="primary" @click="query_student_score" icon="ios-search">查询</Button>
                    <Button type="primary" size="small" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                </Button-group>                  
            	<Button type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>    
        <div class="mt-3">
        	<div class="content-body">
                <Table 
                v-loading.like="'student_exam_scores'" 
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
            <div class="clearfix">
                <div class="pull-right">
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
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
        <student-exam-detail ref="ref_detail" :data="student_exam_data" @on-success="init_data"></student-exam-detail>
    </Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectClass from 'c%/SelectClass.vue'
    import StudentExamDetail from './student-exam-detail.vue'
	
	export default{
		mixins:[grid,modal,globals,common],
		components: {
			SelectStudent,
			DateRangePicker,
			SelectClass,
			StudentExamDetail
		},
		data () {
			return {
				search_field: {
					exam_name: '',
	                exam_int_day: [],
	                exam_subject_dids: -1,
	                cid: 0,
	                sid: 0
	            },
				rest_api:'student_exam_scores/query_student',
				datakey: 'student_exam_score',
				student_exam_data: [],
				ses_id: 0,
				student_name: '',
				column_keys: {
					exam_name: {
						title: '考试名称',
						show: true
					},
					exam_type_did: {
						title: '类别',
						show: true
					},
					exam_int_day: {
						title: '考试日期',
						show: true
					},
					exam_subject_dids:{
						title:'考试科目',
						show: true
					},
					class_name: {
						title: '班级名称',
						show: true
					},
					total_score: {
						title: '总分',
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
									this.showDetail(params.row)
								}
							}
						},params.row.exam_name)
					},
					class_name(h,params) {
						let name = '[未知]'
						if(params.row.one_class) {
							name = params.row.one_class.class_name
						}
						return h('span',name)
					},
					avg_score(h,params) {
						let total = params.row.total_score,
							len = params.row.exam_subject_dids.length,
							avg = 0
						avg = (util.div(total,len)).toFixed(2)
						return h('span',avg)
					},
					exam_int_day(h,params) {
						let day = '-'
						if(params.row.exam_int_day) {
							day = this.$filter('int_date')(params.row.exam_int_day)
						}
						return h('span',day)
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
					}
				}
			}
		},
        methods: {
        	query_student_score () {
        		if(this.search_field.sid==0) {
        			this.$Message.error('请先选择学员')
        			this.$r('ref_student').openModal()
        			return false
        		}
        		this.init_data()
        	},
        	selectStudent(select) {
        		this.student_name = select.student_name
        	},
        	showDetail(row) {
        		let copy_row = util.copy(row)
    			copy_row.student_exam_subject_score.forEach(item=>{
    				item.$$edit = false
    			})
    			this.ses_id = copy_row.ses_id
    			this.student_exam_data = copy_row.student_exam_subject_score
        		this.$r('ref_detail').show(util.sprintf('考试科目成绩【%s】【%s】',this.student_name,row.exam_name))
        	},
        	deal_data(data) {
        		if(this.ses_id>0) {
        			let row = data.list.find(item=>item.ses_id==this.ses_id)
        			if(row) {
        				let copy_row = util.copy(row)
        				copy_row.student_exam_subject_score.forEach(item=>{
		    				item.$$edit = false
		    			})
		    			this.student_exam_data = copy_row.student_exam_subject_score
        			}
        		}
        		return data.list
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
				this.data.splice(0)
			}       	
        },
		computed: {

		}
	}
</script>