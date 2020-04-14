<template>
	<Card>
		<p slot="title">效果预览</p>					
		<div class="x-container" v-if="tab==1">
			<div class="bg-header">
				<img :src="config.banner"/>
			</div>
			<div class="x-content">
				<div class="x-form">
					<div class="form-title">
						{{config.title}}
						<p class="desc">
							{{config.desc}}
						</p>
					</div>
					<div class="form-body">
						<div class="form-item">
							<label class="form-item-label">姓　　名:</label>
							<div class="form-item-content">
								<input class="x-input" readonly placeholder="请输入姓名" />
							</div>
						</div>
						<div class="form-item">
							<label class="form-item-label">性　　别:</label>
							<div class="form-item-content text-left">
								<span class="x-radio checked">
									<span class="x-radio-icon"></span>
									<span class="x-radio-label">男</span>								
								</span>
								<span class="x-radio">
									<span class="x-radio-icon"></span>
									<span class="x-radio-label">女</span>
								</span>
							</div>
						</div>
						<div class="form-item">
							<label class="form-item-label">电话号码:</label>
							<div class="form-item-content">
								<input class="x-input" readonly placeholder="请输入电话号码"/>
							</div>
						</div>
						<div class="form-item text-left mt-1" v-for="item in config.must_fields" v-if="item.enable">
							<label class="form-item-label">{{item.label}}:</label>
							<div class="form-item-content">
								<input :value="item.default_value" class="x-input" readonly :placeholder="item.placeholder"/>
							</div>
						</div>
						<div class="mt-3 mb-2" v-if="enableFieldsList.length>0">
							<p class="x-divider">
								<span>以下选填</span>
							</p>
						</div>
						<div class="form-item text-left mt-1" v-for="item in config.fields" v-if="item.enable">
							<label class="form-item-label">{{item.label}}:</label>
							<div class="form-item-content">
								<template v-if="!is_option_field(item.field)">
								<input :value="item.default_value" class="x-input" readonly :placeholder="item.placeholder"/>
								</template>
								<template v-else>
									<template v-if="option_fields[item.field].type=='date'">
										<DatePicker 
											type="date" 
											:value="item.default_value"
											@on-change="item.value = $event" 
											format="yyyy-MM-dd"
											placeholder="选择日期" 
											style="width:100%">
										</DatePicker>
									</template>
									<template v-if="option_fields[item.field].type=='number'">
										<InputNumber v-model="item.default_value"></InputNumber>
									</template>
									<template v-if="option_fields[item.field].type == 'textarea'">
										<Input v-model="item.default_value" type="textarea" :placeholder="item.placeholder"></Input>
									</template>
									<template :label="item.label" class="col-sm-4" v-if="option_fields[item.field].type =='select'">
										<Select v-model="item.default_value">
											<Option v-for="option in option_fields[item.field].options" :value="option">{{option}}</Option>
										</Select>
									</template>
									<template v-else>
										<input :value="item.default_value" class="x-input" readonly :placeholder="item.placeholder"/>
									</template>
								</template>
							</div>
						</div>
						<Button class="x-btn-submit" type="primary" long>提交</Button>
					</div>
				</div>
				<img :src="config.logo" class="logo" style="max-width:140px;max-height:40px">
			</div>
		</div>
		
		<div class="x-container" v-else>
			<div class="x-msg-container">
				<div class="icon-area">							
					<img src="/static/img/org/wxicon-success.png">
				</div>
				<div class="text-area">
					<h2 class="title">{{config.msg.title}}</h2>
					<p class="desc">{{config.msg.description}}</p>
				</div>
				<Button class="mt-3" type="primary" long>（5s后自动跳转） 确定</Button>
			</div>
		</div>
	</Card>
</template>

<script>
	export default{
		props: {
			config: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			tab: {
				type: String,
				default: '1'
			}
		},
		data () {
			return {
				tabValue: this.value,
				option_fields:{}
			}
		},
		mounted(){
			this.init_option_fields()
		},
		methods:{
			is_option_field(field){
				return /f[1-9]0?/.test(field)
			},
			init_option_fields(){
				this.option_fields = {}
				let default_value = function(type){
					if(type == 'number'){
						return 0
					}else if(type == 'date'){
						return new Date()
					}
					return ''
				}
				let option_fields = this.$store.state.gvars.configs.mcl_option_fields
				for(let i=0;i<option_fields.length;i++){
					let item = option_fields[i]
					this.option_fields[item.name] = {
						label:item.label,
						type:item.type,
						field:item.name,
						value:default_value(item.type),
						options:item.option_values
					}
				}
			}
		},
		computed: {
			enableFieldsList () {
				return this.config.fields.filter(f=>f.enable)	
			},
		}
	}
</script>

<style lang="less" scoped>
@import url("./qrsign.less");
</style>