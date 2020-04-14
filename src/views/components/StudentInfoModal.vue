<template>
	<Modal v-drag-modal :mask-closable="false" width="1200" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
        <div style="max-height: 900px;overflow: auto;padding:0px 10px;">
			<student-info :id="id" :in-modal="true"/>
		</div>
	    <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>
<script>
import modal from '@/libs/modal.mixin'
import StudentInfo from 'v%/business/student/info.vue'

export default {
	name:'StudentInfoModal',
	mixins:[modal],
	props:{
		id: {
			type: Number,
			default: 0
		}
	},
	components: {
		StudentInfo
	}
}
</script>