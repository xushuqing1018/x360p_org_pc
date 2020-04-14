<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="积分规则" prop="cr_id" class="col-md-3 col-sm-6">
					<select-credit-rule v-model="search_field.cr_id" clearable></select-credit-rule>
				</Form-item>
				<Form-item label="时间范围" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker v-model="search_field.create_time" @on-change="search" style="width: 100%;"></date-range-picker>
				</Form-item>
				<Form-item label="操作人" prop="create_uid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.create_uid" mode="user"></select-employee>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<Button type="primary" @click="exportExcel('学员积分汇总')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
                	<div class="pull-right">
                		<Button type="primary" icon="compose" @click="creditDetail">积分明细</Button>
                		<Button type="primary" icon="hammer" @click="creditRules">积分规则</Button>
                	</div>
                </Col>
           </Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="scissors" @click="batchOperate" v-per="'integral.batch'">批量操作</Button>
				<Button type="primary" icon="flash" @click="batchConverse" v-per="'integral.converse'">积分转换</Button>
			</div>
			<div class="content">
				<div class="content-body">
					<Table 
		            	ref="tableExcel"
		            	class="credit-stats"
		            	v-loading="'student_credit_historys/student_list'" 
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="my_columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"
		            	@on-select="selectOne"
		            	@on-select-cancel="cancelSelect"
		            	@on-select-all="selectAll"
		            	@on-selection-change="selectChange"> 
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
		<student-detail-modal ref="detail"></student-detail-modal>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectCreditRule from 'c%/SelectCreditRule.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import StudentDetailModal from './integral/student-detail-modal.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			SelectStudent,
			SelectEmployee,
			SelectCreditRule,
			DateRangePicker,
			StudentDetailModal
		},
		data() {
			return {
				rest_api: 'student_credit_historys/student_list',
				search_field: {
					sid: 0,
					create_uid: 0,
					credit: ['',''],
					cr_id: 0,
					create_time: util.recent_month_range(1),
				},
				sids: [],
				student_selected: []
			}
		},
		computed: {
			my_columns() {
				let columns = [
					{
						type: 'selection',
						width: 60,
						align: 'center'
					},
					{
						title: '学员姓名',
						key: 'student_name',
						align: 'center',
						render:(h,params) => {
							return h('span',{
								class: 'text-info x-a-link',
								on: {
									click:() => {
										this.getCreditHistory(params.row)
									}
								}
							},params.row.student_name)
						}
					},
					{
						title: '积分余额',
						align: 'center',
						children: [
							{
								title: '学习积分',
								key: 'credit',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									const row = params.row
									return h('span',{
										on: {
											'click':() => {
												this.showDetail1(row,'credit')
											}
										}
									},row.credit)
								}
							},
							{
								title: '消费积分',
								key: 'credit2',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									const row = params.row
									return h('span',{
										on: {
											'click':() => {
												this.showDetail1(row,'credit2')
											}
										}
									},row.credit2)
								}
							}
						]
					},
					{
						title: '累计',
						align: 'center',
						children: [
							{
								title: '学习积分',
								align: 'center',
								children: [
									{
										title: '加分',
										align: 'center',
										key: 'total_study_inc',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-success',
												on: {
													'click':() => {
														this.showDetail2(row,'total_study_inc')
													}
												}
											},[row.total_study_inc>0?'+ ':'',row.total_study_inc])
										}
									},
									{
										title: '减分',
										align: 'center',
										key: 'total_study_dec',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-danger',
												on: {
													'click':() => {
														this.showDetail2(row,'total_study_dec')
													}
												}
											},[row.total_study_dec>0?'- ':'',row.total_study_dec])
										}
									},
								]
							},
							{
								title: '消费积分',
								align: 'center',
								children: [
									{
										title: '加分',
										align: 'center',
										key: 'total_consume_inc',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-success',
												on: {
													'click':() => {
														this.showDetail2(row,'total_consume_inc')
													}
												}
											},[row.total_consume_inc>0?'+ ':'',row.total_consume_inc])
										}
									},
									{
										title: '减分',
										align: 'center',
										key: 'total_consume_dec',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-danger',
												on: {
													'click':() => {
														this.showDetail2(row,'total_consume_dec')
													}
												}
											},[row.total_consume_dec>0?'- ':'',row.total_consume_dec])
										}
									},
								]
							}
						]
					}
				]
				if(this.search_field.create_time.length == 2&&this.search_field.create_time[0] !== '') {
					columns.push({
						title: util.sprintf('%s 到 %s',this.search_field.create_time[0],this.search_field.create_time[1]),
						align: 'center',
						children: [
							{
								title: '学习积分',
								align: 'center',
								children: [
									{
										title: '加分',
										align: 'center',
										key: 'period_study_inc',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-success',
												on: {
													'click':() => {
														this.showDetail3(row,'period_study_inc')
													}
												}
											},[row.period_study_inc>0?'+ ':'',row.period_study_inc])
										}
									},
									{
										title: '减分',
										align: 'center',
										key: 'period_study_dec',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-danger',
												on: {
													'click':() => {
														this.showDetail3(row,'period_study_dec')
													}
												}
											},[row.period_study_dec>0?'- ':'',row.period_study_dec])
										}
									},
								]
							},
							{
								title: '消费积分',
								align: 'center',
								children: [
									{
										title: '加分',
										align: 'center',
										key: 'period_consume_inc',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-success',
												on: {
													'click':() => {
														this.showDetail3(row,'period_consume_inc')
													}
												}
											},[row.period_consume_inc>0?'+ ':'',row.period_consume_inc])
										}
									},
									{
										title: '减分',
										align: 'center',
										key: 'period_consume_dec',
										render:(h,params) => {
											const row = params.row
											return h('span',{
												class: 'text-danger',
												on: {
													'click':() => {
														this.showDetail3(row,'period_consume_dec')
													}
												}
											},[row.period_consume_dec>0?'- ':'',row.period_consume_dec])
										}
									},
								]
							}
						]
					})
				}
				return columns
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			getCreditHistory(row) {
				this.$Modal.open('business/student/credit.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('sid',row.sid)
					.set('students',[row.student_name])
					.show(util.sprintf('【%s】的积分记录',row.student_name),'add')
				})
			},
			showDetail1(row,title) {
				this.$r('detail')
				.set('sid',row.sid)
				.set('cate',title=='credit'?1:2)
				.show(title=='credit'?'学习积分明细':'消费积分明细','view')
			},
			showDetail2(row,title) {
				let type_index = title.indexOf('inc'),
					cate_index = title.indexOf('study'),
					type = type_index!==-1 ? '加分':'减分',
					cate = cate_index!==-1 ? '学习积分':'消费积分'
				this.$r('detail')
				.set('sid',row.sid)
				.set('type',type_index!==-1?1:2)
				.set('cate',cate_index!==-1?1:2)
				.show(cate+'累计'+type+'明细','view')
			},
			showDetail3(row,title) {
				let type_index = title.indexOf('inc'),
					cate_index = title.indexOf('study'),
					type = type_index!==-1 ? '加分':'减分',
					cate = cate_index!==-1 ? '学习积分':'消费积分'
				this.$r('detail')
				.set('sid',row.sid)
				.set('type',type_index!==-1?1:2)
				.set('cate',cate_index!==-1?1:2)
				.set('create_time',this.search_field.create_time)
				.show(util.sprintf('%s%s%s明细',cate,this.search_field.create_time.join('到'),type),'view')
			},
			batchOperate() {
				if(this.sids.length == 0) {
					this.$Message.error('请选择要操作的学员')
					return false
				}
				this.$Modal.open('business/student/integral/credit-operate-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let student_name = []
					this.student_selected.forEach(s => {
						student_name.push(s.student_name)
					})
					modal.vuec
					.set('students',student_name)
					.set('sids',this.sids)
					.show('积分操作','add')
				})
			},
			batchConverse() {
				if(this.sids.length == 0) {
					this.$Message.error('请选择要操作的学员')
					return false
				}
				this.$Modal.open('business/student/integral/converse-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let student_name = []
					this.student_selected.forEach(s => {
						student_name.push(s.student_name)
					})
					modal
					.set('students',student_name)
					.set('sids',this.sids)
					.show('积分转换')
				})
			},
			add(s) {
				const sid_index = this.sids.indexOf(s.sid)
				const row_index = this.student_selected.findIndex(item => item.sid == s.sid)
				if(sid_index == -1) {
					this.sids.push(s.sid)
				}
				if(row_index == -1) {
					this.student_selected.push(s)
				}
			},
			remove(s) {
				const sid_index = this.sids.indexOf(s.sid)
				const row_index = this.student_selected.findIndex(item => item.sid == s.sid)
				if(sid_index !== -1) {
					this.sids.splice(sid_index,1)
				}
				if(row_index !== -1) {
					this.student_selected.splice(row_index,1)
				}
			},
			selectOne(selection,row) {
				this.add(row)
			},
			cancelSelect(selection,row) {
				this.remove(row)
			},
			selectAll(selection) {
				selection.forEach(s => {
					this.add(s)
				})
			},
			selectChange(selection) {
				if(selection.length == 0) {
					this.data.forEach(s => {
						this.remove(s)
					})
				}
			},
			deal_data(data) {
				data.list.forEach(item=>{
					if(this.sids.indexOf(item.sid) !== -1){
						item._checked = true;
					}
				})
				return data.list
			},
			creditDetail() {
				this.$Modal.open('business/student/integral/credit-detail-modal.vue')
				.then(modal => {
					modal.vuec.show('积分明细','list')
				})
			},
			creditRules() {
				this.$Modal.open('business/student/integral/rules-list-modal.vue')
				.then(modal => {
					modal.vuec.show('积分规则','list')
				})
			},
			hook_get_param(param) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'||o=='credit'){
						if(property!=','&&property.length>0) {
							param[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							param[o] = property
						}
					}
				}
			},
			resetSearch() {
				this.$r('ref_search').reset()
				this.search()
			}
		}
	}
</script>
<style lang="less">
	.credit-stats {
		.ivu-table {
			tr th{
				border: 1px solid #e3e8ee;
			}
			tr td span:hover {
				text-decoration: underline;
				cursor: pointer;
			}
		}
	}
</style>