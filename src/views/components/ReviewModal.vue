<style scoped>
.score-box {
	display: inline-block;
}

.week-box {
	display: inline-block;
	margin-left: 20px;
	vertical-align: top;
	position: relative;
	top: -14px;
}

.week-item {
	margin-bottom: 10px;
}

.textarea-view >>> .ivu-input {
	border: none;
}

.textarea-view >>> .ivu-input:focus {
	outline: none;
	box-shadow: none;
}
.read-status {
	margin-left: 15px;
	font-size: 12px;
}
</style>


<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<template v-if="modal$.show">
			
			<p>授课日期：{{reviewDate}} <Tag @click="makeQR('')" class="pull-right" v-if="scene=='view'"><Icon type="paper-airplane"></Icon> 微信分享</Tag></p>
			<p>点评对象：{{reviewObject}}</p>
			<p>授课{{'老师'|translate}}：{{post.eid|employee_name}}</p>
			
			<Tabs type="card" style="margin-top:10px;">
				<TabPane :label="item.label" v-for="(item,field) in content_fields" :key="field">
					<Card style="min-height:144px;">
						<Input type="textarea" v-model="post.content[field]" :autosize="{minRows:3,maxRows:4}" v-if="scene!=='view'"></Input>
						<Input class="textarea-view" v-else readonly type="textarea" v-model="post.content[field]" :autosize="{minRows:3}"></Input>
					</Card>
				</TabPane>
				<TabPane label="附件">
					<review-upload class="mt-3" ref="upload" v-model="post.review_file" :mode="modal$.action" style="margin:0px !important;min-height: 144px;"></review-upload>
				</TabPane>
			</Tabs>	
			
			<Card class="mt-3" dis-hover>
				<span slot="title">学员个人点评</span>
				<div class="x-container" style="overflow-x: auto;margin-top: 0px;border:none;">
					<div class="list" ref="stuList">
						<div class="x-list-btn" @click="prevPageStudent">
							<Icon type="chevron-left"></Icon>
						</div>
						<div class="x-list-container">
							<!--学员列表-->
							<div class="list" :style="{transform: 'translateX(-' + (page-1)*100 +'%) translateZ(0px)'}">
								<div 
									class="x-item" 
									:class="{
										['active']:currentStudent==item
									}" 
									:key="index"
									v-for="(item,index) in post.review_student" 
									@click="setCurrentStudent(item)" >
									<letter-avatar v-if="item.student.student_name" size="60" rounded :name="item.student.student_name" :src="item.student.photo_url"></letter-avatar>
									<span class="name" :title="item.student.student_name">{{item.student.student_name}}</span>
									<div class="name" v-if="item.student.nick_name != ''">{{item.student.nick_name}}</div>
								</div>
							</div>
						</div>
						<div class="x-list-btn" @click="nextPageStudent">
							<Icon type="chevron-right"></Icon>
						</div>
					</div>
				</div>
				<template v-if="currentStudent">
					<div class="review-student-item">
						<div class="row" style="padding: 15px;">
							<template  v-if="scene!=='view'">
								<letter-avatar v-if="currentStudent.student.student_name" size="80" class="col-md-2" rounded :name="currentStudent.student.student_name" :src="currentStudent.student.photo_url"></letter-avatar>
								<div class="col-md-10">
									<p>{{currentStudent.student.student_name}}</p>					
									<p v-for="(s,sfield) in scores">
										{{s.label}}: <Rate v-model="currentStudent[sfield]"></Rate>
									</p>
									<Input type="textarea" v-model="currentStudent.detail" :autosize="{minRows:2,maxRows:5}"></Input>							
								</div>
							</template>
							<template v-else>
								<div class="review-item col-md-12">
									<p class="font-2xl">
										{{currentStudent.student.student_name}}
										<span v-if="currentStudent.student.nick_name != ''">{{currentStudent.student.nick_name}}</span>
										<span 
											class="read-status" 
											:class="currentStudent.is_read?'text-gray':'text-danger'">
											{{currentStudent.is_read?'已读 '+currentStudent.read_time:'未读'}}
										</span>
										<Tag @click="makeQR(currentStudent)" class="pull-right"><Icon type="paper-airplane"></Icon> 微信分享</Tag>
									</p>
									<div class="score-box" v-if="showScoreNums">
										<template v-for="sf in current_tpl.setting.student_fields.score">
											<div v-if="sf.enable">
												{{sf.label}}:<span v-if="currentStudent[sf.field]>0">{{currentStudent[sf.field]}}</span><span v-else>0</span>
											</div>
										</template>
									</div>
									<div class="score-box" v-else>
										<div v-for="s in 10" v-if="post.review_style == 0&&currentStudent['score'+((s-1)>0?(s-1):'')]>0">
											{{scoreLabel(0,s-1)}}: <Rate v-model="currentStudent['score'+((s-1)>0?(s-1):'')]" disabled></Rate>
										</div>
										<div v-for="s in 5" v-if="post.review_style == 1&&currentStudent.detail['score'+(s-1)]>0">									
											{{scoreLabel(1,s-1)}}: <Rate v-model="currentStudent.detail['score'+(s-1)]" disabled></Rate>
										</div>
									</div>
									<dir class="week-box" v-if="post.review_style == 1">
										<div v-for="s in 5" v-if="currentStudent.detail['weak'+(s-1)]&&currentStudent.detail['weak'+(s-1)].value>0" class="week-item">								
											<Tag type="border" color="red">{{weakLabel(s-1)}}</Tag>
											{{currentStudent.detail['weak'+(s-1)].desc}}
										</div>
									</dir>
									<div class="review-item-content" style="margin-top: 5px" v-if="post.review_style == 0">{{currentStudent.detail}}</div>
									<div class="review-item-content" style="margin-top: 5px" v-if="post.review_style == 1">{{currentStudent.detail.detail}}</div>
								</div>
							</template>
						</div>
					</div>
				</template>
				<template v-else>
					<div class="review-student-item" v-for="(currentStudent,index) in post.review_student" >
						<div class="row" style="padding: 15px;">
								<div class="review-item col-md-12">
									<p class="font-2xl">
										{{currentStudent.student.student_name}}
										<span v-if="currentStudent.student.nick_name != ''">{{currentStudent.student.nick_name}}</span>
										<span 
											class="read-status" 
											:class="currentStudent.is_read?'text-gray':'text-danger'">
											{{currentStudent.is_read?'已读 '+currentStudent.read_time:'未读'}}
										</span>
										<Tag @click="makeQR(currentStudent)" class="pull-right"><Icon type="paper-airplane"></Icon> 微信分享</Tag>
									</p>
									<div class="score-box" v-if="showScoreNums">
										<template v-for="sf in current_tpl.setting.student_fields.score">
											<div v-if="sf.enable">
												{{sf.label}}:<span v-if="currentStudent[sf.field]>0">{{currentStudent[sf.field]}}</span><span v-else>0</span>
											</div>
										</template>
									</div>
									<div class="score-box" v-else>
										<div v-for="s in 10" v-if="post.review_style == 0&&currentStudent['score'+((s-1)>0?(s-1):'')]>0">
											{{scoreLabel(0,s-1)}}: <Rate v-model="currentStudent['score'+((s-1)>0?(s-1):'')]" disabled></Rate>
										</div>
										<div v-for="s in 5" v-if="post.review_style == 1&&currentStudent.detail['score'+(s-1)]>0">									
											{{scoreLabel(1,s-1)}}: <Rate v-model="currentStudent.detail['score'+(s-1)]" disabled></Rate>
										</div>
									</div>
									<dir class="week-box" v-if="post.review_style == 1">
										<div v-for="s in 5" v-if="currentStudent.detail['weak'+(s-1)]&&currentStudent.detail['weak'+(s-1)].value>0" class="week-item">								
											<Tag type="border" color="red">{{weakLabel(s-1)}}</Tag>
											{{currentStudent.detail['weak'+(s-1)].desc}}
										</div>
									</dir>
									<div class="review-item-content" style="margin-top: 5px" v-if="post.review_style == 0">{{currentStudent.detail}}</div>
									<div class="review-item-content" style="margin-top: 5px" v-if="post.review_style == 1">{{currentStudent.detail.detail}}</div>
								</div>
						</div>
					</div>
				</template>
			</Card>
		</template>
		
		<div slot="footer">
			<Button type="ghost" @click="close" v-if="scene=='view'">关闭</Button>
			<div v-else>
				<div class="pull-left text-info" v-per="'comments.send'">
					<Checkbox v-model="post.is_push_wechat" :true-value="1" :false-value="0"></Checkbox>
					以微信形式给家长发送课评信息(家长需关注公众号)
				</div>
				<Button type="ghost" @click="close">取消</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
		</div>
		
		<Modal v-drag-modal v-model="modal_qr.show" width="360" :title="modal_qr.title">
			<div class="text-center">
				<qrcode :value="modal_qr.value" type="img" :size="320"></qrcode><br>
				<span class="mt-3">请使用微信扫描二维码后再分享</span>
			</div>
			<div slot="footer">
				<Button type="ghost" @click="modal_qr.show=false">关闭</Button>
			</div>
		</Modal>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import review from './review/review.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import reviewUpload from 'c%/reviewUpload.vue'
	import Qrcode from 'c%/qrcode/index.vue'
	
	export default{
		mixins: [modal,common,globals,review],
		components: {
			Qrcode,
			reviewUpload,
			letterAvatar
		},
		props: {
			scene: {
				type: String,
				default: ()=>{
					return 'review'		//review: 课评服务，attendance: 考勤列表，view:详情
				}
			},
			currentTplProp: {
				type: Object,
				default: () => {
					return null
				}
			}
		},
		data () {
			return {				
				lesson_type: 0,
				modal_qr: {
					show: false,
					title: '微信分享',
					value: ''
				},
				post: {},
				page: 1,
				currentStudent:null
			}
		},
		created() {
			this.current_tpl = this.currentTplProp
		},
		watch: {
			'modal$.show': function (val) {
				if(val&&this.scene==='attendance') {
					this.setPost()
				}
			}
		},
		computed:{
			showScoreNums(){
				if(this.current_tpl.setting.advance && this.current_tpl.setting.advance.score_show_num){
					return true
				}
				return false
			}
		},
		methods: {
			setCurrentStudent (item) {
				if(!this.currentStudent){
					this.currentStudent = item
				}else{
					if(this.currentStudent.student.sid == item.student.sid){
						this.currentStudent = null
					}else{
						this.currentStudent = item
					}
				}
			},
			prevPageStudent () {
				if(this.page > 1){
					this.page --
				}
			},
			nextPageStudent () {
				let hasNextPage = false
				
				if(this.page*8 < this.post.review_student.length){
					this.page ++
				}				
			},
			makeQR (row) {
				let qrUrl = ''				
				
				if(!_.isEmpty(row)){
					qrUrl = this.$store.state.user.info.base_url+'/student/#/reviews/'+row.rs_id
					this.modal_qr.title = row.student.student_name+'的点评分享'					
				}else{
					qrUrl = this.$store.state.user.info.base_url+'/m/#/reviews/'+this.post.rvw_id
					this.modal_qr.title = util.sprintf('%s对【%s】的点评',this.$filter('employee_name')(this.post.eid),this.reviewObject) 
				}
				
				this.modal_qr.value = qrUrl
				this.modal_qr.show = true
//				this.$Message.success(qrUrl)
			},
			setPost () {
				if(!_.isEmpty(this.info)){
					//按考勤记录点评
					this.post.catt_id 			= this.info.catt_id
					this.post.bid 				= this.bid$
					this.post.cid 				= this.info.cid
					this.post.lid 				= this.info.lid
					this.post.eid 				= this.info.eid
					this.post.sj_id 			= this.info.sj_id
					this.post.ca_id				= this.info.ca_id
					this.post.int_day 			= this.info.int_day
					this.post.lesson_type 		= this.info.lesson_type
					this.post.int_end_hour 		= this.info.int_end_hour
					this.post.int_start_hour 	= this.info.int_start_hour
					this.post.rts_id 			= this.getTplId(this.info)
					
					this.setContent()
					this.get_students()
				}
			},			
			ok () {
				
				if(this.post.review_student.length==0){
					this.$Message.error('无可点评学员')
					return
				}
				this.post.review_style = this.current_tpl.review_style;
				this.$rest('reviews')
				.post(this.post)
				.success(data=>{
					this.$Message.success('点评成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'点评失败'
					})
				})
				
			},
			get_students () {
				this.dr().getData('student_attendances?catt_id='+this.post.catt_id)
				.then(data=>{
					this.deal_students(data.list)
				})
			},
			get_review(rvw_id) {
				this.$rest('reviews')
				.get({
					rvw_id: rvw_id,
					with: 'review_tpl_setting'
				})
				.success(res => {
					if(res.list.length > 0) {
						this.post = res.list[0]
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>

<style lang="less" scoped>
@border-color: #dddee1;
.x-container{
	width: 100%;
	overflow-x: auto;
	box-sizing: border-box;
	margin-top: 1.5em;
	border-radius: 4px;
	border: 1px solid @border-color;
 
    .list{
		display: flex;
		flex-direction: row;
		border-bottom: 1px solid @border-color;
		height: 100px;
		.x-list-container{			
			box-sizing: border-box;
		    position: relative;
		    overflow: hidden;
		    zoom: 1;
		    flex: 1;
		    .list{
		    	display: flex;
		    	flex-direction: row;
				will-change: transform;
				transition: transform .3s ease-in-out,-webkit-transform .3s ease-in-out;
				.x-item{
					width: 12.5%;
					display: inline-block;
					text-align: center;
				    padding: 10px 0 8px 0;
					position: relative;
				    flex-shrink: 0;
				    cursor: pointer;
				    &.leave-student:before{
			    	    content: '已请假';
					    display: block;
					    position: absolute;
					    background: #39e;
					    color: #fff;
					    font-size: 10px;
					    padding: 2px;
					    border-radius: 3px;
					    left: 0;
					    top: 0;
				    }
				    
					.name{
					    font-size: 12px;
					    display: block;
					    width: 100%;
					    overflow: hidden;
					    white-space: nowrap;
					    text-overflow: ellipsis;
					}
					.close{
					    position: absolute;
					    right: 10px;
					    top: 10px;
					    font-size: 18px;
					    color: #ed3f14;
					    opacity: 1;
					    cursor: pointer;
					}
					&.active{
						background: #f8f8f9;    
	    				border-bottom: 3px solid @border-color;
					}
				}
			}
		}
		
		.x-list-btn{
			width: 30px;
			text-align: center;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
		}
		
	}
	
	
	.title,.content{
		display: flex;
		border-bottom: 1px solid @border-color;
	    
		&>div{
			flex: 0 40%;
			display: flex;
			align-items: center;
			justify-content: center;
		    flex-direction: column;
		    border-right: 1px solid @border-color;
		}
		&>div:nth-child(1){
	    	flex: 0 20%
	    }
	    &>div:nth-last-child(1){
	    	border-right: none;
	    }
	}
	.title{
		&>div{
			padding: 10px 0;
			
		}
	}
	.content{
		border-bottom: none;
		&>div{
			padding: 15px;
		}
	}
}
</style>