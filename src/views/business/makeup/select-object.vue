<template>
	<div class="x-multiple-select-container">
		<div class="x-multiple-select inline">
			<template v-for="(item,index) in model.sa_ids">
				<Tag class="select-item" closable @on-close="delSaid(item)">{{getStudentName(item,'student_absence')}}</Tag>				
			</template>
			<template v-for="(item,index) in model.slv_ids">
				<Tag class="select-item" closable @on-close="delSlId(item)">{{getStudentName(item,'student_leave')}}</Tag>				
			</template>
			<i class="ivu-icon" style="top:0" :class="['ivu-icon-ios-close', prefixCls + '-icon', prefixCls + '-icon-clear' , prefixCls + '-icon-normal']" @click="handleClear"></i>
		</div>
		 
		<div class="x-multiple-select-after" v-show="slotReady">
			<Dropdown class="x-drop-menu">
				<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
		        <DropdownMenu slot="list">
		            <DropdownItem @click.native="chooseLeave">请假学员</DropdownItem>
		            <DropdownItem @click.native="chooseAbsence">缺课学员</DropdownItem>
		        </DropdownMenu>
		    </Dropdown>
		</div>
		<div class="hide">
			<absence-modal ref="absence" :lid="lid" :sj-id="sjId" v-model="model.sa_ids" :slv-ids="model.slv_ids"></absence-modal>
			<leave-modal ref="leave" :lid="lid" :sj-id="sjId" v-model="model.slv_ids" :sa-ids="model.sa_ids"></leave-modal>
		</div>
	</div>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import AbsenceModal from './absence-modal.vue'
	import LeaveModal from './leave-modal.vue'
	
	const prefixCls = 'ivu-input'

	export default{
		mixins: [ common ],
		components: {
			LeaveModal,
			AbsenceModal
		},
		props: {
			value: {
				type: Object,
				default: ()=>{
					return {
						sa_ids: [],
						slv_ids: []
					}
				}
			},
			selected: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			lid: {
				type: [String,Number],
				default: 0
			},
			sjId: {
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
				slotReady: false
			}
		},
		watch: {
			tags: function (val) {
				this.$emit('input',this.model)
			},
			value: function (val) {
				this.model = val
//				this.initSelected(val)
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
			delSaid (id) {
				let index = this.model.sa_ids.indexOf(id)
				if(index > -1){
					this.model.sa_ids.splice(index,1)
				}
			},
			delSlId (id) {
				let index = this.model.slv_ids.indexOf(id)
				if(index > -1){
					this.model.slv_ids.splice(index,1)
				}
			},
			chooseLeave () {
				this.$refs['leave'].show('选择请假学员','add')
			},
			chooseAbsence () {
				this.$refs['absence'].show('选择缺课学员','add')
			},
			handleClear () {
				this.model.sa_ids = []
				this.model.slv_ids = []
			},		
			getStudentName (id,name) {
				let obj = this.getMapText(id,name)||{},
					map_idField = {
						'student_absence': 'sa_id',
						'student_leave': 'slv_id'
					},
					result = ''
				if(_.isEmpty(obj)&&this.selected.length>0){
					obj = this.selected.find(s=>s[map_idField[name]]==id)
					if(!_.isEmpty(obj)){
						result = obj.student.student_name
					}
				}else{
					result = obj.student_name
				}
				return result
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