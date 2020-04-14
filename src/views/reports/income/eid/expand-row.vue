<template>
	<div class="ca-list">
		<Row v-for="item in orderBy(rows,'int_day',-1)">
			<Col span="10" style="margin-left: 28px">{{item.int_day|int_date}} {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</Col>
			<Col span="10">{{item.total_lesson_hours}}课时 到课{{item.total_in_nums}}人</Col>
		</Row>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			rows: Array
		},
		data() {
			return {

			}
		}
	}
</script>