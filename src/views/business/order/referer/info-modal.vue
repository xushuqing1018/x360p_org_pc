<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<template v-if="modal$.show">
            <div>
                <div style="margin-bottom: 20px;">
                    <select-student v-model="info.sid" :clearable="true" style="width:150px"></select-student>
                    介绍了
                    <select-student style="width:150px" v-model="info.referer_sid" :clearable="true"></select-student>
                </div>

                <span style="color:red">*</span> 介绍日期：<date-picker type="date" v-model="info.referer_int_day" placeholder="选择介绍日期" style="width: 280px"></date-picker>
            </div>
            
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="save">确定</Button>
			</div>
		</template>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import SelectStudent  from 'c%/SelectStudent.vue'

	export default {
        mixins: [modal,common,globals],
        components: {
            SelectStudent
        },
		data() {
			return {
				info: {
                    sid: 0,
                    referer_sid: 0,
                    referer_int_day: 0
                }
			}
		},
		methods: {
			save() {
                if(this.info.sid == 0||this.info.referer_sid == 0) {
                    this.$Message.warning('介绍人不能为空');
                    return;
                }
                else if(this.referer_int_day == 0) {
                    this.$Message.warning('介绍日期不能为空');
                    return;
                }
				this.$http.post('student_referers',this.info)
                .then(res => {
                    this.$Message.success('添加成功')
                    this.$emit('on-ok')
                    this.close()
                },res => {
                    this.error(res.body.message)
                })
			}
		}
	}
</script>