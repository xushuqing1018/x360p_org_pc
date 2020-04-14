<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
        
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
			</Form-item>
			<ButtonGroup>
	        	<Button :type="tab==1?'primary':'ghost'" @click="changeTab(1)">自动停课</Button>
	        	<Button :type="tab==2?'primary':'ghost'" @click="changeTab(2)">自动结课</Button>	        
	    	</ButtonGroup>
		</Form>
		<div class="content-body">
	        <Table  
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columnsInit" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange">
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'
    
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectStudent
		},
		data() {
			return {
				tab: 1,
                rest_api: 'students/0/status_warning',
				rest_api_Array: {1:'students/0/status_warning',2:'students?student_lesson_remain_hours=0&student_lesson_hours=[>,0]&status=1'},
				title: {1:'停课',2:'结课'},
				type: {1:'stop',2:'close'},
                dataInitTitle: {1:'最后一次上课日期',2:'剩余课时'},
				search_field: {
					sid: 0
				},
				columnsInit: [],
				column_keys: {
					student_name: {
						title: '学员',
						show: true
					},
					bid: {
						title: '校区',
						show: true
					},
					first_tel: {
						title: '电话',
						show: true
					},
					age: {
						title: '年龄',
						show: true
					},
					dataInit: {
						title: '',
						show: true
					},
					operate: {
						title: '操作',
						width: 80,
						disabled:true
					}
				},
				column_render: {
					age(h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					dataInit(h,params) {
                        if(this.tab == 1){
                            return h('span',this.$filter('int_date')(params.row.int_day))
                        }else{
                            return h('span',params.row.student_lesson_remain_hours)
                        }
					},
					operate (h,params) {
						let operate = h('Button',{
							props: {
								type: 'ghost',
								size: 'small'
							},
							directives: [
								{
									name:'per',
									value:this.tab == 1 ? 'student.stopLesson' : 'student.closeLesson'
								}
							],
							on: {
								click: () => {
									this.closeOrStopLesson(params.row)
								}
							}
						},[
							this.tab == 1 ? '停课' : '结课'
						])
						return operate
					}
				}
			}
        },
        watch: {
			tab: function (val) {
				this.column_keys.dataInit.title = this.dataInitTitle[this.tab]
				this.columnsInit = this.columns
				this.rest_api = this.rest_api_Array[this.tab]
				
				this.search_field.sid = 0
				this.pageIndex = 1
				this.init_data()
			}
		},
		mounted() {
			this.column_keys.dataInit.title = this.dataInitTitle[this.tab]
			this.columnsInit = this.columns
			this.init_data()
		},
		methods: {
			hook_get_param(params) {
				if(this.search_field.sid) {
					params.sid = this.search_field.sid
				}
			},
            changeTab (val) {
				this.tab = val
			},
			closeOrStopLesson (params){
				this.$rest('students')
				.add_url_param(params.sid,'student_lessons')
				.get()
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status < 2) {
							data.push(item)
						}
					})
					if(data.length==0) {
						this.$Message.error('该学员未上课，无法' + this.title[this.tab])
					}else{
						this.$Modal.open('business/student/'+this.type[this.tab]+'-lesson.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('info',params)
							.set('data',data)
							.show(util.sprintf(this.title[this.tab] + '【%s】',params.student_name),this.type[this.tab])
						})
					}
				})
			}
		}
	}
</script>