<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="680" :mask-closable="false">		
		<Form :label-width="80">
			<Form-item label="配置项">
				{{info.title}}
			</Form-item>
			<Form-item label="配置值">
				<Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="info.value" placeholder="请输入配置值"></Input>
			</Form-item>
			<Form-item label="描述">
				<span class="text-danger font-weight-bold">
					{{info.describe}}
				</span>
			</Form-item>			
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	const emptyObject = {
		title: '',
		value: '',
		describe: ''
	}
	
	export default{
		mixins: [modal],
		data () {
			return {
				info: util.copy(emptyObject) 
			}
		},
		methods: {
			cancel () {
				this.close()
			},
			ok () {
				this.close()
			}
		}
	}
</script>
