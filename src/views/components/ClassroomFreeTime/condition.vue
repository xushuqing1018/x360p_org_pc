<style lang="less">
	.free-time-condition {
		.prev {
			padding-right: 4px;
			cursor: pointer; 
		}
		.next {
			padding-left: 4px;
			cursor: pointer;
		}
	}
</style>
<template>
	<div class="free-time-condition filter-form">
		<select-class-room-two 
			v-model="crIds" 
			placeholder="请选择教室" 
			style="display:inline-block;width:300px">
		</select-class-room-two>
		<Checkbox 
			v-model="item.value" 
			class="ml-2" 
			v-for="item in period" 
			@on-change="changePeriod($event,item)">
			{{item.text}}
		</Checkbox>
		<div style="display:inline-block">
			<span class="prev" @click="prevWeek"><Icon type="chevron-left"></Icon></span>
			<span>{{yearWeekText}}</span>
			<span class="next" @click="nextWeek"><Icon type="chevron-right"></Icon></span>
		</div>
		<Button 
			class="ml-4" 
			type="primary" 
			@click="refresCondition">
			<Icon type="refresh"></Icon>重置
		</Button>
		<export-button 
			class="ml-2" 
			res="classroom_freetime"
			:params="exportParams"
			:error-msg="errorMsg">
		</export-button>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import SelectClassRoomTwo from 'c%/SelectClassRoomTwo.vue'
	import ExportButton from 'c%/ExportButton.vue'

	const EXPORT_ERROR_MSG = '请至少选择一间教室'

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectClassRoomTwo,
			ExportButton
		},
		props: {
			crIds: {
				type: [Number,String,Array],
				default:() => {
					return []
				}
			},
			date: {
				type: Date
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
			},
			exportParams: {
				type:Object,
				default:function(){
					return {}
				}
			}
		},
		data() {
			return {
				errorMsg: EXPORT_ERROR_MSG,
				period: [
					{
						value: true,
						text: '上午',
						label: 'a'

					},
					{
						value: true,
						text: '下午',
						label: 'p'
					},
					{
						value: true,
						text: '晚上',
						label: 'n'
					}
				]
			}
		},
		methods: {
			prevWeek() {
		    	this.$emit('on-week-change',{action:'prev'})
		    },
		    nextWeek() {
		    	this.$emit('on-week-change',{action:'next'})
		    },
		    refresCondition() {
		    	let apn = ['a','p','n']
		    	this.period.forEach(i => {
		    		if(!i.value) {
		    			i.value = true
		    		}
		    	})
		    	this.$emit('on-refresh',apn)
		    },
		    changePeriod(value,item) {
		    	let apn = []
		    	this.period.forEach(i => {
		    		if(i.value) {
		    			apn.push(i.label)
		    		}
		    	})
		    	if(apn.length == 0) {
		    		this.period.forEach(i => {
			    		if(i.label !== item.label) {
			    			i.value = true
			    			apn.push(i.label)
			    		}
			    	})
		    	}
		    	this.$emit('on-period-change',apn)
		    }
		},
		computed: {
			yearWeekText() {
				return util.sprintf("%s~第%s周",this.year,this.week)
			}
		}
	}
</script>