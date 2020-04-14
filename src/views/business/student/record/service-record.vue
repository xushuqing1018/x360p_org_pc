<template>
	<div class="c-grid" style="min-height:400px">
		<service-record :sid="id" :type="1"></service-record>
	</div>
</template>

<script>
	import ServiceRecord from 'v%/service/service/record-list.vue'
	
	export default{
		components: {
			ServiceRecord
		},
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			
		}
	}
</script>

<style>
</style>