<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :maks-closable="false" width="600">
		<div class="push-study-box" v-if="not_empty">
			<div class="student-info">
				<Card dis-hover>
					<div slot="title">
						<Icon type="android-person"></Icon>
						<span>学生信息</span>
					</div>
					<template v-if="data.student">
						<Row type="flex" align="middle" justify="center">
							<Col span="12">
								<letter-avatar 
									v-if="data.student"
									size="90"
									:name="data.student.student_name"
									:url="data.student.photo_url"
									:rounded="true"
									style="margin:0 120px;">
								</letter-avatar>
							</Col>
							<Col span="12">
								<span>姓名：</span>
								<span>{{data.student.student_name}}&nbsp;</span>
								<Tag color="green" type="border">学员</Tag>
								<br/>
								<label class="sex">性别：</label>
								<span>{{data.student.sex|sex}}</span>
								<br/>
								<span>电话：</span>
								<span>{{data.student.first_tel}}</span>
							</Col>
						</Row>
					</template>
					<template v-if="data.customer">
						<Row type="flex" align="middle" justify="center">
							<Col span="12">
								<letter-avatar 
									v-if="data.customer"
									size="90"
									:name="data.customer.name"
									:url="''"
									:rounded="true"
									style="margin:0 120px;">
								</letter-avatar>
							</Col>
							<Col span="12">
								<span>姓名：</span>
								<span>{{data.customer.name}}&nbsp;</span>
								<Tag color="blue" type="border">客户</Tag>
								<br/>
								<label class="sex">性别：</label>
								<span>{{data.customer.sex|sex}}</span>
								<br/>
								<span>电话：</span>
								<span>{{data.customer.first_tel}}</span>
							</Col>
						</Row>
					</template>
				</Card>
			</div>
			<div class="sms-info">
				<Card dis-hover>
					<div slot="title">
						<Icon type="chatbubble-working"></Icon>
						<span>推短信</span>
						<i-switch 
							v-model="push_sms" 
							:true-value="1" 
							:false-value="0"
							:disabled="data.sms.send==0" 
							class="push-switch">
						</i-switch>
					</div>
					<template v-if="data.sms.send==1">
						<div class="content">
							<div class="sms-mobile">
								<div class="label">发送至：</div>
								<div class="tag-wrapper">
									<Tag 
										:closable="data.sms.mobile.length>1?true:false" 
										@on-close="delMobile(index)"
										v-for="(mobile,index) in data.sms.mobile">{{mobile}}
									</Tag>
								</div>
							</div>
							<div class="sms-content">
								<div class="label">发送内容：</div>
								<div class="message">{{data.sms.content}}</div>
							</div>
						</div>
					</template>
					<template v-else>
						<div class="send-fault">
							<Icon type="close-circled"></Icon>
							{{data.sms.content}}
						</div>
					</template>
				</Card>
			</div>
			<div class="wechat-info">
				<Card dis-hover>
					<div slot="title">
						<i class="fa fa-weixin"></i>
						<span>推微信</span>
						<i-switch 
							v-model="push_wechat" 
							:true-value="1" 
							:false-value="0" 
							:disabled="data.wechat.send==0"
							class="push-switch">
						</i-switch>
					</div>
					<template v-if="data.wechat.send==1">
						<div class="content" @click="jump">
							<div class="title"">{{data.wechat.title}}</div>
							<div class="time">{{moment().format('MM月DD日')}}</div>
							<div class="message" :style="{color:data.wechat.data.first[1]}">{{data.wechat.data.first[0]}}</div>
							<div v-for="(value,key) in data.wechat.data" v-if="key.indexOf('keyword')>-1">
								{{value[2]}}：<span :style="{color:value[1]}">{{value[0]}}</span>
							</div>
							<div class="remark" :style="{color:data.wechat.data.remark[1]}">
								{{data.wechat.data.remark[0]}}
								<Icon type="chevron-right"></Icon>
							</div>
						</div>
					</template>
					<template v-else>
						<div class="send-fault">
							<Icon type="close-circled"></Icon>
							还没有绑定微信，无法发送
						</div>
					</template>
				</Card>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :disabled="push_sms==0&&push_wechat==0">发送</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'

	export default {
		mixins: [modal,common],
		components: {
			LetterAvatar
		},
		data() {
			return {
				data: {},
				ssId: 0,
				push_sms: 1,
				push_wechat: 1,
				moment: moment
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.push_wechat = this.data.wechat.send
					this.push_sms = this.data.sms.send
				}
			}
		},
		methods: {
			ok() {
				if(this.push_sms == 0 && this.push_wechat == 0) {
					return false;
				}
				this.$rest('study_situations/push')
				.post({
					ss_id: this.ssId,
					mobiles: this.data.sms.mobile
				})
				.success(res => {
					this.$Message.success('推送成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			delMobile(index) {
				this.data.sms.mobile.splice(index,1)
			},
			jump() {
				let url = this.data.wechat.url
				if(!url) {
					window.location.href = url
				}
			}
		},
		computed: {
			not_empty() {
				return !_.isEmpty(this.data)
			}
		}
	}
</script>
<style lang="less">
	.push-study-box {
		label.sex {
			margin-bottom: 5px;
		}
		.ivu-card {
			font-size: 12px;
			.ivu-card-head {
				position: relative;
				font-size: 14px;
				.ivu-switch.push-switch {
					position: absolute;
					right: 10px;
					top: 8px;
				}
			}
			.ivu-card-body {
				padding: 12px 16px;
			}
		}
		.send-fault {
			padding: 15px;
			color: #999;
			text-align: center;
		}
		.sms-info {
			margin-top: 15px;
			.content {
				.sms-mobile {
					display: flex;
					>.label {
						flex: 0 0 60px;
						text-align: right;
						margin-top: 5px;
					}
					>.tag-wrapper {
						flex: 1;
					}
				}
				.sms-content {
					display: flex;
					margin-top: 8px;
					>.label {
						flex: 0 0 60px;
						text-align: right;
						margin-top: 8px;
					}
					>.message {
						flex: 1;
						color: #000000;
						padding: 8px 10px;
						background: #eee;
						border-radius: 6px;
					}
				}
			}
		}
		.wechat-info {
			margin-top: 15px;
			.content {
				padding: 10px;
				border-radius: 8px;
				background: #eee;
				cursor: pointer;
				.title {
					color: #000000;
					font-size: 14px;
				}
				.message {
					margin-top: 10px;
					margin-bottom: 10px;
				}
				.remark {
					margin-top: 6px;
					padding-top: 6px;
					border-top: 1px solid #ccc;
					.ivu-icon {
						float: right;
						line-height: 1.8;
					}
				}
			}
		}
	}
</style>