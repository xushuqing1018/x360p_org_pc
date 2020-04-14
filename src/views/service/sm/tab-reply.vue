<template>
	<div class="c-grid">
		<RadioGroup v-model="type" class="mb-3" type="button">
        <Radio :label="0">课评回评</Radio>
        <Radio :label="1">作品回评</Radio>
    </RadioGroup>
		<TeacherReply v-if="type === 0"></TeacherReply>
		<ArtworkReply v-else></ArtworkReply>
	</div>
</template>

<script>
	import TeacherReply from './tab-reply/teacher-reply.vue'
	import ArtworkReply from './tab-reply/artwork-reply.vue'
	
	export default{
		components: {
			TeacherReply,
			ArtworkReply
		},
		data () {
			return {
				type: 0,
			}
		}
							
	}
	
</script>

<style>

</style>