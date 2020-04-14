<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="400" :mask-closable="false">
        <RadioGroup v-model="type" type="button">
            <Radio :label="1">普通模板</Radio>
            <Radio :label="2">专业模板</Radio>
        </RadioGroup>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
    
	
	export default{
        mixins: [ common,modal,globals ],
		data () {
            var vm = this;
			return {
				type: 1,
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val){
                    this.type = 1
                }
            }
		},
		methods: {
			ok () {
                if(this.type == 1) {
                    this.$emit('on-ok','custom')
                }
                else {
                    this.$emit('on-ok','style')
                }
                this.close()
            }
        }
	}
	
</script>