<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="考试名称" prop="exam_name" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.exam_name" placeholder="请输入课程名"></Input>
    			</Form-item>
    			<Form-item label="考试类别" prop="exam_type_did" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.exam_type_did" :clearable="true" size="small">
    					<Option :value="-1">不限</Option>
                        <Option v-for="item in dicts('exam_type')" :value="item.did">{{item.title}}</Option>
                    </Select>
    			</Form-item>
    			<Form-item label="考试日期" prop="exam_int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
	    				v-model="search_field.exam_int_day" 
	    				@on-change="init_data" 
	    				label="选择日期" 
	    				placement="bottom"
	    				style="width:100%">
					</date-range-picker>
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
        	<div class="toolbar">
        		<Button type="primary" @click="add" icon="plus" v-per="'exam.add'">添加考试</Button>
				<filter-column :keys="column_keys"></filter-column>
        	</div>
        	<div class="content">
				<div class="content-body">
                    <Table 
                    v-loading="'student_exams'" 
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
        <info-modal ref="ref_info" @save="init_data"></info-modal>
        <entry-modal ref="ref_entry"></entry-modal>
        <import-modal ref="ref_import" @save="init_data"></import-modal>
    </div>
</template>
<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import InfoModal from './info-modal.vue'
    import EntryModal from './entry-modal.vue'
    import ImportModal from './import-modal.vue'
    export default {
    	mixins:[common,grid,globals],
    	components: {
    		DateRangePicker,
    		InfoModal,
    		EntryModal,
    		ImportModal
    	},
    	data () {
			return {
				search_field: {
					exam_name: '',
	                exam_type_did: -1,
	                exam_int_day: [],
	            },
				rest_api:'student_exams',
				pk: 'se_id',
				datakey: 'student_exam',
				column_keys: {
					exam_name: {
						title: '名称',
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
					score_release_int_day: {
						title: '成绩发布日期',
						show: true
					},
					remark: {
						title: '备注',
						show: false
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'exam.edit'
					},
					entry: {
						title: '成绩录入',
						type: 'ios-compose',
						per: 'score.entry',
					},
					import: {
						title: '成绩导入',
						type: 'ios-upload',
						per: 'score.import',
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'exam.delete'
					}
				},
				operation_func: {
					edit(params) {						
						this.$r('ref_info')
						.set('info',params.row)
						.show(util.sprintf('编辑考试【%s】',params.row.exam_name),'edit')
					},
					entry(params) {
						this.$r('ref_entry')
						.set('item',params.row)
						.show(util.sprintf('成绩录入【%s】',params.row.exam_name))
					},
					import(params) {
						let title = util.sprintf('批量导入成绩【%s】',params.row.exam_name)
						this.$r('ref_import')
						.set('data',params.row)
						.show(title)
					},
					delete(params) {
						this.confirm(util.sprintf('确定要删除考试【%s】吗?',params.row.exam_name))
						.then(()=>{
							this.delete(params.row)
						})
					}
				},
				column_render: {
					exam_int_day(h,params) {
						let day = '-'
						if(params.row.exam_int_day) {
							day = this.$filter('int_date')(params.row.exam_int_day)
						}
						return h('span',day)
					},
					score_release_int_day(h,params) {
						let day = '-'
						if(params.row.score_release_int_day) {
							day = this.$filter('int_date')(params.row.score_release_int_day)
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
		mounted () {			
			this.init_data()
		},
		methods: {
			add () {
				this.$r('ref_info')
				.show('新增考试')
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