<template>
	<div class="x-multiple-select-container">
		<div class="x-multiple-select inline">
			<template v-for="(item,index) in model.sids">
				<Tag class="select-item" closable @on-close="delSid(item)">{{getMapText(item,'student')}}</Tag>				
			</template>
			<template v-for="(item,index) in model.cu_id">
				<Tag class="select-item" closable @on-close="delCuId(item)">{{getMapText(item,'customer')}}</Tag>				
			</template>
			<i class="ivu-icon" style="top:0" :class="['ivu-icon-ios-close', prefixCls + '-icon', prefixCls + '-icon-clear' , prefixCls + '-icon-normal']" @click="handleClear"></i>
		</div>
		 
		<div class="x-multiple-select-after" v-show="slotReady">
			<Dropdown class="x-drop-menu">
				<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
		        <DropdownMenu slot="list">
		            <DropdownItem @click.native="chooseCustomer">意向客户</DropdownItem>
		            <DropdownItem @click.native="chooseStudent">正式学员</DropdownItem>
		        </DropdownMenu>
		    </Dropdown>
		</div>
		<div class="hide">
			<select-customer ref="selectCustomer" v-model="model.cu_id"></select-customer>
			<select-student ref="selectStudent" v-model="model.sids"></select-student>
		</div>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const prefixCls = 'ivu-input'

	export default{
		mixins: [ common ],
		components: {
			SelectStudent,
			SelectCustomer
		},
		props: {
			value: {
				type: Object,
				default: ()=>{
					return {
						sids: [],
						cu_id: []
					}
				}
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
				slotReady: false
			}
		},
		watch: {
			tags: function (val) {
				this.$emit('input',this.model)
			},
			value: function (val) {
				this.model = val
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
			delCuId (id) {
				let index = this.model.cu_id.indexOf(id)
				if(index > -1){
					this.model.cu_id.splice(index,1)
				}
			},
			delSid (id) {
				let index = this.model.sids.indexOf(id)
				if(index > -1){
					this.model.sids.splice(index,1)
				}
			},
			chooseCustomer () {
				this.$refs['selectCustomer'].openModal()
			},
			chooseStudent () {
				this.$refs['selectStudent'].openModal()
			},
			handleClear () {
				this.model.sids = []
				this.model.cu_id = []
			},		
			getMapText(id,name) {
				let result = this.$store.getters.getMapText(id,name)
				return this.$store.getters.getMapText(id,name)
			},	
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