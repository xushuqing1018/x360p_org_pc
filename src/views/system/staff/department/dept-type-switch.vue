<template>
	<div>
		<!-- <label>权限范围：</label> -->
        <ButtonGroup>
            <Button 
                :type="type_value=='branchs'?'primary':'ghost'" 
                size="small" 
                icon="ios-home"
                @click="type_value='branchs'">校区
            </Button>
            <Button 
                :type="type_value=='projects'?'primary':'ghost'" 
                size="small" 
                icon="ios-paper" 
                @click="type_value='projects'">项目
            </Button>
        </ButtonGroup>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		props: {
			deptType: {
        		type: String,
        		require: true
			}
		},
		mounted() {
				if(this.deptType == "branchs") {
					this.type_value = 'branchs'
				}else{
					this.type_value = 'projects'
				}
		},
		data() {
			return {
				type_value: ''
			}
		},
		watch: {
			'type_value':function(val) {
				this.$emit('on-change',val)
			}
		}
	}
</script>