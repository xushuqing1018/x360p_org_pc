<template>
	<Tabs v-model="tab">
		<TabPane label="学情服务" name="situation">
			<situation-list v-if="tab=='situation'"></situation-list>
		</TabPane>
		<TabPane label="学习方案" name="suit">
			<lesson-buy-suit v-if="tab=='suit'"></lesson-buy-suit>
		</TabPane>
	</Tabs>
</template>
<script>
	import SituationList from './situation/situation-list.vue'
	import LessonBuySuit from './situation/lesson-buy-suit.vue'
	export default {
		components: {
			SituationList,
			LessonBuySuit
		},
		data() {
			return {
				tab: 'situation'
			}
		}
	}
</script>