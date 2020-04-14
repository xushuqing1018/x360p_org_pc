<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Input v-model="value" type="textarea" :rows="15"></Input>
		
		<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>	
			<Button type="primary" icon="edit" @click="ok">完成编辑</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
	
	export default{
        mixins: [ common,modal],
		data () {
			return {
                value: ''
			}
		},
		watch: {
			'modal$.show': function (val) {
            }
		},
		methods: {
			ok () {
                this.$emit('on-ok',this.value)
                this.close();
            }
        },
        computed: {
        }
		
	}
	
</script>

<style>
</style>