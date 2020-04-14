<template>
	<div :class="classes">
		<div :class="[prefixCls + '-selection']" class="text-over-elips" ref="reference" @click="openModal">
			<span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
            <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder" style="line-height: 30px;">{{ labelText }}</span>
                <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="showCloseIcon" @click.native.stop="clearSelected"></Icon>
            <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
            
            <Modal v-drag-modal v-model="modalShow" :mask-closable="false" :title="title" :width="modalWidth" >
                <table class="modal-table">
                    <tr>
                        <td colspan="2">
                            <div class="ivu-table-cell">
                                <div class="padder-sm pull-left" style="width:137px;">已选项：</div>
                                <div v-if="multiple" class="pull-left">
                                    <span class="ml-3" v-for="(item,index) in model" :key="index">{{label_dicts(item,'from')}}</span>
                                </div>
                                <span class="ml-3" v-else>{{label_dicts(model,'from')}}</span>
                            </div>
                        </td>                       
                    </tr>
                </table>
                <div style="max-height: 450px;overflow: auto">
                	<table class="modal-table">
                		<tr>
                			<template v-if="multiple">
    	            			<td class="b-r-0">
    	            				<div class="ivu-table-cell">
    	            					<Checkbox @on-change="checkAll" v-model="checkboxAll">全选</Checkbox>
    	            				</div>
    	            			</td>
    	            			<td>
    	            				<div class="ivu-table-cell">
    	            					<CheckboxGroup v-model="model" class="row">
    	            						<Checkbox v-for="(item,index) in dicts_from" :label="item.did" class="col-xs-4 col-sm-4 mt-2">{{item.title}}</Checkbox>	
    	            					</CheckboxGroup>            					
    	            				</div>
    	            			</td>
                			</template>
                			<td colspan="2" v-else>
                				<div class="ivu-table-cell">
                					<RadioGroup v-model="model" class="row">
                						<Radio v-for="(item,index) in dicts_from" :label="item.did" class="col-xs-3 col-sm-3 mt-2">{{item.title}}</Radio>
                					</RadioGroup>
                				</div>
                			</td>
                		</tr>
                	</table>
                </div>
            	
            	<div slot="footer">
            		<Button type="ghost" @click="cancel">取消</Button>            		
            		<Button type="primary" @click="ok">确定</Button>
            	</div>
            </Modal>
		</div>
	</div>
</template>

<script>
	import { oneOf, findComponentDownward } from '@/libs/assist';
	import common from '@/libs/common.mixin'
	import store from '@/store'
	import util from  '@/libs/util'
	
	const prefixCls = 'ivu-select'
	
	export default{
		name: 'DictionaryFrom',
		mixins: [common],
		props: {
			value: {
                type: [String, Number, Array],
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String
            },
            loading: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            notFoundText: {
                type: String
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            }
		},
		data () {
			return {
				prefixCls: prefixCls,
                labelText:'',
                checkboxAll: false,
				model: this.value,
				modalShow: false
			}
		},
		computed: {
			dicts_from () {
				return this.$store.state.gvars.dicts.from
			},
			modalWidth(){
                if(this.multiple){
                    return '900'
                }
                return '640'
            },
            multiple(){
                if(Array.isArray(this.model)){
                    return true
                }
                return false
            },
            classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-visible`]: this.visible,
                        [`${prefixCls}-disabled`]: this.disabled,
                        [`${prefixCls}-multiple`]: this.multiple,
                        [`${prefixCls}-single`]: !this.multiple,
                        [`${prefixCls}-show-clear`]: this.showCloseIcon,
                        [`${prefixCls}-${this.size}`]: !!this.size
                    }
                ];
            },
            showPlaceholder () {
                let status = false;

                if ((typeof this.model) === 'string') {
                    if (this.model === '' || this.model === '0') {
                        status = true;
                    }
                } else if (Array.isArray(this.model)) {
                    if (!this.model.length) {
                        status = true;
                    }
                } else if((typeof this.model) === 'number'){

                    if(this.model == 0){
                        status = true;
                    }
                } else if( this.model === null){
                    status = true;
                }

                return status;
            },
            localePlaceholder () {
                if (this.placeholder === undefined) {
                    return '请选择';
                } else {
                    return this.placeholder;
                }
            },
            showCloseIcon () {
                return  this.clearable && !this.showPlaceholder;
            },
            title () {
            	return '选择招生来源'
            }            
		},
		created () {
			this.updateLabelText()
		},
		methods: {
			label_dicts (did,type) {  
	        	let dicts = this.$store.state.gvars.dicts[type]
	        	if(dicts&&dicts.find(d=>d.did==did)){
	        		return dicts.find(d=>d.did==did).title
	        	}	        	
	        	return ''
	        },
			openModal () {
                if (this.disabled) {
                    return false;
                }
                this.modalShow = !this.modalShow;
            },
            checkAll (checked) {
            	this.model = []
            	if(checked){
            		this.dicts_from.forEach(d=>{
            			this.model.push(d.did)
            		})
            	}
            },
            ok () {
            	this.modalShow = false            	
            	this.updateLabelText()
            	this.$emit('input',this.model)
            	this.dispatch('FormItem', 'on-form-change', this.model);
            },
            cancel () {
            	this.modalShow = false
            },
            clearSelected () {               
            	if (this.multiple) {
                    if(this.model.length > 0){
                        this.model.splice(0,this.model.length)
                    }
                }else{
                    this.model = 0
                }        
                this.$emit('input',this.model)
                this.dispatch('FormItem', 'on-form-change', this.model);
            },
            updateLabelText () {
            	this.labelText = ''
            	
            	if(this.multiple){
            		if(this.model.length>0){
	            		this.model.forEach(d=>{
	            			this.labelText += this.label_dicts(d,'from')+','
	            		})
	            		this.labelText = this.labelText.substring(0,this.labelText.length-1)
	            	}
            	}else{
            		if(this.model){
            			this.labelText += this.label_dicts(this.model,'from')
            		}
            	}            	
            }
		},
		watch: {
            value: function (val) {
                this.model = val
                this.updateLabelText()
            },
            model: function (val) {
            	if(val.length===this.dicts_from.length){
            		this.checkboxAll = true
            	}else{
            		this.checkboxAll = false
            	}            	
            }
        }
	}
</script>

<style>
</style>