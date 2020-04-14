<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>
		<div class="content-body">
	        <Table 
		        v-loading.like="'negative_lesson_hour'" 
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
	import SelectAge from 'c%/SelectAge.vue'
    import SelectStudent from 'c%/SelectStudent.vue'
    
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectAge,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'students/0/status_warning',
				search_field: {
					sid: 0
				},
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
					int_day: {
						title: '最后一次上课日期',
						show: true
					}
				},
				column_render: {
					age(h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param(params) {
				if(this.search_field.sid) {
					params.sid = this.search_field.sid
				}
			},
			resetSearch(params) {
				this.search_field.sid = 0
			}
		}
	}
</script>