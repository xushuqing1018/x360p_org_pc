<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div class="c-grid">
	    	<div class="box box-query">
	    		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                    <Form-item label="学员" prop="sid" class="col-md-5 col-sm-6">
	    				<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
	    			</Form-item>			
	    		</Form>
	    	</div>
	    	<Timeline style="max-height: 630px;overflow: auto;margin-top: 10px;">
	            <TimelineItem v-for="(item,index) in data" :key="index">
	                <div class="title">
	                	{{item.create_time}}
	                </div>
	                <div class="content" style="padding-top: 10px;">	
                        {{item.answer_text}}       
	                	<Alert style="margin: 10px 0px 0px;">
                            <span>
	                        	学员： <span style="font-weight: bold;">{{item.questionnaire_answer.student.student_name}}</span>
	                        </span>
	                        <span class="ml-3">
	                        	手机号码：<span style="font-weight: bold;">{{item.questionnaire_answer.student.first_tel}}</span>
	                        </span>
	                	</Alert>
	                </div>
	            </TimelineItem>
	        </Timeline>
            <div v-if="data.length == 0" class="mescroll-empty">
                    <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                    <p class="empty-tip">没找到对应数据哦~</p>
                </div>
            <div class="text-right" v-if="data.length != 0" style="margin-top: 10px;">
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
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
    import util from '@/libs/util'
    import modal from '@/libs/modal.mixin'
    import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'

	export default {
        mixins:[modal,grid,common],
        components: {
			SelectStudent
        },
        props:{
            bind_id:{
                type:Number,
                default:0
            },
            bind_table:{
                type:String,
                default:''
            },
            qs_id:{
                type:Number,
                default:0
            },
        },
		data () {
			return {
				rest_api: 'questionnaire_answers/get_questionnaire_answers_item',
				search_field: {
                    sid: 0
				}
			}
        },
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property){
	                    params[o] = property
	                }                          
                }

                params.bind_id = this.bind_id
                params.bind_table = this.bind_table
                params.qs_id = this.qs_id
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