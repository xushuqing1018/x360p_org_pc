<template>
	<div>
	    <div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="上课时间" class="col-md-3 mb-0" prop="int_day">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-Item label="上课老师" class="col-md-3 mb-0" prop="eid">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-Item>
				<Form-Item label="课程" class="col-md-3 mb-0" prop="lid">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-Item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0">
	            	<Button-group>
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>     
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
									<Button 
									type="primary" 
									icon="plus" 
									@click="addInfo" 
									v-per="'comments.add'"
									v-if="type == 'class' "
									>
									添加课评
									</Button>
	            </Col>
	        </Row>    
		</div>
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">老师</div></th>
				<th><div class="ivu-table-cell">班级</div></th>
				<th><div class="ivu-table-cell">课程</div></th>
				<th><div class="ivu-table-cell">上课时间</div></th>
				<th><div class="ivu-table-cell">课评时间</div></th>
				<th><div class="ivu-table-cell">是否阅读</div></th>
				<th><div class="ivu-table-cell">打分明细</div></th>
				<th><div class="ivu-table-cell">课堂内容</div></th>
				<th width="500px"><div class="ivu-table-cell">点评内容</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						{{item.eid|employee_name}}	
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.one_class?item.one_class.class_name:'-'}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.lid|lesson_name('-')}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.int_day|int_date}} {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}												
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.create_time}}												
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<span 
							:class="item.is_read?'text-gray':'text-danger'">
							{{item.is_read?'已读 '+item.read_time:'未读'}}
						</span>												
					</div>
				</td>
				<td>
					<div v-if="item.review.review_tpl_setting != null">
						<Poptip placement="left" width="300" trigger="hover">
    					    <Button>打分明细</Button>
							<div class="api" slot="content">
								<div class="score-box" v-if="showScoreNums(item.review.review_tpl_setting.setting)">
									<template v-for="sf in item.review.review_tpl_setting.setting.student_fields.score">
										<div v-if="sf.enable">
											{{sf.label}}:<span v-if="item[sf.field]>0">{{item[sf.field]}}</span><span v-else>0</span>
										</div>
									</template>
								</div>
								<div class="score-box" v-else>
									<div v-for="s in 10" v-if="score_box_10(item,s)">
										{{scoreLabel(0,s-1,item.review.review_tpl_setting)}}: <Rate v-model="item['score'+((s-1)>0?(s-1):'')]" disabled></Rate>
									</div>
									<div v-for="s in 5" v-if="score_box_5(item,s)">									
										{{scoreLabel(1,s-1,item.review.review_tpl_setting)}}: <Rate v-model="item.detail['score'+(s-1)]" disabled></Rate>
									</div>
								</div>
							</div>
    					</Poptip>										
					</div>
				</td>
				<td>
					<div v-if="item.review.review_tpl_setting != null">
						<Poptip placement="left" width="600" trigger="hover">
    					    <Button>课堂内容</Button>
							<div class="api" slot="content">
								<Tabs type="card">
									<TabPane :label="i.label" v-for="(i,field) in content_fields(item.review.review_tpl_setting)" :key="field">
										<Card style="min-height:144px;">
											<Input class="textarea-view" readonly type="textarea" v-model="item.review.content[field]" :autosize="{minRows:3}"></Input>
										</Card>
									</TabPane>
									<TabPane label="附件">
										<review-upload class="mt-3" ref="upload" v-model="item.review_file" mode="view" style="margin:0px !important;min-height: 144px;"></review-upload>
									</TabPane>
								</Tabs>	
							</div>
    					</Poptip>										
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<div v-if="item.review_style === 0">{{item.detail||'-'}}</div>
						<div v-if="item.review_style === 1">{{item.detail?item.detail.detail||'-':'-'}}</div>
					</div>
				</td>
			</tr>
			<tr v-if="!data||!data.length">
				<td colspan="9">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
		<div class="text-right mt-3">
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
</template>

<script>
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectLesson from 'c%/SelectLesson'
	import reviewUpload from 'c%/reviewUpload.vue'
	
	export default{
		mixins:[ grid,common,globals],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectLesson,
			reviewUpload
		},
		props: {
			sid:{
				type: [Number,String],
				default: 0
			},
			cid: {
				type: [Number,String],
				default: 0
			},
			type: {
				type: String
			}
		},
		data () {
			return {
				data: [],
				rest_api: 'review_students',
				search_field: {
					int_day: [],
					eid: 0,
					lid: 0
				},
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		computed:{
			showScoreNums(){
				return function(item) {
					if(item.advance && item.advance.score_show_num){
						return true
					}
					return false
				}
			},
			content_fields () {
				return function(item) {
					let result = {},
						fields = item.setting?item.setting.common_fields:{}
					if(!item.review_style === 1) {
						for(let s in fields){
							let obj = fields[s]
							if(obj.enable==1){
								result[s] = {}
								result[s].label = obj.label
								result[s].value = obj.tpl
								result[s].student_view = obj.student_view
							}					
						}
					}
					else {
						for(let i in fields){
							let obj = fields[i]
							if(obj.enable==1){					
								result[obj.field] = {}
								result[obj.field].label = obj.label
								result[obj.field].value = obj.tpl
								result[obj.field].student_view = obj.student_view
							}
						}
					}
					return result
				}
			},
			score_box_10(){
				return function(item,s) {
					if(item.review.review_tpl_setting.review_style == 0 && item.review.review_style == 0 && item['score'+((s-1)>0?(s-1):'')]>0){
						return true
					}
					return false
				}
			},
			score_box_5(){
				return function(item,s) {
					if(item.review.review_tpl_setting.review_style == 1 && item.review.review_style == 1 && item.detail['score'+(s-1)]>0){
						return true
					}
					return false
				}
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
			hook_get_param (params) {
				if(this.type === 'class') {
					params.cid = this.cid
				}else {
					params.sid = this.id
				}
				let search_obj = util.copy(this.search_field)
				params.with = 'one_class,review,review.review_tpl_setting,review_file'
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else if(o=='is_connect'){
						if(property!=-1){
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
			scoreLabel(review_style, index,item) {
				if(review_style == 0) {
					let scoreFields = item.setting.score_fields
					return scoreFields['score'+(index>0?index:'')].label
				}
				else {
					let scoreFields = item.setting.student_fields.score;
					let label = '';
					for (let i = 0; i < scoreFields.length; i++) {
						const item = scoreFields[i];
						if(item.field == 'score'+index) {
							label = item.label;
							break;
						}
					}
					return label
				}
			}
		}
	}
</script>

<style scoped>
	.textarea-view >>> .ivu-input {
		border: none;
	}

	.textarea-view >>> .ivu-input:focus {
		outline: none;
		box-shadow: none;
	}
</style>