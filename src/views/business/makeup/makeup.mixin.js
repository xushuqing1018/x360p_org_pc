import moment from 'moment'
import util from '@/libs/util'
import {_} from '@/libs/util'

const prefixCls = 'select-list';
const resName   = ''
const idField   = ''
const textField = ''

export default{
	data () {
		return {
			modalShow: false,
			selIds: [],
			is_data_init:false,			
			search_field: {
				int_day: []
			},
			currentLid: 0, 
            currentSjId: 0,
			search_value: '',
            checkAll: false,
			resName: '',
			idField: '',
			textField: ''
		}
	},
	props: {
		value: {
			type: [Array],
			default: ()=>{
				return []
			}
		},
		lid: {
			type: [Number,String],
			default: ()=>{
				return 0
			}
		},
        sjId: {
            type: [Number,String],
            default: ()=>{
                return 0
            }
        },
		slvIds: {
			type: [Array],
			default: ()=>{
				return []
			}
		},
		saIds: {
			type: [Array],
			default: ()=>{
				return []
			}
		},
		sids: {
			type: Array,
			default: ()=>{
				return []
			}
		},
		multiple: {
			type: Boolean,
			default: true,
		},
	},
	watch: {
		modalShow (val) {
            if(val){
                this.init_data_cache()
            }else{
                if(this.params.search_value != ''){
                    this.params.search_value = ''
                    this.is_data_init = false
                }
            }
        },
        value(id){
        	if(id.length === 0 || id === '' || id === 0) {
        		this.selIds = []
        		this.refreshData(this.data)
        	}
            if(this.multiple){
                this.selIds = id
                this.refreshData(this.data)
            }
        },
        '$store.state.branch.id': {
            handler: function(bid, old_bid) {
            	this.pageIndex = 1
            	this.pageSize = 10
                this.init_data()
            }
        }
	},
	computed: {
		filter_subjects () {
        	let list = this.$store.state.gvars.subjects||[],
        		result = [],
        		lid = this.lid
        	if(list.length>0){
        		result = list
        		
        		if(lid>0){
        			let lesson = this.$store.state.gvars.lessons.find(item=>item.lid == lid)
        			
        			if(lesson){
        				if(lesson.sj_ids>0){
        					result = result.filter(r=>lesson.sj_ids.indexOf(r=>r.sj_id)>-1)
        				}else{
        					result = result.filter(r=>r.sj_id == lesson.sj_id)	        					
        				}
        			}
        		}
        	}
        	return result
        },
		classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-multiple`]: this.multiple,
                    [`${prefixCls}-single`]: !this.multiple
                }
            ];
        },
        selectedTotal(){
            return this.selIds.length 
        },
        selectedList(){
            let list = []
            this.selIds.forEach(id=>{
                if(id > 0){
                    list.push(this.$store.getters.getMapObject(id, this.resName))
                }
            })
            return list
        },
	},
	methods: {
		refresh () {
			this.init_data()
			return this
		},
		resetSearch () {
			this.search_value = ''
			this.$refs.form.resetFields()
			this.init_data()
		},
		addSelectedId(id) {
			if(this.selIds.indexOf(id) === -1) {
				this.selIds.push(id)
				this.refreshData(this.data)
			}
			
			if(this.selIds.length==1){
                let obj = this.data.filter(d=>this.selIds.indexOf(d[this.idField])>-1)[0]
				this.currentLid = obj.lid
                this.currentSjId = obj.sj_id
			}
		},
		removeSelectedId(id) {
			let index = this.selIds.indexOf(id)
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
            if(this.selIds.length==0){
            	this.currentLid = 0
                this.currentSjId = 0
            }
		},
		toggleSelected(item) {
			if(this.multiple){
                if(!item.$selected){
                	if(this.addCheck(item)){
                		this.addSelectedId(item[this.idField])	                		
                	}
                }else{
                    this.removeSelectedId(item[this.idField])
                }
            }
		},
        init_data_cache(){
            if(!this.is_data_init){
                this.init_data()
                this.is_data_init = true
            }
        },
        handleCheckAll() {
        	this.data.forEach((item)=>{
        		let index = this.selIds.indexOf(item[this.idField])
        		if(this.checkAll === false) {
        			if(index == -1) {
        				if(this.addCheck(item)){
		        			this.selIds.push(item[this.idField])
		        			item.$selected = true
        				}
	        		}
        		} else {
        			if(index > -1) {
        				this.selIds.splice(index,1)
        				item.$selected = false
        			}
        		}
        	})
        },
		ok(){
			let [model,result] = [[],[]]
            if(!this.selectedTotal){
                this.$Message.error('没有选中任何学员')
                return
            }
            if(this.multiple){	            	
            	this.selectedList.forEach(s=>{
            		model.push(s[this.idField])
            		result.push(s)
            	})
//	            this.$emit('on-select',this.selectedList)
            }else{
                let row = this.$store.getters.getMapObject(this.selIds[0],this.resName)
                model = row[this.idField]	                
            }
            
            this.cancel()
            this.$emit('input',model)
            this.$emit('on-select',model)
            this.$emit('on-selected',result)
        },
        cancel(){
            this.close()
            if(this.multiple) {
	            this.selIds = []
            	this.value.forEach((item) => {
            		this.selIds.push(item)
            	})
            	this.refreshData(this.data)
            }else{
            	this.selIds = []
            	this.selIds.push(this.value)
            	this.refreshData(this.data)
            }	            
        },
        clearSelectedId(){
            this.selIds.splice(0,this.selIds.length)
            this.refreshData(this.data)
        },
        cancelSelectedId(item){
            let index = this.selIds.indexOf(item[this.idField])
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        deal_data(data){
            if(data.list.length > 0){	            	
                this.$store.commit('buildIdTextMap',{
                   list:data.list,
                   name:this.resName,
                   ifield:this.idField,
                   tfield:this.textField
                })
                //this.refreshData()
                this.refreshData(data.list)
            }else{
            	if(this.multiple && this.checkAll) {
            		this.checkAll = false
            	}
            }
            return data.list.filter(item=>item.student!=null)
        },
		checkSelectAll(item, index, arr) {
        	if(this.selIds.indexOf(item[this.idField]) !== -1) {
        		return true
        	} else {
        		return false
        	}
        },
		refreshData(data) {
			data.forEach((item) => {
				if(this.selIds.indexOf(item[this.idField]) !== -1) {
					item.$selected = true
				} else {
					item.$selected = false
				}
			})
			if(this.multiple) {
				this.checkAll = data.every(this.checkSelectAll)
			}
		},
		getMapText(id,name) {
			let result = this.$store.getters.getMapText(id,name)
			return this.$store.getters.getMapText(id,name)
		},
		addCheck (row) {
				let lid$ = this.lid || this.currentLid,
                    sj_id$ = this.sjId || this.currentSjId,
				 	selIds = this.selIds,
					index = selIds.indexOf(row[this.idField]),
					list1 = this.$store.state.maps[this.resName],
					other_ids = this.saIds,
					result = true,
					list2 = [],
					sids = this.sids
				if(this.lid == 0 && this.currentLid == 0){
					lid$ = row.lid
				}
				if(this.resName=='student_absence'){
					list2 = this.$store.state.maps.student_leave
					other_ids = this.slvIds
				}
				
				//检测 排除选择学员是否在原排课学员sids中				
				if(sids.length>0&&sids.indexOf(row.student.sid)>-1){
					this.$Message.error(util.sprintf('【%s】学员已存在，请选择其他学员',row.student.student_name))
					return false
				}
				
                if(!this.allow_different_lesson_makeup&&lid$ !== row.lid){
                    this.$Message.error('只能选择同一课程学员补课')
                    return false
                }

				if(other_ids.length>0&&!_.isEmpty(list2)){
					other_ids.forEach(s=>{
						if(list2[s].sid == row.student.sid){
							result = false
						}
					})					
				}
				if(selIds.length>0&&!_.isEmpty(list1)){					
					selIds.forEach(s=>{
						if(list1[s].sid == row.student.sid){
							result = false
						}
					})		
				}				
				
				if(result == false){
					this.$Message.error(util.sprintf('已选择【%s】学员！',row.student.student_name))
				}					
				
				return result
			},
	}
}
