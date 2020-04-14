<template>
	<order-list :order-from="0"></order-list>
</template>

<script>
	import orderList from './order-list.vue'
	export default{
		components: {
			orderList
		},
		data () {
			return {
				
			}
		}
	}
</script>
