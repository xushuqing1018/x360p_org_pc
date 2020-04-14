<template>
	<div>
		<label>权限范围：</label>
        <ButtonGroup>
            <Button 
                :type="type_value=='my'?'primary':'ghost'" 
                size="small" 
                icon="android-person"
                @click="type_value='my'">我的
            </Button>
            <Button 
                :type="type_value=='all'?'primary':'ghost'" 
                size="small" 
                icon="android-people" 
                :disabled="userPers.indexOf(per)<0" 
                @click="type_value='all'">所有
            </Button>
        </ButtonGroup>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		props: {
			per: {
				type: String,
				require: true
			},
			showMy: {
				type: Boolean,
				default: false
			}
		},
		mounted() {
			if(this.userPers.indexOf(this.per) > -1) {
				if(this.showMy) {
					this.type_value = 'my'
				}else{
					this.type_value = 'all'
				}
			}else{
				this.type_value = 'my'
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