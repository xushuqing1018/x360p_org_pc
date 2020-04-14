<template>
    <Modal v-drag-modal v-model="modal$.show" :mask-closable="true" width="800" :title="modal$.title">
    	<div>
    		<div class="list-main">
                <div class="list-condition">
                	<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                		<Form-item label="课案标题" prop="title" class="col-md-5 col-sm-6">
                			<Input 
                                v-model="search_field.title" 
                                size="small" 
                                placeholder="课案标题" 
                                @keyup.native.enter="search">
                            </Input>
                		</Form-item>
                        <Form-item label="点赞数" prop="like_nums" class="col-md-5 col-sm-6">
                			<select-age v-model="search_field.like_nums"></select-age>
                		</Form-item>
                        <Form-item label="加盟商" prop="og_id" class="col-md-5 col-sm-6">
                			<Select v-model="search_field.og_id">
                                <Option v-for="(item,index) in org_data" :key="index" :value="item.og_id">{{item.org_name}}</Option>
                            </Select>
                		</Form-item>
                        <Form-item label="创建时间" prop="int_day" class="col-md-5 col-sm-6">
                			<DatePicker :value="search_field.int_day" @on-change="search_field.int_day=$event" placeholder="创建时间"></DatePicker>
                		</Form-item>
                	</Form>
                    <Row class="basic">
                	    <Col span="16">
                	    	<ButtonGroup>
                	    		<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                	    	</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                	    </Col>
                    </Row>
                </div>
                <div class="list-body" style="margin-top: 10px;">
                    <Timeline style="max-height: 630px;overflow: auto;margin-top: 10px;" v-if="data.length > 0">
	                    <TimelineItem v-for="(item,index) in data" :key="index" @click.native="toggleSelected(item)">
	                        <div class="title">
	                        	标题：{{item.course_case_title.title}}
	                        </div>
	                        <div class="content">	       
                                <file-item :list="item.course_case_file"></file-item>
	                        	<Alert style="margin: 0px 0px 10px 0px;padding:10px;">
	                                <span>
                                        会议主题：<span style="font-weight: bold;">{{item.course_case_topic.topic}}</span>
	                                </span>
                                    <span class="ml-3">
	                                	点赞数：<span style="font-weight: bold;">{{item.like_nums}}</span>
	                                </span>
                                    <span class="ml-3">
	                                	创建人：<span style="font-weight: bold;">{{item.user.name}}</span>
	                                </span>
                                    <span class="ml-3">
	                                	创建时间：<span style="font-weight: bold;">{{item.create_time}}</span>
	                                </span>
	                        	</Alert>
                                {{item.remark}}
	                        </div>
	                    </TimelineItem>
	                </Timeline>
                    <div v-if="data.length == 0" class="mescroll-empty">
                        <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                        <p class="empty-tip">没有可用的课案哦~</p>
                    </div>
                    <div class="list-page clearfix" style="margin-top: 10px;">
                        <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                    
                </div>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left"><i>已选择:</i>{{info.course_case_title.title}}</span>
            <Button type="default" @click="close">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectAge from 'c%/SelectAge.vue'
import FileItem from 'c%/FileItem.vue'

export default {
	name:'CourseCaseList',
    mixins: [grid,common,globals,modal],
    components:{
        SelectAge,
        FileItem
    },
    data() {
        return {
            rest_api: 'course_cases',
            pk: 'cc_id',
            selIds: [],
            search_field: {
                title: '',
                int_day:'',
                og_id:0,
                like_nums:[0,0]
            },
            info:{
                course_case_title:{
                    title:''
                }
            },
            org_data:[]
        }
    },
    mounted(){
        this.get_org_data()
    },
    methods: {
        get_org_data(){
            this.$http.get('orgs')
			.then(res => {
				this.org_data = res.body.data.list;
			},res => {
				this.$Message.error(res.body.message)
			})
        },
    	resetSearch () {
            this.$form('ref_search').reset()
            this.search_field.like_nums = [0,0]
    	},
        ok(){
            if(this.info.cc_id == undefined){
                this.$Message.error('没有选中任何课案')
                return
            }
            this.$emit('on-selected',this.info.course_case_file)
            this.close()
        },
        hook_get_param(params) {
            let search_field = util.copy(this.search_field)
            for(let o in search_field) {
                let property = search_field[o]
                if(o=='like_nums') {
					let start = util.int(property[0])
					let end = util.int(property[1])
					if(start>=0&&end>0&&end>=start){
						params[o] = util.sprintf('[Between,%s,%s]',start,end)
					}						
				}else{
                    if(property&&property!=-1) {
                        params[o] = property
                    }
                }
            }
            params.with = "course_case_file,course_case_topic,user,course_case_title"
        },
        toggleSelected(item){
            if(this.info == item){
                this.ok()
            }else{
                this.info = item
            }
            
        }
    },
    watch: {
        'modal$.show': function (val){
            if(val){
                this.init_data()
            }
        }
    }
}
</script>
