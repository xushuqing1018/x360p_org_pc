<style lang="less">
	.editor-container{
		position: relative;
	    min-height: 460px;
	    background: url(../../../../img/grid.png) 0 0!important;
	}
	.print-item{
		.print-item-del{
			position: absolute;
		    right: 0;
		    top: -15px;
		    cursor: pointer;
		}
		textarea{
		    position: absolute;
		    top: 0;
		    left: 0;
		    width: 100%;
		    height: 100% !important;
		    padding: 0;
		    padding-left: 3px;
		    margin: 0;
		    font-size: 12px;
		    line-height: 20px;
		    border: 0;
		}
	}
	.print-bg{
	    position: absolute;
		top: 0;
		left: 0;
		img{
		    display: inline-block;
		    border: none;
		    vertical-align: middle;
		}
	}
</style>
<template>
<div>
	<div class="row mt-3 m-0">
		<Input v-model="content.paper_width" class="col-sm-3">
	        <span slot="prepend">纸张宽度</span>
	        <span slot="append">mm</span>
	    </Input>
	    <Input v-model="content.paper_height" class="col-sm-3 ml-3">
	        <span slot="prepend">纸张高度</span>
	        <span slot="append">mm</span>
	    </Input>
		<c-upload
			v-model="content.print_bg"
			btn-text="更换单据背景图"
		>
		</c-upload>
    </div>
    <div class="mt-3">
	    <Select style="width:180px" @on-change="addItem" :label-in-value="true">			    	
	    	<OptionGroup label="系统变量">
	    		<Option v-for="(o,index) in fields.sys" :key="index" :value="'sys-'+o.field">{{o.text}}</Option>	
	    	</OptionGroup>
	    	<OptionGroup label="主要变量">
	    		<Option v-for="(o,index) in fields.bs" :key="index" :value="'bs-'+o.field">{{o.text}}</Option>	
	    	</OptionGroup>
	    	<OptionGroup label="列表变量">
	    		<Option v-for="(o,index) in fields.bm" :key="index" :value="'bm-'+o.field">{{o.text}}</Option>	
	    	</OptionGroup>
	    </Select>
	    <Select :value="currentItem.font_size" style="width:150px" @on-change="fontSize">
	    	<Option :value="0">字体大小</Option>
	    	<Option v-for="(item,index) in font_size_list" :key="index" :value="item">{{item}}</Option>
	    </Select>
	    <Select :value="currentItem.letter_spacing" style="width:150px" @on-change="letterSpacing">
	    	<Option :value="0">文字间距</Option>
	    	<Option v-for="(item,index) in letter_spacing_list" :key="index" :value="item">{{item}}</Option>
	    </Select>
	    <Button :type="currentItem.bold=='bold'?'primary':'ghost'" @click="bold">B</Button>
	    <Button :type="currentItem.italic=='italic'?'primary':'ghost'" @click="italic">I</Button>
    	左偏移：<InputNumber :max="1000" :min="0" v-model="_currentItem.left"></InputNumber>px
    	上偏移：<InputNumber :max="1000" :min="0" v-model="_currentItem.top"></InputNumber>px
    	宽：<InputNumber :max="1000" :min="0" v-model="_currentItem.width"></InputNumber>px
    	高：<InputNumber :max="1000" :min="0" v-model="_currentItem.height"></InputNumber>px
	</div>
	<div class="editor-container mt-3">
		<div class="print-bg">
			<img :src="content.print_bg">
		</div>
		<template v-for="(item,index) in content.items">
			<vue-draggable-resizable 
				v-if="!deleting"
				@resizestop="onResize"
				@dragstop="onDrag"
				@activated="setCurrentItemIndex(item,index)"
				:parent="true" 
				:resizable="true" 
				:minh="18"
				:minw="50"
				:w="item.width"
				:h="item.height"
				:x="item.left" 
				:y="item.top" 
				class="print-item"
				style="border: 1px solid">
				<Icon type="close" @click.native.stop.prevent="del(index)" class="print-item-del"></Icon>
				<textarea 
					:value="item.field" 
					readonly					
					:style="{lineHeight:item.height+'px',fontSize:item.font_size,letterSpacing:item.letter_spacing,fontStyle:item.italic,fontWeight:item.bold}"></textarea>					
			</vue-draggable-resizable>
		</template>
	</div>
	<div class="footer-btn mt-3">
		<Button type="primary" @click="save">保存</Button>
		<Button type="info" @click="print" class="ml-3">打印</Button>
	</div>
</div>
</template>
<script>
import Vue from 'vue'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'
import vueDraggableResizable from 'vue-draggable-resizable'
import cUpload from 'c%/cUpload.vue'

const emptyItem = {
	width: 140,
	height: 20,
	left: 0,
	top: 0,
	font_size: 0,
	letter_spacing: 0
}
export default{
	name:'printTplDesignerThree',
	mixins:[common,globals],
	props:{
		type: {
			type:[Number,String],
			default: 1
		}
	},
	components:{
		cUpload,
		vueDraggableResizable
	},
	data () {
		return {
			format:3,
			deleting:false,
			content: {
				items: [],
				paper_width: 150,
				paper_height: 150,
				print_bg: ''
			},
			pt_id: 0,				
			currentItem: {},
			currentItemIndex:-1,
			font_size_list: ['12px','14px','16px','18px','20px','22px','24px'],
			letter_spacing_list: ['0px','2px','4px','6px','8px','10px','12px','14px','16px']
		}
	},
	created(){
		this.init_content()
	},
	computed: {			
		_currentItem:{
			get: function () {
				return this.currentItem
			},
			set: function (value) {
				this.currentItem = value
			}			
		},
		upload_header(){
            return {
                'x-token':this.$store.state.user.token,
                'x-file-key':'file'
            }
        },
        upload_post(){
            return {
                mod:'lesson_cover_picture'
            }
        },
		fields(){
			return this.$store.state.gvars.print_tpls.default[this.type].fields
		}
	},
	methods:{
		print () {		
			this.print_preview.lprint(this.content)
		},
		
		bold () {
			if(this.currentItem.bold=='bold'){					
				this.currentItem.bold = 'normal'
			}else{
				Vue.set(this.currentItem,'bold','bold')
			}
		},
		italic () {
			if(this.currentItem.italic=='italic'){
				this.currentItem.italic = 'normal'
			}else{
				Vue.set(this.currentItem,'italic','italic')
			}
		},
		fontSize (val) {
			if(this.currentItem.font_size){					
				this.currentItem.font_size = val 
			}else{
				Vue.set(this.currentItem,'font_size', val=='0'?'inherit':val)
			}
		},
		letterSpacing (val) {
			if(this.currentItem.letter_spacing){					
				this.currentItem.letter_spacing = val 
			}else{
				Vue.set(this.currentItem,'letter_spacing', val)
			}
		},
		init_content () {
			let print_tpls = this.$store.state.gvars.print_tpls
			let list = print_tpls.list
			let content   = print_tpls.default[this.type][3].content
			
			if(list.length>0){
				let result = print_tpls.list.find(l=>(l.bid==0||l.bid==this.bid$)&&l.bill_type==this.type&&l.format==this.format)
				if(result) {
					this.pt_id  = result.pt_id
					content = result.json.content					
				}
			}
			content.print_bg = content.print_bg || '/static/img/printbg.jpg'			
			this.content = content
		},
		setCurrentItemIndex(item,index){
			this.currentItem = item
			this.currentItemIndex = index			
		},
		onResize (x, y, width, height) {
			let item = this.content.items[this.currentItemIndex]
			this.currentItem.width = width
			this.currentItem.height = height
	    },
	    onDrag (x, y) {
    	    let item = this.content.items[this.currentItemIndex]
	  		this.currentItem.left = x
			this.currentItem.top = y  	
	    },
		addItem (o) {
			let [field,type,text] = [o.value.split('-')[1],o.value.split('-')[0],o.label]
			let obj = util.copy(emptyItem)				
			let item = this.content.items.find(i=>i.field==field)			
			if(!item){
				obj.field = field
				obj.text = text
				obj.type = type
				this.content.items.push(obj)

				this.currentItem = obj				
			}				
		},
		del (index) {								
			this.deleting = true		
			this.$nextTick(()=>{
				this.currentItemIndex = -1
				this.content.items.splice(index,1)
				this.deleting = false
			})
		},
		save () {
			let params = {
				bid: this.bid$,
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
		jsonItems (type) {
			let print_tpls = this.$store.state.gvars.print_tpls
			if(print_tpls.list>0){
				let result = print_tpls.list.find(l=>l.bid==this.bid$&&l.bill_type==this.type&&l.format==this.format)
				if(result){
					return result.json.content.items.filter(i=>i.type==type)
				}
			}
			return print_tpls.default[this.type][3].content.items.filter(i=>i.type==type)
		}
	}

}
</script>