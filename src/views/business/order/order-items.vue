<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable placeholder="请选择学员"></select-student>
				</Form-item>
				<Form-item label="课程名称" prop="lid" class="col-md-3 col-sm-6">
					<select-lesson v-model="search_field.lid" clearable placeholder="请选择课程"></select-lesson>
				</Form-item>
				<Form-item label="收费类型" prop="consume_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.consume_type" clearable>
						<Option :value="-1">不限</Option>
						<Option v-for="item in consume_type_list" :value="item.value">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item label="项目类型" prop="gtype" class="col-md-3 col-sm-6">
					<Select v-model="search_field.gtype" multiple>
						<Option :value="index" v-for="(value,key,index) in gtype_map">{{value}}</Option>
					</Select>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="订单编号" prop="order_no" class="col-md-3 col-sm-6">
						<Input v-model="search_field.order_no" placeholder="请输入订单号" @keyup.native.enter="search"></Input>
					</Form-item>
					<Form-item label="课程升级" prop="is_from_lid" class="col-md-3 col-sm-6">
						<Select v-model="search_field.is_from_lid" clearable>
							<Option :value="-1">不限</Option>
							<Option :value="1">是</Option>
							<Option :value="0">否</Option>
						</Select>
					</Form-item>
					<Form-item label="下单时间" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							@on-change="search" 
							label="选择日期" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>
					<Form-item label="报名时间" prop="paid_time" class="col-md-3 col-sm-6">
						<date-range-picker
								v-model="search_field.paid_time"
								@on-change="search"
								label="选择日期"
								placement="bottom"
								style="width:100%">
						</date-range-picker>
					</Form-item>

					<Form-item label="是否转介绍" :label-width="80" prop="is_referer" class="col-md-3 col-sm-6">
						<Select v-model="search_field.is_referer">
							<Option :value="-1">不限</Option>
							<Option :value="1">是</Option>
							<Option :value="0">否</Option>
						</Select>
					</Form-item>
					<Form-item label="转介绍学员" :label-width="80" prop="referer_sid" class="col-md-3 col-sm-6">
						<select-student v-model="search_field.referer_sid" clearable></select-student>
					</Form-item>
					<Form-item :label="'转介绍'+label_teacher" :label-width="80" prop="referer_teacher_id" class="col-md-3 col-sm-6">
						<select-employee 
							v-model="search_field.referer_teacher_id" 
							clearable
							:rid="1" 
							>
						</select-employee>
					</Form-item>
					<Form-item :label="'转介绍'+label_eduer" :label-width="80" prop="referer_eid" class="col-md-3 col-sm-6">
						<select-employee 
							v-model="search_field.referer_eid" 
							clearable
							:rid="4" 
							>
						</select-employee>
					</Form-item>
					<Form-item label="业绩归属人" :label-width="80" prop="eid" class="col-md-3 col-sm-6">
						<select-employee v-model="search_field.eid" clearable></select-employee>
					</Form-item>
				</template>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                	<export-button res="order_items" :params="params" :disabled="disabled_export" :total="total" :max-sync-nums="1000"></export-button>
                	<div class="pull-right">
                        <per-scope per="orderitems.all" @on-change="perScopeChange"></per-scope>
                    </div>
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
			        v-loading="'order_items'" 
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
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import SelectEmployee from 'c%/SelectEmployee'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectStudent,
			SelectLesson,
			ExportButton,
			SelectEmployee
		},
		data () {
			return {
				rest_api: 'order_items',
				pk: 'oi_id',
				search_field: {
					lid: '',
					sid: 0,
					create_time: [],
					paid_time: [],
					order_no: '',
					consume_type: -1,
					is_from_lid: -1,
					gtype: [0,1,3],
					is_referer: -1,
					referer_sid: 0,
					referer_teacher_id: 0,
					referer_eid: 0,
					eid: 0
				},
				type_items: '',
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					item_name: {
						title: '缴费项目',
						show: true,
						width: 200
					},
					consume_type: {
						title: '类型',
						show: true
					},
					order_no: {
						title: '所属订单',
						show: true,
						width: 150
					},
					create_time: {
						title: '下单时间',
						show: false
					},
					bid: {
						title: '校区',
						show: false
					},
					pj_id: {
						title: '项目',
						show: false
					},
					expire_time: {
						title: '有效期',
						show: false
					},
					nums: {
						title: '数量',
						show: true
					},
					origin_price: {
						title: '原单价',
						show: true
					},
					price: {
						title: '折后单价',
						show: true,
						sortable:'custom'
					},
					discount: {
						title: '优惠',
						show: true
					},
					present: {
						title: '赠送',
						show: true
					},
					subtotal: {
						title: '小计金额',
						show: true
					},
					paid_amount: {
						title: '实缴金额',
						show: true
					},
					referer: {
						title: '转介绍来源',
						show: false,
						width: 150
					},
					eids: {
						title: '业绩归属人',
						show: true,
						width: 150
					}
				},
				column_render: {
					item_name(h,params) {
						let name = params.row.item_name
						let gtype= params.row.gtype
						let ps = []
						if(gtype==1) {
							ps.push(h('Tag',{
								props: {
									color: 'blue'
								}
							},'物'))
						}else if(gtype==3) {
							ps.push(h('Tag',{
								props: {
									color: '#EF6AFF'
								}
							},'杂'))
						}
						ps.push(name)
						if(params.row.from_lid) {
							ps.push(h('p',{
								class: 'text-info'
							},`课程升级：${this.$filter('lesson_name')(params.row.from_lid)}`))
						}
						return h('div',ps)
					},
					expire_time (h,params) {
						return h('span',params.row.expire_time||'-')
					},
					create_time (h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD hh:mm'))
					},
					order_no (h,params) {
						return h('a',{
							attrs: {
								class: 'x-a-link text-info'
							},
							on: {
								click: ()=>{
									this.orderDetail(params.row.oid)									
								}
							}
						},params.row.join_order.order_no)
					},
					sid (h,params) {
						return h('span',params.row.student.student_name)
					},
					consume_type (h,params) {
						return h('span',this.$filter('consume_type')(params.row.consume_type))
					},
					nums (h,params) {
						return h('span',util.float(params.row.nums))
					},
					origin_price (h,params) {
						return h('span',this.label_currency+Number(params.row.origin_price).toFixed(2))
					},
					price (h,params) {
						return h('span',this.label_currency+Number(params.row.price).toFixed(2))
					},
					discount (h,params) {
						let ps = []
						if(params.row.discount_amount>0) {
							ps.push(h('p','折扣：'+this.label_currency+params.row.discount_amount))
						}
						if(params.row.reduced_amount>0) {
							ps.push(h('p','直减：'+this.label_currency+params.row.reduced_amount))
						}
						if(ps.length) {
							return h('div',ps)
						}else{
							return h('span','-')
						}
					},
					paid_amount(h,params) {
						return h('span',{
							class: params.row.paid_amount<params.row.subtotal?'text-danger':''
						},this.label_currency+params.row.paid_amount)
					},
					subtotal(h,params) {
						return h('span',this.label_currency+params.row.subtotal)
					},
					present (h,params) {
						let present = '-'
						if(params.row.present_lesson_hours > 0) {
							present = util.float(params.row.present_lesson_hours)
						}
						return h('span',present)
					},
					referer (h,params) {
						let result = []
						if(params.row.referer_sid) {
							result.push(h('p',`转介绍学员：${params.row.referer_student.student_name}`))
						}
						if(params.row.referer_teacher_id) {
							result.push(h('p',`转介绍${label_teacher}：${params.row.referer_teacher_id|ename}`))
						}
						if(params.row.referer_eid) {
							result.push(h('p',`转介绍${label_eduer}：${params.row.referer_eid|ename}`))
						}
						return h('div',result)
					}
				},
				operation_keys: {
					edit: {
						title: '修改收费类型',
						type: 'edit',
						per: 'orderitems.edit'
					},
					setreferer: {
						title: '设置转介绍',
						type: 'share',
						per: 'orderitems.referer'
					},
					undo: {
						title: '撤销课程升级',
						type: 'ios-undo',
						per: 'orderitems.undo',
						condition: 'row.from_lid>0'
					},
					arrange_class_hours: {
						title: '安排课时',
						type: 'shuffle',
						condition: 'row.order_item_lha.length==0'
					}
				},
				operation_func: {
					edit(params) {
						this.$Modal.open('business/order/edit-consume-type-modal.vue',{
							props: {
								data: params.row
							},
							on: {
								'on-success':() => {
									this.init_order_items()
								}
							}
						})
						.then(modal => {
							modal.show('编辑','edit')
						})
					},
					setreferer(params) {
						this.$Modal.open('business/order/item-referer-modal.vue',{
							props: {
								info: params.row
							},
							on: {
								'on-success':() => {
									this.init_order_items()
								}
							}
						})
						.then(modal => {
							modal.show(util.sprintf('转介绍设置【%s】【%s】',params.row.student.student_name,params.row.item_name),'edit')
						})
					},
					undo(params) {
						this.confirm('确定要撤销课程升级吗？')
						.then(() => {
							this.$rest('order_items').add_url_param('undo_upgrade_lesson_hours')
							.post({
								id: params.row.oi_id
							})
							.success(res => {
								this.$Message.success('撤销成功')
								this.init_order_items()
							})
							.error(res => {
								this.error(res.body.message)
							})
						})
					},
					arrange_class_hours (params) {
						let item = params.row,
						 		student = item.student,
								num = Number(item.nums)+Number(item.present_lesson_hours)
						let lha = {
							int_day: [],
							teach_eid: [],
							lid: 0,
							int_start_hour:'',
							int_end_hour:'',
							week_days: [],
							lesson_type: 2
						}
						lha.int_day.push(item.join_order.paid_time)
						if(item.expire_time) {
							lha.int_day.push(item.expire_time)
						}
						else{
							let end = moment(item.join_order.paid_time).add(60,'days').format('YYYY-MM-DD')
							lha.int_day.push(end)
						}
						lha.lid = item.lid
						lha.lesson_type = this.lesson_type(item.lid)
						item.lha = lha
						this.$Modal.open('dashboard/signup/lesson-hour-arrange.vue@modal',{
							on: {
								'on-success':() => {
									this.init_data()
								}
							},
							props: {
								item : item,
								student:student
							}
						})
						.then(modal => {
							modal.show(util.sprintf('选择上课时段，共 %s 课时', num), 'direct')
						})						
					}	
				}
			}
		},
		watch: {
			'type_items':function(val) {
				this.init_order_items()
			}
		},
		created(){
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
			if(!this.need_lha){
				delete this.operation_keys['arrange_class_hours']
			}
		},
		mounted() {
			this.replaceSearchField()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			lesson_type (lid) {
				let lessons = this.$store.state.gvars.lessons,
					result = {}
				if(lid&&lessons.length){
					result = lessons.find(l=>l.lid==lid)||{} 
				}
				return result.lesson_type
			},
			init_order_items() {
				if(this.type_items === 'my') {
					if(this.search_field.sid == 0) {
						this.data = []
						this.$Message.info("在'我的报名项目'权限下只能通过学员查找到订单")
						return;
					}
				}
				this.init_data()
			},
			search() {
				this.pageIndex = 1
				this.init_order_items()
			},
			perScopeChange(value) {
	            this.type_items = value
	        },
			orderDetail (oid) {
				this.setStateSearchInfo()
				this.$router.push({path: '/business/order/'+oid})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_order_items()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='paid_time'){
                        if(property!=','&&property.length>0){
                            params['start_date'] = property[0]
                            params['end_date']   = property[1]
                        }
					}else if(o=='is_from_lid'){
						if(property==0) {
							params['form_lid'] = 0
						}else if(property==1) {
							params['from_lid'] = '[>,0]'
						}
					}else if(o=='gtype'){
						if(property.length>0) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
						}
					}else if(o=='is_referer'){
						if(property>-1) {
							params[o] = property
						}
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student,referer_student,join_order,order_item_lha'
			}
		},
		computed: {
			disabled_export() {
				return this.data.length == 0 && this.type_items === 'my'
			}
		}
	}
</script>
