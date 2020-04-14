<template>
	<div>		
		<Select v-model="model" style="width: calc(100% - 80px);" @on-change="onChange">
			<Option :value="0">请选择</Option>
			<Option v-for="item in data" :value="item.th_id">{{item.name}}</Option>
		</Select>
		<Button type="ghost" icon="plus" @click="addInfo" class="ml-3"></Button>	
		<help-info ref="info"></help-info>
	</div>
</template>

<script>
	import helpInfo from './help-info.vue'
	
	export default{
		components: {
			helpInfo,
		},
		props: {
			value: {
				type: [String,Number],
				default: ()=>{
					return 0
				}	
			},
			selectType: {
				type: String,
				default: ()=>{
					return 'client'
				}
			}
		},
		data () {
			return {
				model: this.value,
			}
		},	
		watch: {
			value: function (val) {
				this.model = val
			}			
		},
		methods: {
			onChange (val) {
				this.$emit('input',val)
			},
			addInfo () {
				let map_type = {'client':'客户','employee':'人员','item':'项目'}
				
				this.$refs['info'].set('type',this.selectType)
				.show('添加【'+map_type[this.selectType]+'】','add')
			}
		},
		computed: {
			data () {
				let selectType = this.selectType,
					list = this.$store.state.gvars.tally_helps,
					result = []
				if(list.length>0){
					result = list.filter(t=>t.type==selectType)
				}
				return result
			}
		}
	}
</script>
