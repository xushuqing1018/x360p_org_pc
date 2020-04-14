<template>
	<div class="c-grid">
		<Form ref="ref_search" :model="search_field" :label-width="40" class="filter-form row">
            <Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
				<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
			</Form-item>			
		</Form>
		<Timeline style="max-height: 630px;overflow: auto;margin-top: 10px;">
	        <TimelineItem v-for="(item,index) in data" :key="index">
	            <div class="title">
	            	{{item.update_time}}
	            </div>
	            <div class="content">	       
	            	<Alert style="margin: 0px 0px 10px 0px;padding:10px;">
                        <span>
	                    	学员： <span style="font-weight: bold;">{{item.student.student_name}}</span>
	                    </span>
	                    <span class="ml-3">
	                    	手机号码：<span style="font-weight: bold;">{{item.student.first_tel}}</span>
	                    </span>
	            	</Alert>
                    {{item.note}}
	            </div>
	        </TimelineItem>
	    </Timeline>
        <div v-if="data.length == 0" class="mescroll-empty">
            <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
            <p class="empty-tip">还没有学员提交学习笔记哦~</p>
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
            SelectStudent
		},
		props: {
			ats_id: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				data: [],
				rest_api: 'appointment_students/get_study_note',
                search_field:{
                    sid:0
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
                    if(property){
	                    params[o] = property    
	                }                          
                }

                params.ats_id = this.ats_id
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