<template>
	<div class="student-money-info">
		<ButtonGroup size="small" class="mb-2">
			<Button :type="active_btn == 1? 'primary': 'ghost'" @click="triggerRecord(1)">缴费记录</Button>
            <Button :type="active_btn == 2? 'primary': 'ghost'" @click="triggerRecord(2)">结转记录</Button>
            <Button :type="active_btn == 3? 'primary': 'ghost'" @click="triggerRecord(3)">退费记录</Button>
		</ButtonGroup>
		<pay :sid="sid" v-if="active_btn == 1"></pay>
		<transfer :sid="sid" v-if="active_btn == 2"></transfer>
		<refund :sid="sid" v-if="active_btn == 3"></refund>
	</div>
</template>
<script>
	import Pay 		from './pay.vue'
	import Transfer from './transfer.vue'
	import Refund 	from './refund.vue'
	export default {
		components: {
			Pay,
			Transfer,
			Refund
		},
		props: {
			sid:{
				type: [Number,String],
				default:0
			}
		},
		data() {
			return {
				active_btn: 1
			}
		},
		methods: {
			triggerRecord(type) {
				if(type == this.active_btn) return
				this.active_btn = type
			}
		}
	}
</script>