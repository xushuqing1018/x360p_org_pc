<template>
	<div>
		<Tabs type="card">
			<TabPane v-for="(item,field) in content_fields" :label="item.label" :name="field">
				<div style="position:relative" v-if="mode=='add'">
					<Input type="textarea" v-model="post.content[field]" :autosize="{minRows:3,maxRows:4}"></Input>
					<Button type="ghost" size="small" icon="arrow-expand" @click="editView(field,item.label,post.content[field])" class="expand-btn"></Button>
				</div>
				<p v-else>{{post.content[field]}}</p>
			</TabPane>
			<div slot="extra">
				<span>当前模板：{{post.review_tpl_setting.name||'-'}}</span>
				<a class="text-primary" @click.prevent="toggleReviewTpl" v-if="tplNotEmpty&&showSwitchTpl">切换</a>
			</div>
		</Tabs>
		<review-upload class="mt-3" ref="upload" v-model="post.review_file" :mode="mode">
			课评附件
		</review-upload>
		
		<Alert class="mt-3" v-if="studentList('del').length > 0">
			已移除学员：
			<Tag 
				:color="item.is_leave?'blue':'default'" 
				title="点击即可重新加到点评列表" 
				v-for="item in studentList('del')" 
				@click="resume(item)">
				{{item._student_name}}
			</Tag>
		</Alert>
		
		<div class="x-container" style="overflow-x: auto;">
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
								['active']:currentStudent==item,
								['text-success']:item.detail,
								['leave-student']:item.is_leave
							}" 
							v-for="(item,index) in studentList('post')" 
							@click="setCurrentStudent(item)" >
							<letter-avatar v-if="item._student_name" size="60" rounded :name="item._student_name" :src="item._photo_url"></letter-avatar>
							<span class="name" :title="item._student_name">{{item._student_name}}</span>
							<div class="name" v-if="item._nick_name != ''">{{item._nick_name}}</div>
							<Icon type="close-circled" class="close" title="将此学员从本次点评中移除" @click.native.stop="delStudent(item)"></Icon>
						</div>
					</div>
				</div>
				<div class="x-list-btn" @click="nextPageStudent">
					<Icon type="chevron-right"></Icon>
				</div>
			</div>
			<template v-if="!isProReview">
				<div class="title">
					<div>学员</div>
					<div>打分</div>
					<div style="position:relative">
						评语
						<a class="batch-add-btn" @click="batchAddDetail">整体点评</a>
					</div>
				</div>
				<div class="content">
					<div>
						<letter-avatar v-if="currentStudent._student_name" size="60" rounded :name="currentStudent._student_name" :src="currentStudent._photo_url"></letter-avatar>
						<span class="name" :title="currentStudent._student_name">{{currentStudent._student_name}}</span>
						<div class="name" v-if="currentStudent._nick_name != ''">{{currentStudent._nick_name}}</div>
					</div>
					<div>
						<p v-for="(s,sfield) in scores">
							{{s.label}}: <Rate v-model="currentStudent[sfield]" clearable></Rate>
						</p>
					</div>
					<div style="position:relative;padding:0;overflow: hidden">
						<Button type="ghost" size="small" icon="arrow-expand" @click="editDetailView()" class="expand-btn"></Button>
						<textarea class="x-textarea" placeholder="请输入评语..." v-model="currentStudent.detail"></textarea> 
					</div>
				</div>
			</template>
			<template v-else>
				<div class="title">
					<div>学员</div>
					<div style="flex:0 80%">称号</div>
				</div>
				<div class="content">
					<div>
						<div class="styleTplAvatar">
							<letter-avatar v-if="currentStudent._student_name" size="60" rounded :name="currentStudent._student_name" :src="currentStudent._photo_url"></letter-avatar>
							<span class="name" :title="currentStudent._student_name">{{currentStudent._student_name}}</span>
						</div>
					</div>
					<div style="border-bottom: 1px solid #dddee1;flex:0 80%">
						<div>
							<img 
							:src="honors[currentStudent.honor.index].image" 
							style="width: 70px;height: 70px;vertical-align: top"
							v-if="currentStudent.honor.index > -1"
							/>
							<div style="display:inline-block; margin-left:10px; width:330px; line-height:1.4">
								<Select v-model="currentStudent.honor.index" style="width:150px;padding-bottom:5px" @on-change="onHonorChange">
									<Option :value="-1" v-if="allow_empty_honor">无称号</Option>
									<Option v-for="(item,index) in honors" :value="index" :key="index">{{ item.label }}</Option>
								</Select><br>
								<Input v-model="currentStudent.honor.content" type="textarea" :rows="4" style="width:300px" placeholder="请输入简单分享语" />
								<Icon type="edit" style="cursor: pointer;margin-left: 5px" size="16" @click="selectTpl(honors[currentStudent.honor.index].desc, 'desc')"></Icon>
							</div>
						</div>
					</div>
				</div>
				<div class="title" style="border-bottom: none">
					<div></div>
					<div style="border-bottom: 1px solid #dddee1;flex:0 80%">专业表现</div>
				</div>
				<div class="content">
					<div></div>
					<div style="justify-content: flex-start;flex:0 80%;border-bottom: 1px solid #dddee1;" v-if="showSelectScoreStep">
						<p style="width:100%;" v-for="(s,sfield,index) in styleScores">
							
							<label>{{s.label}}: {{currentStudent[sfield]}}</label>

							<Slider 
							v-model="currentStudent[sfield]" 
							:min="0" :max="s.max" 
							:step="s.step" 
							show-stops>
								
							</Slider>
						</p>
					</div>
					<div style="justify-content: flex-start;flex:0 80%;border-bottom: 1px solid #dddee1;" v-else>
						<p v-for="(s,sfield,index) in styleScores">
							<Icon type="android-remove-circle" @click="minusScores(sfield,index)"></Icon>
							{{s.label}}: <Rate show-text v-model="currentStudent[sfield]">
								<div style="width: 38px"><span style="color: #f5a623">{{ s.alias[currentStudent[sfield]] }}</span></div>
							</Rate>
						</p>
					</div>
				</div>
				<div class="title" style="border-bottom: none">
					<div></div>
					<div style="border-bottom: 1px solid #dddee1;flex:0 80%">专业问题</div>
				</div>
				<div class="content">
					<div></div>
					<div style="justify-content: flex-start;flex:0 80%;border-bottom: 1px solid #dddee1;">
						<p v-for="(s,sfield,index) in weeks" style="line-height: 3;border-bottom: 1px dashed #ccc;padding: 10px 70px">
							<Icon type="android-remove-circle" @click="minusWeeks(sfield,index)"></Icon>
							{{s.label}} × <InputNumber :min="0" v-model="currentStudent[sfield].value" style="width: 60px"></InputNumber>：
							<Input type="textarea" :rows="2" v-model="currentStudent[sfield].desc" style="width: 260px;vertical-align: top" placeholder="请输入问题描述"></Input>
						</p>
					</div>
				</div>
				<div class="title" style="border-bottom: none">
					<div></div>
					<div style="border-bottom: 1px solid #dddee1;flex:0 80%;position: relative;">老师说
						<Icon type="edit" style="cursor: pointer;margin-left: 5px;position: absolute;right: 10px" size="14" @click="selectTpl(honors[currentStudent.honor.index].teacher_say_tpl, 'say')"></Icon>
					</div>
				</div>
				<div class="content">
					<div></div>
					<div style="justify-content: flex-start; flex:0 80%;height: 150px;position:relative;padding:0;overflow: hidden">
						<textarea class="x-textarea" placeholder="请输入评语..." v-model="currentStudent.detail"></textarea>
					</div>
				</div>
			</template>
		</div>
		<div class="mt-3">
			<Progress :percent="getReviewPercent()" style="width: 340px;display: inline-block;">
				<span>{{total('reviewed')}}/{{total('all')}} （已点评/所有）</span>
			</Progress>
			<Button class="pull-right" type="primary" icon="ios-fastforward" @click="nextStudent" :disabled="disabledNextStudent()">下一个</Button>
		</div>
		
	</div>
</template>

<script>
	import Vue from 'vue'
	import review from './review.mixin'
	import util,{_} from '@/libs/util'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import reviewUpload from 'c%/reviewUpload.vue'
	import Qrcode from 'c%/qrcode/index.vue'
	
	export default{
		mixins: [review],
		components: {
			Qrcode,
			reviewUpload,
			letterAvatar
		},
		props: {
			post: {
				type: Object,
				default(){
					return {}
				}
			},
			scene: {
				type: String,
				default: ()=>{
					return 'review'		//review: 课评服务，attendance: 考勤列表，view:详情
				} 
			},
			mode: {
				type: String,
				default: 'add'
			},
			tab: {
				type: Number,
				default: 1
			},
		},
		data () {
			return {
				page: 1,
				selectHonorIndex: 0,
				currentStudent: {
					honor: {
						index: 0,
						content: ''
					},
					weak0: {},
					weak1: {},
					weak2: {},
					weak3: {},
					weak4: {}
				}
			}
		},
		computed:{
			allow_empty_honor(){
				if(this.currentTpl && this.currentTpl.setting.advance && this.currentTpl.setting.advance.allow_empty_honor){
					return true
				}
				return false
			}
		},
		methods: {
			toggleReviewTpl() {
				this.$Modal.open('system/configs/reviews-tpl/tpl-cate.vue@modal',{
	                on: {
	                    'on-click':(row) => {
	                        this.$emit('on-change-review',row)
	                    }
	                }
	            })
	            .then(modal => {
	                modal.show('课评模板分类')
	            })
			},
			showContentFromLocal() {
				var saveAddReviewData = Vue.localStorage.get('saveAddReviewData-'+this.post.catt_id);
				if(saveAddReviewData) {
					this.post = JSON.parse(saveAddReviewData);
					this.setFirstStudent()
				}
			},
			minusScores(sfield,index) {
				this.currentTpl.setting.student_fields.score.splice(index,1)
				delete this.currentStudent[sfield];
			},
			minusWeeks(sfield,index) {
				this.currentTpl.setting.student_fields.weak.splice(index,1)
				delete this.currentStudent[sfield];
			},
			changeTplContent(content, type) {
				if(type == 'desc') {
					this.currentStudent.honor.content = content;
				}
				else {
					this.currentStudent.detail = content;
				}
			},
			selectTpl(data, type) {
				this.$Modal.open('components/review/select-tpl-modal.vue',{
					props: {
						type: type,
						data: data
					},
					on: {
						'change-content': this.changeTplContent
					}
				})
				.then(modal => {
					modal
					.show('选择套话模板')
				})
			},
			onHonorChange(val) {
				if(val == -1){
					return
				}
				this.currentStudent.honor.content = this.honors[val].desc[0].content;
				this.currentStudent.detail = this.honors[val].teacher_say_tpl[0].content;

				//根据称号计算分值
			},
			editView(field,label,value) {
				var vm = this;
				this.$Modal.open('components/review/edit-modal.vue',{
					on: {
						'on-ok': function(value) {
							vm.post.content[field] = value
						}
					}
				})
				.then(modal => {
					modal
					.set('value',value)
					.show('编辑【'+label+'】')
				})
			},
			editDetailView() {
				var vm = this;
				this.$Modal.open('components/review/edit-modal.vue',{
					on: {
						'on-ok': function(value) {
							vm.currentStudent.detail = value
						}
					}
				})
				.then(modal => {
					modal
					.set('value',this.currentStudent.detail)
					.show('编辑【'+this.currentStudent._student_name+'】的评语')
				})
			},
			batchAddDetail() {
				var vm = this;
				this.$Modal.open('components/review/edit-modal.vue',{
					on: {
						'on-ok': function(value) {
							vm.post.review_student.forEach(item => {
								item.detail = value
							})
						}
					}
				})
				.then(modal => {
					modal
					.set('value',this.currentStudent.detail)
					.show('整体编辑评语')
				})
			},
			resume (item) {
				this.$set(item,'$delete',false)
				this.currentStudent = item
			},
			total (type) {
				let length = 0,
					filter = (item) => {
						return true
					}
				if(type=='reviewed'){
					filter = (item) => {
						return item.detail.length > 0
					}
				}
				
				length = this.studentList('post').filter(filter).length
				
				return length
			},
			getReviewPercent () {
				let all = this.total('all'),
					reviewed = this.total('reviewed')
					
				return (reviewed/all)*100
			},
			prevPageStudent () {
				if(this.page > 1){
					this.page --
				}
			},
			nextPageStudent () {
				let hasNextPage = false
				
				if(this.page*8 < this.studentList('post').length){
					this.page ++
				}				
			},
			nextStudent () {
				let index = this.studentList('post').indexOf(this.currentStudent)
				
				if(index < this.studentList('post').length-1){
					index ++
				}
				
				this.currentStudent = this.studentList('post')[index]
			},
			disabledNextStudent () {
				let index = this.studentList('post').indexOf(this.currentStudent)
				if(index == this.studentList('post').length-1 || this.studentList('post').length==0){
					return true
				}
				return false
			},
			setLocalPost(post) {
				this.post = post
				this.currentStudent = {}
				if(this.post.review_student.length > 0){
					this.setCurrentStudent(this.post.review_student[0])
				}
			},
			
			getPost () {
				let data = util.copy(this.post)
				data.review_student = data.review_student.filter(s=>!s.$delete)
				this.$emit('on-submit',data)
			},
			
			setCurrentStudent (item) {
				this.currentStudent = item
			},
			delStudent (item) {				
				let tip = util.sprintf('确定将学员【%s】从本次点评中移除吗？',item._student_name)				
								
				this.confirm(tip).then(()=>{
					if(this.currentStudent==item){
						this.delCurrentStudent(item)
					}else{
						this.$set(item,'$delete',true)						
					}
				})
			},
			delCurrentStudent (item) {
				let list = this.studentList('post'),
					index = list.indexOf(item),
					next_index = 0
								
				if(list.length > 1) {
					if(index > 0) {
						next_index = index - 1
					}
					else if(index == 0){
						next_index = index + 1
					}
					this.currentStudent = list[next_index]
				}
				else if(list.length == 1){
					this.currentStudent = {}
				}
				
				this.$set(item,'$delete',true)
			}
		}
		
	}
</script>

<style lang="less" scoped>
@border-color: #dddee1;

.x-textarea{
	width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 15px 15px;
    position: absolute;
    left: 0;
    top: 0;
    outline: none;
    font-size: 12px;
    color: #657180;
}
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
		height: 120px;
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

.expand-btn {
	position: absolute;
	top: 0px;
	right: 0px;
	z-index: 1200;
}
.styleTplAvatar {
	position: relative;
	top: 80px;
	text-align: center;
}

.batch-add-btn {
	position: absolute;
	right: 10px;
	color: #39e !important;
}
</style>