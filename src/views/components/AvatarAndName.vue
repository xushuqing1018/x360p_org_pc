<template>
	<div class="x-avatar-name">
		<template v-if="name">
			<Avatar v-if="showAvatar" :src="src ? src : 'http://s1.xiao360.com/common_img/avatar.jpg'" :shape="shape" :size="size"></Avatar>
			<a v-if="showNickname" class="align-middle text-info" @click="click" :title="sex==0 ? '' : sex_map[parseInt(sex)]">
				<span class="realname">{{name}}</span>
				<span class="nickname" v-if="nickname != ''">{{nickname}}</span>
			</a>
		</template>
		<template v-else>
			<span>无</span>
		</template>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	export default {
		name:'AvatarAndName',
		mixins:[common],
		props: {
			src: {
				type: String,
				default: ''
			},
			name: {
				type: String,
				default: ''
			},
			nickname:{
				type: String,
				default: ''
			},
			shape: {
				type: String,
				default: 'circle'
			},
			size: {
				type: String,
				default: 'default'
			},
			sex: {
				type: [Number,String],
				default: 0
			},
			showAvatar: {
				type: Boolean,
				default: true
			},
			showNickname: {
				type: Boolean,
				default: true
			},
			//详情动作  0：无点击   1：路由跳转到学员详情  2：弹出Modal详情
			detailAction: {
				type: Number,
				default: 0
			},
			sid: {
				type: Number,
				default: 0
			},
			cuId:{
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				sex_map: {1: '男',2: '女'}
			}
		},
		methods: {
			click() {
				if(!this.hasPer('student.archive')){
					this.$Message.info('没有查看学员档案权限')
					return false
				}
				let action = this.detailAction;
				if(action == 0) {
					this.$emit('click');
				}
				else if(action == 1) {
					this.$router.push({path:`/business/student/${this.sid}/lesson`});
				}
				else if(action == 2) {
					this.$Modal.open('components/StudentInfoModal.vue@modal', {
						props: {
							id: this.sid
						}
					}).then(modal => {
						modal.show(`【${this.name}】学员档案`);
					})
				}
			}
		}
	}
</script>
