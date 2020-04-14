<template>
	<Modal v-drag-modal :mask-closable="false" width="1200" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<class-info :id="id" :in-modal="true"/>
	    <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>
<script>
import modal from '@/libs/modal.mixin'
import ClassInfo from 'v%/business/class/info.vue'

export default {
	name:'ClassInfoModal',
	mixins:[modal],
	props:{
		id: {
			type: Number,
			default: 0
		}
	},
	components: {
		ClassInfo
	}
}
</script>