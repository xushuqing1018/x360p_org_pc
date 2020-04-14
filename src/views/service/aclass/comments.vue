<style lang="less">
.review-item{
	p{
		line-height: 2em;
	}
	.review-item-title{
		font-size: 16px;
		font-weight: bold;
		margin-bottom: .5em;
	}
	.review-item-content{
		margin-bottom: .5em;
		padding: 5px 10px;
		background: #ffffff;
		border: 1px solid #e3e8ee;
		font-size: 14px;
		overflow:hidden;
		text-overflow:ellipsis;
		display:-webkit-box;
		-webkit-box-orient:vertical;
		/*-webkit-line-clamp:2;*/
		border-radius: 4px;		
	}
}
</style>

<template>
    <div class="c-grid">
	    <div class="box box-query">
	        <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">	        	
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6" v-if="type_comments=='all'">
    				<select-employee v-model="search_field.eid" clearable></select-employee>
    			</Form-item>
    			<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable></select-student>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="课评时间" prop="create_time" class="col-md-3 col-sm-6">
    				<date-range-picker 
    					v-model="search_field.create_time" 
    					@on-change="search" 
    					label="选择日期" 
    					placement="bottom" 
    					style="width:100%"
    					>
					</date-range-picker>
    			</Form-item>
    			<template v-if="searchExpand">
    				<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
    					<select-subject v-model="search_field.sj_id" clearable></select-subject>
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
                	<export-button res="reviews" :params="params"></export-button>
                	<CheckboxGroup v-model="search_field.lesson_type" class="ml-2" style="display: inline-block;">
                		<Checkbox :label="0">班课</Checkbox>
                		<Checkbox :label="1">一对一</Checkbox>
                		<Checkbox :label="2">一对多</Checkbox>
                	</CheckboxGroup>
                	<div class="pull-right" v-if="is_draft==0">
                        <per-scope per="comments.all" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
          	</Row>
	    </div>
	    <div class="box box-result">
	        <div class="toolbar">
	        	<Button type="primary" icon="plus" @click="addInfo" v-per="'comments.add'">添加课评</Button>
	        	<Button type="ghost" icon="android-drafts" @click="draftView" v-if="is_draft==0">草稿箱</Button>
	        	<Button type="ghost" icon="ios-arrow-back" @click="sendView" v-else>已发送</Button>
	        </div>
	        <div class="content">
	            <div class="content-body">
	            	<div class="ivu-table-wrapper" v-loading.like="'reviews'">
	            		<div class="ivu-table">
	            			<div class="ivu-table-body">
	            				<table class="modal-table">
	            					<tr v-for="item in data">
	            						<td class="b-r-0">
	            							<div class="review-item ivu-table-cell">
	            								<p>授课{{'老师'|translate}}：{{item.eid,'-'|ename}}</p>
							            		<p>
							            			授课对象：{{item|reviewObj}}
							            			<Tag v-for="(student,index) in item.review_student" v-if="index<=3">
							            				<template v-if="student.student">
							            					{{student.student.student_name}}
							            				</template>
							            				<template v-else>
							            					已删除学员
							            				</template>
							            			</Tag>
							            			<span v-if="item.review_student.length>3">等{{item.review_student.length}}人</span>
							            		</p>
							            		<template v-if="is_draft==0">
								            		<p>阅读情况：{{item.read_nums}}/{{item.total_nums}}</p>
								            		<p>课评时间：{{item|reviewDate}}</p>
								            	</template>
							            		<p>考勤时间：{{item.int_day|int_date}}  {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</p>
												<p>操作人：{{item.create_employee_name}}</p>
							            		<Dropdown trigger="click">
							            			<Button type="primary">操作 <Icon type="arrow-down-b"></Icon></Button>
							            			<DropdownMenu slot="list">
							            				<template v-if="is_draft==0">
								            				<DropdownItem @click.native="resend(item)"><Icon type="paper-airplane"></Icon> 重新推送</DropdownItem>
								            				<DropdownItem @click.native="detail(item)"><Icon type="eye"></Icon> 查看详情</DropdownItem>
								            			</template>
								            			<DropdownItem @click.native="resumeDraft(item)" v-else><Icon type="ios-paperplane"></Icon> 取出草稿</DropdownItem>
							            				<DropdownItem @click.native="delInfo(item)"><Icon type="ios-trash"></Icon> 删除</DropdownItem>
							            			</DropdownMenu>
							            		</Dropdown>
	            							</div>
	            						</td>
	            						<td>
	            							<div class="ivu-table-cell">
	            								<div class="review-item" v-for="(c,field) in item.content">
	            									<p class="review-item-title">{{getContentFieldText(item,field)}}:</p>
	            									<div class="review-item-content">{{c}}</div>
	            								</div>
	            							</div>
	            						</td>
	            					</tr>
	            					<tr v-if="!data||!data.length">
	            						<td><div class="ivu-table-cell text-center">没有相关数据</div></td>
	            					</tr>
	            				</table>
	            			</div>
	            		</div>
	            	</div>
	            </div>
	            <div class="content-footer">
	                <div class="pagenation">
	                    <Page :total="total" 
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
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import reviewModal from 'c%/ReviewModal.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import reviewAddModal from 'c%/review/index.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			SelectClass,
			reviewModal,
			SelectStudent,
			SelectEmployee,
			reviewAddModal,
			dateRangePicker,
			SelectSubject,
			ExportButton
		},
		data () {
			return {
				rest_api: 'reviews',
				pk: 'rvw_id',
				type_comments: '',
				mapContent: {'lesson_after_task':'课后作业','lesson_content':'上课内容','next_task':'下堂课内容'},
				search_field: {	       
					eid: 0,
					sid: 0,
					sj_id: 0,
	            	create_time: [],       
	            	lesson_type: [0,1,2],
				},
				is_draft: 0
			}
		},
		watch: {
			'type_comments': function (val) {
				this.init_data()
			}
		},
		filters: {
			reviewObj (row) {
				let result = ''
				if(row.lesson_type===0&&row.one_class!=null){
        			result = row.one_class.class_name
        		}
				if(row.lesson_type===1){
					result = '一对一'
				}
				if(row.lesson_type===2){
					result = '一对多'
				}
				return result
			},
			reviewDate (row) {
				return row.create_time.substring(0,10)
			}
		},
		methods: {
			draftView() {
				this.is_draft = 1
				this.search()
			},
			sendView() {
				this.is_draft = 0
				this.search()
			},
			resumeDraft(row) {
				this.$Modal.open('components/review/index.vue@modal',{
					props: {
						'draft': row
					},
					on: {
						'on-success': () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.show('添加课评','add')
				})
			},
			getContentFieldText (item,field) {
				let obj = item.review_tpl_setting,
					result = ''
				if(!obj) {
					obj = {
						review_style: 0,
						setting: this.$store.state.gvars.review_styles[0]
					}
				}
				if(obj.review_style === 0) {
					if(obj.setting.common_fields[field]) {
						result = obj.setting.common_fields[field].label
					}
				}
				else {
					let common_fields =  obj.setting.common_fields;
					common_fields.forEach(item => {
						if(item.field == field) {
							result = item.label
						}
					})
				}
				
				return result
			},
			perScopeChange(value) {
	            this.type_comments = value
	        },	
	        resend (item) {	        	
	        	this.$Message.loading('正在发送中...')
	        	this.$rest(`reviews/push?rvw_id=${item.rvw_id}`)
	        	.post()
	        	.success(data=>{
	        		this.$Message.destroy()
	        		this.$Message.success('重新发送成功！')	
	        	}).error(response=>{
	        		this.error(response.body.message||'发送失败~')
	        	})
	        },
			detail (item) {
				this.$Modal.open('components/ReviewModal.vue@modal',{
					props: {
						currentTplProp: item.review_tpl_setting
					}
				})
				.then(modal => {
					modal
					.set('scene', 'view')
					.set('post', util.copy(item))
					.show('课评详情','view')
				})
			},
			addInfo () {
				this.$Modal.open('components/review/index.vue@modal',{
					on: {
						'on-success': () => {
							this.init_data();
						}
					}
				})
				.then(modal => {
					modal.show('添加课评','add')
				})
			},
			delInfo (item) {
				this.confirm('确认删除课评记录吗？')
				.then(()=>{
					this.$rest('reviews').delete(item.rvw_id)
					.success(()=>{
						this.init_data()
					})
				})
			},
			hook_get_param(params){
				params.with = 'review_tpl_setting'
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='lesson_type'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				if(this.is_draft == 1) {
					params.create_uid = this.uid$
					params.is_draft = 1
				}
				else {
					params.is_draft = 0
				}
				if(this.type_comments == 'my') {
					params.eid = this.eid$
				}
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		
	}
</script>