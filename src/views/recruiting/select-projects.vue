<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title">
		<div>
            <Form :label-width="80" class="filter-form row">
                <Form-item label="项目"  class="col-sm-12" prop="pj_ids">
			    	<Select v-model="pj_ids" multiple>
			    		<Option :value="item.pj_id" v-for="(item,index) in projects" :key="index">{{item.pj_name}}</Option>
			    	</Select>
			    </Form-item>
            </Form>
        </div>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>

	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import modal from '@/libs/modal.mixin'

	export default {
		mixins: [common,util,globals,modal],
		props: {
			props_pj_ids: {
            	type: Array,
            	default: []
            }
        },
        data(){
            return {
                pj_ids: this.props_pj_ids
            }
        },
		methods: {
			ok() {
				if(this.pj_ids.length == 0) {
					this.$Message.error('请选择项目')
					return false
                }
                this.$emit('on-success',this.pj_ids)
			    this.close()
			}
		}
	}
</script>