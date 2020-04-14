<template>
	<class-arranges-list
	:class-info="classInfo"
	ref="arrangesList"
	>
	</class-arranges-list>
</template>

<script>
	import classArrangesList from '../arranges-list.vue'
	
	export default{
		components: {
			classArrangesList
		}
	}
</script>
