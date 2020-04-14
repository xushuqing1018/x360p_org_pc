<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
        <Form :label-width="100">
			<Form-item label="类型" class="ivu-form-item-required">
                {{ itemInfo.org_check.type == 1 ? '督导版转为正式版' : '正式版转为督导版' }}
			</Form-item>
			<Form-item v-if="itemInfo.org_check.type == 1" label="到期时间" prop="expire_day" class="ivu-form-item-required">
                <DatePicker type="date" :value="info.expire_day" @on-change="info.expire_day = $event" placeholder="选择到期时间" style="width: 200px"></DatePicker>
			</Form-item>
		</Form>
        
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import moment from 'moment'
	
	export default{
		mixins:[modal,common,globals],
        props: {
            itemInfo: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
		data () {
			return {
				info: {
                    expire_day: ''
                }
			}
        },
        mounted() {
            this.info.expire_day = moment(this.itemInfo.org_check.expire_day, 'YYYYMMDD').format('YYYY-MM-DD');
        },
		methods: {
        	save(){
                if(this.itemInfo.org_check.type == 1&&this.info.expire_day === '') {
                    this.$Message.error('过期时间不能为空')
                    return false
                }
                
                this.$http.post(`orgs/${this.itemInfo.og_id}/check_org_type`, {
                    org_type: this.itemInfo.org_check.type,
                    expire_day: this.info.expire_day
                })
                .then(res => {
                    this.$Message.success('审核成功');
                    this.$emit('save');
                    this.close();
                },res => {
                    this.error(res.body.message)
                })
	        }
		}
	}
</script>
