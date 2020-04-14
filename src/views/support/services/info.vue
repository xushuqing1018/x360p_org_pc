<template>
	<div class="ticket-chat">
		<div class="header">
			<a @click="getServiceList"><Icon type="ios-arrow-back" size="16" />  服务列表</a>
			<span class="split-line"></span>
			<span>服务详情</span>
		</div>
		<div class="content">
			<div class="chat-list">
				<div class="chat-header">沟通记录</div>
				<div class="chat-content">
					<div class="comment">
						<div class="pull-left">
							<Avatar icon="ios-person" />
						</div>
						<div class="header">
							<span>{{data.employee_name}}</span>
							<span class="pull-right">{{data.int_day+' '+data.int_hour}}</span>
						</div>
						<div class="content clearfix">
							<p>{{data.content}}</p>
							<div class="mt-2" v-if="data.franchisee_service_record_file.length">
								<file-item :list="data.franchisee_service_record_file"></file-item>
							</div>
						</div>
						<div class="footer"></div>
					</div>
					<template v-for="item in data.franchisee_service_records">
						<div class="comment agent" v-if="item.fsr_type==1">
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
						<div class="comment" v-else>
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
				<Button type="primary" @click="reply" :loading="saving">我要回复</Button>
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
				loading: false
			}
		},
		mounted() {
			this.get_service_info()
		},
		methods: {
			reply() {
				this.$Modal.open('support/services/info-modal.vue',{
					props: {
						apply: this.data,
						'fsr-type': 1,
						'parent-id': this.data.fsr_id
					},
					on: {
						save:() => {
							this.get_service_info()
						}
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('To：%s',this.data.employee_name),'add')
				})
			},
			getServiceList() {
				this.$router.push('/support/services')
			},
			get_service_info() {
				this.loading = true
				this.$rest('franchisee_service_records').add_url_param(this.$route.params.id)
				.get()
				.success(res => {
					this.loading = false
					this.data = res
				})
				.error(res => {
					this.$Message.error(res.message)
				})
			}
		}
	}
</script>
<style lang="less">
	.ticket-chat {
		position: relative;
		>.header {
			margin-bottom: 10px;
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