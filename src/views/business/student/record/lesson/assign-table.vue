<template>
	<Row>
		<Col span="24">
			<table class="modal-table">
				<thead>
					<tr>
						<th width="50"><div class="ivu-table-cell">#</div></th>
						<th><div class="ivu-table-cell">日期
							<Badge :count="arrangeList.length"></Badge>
						</div></th>
						<th><div class="ivu-table-cell">时间段</div></th>
						<th><div class="ivu-table-cell">授课对象</div></th>
						<th><div class="ivu-table-cell">{{label_teacher}}</div></th>
						<th><div class="ivu-table-cell">{{label_secteacher}}</div></th>
						<th><div class="ivu-table-cell">教室</div></th>
						<th width="120"><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in arrangeList">
						<td><div class="ivu-table-cell">{{index+1}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<span>{{item.int_day|int_date}}</span>
								<span style="margin-left: 5px;">{{getWeekText(item.week_day)}}</span>
							</div>
						</td>
						<td><div class="ivu-table-cell">{{item.int_start_hour}}~{{item.int_end_hour}}</div></td>
						<td><div class="ivu-table-cell">{{item.int_start_hour}}~{{item.int_end_hour}}</div></td>
						<td><div class="ivu-table-cell">{{item.eid|ename('-')}}</div></td>
						<td><div class="ivu-table-cell">{{item.second_eids|enames('-')}}</div></td>
						<td><div class="ivu-table-cell">{{item.cr_id|classroom_name('-')}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<Button type="text" size="small" icon="edit" title="编辑" @click="editItem(item,index)"></Button>
								<Button type="text" size="small" icon="ios-copy" title="复制" @click="copyItem(item,index)"></Button>
								<Button type="text" size="small" icon="ios-trash" title="删除" @click="delItem(index)"></Button>
							</div>
						</td>
					</tr>
					<tr v-if="arrangeList.length==0">
						<td colspan="8" class="text-center">没有符合条件的排课</td>
					</tr>
				</tbody>
			</table>
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
		</Col>
	</Row>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [common,globals],
		props: {
			arrangeList: {
				type: Array,
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			editItem(item,index) {
				
			},
			copyItem(item,index) {
				this.arrangeList.splice(index+1,0,Object.assign({},item,emptyError))
			},
			delItem(index) {
				this.arrangeList.splice(index,1)
			},
			getWeekText(d) {
				let map = ['日','一','二','三','四','五','六']
				return '周'+map[d]
			}
		}
	}
</script>