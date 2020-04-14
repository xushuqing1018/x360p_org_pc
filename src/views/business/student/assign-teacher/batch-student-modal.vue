<template>
	<Modal v-drag-modal :mask-closable="false" width="450" v-model="modal$.show" :title="modal$.title">
		<Form ref="form" :label-width="100" :model="info">
			<Form-item label="学管师：">
				<select-employee v-model="info.new_eid" :rid="4" style="width: 250px;"></select-employee>
			</Form-item>
		</Form>
    	<div slot="footer">
            <Button type="ghost" @click="close" :disabled="saving">取消</Button>
            <Button type="primary" @click="ok" :loading="saving">确认</Button>
        </div>
    </Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins:[modal,common],
		components: {
			SelectEmployee
		},
		props: {
			sids: Array,
			default() {
				return []
			}
		},
		data () {
			return {
				info: {
					new_eid: 0
				},
				es_ids:[]
			}
		},
        methods: {
        	ok() {
        		if(this.info.new_eid == 0) {
        			this.$Message.error('还没有选择学管师')
        			return false
        		}
        		this.$rest('employee_students/update_employee_student')
        		.post({
        			eid: this.info.new_eid,
        			es_ids: this.es_ids
        		})
        		.success(res => {
        			this.$Message.success('调整成功')
        			this.info.new_eid = 0
        			this.close()
        			this.$emit('on-success')
        		})
        		.error(res => {
        			this.error(res.body.message)
        		})
        	},
        	close() {
        		this.modal$.show = false
        		this.info.new_eid = 0
        	}
        }
	}
</script>
