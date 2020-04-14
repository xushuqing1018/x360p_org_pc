<style lang="less">
	.remain-lesson-hour {
		position: relative;
		min-height: 700px;
		.box-table {
			margin-left: 365px;
			.box-query {
				position: relative;
				.summary-btn {
					position: absolute;
					right: 10px;
					top: 20px;
				}
			}
		}
		.box-condition {
			position: absolute;
			width: 350px;
			top: 0;
			left: 0;
			padding: 5px;
			.condition-head {
				height: 25px;
				line-height: 25px;
				border-bottom: 1px solid #ccc;
				color: #000;
				font-weight: 700;
				padding-left: 5px;
				padding-right: 5px;
			}
			.filter-input {
				margin: 5px 0;
			}
			.lesson-class {
				padding-left: 10px;
				.lessons .lesson-item {
					font-size: 14px;
					padding: 2px;
					.lesson-name {
						cursor: pointer;
						&.active {
							color: #19be6b;
						}
					}
				}
				.classes {
					padding-left: 10px;
					.class-item {
						position: relative;
						padding: 2px;
						background-image: url("/src/style/xtree/32px.png");
    					background-position: -292px -4px;
    					background-repeat: no-repeat;
    					transition: all .3s ease-in-out;
    					&:last-child {
    						background: transparent;
    					}
    					.class-name {
    						padding-left: 24px;
    						cursor: pointer;
    						&.active {
    							color: #03a9f3;
    						}
    					}
					}
				}
				.tree-icon.tree-ocl {
					position: absolute;
					width: 24px;
					height: 24px;
					top: 0;
					left: 0;
					background-image: url("/src/style/xtree/32px.png");
					background-position: -68px -4px;
				}
			}
		}
	}
</style>
<template>
	<div class="remain-lesson-hour">
		<filter-condition @on-change="selectCondition"></filter-condition>
		<hour-table ref="ref_table" :condition="condition" @on-change="viewSummary"></hour-table>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import HourTable from './remainlessonhour/hour-table.vue'
	import FilterCondition from './remainlessonhour/filter-condition.vue'

	export default {
		mixins: [grid,common],
		components: {
			HourTable,
			FilterCondition
		},
		data() {
			return {
				condition: {}
			}
		},
		methods: {
			selectCondition(data) {
				this.condition = data
			},
			viewSummary() {
				this.$emit('on-change')
			}
		}
	}
</script>