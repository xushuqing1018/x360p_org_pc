<template>
	<tbody>
		<tr>
			<td rowspan="4" width="100px">{{data.ename}}</td>
			<td colspan="7" class="p-0"></td>
		</tr>
		<tr v-show="showA" style="background:#3399ff3b">
			<td width="41px">上午</td>
			<td colspan="7">
				<table-inner :data="data.AM" :type="type"></table-inner>
			</td>
		</tr>
		<tr v-show="showP" style="background:#3399ff69">
			<td width="41px">下午</td>
			<td colspan="7">
				<table-inner :data="data.PM" :type="type"></table-inner>
			</td>
		<tr v-show="showN" style="background:#3399ff94">
			<td width="41px">晚上</td>
			<td colspan="7">
				<table-inner :data="data.NM" :type="type"></table-inner>
			</td>
		</tr>
	</tbody>
</template>
<script>
	import TableInner from './table-inner.vue'

	export default {
		components: {
			TableInner
		},
		props: {
			type: {
				type: String,
				default:''
			},
			data: {
				type: Object,
				default:()=>{
					return {}
				}
			},
			apn:{
				type: Array,
				default:() => {
					return ['a','p','n']
				}
			}
		},
		computed: {
			showA() {
				return this.apn.indexOf('a') > -1
			},
			showP() {
				return this.apn.indexOf('p') > -1
			},
			showN() {
				return this.apn.indexOf('n') > -1
			}
		}
	}
</script>