<template>
	<div :class="classes" v-clickOut="handleClose" style="position:relative">
        <div @click="openPanel">
            <slot>
        		<div
                    :class="[prefixCls + '-selection']"
                    ref="reference"
                    >
                    <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
                    <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder" style="line-height: 30px;">{{ labelText }}</span>
                    <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="showCloseIcon" @click.native.stop="clearSelected"></Icon>
                    <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
                </div>
            </slot>
        </div>
        <select-time-section-dropdown 
            ref="ts_dropdown"
            v-show="opened" 
            :date="date" 
            :selected="model"
            :placement="placement"
            @on-select="select"
            @on-ok="confirm"
            @on-clear="cancel"
            >
        </select-time-section-dropdown>
	</div>
</template>
<script>
	import SelectTimeSectionDropdown from 'c%/SelectTimeSectionDropdown.vue'
	import directive from '@/libs/directive.mixin'
	const prefixCls = 'ivu-select';
	export default {
		name: 'SelectTimeSection',
		mixins: [directive],
		components: {
            SelectTimeSectionDropdown
        },
		props:{
			value: {
                type: [String, Number, Array],
                default: ''
            },
			date: {
				type: [String,Number],
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
            filterable: {
                type: Boolean,
                default: false
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            readonly: {
                type: Boolean,
                default: false
            },
            placement: {
                type: String,
                default: 'left'
            }
		},
		data() {
			return {
				prefixCls: prefixCls,
				model: this.value,
				labelText: '',
				opened: false
			}
		},
		methods: {
			openPanel() {
				if(!this.disabled&&!this.readonly){
					this.opened = !this.opened
                }
			},
			handleClose() {
				this.opened = false
			},
            confirm() {
                this.handleClose()
            },
            cancel() {
                this.clearSelected()
                this.handleClose()
            },
            select(item) {
                if(item.int_start_hour !== '') {
                    this.labelText = item.int_start_hour + '~' + item.int_end_hour
                    this.model = this.labelText.split('~')
                    this.handleClose()
                }else{
                    this.labelText = ''
                    this.model = []
                }
                this.$emit('input',this.model)
                this.$emit('on-change',this.model)
            },
            updateLabelText() {
                if(this.model.length>0) {
                    this.labelText = this.model[0] + '~' + this.model[1]
                }else{
                    this.labelText = ''
                }
            },
            clearSelected () {
                this.model = []
                this.$emit('input',this.model)
                this.$emit('on-change',this.model)
            }
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
                this.model = val;
                this.updateLabelText()
            }
        },
		computed: {
			classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-disabled`]: this.disabled,
                        [`${prefixCls}-single`]: true,
                        [`${prefixCls}-show-clear`]: this.showCloseIcon,
                        [`${prefixCls}-${this.size}`]: !!this.size
                    }
                ]
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
                return this.clearable && !this.showPlaceholder && !this.readonly;
            }
		}
	}
</script>