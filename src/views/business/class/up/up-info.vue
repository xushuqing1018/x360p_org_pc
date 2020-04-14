<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title">
		<Card class="mb-2" dis-hover style="font-size:12px">
			<div slot="title" class="clearfloat">
				<span>已选择的学员({{students.length}}人)</span>				
			</div>
			<div class="row">
				<div class="col-sm-3 mb-2 text-center" v-for="item in students">
					<Tag>{{item}}</Tag>	
				</div>				
			</div>
		</Card>
		<Card dis-hover style="font-size:12px">
			<div slot="title" class="clearfloat">
				<span>目标班级</span>				
			</div>
			<div class="row">
				<div class="col-sm-3 text-center">
					<Tag>{{class_name}}</Tag>
				</div>		
			</div>
		</Card>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins:[common,globals,modal],
		components:{
			
		},
		data(){
			return {
				students: [],
				data: {}
			}
		},
		computed: {
			class_name() {
				return this.$store.getters.getMapText(this.data.to,'class')
			}
		},
		methods:{
			ok () {
				this.$rest('classes').add_url_param(this.data.from,'doupgrade')
				.post({cid:this.data.to,sid:this.data.sid})
				.success(res => {
					this.$Message.success('升班成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>