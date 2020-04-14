<template>
	<div>
		<Table
			class="modal-table"
			v-loading="'action_logs'" 
			:page="pageIndex" 
			:page-size="pageSize" 
			:stripe="true" 
			:show-header="true" 
			:data="data" 
			:columns="columns" 
			:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
			:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
			@on-sort-change="sortChange"> 
		</Table>
        <div class="mt-3 text-right">
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,globals],
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				rest_api:'student_logs',
				id: this.sid > 0?this.sid:this.$route.params.id,
				column_keys: {
					create_uid: {
						title: '操作人',
						show: true
					},
                    bid: {
                        title: '操作校区',
                        show: true
                    },
                    sid: {
                        title: '学员',
                        show: true
                    },
                    op_type: {
                        title: '操作类型',
                        show: true
                    },
					desc: {
						title: '操作内容',
						show: true,
                        width: 250
					},
					create_time: {
						title: '操作时间',
						show: true
					},
                    remark: {
                        title:'备注',
						show:true
                    },
                    status:{
						title:'操作状态',
						show:true
                    },
				},
				column_render: {
					bid(h,params) {
                        return h('span',this.labelBranch(params.row.bid))
                    },
					status(h,params) {
                        return h('Tag',{
                            props: {
                               color: 'green'
                            }
                        },'成功')
                    },
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				params['sid'] = this.id
			}
		}
	}
</script>
