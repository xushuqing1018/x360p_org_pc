<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="1100">
		<div class="mb-3">
			<RadioGroup v-model="search_field.sent_status" type="button" style="margin-right:20px;" @on-change="statusChange">
				<Radio :label="-1">待翻译</Radio>
				<Radio :label="2">已翻译</Radio>
			</RadioGroup>
			<RadioGroup v-model="search_field.trans_eid" type="button" @on-change="search">
				<Radio :label="-1">我的</Radio>
				<Radio :label="-2">所有</Radio>
			</RadioGroup>
			
			<Button style="margin-left:10px" size="small" icon="paper-airplane" @click="noReview">未填写报告</Button>
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row" style="margin-top: 20px;">
	        	<Form-item label="授课日期" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="外教老师" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" clearable :rid="1"></select-employee>
    			</Form-item>
    			<Form-item label="课程类型" prop="lesson_type" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.lesson_type">
    					<Option :value="-1">不限</Option>
    					<Option :value="0">班课</Option>
    					<Option :value="1">一对一</Option>
    					<Option :value="2">一对多</Option>
    				</Select>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
	        </Form>
			<Button class="ml-2" size="small" type="primary" @click="search" icon="ios-search" style="margin-left: 10px">查询</Button>
			<Button type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
		</div>
		
		<div class="content">
			
			<div class="content-body">
	            <Table
					:loading="loading"
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
	        <div class="content-footer" style="margin-top: 10px;">	        	
	            <div class="pagenation text-right">
	                <Page 
	                	:total="total" 
	                	:current="pageIndex" 
	                	:page-size="pageSize" 
	                	:show-total="true"
	                	@on-change="pagenation">
	                </Page>
	            </div>
	        </div>
		</div>
		<review-modal ref="review" scene="view"></review-modal>
	    <review-add-modal ref="review_add" @on-success="init_data"></review-add-modal>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	
	import reviewModal from 'c%/ReviewModal.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import reviewAddModal from 'c%/review/index.vue'

	import ExportButton from 'c%/ExportButton.vue'

	export default{
		mixins: [grid,common,globals,modal],
		components: {
			SelectClass,
			reviewModal,
			SelectStudent,
			SelectEmployee,
			reviewAddModal,
			dateRangePicker,

			ExportButton
		},
		data () {
			var vm = this;
			return {
				rest_api: 'ft_reviews',
				pk: 'frvw_id',
				type_comments: '',
				mapContent: {'lesson_after_task':'课后作业','lesson_content':'上课内容','next_task':'下堂课内容'},
				search_field: {
					eid: 0,
					sid: 0,
	            	int_day: [],
					lesson_type: -1,
					sent_status: -1,
					trans_eid: -1
				},
				column_keys: {
					eid: {
                        title: '授课老师',
                        show: true
                    },
                    obj: {
                        title: '授课对象',
						show: true,
						width: 300
                    },
                    trans_eid: {
                        title: '指定翻译人',
                        show: true
                    },
                    sent_status: {
                        title: '状态',
                        show: true
					},
					date: {
                        title: '授课日期',
                        show: true
                    },
					info: {
                        title: ' ',
                        show: true
                    },
				},
				column_render: {
					eid(h, params) {
                        return h('span', this.$options.filters.ename(params.row.eid))
					},
					obj(h, params) {
                        return h('Tag', this.$options.filters.reviewObj(params.row))
					},
					date(h, params) {
                        return h('span', this.$filter('int_date')(params.row.int_day))
					},
					trans_eid(h, params) {
                        return h('span', params.row.trans_eid == 0?'-':this.$options.filters.ename(params.row.trans_eid))
					},
					sent_status(h, params) {
						var text = '';
						if(params.row.sent_status == 0) {
							text = '未翻译';
							return h('Tag',text)
						}
						else if (params.row.sent_status == 1) {
							if(params.row.review) {
								if(params.row.review.is_draft) {
									text = '有草稿';
									return h('Tag', {
										props: {
											color: 'green'
										}
									},text)
								}
							}
							else {
								text = '翻译中';
								return h('Tag', {
									props: {
										color: 'blue'
									}
								},text)
							}
						}
						else {
							text = '已翻译';
							return h('Tag', {
								props: {
									color: 'green'
								}
							},text)
						}
					},
					info(h, params) {
						var vm = this;
						if(params.row.review) {
							return h('Button', {
								props: {
									size: 'small'
								},
								on: {
									click: function() {
										vm.detail(params.row)
									}
								}
							},'详情')
						}
					},
					
				},
				operation_keys: {
					trans: {
                        title: '翻译',
						type: 'paper-airplane',
						condition: "row.sent_status == 0"
					},
					keepTrans: {
                        title: '继续翻译',
						type: 'paper-airplane',
						condition: "row.sent_status == 1"
					},
					bank_trans: {
                        title: '撤销翻译',
						type: 'reply',
						condition: "(row.trans_eid == 0&&row.sent_status == 2)||(row.trans_eid == this.eid$&&row.sent_status == 2)"
					},
				},
				operation_func: {
					trans (params) {
						this.trans(params.row.catt_id,params.row.frvw_id);
					},
					keepTrans (params) {
						this.trans(params.row.catt_id,params.row.frvw_id);
					},
					bank_trans (params) {
						this.bank_trans(params.row.frvw_id);
					},
				}    
			}
		},
		created() {
			this.init_data();
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
			}
		},
		methods: {
			statusChange(type) {
				this.search();
			},
			noReview() {
				this.$Modal.open('app/ft/ft-no-review.vue@modal',{
					on:{
						update: () => {
							this.init_data();
						}
					}
				})
				.then(modal => {
					modal.show('未填写报告记录');
				})
			},
			bank_trans(frvw_id) {
				this.$Modal.confirm({
					content:'确认撤销该报告翻译',
					onOk:() => {
						this.$http.post('ft_reviews/again_translate',{
							frvw_id: frvw_id
						})
						.then(res => {
							this.$Message.success('撤销成功')
							this.init_data()
						},res => {
							this.error(res.body.message)
						})
					}
				})
			},
			trans(catt_id,frvw_id) {
				this.$Modal.open('components/review/index.vue@modal',{
					on:{
						'on-close':() => {
							this.init_data()
						},
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set("catt_id",catt_id)
					.set("frvw_id",frvw_id)
					.show('翻译外教报告');
				})
			},
			getContentFieldText (item,field) {
				let list = this.$store.state.gvars.review_tpl_setting,
					rts_id = item.rts_id,
					obj = {},
					result = ''
				if(_.isArray(list)&&list.length>0){					
					if(rts_id>0){
						obj = list.find(l=>l.rts_id==rts_id)						
					}else{					
						obj = list[0]
					}				
				}else if(_.isObject(list)&&!_.isEmpty(list)){
					obj = list
				}
				if(!_.isEmpty(obj)){
					result = obj.setting.common_fields[field].label
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
						
					}
				})
				.then(modal => {
					modal
					.set('scene', 'view')
					.set('post', util.copy(item.review))
					.show('课评详情','view')
				})
			},
			hook_get_param(params){
				let search_obj = util.copy(this.search_field);
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}
					else if(o=='trans_eid') {
						if(this.search_field.trans_eid == -1) {
							params[o] = this.eid$;
						}
						else if(this.search_field.trans_eid == 0){
							params[o] = 0
						}
						else if(this.search_field.trans_eid == -2){
						}
					}
					else if(o=='sent_status') {
						if(this.search_field.sent_status == -1) {
							params[o] = `[In,0,1]`;
						}
						else {
							params[o] = this.search_field.sent_status;
						}
					}
					else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
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

<style scoped>
/* .content-body {
	height: 60vh;
	overflow-x: hidden;
	overflow-y: scroll;
} */
</style>