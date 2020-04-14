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
	export default {
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
			eid: {
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
				let action = this.detailAction;
				if(action == 1) {
					this.$router.push({path:`/system/staff/employee/${this.eid}`});
				}
				else if(action == 2) {
					this.$Modal.open('components/EmployeeInfoModal.vue@modal', {
						props: {
							id: this.eid
						}
					}).then(modal => {
						modal.show(`【${this.name}】员工详情`);
					})
				}
			}
		}
	}
</script>
