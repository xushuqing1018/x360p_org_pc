<template>
<div class="mt-3 row">
	<div class="col-sm-3">
		<Card dis-hover class="x-ivu-card">
			<span slot="title">可用变量</span>
			<a href="#" slot="extra" @click.prevent="setCustomizeFields">
	            自定义变量
	        </a>
			<div class="p-0">
				<ul class="x-field" v-if="type<4">
					<li class="title">系统变量</li>
					<li v-for="(item,index) in fields.sys">
						<span 
						draggable="true"
						@dragstart="setCopyData($event,item,'sys')" 
						@dragend="clearCopyData"
						>
						<em>{{sys.</em>
						{{item.field}}
						<em>}}</em>
						</span>
						<code>{{item.text}}</code>
					</li>
					<li class="title">基础变量</li>
					<li v-for="(item,index) in fields.bs">
						<span 
						draggable="true"
						@dragstart="setCopyData($event,item,'bs')" 
						@dragend="clearCopyData"
						>
						<em>{{bs.</em>
						{{item.field}}
						<em>}}</em>
						</span>
						<code>{{item.text}}</code>
						
					</li>
					<li class="title">列表变量</li>
					<li v-for="(item,index) in fields.bm">
						<span 
						draggable="true"
						@dragstart="setCopyData($event,item,'item')" 
						@dragend="clearCopyData"
						>
						<em>{{item.</em>
						{{item.field}}
						<em>}}</em>
						</span>
						<code>{{item.text}}</code>
					</li>
				</ul>
				<ul class="x-field" v-else>
					<template v-for="(item,key) in fields">
						<li class="title">{{item.name}}</li>
						<li v-for="(field,index) in item.fields">
							<span 
							draggable="true"
							@dragstart="setCopyData($event,field,key)" 
							@dragend="clearCopyData"
							>
							<em>{{<span>{{key}}</span>.</em>
							{{field.field}}
							<em>}}</em>
							</span>
							<code>{{field.text}}</code>
						</li>
					</template>
				</ul>
			</div>
		</Card>				
	</div>
	<div class="col-sm-9">
		<umeditor
		:config="{initialFrameWidth:320}"
		v-model="content"
		>
		</umeditor>	
	</div>
	<div class="footer-btn mt-3 pl-3">
		<Button type="primary" @click="save">保存</Button>
		<Button type="info" @click="printView" class="ml-3">打印预览</Button>
	</div>
</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'
import Umeditor from 'c%/UmEditor'

export default{
	name:'printTplDesignerTwo',
	mixins:[common,globals],
	props:{
		type: {
			type:[Number,String],
			default: 1
		}
	},
	components:{
		Umeditor
	},
	data(){
		return {
			format:2,
			content:''
		}
	},
	created(){
		this.init_content()
	},
	computed: {			
		fields(){
			return this.$store.state.gvars.print_tpls.default[this.type].fields
		}
	},
	methods:{
		printView () {		
			this.print_preview
			.set('info',this.content)
			.set('width',280)
			.set('type',this.type)
			.printView()	
		},
		init_content () {
			let print_tpls = this.$store.state.gvars.print_tpls
			let list = print_tpls.list
			let content   = print_tpls.default[this.type][2].content
			if(list.length>0){					
				let result = print_tpls.list.find(l=>(l.bid == 0 || l.bid==this.bid$)&&l.bill_type==this.type&&l.format==this.format)
				if(result) {
					this.pt_id      = result.pt_id
					content         = result.json.content
				}
			}
			this.content = content
		},
		save () {
			let params = {
				bid: 0,
				bill_type: this.type,
				format: this.format,
				is_default:1,
				json: {
					content: this.content
				}
			}
			let [method,uri,msg] = ['post','print_tpls','设置成功']
			if(this.pt_id>0){
				[method,uri,msg] = ['put','print_tpls/'+this.pt_id,'修改成功']
			}
			this.$rest(uri)[method](params)
			.success(data=>{
				this.$store.dispatch('updateGlobalVar','print_tpls')
				.then(data=>{
					this.init_content
				})
				
				this.$Message.success('保存成功')
			}).error(response=>{
				this.error(response.body.message||'保存失败')
			})
		},
		setCopyData(e,item,ns){
			e.dataTransfer.setData('text','{{'+ns+'.'+item.field+'}}')
		},
		clearCopyData(e){
			e.dataTransfer.clearData('text')
		},
		setCustomizeFields() {
			this.$Modal.open('system/configs/print/customize-field-modal.vue')
			.then(modal => {
				modal.show('自定义变量')
			})
		}
	}
}
</script>