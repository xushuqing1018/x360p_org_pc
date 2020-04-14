<template>
	<Dropdown class="x-drop-menu">
		<Button type="ghost" icon="plus">添加学员</Button>		        
        <DropdownMenu slot="list">
			<DropdownItem @click.native="chooseStudent('student')">正式学员</DropdownItem>
        	<DropdownItem @click.native="chooseStudent('customer')">意向客户</DropdownItem>
            <DropdownItem @click.native="chooseStudent('leave')">请假学员</DropdownItem>
            <DropdownItem @click.native="chooseStudent('absence')">缺课学员</DropdownItem>
        </DropdownMenu>
        
        <div class="hide">
			<select-student ref="student" v-model="model.sids" :disabled-ids="sids"></select-student>
        	<select-customer ref="customer" v-model="model.cu_ids" :disabled-ids="cu_ids"></select-customer>
        	<select-leave ref="leave" :lid="lid" v-model="model.slv_ids" :slv-ids="model.sa_ids" :sids="sids"></select-leave>
        	<select-absence ref="absence" :lid="lid" v-model="model.sa_ids" :slv-ids="model.slv_ids" :sids="sids"></select-absence>
        </div>
    </Dropdown>
</template>

<script>
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectLeave from '../../makeup/leave-modal.vue'
	import SelectAbsence from '../../makeup/absence-modal.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		components: {
			SelectLeave,
			SelectAbsence,
			SelectCustomer,
			SelectStudent
		},
		props: {
			value: {
				type: Object,
				default: ()=>{
					return {
						cu_ids: [],
						sa_ids: [],
						slv_ids: [],
						sids: []
					}
				}
			},
			lid: {
				type: [String,Number],
				default: 0
			},
			list: {
				type: Array,
				default: []
			}
		},
		watch: {
			'model.cu_ids': function (val) {	
				this.checkStudents()
			},
			'model.sa_ids': function (val) {
				this.checkStudents()
			},
			'model.slv_ids': function (val) {
				this.checkStudents()				
			},
			'model.sids': function (val) {
				this.checkStudents()				
			}
		},
		data () {
			return {
				model: this.value
			}
		},
		watch: {
			list: function (val) {				
//				this.model.cu_ids = this.cu_ids  
			}
		},
		computed: {
			cu_ids () {
				let list = this.list.filter(l=>l.is_trial==1),
					cu_ids = []
				if(list.length>0){
					list.forEach(l=>{
						cu_ids.push(l.cu_id)
					})
				}
				
				return cu_ids
			},
			sids () {
				let list = this.list.filter(l=>l.is_makeup==0&&l.is_trial==0),
					sids = []
				if(list.length>0){
					list.forEach(l=>{
						sids.push(l.sid)
					})
				}
				
				return sids
			},
		},
		methods: {			
			checkStudents () {
				this.$emit('input',this.model)
				this.$emit('on-selected')
			},
			chooseStudent (ref) {
				let map_title = {'student':'选择正式学员','customer':'选择客户','leave':'选择请假学员','absence':'选择缺课学员'},
					title = map_title[ref]
				if(ref=='customer' || ref=='student'){
					this.$refs[ref].openModal()
				}else{
					this.$refs[ref].show(title,'add')					
				}
			}
		}
	}
</script>

<style>
</style>