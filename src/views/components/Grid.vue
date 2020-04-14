<style lang="less">
</style>
<template>
	<div class="c-grid">
        <div class="box box-query" v-if="queryBox">
            <Row class="basic">
            	<slot name="basicQuery"></slot>
            </Row>
            <Row class="advance" v-if="advanceQuery && searchExpand">
            	<slot name="advanceQuery"></slot>
            </Row>
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <slot name="toolbar"></slot>
                <div class="filter-column">
                    <Dropdown placement="bottom-end">
                        <Button type="primary">
                            选择列
                            <Icon type="funnel"></Icon>
                        </Button>
                        <Dropdown-menu slot="list">
                            <Dropdown-item v-for="item in columnKeys">
                                <Checkbox v-model="item.show">{{item.title}}</Checkbox>
                            </Dropdown-item>
                            
                        </Dropdown-menu>
                    </Dropdown>
                </div>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table :border="true" :stripe="true" :show-header="true" :data="data" :columns="columns" :no-data-text="noDataText" :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" @on-sort-change="sortChange"> 
                    </Table>
                </div>
                <div class="content-footer">
                    <div class="pagenation">
                        <Page :total="total" :current="pageIndex" :show-sizer="true" :page-size="pageSize" :show-total="true" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                </div>    
            </div>
        </div>
	</div>
</template>

<script>
import $rest from '../../libs/rest'
import {_} from '../../libs/util'
import util from '../../libs/util'
import globals from '../../libs/globals.mixin'


function op_render(h,params){
    let op_items = []
    for(let key in this.columnOperation){
        let op = this.columnOperation[key]
        if(_.isFunction(this.operationFunc[key])){
            op_items.push(
                h('Dropdown-item',{
                    nativeOn:{
                        click:this.operationFunc[key].bind(this,params)
                    }
                },op.title),
            )
        }
    }
    return h('div',[
    h('Dropdown',{
      props:{
        placement:'bottom-start',
        trigger:'click'
      }  
        },[
            h('Button',{
                props:{
                    type:'primary',
                    size:'small'
                }
            },[
                '操作',
                h('Icon',{
                  props:{
                    type:'arrow-down-b'
                  }  
                })
            ]),
            h('Dropdown-menu',{
                slot:'list'
            },op_items)
        ])
    ])
}

export default {
		name:'Grid',
		mixins:[globals],
		props:{
			res:{
				type:String,
				default:''
			},
			name:{
				type:String,
				default:''
			},
			emptyText:{
				type:String,
				default:''
			},
			columnKeys:{
				type:Object
			},
			pk:String,
			autoLoad:{
				type:Boolean,
				default:true
			},
            columnRender:Object,
            columnOperation:Object,
            operationFunc:Object,
            searchParam:Function,
            columnOperationText:{
            	type:String,
            	default:'操作'
            }
		},
        data () {
        	return {
        		queryBox:false,
        		advanceQueryBox:false,
        		show_query:false,
        		show_toolbar:false,
	        	loading:false,
	            saving:false,
	            searchExpand:false,
	            params:{
	                search_field:'name',
	                search_value:'',
	                order_field:'',
	                order_sort:'',
	                last_search_value:''
	            },
	            data: [
	            ],
	            total:0,
	            pageIndex:1,
	            pageSize:20,
	            showCheckbox:false,
	            showIndex:true
	        }
        },
        methods:{
           sortChange(e){
	            this.params.order_field = e.key
	            this.params.order_sort = e.order
	            this.init_data()
	        },
			pagenation(page){
	            this.pageIndex = page
	            this.init_data()
	        },
	        pagesize(pagesize){
	            this.pageSize = pagesize
	            this.init_data()
	        },
	        toggleSearch(){
	            this.searchExpand = !this.searchExpand
	        },
	        search(){
	            if(/^\s*$/.test(this.params.search_value) && this.params.last_search_value == ''){
	                this.focus('searchkey')
	                return
	            }
	            this.init_data()
	        },
	        resetSearch(){
	            this.params.search_value = ''
	            this.init_data()
	        },
	        init_data(){
	        	if(this.res == ''){
	        		this.$Message.error('未定义res!');
	        	}
	            let get_param = {}
	            get_param.page = this.pageIndex
	            get_param.pagesize = this.pageSize
	            if(this.params.search_value != ''){
	                get_param.search_field = this.params.search_field
	                get_param.search_value = this.params.search_value
	                this.params.last_search_value = this.params.search_value
	            }else{
	                this.params.last_search_value = ''
	            }
	            if(this.params.order_field != ''){
	                get_param.order_field = this.params.order_field
	                get_param.order_sort  = this.params.order_sort
	            }
	            this.searchParam(get_param)
	            for(let o in get_param){
	                if(get_param[o] === null){
	                    delete get_param[o]
	                }
	            }
	            this.loading = true
	            this.$http.get(this.res,{params:get_param}).then(response=>{
	                this.data  = this.deal_data(response.body.data)                
	                this.total = response.body.data.total
	                this.pageSize = parseInt(response.body.data.pagesize)
	                this.loading = false
	            },response=>{
	                this.loading = false
	                this.$Message.error(response.body.msg)
	            })
	        },
	        deal_data(data){	
	        	return data.list
	        },
	        check(){
	            return new Promise((resolve,reject)=>{
	                this.$refs['form_'+this.datakey].validate(valid => {
	                    if(valid) {
	                        resolve()
	                    } else {
	                        reject()
	                    }
	                })  
	            })  
	        },
	        fixLeft () {
				return this.data.lgtenh > 0 ? 'left':false;
			},
			fixRight () {
				return this.data.length > 0 ? 'right':false;
			}
        },
        computed:{
        	noDataText(){
        		if(this.emptyText != ''){
        			return this.emptyText
        		}
        		return this.$store.state.config.EMPTY_DATA_TEXT
        	},
        	toggleSearchIcon(){
	            if(this.searchExpand){
	                return 'chevron-up'
	            }
	            return 'chevron-down'
	        },
	    	columns_head () {
				let columns = []
				if (this.showCheckbox) {
	                columns.push({
	                    type: 'selection',
	                    width: 60,
	                    align: 'center'
	                })
	            }
	            if (this.showIndex) {
	                columns.push({
	                    type: 'index',
	                    width: 60,
	                    align: 'center'
	                })
	            }
	            return columns
			},
	        columns () {
	            let columns = [] 
	            let operation = {}   
	            let renders = this.columnRender         
	            Object.assign(columns,this.columns_head)
	            for(let key in this.columnKeys){
	                let col = this.columnKeys[key]
	                if(typeof col['show'] == 'undefined'){
	                    col.show = true
	                }
	                if(col.show){
	                  let column = Object.assign({key:key},col)
	                  if(renders[key]){
	                    column.render = renders[key].bind(this)
	                  }
	                  columns.push(column)
	                }
	            }
	            if(!_.isEmpty(this.columnOperation)){
	                operation.key = 'operation'
	                operation.title = this.columnOperationText
	                operation.show = true
	                operation.width = 80
	                operation.render = op_render.bind(this)

	                columns.unshift(operation)
	            }      
	            return columns                
	        }
        },
        watch:{
	        '$store.state.user.info.bid':{
	            handler:function(bid,old_bid){
	                this.init_data()
	            },
	            // 深度观察
	            deep:true
	        }
	    },
	    mounted(){
	    	this.queryBox = this.$slots.basicQuery !== undefined;
            this.advanceQueryBox = this.$slots.advanceQuery !== undefined;
	    }
    }
</script>