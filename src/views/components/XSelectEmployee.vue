<template>
    <div :class="classes">
    	<div @click="openModal">
	    	<slot>
		        <div
		            :class="[prefixCls + '-selection']"
		            ref="reference">
		            <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
		            <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder">{{ labelText }}</span>
		            <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="showCloseIcon" @click.native.stop="clearSelected"></Icon>
		            <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
		        </div>
	        </slot>
        </div>    
    </div>
</template>
<script>
import common from '@/libs/common.mixin'
import { oneOf, findComponentDownward } from '@/libs/assist'
import store from '@/store'
import util from  '@/libs/util'

const prefixCls = 'ivu-select'
const resName   = 'employee'
const idField   = 'eid'
const textField = 'ename'
const recordName = '老师'
const unit       = '个'

export default {
        name: 'SelectEmployee',
        mixins: [ common ],
        props: {
            value: {
                type: [String, Number, Array],
                default: 0
            },
            mode: {
            	type: String,
            	default: 'employee'
            },
            rid: {
            	type: Number,
            	default: 0
            },
            did: {
            	type: Number,
            	default: 0,
            },
            disabled: {
                type: Boolean,
                default: false
            },
            readonly:{
                type:Boolean,
                default:false
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
            },
            limitPer: {
                type: Boolean,
                default: true
            },
            startDate: {
                type: String,
                default: function() {
                    return moment().format('YYYY-MM-DD')
                }
            },
            endDate: {
                type: String,
                default: function() {
                    return ''
                }
            },
            intHours: {
                type:Array,
                default(){
                    return []
                }
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                modalShow: false,
                options: [],
                optionInstances: [],
                labelText:'',
                model: this.value
            };
        },
        computed: {
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
                if(this.rid==0){
                    return '选择员工'
                }else if(this.rid===1){
            		return '选择'+this.$filter('translate')('老师')
            	}else if(this.rid===2){
            		return '选择'+this.$filter('translate')('助教')
                }else if(this.rid == 4){
                    return '选择'+this.$filter('translate')('学管师')
                }else if(this.rid == 7){
                    return '选择'+this.$filter('translate')('咨询师')
            	}else if(this.rid == 8){
                    return '选择'+this.$filter('translate')('市场专员')
                }else if(this.rid == 101){
                    return '选择'+this.$filter('translate')('渠道销售')
                }else if(this.rid == 102){
                    return '选择'+this.$filter('translate')('督导')
                }else if(this.did>0){
            		return '选择员工与角色'
            	}else{
                    return '选择员工'
                }
            }
            
        },
        methods: {
            openModal () {
                if (this.disabled || this.readonly) {
                    return false;
                }
               this.$Modal.open('components/XSelectEmployeeModal.vue@modal',{
                    props:{
                        multiple:this.multiple,
                        selected:this.model,
                        width:this.modalWidth,
                        did:this.did,
                        rid:this.rid,
                        title:this.title,
                        mode:this.mode,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        'int-hours':this.intHours,
                        'limit-per':this.limitPer
                    },
                    on:{
                        'on-select':(e)=>{
                            this.updateSelected(e)
                        }
                    }
                }).then(modal=>{
                    modal.show()
                })
            },
            updateSelected({selected,sale_role_did}){  
                         	
                if(this.multiple){
                    if(this.model.length > 0){
                        this.model.splice(0,this.model.length)
                    }
                    selected.forEach(item=>{
                        this.model.push(item[idField])
                    })
                }else{
                    this.model = selected[idField]
                    if(this.did>0&&sale_role_did){
//                  	this.model = { eid:selected[idField],sale_role_did:sale_role_did }
                    	this.$emit('onChange',{ eid:selected[idField],sale_role_did:sale_role_did })
                    }
                }
                this.updateLabelText()                
                
                if(this.mode=='user'){
                	this.getEmployeeUid()
                	.then(result=>{                		
		                this.$emit('input',result)
		                this.$emit('select',result)	
                	})
                }else{
	                this.$emit('input',this.model)
	                this.$emit('select',this.model)
                }
                this.$emit('on-selected',selected)
                this.dispatch('FormItem', 'on-form-change', this.model)
            },
            getEmployeeUid () {
            	let model = this.model,
            		result = 0
            	
            	let promises = []            	
            	            	
            	if(this.multiple){
            		if(model.length){
            			result = []
            			model.forEach(m=>{
            				promises.push(
            					this.$store.dispatch('getMapObject',{
			            			id:m,
			                        name:resName,
			                        idf:idField,
			                        txf:textField
			            		}).then(data=>{
			            			this.model.push(data.uid)
			            		})
		            		)
            			})
            		}            		
            	}else{
            		promises.push(
            			this.$store.dispatch('getMapObject',{
	            			id:model,
	                        name:resName,
	                        idf:idField,
	                        txf:textField
	            		}).then(data=>{            			
	            			result = data.uid
	            		})
            		)            		
            	}
            	
            	return new Promise((resolve,reject)=>{
            		Promise.all(promises).then(()=>{						
	            		resolve(result)	            		
	            	},()=>{
	            		reject()
	            	})
            	})
            	
            },
            updateLabelText(){
                if(this.multiple){
                    if(this.model.length > 0 && this.model[0] > 0){
                        this.$store.dispatch('getMapText',{
                            id:this.model[0],
                            name:resName,
                            idf:idField,
                            txf:textField
                        }).then(text=>{
                            let txt = text
                            if(this.model.length > 1){
                                txt += '等'+this.model.length+unit+recordName
                            }
                            this.labelText = txt
                        })
                    }else{
                        this.labelText = ''
                    }   
                }else{                	
                	if(this.did>0){
                		if(this.model[idField]>0){
                			this.$store.dispatch('getMapText',{
	                            id:this.model[idField],
	                            name:resName,
	                            idf:idField,
	                            txf:textField
	                        }).then(text=>{
	                            this.labelText = text
	                        })   
                		}
                	}
                    else if(this.model){  	
                        this.$store.dispatch('getMapText',{
                            id:this.model,
                            name:resName,
                            idf:idField,
                            txf:textField
                        }).then(text=>{
                            this.labelText = text
                        })                      
                    }else{
                       this.labelText = ''
                    }
                }
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
                this.dispatch('FormItem', 'on-form-change', this.model)
            },
           
        },
        created(){
            this.model = this.value
            if(!this.showPlaceholder){
                this.updateLabelText()
            }
        },
        mounted () {
        	
        },
        watch: {
            value (val) {
            	if(this.mode!='user'){
	                this.model = val;
	                this.updateLabelText()
                }
            }
        }
    };
</script>