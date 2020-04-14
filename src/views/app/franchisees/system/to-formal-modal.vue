<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="600">
		<Form :label-width="100">
			<Form-item label="到期时间" prop="expire_day" class="ivu-form-item-required">
                <DatePicker type="date" :value="info.expire_day" @on-change="info.expire_day = $event" placeholder="选择到期时间" style="width: 200px"></DatePicker>
			</Form-item>
			<Form-item label=" ">
                <Button type="info" size="small" @click="setExpire('month')">一个月</Button>
                <Button type="info" size="small" @click="setExpire('year')" class="ml-2">一年</Button>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import moment from 'moment'
    
	export default {
		mixins: [modal,common],
		data() {
			return {
				info: {
                    expire_day: ''
                },
                og_id: 0
			}
		},
		methods: {
			ok() {
				if(!this.info.expire_day) {
					this.$Message.error('到期时间不能为空')
					return
                }
                this.$http.post(`orgs/${this.og_id}/change_org_type`, {
                    org_type: 1,
                    expire_day: this.info.expire_day
                })
                .then(res => {
                    this.$Message.success('转化成功')
                    this.$emit('save')
                    this.close();
                },res => {
                    this.error(res.body.message)
                })
            },
            setExpire(type) {
                this.info.expire_day = (type == 'month') ? (moment().add(1, 'months').format('YYYY-MM-DD')) : (moment().add(1, 'years').format('YYYY-MM-DD'))
            }
		}
	}
</script>