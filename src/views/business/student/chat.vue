<template>
	<transition
		name="chat-transition"
		enter-active-class="animated fast zoomIn"
		leave-active-class="animated fast zoomOut">
		<div class="chat-box" v-if="modal$.show && is_app_chat_open">
			<div class="chat-header">
				<img :src="student_avatar" width="45" height="45" />
				<span class="name">{{info.student_name}}的对话框</span>
				<Icon type="ios-close-empty" @click.native="close"></Icon>
			</div>
			<div class="chat-main">
				<div class="chat-more">
					<span v-if="isloadAll">没有更多了</span>
					<span class="cursor" @click="more" v-else>点击加载更多</span>
				</div>
				<div class="chat-list">
					<div 
						:class="[
							'chat-item',
							item.eid?'chat-item-right':'chat-item-left',
							{
								'chat-item-mine': item.eid==eid$
							}
						]"
						v-for="item in orderBy(data,'stamp')"
						>
						<div class="chat-user">
							<template v-if="item.eid">
								<img :src="getEmployeeAvatar(item)" width="30" height="30"/>
								<span style="margin-left: 5px">{{getCreateTime(item)}}</span>
								<span style="margin-right: 33px">{{item.employee.ename}}</span>
							</template>
							<template v-else>
								<img :src="student_avatar" width="30" height="30"/>
								<span>{{item.student.student_name}}</span>
								<span style="margin-right: 5px;">{{getCreateTime(item)}}</span>
							</template>
						</div>
						<div>
							<span 
								:class="item.is_read?'text-gray':'text-danger'" 
								style="margin-right: 5px;"
								v-if="item.eid==eid$"
								>
								{{item.is_read?'已读':'未读'}}
							</span>
							<div class="chat-text">{{item.message}}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="footer">
				<Input type="textarea" autofocus v-model="chatValue" @on-enter="ok"></Input>
				<Button type="primary" size="small" @click="ok">发送</Button>
			</div>
		</div>
	</transition>
</template>
<script>
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	export default {
		mixins: [common,modal],
		data() {
			return {
				info: {},
				chatValue: '',
				data: [],
				pageIndex: 1,
				pageSize: 10,
				loading: false,
				isloadAll: false,
				total: 0,
				t: null 
			}
		},
		watch: {
			'modal$.show':function(v) {
				if(v) {
					this.t = setInterval(() => {
						this.init_data()
					},3000)
				}
				else {
					clearInterval(this.t)
				}
			}
		},
		computed: {
			student_avatar() {
				if(this.info.photo_url) {
					return this.info.photo_url
				}
				else {
					if(this.info.sex==1) {
						return 'https://sp1.xiao360.com/cppt/default-head-1.png'
					}
					else {
						return 'https://sp1.xiao360.com/cppt/default-head-2.png'
					}
				}
			}
		},
		methods: {
			getEmployeeAvatar(item) {
				let em = item.employee
				if(em.photo_url) {
					return em.photo_url
				}
				else {
					if(em.sex==1) {
						return 'https://sp1.xiao360.com/static/ui/pc/teacher-male.png'
					}
					else {
						return 'https://sp1.xiao360.com/static/ui/pc/teacher-female.png'
					}
				}
			},
			getCreateTime(item) {
				let time = item.create_time.substring(5,16)
				let hour = item.create_time.substring(11,16)
				
				let date = moment(item.create_time).format('YYYYMMDD')
				let today = moment().format('YYYYMMDD')
				let diff = moment(today).diff(moment(date),'days')
				if(diff == 0) {
					return hour
				}
				else if(diff==1) {
					return '昨天'+hour
				}
				else if(diff==2){
					return '前天'+hour
				}
				else {
					return time
				}
			},
			reset() {
				this.data = []
				this.isloadAll = false
				this.pageIndex = 1
				this.init_data()
				return this
			},
			more() {
				if(this.data.length % this.pageSize == 0) {
					this.pageIndex ++
				}
				else {
					this.pageIndex = Math.ceil(this.data.length/this.pageSize)
				}
				this.init_data(true)
			},
			do_read() {
				this.$rest('im_chats').add_url_param(this.info.sid,'doread')
				.post({
					sid: this.info.sid
				})
				.success(res => {

				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			init_data(down = false) { //down是否是下拉
				if(this.loading) {
					return
				}
	            this.loading = true
	            this.$rest('im_chats')
	            .get({
	            	page: down?this.pageIndex:1,
	            	pagesize: this.pageSize,
	            	sid: this.info.sid,
	            	with: 'student,employee'
	            })
	            .success(res=>{
	                let list = res.list
	                let is_new = false
	                this.total = res.total
	                this.loading = false
	                list.forEach(l => {
	                	let index = this.data.findIndex(d=>d.ac_id==l.ac_id)
	                	if(index==-1) {
	                		is_new = true
	                		this.data.push(l)
	                	}
	                	else {
	                		this.data.splice(index,1,l)
	                	}
	                })
	                
	                this.data.forEach(d => {
						d.stamp = parseInt(new Date(d.create_time).getTime()/1000)
					})
					if(is_new) {
						this.do_read()
						if(!down) {
							this.getScrollHeight()
						}
					} 
					if(this.total == this.data.length) {
	                	this.isloadAll = true
	                }
	            })
	            .error(response=>{
	            	this.loading = false
	            	this.toast(repsonse.body.message,'text')
	            })
			},
			getScrollHeight() {
				this.$nextTick(() => {
					let container = document.getElementsByClassName('chat-main')[0]
					container.scrollTop = container.scrollHeight
				})
			},
			ok() {
				let value = this.chatValue.trim()
				let params = {
					message: value,
					sid: this.info.sid,
					eid: this.eid$,
					send_type: 1,
					app_client_id: 10
				}
				if(value) {
					this.$rest('im_chats')
					.post(params)
					.success(res => {
						this.chatValue = ''
						this.init_data()
					})
					.error(res => {
						this.$Message.error(res.body.message)
					})
				}
			}
		}
	}
</script>
<style lang="less">
	.chat-box {
		position: fixed;
		height: 68vh;
		width: 360px;
		right: 10px;
		bottom: 0;
		background: #f7fafa;
		box-shadow: 0 0 24px 0 rgba(15,66,76,.25);
		z-index: 9999;
		.chat-header {
			position: relative;
			height: 60px;
			line-height: 60px;
			padding-left: 10px;
			background: linear-gradient(to right,#2894FF,#1181f1);
			.ivu-icon-ios-close-empty {
				position: absolute;
				right: 8px;
				top: 2px;
				font-size: 28px;
				color: #ffffff;
			}
			.name {
				font-size: 14px;
				color: #ffffff;
				margin-left: 10px;
			}
		}
		.chat-main {
			position: absolute;
			width: 100%;
			top: 60px;
			bottom: 90px;
			overflow: auto;
			padding: 0 15px;
			.chat-more {
				text-align: center;
				margin: 10px 0;
				color: #999;
			}
			.chat-list {
				.chat-item {
					position: relative;
					margin-bottom: 10px;
					.chat-user {
						position: relative;
						height: 30px;
						line-height: 30px;
						color: #999;
					}
					.chat-text {
						position: relative;
					    padding: 10px;
					    background-color: #e9f0ef;
					    border-radius: 2px;
					    display: inline-block;
					    max-width: 300px;
					    min-height: 20px;
					    line-height: 20px;
					    word-wrap: break-word;
					    margin-top: 5px;
					    &:before {
						    width: 0;
						    position: absolute;
						    top: 12px;
	    					border-width: 0 12px 12px 0;
						    border-style: solid;
						    border-color: transparent #e9f0ef;
						    content: "";
						}
					}
					&-left {
						.chat-text:before {
							left: -12px;
						}
					}
					&-right {
						text-align: right;
						.chat-text:before {
							right: -12px;
							border-width: 0 0 12px 12px;
						}
						.chat-user {
							>img {
								position: absolute;
								right: 0;
								top: 0;
							}
						}
					}
					&-mine {
						.chat-text {
							background: #4296e8;
							color: #fff;
							&:before {
								border-color: transparent #4296e8;
							}
						}
					}
				}
			}
		}
		.footer {
			position: absolute;
			width: 100%;
			bottom: 10px;
			border-top: 1px solid #ebeff0;
			padding: 5px;
			background: #ffffff;
			text-align: right;
			.ivu-input {
				border: none;
				resize: none;
			}
			.ivu-input:focus {
				box-shadow: none;
				border: none;
			}
			.ivu-input:hover {
				border: none;
			}
		}
		img {
			border-radius: 50%;
			object-fit: cover;
		}
	}
</style>