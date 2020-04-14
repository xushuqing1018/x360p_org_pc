<template>
	<div>
		<RadioGroup v-model="type" class="mb-3" type="button" v-if="enable_regular_homework">
        <Radio :label="0">课后作业</Radio>
        <Radio :label="1">打卡作业</Radio>
    </RadioGroup>
		<AfterHomework v-if="type === 0"></AfterHomework>
		<clockIn v-else></clockIn>
	</div>
</template>

<script>
	import AfterHomework from './after-homework'
	import clockIn from './clock-in'
	import common from '@/libs/common.mixin'

	
	export default{
		mixins:[common],
		components: {
			AfterHomework,
			clockIn,
		},
		data () {
			return {
				type: 0
			}
		},
}
</script>

<style>
</style>