<template>
	<div :class="wrapClasses">
		<div :class="inputClasses">
			<label style="line-height: 25px;">{{labelText}}</label>		

			<i class="ivu-icon" style="top:0" :class="['ivu-icon-ios-close', prefixCls + '-icon', prefixCls + '-icon-clear' , prefixCls + '-icon-normal']" v-if="clearable" @click="handleClear"></i>
		</div>
		 
		<div :class="[prefixCls + '-group-append']" v-show="slotReady">
			<Dropdown class="x-drop-menu">
				<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
		        <DropdownMenu slot="list">
		            <DropdownItem @click.native="chooseStudent">所有学员</DropdownItem>
		            <DropdownItem @click.native="chooseAbnormalStudent">异常学员</DropdownItem>
		        </DropdownMenu>
		    </Dropdown>
		</div>
		
		<select-student class="hide" ref="student" @on-selected="setSid" :value="model"></select-student>
		<select-abnormal-student ref="abnormalStudent" @on-selected="setSid" :sid="value"></select-abnormal-student>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectAbnormalStudent from './abnormal-student.vue'

	const prefixCls = 'ivu-input'

	export default{
		mixins: [ common ],
		components: {
			SelectStudent,
			SelectAbnormalStudent
		},
		props: {
			value: {
				type: [String,Number],
				default: 0
			},
			action: {
				type: String,
				default: 'add'
			},
			size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            clearable: {
            	type: Boolean,
                default: false
            }
		},
		data () {
			return {
				prefixCls: prefixCls,
				model: this.value,
				tags: [],
				slotReady: false,
				labelText: ''
			}
		},
		watch: {
			tags: function (val) {
				this.$emit('input',this.model)
			},
			value: function (val) {
				this.model = val
				if(val==0){
					this.labelText = ''
				}
			}
		},
		created () {
			
		},
		computed: {
			wrapClasses () {
                return [
                    `${prefixCls}-wrapper ${prefixCls}-group ${prefixCls}-group-with-append ${prefixCls}-hide-icon`,
                    {
                        [`${prefixCls}-wrapper-${this.size}`]: !!this.size,
                        [`${prefixCls}-type`]: this.type,
                        [`${prefixCls}-group-${this.size}`]: this.append && !!this.size,
                    }
                ];
            },
            inputClasses () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-${this.size}`]: !!this.size,
                        [`${prefixCls}-disabled`]: this.disabled
                    }
                ];
            },
		},
		methods: {
			setSid (obj) {
				this.labelText = obj.student_name
				this.model = obj.sid
				
				this.$emit('input',this.model)				
			},
			handleClear () {
				this.model = 0
			},
			chooseStudent () {
				this.$r('student').openModal()
			},
			chooseAbnormalStudent () {
				this.$r('abnormalStudent').show('选择学员','add')
			}
		},
		mounted () {
			this.slotReady = true
		}

	}
</script>

<style>
.x-drop-menu .ivu-select-dropdown{
	z-index: 7999;
}
</style>