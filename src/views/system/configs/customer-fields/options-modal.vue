<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450">
		<div class="ml-4">
			<div class="mb-2" v-for="(item,index) in options">
				<span>选项{{index+1}}：</span>
				<Tag 
					color="blue"
					type="border"
					closable 
					@on-close="delItem(index)" 
					>{{item}}
				</Tag>
			</div>
			<div class="mb-2">
				<span>添加选项：</span>
				<Input 
					ref="key"
					v-model="option" 
					placeholder="输入后请按回车键确认" 
					style="width: 150px;" 
					@on-enter="saveOption"
					@on-blur="checkSave">
				</Input>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		data() {
			return {
				options: [],
				option: ''
			}
		},
		methods: {
			delItem(index) {
				this.options.splice(index,1)
			},
			ok() {
				this.$emit('save',this.options)
				this.close()
			},
			saveOption() {
				if(this.option!=='') {
					this.options.push(this.option)
					this.option = ''
					this.$refs.key.focus()
				}
			},
			checkSave() {
				if(this.option!=='') {
					this.$Message.info('选项请按回车键确认')
					this.$refs.key.focus()
				}
			}
		}
	}
</script>
