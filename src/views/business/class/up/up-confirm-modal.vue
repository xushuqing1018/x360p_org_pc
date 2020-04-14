<template>
	<Modal v-drag-modal :mask-closable="false" width="450" v-model="modal$.show" :title="modal$.title">
		<div class="p-2">
			<RadioGroup v-model="up_type" type="button">
				<Radio label="newClass">升级到新班级</Radio>
				<Radio label="oldClass">升级到已有班级</Radio>
			</RadioGroup>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	export default {
		mixins:[modal],
		data(){
			return {
				up_type: 'newClass'
			}
		},
		methods:{
			ok () {
				this.$emit('on-ok',this.up_type)
				this.close()
			}
		}
	}
</script>