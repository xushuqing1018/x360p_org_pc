<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<CheckboxGroup v-model="model">
			<Checkbox v-for="item in roles" :label="item.rid">{{item.role_name}}</Checkbox>
		</CheckboxGroup>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins: [modal,common,globals],
		props: {
			value: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data() {
			return {
				model: this.value
			}
		},
		watch: {
			value(v) {
				this.model = v
			}
		},
		computed: {
			roles(){
				return this.$store.state.gvars.roles
			}
		},
		methods: {
			ok() {
				if(this.model.length == 0) {
					this.$Message.error('你还没选择任何角色')
					return
				}
				this.$emit('input',this.model)
				this.$emit('on-change',this.model)
				this.close()
			}
		}
	}
</script>