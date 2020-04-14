<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false" @on-cancel="cancel">
		<template v-if="modal$.show">
			
			<p>授课日期：{{reviewDate}} <Tag @click="makeQR('')" class="pull-right" v-if="scene=='view'"><Icon type="paper-airplane"></Icon> 微信分享</Tag></p>
			<p>点评对象：{{reviewObject}}</p>
			<p>授课{{'老师'|translate}}：{{post.eid|employee_name}}</p>
			
			<Card class="mt-3" dis-hover v-for="(item,field) in content_fields">
				<span slot="title">{{item.label}}</span>
				<Input type="textarea" v-model="post.content[field]" :autosize="{minRows:3,maxRows:4}" v-if="scene!=='view'"></Input>
				<p v-else>{{post.content[field]}}</p>
			</Card>		
			
			<review-upload class="mt-3" ref="upload" v-model="post.review_student" :mode="modal$.action"></review-upload>
			
			<Card class="mt-3" dis-hover>
				<span slot="title">学员个人点评</span>
				<div class="review-student-item" v-for="(item,index) in post.review_student">
					<div class="row b-b-1" style="padding: 15px 0">
						<template  v-if="scene!=='view'">
							<letter-avatar v-if="item._student_name" size="80" class="col-md-2" rounded :name="item._student_name" :src="item._photo_url"></letter-avatar>
							<div class="col-md-10">
								<p>{{item._student_name}}</p>					
								<p v-for="(s,sfield) in scores">
									{{s.label}}: <Rate v-model="item[sfield]"></Rate>
								</p>
								<Input type="textarea" v-model="item.detail" :autosize="{minRows:2,maxRows:5}"></Input>							
							</div>
						</template>
						<template v-else>
							<div class="review-item col-md-12">
								<p class="font-2xl">
									{{item.student.student_name}}
									<Tag @click="makeQR(item)" class="pull-right"><Icon type="paper-airplane"></Icon> 微信分享</Tag>
								</p>
								<div v-for="s in 10" v-if="item['score'+((s-1)>0?(s-1):'')]>0">									
									{{scoreLabel(s-1)}}: <Rate v-model="item['score'+((s-1)>0?(s-1):'')]" disabled></Rate>
								</div>
								<div class="review-item-content">{{item.detail}}</div>
							</div>
						</template>
					</div>
				</div>
			</Card>
		</template>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel" v-if="scene=='view'">关闭</Button>
			<div v-else>
				<div class="pull-left text-info" v-per="'comments.send'">
					<Checkbox v-model="post.is_push_wechat" :true-value="1" :false-value="0"></Checkbox>
					以微信形式给家长发送课评信息(家长需关注公众号)
				</div>
				<Button type="ghost" @click="cancel">取消</Button>
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
	import review from 'c%/review/review.mixin'
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
			}
		},
		data () {
			return {				
				info: {},
				lesson_type: 0,
				modal_qr: {
					show: false,
					title: '微信分享',
					value: ''
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val&&this.scene==='attendance') {
					this.setPost()
				}
			}
		},
		methods: {
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
				if(this.post.ft_review_student.length==0){
					this.$Message.error('无可点评学员')
					return
				}
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
					rvw_id: rvw_id
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

<style>
</style>