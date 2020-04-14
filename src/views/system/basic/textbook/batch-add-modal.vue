<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="400" :mask-closable="false">
        请选择要添加的章节数目：<InputNumber :min="1" v-model="num"></InputNumber>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
	
	export default{
        mixins: [ common,modal,globals ],
		data () {
			return {
				num: 1
			}
		},
		methods: {
            ok() {
                this.$emit('add',this.num)
                this.close();
            }
        }
		
	}
	
</script>

<style>
</style>