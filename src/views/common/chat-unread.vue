<template>
	<div class="ml-3">
		<Poptip trigger="hover" placement="bottom">
			<Badge dot :count="nums">
	        	<Icon type="chatbubble-working" size="18"></Icon>
	   		</Badge>
	   		<div slot="content">
	            <div class="unread-list">
	            	<div class="unread-item" v-for="item in data" @click="openChatBox(item)">
	            		<img :src="getAvatar(item)" width="25px" height="25px">
	            		<span>{{item.student_name}}</span>
	            		<span>有<span style="color: #f30">{{item.unread}}</span>条未读</span>
	            	</div>
	            	<div class="empty" v-if="data.length==0">暂无未读消息</div>
	            </div>
	        </div>
		</Poptip>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		data() {
			return {
				data: [],
				nums: 0
			}
		},
		mounted() {
			this.init_data()
			setInterval(() => {
				this.init_data()
			},3000)
		},
		methods: {
			init_data() {
				this.$rest('im_chats/get_unread_chat')
				.get()
				.success(res => {
					this.nums = res.total_unread
					this.data = res.unread
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			openChatBox(item) {
				this.chatbox
				.set('info',item)
				.reset()
				.show()
			},
			getAvatar(item) {
				if(item.photo_url) {
					return item.photo_url
				}
				else {
					if(item.sex==1) {
						return 'https://sp1.xiao360.com/cppt/default-head-1.png'
					}
					else {
						return 'https://sp1.xiao360.com/cppt/default-head-2.png'
					}
				}
			}
		}
	}
</script>
<style lang="less">
	.unread-list {
		max-height: 400px;
		overflow: auto;
		.unread-item {
			position: relative;
			cursor: pointer;
			&:not(:last-child) {
				margin-bottom: 10px;
				&:after {
					content: ' ';
					position: absolute;
					left: 0;
					right: 0;
					bottom: -5px;
					transform: scaleY(0.5);
					border-bottom: 1px solid #d7dde4;
				}
			}
		}
	}
</style>