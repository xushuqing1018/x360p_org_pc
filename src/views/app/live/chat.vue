<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="房间名称" prop="room_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.room_name" placeholder="请输入房间名"></Input>
				</Form-item>
				<Form-item label="发送人" prop="send_uid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.send_uid" mode="user" placeholder="请选择发送人"></select-employee>
				</Form-item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
            	</Col>
        	</Row>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
			        <Table 
			        	v-loading="'live_chats'"
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        > 
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
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import SelectEmployee from 'c%/SelectEmployee.vue'
export default {
	mixins:[grid,common],
	components: {
		SelectEmployee
	},
	data() {
		return {
			rest_api: 'live_chats',
			pk: 'lc_id',
			search_field: {
				room_name: '',
				send_uid: 0
			},
			column_keys: {
				room_name: {
					title: '房间',
					show: true
				},
				send_name: {
					title: '发送人',
					show: true
				},
				accept_name: {
					title: '接收人',
					show: true
				},
				content: {
					title: '内容',
					show: true
				},
				create_time: {
					title: '发送时间',
					width: 160
				}
			},
			column_render: {
				room_name(h,params) {
					return h('span',params.row.live_room?params.row.live_room.room_name:'-')
				}
			},
			operation_keys: {
				delete: {
					title: '删除',
					type: 'ios-trash'
				}
			},
			operation_func: {
				delete(params) {
					this.confirm('确定要删除房间【%】吗？',params.row.room_name)
					.then(() => {
						this.delete(params.row)
					})
				}
			}
		}
	},
	mounted() {
		this.init_data()
	},
	methods: {
		resetSearch () {
			this.$form('ref_search').reset()
			this.init_data()
		},
		hook_get_param(params) {
			let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(property&&property!==-1) {
					params[o] = property
				}
			}
			params.with = 'live_room'
		}
	}
}
</script>