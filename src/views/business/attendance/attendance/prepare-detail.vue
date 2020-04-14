<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="900" :mask-closable="false">
		<div class="c-grid">
            <div class="list-condition">
                <Row class="mt-1">
                	<Col>
                        <Date-picker type="date" v-model="int_day" format="yyyy-MM-dd" placeholder="请选择上课日期" :show-week-label="true"></Date-picker>
                        <span class="ivu-table-cell text-center" v-if="loading">稍等，正在加载备课内容...~</span>
                	</Col>
                </Row>
            </div>
		    <div class="row">
		    	<data-ready ref="dr" :cache="false" :data="info_url" @ready="dataReady" class="col-sm-12 mt-3">
		    		<Card dis-hover>
		    			<div slot="title">备课详情</div>
		    			<Row :gutter="16">
		    				<Col span="8">
		    					<Form :label-width="80">
		    						<Form-item label="备课标题：" class="mb-0">
		    							{{info.title}}
		    						</Form-item>
		    						<Form-item label="上课对象：" class="mb-0">
		    							<Tag color="blue">
		    								<span v-if="info.lesson_type==0">班</span>
		    								<span v-else-if="info.lesson_type==1">一</span>
		    								<span v-else>多</span>
		    							</Tag>
		    							<Tag>{{class_name}}</Tag>
		    						</Form-item>
		    						<Form-item label="课程：" class="mb-0">										
		    							{{info.lid|lesson_name}}
		    						</Form-item>
		    						<Form-item label="科目：" class="mb-0">										
		    							{{info.sj_id|subject_name}}
		    						</Form-item>
		    						<Form-item label="上课日期：" class="mb-0">
		    							{{info.int_day|int_date}}
		    						</Form-item>
		    						<Form-item label="上课时间：" class="mb-0">
		    							{{info.int_start_hour|int_hour}}~{{info.int_end_hour|int_hour}}
		    						</Form-item>
		    						<Form-item label="推送状态：" class="mb-0">
		    							<span :class="info.is_push?'text-success':''">{{info.is_push?'已推送':'待推送'}}</span>
		    						</Form-item>
		    					</Form>	
		    				</Col>	
		    				<Col span="16">
		    					<Card>
		    						<div slot="title" class="clearfloat">
		    							<Icon size="24" type="android-list" style="vertical-align: middle;"></Icon>
		    							备课内容
		    						</div>		
		    						<div class="homework-content" v-html="info.content"></div>
		    					</Card>
		    					<Card class="mt-3">
		    						<div slot="title" class="clearfloat">
		    							<Icon size="24" type="images" style="vertical-align: middle;"></Icon>
		    							备课附件
		    						</div>		
		    						<file-item :list="info.course_prepare_attachment"></file-item>							
		    					</Card>
		    				</Col>
		    			</Row>
		    		</Card>
		    	</data-ready>	
		    </div>		
	    </div>
        <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>

<script>
    import util from '@/libs/util'
    import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dataReady from 'c%/DataReady.vue'
	import playVoice from 'c%/playVoice.vue'
    import FileItem from 'c%/FileItem.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{	
		mixins: [ modal,common,globals ],
		components: {
			FileItem,
			dataReady,
			playVoice
        },
        props: {
			caId: {
				type: String,
				default: ''
			},
			class_name:{
				type:String,
				default:''
			}
		},
		data () {
			return {
                info: [],
                int_day: '',
                loading:false
			}
        },
        watch: {
			'int_day': function (val) {
				this.init()	
			}
		},
		methods: {
			getInnerHTML (html) {
        		html = typeof html=='string'?html:''		
        		
				return html.replace(/<[^>]+>/g,"")
			},
			dataReady (rs) {
                this.loading = false
                if(rs[0].list.length == 0){
                    if(this.format_int_day != ''){
                        this.$Message.error('【'+ this.format_int_day + '】没有备课内容')
                    }else{
						this.$Message.error('【'+ this.class_name + '】没有备课内容')
                    }  
                    return
                }
                this.info = rs[0].list[0]
			},
			init () {
				this.$r('dr').refreshData(this.info_url[0])	
			}
		},
		computed: {
			info_url(){
                let url
				
				if(this.format_int_day == ''){
                    url = ['course_arranges/'+ this.caId +'/course_prepare?page=1&pagesize=1']
                }else{
                    url = ['course_arranges/'+ this.caId +'/course_prepare?page=1&pagesize=1&int_day=' + this.format_int_day]
                }

				return url
            },
            format_int_day(){
                this.loading = true
                let int_day
                if(this.int_day.length == 0){
                    int_day = ''
                }else{
                    int_day = new Date(this.int_day)
                    int_day = int_day.getFullYear() + '-' + (int_day.getMonth() + 1) + '-' + (int_day.getDate() > 9 ? int_day.getDate() : "0" + int_day.getDate())
                }
                return int_day
            }
		}
	}
</script>

<style>
</style>