<template>
	<div class="c-grid">
		<div class="row">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>
			</div>
			
			<data-ready ref="dr" :cache="false" :data="info_url" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-3">
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
									<Tag v-for="item in tags">{{item.name}}</Tag>
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
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dataReady from 'c%/DataReady.vue'
	import playVoice from 'c%/playVoice.vue'
	import FileItem from 'c%/FileItem.vue'
	
	export default{	
		mixins: [ common,globals ],
		components: {
			FileItem,
			dataReady,
			playVoice
		},
		data () {
			return {
				info: {
					int_day: 0,
					int_start_hour: 0,
					int_end_hour: 0,
					content: '',
					course_prepare_attachment: []
				},
				id: this.$route.params.id,
				tags: []
			}
		},
		methods: {
			initTags () {
				let info = this.info,
					tags = []
				if(info.lesson_type==0){
					if(info.ca_id==0||info.cid>0){
						name = info.one_class.class_name
					}else{
						
					}
					
					
					tags = [{
						name: info.one_class.class_name
					}]
				}else{
					if(info.students.length){
						if(info.lesson_type==1){
							tags = [{
								name: info.students[0].student_name
							}]
						}else{
							info.students.forEach(s=>{
								tags.push({
									name: s.student_name
								})
							})
						}
					}
				}
				
				this.tags = tags
			},
			getInnerHTML (html) {
        		html = typeof html=='string'?html:''		
        		
				return html.replace(/<[^>]+>/g,"")
			},
			dataReady (rs) {
				this.info = rs[0]
				this.initTags()
			},
			refresh (rs) {
				this.info = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url[0])				
			},
			back () {
				this.$router.go(-1)
			}
		},
		computed: {
			info_url(){
				return ['course_prepares/'+this.id+'?with=course_arrange']
			},
		}
	}
</script>

<style>
</style>