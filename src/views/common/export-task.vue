<template>
	<div class="navbar-export-task ml-3" @click="myExportFile">
		<transition
			name="custom-classes-transition"
		    enter-active-class="animated bounceInUp"
			leave-active-class="animated fadeOutUp"
			>
			<Badge dot v-if="has_export_tasks">				
	        	<Icon type="arrow-down-a" size="22" color="#2d8cf0"></Icon>  		
	   		</Badge>
	   	</transition>
	</div>
</template>
<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			myExportFile() {
				this.$store.commit('clearExportTask')
				this.$router.push({path: '/dashboard/export'})
			}
		},
		computed: {
			has_export_tasks() {
				return this.$store.state.export.tasks.length > 0
			}
		}
	}
</script>