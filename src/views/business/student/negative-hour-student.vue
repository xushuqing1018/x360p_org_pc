<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
			</Form-item>
			<Form-item label="负课时数" class="col-sm-4">
				<select-age v-model="search_field.lesson_hours"></select-age>
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
				rest_api: 'students/0/negative_lesson_hour',
				search_field: {
					sid: 0,
					lesson_hours: []
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
					total_lesson_hours: {
						title: '负课时',
						show: true
					}
				},
				column_render: {
					age(h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					total_lesson_hours(h,params) {
                        let map_lesson_type = {0:'班',1:'一',2:'多'}
                        
                        let info = []

                        params.row.student_lesson_hour_info.forEach(item => {
                            let p = h('p',
                                [
                                    h('Tag',{
                                        attrs:{
                                            color: 'blue'
                                        }
                                    },map_lesson_type[item.lesson_type]),
                                    h('span',item.course_name + '：-' + item.lesson_hours)
                                ])

                            info.push(p)
                        })

                        let ret = h('Tooltip',{
                            props:{
                                placement:'left'
                            }
                        },
                            [
                                h('span',{
                                    style:{
                                        color: '#63c2de',
                                        cursor: 'pointer'
                                    }
                                },'-'+params.row.total_lesson_hours),
                                h('div',{
									slot:'content'
								},info)
                            ]
                        )

						return ret
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param(params) {
				let lesson_hours = this.search_field.lesson_hours
				let start = util.int(lesson_hours[0])
				let end = util.int(lesson_hours[1])
				if(start>=0&&end>0&&end>=start){
					params['lesson_hours'] = util.sprintf('%s,%s',start,end)
				}
				if(this.search_field.sid) {
					params.sid = this.search_field.sid
				}
			},
			resetSearch(params) {
				this.search_field.sid = 0
				this.search_field.lesson_hours = []
			}
		}
	}
</script>