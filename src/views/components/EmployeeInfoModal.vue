<template>
	<Modal v-drag-modal :mask-closable="false" width="1000" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<employee-info :id="id" :in-modal="true"/>
	    <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>
<script>
import modal from '@/libs/modal.mixin'
import EmployeeInfo from 'v%/system/staff/employee/info.vue'

export default {
	name:'EmployeeInfoModal',
	mixins:[modal],
	props:{
		id: {
			type: Number,
			default: 0
		}
	},
	components: {
		EmployeeInfo
	}
}
</script>