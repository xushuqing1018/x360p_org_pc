<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="400" :mask-closable="false">
        <Form :label-width="70" :model="info" :rules="rules" ref="form">
            <FormItem label="开始时间" prop="int_start_hour" class="col-12"> 
                <TimePicker v-model="info.int_start_hour" :steps="[1, 15]" format="HH:mm" placeholder="选择开始时间" style="width: 200px"></TimePicker>
            </FormItem>
            <FormItem label="结束时间" prop="int_end_hour" class="col-12">
                <TimePicker v-model="info.int_end_hour" :steps="[1, 15]" format="HH:mm" placeholder="选择结束时间" style="width: 200px"></TimePicker>
            </FormItem>
        </Form>
		
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
        mixins: [ common,modal,globals,modal ],
        props: ['info'],
		data () {
            var vm = this;
			return {
				rules: {
					int_start_hour: [
						{ required: true, message: '请选择开始时间', trigger:'change' } 
					],
					int_end_hour: [
						{ required: true, message: '请选择结束时间', trigger:'change' } 
					]
                }
			}
		},
		watch: {
			'modal$.show': function (val) {
            }
		},
		methods: {
			ok () {
				this.$form('form').check().then(()=>{
                    this.$emit('on-ok');
                    this.close();
				})
            }
        },
        computed: {
        }
	}
	
</script>

<style>
</style>