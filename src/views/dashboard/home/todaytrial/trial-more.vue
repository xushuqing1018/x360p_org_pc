<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<div class="content-body">
	        <Table 
		        v-loading.like="'today_trial'" 
		        ref="tableExcel"
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
	import moment 	 from 'moment'
	import util 	 from '@/libs/util'
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals 	 from '@/libs/globals.mixin'

	import SelectCustomer from 'c%/SelectCustomer.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default{
		mixins: [modal,grid,common,globals],
		components: {
			SelectCustomer,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'dashboard/today_trial',
				column_keys: {
					name: {
						title: '姓名',
						show: true,
					},
					ename: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					lesson: {
						title: '试听课程',
						show: true
					},
					time: {
						title: '试听时间',
						show: true
					}
				},
				column_render: {
					name(h, params) {
						let name,
							tag,
							sex,
							map = {0:{icon:'help'},1:{icon:'male'},2:{icon:'female'}}
						if(params.row.sid) {
							sex = h('Icon',{props: {type: map[params.row.student.sex].icon}})
							name = params.row.student.student_name
							tag  = h('Tag',{props: {color:'green',type:'border'}},'正式学员')
						}else if(params.row.cu_id){
							sex = h('Icon',{props: {type: map[params.row.customer.sex].icon}})
							name = params.row.customer.name
							tag  = h('Tag',{props: {color:'blue',type:'border'}},'意向客户')
						}
						return h('span', [tag,sex,' ',name])
					},
					lesson(h, params) {
						return h('span', this.$filter('lesson_name')(params.row.lid))
					},
					time(h, params) {
						let item = params.row
						return h('span',this.$filter('int_hour')(item.int_start_hour)+'~'+this.$filter('int_hour')(item.int_end_hour))
					},
					ename(h, params) {
						let ename = '-'
						if(params.row.eid>0) {
							ename = this.$filter('ename')(params.row.eid)
						}
						return h('span',ename)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			close() {
				this.modal$.show = false
			}
		}
	}
</script>