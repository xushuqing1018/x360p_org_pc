<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="900" :mask-closable="true">		
		<div class="mb-3">
			<label>书籍：</label>
			<Input ref="isbnInput" v-model="search_field.name" placeholder="书名、作者、ISBN" style="width:250px" @keyup.enter.native="searchByISBN"></Input>
			<label class="ml-3">学员：</label>
			<Input ref="cardInput" v-model="search_field.student_name" placeholder="学员姓名、卡号" style="width:250px" @keyup.enter.native="searchBySno"></Input>
			<Button type="primary" @click="search" icon="ios-search">搜索</Button>
			<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
			<export-button res="book_lendings" :params="params"></export-button>
		</div>
		
		<div class="box box-result">
			<div class="content-body">
	            <Table 
	            	ref="tableExcel"
	            	v-loading="rest_api" 
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
	    	<div class="content-footer mt-3">
	            <div class="pagenation text-right">
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
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid, common, modal, globals ],
		components: {
			ExportButton
		},
		props: {
			bkId: {
				type: [String,Number],
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'book_lendings',
				pk: 'bkl_id',
				search_field: {
					name: '',
					student_name: ''
				},
				column_keys: {
					name: {
						title: '书名',
						show: true
					},
					qty: {
						title: '借出数量',
						show: false
					},
					lending_int_day: {
						title: '借出日期',
						show: true
					},
					lending_days: {
						title: '借书天数',
						show: true,
						width: 100
					},
					student_name: {
						title: '借书学员',
						show: true,
						width: 120
					},
					back_int_day: {
						title: '还书日期',
						show: true,
						width: 120
					}
				},
				column_render: {
					lending_int_day (h,params) {
						let divs = []
						if(params.row.apply_way==1) {
							if(params.row.lending_int_day==0) {
								if(params.row.back_status==0) {
									divs.push(h('div',{
										class: 'text-info'
									},'待审批'))
								}else if(params.row.back_status==3) {
									divs.push(h('div',{
										class: 'text-danger'
									},'已取消申请'))
								}
							}else{
								divs.push(h('div',{
									class: 'text-success'
								},'已审批'))
								divs.push(h('div',this.$filter('int_date')(params.row.lending_int_day)+'借出'))
							}
							divs.push(h('div',this.$filter('int_date')(params.row.apply_int_day)+'申请'))
						}else{
							divs.push(h('div',this.$filter('int_date')(params.row.lending_int_day)))
						}
						return h('div',divs)
					},
					back_int_day (h,params) {
						let row = params.row,
							back_int_day = this.$filter('int_date')(row.back_int_day)||'',							
							result = []
						
						if(back_int_day != ''){
							result.push(h('span',back_int_day))
							result.push(h('span','已归还'))
						}
						
						if(params.row.lending_int_day > 0) {
							if(row.back_status == 2){
								result.push(h('p',{'class':'text-disabled'},'已报损'))							
							}else if(row.back_status == 1){							
								//逾期未还
								if(row.over_days > 0){
									result.push(h('p',{'class':'text-danger'},`逾期${row.over_days}天`))
								}
							}else{							
								//逾期未还
								if(row.over_days > 0){
									result.push(h('p',{'class':'text-danger'},`已逾期${row.over_days}天`))
								}else{
									result.push(h('p',{'class':'text-info'},'待还'))
								}
							}
						}else{
							result.push(h('p','-'))
						}
						
						return result
					}
				},
				operation_keys: {
					returnBook: {
						title: '还书',
						type: 'android-hand',
						condition: 'row.back_int_day == 0 && row.lending_int_day > 0'
					},
					reduceBook: {
						title: '报损',
						type: 'wrench',
						condition: 'row.back_int_day == 0 && row.lending_int_day > 0'
					},
					applyPass: {
						title: '申请通过',
						type: 'checkmark',
						condition: 'row.apply_way == 1 && row.lending_int_day == 0 && row.back_status==0'
					},
					applyCancel: {
						title: '取消申请',
						type: 'close',
						condition: 'row.apply_way == 1 && row.lending_int_day == 0 && row.back_status==0'
					}
				},
				operation_func: {
					returnBook(params) {
						this.returnBook(params.row)
					},
					reduceBook(params) {
						this.reduceBook(params.row)
					},
					applyPass(params) {
						this.selectLendday(params.row)
					},
					applyCancel(params) {
						this.applyCancel(params.row)
					}
				}
			}
		},
		watch:{
			'modal$.show': function (val) {
				if(val){					
					this.init_data()
					this.$nextTick(()=>{
						this.$refs.isbnInput.focus()
					})
				}
			}
		},		
		methods: {
			applyCancel (row) {
				this.$rest('book_lendings').add_url_param('do_cancel')
				.post({
					bkl_id: row.bkl_id
				})
				.success(data=>{
					this.$Message.success('取消成功')
					this.$emit('on-success')
					this.init_data()
				})
				.error(res=>{
					this.error(res.body.message)
				})
			},
			selectLendday (row) {
				this.$Modal.open('app/books/lending-day.vue@modal',{
					on: {
						'on-ok': (date)=>{
							this.applyPass(row,date)
						}
					}
				})
				.then(modal=>{
					modal.show('选择出借日期')
				})
			},
			applyPass (row,date) {
				this.$rest('book_lendings').add_url_param('do_pass')
				.post({
					bkl_id: row.bkl_id,
					lending_int_day: date
				})
				.success(data=>{
					this.$Message.success('借出成功')
					this.$emit('on-success')
					this.init_data()
				})
				.error(res=>{
					this.error(res.body.message)
				})
			},
			reduceBook (row) {
				let info = {
					bkl_id: row.bkl_id,
					bk_id: row.bk_id,
					op_type: 0,
					qty: 1,
					op_int_day: moment(new Date()).format('YYYY-MM-DD'),
					sid: row.sid,
					remark: '图书报损'
				}
				
				this.$rest('books/change_qty')
				.post(info)
				.success(data=>{
					this.$Message.success('报损成功')
					this.$emit('on-success')
					this.init_data()
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			searchByISBN () {
				this.search()
				this.$refs.cardInput.focus()
			},
			searchBySno () {
				this.search()
			},
			resetSearch () {
				this.search_field.name = ''
				this.search_field.student_name = ''
				this.init_data()
			},
			hook_get_param (params) {
				let search_field = this.search_field
				if(!/$\s*^/.test(search_field.name)){
					params.name = search_field.name
				}
				if(!/$\s*^/.test(search_field.student_name)){
					params.student_name = search_field.student_name
				}
				if(this.bkId > 0){
					params.bk_id = this.bkId
				}
			},
			returnBook (row) {
				this.$rest('books/doreturn')
				.post({bkl_id:row.bkl_id})
				.success(data=>{
					this.$Message.success('还书成功')
					this.$emit('on-success')
					this.init_data()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
	
</script>

<style>
</style>