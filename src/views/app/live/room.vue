<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="房间名称" prop="room_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.room_name" placeholder="房间名称"></Input>
				</Form-item>
				<Form-item label="所属老师" prop="eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid" placeholder="请选择所属老师"></select-employee>
				</Form-item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<Button type="ghost" icon="gear-b" class="pull-right" @click="setRoomUri">流媒体服务器地址</Button>
            	</Col>
        	</Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addRoom">创建房间</Button>
			</div>
			<div class="content">
				<div class="content-body">
			        <Table 
			        	v-loading="'live_rooms'"
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
import globals from '@/libs/globals.mixin'
import SelectEmployee from 'c%/SelectEmployee.vue'
export default {
	mixins:[grid,common,globals],
	components: {
		SelectEmployee
	},
	data() {
		return {
			rest_api: 'live_rooms',
			pk: 'lr_id',
			search_field: {
				room_name: '',
				eid: 0
			},
			column_keys: {
				room_name: {
					title: '房间名',
					show: true,
					width: 150,
					fixed: 'left'
				},
				eid: {
					title: '所属老师',
					show: true,
					width: 150
				},
				roomUrl: {
					title: '房间地址',
					width: 300,
					show: true
				},
				room_max_users: {
					title: '房间最大用户数',
					show: true,
					width: 160
				},
				room_mode: {
					title: '房间默认模式',
					show: true,
					width: 160
				},
				discuss_flag: {
					title: '允许讨论模式',
					width: 160
				},
				videos_flag: {
					title: '允许视频模式',
					width: 160
				},
				auto_mic: {
					title: '允许自动上麦',
					width: 160
				},
				dibbling: {
					title: '允许单独查看文件',
					width: 160
				},
				download_flag: {
					title: '允许下载资料',
					width: 160
				},
				save_chat_flag: {
					title: '允许保存聊天记录',
					width: 160
				},
				visitor: {
					title: '允许游客进入',
					width: 160
				},
				note: {
					title: '房间公告',
					width: 200
				},
				rtmpt_video: {
					title: '视频流媒体地址',
					width: 200
				},
				hostID: {
					title: 'hostID',
					width: 160
				}
			},
			column_render: {
				room_mode(h,params) {
					let map = {0:'培训模式',1:'讨论模式',2:'视频模式'}
					return h('span',map[params.row.room_mode])
				},
				eid(h,params) {
					return h('span',this.$filter('ename')(params.row.eid))
				},
				roomUrl(h,params) {
					if(this.live_uri) {
						return h('a',{
							style: {
								cursor: 'pointer'
							},
							attrs: {
								href: `${this.live_uri}/?roomID=${params.row.lr_id}`,
								target: 'blank'
							}
						},`${this.live_uri}/?roomID=${params.row.lr_id}`)
					}
					else {
						return h('span','请先设置流媒体服务器地址')
					}
				},
				discuss_flag(h,params) {
					return h('span',params.row.discuss_flag?'允许':'不允许')
				},
				videos_flag(h,params) {
					return h('span',params.row.videos_flag?'允许':'不允许')
				},
				auto_mic(h,params) {
					return h('span',params.row.auto_mic?'允许':'不允许')
				},
				dibbling(h,params) {
					return h('span',params.row.dibbling?'允许':'不允许')
				},
				download_flag(h,params) {
					return h('span',params.row.download_flag?'允许':'不允许')
				},
				save_chat_flag(h,params) {
					return h('span',params.row.save_chat_flag?'允许':'不允许')
				},
				visitor(h,params) {
					return h('span',params.row.visitor?'允许':'不允许')
				},
				note(h,params) {
					return h('span',params.row.note||'-')
				},
				rtmpt_video(h,params) {
					return h('span',params.row.rtmpt_video||'-')
				},
				hostID(h,params) {
					return h('span',params.row.hostID||'-')
				}
			},
			operation_keys: {
				edit: {
					title: '编辑',
					type: 'edit'
				},
				delete: {
					title: '删除',
					type: 'ios-trash'
				}
			},
			operation_func: {
				edit(params) {
					this.$Modal.open('app/live/room/info-modal.vue',{
						on: {
							'save':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						modal
						.set('info',params.row)
						.show(util.sprintf('编辑房间【%s】',params.row.room_name),'edit')
					})
				},
				delete(params) {
					this.confirm(util.sprintf('确定要删除房间【%】吗？',params.row.room_name))
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
	computed: {
		live_uri() {
			return this.$store.state.gvars.configs.app_live.room_client_uri
		}
	},
	methods: {
		addRoom() {
			this.$Modal.open('app/live/room/info-modal.vue',{
				on: {
					'save':() => {
						this.init_data()
					}
				}
			})
			.then(modal => {
				modal.show('创建房间')
			})
		},
		setRoomUri() {
			this.$Modal.open('app/live/room/uri-modal.vue',{
				on: {
					'save':() => {
						this.init_data()
					}
				}
			})
			.then(modal => {
				modal.show('设置流媒体服务器地址')
			})
		},
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
		}
	}
}
</script>