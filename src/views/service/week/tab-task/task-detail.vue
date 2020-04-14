<template>
    <Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="900" :mask-closable="false">
    	<div class="c-grid" style="padding:0px;">
    		<div class="box box-result">
    			<div class="content">
    	        	<div class="content-body">
    					<table class="modal-table">
    	            		<thead>
    	            			<tr>
    	            				<th><div class="ivu-table-cell">#</div></th>
    								<th><div class="ivu-table-cell">服务对象</div></th>
    								<th><div class="ivu-table-cell">服务类型</div></th>
    								<th><div class="ivu-table-cell">完成日期</div></th>
    								<th><div class="ivu-table-cell">责任人</div></th>
    	            				<th width="200px"><div class="ivu-table-cell">服务内容</div></th>
    								<th><div class="ivu-table-cell">相关附件</div></th>
                                    <th><div class="ivu-table-cell">操作</div></th>
    	            			</tr>
    	            		</thead>
    	            		<tbody>
    	            			<tr v-for="(item,index) in data" :key="index">
    	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
    	            				<td><div class="ivu-table-cell">{{item.object_type == 2 ? item.classes.class_name : item.student.student_name}}</div></td>
    								<td><div class="ivu-table-cell">{{item.st_did | dict_title(item.object_type == 2 ? 'class_service_type' : 'student_service_type')}}</div></td>
    								<td><div class="ivu-table-cell">{{item.int_day|int_date}}  {{item.int_hour|int_hour}}</div></td>
    								<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
    								<td><div class="ivu-table-cell">{{item.content}}</div></td>
    								<td>
    									<div v-if="item.service_record_file.length != 0">
    										<Poptip placement="left" width="400" trigger="hover">
        									    <Button>相关附件</Button>
    											<div class="api" slot="content">
    												<file-item :list="item.service_record_file"></file-item>
    											</div>
        									</Poptip>
    									</div>
    								</td>
                                    <td>
                                        <div class="ivu-table-cell">
	                    	        	    <Button type="text" size="small" icon="ios-trash" @click="delItem(item)"></Button>
	                    	            </div>
                                    </td>
    	            			</tr>
                                <tr v-if="data.length==0"><td colspan="8"><div class="ivu-table-cell text-center">没有数据</div></td></tr>
    	            		</tbody>
    	            	</table>
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
                				@on-page-size-change="pagesize">
                			</Page>
    		            </div>
    		        </div>
    	        </div>
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
	import FileItem from 'c%/FileItem.vue'
	
	export default{
		mixins: [ grid, modal,common, globals ],
		components: {
			FileItem,
        },
        props: {
			intDay: {
				type: String,
				default: ''
			}
		},
		data () {
			return {
				data: [],
				rest_api: 'service_records',
				pk: 'sr_id'				
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			delItem(item) {
				this.confirm('确定删除这条服务记录吗？')
				.then(() => {
                    this.delete(item)
                    this.$emit('on-success')
				})
			},
			hook_get_param (params) {
                params.with = 'service_record_file,classes,student'
				params.int_day = this.$filter('format_int_day')(this.intDay)
			}
		}
	}
</script>