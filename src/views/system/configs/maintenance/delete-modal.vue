<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="来源渠道" prop="mc_id" class="col-sm-6">
				<select-channel v-model="search_field.mc_id" :show-add="false"></select-channel>
			</Form-item>
			<FormItem label="校区" prop="bid" class="col-sm-6">
            	<select-branch v-model="search_field.bid" clearable></select-branch>
            </FormItem>
			<Form-item label="获取时间" prop="get_time" class="col-sm-6">
				<date-range-picker 
					v-model="search_field.get_time" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="录入时间" prop="create_time" class="col-sm-6">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
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
			<Button type="ghost" :disabled="saving" @click="close">关闭</Button>
			<Button type="error" :loading="saving" @click="deleteCondition">确定删除</Button>
		</div>
	</Modal>
</template>
<script>
	
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker'
	import SelectChannel from 'c%/SelectChannel'
	import SelectBranch from 'c%/SelectBranch'

	export default {
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		mixins: [grid,modal,common,globals],
		components: {
			DateRangePicker,
			SelectChannel,
			SelectBranch
		},
		data() {
			return {
				rest_api: '',
				search_field: {
					get_time: [],
					create_time: [],
					mc_id: 0,
					bid: 0
				},
				column_keys: {
					name: {
						title:'姓名',
						show:true
					},
					bid: {
						title: '校区',
						show: true
					},
					channel_name: {
						title: '来源渠道',
						show: true,
						width: 110
					},
					get_time: {
						title:'获取时间',
						show:true
					},
					create_time: {
						title:'录入时间',
						show:true
					}
				},
				column_render: {
					name(h,params) {
						return h('span',params.row.name)
					},
					get_time(h,params) {
						let result = '-',
							get_time = params.row.get_time
						
						if(get_time && get_time.indexOf('1970') == -1){
							result = params.row.get_time
						}
						
						return h('span',result)
					},
					create_time(h,params) {
						return h('span',params.row.create_time.substring(0,10))
					}
				}
			}
		},
		computed: {
			onModalOpen() {
				this.rest_api = this.info.url
				this.init_data()
			}
		},
		methods: {
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'||o=='get_time'){
						if(property.length > 0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property
						}	
					}
				}
				if(this.rest_api == 'market_clues') {
					params.recommend_sid = 0
				}
			},
			deleteCondition() {
				let search = util.copy(this.search_field),
					params = {}

				for(let o in search) {
					let prop = search[o]
					if(o == 'get_time') {
						if(prop != ',' && prop.length > 0){
	                        params['get_start_time'] = prop[0]
	                        params['get_end_time'] = prop[1]
	                    } 
					}else if(o == 'create_time') {
						if(prop != ',' && prop.length > 0){
	                        params['create_start_time'] = prop[0]
	                        params['create_end_time'] = prop[1]
	                    } 
					}else{
						if(prop&&prop!=-1){
							params[o] = prop
						}
					}
				}
				if(_.isEmpty(params)) {
					this.$Message.error('请选择查询条件')
					return
				}
				this.$rest(this.rest_api).add_url_param('delete_condition')
				.post(params)
				.success(res => {
					this.$Message.success('删除成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>
