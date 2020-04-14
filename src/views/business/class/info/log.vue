<template>
	<div>
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">操作类型</div></th>
				<th><div class="ivu-table-cell">操作描述</div></th>				
				<th><div class="ivu-table-cell">所在班级</div></th>
				<th><div class="ivu-table-cell">操作时间</div></th>
				<th><div class="ivu-table-cell">经办人</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td><div class="ivu-table-cell">{{item.event_type}}</div></td>
				<td><div class="ivu-table-cell">{{item.desc}}</div></td>
				<td><div class="ivu-table-cell">{{getClassName(item)}}</div></td>
				<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
				<td><div class="ivu-table-cell">{{getCreateUser(item)}}</div></td>
			</tr>
			<tr v-if="data.length==0">
				<td colspan="5">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
        <div class="mt-3 text-right">
            <Page 
            	transfer
            	:total="total" 
            	class="pull-right"
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
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			DateRangePicker
		},
		props: {
			cid:{
				type: [Number,String],
				required: true
			}
		},
		data () {
			return {
				rest_api: 'class_logs?cid='+this.cid,
				search_field: {
					create_time: [],
					event_type: -1
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				params['with'] = 'cls,student,create_user'
			},
			getClassName (item) {
				let name = ''
				if(item.cls!=undefined) {
					name = item.cls.class_name 
				}
				return name
			},
			getCreateUser(item) {
				let name = ''
				if(item.create_user) {
					name = item.create_user.name
				}
				return name
			}
		},
		computed: {
			
		}
	}
</script>
