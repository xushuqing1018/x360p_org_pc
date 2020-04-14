<template>
	<div class="c-grid row questionnaire">
		<div class="col-sm-3" style="padding-right:0">
			<list 
				ref="list" 
				@on-select="select" 
				@on-add="refreshItems"
				@on-clear="clearItems">
			</list>
		</div>
		<div class="col-sm-9">
			<items ref="items" :questionnaire="item"></items>
		</div>
	</div>
</template>
<script>
	import List from './questionnaire/list.vue'
	import Items from './questionnaire/items.vue'
	export default {
		components: {
			List,
			Items
		},
		data() {
			return {
				item: {}
			}
		},
		methods: {
			select(item) {
				this.item = item
			},
			refreshItems() {
				this.$refs.items.init_data()
			},
			clearItems() {
				this.$refs.items.clearData()
			}
		},
		computed: {

		}
	}
</script>
<style lang="less">
	.questionnaire {
		&-list {
			position: relative;
			.condition-filter {
				margin-right: 25px;
			}
			>.ivu-btn {
				position: absolute;
				top: 5px;
				right: 0;
			}
			a>.ivu-btn-group {
				float: right;
			}
			.selected>.ivu-btn-group .ivu-btn-text {
				color: #fff;
			}
		}
		&-items {
			&.no-items {
				background: url('http://s1.xiao360.com/nothing-notice.png') no-repeat center;
			}
			&::-webkit-scrollbar {
				display: none;
			}
		}
		&-item {
			background: #fff;
			box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .03), 
						0 1px 4px 0 rgba(0, 0, 0, .048), 
						0 3px 1px -2px rgba(0, 0, 0, .12);
			border-radius: 2px;
			margin: 10px auto;
			padding: 15px;
			position: relative;
			&:first-child {
				margin-top: 0;
			}
			p {
				display: inline-block;
			}
			.choices {
				margin-top: 10px;
				margin-left: 20px;
				.choice {
					margin-right: 26px;
				}
				label {
					margin-bottom: 0;
				}
			}
			.btn-wrapper {
				position: absolute;
				top: 5px;
				right: 5px;
			}
		}
	}
</style>