<template>
	<div class="ticket-chat">
		<div class="header">
			<a class="text-info" @click="geTicketList"><Icon type="ios-arrow-back" size="16" />	 工单列表</a>
			<span class="split-line"></span>
			<span>工单详情</span>
		</div>
		<div class="content">
			<div class="ticket-step">
				<Steps :current="current_step">
					<Step v-for="(v,k) in steps" :title="v"></Step>
				</Steps>
			</div>
			<div class="info">
				<div class="info-block">
					<span>提交时间：</span>
					<span>{{data.create_time}}</span>
				</div>
				<div class="info-block">
					<span>状态：</span>
					<span>{{current_status}}</span>
				</div>
			</div>
			<div class="chat-list">
				<div class="chat-header">沟通记录</div>
				<div class="chat-content">
					<div class="comment">
						<div class="pull-left">
							<Avatar style="background-color: #87d068" icon="ios-person" />
						</div>
						<div class="header">
							<span>{{data.apply_employee_name}}</span>
							<span class="pull-right">{{data.create_time?data.create_time.substring(0,16):''}}</span>
						</div>
						<div class="content clearfix">
							<p>{{data.title}}
								<span class="read_status" :class="data.is_read?'text-gray':'text-danger'">{{data.is_read?'已读':'未读'}}</span>
							</p>
							<p v-if="data.remark">备注：{{data.remark}}</p>
						</div>
						<div class="footer"></div>
					</div>
					<template v-for="item in data.franchisee_service_records">
						<div class="comment" v-if="item.fsr_type==1">
							<div class="pull-left">
								<Avatar style="background-color: #87d068" icon="ios-person" />
							</div>
							<div class="header">
								<span>{{item.fc_employee_name}}</span>
								<span class="pull-right">{{item.int_day+' '+item.int_hour}}</span>
							</div>
							<div class="content clearfix">
								<p>{{item.content}}
									<span class="read_status" :class="item.is_read?'text-gray':'text-danger'">{{item.is_read?'已读':'未读'}}</span>
								</p>
								<div class="mt-2" v-if="item.franchisee_service_record_file.length">
									<file-item :list="item.franchisee_service_record_file"></file-item>
								</div>
							</div>
							<div class="footer"></div>
						</div>
						<div class="comment agent" v-else>
							<div class="pull-left">
								<Avatar icon="ios-person" />
							</div>
							<div class="header">
								<span>{{item.employee_name}}</span>
								<span class="pull-right">{{item.int_day+' '+item.int_hour}}</span>
							</div>
							<div class="content clearfix">
								<p>{{item.content}}</p>
								<div class="mt-2" v-if="item.franchisee_service_record_file.length">
									<file-item :list="item.franchisee_service_record_file"></file-item>
								</div>
							</div>
							<div class="footer"></div>
						</div>
					</template>
				</div>
			</div>
			<div class="submit">
				<Button type="primary" @click="reply" :loading="saving" v-if="data.status!==3">我要回复</Button>
				<Button type="text" @click="close" :loading="saving"  v-if="data.status==2">确认结单</Button>
			</div>
		</div>
		<Spin size="large" fix v-if="loading"></Spin>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import FileItem from 'c%/FileItem.vue'

	export default {
		mixins: [globals,common],
		components: {
			ReviewUpload,
			FileItem
		},
		data() {
			return {
				data: {},
				loading: false,
				current_step: 0,
				steps: {0:'已阅读',1:'已受理',2:'处理中',3:'已完成'}
			}
		},
		mounted() {
			this.get_apply_info()
		},
		methods: {
			reply() {
				this.$Modal.open('support/services/info-modal.vue',{
					props: {
						apply: this.data,
						'fsr-type': 1
					},
					on: {
						save:() => {
							this.get_apply_info()
						}
					}
				})
				.then(modal => {
					modal
					.show('工单回复','add')
				})
			},
			geTicketList() {
				this.$router.push('/support/tickets')
			},
			get_apply_info() {
				this.loading = true
				this.$rest('franchisee_service_applys').add_url_param(this.$route.params.id)
				.get()
				.success(res => {
					this.loading = false
					this.data = res
					this.setStep(res)
				})
				.error(res => {
					this.$Message.error(res.message)
				})
			},
			close() {
				this.confirm(util.sprintf('结单后状态变为已完成，将不可再回复，确定吗？',this.data.apply_employee_name))
				.then(() => {
					this.$rest('franchisee_service_applys')
					.add_url_param(this.data.fsa_id,'finish')
					.post()
					.success(res => {
						this.get_apply_info()
					})
					.error(res => {
						this.error(res.message)
					})
				})
			},
			setStep(res) {
				if(res.is_read==0) {
					this.current_step = -1
				}else{
					this.current_step = 0
					if(res.status) {
						this.current_step = res.status
					}
				}
			}
		},
		computed: {
			current_status() {
				return this.steps[this.current_step]
			}
		}
	}
</script>
<style lang="less">
	.text-gray {
		color: #999;
	}
	.ticket-chat {
		position: relative;
		padding: 15px;
		>.header {
			margin-bottom: 10px;
			>a{
				color: #2D8cF0 !important;
			}
			i{
				vertical-align: -2px;
			}
			.split-line{
				height: 12px;
			    display: inline-block;
			    vertical-align: -2px;
			    border-left: 1px solid #515a6e;
			    margin: 0 4px;
			}
		}
		.content {
			background: #fff;
			padding: 15px;
			font-size: 14px;
			.info {
				margin: 15px 0;
				&-block {
					display: inline-block;
					padding-right: 40px;
				}
			}
			.chat-header {
				padding: 10px;
				background: #f3f3f3;
				border-left: 3px solid #1b8afa;
			}
			.chat-list {
				border: 1px solid #e8e8e8;
				.comment {
					padding: 10px;
					color: #888;
					word-break: break-all;
					&:not(:last-child){
						border-bottom: 1px solid #e8e8e8;
					}
					.header {
						padding: 6px 40px;
					}
					.content {
						padding-right: 200px;
					}
					.footer {
						padding: 5px 40px;
					}
					.read_status {
						font-size: 12px;
						margin-left: 15px;
					}
					&.agent {
						color: #000;
					}
				}
			}
			.submit {
				margin-top: 15px;
				text-align: center;
			}
		}
	}
</style>