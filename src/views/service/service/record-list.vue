<template>
	<div class="c-grid">
		<Button type="primary" icon="plus" class="mb-3" @click="record">记录</Button>
		<Timeline>
	        <TimelineItem v-for="item in data">
	            <div class="title">
	            	{{item.int_day|int_date}}  {{item.int_hour|int_hour}}	
	            </div>
	            <div class="content">	            	
	            	{{item.content}}
	            	   
	            	<file-item :list="item.service_record_file"></file-item>
	            	<p>
	            		<span>
	            			责任人： {{item.eid|ename}}
	            		</span>
	            		<span class="ml-3" v-if="item.cid>0">
	            			服务类型：{{item.st_did|dict_title('class_service_type')}}
	            		</span>
	            		<span class="ml-3" v-else>
	            			服务类型：{{item.st_did|dict_title('student_service_type')}}
	            		</span>
	            		<Icon type="ios-trash" size="18" class="pull-right" @click.native="delItem(item)"></Icon>
	            	</p>
	            </div>
	        </TimelineItem>
	    </Timeline>
	    <div v-if="data.length==0" class="text-center">没有数据</div>
        <div class="text-right">
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
	import FileItem from 'c%/FileItem.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			FileItem
		},
		props: {
			sid: {
				type: [Number,String],
				default: 0
			},
			cid: {
				type: [Number,String],
				default: 0
			},
			type: {
				type: [Number],
				default: 0
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
			record() {
				this.$Modal.open('service/service/record-modal.vue',{
					props: {
						sid: this.sid,
						cid: this.cid,
						type: this.type
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务记录','add')
				})
			},
			delItem(item) {
				this.confirm('确定删除这条服务记录吗？')
				.then(() => {
					this.delete(item)
				})
			},
			hook_get_param (params) {
				if(this.sid){
					params.sid = this.sid					
				}
				if(this.cid){
					params.cid = this.cid
				}
				params.with = 'service_record_file'
			}
		}
	}
</script>

<style lang="less" scoped>
	.title{
		font-size: 18px;
	}
	.content{
	    margin-top: 10px;
	    font-size: 14px;
	    position: relative;
	    padding-bottom: 10px;
	    padding: 10px;
	    box-shadow: 0px 0px 3px rgba(0,0,0,.3);
	    border-radius: 2px;
	    &:before{
	    	content: '';
		    position: absolute;
		    top: -8px;
		    left: 10px;
		    width: 15px;
		    height: 15px;
		    background: #fff;
		    border: 1px solid #dddee1;
		    transform: rotate(45deg);
		    z-index: 10;
		    border-right: none;
		    border-bottom: none;
		    border-radius: 3px 0 0 0;
	    }
	}
</style>