<template>
	<div class="c-grid" style="min-height:400px">
		<service-task :sid="id" :type="1"></service-task>
	</div>
</template>

<script>
	import ServiceTask from 'v%/service/service/task-list.vue'
	
	export default{
		components: {
			ServiceTask
		},
		props: {
			sid:{
				type: [Number,String],
				default:0
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