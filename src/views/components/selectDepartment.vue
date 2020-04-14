<template>	
    <div :class="classes">
    	<div @click="openModal">
	    	<slot>
		        <div
		            :class="[prefixCls + '-selection']"
		            ref="reference">
		            <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
		            <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder" style="line-height: 30px;">
		            	<template v-if="multiple">
							<Tag closable @on-close="del(item)" v-for="(item,index) in model" :key="index">
								{{item|dpt_name}}								
							</Tag>
						</template>
						<span v-else>
                            {{singleLabelText}}
                        </span>
		            </span>
		            <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-show="showCloseIcon" @click.native.stop="clearSelected"></Icon>
		            <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
		        </div>
	        </slot>
        </div>
        <select-department-modal
        	ref="department"
        	v-model="model"
            :rootAvailable="rootAvailable"
            @on-select="updateSelected">
        </select-department-modal>
    </div>
</template>

<script>
	import { oneOf, findComponentDownward } from '@/libs/assist';
	import SelectDepartmentModal from './SelectDepartmentModal.vue'
	import store from '@/store'
	import util from  '@/libs/util'
    import {_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	
	const prefixCls = 'ivu-select'
	
	export default{
		components: { SelectDepartmentModal },
		mixins: [globals],
		props: {
			value: {
                type: [String, Number, Array,Object],
                default: ''
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
            rootAvailable: {
                type: Boolean,
                default: false
            }
		},
		data () {
			return {
				prefixCls: prefixCls,
				model: this.value
			}
		},
		computed: {
            singleLabelText() {
                let org_name = this.$store.state.gvars.configs.params.org_name
                if(this.rootAvailable&&this.model===0) {
                    return org_name
                }
                return this.$filter('dpt_name')(this.model)
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

                    if(this.model == 0 && !this.rootAvailable){
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
		},
		methods: {
			openModal () {
				this.$refs['department'].show('选择部门','add')
			},
			updateSelected (selected) {
				this.$emit('input',this.model)
			},
			clearSelected () {
				if(this.multiple){
					this.model.splice(0,this.model.length)
				}else{
					this.model = 0
				}				
				
				this.$emit('input',this.model)
			},
			del (item) {
				let model = this.model
				if(this.multiple){
					let index = model.indexOf(item)
					if(index>-1){
						this.model.splice(index,1)					
					}	
				}else{
					this.model = 0
				}
				this.$emit('input',this.model)
			},
		}
		
	}
</script>

<style>
</style>