<template>
	<div class="c-grid">
		<div class="box box-query" v-if="!is_empty_course_case_title">
			<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row" style="display: block;">
                <Form-item label="课案主题：" prop="cct_id" class="col-md-12 col-sm-12">
					<RadioGroup v-model="search_field.cct_id" type="button">
                        <Radio v-for="(item,index) in course_title_list" :key="index" :label="item.cct_id" >{{item.topic}}</Radio>
                    </RadioGroup>
				</Form-item>
				<Form-item label="年龄段：" prop="grade_section" class="col-md-12 col-sm-12">
					<RadioGroup v-model="search_field.grade_section" type="button">
                        <Radio v-for="(item,index) in age_sections" :key="index" :label="item.value" >{{item.title}}</Radio>
                    </RadioGroup>
				</Form-item>
                <Form-item label="时段：" prop="week_duration" class="col-md-12 col-sm-12">
					<RadioGroup v-model="search_field.week_duration" type="button">
                        <Radio v-for="(item,index) in week_duration" :key="index" :label="item.value" >{{item.title}}</Radio>
                    </RadioGroup>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>             		
                </Col>
           </Row>	
		</div>	
		<div class="box box-query" v-else>
			<Alert type="info">
				您(当前账号)没有参加任何课案主题!
			</Alert>
		</div>	
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
                    <Timeline>
	                    <TimelineItem v-for="(item,index) in data" :key="index">
	                        <div class="time-title">
                                <Tag color="blue">{{item.og_id != 0 ? item.org.org_name : '总部'}}</Tag>
                                <template v-if="item.course_case_title">
                                    <Tag color="yellow">{{item.course_case_title.grade_section}}</Tag>
                                    <Tag color="green" v-if="item.course_case_title.week_duration != 0">{{item.course_case_title.week_duration == 1 ? '周中' : item.course_case_title.week_duration == 2 ? '周末' : ''}}</Tag>
                                    {{item.course_case_title.title}}
                                </template>
	                        </div>
	                        <div class="time-content">	       
                                <file-item :list="item.course_case_file"></file-item>
	                        	<Alert style="margin: 0px 0px 10px 0px;padding:10px;">
                                    <span v-if="item.course_case_topic">
	                                	主题： <span style="font-weight: bold;">{{item.course_case_topic.topic}}</span>
	                                </span>
                                    <span class="ml-3" v-if="item.user">
	                                	创建人： <span style="font-weight: bold;">{{item.user.name}}</span>
	                                </span>
	                                <span class="ml-3">
	                                	创建时间：<span style="font-weight: bold;">{{item.create_time}}</span>
	                                </span>
	                        	</Alert>
	                        </div>
	                    </TimelineItem>
	                </Timeline>
                    <div v-if="data.length == 0" class="mescroll-empty">
                        <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                        <p class="empty-tip">
							<span v-if="search_field.cct_id == 0">
								请先选择课案主题
							</span>
							<span v-else>
								没有找到对应的课案哦~
							</span>
						</p>
                    </div>
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'

    import FileItem from 'c%/FileItem'
		
	export default{
        mixins: [ grid, common, globals ],
        components: {
            FileItem
		},
		data () {
			return {
				rest_api: 'course_cases/get_course_case_list',		
				search_field: {
                    topic: '',
                    org_name:'',
                    create_time:'',
                    grade_section:'0',
					week_duration:0,
					cct_id:0
                },
                vod_cates:[],
                age_sections: [
                    { title: '不限', value: '0' },
                    { title: '2-3', value: '2-3' },
                    { title: '4-5', value: '4-5' },
                    { title: '6-7', value: '6-7' },
                    { title: '8-9', value: '8-9' },
                    
                    { title: '10-12', value: '10-12' }
                ],
                week_duration:[
                    { title: '不限', value: 0 },
                    { title: '周中', value: 1 },
                    { title: '周末', value: 2 }
				],
				course_title_list:[],
				is_empty_course_case_title:false
			}
		},	
		created(){
			this.init_course_title()
		},	
		mounted () {
			
		},
		methods: {
			init_course_title(){
				this.$rest('course_case_topics')
				.get({page:1,pagesize:100})
				.success(data=>{
					this.course_title_list = data.list
					if(data.total == 0){
						this.is_empty_course_case_title = true
					}
					if(data.list.length > 0){
						this.search_field.cct_id = data.list[0].cct_id
						this.init_data()
					}
				})
			},
			resetSearch () {
                this.$form('ref_search').reset()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=0){
                        params[o] = property    
                    }                                   
                }
			}
		}
	}
</script>

<style lang="less" scoped>
	.time-title{
		font-size: 15px;
	}
	.time-content{
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
