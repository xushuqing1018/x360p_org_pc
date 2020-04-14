<template>
	<div class="c-grid">
		<div 
		v-for="(item,key) in config" 
		:key="key" 
		>
			<Card 
			v-if="key == 'xinyichen' || is_gm"
			dis-hover 
			class="mb-2">
				<div slot="title" class="row">
					<div class="col-md-8">
						<strong>{{item.name}}</strong>
						
					</div>
					<div class="col-md-4">
						<i-switch 
							:true-value="1" 
							:false-value="0" 
							v-model="item.enable" 
							>
						</i-switch>
						<a class="ivu-btn ivu-btn-default" target="_blank" :href="item.site">前往申请</a>
					</div>
				</div>
				<Form :label-width="140" v-if="item.enable">	
					<Form-item :label="lablelName(key)" v-for="(val,key) in item.params" :key="key">
						<Input 
							v-model="item.params[key]" 
							class="x-ivu-input"
							placeholder="请输入..."
							style="width:200px"
							>
						</Input>
					</Form-item>	
				</Form>
			</Card>
		</div>
		<Button type="primary" class="mt-3" @click="handleSubmit">保存配置</Button>
		<Button type="default" class="mt-3 m-l" @click="restoreDefault" v-if="cfg_id > 0">恢复默认</Button>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,config,globals],
		components: {
		},
		data () {
			return {
				cfg_name: 'sms_clound',
				config: util.copy(this.$store.state.gvars.sms_clound)
			}
		},
		methods: {
			lablelName(k){
				let arr = k.split('_')
				let s = []
				arr.forEach(a=>{
					s.push(a.substr(0,1).toUpperCase()+a.substr(1))
				})
				return s.join(' ')
			}
		}
	}
</script>