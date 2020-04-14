/*
* @Author: Administrator
* @Date:   2017-11-04 17:45:42
* @Last Modified by:   Administrator
* @Last Modified time: 2017-11-16 18:54:06
*/
import {_} from './util'
import util from './util'
const resName   = ''
const idField   = ''
const textField = ''
export default{
	data() {
		return {
            data:[],
            pageIndex:1,
            pageSize:10,
            is_data_init:false,
            modalShow: false,
            selIds:[],
            checkAll: false,

            //下面4个字段需要在组件内定义
            params:{
                search_field:'',
                search_value:'',
                order_field:'',
                order_sort:'',
                last_search_value:''
            },
            textField:'',
            idField:'',
            gvarName:'',
            total:0
		}
	},
	computed:{
       
        selectedTotal(){
            if(this.selIds[0] != 0){
                return this.selIds.length 
            }
            return 0  
        },
        selectedList(){
            let list = []
            this.selIds.forEach(id=>{
                if(id > 0){
                    list.push(this.getObjById(id))
                }
            })
            return list
        },
        labelText(){
            if(this.selIds.length > 0 && this.selIds[0] != 0){
                return this.$filter(this.textField)(this.selIds[0])
            }
            return ''
        }
    },
    methods: {  
        pagesize(pagesize){
            this.pageSize = pagesize
            this.init_data()
        },
        pagenation(page){
            this.pageIndex = page    
            this.init_data() 
        },
        search(){
            this.pagenation(1)
        },
        resetSearch(){
            this.params.search_value = ''
            this.init_data()
        },
        data_filter(list){
            return list
        },
        init_data(){
            let list = [],
                lists = [],
                start,end,index
            if(!/^\s*$/.test(this.params.search_value)){
                lists = this.$store.state.gvars[this.gvarName].filter(item=>{
                    if(item[this.params.search_field].indexOf(this.params.search_value) !== -1){
                        return true
                    }
                    return false
                })
            }else{
                lists = this.$store.state.gvars[this.gvarName]
            }

            if(!_.isEmpty(this.condition)){
                if(this.condition.bid){
                    lists = lists.filter(item=>{
                        return item.bids.length == 0 || item.bids.indexOf(this.condition.bid) !== -1
                    })
                }
            }

            lists = this.data_filter(lists)

            this.total = lists.length

            start = (this.pageIndex - 1) * this.pageSize
            end   = start + this.pageSize
            index = 0
            lists.forEach(b=>{
                if(index >= start && index < end){
                    list.push(util.copy(b))
                }
                index++
            })
            this.data = list
            this.refreshData(list)
        },
        getObjById(id){
            let obj = this.$store.state.gvars[this.gvarName].find(item=>item[this.idField] == id)
            if(obj){
                return util.copy(obj)
            }
            return null
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
                   name:resName,
                   ifield:idField,
                   tfield:textField
                })
                //this.refreshData()
                this.refreshData(data.list)
            }else{
                if(this.multiple && this.checkAll) {
                    this.checkAll = false
                }
            }
            return data.list
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
        addSelectedId(id){
            if(this.selIds.indexOf(id) === -1){
                this.selIds.push(id)
                this.refreshData(this.data)
            }
        },
        removeSelectedId(id){
            let index = this.selIds.indexOf(id)
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        replaceSelectedId(id){
           if(this.selIds.length == 0){
                this.selIds.push(id)
            }else{
                this.selIds.splice(0,1,id)
            }
        },
        toggleSelected(item){
            if(this.multiple){
                if(!item.$selected){
                    this.addSelectedId(item[this.idField])
                }else{
                    this.removeSelectedId(item[this.idField])
                }
            }else{
                if(item.$selected){
                    this.ok()
                }else{
                    this.data.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.replaceSelectedId(item[this.idField])
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
                        this.selIds.push(item[this.idField])
                        item.$selected = true
                    }
                } else {
                    if(index > -1) {
                        this.selIds.splice(index,1)
                        item.$selected = false
                    }
                }
            })
        },
        refreshSelId(id){
            if(id === null || id.length === 0 || id === '' || id === 0) {
                this.selIds = []
                this.refreshData(this.data)
            }
            if(this.multiple){
                id.forEach(_id=>{
                    if(this.selIds.indexOf(_id) == -1){
                        this.selIds.push(_id)
                    }
                })
            }else{
                if(this.selIds.length == 0){
                    this.selIds.push(id)
                }else{
                    this.selIds.splice(0,1,id)
                }
            }
        },
        cancel(){
            this.modalShow = false
            if(this.multiple) {
                this.selIds = []
                this.selected.forEach((item) => {
                    this.selIds.push(item)
                })
                this.refreshData(this.data)
            }else{
                this.selIds = []
                this.selIds.push(this.selected)
                this.refreshData(this.data)
            }
            this.$emit('input',false);
        },
        closeModal() {
            this.cancel()
        }
    },
    watch: {
        'modal$.show': function (val){
            if(val){
                this.init_data_cache()
                this.refreshSelId(this.selected)
            }else{
                if(this.params.search_value != ''){
                    this.params.search_value = ''
                    this.is_data_init = false
                }
            }
        },
        selected(id){
            if(id === null || id.length === 0 || id === '' || id === 0) {
                this.selIds = []
                this.refreshData(this.data)
            }
            if(this.multiple){
                id.forEach(_id=>{
                    if(this.selIds.indexOf(_id) == -1){
                        this.selIds.push(_id)
                    }
                })
            }else{
                if(this.selIds.length == 0){
                    this.selIds.push(id)
                }else{
                    this.selIds.splice(0,1,id)
                }
            }
        },
        '$store.state.branch.id': {
            handler: function(bid, old_bid) {
                this.pageIndex = 1
                this.pageSize = 10
                this.init_data()
            }
        }
    }
}