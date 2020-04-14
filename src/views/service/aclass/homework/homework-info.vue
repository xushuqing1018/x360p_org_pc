<template>
	<div class="c-grid">
		<div class="row">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>
			</div>
			
			<data-ready ref="dr" :cache="false" :data="info_url" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-3">
				<Row>
					<Col span="6">
						<Card>
							<div slot="title" class="clearfloat">
								<Icon size="24" type="document-text" style="vertical-align: middle;"></Icon>
								作业信息
							</div>						
							<Form :label-width="80">								
								<Form-item label="课程：" class="mb-0">
									{{info.lid|lesson_name}}
								</Form-item>
								<Form-item label="作业类型：" class="mb-0">
									{{info.is_regular|homework_type}}
								</Form-item>
								<Form-item label="布置时间：" class="mb-0">
									{{info.create_time}}
								</Form-item>
								<Form-item label="截止时间：" class="mb-0" v-if="info.is_regular==0">
									{{info.deadline}}
								</Form-item>
								<Form-item label="完成周期：" class="mb-0" v-if="info.is_regular==1">
									{{result}}
								</Form-item>
								<Form-item label="开始日期：" class="mb-0" v-if="info.is_regular==1">
									{{info.int_start_day}}
								</Form-item>
								<Form-item label="结束日期：" class="mb-0" v-if="info.is_regular==1">
									{{info.int_end_day}}
								</Form-item>
							</Form>
						</Card>
						<Card class="mt-3">
							<div slot="title" class="clearfloat">
								<Icon size="24" type="android-list" style="vertical-align: middle;"></Icon>
								作业内容
							</div>		
							<div class="homework-content" v-html="info.content"></div>
						</Card>
						<Card class="mt-3">
							<div slot="title" class="clearfloat">
								<Icon size="24" type="images" style="vertical-align: middle;"></Icon>
								作业附件
							</div>		
							<file-item :list="info.homework_attachment"></file-item>							
						</Card>
					</Col>
					<Col span="18" class="pl-3">
						<Card>
							<div slot="title" class="clearfloat">
								<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
								作业对象
							</div>	
							<Tabs>
								<TabPane :label="'已完成（'+homework_complete.length+'人）'">
									<table class="modal-table" style="max-height: 760px; overflow: auto;">
										<thead>
											<th><div class="ivu-table-cell">学员</div></th>
											<th width="35%"><div class="ivu-table-cell">提交内容</div></th>
											<th width="35%"><div class="ivu-table-cell">回复内容</div></th>
											<th><div class="ivu-table-cell">操作</div></th>
										</thead>
										<tr v-for="item in homework_complete">
											<td>
												<div class="ivu-table-cell">
													<avatar-and-name 
														:src="item.student.photo_url" 
														:name="item.student.student_name" 
														:sex="item.student.sex">
													</avatar-and-name>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<p>
														{{getInnerHTML(item.content)}}
														<span class="complete-time">{{item.create_time}}</span>
													</p>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<p v-if="item.is_rejected==1" style="color: #FF4D5A">
														驳回：{{item.rejected_reason}}
														<span class="complete-time">{{item.rejected_time}}</span>
													</p>
													<template v-else>
														<p v-if="item.homework_reply">
															{{item.homework_reply.content}}
															<span class="complete-time">{{item.homework_reply.create_time}}</span>
														</p>
														<p v-else>-</p>
													</template>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<Button type="primary" size="small" @click="viewAndReply(item)">查看</Button>
												</div>
											</td>
										</tr>
										<tr v-if="homework_complete.length==0">
											<td colspan="4" class="text-center"><div class="ivu-table-cell">还没有学员完成</div></td>
										</tr>
									</table>
								</TabPane>
								<TabPane :label="'未完成（'+info.incomplete_students.length+'人）'">
									<table class="modal-table" style="max-height: 760px; overflow: auto;">
										<thead>
											<th><div class="ivu-table-cell">学员</div></th>
											<th><div class="ivu-table-cell">是否查阅</div></th>
											<th width="150px"><div class="ivu-table-cell">操作</div></th>
										</thead>
										<tr v-for="item in info.incomplete_students">
											<td>
												<div class="ivu-table-cell">
													<avatar-and-name :src="item.photo_url" :name="item.student_name" :sex="item.sex"></avatar-and-name>
												</div>
											</td>
											<td><div class="ivu-table-cell">{{item.homework_view?'已查阅':'未查阅'}}</div></td>
											<td>
												<div class="ivu-table-cell">
													<Button 
														type="primary" 
														size="small" 
														icon="alert" 
														v-if="!item.homework_view" 
														@click="remind(item)"
														>
														提醒
													</Button>
													<span v-else>-</span>
												</div>
											</td>
										</tr>
									</table>
								</TabPane>
							</Tabs>
						</Card>
					</Col>					
				</Row>
				
			</data-ready>	
			
		</div>
		<homework-reply ref="homeworkReply" @on-success="refreshData"></homework-reply>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dataReady from 'c%/DataReady.vue'
	import playVoice from 'c%/playVoice.vue'
	import FileItem from 'c%/FileItem.vue'
	import HomeworkReply from './homework-reply.vue'
	
	export default{	
		mixins: [ common,globals ],
		components: {
			FileItem,
			dataReady,
			playVoice,
			HomeworkReply
		},
		data () {
			return {
				info: {
					deadline: 0,
					incomplete_students: [],
					homework_complete: []
				},
				id: this.$route.params.id,
				homework_complete: [],
				result: ''
			}
		},
		methods: {
			
			remind (item) {
				let uri = util.sprintf('homework_tasks/wechat_notify?ht_id=%s&sid=%s',this.id,item.sid)
				this.$rest(uri)
				.get()
				.success(data=>{
					this.$Message.success('提醒成功！')
				}).error(response=>{
					this.error(response.body.message||'推送失败！')
				})	
			},
			viewAndReply (item) {
				let title = util.sprintf('【%s】的作业',item.student.student_name)
				
				this.$r('homeworkReply')
				.set('homework',item)
				.set('hc_id',item.hc_id)
				.show(title,'add')
			},
			getHCList () {
				this.$rest('homework_tasks/'+this.id+'/homework_completes')
				.get()
				.success(data=>{
					this.homework_complete = data.list
				}).error(response=>{
					this.$Message.error(response.body.error||'获取列表失败~')
				})
			},
			getInnerHTML (html) {
        		html = typeof html=='string'?html:''        		
        		
				return html.replace(/<[^>]+>/g,"")
			},
			dataReady (rs) {
				this.info = rs[0]
				this.getHCList()
				this.completionCycle(this.info.weekdays)
			},
			refresh (rs) {
				this.info = rs.response 
				this.completionCycle(this.info.weekdays)
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url[0])
				this.getHCList()
			},
			back () {
				this.$store.commit('setSearchDetail',true)
				this.$router.go(-1)
			},
			completionCycle (weekdays) {
					this.result = ''
				  let week_day_list = [
            	{label:'周一',value:'1'},
            	{label:'周二',value:'2'},
            	{label:'周三',value:'3'},
            	{label:'周四',value:'4'},
            	{label:'周五',value:'5'},
            	{label:'周六',value:'6'},
            	{label:'周日',value:'7'}
						]
						week_day_list.forEach(i => {
							weekdays.forEach(l => {
								if(i.value == l){
								this.result += i.label+' '
								}
							})
						})
			
			}
		},
		computed: {
			info_url(){
				return ['homework_tasks/'+this.id]
			},
		}
	}
</script>

<style lang="less" scoped>
	.complete-time {
		font-size:12px;
		color: #666666;
		margin-left: 6px;
	}
</style>