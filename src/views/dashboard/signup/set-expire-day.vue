<template>
	<Poptip title="开始日期" placement="left">
		<Icon 
			class="fun-icon" 
			type="ios-calendar-outline"
			title="点击设置开始日期"
			>
		</Icon>
		<ul class="date-list" slot="content">
			<li 
				:class="{active: active==item.id}"
				v-for="item in usable_items" 
				@click="setExpireTime(item)">
				<span :title="item.item_name">{{item.item_name}}：</span>
				<span>{{item.expire_time}}</span>
			</li>
		</ul>
	</Poptip>
</template>
<script>
	import moment from 'moment'
	export default {
		props: {
			item: Object,
			list: Array,
			paidTime: String
		},
		data() {
			return {
				active: 0
			}
		},
		methods: {
			setExpireTime(item) {
				this.active = item.id
				let start = item.expire_time
				let origin_expire_time = this.item._data.origin_expire_time
				let days  = moment(origin_expire_time).diff(moment(),'days')
				if(days) {
					this.item.expire_time = moment(start).add(days+1,'days').format('YYYY-MM-DD')
				}
			}
		},
		computed: {
			usable_items() {
				let ret = []
				ret = this.list.filter(l => l.id !== this.item.id && l.expire_time !== '')
				ret.push({
					item_name: '报名日期',
					expire_time: this.paidTime,
					id: 0
				})
				return ret
			}
		}
	}
</script>
<style lang="less" scoped>
	.date-list {
		li {
			padding: 4px;
			cursor: pointer;
			>span:last-child {
				float: right;
			}
			>span:first-child {
				display: inline-block;
				width: 100px;
				overflow: hidden;
				text-overflow:ellipsis;
				white-space: nowrap;
			}
			&:hover {
				background: #eee;
			}
			&.active {
				background: #39f !important;
				color: #fff;
			}
		}
	}
</style>