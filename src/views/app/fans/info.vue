<template>
	<div class="c-grid">
		<div class="padder-sm row">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>								
			</div>
			<div class="col-sm-12 mt-3">
				<Card dis-hover>
					<div slot="title">
						<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
						粉丝信息
					</div>
					<div class="row" style="align-items:center;justify-content:center;">
						<div class="col-sm-4">
							<div style="align-items:center;justify-content:center;">
								<div class="avatar-wrap" v-if="data.headimgurl">						
							        <letterAvatar 
										@click.native="picturePreview(data.headimgurl)" 
										:name='data.nickname' 
										:src="data.headimgurl" 
										size='120' 
										:rounded="true">
									</letterAvatar>
								</div>
								<div class="profile-wrap">
									<h3 class="text-center">
										{{data.nickname}}
									</h3>
									<Form :label-width="110">
										<Form-item label="粉丝编号" class="mb-0">
											{{data.openid||'-'}}
										</Form-item>
										<Form-item label="状态" class="mb-0">
											<Tag :color="data.subscribe?'green':'default'">{{data.subscribe?'已关注':'未关注'}}</Tag>										
										</Form-item>
										<Form-item label="关注时间" class="mb-0">
											{{format_date(data.subscribe_time)}}
										</Form-item>
										<Form-item label="最后联系时间" class="mb-0">
											{{format_date(data.last_connect_time)}}
										</Form-item>	
										<Form-item label="关联身份" class="mb-0">
											<Tag type="border" color="green" v-if="data.uid>0">家长</Tag>
											<Tag type="border" color="green" v-if="data.employee_uid>0">员工</Tag>
											<span v-if="data.uid==0&&data.employee_uid==0">-</span>
										</Form-item>
									</Form>				
								</div>
							</div>
						</div>
						<div class="col-sm-8">							
							<div class="card-tab-nav-container">
								<ul class="tab-navs">
									<li class="tab-nav-item tab-appimg" 
										@click="choose_file(type)"
										v-for="(type,typeIndex) in type_list" :key="typeIndex">
										<a>
											<Icon :type="type.icon"></Icon>
											<span class="msg-tab-item-title">{{type.text}}</span>
										</a>
									</li>											
								</ul>
							</div>				
						</div>
					</div>					
				</Card>
				
				<Card class="mt-3" dis-hover v-if="data.user">
					<div slot="title">
						学员列表
					</div>
					<table class="modal-table">
						<thead>
							<th>
								<div class="ivu-table-cell">姓名</div>								
							</th>
							<th>
								<div class="ivu-table-cell">手机号</div>								
							</th>
							<th>
								<div class="ivu-table-cell">状态</div>								
							</th>
						</thead>
						<tr v-for="(item,index) in data.user.students" :key="index">
							<td>
								<div class="ivu-table-cell">
									<avatar-and-name :src="item.photo_url" :name="item.student_name" :sex="item.sex"></avatar-and-name>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">{{item.first_tel}}</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Tag type="border" :color="ss_map[item.status].color">{{ss_map[item.status].text}}</Tag>
								</div>
							</td>
						</tr>
					</table>
				</Card>
			</div>			
		</div>
		<!--选择回复内容-->
		<Modal :mask-closable="false" v-model="modal.show" :title="modal.title" width="900">
			<chooseFile ref="cf" v-if="modal.show" :type="file_type" @getFile="getFile"></chooseFile>
			<div slot="footer">
				<span class="pull-left"></span>
				<Button type="ghost" @click="modal.show=false">取消</Button>
				<Button type="primary" @click="confirm_file">发送</Button>
			</div>
		</Modal>
		<message-text :expired="expired" ref="messageText"></message-text>
	</div>
</template>

<script>
	import moment from 'moment'
	import {_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import chooseFile from '@/views/system/configs/wxmp/choose-file.vue'
	import MessageText from './info/message-text.vue'
	
	export default{
		mixins: [ common ],
		components: {
			chooseFile,
			MessageText,
			LetterAvatar
		},
		data () {
			return {
				modal: {
					show: false,
					title: ''
				},
				id: this.$route.params.id,
				file_type: '',			
				data: {},
				type_list: [
					{type:'news',icon:'images',text:'图文'},
					{type:'text',icon:'ios-folder',text:'文字'},
					{type:'image',icon:'image',text:'图片'},
					{type:'voice',icon:'mic-a',text:'语音'},
					{type:'video',icon:'ios-videocam',text:'视频'},
					{type:'template',icon:'document-text',text:'模板消息'}
				]
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			format_date (time) {
				if(time){
					return moment((time*1000)).format('YYYY-MM-DD hh:mm:ss')
				}
				return '-'
			},
			init_data() {
				this.$rest(this.data_uri).get()
				.success(data=>{
					this.data = data
				})
			},
			back() {
				this.$router.go(-1)
			},
			choose_file (item) {
				let map_title = {'news':'选择图文','image':'选择图片','voice':'选择语音','video':'选择视频','text':'输入文字','template':'发送模板消息'}
				this.file_type = item.type
				this.modal.title = map_title[item.type]
				if(item.type!=='template'&&this.expired){
					this.$Message.error('粉丝48小时内未跟您互动，您只能发送模板消息')
					return false
				}
				if(item.type=='text'||item.type=='template'){
					this.$r('messageText')
					.set('type',item.type)
					.show(map_title[item.type])
				}else{
					this.modal.show = true
				}
			},
			getFile (item) {
				if(!_.isEmpty(item)){
					this.postMessage(item.media_id)	
				}else{
					this.$Message.error('请'+this.modal.title)
				}				
			},		
			postMessage(media_id) {
				let params = {
					type: this.file_type,
					content: {
						media_id: media_id
					}
				}				
				
				this.$rest('wxmp_fans/'+this.id+'/messages').post(params)
				.success(data=>{
					this.$Message.success('发送成功')
					this.modal.show = false
				}).error(response=>{
					this.error(response.body.message||'发送失败')
					this.modal.show = false
				})
			},
			confirm_file () {
				this.$refs['cf'].getFile()				
			},
		},
		computed: {
			data_uri () {				
				return 'wxmp_fans/'+this.id
			},
			expired () {
				let now_time = (new Date().getTime())/1000
				let last_connect_time = this.data.last_connect_time
				let diff = (now_time - last_connect_time)/3600
				console.log('DIFF')
				console.log(diff)
				return diff > 48
			}
		}
	}
	
</script>

<style>
</style>